import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, supabaseAdmin } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import {
  Lock, ArrowLeft, RefreshCw, ShieldAlert, Sparkle
} from 'lucide-react';

const getLocalDateString = (d: Date = new Date()) => {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
};

export default function OwnerDashboardPage() {
  const navigate = useNavigate();

  // Auth
  const [passcode, setPasscode] = useState('');
  const [isAuthed, setIsAuthed] = useState(() => sessionStorage.getItem('owner_dashboard_authed') === 'true');
  const [shake, setShake] = useState(false);

  // Data
  const [profiles, setProfiles] = useState<any[]>([]);
  const [clientProfiles, setClientProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [coachUserId, setCoachUserId] = useState<string | null>(null);

  // Toggles
  const [disableWorkoutTemplatesToggle, setDisableWorkoutTemplatesToggle] = useState(false);
  const [disableNutritionTargetsToggle, setDisableNutritionTargetsToggle] = useState(false);

  const fetchBaseData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCoachUserId(session.user.id);
      }

      // Fetch Haleem's toggles
      const { data: ownerProfile } = await supabaseAdmin.from('profiles').select('targets').eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c').maybeSingle();
      if (ownerProfile?.targets) {
        setDisableWorkoutTemplatesToggle(!!ownerProfile.targets.disable_workout_templates);
        setDisableNutritionTargetsToggle(!!ownerProfile.targets.disable_nutrition_targets);
      }

      // Fetch all client profiles (for ages)
      const { data: cProfs } = await supabaseAdmin.from('client_profiles').select('*');
      if (cProfs) {
        setClientProfiles(cProfs);
      }

      // Fetch profiles
      const { data: userProfiles } = await supabaseAdmin.from('profiles').select('*').order('display_name');
      if (userProfiles) {
        setProfiles(userProfiles);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error loading admin data');
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

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '425336') {
      sessionStorage.setItem('owner_dashboard_authed', 'true');
      setIsAuthed(true);
      toast.success('Welcome Owner Haleem! 👑');
    } else {
      setShake(true);
      toast.error('Wrong passcode');
      setPasscode('');
      setTimeout(() => setShake(false), 600);
    }
  };

  const handleToggleWorkoutTemplates = async (checked: boolean) => {
    try {
      const { data: ownerProfile } = await supabaseAdmin.from('profiles').select('targets').eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c').maybeSingle();
      const updatedTargets = {
        ...(ownerProfile?.targets || {}),
        disable_workout_templates: checked
      };
      const { error } = await supabaseAdmin.from('profiles').update({ targets: updatedTargets }).eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c');
      if (error) throw error;
      setDisableWorkoutTemplatesToggle(checked);
      toast.success(checked ? 'Workout templates hidden for clients!' : 'Workout templates enabled for clients!');
    } catch (err: any) {
      toast.error('Failed to update: ' + err.message);
    }
  };

  const handleToggleNutritionTargets = async (checked: boolean) => {
    try {
      const { data: ownerProfile } = await supabaseAdmin.from('profiles').select('targets').eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c').maybeSingle();
      const updatedTargets = {
        ...(ownerProfile?.targets || {}),
        disable_nutrition_targets: checked
      };
      const { error } = await supabaseAdmin.from('profiles').update({ targets: updatedTargets }).eq('id', 'ef685819-cdb3-4cd7-811d-4e6f7fff423c');
      if (error) throw error;
      setDisableNutritionTargetsToggle(checked);
      toast.success(checked ? 'Nutrition targets settings hidden for clients!' : 'Nutrition targets settings enabled for clients!');
    } catch (err: any) {
      toast.error('Failed to update: ' + err.message);
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

  // Force guard that only Haleem's logged in user can view this page content
  if (coachUserId && coachUserId !== 'ef685819-cdb3-4cd7-811d-4e6f7fff423c') {
    return (
      <div className="p-8 text-center space-y-4">
        <ShieldAlert size={48} className="text-red-500 mx-auto" />
        <h1 className="text-xl font-bold text-white">Access Denied</h1>
        <p className="text-gray-400 text-xs">Only the system owner has authorization to view this panel.</p>
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
    </div>
  );
}
