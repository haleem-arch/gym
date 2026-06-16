import express from 'express';
import cors from 'cors';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());


const GATEWAY_TOKEN = process.env.GATEWAY_TOKEN || '';

// Token authorization middleware
app.use((req, res, next) => {
  if (GATEWAY_TOKEN) {
    const authHeader = req.headers['authorization'] || req.headers['token'];
    let reqToken = '';
    if (authHeader) {
      reqToken = authHeader.replace(/^Bearer\s+/i, '').trim();
    } else if (req.query.token) {
      reqToken = String(req.query.token).trim();
    }
    if (reqToken !== GATEWAY_TOKEN.trim()) {
      return res.status(401).json({ error: 'Unauthorized: Invalid gateway token' });
    }
  }
  next();
});

const PORT = process.env.PORT || 7860;

let latestQr = '';
let connectionStatus = 'DISCONNECTED';
const mediaCache = new Map();

const isWindows = process.platform === 'win32';
const defaultWinPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const puppeteerOptions = {
  headless: true,
  args: [
    '--no-sandbox', 
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu'
  ]
};

if (process.env.PUPPETEER_EXECUTABLE_PATH) {
  puppeteerOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
} else if (isWindows) {
  puppeteerOptions.executablePath = defaultWinPath;
}

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: path.join(__dirname, '.wwebjs_auth')
  }),
  puppeteer: puppeteerOptions
});

client.on('qr', (qr) => {
  console.log('QR RECEIVED:', qr);
  qrcode.toDataURL(qr, (err, url) => {
    if (!err) {
      latestQr = url;
    }
  });
  connectionStatus = 'DISCONNECTED';
});

client.on('ready', () => {
  console.log('Client is ready!');
  connectionStatus = 'CONNECTED';
  latestQr = '';
});

client.on('authenticated', () => {
  console.log('Client authenticated!');
});

client.on('auth_failure', (msg) => {
  console.error('AUTHENTICATION FAILURE:', msg);
  connectionStatus = 'DISCONNECTED';
  latestQr = '';
});

client.on('disconnected', (reason) => {
  console.log('Client was logged out:', reason);
  connectionStatus = 'DISCONNECTED';
  latestQr = '';
});

client.on('message', async (msg) => {
  if (!msg.fromMe) {
    const sender = msg.from;
    const text = msg.body;
    console.log(`Received message from ${sender}: ${text}`);
    try {
      const webhookUrl = 'https://gym-kappa-three.vercel.app/api/user-management?action=whatsapp-incoming';
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: sender.split('@')[0],
          text: text
        })
      });
    } catch (err) {
      console.error('Webhook error:', err.message);
    }
  }
});

app.get('/status', (req, res) => {
  res.json({
    status: connectionStatus,
    qr: latestQr
  });
});

