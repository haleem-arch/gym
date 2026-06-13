import { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { MessageSquare, Play, Terminal, HelpCircle } from 'lucide-react';

export default function WaPilotTestConsole() {
  const [endpoint, setEndpoint] = useState('https://api.wapilot.net/api/v2/send-message');
  const [token, setToken] = useState('Bearer wrsDfDhpmEsiPXBcydPDqlzvEDS5tUjOBMAUOz5ubm');
  const [method, setMethod] = useState('POST');
  const [payload, setPayload] = useState(JSON.stringify({
    to: "201012345678",
    body: "Hello from Life Gym! This is a test message."
  }, null, 2));

  const [sending, setSending] = useState(false);
  const [responseStatus, setResponseStatus] = useState<string | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<string | null>(null);
  const [responseBody, setResponseBody] = useState<string | null>(null);

  const handleSendTest = async () => {
    if (!endpoint.trim()) {
      toast.error('Please enter an API Endpoint URL');
      return;
    }

    let parsedPayload = {};
    try {
      if (method !== 'GET') {
        parsedPayload = JSON.parse(payload);
      }
    } catch (e) {
      toast.error('Invalid JSON payload structure');
      return;
    }

    setSending(true);
    setResponseStatus(null);
    setResponseHeaders(null);
    setResponseBody(null);

    const toastId = toast.loading('Executing request...');

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (token.trim()) {
        if (token.toLowerCase().startsWith('bearer ') || token.toLowerCase().startsWith('basic ')) {
          headers['Authorization'] = token.trim();
        } else {
          headers['Authorization'] = `Bearer ${token.trim()}`;
        }
      }

      const response = await fetch(endpoint.trim(), {
        method: method,
        headers: headers,
        body: method !== 'GET' ? JSON.stringify(parsedPayload) : undefined
      });

      setResponseStatus(`${response.status} ${response.statusText}`);
      
      const headersObj: Record<string, string> = {};
      response.headers.forEach((val, key) => {
        headersObj[key] = val;
      });
      setResponseHeaders(JSON.stringify(headersObj, null, 2));

      const text = await response.text();
      try {
        const json = JSON.parse(text);
        setResponseBody(JSON.stringify(json, null, 2));
      } catch (e) {
        setResponseBody(text || '(Empty Response)');
      }

      if (response.ok) {
        toast.success(`Request completed: ${response.status}`, { id: toastId });
      } else {
        toast.error(`Request failed: ${response.status}`, { id: toastId });
      }
    } catch (err: any) {
      console.error(err);
      setResponseStatus('Network Error / CORS Blocked');
      setResponseBody(err.message || 'The request was blocked by the browser CORS policy or the destination server was unreachable.');
      toast.error('Network request failed', { id: toastId });
    } finally {
      setSending(false);
    }
  };

  const handleSelectTemplate = (type: string) => {
    if (type === 'whapi') {
      setEndpoint('https://gate.whapi.cloud/messages/text');
      setToken('Bearer wrsDfDhpmEsiPXBcydPDqlzvEDS5tUjOBMAUOz5ubm');
      setPayload(JSON.stringify({
        to: "201012345678",
        body: "Hello from Life Gym! Testing Whapi."
      }, null, 2));
    } else if (type === 'wapilot_phone') {
      setEndpoint('https://api.wapilot.net/api/v2/send-message');
      setToken('Bearer wrsDfDhpmEsiPXBcydPDqlzvEDS5tUjOBMAUOz5ubm');
      setPayload(JSON.stringify({
        phone: "201012345678",
        message: "Hello from Life Gym! Testing WaPilot."
      }, null, 2));
    } else if (type === 'wapilot_to') {
      setEndpoint('https://api.wapilot.net/api/v2/send');
      setToken('Bearer wrsDfDhpmEsiPXBcydPDqlzvEDS5tUjOBMAUOz5ubm');
      setPayload(JSON.stringify({
        to: "201012345678",
        body: "Hello from Life Gym! Testing WaPilot."
      }, null, 2));
    }
  };

  return (
    <div className="min-h-screen bg-[#060713] text-white p-6 font-sans">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-800/80 gap-3">
          <div>
            <h1 className="text-base font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
              <MessageSquare size={20} /> WaPilot V2 API Testing Hub
            </h1>
            <p className="text-[10px] text-gray-500 font-mono">Execute and debug HTTP requests to your WhatsApp gateways</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => handleSelectTemplate('whapi')}
              className="px-3 py-1.5 bg-gray-900 border border-gray-800 hover:border-emerald-500 rounded-xl text-[10px] font-bold uppercase transition-all"
            >
              Whapi Template
            </button>
            <button 
              onClick={() => handleSelectTemplate('wapilot_phone')}
              className="px-3 py-1.5 bg-gray-900 border border-gray-800 hover:border-emerald-500 rounded-xl text-[10px] font-bold uppercase transition-all"
            >
              WaPilot (phone/message)
            </button>
            <button 
              onClick={() => handleSelectTemplate('wapilot_to')}
              className="px-3 py-1.5 bg-gray-900 border border-gray-800 hover:border-emerald-500 rounded-xl text-[10px] font-bold uppercase transition-all"
            >
              WaPilot (to/body)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Request Config Pane */}
          <div className="bg-gradient-to-br from-[#0c1020] to-[#121630] border border-blue-900/40 rounded-3xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
              <Play size={14} /> Request Configuration
            </h3>

            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="w-1/4">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Method</label>
                  <select
                    value={method}
                    onChange={e => setMethod(e.target.value)}
                    className="w-full bg-[#11162a]/95 border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500 transition-all mt-1 cursor-pointer"
                  >
                    <option value="POST">POST</option>
                    <option value="GET">GET</option>
                    <option value="PUT">PUT</option>
                  </select>
                </div>
                <div className="w-3/4">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">API Endpoint URL</label>
                  <input
                    type="text"
                    value={endpoint}
                    onChange={e => setEndpoint(e.target.value)}
                    placeholder="https://api.wapilot.net/api/v2/send-message"
                    className="w-full bg-[#11162a]/95 border border-gray-800 focus:border-emerald-500 rounded-xl p-3 text-xs text-white outline-none focus:outline-none transition-all mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Authorization Header</label>
                <input
                  type="text"
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  placeholder="Bearer YOUR_TOKEN"
                  className="w-full bg-[#11162a]/95 border border-gray-800 focus:border-emerald-500 rounded-xl p-3 text-xs text-white outline-none focus:outline-none transition-all mt-1 font-mono"
                />
              </div>

              {method !== 'GET' && (
                <div>
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">JSON Payload Body</label>
                    <span className="text-[8px] text-gray-600 font-mono">application/json</span>
                  </div>
                  <textarea
                    value={payload}
                    onChange={e => setPayload(e.target.value)}
                    placeholder="{}"
                    rows={8}
                    className="w-full bg-[#11162a]/95 border border-gray-800 focus:border-emerald-500 rounded-xl p-3 text-xs text-emerald-400 outline-none focus:outline-none transition-all mt-1 resize-none font-mono"
                  />
                </div>
              )}

              <button
                type="button"
                disabled={sending}
                onClick={handleSendTest}
                className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10"
              >
                {sending ? 'Executing...' : 'Send HTTP Request'}
              </button>
            </div>
          </div>

          {/* Response Inspector Pane */}
          <div className="bg-gradient-to-br from-[#0c1020] to-[#121630] border border-blue-900/40 rounded-3xl p-5 space-y-4 shadow-2xl flex flex-col h-full">
            <h3 className="text-xs font-black uppercase tracking-widest text-violet-400 flex items-center gap-1.5">
              <Terminal size={14} /> Response Inspector
            </h3>

            <div className="flex-1 space-y-3 flex flex-col">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">HTTP Status</p>
                <div className={`mt-1 p-2.5 rounded-xl border text-xs font-bold font-mono ${
                  !responseStatus ? 'bg-gray-950/20 border-gray-800 text-gray-500' :
                  responseStatus.startsWith('2') ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' :
                  'bg-red-950/20 border-red-500/20 text-red-400'
                }`}>
                  {responseStatus || 'Waiting for request...'}
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-[150px]">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Response Body</p>
                <div className="flex-1 mt-1 bg-gray-950/50 border border-gray-800 rounded-xl p-3 text-[11px] font-mono text-gray-300 overflow-y-auto no-scrollbar max-h-[200px] whitespace-pre-wrap">
                  {responseBody || 'No data returned yet.'}
                </div>
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Response Headers</p>
                <div className="mt-1 bg-gray-950/50 border border-gray-800 rounded-xl p-3 text-[10px] font-mono text-gray-400 overflow-y-auto no-scrollbar max-h-[120px] whitespace-pre-wrap">
                  {responseHeaders || 'No headers returned yet.'}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Developer Notes / Help */}
        <div className="bg-[#0f1424] border border-gray-800 rounded-2xl p-4 flex gap-3">
          <HelpCircle className="text-emerald-400 shrink-0 mt-0.5" size={16} />
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-300">CORS Note / Cross-Origin Testing</h4>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              If requests fail with "Network Error / CORS Blocked", it means the target API server does not permit cross-origin requests directly from web browsers. 
              <strong> You can bypass this by running this page inside your Desktop Coach Portal wrapper (Electron)</strong>, which disables CORS policies and allows direct connections to any API endpoint!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
