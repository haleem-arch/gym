import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft, RefreshCw, MessageSquare,
  Save, Play, Settings, Plus, Trash2, Eye, EyeOff,
  QrCode, AlertTriangle
} from 'lucide-react';

export default function WhatsAppManagerPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  
  // Gateway Connection States
  const [gatewayUrl, setGatewayUrl] = useState('');
  const [gatewayToken, setGatewayToken] = useState('');
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'CONNECTED' | 'DISCONNECTED' | 'INITIALIZING' | 'UNKNOWN'>('UNKNOWN');
  const [checkingStatus, setCheckingStatus] = useState(false);
  
  // WhatsApp QR Pairing States
  const [waQrLoading, setWaQrLoading] = useState(false);
  const [waQrImageUrl, setWaQrImageUrl] = useState('');
  const [waQrError, setWaQrError] = useState('');

  // Anti-Ban Safeguards States
  const [delayMin, setDelayMin] = useState(5);
  const [delayMax, setDelayMax] = useState(15);
  const [warmupPhone, setWarmupPhone] = useState('');
  const [warmupInterval, setWarmupInterval] = useState(10);

  // Auto-Reply States
  const [autoReplies, setAutoReplies] = useState<any[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [newMatchType, setNewMatchType] = useState<'exact' | 'contains'>('exact');
  const [newResponse, setNewResponse] = useState('');

  // Greeting Message States
  const [whatsappGreetingEnabled, setWhatsappGreetingEnabled] = useState(false);
  const [whatsappGreetingMessage, setWhatsappGreetingMessage] = useState('');
  const [greetedNumbersCount, setGreetedNumbersCount] = useState(0);

  // Test Settings States
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('Hello! This is a test message from your custom WhatsApp Gateway. 🚀');

  // Broadcast States
  const [broadcastTemplate, setBroadcastTemplate] = useState('');
  const [targetAudience, setTargetAudience] = useState<'everyone' | 'coaches' | 'clients' | 'custom'>('everyone');
  const [customList, setCustomList] = useState('');
  const [broadcastRunning, setBroadcastRunning] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState<any>(null);
  const [broadcastLogs, setBroadcastLogs] = useState<string[]>([]);
  const cancelBroadcastRef = useRef(false);

  // Load Owner Settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data: ownerProfile } = await supabase
        .from('profiles')
        .select('targets')
        .eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c')
        .maybeSingle();

      if (ownerProfile?.targets) {
        const t = ownerProfile.targets;
        setGatewayUrl(t.whatsapp_gateway_url || '');
        setGatewayToken(t.whatsapp_gateway_token || '');
        setWhatsappEnabled(!!t.whatsapp_enabled);
        setDelayMin(t.whatsapp_delay_min !== undefined ? Number(t.whatsapp_delay_min) : 5);
        setDelayMax(t.whatsapp_delay_max !== undefined ? Number(t.whatsapp_delay_max) : 15);
        setWarmupPhone(t.whatsapp_warmup_phone || '');
        setWarmupInterval(t.whatsapp_warmup_interval !== undefined ? Number(t.whatsapp_warmup_interval) : 10);
        setAutoReplies(t.whatsapp_autoreply_rules || []);
        setWhatsappGreetingEnabled(!!t.whatsapp_greeting_enabled);
        setWhatsappGreetingMessage(t.whatsapp_greeting_message || '');
        setGreetedNumbersCount(t.whatsapp_greeted_numbers?.length || 0);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      toast.error('Failed to load WhatsApp configuration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Check Gateway Connection Status & Fetch QR
  const checkGatewayStatus = async () => {
    if (!gatewayUrl.trim()) {
      setConnectionStatus('UNKNOWN');
      return;
    }
    try {
      setCheckingStatus(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        throw new Error('User session expired. Please log in again.');
      }

      const res = await fetch('/api/user-management?action=get-whatsapp-status', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setConnectionStatus(data.status || 'CONNECTED');
        if (data.status === 'CONNECTED') {
          setWaQrError('CONNECTED');
          setWaQrImageUrl('');
        } else if (data.qr) {
          setWaQrImageUrl(data.qr);
          setWaQrError('');
        } else {
          setWaQrError(data.error || 'Gateway is active but no QR code was returned.');
          setWaQrImageUrl('');
        }
      } else {
        setConnectionStatus('DISCONNECTED');
        setWaQrError('Gateway is currently offline or returned an error.');
        setWaQrImageUrl('');
      }
    } catch (e: any) {
      setConnectionStatus('DISCONNECTED');
      setWaQrError(e.message || 'Failed to fetch gateway status.');
      setWaQrImageUrl('');
    } finally {
      setCheckingStatus(false);
    }
  };

  const fetchWaQrCode = async () => {
    setWaQrLoading(true);
    setWaQrError('');
    setWaQrImageUrl('');
    await checkGatewayStatus();
    setWaQrLoading(false);
  };

  useEffect(() => {
    if (gatewayUrl) {
      fetchWaQrCode();
    }
  }, [gatewayUrl]);

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: ownerProfile } = await supabase
        .from('profiles')
        .select('targets')
        .eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c')
        .maybeSingle();

      const updatedTargets = {
        ...(ownerProfile?.targets || {}),
        whatsapp_gateway_url: gatewayUrl.trim(),
        whatsapp_gateway_token: gatewayToken.trim(),
        whatsapp_enabled: whatsappEnabled,
        whatsapp_delay_min: delayMin,
        whatsapp_delay_max: delayMax,
        whatsapp_warmup_phone: warmupPhone.trim(),
        whatsapp_warmup_interval: warmupInterval,
        whatsapp_autoreply_rules: autoReplies,
        whatsapp_greeting_enabled: whatsappGreetingEnabled,
        whatsapp_greeting_message: whatsappGreetingMessage.trim()
      };

      const { error } = await supabase
        .from('profiles')
        .update({ targets: updatedTargets })
        .eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c');

      if (error) throw error;
      toast.success('Gateway settings saved successfully! 🚀');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to save settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetWelcomedHistory = async () => {
    if (!window.confirm('Are you sure you want to clear welcomed numbers history? Senders will receive the greeting message again on their next text.')) {
      return;
    }
    try {
      const { data: ownerProfile } = await supabase
        .from('profiles')
        .select('targets')
        .eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c')
        .maybeSingle();

      const updatedTargets = {
        ...(ownerProfile?.targets || {}),
        whatsapp_greeted_numbers: []
      };

      const { error } = await supabase
        .from('profiles')
        .update({ targets: updatedTargets })
        .eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c');

      if (error) throw error;
      setGreetedNumbersCount(0);
      toast.success('Welcomed senders history cleared! 🧹');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to reset history: ' + err.message);
    }
  };

  // Add Auto-Reply Rule
  const handleAddRule = () => {
    if (!newKeyword.trim() || !newResponse.trim()) {
      toast.error('Please enter both a keyword and response.');
      return;
    }
    const updated = [
      ...autoReplies,
      {
        id: Date.now().toString(),
        keyword: newKeyword.trim().toLowerCase(),
        matchType: newMatchType,
        response: newResponse.trim()
      }
    ];
    setAutoReplies(updated);
    setNewKeyword('');
    setNewResponse('');
    toast.success('Auto-reply rule added! Save settings to apply.');
  };

  // Remove Auto-Reply Rule
  const handleRemoveRule = (id: string) => {
    const updated = autoReplies.filter(r => r.id !== id);
    setAutoReplies(updated);
    toast.success('Rule removed. Save settings to apply.');
  };

  // Dispatch Test Message
  const handleSendTest = async () => {
    if (!gatewayUrl.trim()) {
      toast.error('Please configure a gateway URL.');
      return;
    }
    if (!testPhone.trim()) {
      toast.error('Please enter a test phone number.');
      return;
    }
    setTesting(true);
    const toastId = toast.loading('Sending test message...');
    try {
      const url = `${gatewayUrl.trim().replace(/\/$/, '')}/send-text`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(gatewayToken.trim() ? { 'Authorization': `Bearer ${gatewayToken.trim()}` } : {})
        },
        body: JSON.stringify({
          to: testPhone.trim(),
          text: testMessage.trim()
        })
      });

      if (!res.ok) {
        throw new Error(await res.text() || 'Failed to send message.');
      }
      toast.success('Test message sent successfully! Check WhatsApp.', { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error('Failed: ' + err.message, { id: toastId });
    } finally {
      setTesting(false);
    }
  };

  // Send Manual Broadcast
  const runBroadcast = async () => {
    if (!broadcastTemplate.trim()) {
      toast.error('Please fill out the message template.');
      return;
    }
    if (!gatewayUrl.trim()) {
      toast.error('Please configure your gateway URL first.');
      return;
    }

    setBroadcastLogs([]);
    setBroadcastRunning(true);
    cancelBroadcastRef.current = false;
    setBroadcastProgress({
      current: 'Starting...',
      index: 0,
      total: 0,
      successCount: 0,
      failCount: 0
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        throw new Error('User session expired. Please log in again.');
      }

      let recipients: any[] = [];
      if (targetAudience === 'everyone') {
        const { data } = await supabase.from('profiles').select('display_name, email, role, targets');
        recipients = data || [];
      } else if (targetAudience === 'coaches') {
        const { data } = await supabase.from('profiles').select('display_name, email, role, targets').eq('role', 'coach');
        recipients = data || [];
      } else if (targetAudience === 'clients') {
        const { data } = await supabase.from('profiles').select('display_name, email, role, targets').eq('role', 'client');
        recipients = data || [];
      } else if (targetAudience === 'custom') {
        const rawItems = customList.split(',').map(item => item.trim()).filter(Boolean);
        const resolvedList: any[] = [];
        for (const item of rawItems) {
          if (cancelBroadcastRef.current) break;
          if (item.includes('@')) {
            const { data } = await supabase.from('profiles').select('display_name, email, role, targets').eq('email', item).maybeSingle();
            if (data) resolvedList.push(data);
          } else {
            resolvedList.push({
              display_name: 'Recipient',
              targets: { phone_number: item }
            });
          }
        }
        recipients = resolvedList;
      }

      const validRecipients = recipients.filter(r => r.targets?.phone_number);
      if (validRecipients.length === 0) {
        throw new Error('No valid recipients with phone numbers found.');
      }

      setBroadcastLogs([`[INFO] Starting broadcast queue to ${validRecipients.length} recipients...`]);
      setBroadcastProgress((prev: any) => ({ ...prev, total: validRecipients.length }));

      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < validRecipients.length; i++) {
        if (cancelBroadcastRef.current) {
          setBroadcastLogs(prev => [...prev, `[CANCELLED] Broadcast stopped.`]);
          break;
        }

        const recipient = validRecipients[i];
        const rawPhone = recipient.targets.phone_number;
        const displayName = recipient.display_name || 'Recipient';

        const formattedMsg = broadcastTemplate
          .replace(/{{display_name}}/g, displayName)
          .replace(/{{phone}}/g, rawPhone);

        setBroadcastProgress((prev: any) => ({
          ...prev,
          current: `${displayName} (${rawPhone})`,
          index: i + 1
        }));

        try {
          const res = await fetch('/api/user-management?action=send-whatsapp', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              to: rawPhone.trim(),
              text: formattedMsg.trim()
            })
          });

          if (!res.ok) {
            const errBody = await res.json().catch(() => ({}));
            throw new Error(errBody.error || `HTTP ${res.status}`);
          }

          successCount++;
          setBroadcastLogs(prev => [...prev, `[SUCCESS] Sent to ${displayName} (${rawPhone})`]);
        } catch (err: any) {
          failCount++;
          setBroadcastLogs(prev => [...prev, `[FAILED] Sent to ${displayName} (${rawPhone}) - Error: ${err.message}`]);
        }

        setBroadcastProgress((prev: any) => ({ ...prev, successCount, failCount }));

        // Apply delay interval throttle
        if (i < validRecipients.length - 1) {
          const randomDelay = Math.floor(Math.random() * (delayMax - delayMin + 1) + delayMin);
          setBroadcastLogs(prev => [...prev, `[THROTTLE] Waiting for ${randomDelay} seconds...`]);
          await new Promise(resolve => setTimeout(resolve, randomDelay * 1000));
        }
      }

      setBroadcastLogs(prev => [...prev, `[COMPLETE] Success: ${successCount}, Failed: ${failCount}`]);
      setBroadcastRunning(false);
    } catch (e: any) {
      setBroadcastLogs(prev => [...prev, `[ERROR] Broadcast aborted: ${e.message}`]);
      setBroadcastRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-5 min-h-[80vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        <p className="text-xs text-gray-400 mt-3 font-semibold">Loading WhatsApp Console...</p>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-5 relative z-10 w-full pb-28">
      {/* Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-800/80">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/coach/system-console')} className="p-2 hover:bg-gray-800 rounded-xl transition-colors cursor-pointer text-gray-400 hover:text-white">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-1.5">
              💬 WhatsApp Manager
            </h1>
            <p className="text-[10px] text-gray-500 font-mono">Self-Hosted API Gateway Integration</p>
          </div>
        </div>
        <button
          onClick={fetchSettings}
          className="p-2 bg-gray-900 border border-gray-800 rounded-xl text-gray-400 hover:text-white"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Gateway Connection Status */}
      <div className="bg-[#0f1424] border border-gray-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3.5 h-3.5 rounded-full ${
            connectionStatus === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' :
            connectionStatus === 'INITIALIZING' ? 'bg-amber-500 animate-pulse' :
            'bg-red-500'
          }`} />
          <div>
            <p className="text-[9px] font-black uppercase text-gray-500">Connection Status</p>
            <p className="text-xs font-bold text-white mt-0.5">
              {connectionStatus === 'CONNECTED' ? 'Connected & Ready' :
               connectionStatus === 'INITIALIZING' ? 'Initializing Session...' :
               'Disconnected / Offline'}
            </p>
          </div>
        </div>
        <button
          onClick={checkGatewayStatus}
          disabled={checkingStatus}
          className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-[10px] font-bold text-gray-300 rounded-xl border border-gray-800 flex items-center gap-1"
        >
          {checkingStatus ? 'Checking...' : <><RefreshCw size={11} /> Refresh Status</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Settings Form */}
        <form onSubmit={handleSaveSettings} className="bg-gradient-to-br from-[#0c1020] to-[#121630] border border-blue-900/40 rounded-3xl p-5 space-y-4 shadow-2xl">
          <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
            <Settings size={14} /> Gateway Configurations
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 bg-[#11162a]/95 border border-gray-800/80 px-3.5 rounded-xl">
              <div>
                <p className="text-xs font-bold text-white">Enable Gateway Notifications</p>
                <p className="text-[9px] text-gray-500 mt-0.5">Sends automated client welcome texts via custom gateway</p>
              </div>
              <button
                type="button"
                onClick={() => setWhatsappEnabled(!whatsappEnabled)}
                className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 flex ${whatsappEnabled ? 'bg-emerald-500 justify-end' : 'bg-gray-800 justify-start'}`}
              >
                <span className="w-4 h-4 bg-white rounded-full shadow-md" />
              </button>
            </div>

            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Gateway API Base URL</label>
              <input
                type="text"
                required={whatsappEnabled}
                value={gatewayUrl}
                onChange={e => setGatewayUrl(e.target.value)}
                placeholder="e.g. https://your-whatsapp-gateway.up.railway.app"
                className="w-full bg-[#11162a] border border-gray-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none mt-1"
              />
            </div>

            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Gateway Authorization Token</label>
              <div className="relative mt-1">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={gatewayToken}
                  onChange={e => setGatewayToken(e.target.value)}
                  placeholder="Bearer Passcode (Optional)"
                  className="w-full bg-[#11162a] border border-gray-800 focus:border-emerald-500 rounded-xl pl-3 pr-9 py-2.5 text-xs text-white outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-550 hover:text-white"
                >
                  {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="border-t border-gray-800/80 pt-3 space-y-3">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Anti-Ban Safeguards</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Min Delay (s)</label>
                  <input
                    type="number"
                    value={delayMin}
                    onChange={e => setDelayMin(Number(e.target.value))}
                    className="w-full bg-[#11162a] border border-gray-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none mt-1"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Max Delay (s)</label>
                  <input
                    type="number"
                    value={delayMax}
                    onChange={e => setDelayMax(Number(e.target.value))}
                    className="w-full bg-[#11162a] border border-gray-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Trusted Warm-Up Phone</label>
                <input
                  type="text"
                  value={warmupPhone}
                  onChange={e => setWarmupPhone(e.target.value)}
                  placeholder="e.g. 201128828954"
                  className="w-full bg-[#11162a] border border-gray-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none mt-1"
                />
              </div>

              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Warm-up Interval (messages)</label>
                <select
                  value={warmupInterval}
                  onChange={e => setWarmupInterval(Number(e.target.value))}
                  className="w-full bg-[#11162a] border border-gray-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none mt-1"
                >
                  <option value={5}>Every 5 messages</option>
                  <option value={10}>Every 10 messages</option>
                  <option value={20}>Every 20 messages</option>
                  <option value={50}>Every 50 messages</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Save size={14} /> {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>

        {/* Connection Test & Auto-Replies */}
        <div className="space-y-5">
          {/* WhatsApp QR Pairing Card */}
          <div className="bg-gradient-to-br from-[#0c1020] to-[#121630] border border-blue-900/40 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800/80 pb-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                <QrCode size={14} /> WhatsApp QR Pairing
              </h3>
              <button
                type="button"
                onClick={fetchWaQrCode}
                disabled={waQrLoading}
                className="p-1 bg-[#11162a] hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Refresh QR Code"
              >
                <RefreshCw size={12} className={waQrLoading ? "animate-spin" : ""} />
              </button>
            </div>

            {waQrLoading ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-2">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] text-gray-500 font-mono font-bold">Fetching QR Code...</span>
              </div>
            ) : waQrError === 'CONNECTED' ? (
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400">
                  <QrCode size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Device Connected</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Your gateway is already paired & active!</p>
                </div>
              </div>
            ) : waQrImageUrl ? (
              <div className="flex flex-col items-center justify-center py-4 space-y-3">
                <div className="p-3 bg-white rounded-2xl shadow-xl border border-zinc-205">
                  <img
                    src={waQrImageUrl}
                    alt="WhatsApp QR Code"
                    className="w-48 h-48 block object-contain"
                  />
                </div>
                <p className="text-[10px] text-gray-400 text-center font-bold px-4 leading-normal">
                  Scan this QR code with WhatsApp on your phone to link your account.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                <div className="p-2.5 bg-[#11162a] border border-gray-800 rounded-full text-gray-500">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">No QR Code Available</p>
                  <p className="text-[10px] text-gray-500 mt-1 max-w-[240px] leading-normal">
                    {waQrError || 'Make sure your gateway is running and needs pairing.'}
                  </p>
                </div>
                {gatewayUrl && (
                  <button
                    type="button"
                    onClick={fetchWaQrCode}
                    className="mt-2 px-3 py-1 bg-[#11162a] hover:bg-gray-800 border border-gray-850 text-gray-300 hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                  >
                    Try Again
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Connection Test */}
          <div className="bg-gradient-to-br from-[#0c1020] to-[#121630] border border-blue-900/40 rounded-3xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
              <Play size={14} /> Connection Tester
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Recipient Phone Number</label>
                <input
                  type="text"
                  value={testPhone}
                  onChange={e => setTestPhone(e.target.value)}
                  placeholder="e.g. 201128828954"
                  className="w-full bg-[#11162a] border border-gray-800 focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none mt-1"
                />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Test Message Text</label>
                <textarea
                  value={testMessage}
                  onChange={e => setTestMessage(e.target.value)}
                  rows={2}
                  className="w-full bg-[#11162a] border border-gray-800 focus:border-blue-500 rounded-xl p-3 text-xs text-white outline-none resize-none mt-1"
                />
              </div>
              <button
                type="button"
                onClick={handleSendTest}
                disabled={testing}
                className="w-full bg-[#161f38] hover:bg-[#1f2b4e] text-blue-400 border border-blue-900/40 font-bold py-3 rounded-xl text-xs uppercase transition-all flex items-center justify-center gap-1.5"
              >
                {testing ? 'Sending Test...' : 'Send Test Message'}
              </button>
            </div>
          </div>

          {/* Greeting / Welcome Message Console */}
          <div className="bg-gradient-to-br from-[#0c1020] to-[#121630] border border-blue-900/40 rounded-3xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
              <MessageSquare size={14} /> Greeting / Welcome Message
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 bg-[#11162a]/95 border border-gray-800/80 px-3.5 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-white">Enable Greeting Message</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">Sends welcome text when a new user first messages us</p>
                </div>
                <button
                  type="button"
                  onClick={() => setWhatsappGreetingEnabled(!whatsappGreetingEnabled)}
                  className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 flex ${whatsappGreetingEnabled ? 'bg-emerald-500 justify-end' : 'bg-gray-800 justify-start'}`}
                >
                  <span className="w-4 h-4 bg-white rounded-full shadow-md" />
                </button>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Greeting Message Text</label>
                <textarea
                  value={whatsappGreetingMessage}
                  onChange={e => setWhatsappGreetingMessage(e.target.value)}
                  placeholder="Welcome to Life Gym! 🏋️ How can we help you crush your goals today?"
                  rows={3}
                  className="w-full bg-[#11162a] border border-gray-800 focus:border-emerald-500 rounded-xl p-3 text-xs text-white outline-none resize-none mt-1"
                />
              </div>

              <div className="bg-[#11162a]/95 border border-gray-800/80 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-gray-550 uppercase">Unique Senders Welcomed</p>
                  <p className="text-xs font-bold text-white mt-0.5">{greetedNumbersCount}</p>
                </div>
                <button
                  type="button"
                  onClick={handleResetWelcomedHistory}
                  className="px-2.5 py-1.5 bg-red-950/20 hover:bg-red-950/40 text-[9px] font-bold text-red-400 rounded-lg border border-red-900/30 transition-all cursor-pointer uppercase"
                >
                  Reset History
                </button>
              </div>
            </div>
          </div>

          {/* Auto-Reply Rule Creator */}
          <div className="bg-gradient-to-br from-[#0c1020] to-[#121630] border border-blue-900/40 rounded-3xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-violet-400 flex items-center gap-1.5">
              <Plus size={14} /> Auto-Reply Rules
            </h3>
            
            <div className="space-y-3 bg-[#11162a]/95 border border-gray-800/80 p-4 rounded-2xl">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-[8px] font-black text-gray-500 uppercase">Trigger Keyword</label>
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={e => setNewKeyword(e.target.value)}
                    placeholder="e.g. diet"
                    className="w-full bg-[#11162a] border border-gray-800 focus:border-violet-500 rounded-xl px-3 py-2 text-xs text-white outline-none mt-1"
                  />
                </div>
                <div>
                  <label className="text-[8px] font-black text-gray-500 uppercase">Match Type</label>
                  <select
                    value={newMatchType}
                    onChange={e => setNewMatchType(e.target.value as any)}
                    className="w-full bg-[#11162a] border border-gray-800 focus:border-violet-500 rounded-xl px-2 py-2 text-xs text-white outline-none mt-1"
                  >
                    <option value="exact">Exact</option>
                    <option value="contains">Contains</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[8px] font-black text-gray-500 uppercase">Response Message</label>
                <textarea
                  value={newResponse}
                  onChange={e => setNewResponse(e.target.value)}
                  placeholder="Text response..."
                  rows={2}
                  className="w-full bg-[#11162a] border border-gray-800 focus:border-violet-500 rounded-xl p-3 text-xs text-white outline-none resize-none mt-1"
                />
              </div>
              <button
                type="button"
                onClick={handleAddRule}
                className="w-full bg-[#1d1b38] hover:bg-[#2a2750] text-violet-400 border border-violet-900/40 font-bold py-2.5 rounded-xl text-[10px] uppercase transition-all flex items-center justify-center gap-1"
              >
                Add Auto-Reply Rule
              </button>
            </div>

            {/* Rules List */}
            {autoReplies.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {autoReplies.map((rule: any) => (
                  <div key={rule.id} className="bg-[#11162a]/95 border border-gray-800/80 rounded-xl p-3 flex justify-between items-start gap-2.5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-violet-400 uppercase font-mono bg-violet-950/40 border border-violet-900/30 px-1.5 py-0.5 rounded">
                          {rule.keyword}
                        </span>
                        <span className="text-[8px] text-gray-550 uppercase font-bold">
                          ({rule.matchType})
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-normal">{rule.response}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRule(rule.id)}
                      className="p-1.5 hover:bg-red-950/20 text-gray-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Broadcast Campaign Hub */}
      <div className="bg-gradient-to-br from-[#0c1020] to-[#121630] border border-blue-900/40 rounded-3xl p-5 space-y-4 shadow-2xl">
        <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
          <MessageSquare size={14} /> Broadcast Campaign Hub
        </h3>
        
        <div className="space-y-4">
          <div className="bg-[#11162a]/95 border border-gray-800/80 rounded-2xl p-4 space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Message Template (Plain Text)</label>
              <textarea
                value={broadcastTemplate}
                onChange={e => setBroadcastTemplate(e.target.value)}
                placeholder="Hello {{display_name}}! This is an announcement from Life Gym..."
                rows={4}
                className="w-full bg-[#121624]/60 border border-gray-800 focus:border-emerald-500 rounded-xl p-3 text-white text-xs outline-none mt-1 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Target Cohort</label>
              <div className="grid grid-cols-4 gap-1 p-1 bg-[#121624]/60 border border-gray-800 rounded-xl mt-1">
                {[
                  { id: 'everyone', label: 'Everyone' },
                  { id: 'coaches', label: 'Coaches' },
                  { id: 'clients', label: 'Athletes' },
                  { id: 'custom', label: 'Manual' }
                ].map(cohort => (
                  <button
                    key={cohort.id}
                    type="button"
                    onClick={() => setTargetAudience(cohort.id as any)}
                    className={`py-2 text-[9px] font-black rounded-lg transition-all text-center uppercase tracking-wider cursor-pointer ${
                      targetAudience === cohort.id ? 'bg-[#1e293b] text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {cohort.label}
                  </button>
                ))}
              </div>
            </div>

            {targetAudience === 'custom' && (
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Emails or Phone Numbers (Comma Separated)</label>
                <textarea
                  value={customList}
                  onChange={e => setCustomList(e.target.value)}
                  placeholder="201128828954, coach@example.com"
                  rows={2}
                  className="w-full bg-[#121624]/60 border border-gray-800 focus:border-emerald-500 rounded-xl p-3 text-white text-xs outline-none placeholder-gray-700 resize-none"
                />
              </div>
            )}
          </div>

          {/* Broadcast Progress and Console */}
          {broadcastProgress && (
            <div className="bg-[#11162a]/95 border border-gray-800/80 rounded-2xl p-4 space-y-2.5">
              <div className="flex justify-between items-center text-[9px] font-black text-gray-400 font-sans leading-none">
                <span>Sending: {broadcastProgress.current}</span>
                <span>{broadcastProgress.index}/{broadcastProgress.total}</span>
              </div>
              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${(broadcastProgress.index / broadcastProgress.total) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-black">
                <span className="text-emerald-400">Sent: {broadcastProgress.successCount}</span>
                <span className="text-red-400">Failed: {broadcastProgress.failCount}</span>
              </div>
            </div>
          )}

          {broadcastLogs.length > 0 && (
            <div className="bg-zinc-950 border border-gray-800/80 rounded-2xl p-4 font-mono text-[9px] text-gray-400 max-h-40 overflow-y-auto space-y-1">
              {broadcastLogs.map((log, idx) => (
                <div key={idx} className="leading-relaxed break-all">{log}</div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3">
            {broadcastRunning ? (
              <button
                type="button"
                onClick={() => {
                  cancelBroadcastRef.current = true;
                }}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-extrabold text-[10px] py-3 px-4 uppercase tracking-widest rounded-xl transition-all cursor-pointer"
              >
                Stop Broadcast
              </button>
            ) : (
              <button
                type="button"
                onClick={runBroadcast}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
              >
                Dispatch Campaign
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