app.get('/chats', async (req, res) => {
  if (connectionStatus !== 'CONNECTED') {
    return res.status(400).json({ error: 'WhatsApp is not connected' });
  }
  try {
    const chats = await client.getChats();
    const chatData = chats.slice(0, 40).map(c => ({
      id: c.id._serialized,
      name: c.name || c.id.user,
      unreadCount: c.unreadCount,
      timestamp: c.timestamp,
      lastMessage: c.lastMessage ? {
        body: c.lastMessage.body,
        fromMe: c.lastMessage.fromMe,
        timestamp: c.lastMessage.timestamp
      } : null
    }));
    res.json(chatData);
  } catch (err) {
    console.error('Error getting chats:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/chats/:jid/messages', async (req, res) => {
  if (connectionStatus !== 'CONNECTED') {
    return res.status(400).json({ error: 'WhatsApp is not connected' });
  }
  try {
    const chat = await client.getChatById(req.params.jid);
    const messages = await chat.fetchMessages({ limit: 40 });
    
    const msgData = [];
    for (const m of messages) {
      const isMedia = m.hasMedia && (m.type === 'image' || m.type === 'sticker' || m.type === 'video');

      let quotedBody = null;
      let quotedSender = null;
      if (m.hasQuotedMsg && m._data && m._data.quotedMsg) {
        quotedBody = m._data.quotedMsg.body || '';
        const qSender = m._data.quotedMsg.author || m._data.quotedMsg.from;
        quotedSender = qSender ? qSender.split('@')[0] : null;
      }

      msgData.push({
        id: m.id._serialized,
        body: m.body,
        fromMe: m.fromMe,
        timestamp: m.timestamp,
        author: m.author,
        hasMedia: isMedia,
        mediaType: m.type,
        hasQuotedMsg: m.hasQuotedMsg,
        quotedBody: quotedBody,
        quotedSender: quotedSender
      });
    }
    
    res.json(msgData);
  } catch (err) {
    console.error('Error getting messages:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/messages/:id/media', async (req, res) => {
  if (connectionStatus !== 'CONNECTED') {
    return res.status(400).json({ error: 'WhatsApp is not connected' });
  }
  const messageId = req.params.id;
  try {
    if (mediaCache.has(messageId)) {
      const cached = mediaCache.get(messageId);
      res.setHeader('Content-Type', cached.mimetype);
      return res.send(cached.data);
    }

    const parts = messageId.split('_');
    const jid = parts[1];
    if (!jid) throw new Error('Invalid messageId format');

    const chat = await client.getChatById(jid);
    const messages = await chat.fetchMessages({ limit: 80 });
    const msg = messages.find(m => m.id._serialized === messageId);
    if (!msg || !msg.hasMedia) {
      return res.status(404).json({ error: 'Media not found' });
    }

    const media = await msg.downloadMedia();
    if (media) {
      const buffer = Buffer.from(media.data, 'base64');
      mediaCache.set(messageId, { data: buffer, mimetype: media.mimetype });
      res.setHeader('Content-Type', media.mimetype);
      return res.send(buffer);
    }
    res.status(404).json({ error: 'Failed to download media' });
  } catch (err) {
    console.error('Error getting message media:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/contact/:jid', async (req, res) => {
  if (connectionStatus !== 'CONNECTED') {
    return res.status(400).json({ error: 'WhatsApp is not connected' });
  }
  try {
    const contact = await client.getContactById(req.params.jid);
    res.json({
      id: contact.id._serialized,
      number: contact.number || '',
      name: contact.name || '',
      pushname: contact.pushname || '',
      shortName: contact.shortName || '',
      formattedName: contact.formattedName || ''
    });
  } catch (err) {
    console.error('Error getting contact:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/logout', async (req, res) => {
  try {
    if (connectionStatus === 'CONNECTED') {
      await client.logout();
    }
    connectionStatus = 'DISCONNECTED';
    latestQr = '';
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    try {
      await client.destroy();
      startClient();
      connectionStatus = 'DISCONNECTED';
      latestQr = '';
      res.json({ success: true, message: 'Client destroyed and re-initialized' });
    } catch (destroyErr) {
      res.status(500).json({ error: err.message || destroyErr.message });
    }
  }
});

app.post('/send-text', async (req, res) => {
  const { to, text, replyToMessageId } = req.body;
  if (!to || !text) {
    return res.status(400).json({ error: 'Missing to or text' });
  }

  if (connectionStatus !== 'CONNECTED') {
    return res.status(400).json({ error: 'WhatsApp is not connected' });
  }

  try {
    let formattedJid = to;
    if (!to.includes('@')) {
      formattedJid = `${to.replace(/\D/g, '')}@c.us`;
    }

    let messageToReply = null;
    if (replyToMessageId) {
      try {
        const chat = await client.getChatById(formattedJid);
        const messages = await chat.fetchMessages({ limit: 50 });
        messageToReply = messages.find(m => m.id._serialized === replyToMessageId);
      } catch (e) {
        console.error('Failed to locate message to reply to:', e);
      }
    }

    if (messageToReply) {
      await messageToReply.reply(text);
    } else {
      const options = {};
      if (replyToMessageId) {
        options.quotedMessageId = replyToMessageId;
      }
      await client.sendMessage(formattedJid, text, options);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Send error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/delete-message', async (req, res) => {
  const { messageId } = req.body;
  if (!messageId) {
    return res.status(400).json({ error: 'Missing messageId' });
  }
  if (connectionStatus !== 'CONNECTED') {
    return res.status(400).json({ error: 'WhatsApp is not connected' });
  }
  try {
    const parts = messageId.split('_');
    const jid = parts[1];
    if (!jid) throw new Error('Invalid messageId format');

    const chat = await client.getChatById(jid);
    const messages = await chat.fetchMessages({ limit: 50 });
    const msg = messages.find(m => m.id._serialized === messageId);
    if (!msg) {
      throw new Error('Message not found in recent history');
    }
    await msg.delete(true); // Delete for everyone
    res.json({ success: true });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

async function startClient() {
  try {
    await client.initialize();
  } catch (err) {
    console.error('Initial launch failed, retrying in 3s...', err);
    try {
      await client.destroy();
    } catch (destroyErr) {
      console.error('Failed to destroy client on failed initialize:', destroyErr);
    }
    setTimeout(startClient, 3000);
  }
}

app.listen(PORT, () => {
  console.log(`WhatsApp Gateway Server running on port ${PORT}`);
  startClient();
});
