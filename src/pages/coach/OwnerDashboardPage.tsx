import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import {
  Lock, ArrowLeft, RefreshCw, ShieldAlert, Sparkle,
  MessageSquare, Send, QrCode, Save, AlertTriangle, Power
} from 'lucide-react';

const getLocalDateString = (d: Date = new Date()) => {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
};

export default function OwnerDashboardPage() {
  const navigate = useNavigate();

  // Auth
  const [passcode, setPasscode] = useState('');
  const [isAuthed, setIsAuthed] = useState(true);
  const [shake, setShake] = useState(false);

  // Data
  const [profiles, setProfiles] = useState<any[]>([]);
  const [clientProfiles, setClientProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [coachUserId, setCoachUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  // Toggles
  const [disableWorkoutTemplatesToggle, setDisableWorkoutTemplatesToggle] = useState(false);
  const [disableNutritionTargetsToggle, setDisableNutritionTargetsToggle] = useState(false);

  // WhatsApp States
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappGatewayUrl, setWhatsappGatewayUrl] = useState('');
  const [whatsappGatewayToken, setWhatsappGatewayToken] = useState('');
  const [whatsappWarmupPhone, setWhatsappWarmupPhone] = useState('');
  const [whatsappWarmupInterval, setWhatsappWarmupInterval] = useState(10);
  const [whatsappDelayMin, setWhatsappDelayMin] = useState(5);
  const [whatsappDelayMax, setWhatsappDelayMax] = useState(15);

  // Trigger toggles and templates
  const [waTriggerCoachOnboarding, setWaTriggerCoachOnboarding] = useState(true);
  const [waTplCoachOnboarding, setWaTplCoachOnboarding] = useState('');
  const [waTriggerAthleteOnboarding, setWaTriggerAthleteOnboarding] = useState(true);
  const [waTplAthleteOnboarding, setWaTplAthleteOnboarding] = useState('');
  
  const [waTriggerSubApproved, setWaTriggerSubApproved] = useState(true);
  const [waTplSubApproved, setWaTplSubApproved] = useState('');
  const [waTriggerSubRejected, setWaTriggerSubRejected] = useState(true);
  const [waTplSubRejected, setWaTplSubRejected] = useState('');
  const [waTriggerSubExpiring, setWaTriggerSubExpiring] = useState(true);
  const [waTplSubExpiring, setWaTplSubExpiring] = useState('');

  const [waTriggerCoachSuspended, setWaTriggerCoachSuspended] = useState(true);
  const [waTplCoachSuspended, setWaTplCoachSuspended] = useState('');
  const [waTriggerClientSuspended, setWaTriggerClientSuspended] = useState(true);
  const [waTplClientSuspended, setWaTplClientSuspended] = useState('');

  const [waTriggerClientReactivated, setWaTriggerClientReactivated] = useState(true);
  const [waTplClientReactivated, setWaTplClientReactivated] = useState('');
  const [waTriggerCoachReactivated, setWaTriggerCoachReactivated] = useState(true);
  const [waTplCoachReactivated, setWaTplCoachReactivated] = useState('');

  // Status & Utility States
  const [gatewayStatus, setGatewayStatus] = useState<'offline' | 'disconnected' | 'connecting' | 'qrcode' | 'connected'>('offline');
  const [gatewayQr, setGatewayQr] = useState<string | null>(null);
  const [gatewayUser, setGatewayUser] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const checkGatewayStatus = async (url: string = whatsappGatewayUrl, token: string = whatsappGatewayToken) => {
    if (!url) {
      setGatewayStatus('offline');
      return;
    }
    setCheckingStatus(true);
    try {
      const cleanUrl = url.trim().replace(/\/$/, '');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token.trim()}`;
      }
      const res = await fetch(`${cleanUrl}/status`, { headers });
      if (!res.ok) throw new Error(`Gateway returned HTTP ${res.status}`);
      const data = await res.json();
      setGatewayStatus(data.status || 'offline');
      setGatewayQr(data.qr || null);
      setGatewayUser(data.user ? (data.user.id || data.user.name || 'Connected Device') : null);
    } catch (err: any) {
      console.error('Failed to connect to gateway status:', err);
      setGatewayStatus('offline');
      setGatewayQr(null);
      setGatewayUser(null);
    } finally {
      setCheckingStatus(false);
    }
  };

  const fetchBaseData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCoachUserId(session.user.id);
        const { data: currentProfile } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
        if (currentProfile) {
          setCurrentUserRole(currentProfile.role || null);
        }
      }

      // Fetch Haleem's toggles and WhatsApp configurations
      const { data: ownerProfile } = await supabase.from('profiles').select('targets').eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c').maybeSingle();
      if (ownerProfile?.targets) {
        const t = ownerProfile.targets;
        setDisableWorkoutTemplatesToggle(!!t.disable_workout_templates);
        setDisableNutritionTargetsToggle(!!t.disable_nutrition_targets);

        // WhatsApp settings
        setWhatsappEnabled(!!t.whatsapp_enabled);
        setWhatsappGatewayUrl(t.whatsapp_gateway_url || '');
        setWhatsappGatewayToken(t.whatsapp_gateway_token || '');
        setWhatsappWarmupPhone(t.whatsapp_warmup_phone || '');
        setWhatsappWarmupInterval(t.whatsapp_warmup_interval !== undefined ? Number(t.whatsapp_warmup_interval) : 10);
        setWhatsappDelayMin(t.whatsapp_delay_min !== undefined ? Number(t.whatsapp_delay_min) : 5);
        setWhatsappDelayMax(t.whatsapp_delay_max !== undefined ? Number(t.whatsapp_delay_max) : 15);

        // WhatsApp Triggers & Templates
        setWaTriggerCoachOnboarding(t.whatsapp_trigger_coach_onboarding !== false);
        setWaTplCoachOnboarding(t.whatsapp_tpl_coach_onboarding || '');
        setWaTriggerAthleteOnboarding(t.whatsapp_trigger_athlete_onboarding !== false);
        setWaTplAthleteOnboarding(t.whatsapp_tpl_athlete_onboarding || '');

        setWaTriggerSubApproved(t.whatsapp_trigger_sub_approved !== false);
        setWaTplSubApproved(t.whatsapp_tpl_sub_approved || '');
        setWaTriggerSubRejected(t.whatsapp_trigger_sub_rejected !== false);
        setWaTplSubRejected(t.whatsapp_tpl_sub_rejected || '');
        setWaTriggerSubExpiring(t.whatsapp_trigger_sub_expiring !== false);
        setWaTplSubExpiring(t.whatsapp_tpl_sub_expiring || '');

        setWaTriggerCoachSuspended(t.whatsapp_trigger_coach_suspended !== false);
        setWaTplCoachSuspended(t.whatsapp_tpl_coach_suspended || '');
        setWaTriggerClientSuspended(t.whatsapp_trigger_client_suspended !== false);
        setWaTplClientSuspended(t.whatsapp_tpl_client_suspended || '');

        setWaTriggerClientReactivated(t.whatsapp_trigger_client_reactivated !== false);
        setWaTplClientReactivated(t.whatsapp_tpl_client_reactivated || '');
        setWaTriggerCoachReactivated(t.whatsapp_trigger_coach_reactivated !== false);
        setWaTplCoachReactivated(t.whatsapp_tpl_coach_reactivated || '');

        // Kick off immediate gateway status check
        if (t.whatsapp_gateway_url) {
          checkGatewayStatus(t.whatsapp_gateway_url, t.whatsapp_gateway_token);
        }
      }

      // Fetch all client profiles (for ages)
      const { data: cProfs } = await supabase.from('client_profiles').select('*');
      if (cProfs) {
        setClientProfiles(cProfs);
      }

      // Fetch profiles
      const { data: userProfiles } = await supabase.from('profiles').select('*').order('display_name');
      if (userProfiles) {
        setProfiles(userProfiles);
      }
    } catch (err) {
      console.error(err);
      toast.error('Unable to load admin console details. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthed) {
      fetchBaseData();
    }
  }, [isAuthed]);

  // Periodic polling of WhatsApp Gateway Status if disconnected
  useEffect(() => {
    let interval: any = null;
    if (isAuthed && whatsappGatewayUrl) {
      interval = setInterval(() => {
        if (gatewayStatus !== 'connected') {
          checkGatewayStatus(whatsappGatewayUrl, whatsappGatewayToken);
        }
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAuthed, whatsappGatewayUrl, whatsappGatewayToken, gatewayStatus]);

  const handleSaveWhatsappSettings = async () => {
    setSavingSettings(true);
    const toastId = toast.loading('Saving WhatsApp configurations...');
    try {
      const { data: ownerProfile } = await supabase.from('profiles').select('targets').eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c').maybeSingle();
      const updatedTargets = {
        ...(ownerProfile?.targets || {}),
        whatsapp_enabled: whatsappEnabled,
        whatsapp_gateway_url: whatsappGatewayUrl.trim(),
        whatsapp_gateway_token: whatsappGatewayToken.trim(),
        whatsapp_warmup_phone: whatsappWarmupPhone.trim(),
        whatsapp_warmup_interval: Number(whatsappWarmupInterval),
        whatsapp_delay_min: Number(whatsappDelayMin),
        whatsapp_delay_max: Number(whatsappDelayMax),

        whatsapp_trigger_coach_onboarding: waTriggerCoachOnboarding,
        whatsapp_tpl_coach_onboarding: waTplCoachOnboarding.trim(),
        whatsapp_trigger_athlete_onboarding: waTriggerAthleteOnboarding,
        whatsapp_tpl_athlete_onboarding: waTplAthleteOnboarding.trim(),

        whatsapp_trigger_sub_approved: waTriggerSubApproved,
        whatsapp_tpl_sub_approved: waTplSubApproved.trim(),
        whatsapp_trigger_sub_rejected: waTriggerSubRejected,
        whatsapp_tpl_sub_rejected: waTplSubRejected.trim(),
        whatsapp_trigger_sub_expiring: waTriggerSubExpiring,
        whatsapp_tpl_sub_expiring: waTplSubExpiring.trim(),

        whatsapp_trigger_coach_suspended: waTriggerCoachSuspended,
        whatsapp_tpl_coach_suspended: waTplCoachSuspended.trim(),
        whatsapp_trigger_client_suspended: waTriggerClientSuspended,
        whatsapp_tpl_client_suspended: waTplClientSuspended.trim(),

        whatsapp_trigger_client_reactivated: waTriggerClientReactivated,
        whatsapp_tpl_client_reactivated: waTplClientReactivated.trim(),
        whatsapp_trigger_coach_reactivated: waTriggerCoachReactivated,
        whatsapp_tpl_coach_reactivated: waTplCoachReactivated.trim(),
      };

      const { error } = await supabase.from('profiles').update({ targets: updatedTargets }).eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c');
      if (error) throw error;
      toast.success('WhatsApp configurations saved successfully!', { id: toastId });
      checkGatewayStatus(whatsappGatewayUrl, whatsappGatewayToken);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to save configurations.', { id: toastId });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (!testPhone || !whatsappGatewayUrl) {
      toast.error('Please enter a test phone number and configure the gateway URL.');
      return;
    }
    setSendingTest(true);
    const toastId = toast.loading('Sending test WhatsApp message...');
    try {
      const cleanUrl = whatsappGatewayUrl.trim().replace(/\/$/, '');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (whatsappGatewayToken) {
        headers['Authorization'] = `Bearer ${whatsappGatewayToken.trim()}`;
      }
      const res = await fetch(`${cleanUrl}/send-text`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          to: testPhone.trim(),
          text: 'Hello from Life Gym WhatsApp Gateway! Your connection is working perfectly. 💪🔥'
        })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Server returned ${res.status}`);
      }
      toast.success('Test message sent successfully!', { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to send test message.', { id: toastId });
    } finally {
      setSendingTest(false);
    }
  };

  const handleGatewayLogout = async () => {
    if (!whatsappGatewayUrl) return;
    if (!confirm('Are you sure you want to log out of the WhatsApp session and clear connection keys?')) return;
    setLoggingOut(true);
    const toastId = toast.loading('Disconnecting WhatsApp gateway...');
    try {
      const cleanUrl = whatsappGatewayUrl.trim().replace(/\/$/, '');
      const headers: Record<string, string> = {};
      if (whatsappGatewayToken) {
        headers['Authorization'] = `Bearer ${whatsappGatewayToken.trim()}`;
      }
      const res = await fetch(`${cleanUrl}/logout`, { method: 'POST', headers });
      if (!res.ok) throw new Error('Logout request failed');
      toast.success('Logged out successfully. You can now scan a new QR code.', { id: toastId });
      setGatewayStatus('disconnected');
      setGatewayQr(null);
      setGatewayUser(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to logout.', { id: toastId });
    } finally {
      setLoggingOut(false);
    }
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '425336') {
      sessionStorage.setItem('owner_dashboard_authed', 'true');
      setIsAuthed(true);
      toast.success('Welcome Owner Haleem! 👑');
    } else {
      setShake(true);
      toast.error('Access denied. Incorrect passcode.');
      setPasscode('');
      setTimeout(() => setShake(false), 600);
    }
  };

  const handleToggleWorkoutTemplates = async (checked: boolean) => {
    try {
      const { data: ownerProfile } = await supabase.from('profiles').select('targets').eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c').maybeSingle();
      const updatedTargets = {
        ...(ownerProfile?.targets || {}),
        disable_workout_templates: checked
      };
      const { error } = await supabase.from('profiles').update({ targets: updatedTargets }).eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c');
      if (error) throw error;
      setDisableWorkoutTemplatesToggle(checked);
      toast.success(checked ? 'Workout templates hidden for clients!' : 'Workout templates enabled for clients!');
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to save changes. Please try again.');
    }
  };

  const handleToggleNutritionTargets = async (checked: boolean) => {
    try {
      const { data: ownerProfile } = await supabase.from('profiles').select('targets').eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c').maybeSingle();
      const updatedTargets = {
        ...(ownerProfile?.targets || {}),
        disable_nutrition_targets: checked
      };
      const { error } = await supabase.from('profiles').update({ targets: updatedTargets }).eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c');
      if (error) throw error;
      setDisableNutritionTargetsToggle(checked);
      toast.success(checked ? 'Nutrition targets settings hidden for clients!' : 'Nutrition targets settings enabled for clients!');
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to save changes. Please try again.');
    }
  };

  // Lock Screen
  if (!isAuthed) {
    return (
      <div className="flex flex-col items-center justify-center p-5 min-h-[80vh] relative z-10 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />
        <div className={`w-full max-w-xs bg-[#0d1220] border border-gray-800 rounded-3xl p-8 space-y-7 relative z-10 shadow-2xl transition-all duration-300 ${shake ? 'scale-95 border-red-800' : ''}`}>
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
              <Lock className="text-blue-400" size={28} />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Owner Console</h2>
            <p className="text-xs text-gray-500 mt-1.5">Enter passcode to unlock</p>
          </div>
          <form onSubmit={handleUnlock} className="space-y-3">
            <input
              type="password" required value={passcode} onChange={e => setPasscode(e.target.value)}
              placeholder="••••••" autoFocus
              className="w-full bg-[#131b2e] border border-gray-700 rounded-2xl py-4 text-center text-lg tracking-[0.4em] outline-none focus:border-blue-500 transition-colors text-white"
            />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white py-4 rounded-2xl font-black text-sm tracking-wider uppercase transition-all shadow-lg shadow-blue-500/20 cursor-pointer">
              Unlock
            </button>
          </form>
          <button onClick={() => navigate(-1)} className="text-xs text-gray-600 hover:text-gray-400 transition-colors cursor-pointer block mx-auto">
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // Loading Screen
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-5 min-h-[80vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="text-xs text-gray-400 mt-3 font-semibold">Loading console data...</p>
      </div>
    );
  }

  // Force guard that only coaches or administrators can view this page content
  const isCoach = currentUserRole === 'coach' || coachUserId === 'ef685819-cdb3-4cd7-811d-4e6f7fff423c';
  if (coachUserId && !isCoach) {
    return (
      <div className="p-8 text-center space-y-4">
        <ShieldAlert size={48} className="text-red-500 mx-auto" />
        <h1 className="text-xl font-bold text-white">Access Denied</h1>
        <p className="text-gray-400 text-xs">Only coaches or administrators have authorization to view this panel.</p>
        <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-bold">
          Go Home
        </button>
      </div>
    );
  }

  // Calculate metrics
  const clientUsers = profiles.filter(p => p.role === 'client');
  const totalClients = clientUsers.length;
  const males = clientUsers.filter(p => p.targets?.gender?.toLowerCase() === 'male');
  const females = clientUsers.filter(p => p.targets?.gender?.toLowerCase() === 'female');
  const maleIds = males.map(p => p.id);
  const femaleIds = females.map(p => p.id);

  const maleAges = clientProfiles.filter(cp => maleIds.includes(cp.user_id) && cp.age).map(cp => cp.age);
  const femaleAges = clientProfiles.filter(cp => femaleIds.includes(cp.user_id) && cp.age).map(cp => cp.age);

  const avgMaleAge = maleAges.length > 0 ? (maleAges.reduce((a, b) => a + b, 0) / maleAges.length).toFixed(1) : 'N/A';
  const avgFemaleAge = femaleAges.length > 0 ? (femaleAges.reduce((a, b) => a + b, 0) / femaleAges.length).toFixed(1) : 'N/A';

  // API quota total Used today
  const todayDateStr = getLocalDateString();
  const totalUsedToday = profiles.reduce((acc, p) => {
    const usage = p.targets?.ai_usage;
    if (usage && usage.date === todayDateStr) return acc + (usage.count || 0);
    return acc;
  }, 0);
  const totalLimit = 1500; // Free Allowance Indicator
  const pct = Math.min(100, (totalUsedToday / totalLimit) * 100);

  return (
    <div className="p-4 flex flex-col gap-4 relative z-10 w-full pb-28">
      {/* Glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/6 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-800/80 relative z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-800 rounded-xl transition-colors cursor-pointer text-gray-400 hover:text-white active:scale-95">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-1.5">
              👑 Owner Console
            </h1>
            <p className="text-[10px] text-gray-500 font-mono">System Controls</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {refreshing && <RefreshCw size={13} className="text-blue-400 animate-spin" />}
          <button
            onClick={() => { setRefreshing(true); fetchBaseData(); }}
            className="p-2 bg-gray-900 border border-gray-800 rounded-xl text-gray-400 hover:text-white active:scale-95 cursor-pointer"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Statistics Card */}
      <div className="bg-gradient-to-br from-[#0c1020] to-[#121630] border border-blue-900/40 rounded-3xl p-5 space-y-4 shadow-2xl">
        <h3 className="text-xs font-black uppercase tracking-widest text-blue-400">📊 Client Demographics</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#11162a]/95 border border-gray-800/80 rounded-2xl p-4 flex flex-col gap-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Total Clients</p>
            <p className="text-2xl font-black text-white">{totalClients}</p>
          </div>
          <div className="bg-[#11162a]/95 border border-gray-800/80 rounded-2xl p-4 flex flex-col gap-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Gender Ratio</p>
            <p className="text-sm font-extrabold text-white mt-1.5 flex items-center gap-2">
              <span>♂️ {males.length} M</span>
              <span className="text-gray-700">|</span>
              <span>♀️ {females.length} F</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#11162a]/95 border border-gray-800/80 rounded-2xl p-4 flex flex-col gap-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Avg Age (Male)</p>
            <p className="text-lg font-black text-blue-400">{avgMaleAge} <span className="text-[10px] text-gray-500 font-bold">yrs</span></p>
          </div>
          <div className="bg-[#11162a]/95 border border-gray-800/80 rounded-2xl p-4 flex flex-col gap-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Avg Age (Female)</p>
            <p className="text-lg font-black text-pink-400">{avgFemaleAge} <span className="text-[10px] text-gray-500 font-bold">yrs</span></p>
          </div>
        </div>
      </div>

      {/* Groq API token status */}
      <div className="bg-gradient-to-br from-[#0c1020] to-[#121630] border border-blue-900/40 rounded-3xl p-5 space-y-3 shadow-2xl">
        <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-blue-400">
          <span>🤖 Groq AI System Quota</span>
          <span className="text-emerald-400 font-extrabold flex items-center gap-1"><Sparkle size={10} className="animate-spin" /> Live</span>
        </div>
        <div className="bg-[#11162a]/95 border border-gray-800/80 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between text-[10px] text-gray-500 font-bold">
            <span>Aggregated Messages Today ({totalUsedToday} msgs)</span>
            <span className="text-blue-400">{totalLimit - totalUsedToday} msgs left</span>
          </div>
          <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-[9px] text-gray-600 leading-normal">
            This quota aggregates total messages from all registered users today. The system runs on a high-throughput free model pool fallback chain.
          </p>
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="bg-gradient-to-br from-[#0c1020] to-[#121630] border border-blue-900/40 rounded-3xl p-5 space-y-4 shadow-2xl">
        <h3 className="text-xs font-black uppercase tracking-widest text-blue-400">🎯 Feature Access Toggles</h3>
        
        <div className="bg-[#11162a]/95 border border-gray-800/80 rounded-2xl p-4 space-y-5">
          {/* Toggle 1 */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Hide Workout Templates</p>
              <p className="text-[9px] text-gray-500 mt-0.5">Removes templates & programs button for clients</p>
            </div>
            <button
              onClick={() => handleToggleWorkoutTemplates(!disableWorkoutTemplatesToggle)}
              className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 outline-none cursor-pointer flex ${disableWorkoutTemplatesToggle ? 'bg-red-500 justify-end' : 'bg-gray-800 justify-start'}`}
            >
              <span className="w-4 h-4 bg-white rounded-full shadow-md" />
            </button>
          </div>

          {/* Toggle 2 */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Hide Nutrition Targets</p>
              <p className="text-[9px] text-gray-500 mt-0.5">Removes daily targets setup menu for clients</p>
            </div>
            <button
              onClick={() => handleToggleNutritionTargets(!disableNutritionTargetsToggle)}
              className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 outline-none cursor-pointer flex ${disableNutritionTargetsToggle ? 'bg-red-500 justify-end' : 'bg-gray-800 justify-start'}`}
            >
              <span className="w-4 h-4 bg-white rounded-full shadow-md" />
            </button>
          </div>
        </div>
      </div>

      {/* WhatsApp Custom Gateway & Event Notifications */}
      <div className="bg-gradient-to-br from-[#0c1020] to-[#121630] border border-blue-900/40 rounded-3xl p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <MessageSquare className="text-emerald-400" size={18} />
            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400">💬 WhatsApp API Gateway</h3>
          </div>
          <button
            onClick={() => setWhatsappEnabled(!whatsappEnabled)}
            className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 outline-none cursor-pointer flex ${whatsappEnabled ? 'bg-emerald-500 justify-end' : 'bg-gray-800 justify-start'}`}
          >
            <span className="w-4 h-4 bg-white rounded-full shadow-md" />
          </button>
        </div>

        {whatsappEnabled && (
          <div className="space-y-4">
            
            {/* Gateway Status Monitor */}
            <div className="bg-[#11162a]/95 border border-gray-800/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-white">Connection Status</p>
                <div className="flex items-center gap-2">
                  {checkingStatus && <RefreshCw size={11} className="text-blue-400 animate-spin" />}
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    gatewayStatus === 'connected' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    gatewayStatus === 'qrcode' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' :
                    gatewayStatus === 'connecting' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {gatewayStatus === 'connected' ? 'Connected' :
                     gatewayStatus === 'qrcode' ? 'Scan QR Code' :
                     gatewayStatus === 'connecting' ? 'Connecting...' :
                     'Offline / Disconnected'}
                  </span>
                </div>
              </div>

              {/* QR Code Scan panel */}
              {gatewayStatus === 'qrcode' && gatewayQr && (
                <div className="flex flex-col items-center justify-center bg-[#060813] border border-amber-500/20 rounded-xl p-4 space-y-3">
                  <div className="bg-white p-2 rounded-xl">
                    <img src={gatewayQr} alt="WhatsApp Web QR Code" className="w-40 h-40" />
                  </div>
                  <p className="text-[10px] text-amber-400 font-bold text-center flex items-center gap-1.5 justify-center">
                    <QrCode size={12} /> Scan this QR code with your Linked WhatsApp Phone.
                  </p>
                </div>
              )}

              {/* Connected User Details */}
              {gatewayStatus === 'connected' && (
                <div className="flex items-center justify-between bg-[#060813] border border-emerald-500/20 rounded-xl p-3">
                  <div className="text-[11px] text-gray-300">
                    <p className="font-bold text-emerald-400">Device Authenticated</p>
                    <p className="font-mono text-gray-500 mt-0.5">{gatewayUser}</p>
                  </div>
                  <button
                    disabled={loggingOut}
                    onClick={handleGatewayLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/40 hover:bg-red-950 border border-red-800/30 text-red-400 text-[10px] uppercase font-bold tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Power size={11} /> {loggingOut ? 'Logging out...' : 'Disconnect'}
                  </button>
                </div>
              )}

              {/* Offline advice */}
              {gatewayStatus === 'offline' && whatsappGatewayUrl && (
                <div className="bg-[#1c1212]/30 border border-red-900/30 rounded-xl p-3 flex items-start gap-2.5">
                  <AlertTriangle className="text-red-400 shrink-0" size={14} />
                  <p className="text-[10px] text-gray-400 leading-normal">
                    Ensure your custom WhatsApp microservice is running at the URL below, and that your token is set correctly.
                  </p>
                </div>
              )}
            </div>

            {/* Gateway Configuration Fields */}
            <div className="bg-[#11162a]/95 border border-gray-800/80 rounded-2xl p-4 space-y-3">
              <div>
                <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest block mb-1">Gateway URL</label>
                <input
                  type="text"
                  value={whatsappGatewayUrl}
                  onChange={e => setWhatsappGatewayUrl(e.target.value)}
                  placeholder="e.g. http://localhost:3001"
                  className="w-full bg-[#0d1220] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest block mb-1">Authorization Token</label>
                <input
                  type="password"
                  value={whatsappGatewayToken}
                  onChange={e => setWhatsappGatewayToken(e.target.value)}
                  placeholder="Secure API access token"
                  className="w-full bg-[#0d1220] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 transition-colors font-mono"
                />
              </div>
            </div>

            {/* Anti-Ban & Warmup Settings */}
            <div className="bg-[#11162a]/95 border border-gray-800/80 rounded-2xl p-4 space-y-3">
              <p className="text-xs font-bold text-white">Anti-Ban Throttle & Warm-up</p>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest block mb-1">Min Delay (sec)</label>
                  <input
                    type="number"
                    value={whatsappDelayMin}
                    onChange={e => setWhatsappDelayMin(Number(e.target.value))}
                    className="w-full bg-[#0d1220] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest block mb-1">Max Delay (sec)</label>
                  <input
                    type="number"
                    value={whatsappDelayMax}
                    onChange={e => setWhatsappDelayMax(Number(e.target.value))}
                    className="w-full bg-[#0d1220] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest block mb-1">Warmup Phone</label>
                  <input
                    type="text"
                    value={whatsappWarmupPhone}
                    onChange={e => setWhatsappWarmupPhone(e.target.value)}
                    placeholder="e.g. 201234567890"
                    className="w-full bg-[#0d1220] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest block mb-1">Warmup Interval</label>
                  <input
                    type="number"
                    value={whatsappWarmupInterval}
                    onChange={e => setWhatsappWarmupInterval(Number(e.target.value))}
                    className="w-full bg-[#0d1220] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Test Send Message Console */}
            <div className="bg-[#11162a]/95 border border-gray-800/80 rounded-2xl p-4 space-y-3">
              <p className="text-xs font-bold text-white">Send Test Message</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testPhone}
                  onChange={e => setTestPhone(e.target.value)}
                  placeholder="e.g. 201234567890"
                  className="flex-1 bg-[#0d1220] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 transition-colors font-mono"
                />
                <button
                  disabled={sendingTest || !testPhone || !whatsappGatewayUrl}
                  onClick={handleSendTestMessage}
                  className="flex items-center justify-center gap-1.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase rounded-xl transition-all cursor-pointer disabled:opacity-40"
                >
                  <Send size={12} /> {sendingTest ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>

            {/* Notification Event Templates */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-white">Event Templates</p>

              {/* Template 1: Coach Onboarding */}
              <details className="group border border-gray-800/80 rounded-2xl p-4 bg-[#11162a]/95 open:border-emerald-500/30 transition-all">
                <summary className="flex items-center justify-between font-bold text-xs text-gray-300 cursor-pointer list-none select-none">
                  <span>New Coach Welcome Message</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${waTriggerCoachOnboarding ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                    <span className="text-[10px] text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                  </div>
                </summary>
                <div className="pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">Trigger Alert</span>
                    <button
                      onClick={() => setWaTriggerCoachOnboarding(!waTriggerCoachOnboarding)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors flex ${waTriggerCoachOnboarding ? 'bg-emerald-500 justify-end' : 'bg-gray-800 justify-start'}`}
                    >
                      <span className="w-4 h-4 bg-white rounded-full" />
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={waTplCoachOnboarding}
                    onChange={e => setWaTplCoachOnboarding(e.target.value)}
                    placeholder="Enter welcome message template..."
                    className="w-full bg-[#0d1220] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                  />
                  <p className="text-[9px] text-gray-600 leading-normal">
                    {"Supported tags: {display_name}, {username}, {password}, {link}"}
                  </p>
                </div>
              </details>

              {/* Template 2: Athlete Onboarding */}
              <details className="group border border-gray-800/80 rounded-2xl p-4 bg-[#11162a]/95 open:border-emerald-500/30 transition-all">
                <summary className="flex items-center justify-between font-bold text-xs text-gray-300 cursor-pointer list-none select-none">
                  <span>New Athlete Welcome Message</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${waTriggerAthleteOnboarding ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                    <span className="text-[10px] text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                  </div>
                </summary>
                <div className="pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">Trigger Alert</span>
                    <button
                      onClick={() => setWaTriggerAthleteOnboarding(!waTriggerAthleteOnboarding)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors flex ${waTriggerAthleteOnboarding ? 'bg-emerald-500 justify-end' : 'bg-gray-800 justify-start'}`}
                    >
                      <span className="w-4 h-4 bg-white rounded-full" />
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={waTplAthleteOnboarding}
                    onChange={e => setWaTplAthleteOnboarding(e.target.value)}
                    placeholder="Enter welcome message template..."
                    className="w-full bg-[#0d1220] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                  />
                  <p className="text-[9px] text-gray-600 leading-normal">
                    {"Supported tags: {display_name}, {coach_name}, {username}, {password}, {link}"}
                  </p>
                </div>
              </details>

              {/* Template 3: Subscription Approved */}
              <details className="group border border-gray-800/80 rounded-2xl p-4 bg-[#11162a]/95 open:border-emerald-500/30 transition-all">
                <summary className="flex items-center justify-between font-bold text-xs text-gray-300 cursor-pointer list-none select-none">
                  <span>Subscription Approved Receipt</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${waTriggerSubApproved ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                    <span className="text-[10px] text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                  </div>
                </summary>
                <div className="pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">Trigger Alert</span>
                    <button
                      onClick={() => setWaTriggerSubApproved(!waTriggerSubApproved)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors flex ${waTriggerSubApproved ? 'bg-emerald-500 justify-end' : 'bg-gray-800 justify-start'}`}
                    >
                      <span className="w-4 h-4 bg-white rounded-full" />
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={waTplSubApproved}
                    onChange={e => setWaTplSubApproved(e.target.value)}
                    placeholder="Enter message template..."
                    className="w-full bg-[#0d1220] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                  />
                  <p className="text-[9px] text-gray-600 leading-normal">
                    {"Supported tags: {display_name}, {amount}, {plan}, {end_date}"}
                  </p>
                </div>
              </details>

              {/* Template 4: Subscription Rejected */}
              <details className="group border border-gray-800/80 rounded-2xl p-4 bg-[#11162a]/95 open:border-emerald-500/30 transition-all">
                <summary className="flex items-center justify-between font-bold text-xs text-gray-300 cursor-pointer list-none select-none">
                  <span>Subscription Refused Notice</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${waTriggerSubRejected ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                    <span className="text-[10px] text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                  </div>
                </summary>
                <div className="pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">Trigger Alert</span>
                    <button
                      onClick={() => setWaTriggerSubRejected(!waTriggerSubRejected)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors flex ${waTriggerSubRejected ? 'bg-emerald-500 justify-end' : 'bg-gray-800 justify-start'}`}
                    >
                      <span className="w-4 h-4 bg-white rounded-full" />
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={waTplSubRejected}
                    onChange={e => setWaTplSubRejected(e.target.value)}
                    placeholder="Enter message template..."
                    className="w-full bg-[#0d1220] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                  />
                  <p className="text-[9px] text-gray-600 leading-normal">
                    {"Supported tags: {display_name}, {amount}, {plan}, {reason}"}
                  </p>
                </div>
              </details>

              {/* Template 5: Subscription Expiring */}
              <details className="group border border-gray-800/80 rounded-2xl p-4 bg-[#11162a]/95 open:border-emerald-500/30 transition-all">
                <summary className="flex items-center justify-between font-bold text-xs text-gray-300 cursor-pointer list-none select-none">
                  <span>Subscription Expiration Alert</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${waTriggerSubExpiring ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                    <span className="text-[10px] text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                  </div>
                </summary>
                <div className="pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">Trigger Alert</span>
                    <button
                      onClick={() => setWaTriggerSubExpiring(!waTriggerSubExpiring)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors flex ${waTriggerSubExpiring ? 'bg-emerald-500 justify-end' : 'bg-gray-800 justify-start'}`}
                    >
                      <span className="w-4 h-4 bg-white rounded-full" />
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={waTplSubExpiring}
                    onChange={e => setWaTplSubExpiring(e.target.value)}
                    placeholder="Enter message template..."
                    className="w-full bg-[#0d1220] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                  />
                  <p className="text-[9px] text-gray-600 leading-normal">
                    {"Supported tags: {display_name}, {days_remaining}"}
                  </p>
                </div>
              </details>

              {/* Template 6: Coach Suspended */}
              <details className="group border border-gray-800/80 rounded-2xl p-4 bg-[#11162a]/95 open:border-emerald-500/30 transition-all">
                <summary className="flex items-center justify-between font-bold text-xs text-gray-300 cursor-pointer list-none select-none">
                  <span>Coach Suspension Notice</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${waTriggerCoachSuspended ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                    <span className="text-[10px] text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                  </div>
                </summary>
                <div className="pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">Trigger Alert</span>
                    <button
                      onClick={() => setWaTriggerCoachSuspended(!waTriggerCoachSuspended)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors flex ${waTriggerCoachSuspended ? 'bg-emerald-500 justify-end' : 'bg-gray-800 justify-start'}`}
                    >
                      <span className="w-4 h-4 bg-white rounded-full" />
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={waTplCoachSuspended}
                    onChange={e => setWaTplCoachSuspended(e.target.value)}
                    placeholder="Enter message template..."
                    className="w-full bg-[#0d1220] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                  />
                  <p className="text-[9px] text-gray-600 leading-normal">
                    {"Supported tags: {display_name}"}
                  </p>
                </div>
              </details>

              {/* Template 7: Client Suspended */}
              <details className="group border border-gray-800/80 rounded-2xl p-4 bg-[#11162a]/95 open:border-emerald-500/30 transition-all">
                <summary className="flex items-center justify-between font-bold text-xs text-gray-300 cursor-pointer list-none select-none">
                  <span>Athlete Suspension Notice</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${waTriggerClientSuspended ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                    <span className="text-[10px] text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                  </div>
                </summary>
                <div className="pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">Trigger Alert</span>
                    <button
                      onClick={() => setWaTriggerClientSuspended(!waTriggerClientSuspended)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors flex ${waTriggerClientSuspended ? 'bg-emerald-500 justify-end' : 'bg-gray-800 justify-start'}`}
                    >
                      <span className="w-4 h-4 bg-white rounded-full" />
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={waTplClientSuspended}
                    onChange={e => setWaTplClientSuspended(e.target.value)}
                    placeholder="Enter message template..."
                    className="w-full bg-[#0d1220] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                  />
                  <p className="text-[9px] text-gray-600 leading-normal">
                    {"Supported tags: {display_name}, {coach_name}, {coach_phone}"}
                  </p>
                </div>
              </details>

              {/* Template 8: Client Reactivated */}
              <details className="group border border-gray-800/80 rounded-2xl p-4 bg-[#11162a]/95 open:border-emerald-500/30 transition-all">
                <summary className="flex items-center justify-between font-bold text-xs text-gray-300 cursor-pointer list-none select-none">
                  <span>Athlete Reactivated Welcome-Back</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${waTriggerClientReactivated ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                    <span className="text-[10px] text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                  </div>
                </summary>
                <div className="pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">Trigger Alert</span>
                    <button
                      onClick={() => setWaTriggerClientReactivated(!waTriggerClientReactivated)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors flex ${waTriggerClientReactivated ? 'bg-emerald-500 justify-end' : 'bg-gray-800 justify-start'}`}
                    >
                      <span className="w-4 h-4 bg-white rounded-full" />
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={waTplClientReactivated}
                    onChange={e => setWaTplClientReactivated(e.target.value)}
                    placeholder="Enter message template..."
                    className="w-full bg-[#0d1220] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                  />
                  <p className="text-[9px] text-gray-600 leading-normal">
                    {"Supported tags: {display_name}"}
                  </p>
                </div>
              </details>

              {/* Template 9: Coach Reactivated */}
              <details className="group border border-gray-800/80 rounded-2xl p-4 bg-[#11162a]/95 open:border-emerald-500/30 transition-all">
                <summary className="flex items-center justify-between font-bold text-xs text-gray-300 cursor-pointer list-none select-none">
                  <span>Coach Reactivated Receipt</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${waTriggerCoachReactivated ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                    <span className="text-[10px] text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                  </div>
                </summary>
                <div className="pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">Trigger Alert</span>
                    <button
                      onClick={() => setWaTriggerCoachReactivated(!waTriggerCoachReactivated)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors flex ${waTriggerCoachReactivated ? 'bg-emerald-500 justify-end' : 'bg-gray-800 justify-start'}`}
                    >
                      <span className="w-4 h-4 bg-white rounded-full" />
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={waTplCoachReactivated}
                    onChange={e => setWaTplCoachReactivated(e.target.value)}
                    placeholder="Enter message template..."
                    className="w-full bg-[#0d1220] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                  />
                  <p className="text-[9px] text-gray-600 leading-normal">
                    {"Supported tags: {display_name}, {plan}, {start_date}, {end_date}"}
                  </p>
                </div>
              </details>
            </div>

            {/* Save Settings Button */}
            <div className="pt-2">
              <button
                disabled={savingSettings}
                onClick={handleSaveWhatsappSettings}
                className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-emerald-600/15 cursor-pointer disabled:opacity-50"
              >
                <Save size={14} /> {savingSettings ? 'Saving Settings...' : 'Save WhatsApp Configurations'}
              </button>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
