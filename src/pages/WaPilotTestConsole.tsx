import { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { MessageSquare, Play, Terminal, HelpCircle, RefreshCw } from 'lucide-react';

export default function WaPilotTestConsole() {
  const [waToken, setWaToken] = useState('wrsDfDhpmEsiPXBcydPDqlzvEDS5tUjOBMAUOz5ubm');
  const [authHeaderKey, setAuthHeaderKey] = useState('token'); // 'token' or 'Authorization'
  const [endpoint, setEndpoint] = useState('https://api.wapilot.net/api/v2/instance4351/send-message');
  const [method, setMethod] = useState('POST');
  const [payload, setPayload] = useState(JSON.stringify({
    chat_id: "201128828954",
    text: "Hello from Life Gym! Testing WaPilot V2 API."
  }, null, 2));

  const [instances, setInstances] = useState<any[]>([]);
  const [fetchingInstances, setFetchingInstances] = useState(false);
  const [sending, setSending] = useState(false);
  const [responseStatus, setResponseStatus] = useState<string | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<string | null>(null);
  const [responseBody, setResponseBody] = useState<string | null>(null);

  const handleFetchInstances = async () => {
    if (!waToken.trim()) {
      toast.error('Please enter your API Token first');
      return;
    }

    setFetchingInstances(true);
    const toastId = toast.loading('Fetching instances from WaPilot...');
    try {
      const response = await fetch('https://api.wapilot.net/api/v2/instances', {
        method: 'GET',
        headers: {
          'token': waToken.trim()
        }
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setInstances(data.instances || []);
        toast.success(`Found ${data.instances?.length || 0} instances!`, { id: toastId });
        
        // Auto-select first instance if available
        if (data.instances && data.instances.length > 0) {
          const firstInstance = data.instances[0].instance_uniquename;
          setEndpoint(`https://api.wapilot.net/api/v2/${firstInstance}/send-message`);
          setAuthHeaderKey('token');
          setPayload(JSON.stringify({
            chat_id: "201128828954",
            text: "Hello from Life Gym! Testing WaPilot V2 API."
          }, null, 2));
        }
      } else {
        throw new Error(data.message || 'Failed to fetch instances');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error fetching instances. Verify token.', { id: toastId });
    } finally {
      setFetchingInstances(false);
    }
  };

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

      if (waToken.trim()) {
        if (authHeaderKey === 'token') {
          headers['token'] = waToken.trim();
        } else {
          headers['Authorization'] = waToken.trim().startsWith('Bearer ') || waToken.trim().startsWith('bearer ')
            ? waToken.trim()
            : `Bearer ${waToken.trim()}`;
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
    const activeInstance = instances.length > 0 ? instances[0].instance_uniquename : 'instance4351';
    
    if (type === 'whapi') {
      setEndpoint('https://gate.whapi.cloud/messages/text');
      setAuthHeaderKey('Authorization');
      setPayload(JSON.stringify({
        to: "201128828954",
        body: "Hello from Life Gym! Testing Whapi."
      }, null, 2));
    } else if (type === 'wapilot_v2') {
      setEndpoint(`https://api.wapilot.net/api/v2/${activeInstance}/send-message`);
      setAuthHeaderKey('token');
      setPayload(JSON.stringify({
        chat_id: "201128828954",
        text: "Hello from Life Gym! Testing WaPilot V2."
      }, null, 2));
    } else if (type === 'wapilot_v2_buttons_meta') {
      // Standard Meta WhatsApp Cloud API Interactive Buttons
      setEndpoint(`https://api.wapilot.net/api/v2/${activeInstance}/send-message`);
      setAuthHeaderKey('token');
      setPayload(JSON.stringify({
        chat_id: "201128828954",
        text: "Please verify your subscription",
        type: "interactive",
        interactive: {
          type: "button",
          header: {
            type: "text",
            text: "Life Gym Os 🏋️‍♂️"
          },
          body: {
            text: "Your membership payment was successfully verified! Click below to confirm activation."
          },
          footer: {
            text: "Life Gym Automation"
          },
          action: {
            buttons: [
              {
                type: "reply",
                reply: {
                  id: "confirm_activation",
                  title: "Activate ✅"
                }
              },
              {
                type: "reply",
                reply: {
                  id: "report_issue",
                  title: "Report Issue ⚠️"
                }
              }
            ]
          }
        }
      }, null, 2));
    } else if (type === 'wapilot_v2_buttons_simple') {
      // Simplified button structure used by some gateways
      setEndpoint(`https://api.wapilot.net/api/v2/${activeInstance}/send-message`);
      setAuthHeaderKey('token');
      setPayload(JSON.stringify({
        chat_id: "201128828954",
        text: "Your payment of 3500 EGP is verified!",
        buttons: [
          { id: "confirm", text: "Confirm ✅" },
          { id: "cancel", text: "Cancel ❌" }
        ]
      }, null, 2));
    } else if (type === 'wapilot_v2_list_meta') {
      // Standard Meta WhatsApp Cloud API Interactive Lists
      setEndpoint(`https://api.wapilot.net/api/v2/${activeInstance}/send-message`);
      setAuthHeaderKey('token');
      setPayload(JSON.stringify({
        chat_id: "201128828954",
        text: "Please select your training split:",
        type: "interactive",
        interactive: {
          type: "list",
          header: {
            type: "text",
            text: "Choose your Workout Split"
          },
          body: {
            text: "Please select one of the active training splits below:"
          },
          footer: {
            text: "Life Gym Facility OS"
          },
          action: {
            button: "Select Split",
            sections: [
              {
                title: "Strength Splits",
                rows: [
                  { id: "split_push", title: "Push split 🔴", description: "Chest, shoulders, triceps" },
                  { id: "split_pull", title: "Pull split 🔵", description: "Back, rear delts, biceps" },
                  { id: "split_legs", title: "Legs split 🟡", description: "Quads, hamstrings, glutes" }
                ]
              }
            ]
          }
        }
      }, null, 2));
    } else if (type === 'wapilot_v2_template') {
      // WaPilot/Meta Approved Template schema
      setEndpoint(`https://api.wapilot.net/api/v2/${activeInstance}/send-message`);
      setAuthHeaderKey('token');
      setPayload(JSON.stringify({
        chat_id: "201128828954",
        text: "Welcome to Life Gym!",
        type: "template",
        template: {
          name: "life_gym_welcome",
          language: {
            code: "en_US"
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: "Captain Alberto"
                }
              ]
            }
          ]
        }
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
          <div className="flex flex-wrap gap-2">
            <select
              onChange={(e) => handleSelectTemplate(e.target.value)}
              className="px-3 py-1.5 bg-gray-900 border border-gray-800 hover:border-emerald-500 rounded-xl text-[10px] font-bold uppercase transition-all outline-none cursor-pointer"
            >
              <option value="">-- Choose Preset --</option>
              <option value="wapilot_v2">WaPilot V2 (Plain Text)</option>
              <option value="wapilot_v2_buttons_meta">WaPilot V2 (Buttons - Meta Spec)</option>
              <option value="wapilot_v2_buttons_simple">WaPilot V2 (Buttons - Simple Spec)</option>
              <option value="wapilot_v2_list_meta">WaPilot V2 (List Menu - Meta Spec)</option>
              <option value="wapilot_v2_template">WaPilot V2 (Template Message)</option>
              <option value="whapi">Whapi Preset</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Request Config Pane */}
          <div className="bg-gradient-to-br from-[#0c1020] to-[#121630] border border-blue-900/40 rounded-3xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
              <Play size={14} /> Request Configuration
            </h3>

            <div className="space-y-4">
              
              {/* Token and Header Configuration */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">API Token</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={waToken}
                    onChange={e => setWaToken(e.target.value)}
                    placeholder="WhatsApp API Token"
                    className="flex-1 bg-[#11162a]/95 border border-gray-800 focus:border-emerald-500 rounded-xl p-3 text-xs text-white outline-none focus:outline-none transition-all font-mono"
                  />
                  <button
                    onClick={handleFetchInstances}
                    disabled={fetchingInstances}
                    className="px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-1 shrink-0 active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={10} className={fetchingInstances ? 'animate-spin' : ''} />
                    Fetch Instances
                  </button>
                </div>
              </div>

              {/* Instances List (if fetched) */}
              {instances.length > 0 && (
                <div className="bg-gray-950/45 p-3 rounded-2xl border border-gray-850 space-y-1.5">
                  <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Active Instances found on WaPilot:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {instances.map((inst, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setEndpoint(`https://api.wapilot.net/api/v2/${inst.instance_uniquename}/send-message`);
                          setAuthHeaderKey('token');
                          toast.success(`Selected instance: ${inst.instance_uniquename}`);
                        }}
                        className="px-2 py-1 bg-blue-950/40 border border-blue-900/30 hover:border-emerald-500 rounded-lg text-[9px] font-mono text-blue-300"
                      >
                        {inst.instance_uniquename} ({inst.instance_name})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Header Selector */}
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1 font-mono">Authentication Header Key</label>
                <select
                  value={authHeaderKey}
                  onChange={e => setAuthHeaderKey(e.target.value)}
                  className="w-full bg-[#11162a]/95 border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500 transition-all mt-1 cursor-pointer"
                >
                  <option value="token">token (Required by WaPilot V2)</option>
                  <option value="Authorization">Authorization (Bearer Token, e.g. Whapi / Meta)</option>
                </select>
              </div>

              {/* Endpoint Path */}
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
                    placeholder="https://api.wapilot.net/api/v2/{instance_id}/send-message"
                    className="w-full bg-[#11162a]/95 border border-gray-800 focus:border-emerald-500 rounded-xl p-3 text-xs text-white outline-none focus:outline-none transition-all mt-1"
                  />
                </div>
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
