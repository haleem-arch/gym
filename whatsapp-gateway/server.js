import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import express from 'express';
import cors from 'cors';
import qrcode from 'qrcode';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;

// Global WhatsApp state
let sock = null;
let connectionStatus = 'disconnected'; // 'disconnected', 'connecting', 'qrcode', 'connected'
let qrCodeBase64 = null;
let qrCodeRaw = null;
let connectedUser = null;

// Middleware
app.use(cors());
app.use(express.json());

// Token Verification
const verifyToken = (req, res, next) => {
  const token = process.env.WHATSAPP_GATEWAY_TOKEN;
  if (!token) {
    return next(); // Skip if no token configured
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const reqToken = authHeader.substring(7).trim();
  if (reqToken !== token.trim()) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  next();
};

// Start Baileys connection
async function connectToWhatsApp() {
  console.log('Initializing WhatsApp Gateway connection...');
  try {
    const sessionDir = path.join(__dirname, 'session_auth_info');
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    let version = [2, 3000, 1017585002]; // fallback version
    try {
      const { version: latestVersion, isLatest } = await fetchLatestBaileysVersion();
      console.log(`Using WA Web version v${latestVersion.join('.')}, isLatest: ${isLatest}`);
      version = latestVersion;
    } catch (err) {
      console.warn('Failed to fetch latest WA Web version, using fallback:', err);
    }

    const makeWASocketFunc = makeWASocket.default || makeWASocket;
    sock = makeWASocketFunc({
      version,
      auth: state,
      printQRInTerminal: false, // deprecation warning avoided by disabling this
      logger: pino({ level: 'silent' }),
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        connectionStatus = 'qrcode';
        qrCodeRaw = qr;
        try {
          qrCodeBase64 = await qrcode.toDataURL(qr);
          console.log('New QR Code generated. Scan to connect.');
        } catch (err) {
          console.error('Failed to generate QR data URL:', err);
        }
      }

      if (connection === 'connecting') {
        connectionStatus = 'connecting';
      }

      if (connection === 'open') {
        connectionStatus = 'connected';
        qrCodeBase64 = null;
        qrCodeRaw = null;
        connectedUser = sock.user;
        console.log('WhatsApp connection successfully opened! Connected as:', sock.user.id);
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut && statusCode !== DisconnectReason.forbidden;
        console.log(`Connection closed (code: ${statusCode}). Reconnecting: ${shouldReconnect}`);

        if (shouldReconnect) {
          connectionStatus = 'connecting';
          connectToWhatsApp();
        } else {
          connectionStatus = 'disconnected';
          connectedUser = null;
          qrCodeBase64 = null;
          qrCodeRaw = null;
          console.log('Logged out of WhatsApp. Clearing session...');
          try {
            fs.rmSync(sessionDir, { recursive: true, force: true });
          } catch (e) {
            console.error('Failed to clear session folder:', e);
          }
          connectToWhatsApp(); // Restart to show QR code again
        }
      }
    });

    // Incoming Message Webhook Forwarder
    sock.ev.on('messages.upsert', async (m) => {
      if (m.type === 'notify') {
        for (const msg of m.messages) {
          if (!msg.key.fromMe && msg.message) {
            const senderJid = msg.key.remoteJid;
            const textContent = msg.message.conversation || 
                               msg.message.extendedTextMessage?.text || 
                               msg.message.imageMessage?.caption || 
                               '';
            
            if (senderJid && textContent) {
              const phone = senderJid.split('@')[0];
              console.log(`Received WhatsApp message from [${phone}]: ${textContent}`);

              const webhookUrl = process.env.WEBHOOK_URL;
              const webhookToken = process.env.WEBHOOK_TOKEN;

              if (webhookUrl) {
                try {
                  const headers = { 'Content-Type': 'application/json' };
                  if (webhookToken) {
                    headers['Authorization'] = `Bearer ${webhookToken}`;
                  }

                  const response = await fetch(webhookUrl, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                      phone,
                      text: textContent
                    })
                  });
                  console.log(`Webhook forwarded message to main server. Status: ${response.status}`);
                } catch (err) {
                  console.error('Failed to forward incoming message to webhook:', err);
                }
              }
            }
          }
        }
      }
    });

  } catch (err) {
    console.error('Fatal connection error:', err);
    connectionStatus = 'disconnected';
    setTimeout(connectToWhatsApp, 5000);
  }
}

// REST API Endpoints

// 1. Get status and QR code
app.get('/status', (req, res) => {
  res.json({
    status: connectionStatus,
    qr: qrCodeBase64,
    user: connectedUser ? {
      id: connectedUser.id,
      name: connectedUser.name
    } : null
  });
});

// 2. Send text message
app.post('/send-text', verifyToken, async (req, res) => {
  const { to, text } = req.body;
  if (!to || !text) {
    return res.status(400).json({ error: 'Missing to or text parameter' });
  }

  if (connectionStatus !== 'connected' || !sock) {
    return res.status(503).json({ error: 'WhatsApp client is not connected' });
  }

  try {
    let cleanPhone = to.replace(/\D/g, '');
    if (!cleanPhone.endsWith('@s.whatsapp.net')) {
      cleanPhone = `${cleanPhone}@s.whatsapp.net`;
    }

    console.log(`Sending message to [${cleanPhone}]: ${text.substring(0, 50)}...`);
    await sock.sendMessage(cleanPhone, { text: text.trim() });
    res.json({ success: true });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: err.message || 'Failed to send message' });
  }
});

// 3. Logout / Reset connection
app.post('/logout', verifyToken, async (req, res) => {
  console.log('Logging out client...');
  try {
    if (sock) {
      await sock.logout();
    }
  } catch (err) {
    console.error('Error during logout:', err);
  }

  connectionStatus = 'disconnected';
  qrCodeBase64 = null;
  qrCodeRaw = null;
  connectedUser = null;

  try {
    const sessionDir = path.join(__dirname, 'session_auth_info');
    fs.rmSync(sessionDir, { recursive: true, force: true });
  } catch (err) {
    console.error('Failed to delete auth session folder:', err);
  }

  // Re-initiate connection to get a new QR code
  connectToWhatsApp();
  res.json({ success: true });
});

// Start Express and WhatsApp Socket client
app.listen(PORT, () => {
  console.log(`WhatsApp Gateway listening on port ${PORT}`);
  connectToWhatsApp();
});
