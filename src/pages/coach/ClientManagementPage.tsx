import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Card } from '../../components/Card';
import { DumbbellLoader } from '../../components/DumbbellLoader';
import { 
  ChevronLeft, Key, Trash2, Calendar, Scale, Ruler, 
  Droplets, Dumbbell, Clipboard, Lock, Sparkles, User, UserCheck,
  Phone, TrendingUp, Zap, ChevronRight, Save
} from 'lucide-react';

const getMuscleColor = (muscle: string) => {
  const m = muscle?.toLowerCase() || '';
  if (m.includes('chest')) return { border: 'border-l-red-500', badge: 'bg-red-500/15 text-red-400 border-red-500/30', dot: 'bg-red-500' };
  if (m.includes('back')) return { border: 'border-l-blue-500', badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30', dot: 'bg-blue-500' };
  if (m.includes('shoulder') || m.includes('delt')) return { border: 'border-l-purple-500', badge: 'bg-purple-500/15 text-purple-400 border-purple-500/30', dot: 'bg-purple-500' };
  if (m.includes('quad') || m.includes('ham') || m.includes('leg') || m.includes('glute') || m.includes('calf')) return { border: 'border-l-yellow-500', badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-500' };
  if (m.includes('bicep') || m.includes('tricep') || m.includes('arm')) return { border: 'border-l-emerald-500', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-500' };
  return { border: 'border-l-gray-500', badge: 'bg-gray-500/15 text-gray-400 border-gray-500/30', dot: 'bg-gray-500' };
};

export default function ClientManagementPage() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  
  // Data States
  const [client, setClient] = useState<any>(null);
  const [workoutDays, setWorkoutDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [latestWeight, setLatestWeight] = useState<number | null>(null);

  // Form States
  const [newPassword, setNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [aiQuotaInput, setAiQuotaInput] = useState<number>(20);
  const [updatingQuota, setUpdatingQuota] = useState(false);
  const [updatingSuspension, setUpdatingSuspension] = useState(false);
  
  // Workout tab state
  const [activeDay, setActiveDay] = useState(0);

  useEffect(() => {
    if (clientId) {
      fetchClientDetails();
    }
  }, [clientId]);

  // ─── REAL-TIME SUBSCRIPTION ───────────────────────────────
  useEffect(() => {
    if (!clientId) return;

    const channel = supabase
      .channel(`client-mgmt-${clientId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_workout_plans', filter: `user_id=eq.${clientId}` }, () => {
        fetchClientDetails();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${clientId}` }, () => {
        fetchClientDetails();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'client_profiles', filter: `user_id=eq.${clientId}` }, () => {
        fetchClientDetails();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inbody_scans', filter: `user_id=eq.${clientId}` }, () => {
        fetchClientDetails();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId]);

  const fetchClientDetails = async () => {
    try {
      setLoading(true);
      const { data: clientProfile, error: profileErr } = await supabase
        .from('client_profiles')
        .select(`
          *,
          user:profiles!client_profiles_user_id_fkey(id, username, email, display_name, targets, created_at)
        `)
        .eq('user_id', clientId)
        .single();

      if (profileErr || !clientProfile) {
        console.error('Error fetching client profile:', profileErr);
        toast.error('Client profile not found');
        navigate('/coach/clients');
        return;
      }

      setClient(clientProfile);

      const limit = typeof clientProfile.user?.targets?.ai_quota_limit === 'number'
        ? clientProfile.user.targets.ai_quota_limit
        : 20;
      setAiQuotaInput(limit);

      // Fetch latest weight from scans
      const { data: scans } = await supabase
        .from('inbody_scans')
        .select('weight')
        .eq('user_id', clientId)
        .order('date', { ascending: false })
        .limit(1);

      if (scans && scans.length > 0) {
        setLatestWeight(scans[0].weight);
      } else {
        setLatestWeight(null);
      }

      // Fetch workout plans from user_workout_plans (written by DashboardPage / coach hub)
      const { data: plans } = await supabase
        .from('user_workout_plans')
        .select('*')
        .eq('user_id', clientId)
        .order('created_at', { ascending: true });

      // Normalise to the shape the UI expects
      const normalisedDays = (plans || []).map((p: any, idx: number) => ({
        id: p.id,
        day_number: idx + 1,
        day_name: p.plan_type + ' Day',
        exercises: (p.exercises || []).map((ex: any) => ({
          ...ex,
          reps_min: ex.reps_min ?? 8,
          reps_max: ex.reps_max ?? 12,
        })),
        nutrition: p.nutrition || null,
      }));

      setWorkoutDays(normalisedDays);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load client information.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.trim().length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setUpdatingPassword(true);
    try {
      const { data: { session: coachSession } } = await supabase.auth.getSession();
      if (!coachSession) throw new Error('COACH AUTH REQUIRED');

      const updateRes = await fetch('/api/update-user-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${coachSession.access_token}`
        },
        body: JSON.stringify({
          uid: client.user_id,
          password: newPassword.trim()
        })
      });

      if (!updateRes.ok) {
        const errData = await updateRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to update client password');
      }

      const { error: dbErr } = await supabase
        .from('client_profiles')
        .update({ generated_passcode: newPassword.trim() })
        .eq('user_id', client.user_id);
      if (dbErr) throw dbErr;

      toast.success('Password updated successfully!');
      setNewPassword('');
      fetchClientDetails();
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to update client password. Please try again.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleSaveAiQuota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (aiQuotaInput < 0) {
      toast.error('Quota limit cannot be negative.');
      return;
    }
    setUpdatingQuota(true);
    try {
      const currentTargets = client.user?.targets || {};
      const updatedTargets = {
        ...currentTargets,
        ai_quota_limit: aiQuotaInput
      };

      const { error } = await supabase
        .from('profiles')
        .update({ targets: updatedTargets })
        .eq('id', client.user_id);

      if (error) throw error;

      toast.success('AI message quota updated successfully!');
      fetchClientDetails();
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to update AI quota. Please try again.');
    } finally {
      setUpdatingQuota(false);
    }
  };

  const handleToggleSuspension = async () => {
    const isSuspended = client.user?.targets?.is_deactivated === true;
    const confirmMsg = isSuspended
      ? `Are you sure you want to reactivate ${client.user?.display_name || 'this client'}'s account?`
      : `Are you sure you want to suspend ${client.user?.display_name || 'this client'}'s account? They will lose access to the app immediately.`;
      
    if (!window.confirm(confirmMsg)) return;

    setUpdatingSuspension(true);
    try {
      const currentTargets = client.user?.targets || {};
      const updatedTargets = {
        ...currentTargets,
        is_deactivated: !isSuspended
      };

      const { error } = await supabase
        .from('profiles')
        .update({ targets: updatedTargets })
        .eq('id', client.user_id);

      if (error) throw error;

      toast.success(isSuspended ? 'Account reactivated successfully!' : 'Account suspended successfully!');
      fetchClientDetails();
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to update suspension status. Please try again.');
    } finally {
      setUpdatingSuspension(false);
    }
  };

  const handleDeleteClient = async () => {
    const confirmName = window.prompt(
      `WARNING: This action is permanent and will completely delete the client account, including workouts, diet targets, composition history, and log records. \n\nType the client's name "${client.user?.display_name}" to confirm deletion:`
    );

    if (confirmName !== client.user?.display_name) {
      if (confirmName !== null) {
        toast.error('Name did not match. Deletion cancelled.');
      }
      return;
    }

    setDeleting(true);
    try {
      const uid = client.user_id;

      const { data: { session: coachSession } } = await supabase.auth.getSession();
      if (!coachSession) throw new Error('COACH AUTH REQUIRED');

      const deleteRes = await fetch('/api/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${coachSession.access_token}`
        },
        body: JSON.stringify({ uid })
      });

      if (!deleteRes.ok) {
        const errData = await deleteRes.json().catch(() => ({}));
        console.warn('Auth user delete warning:', errData.error || 'Failed');
      }

      await supabase.from('inbody_scans').delete().eq('user_id', uid);
      await supabase.from('client_workout_days').delete().eq('user_id', uid);
      await supabase.from('user_workout_plans').delete().eq('user_id', uid);
      await supabase.from('progress_notes').delete().eq('user_id', uid);
      await supabase.from('water_logs').delete().eq('user_id', uid);
      await supabase.from('client_profiles').delete().eq('user_id', uid);
      await supabase.from('profiles').delete().eq('id', uid);

      toast.success('Client deleted successfully');
      navigate('/coach/clients');
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to delete client account. Please check your connection.');
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyCredentials = () => {
    const text = `Life Gym Access Details:\nClient Code: #${client.user?.targets?.client_code || 'N/A'}\nUsername: ${client.user?.username}\nPassword: ${client.generated_passcode}`;
    navigator.clipboard.writeText(text);
    toast.success('Copied client credentials to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#060610]">
        <DumbbellLoader label="Loading client files..." size={100} />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#060610] p-4 text-center">
        <p className="text-red-400 font-bold mb-4">Client file not found</p>
        <Link to="/coach/clients" className="bg-gray-800 border border-gray-700 px-4 py-2 rounded-lg text-white font-bold">
          Back to Clients
        </Link>
      </div>
    );
  }

  const currentDay = workoutDays[activeDay];

  return (
    <div className="min-h-screen bg-[#060610] text-gray-100 font-sans pb-20">
      {/* Top Navbar */}
      <div className="p-4 border-b border-gray-800 bg-[#060610]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        <Link 
          to="/coach/clients" 
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors py-1.5 px-3 rounded-lg bg-gray-900/60 border border-gray-800"
        >
          <ChevronLeft size={14} /> Back
        </Link>
        <span className="text-xs font-black text-blue-400 uppercase tracking-widest">
          Client Profile Manager
        </span>
        <div className="w-16" />
      </div>

      {/* Main Container */}
      <div className="max-w-[390px] mx-auto p-4 space-y-4">

        {/* Client Header Card */}
        <div className="bg-gradient-to-br from-blue-950/80 to-slate-900 border border-blue-900/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none" />
          <div className="flex items-start justify-between">
            <div className="flex gap-3.5 items-center">
              <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-xl flex items-center justify-center shadow-lg font-black text-lg uppercase select-none">
                {client.user?.display_name?.charAt(0) || '?'}
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-1.5">
                  {client.user?.display_name || 'Unnamed Client'}
                  {client.user?.targets?.client_code && (
                    <span className="text-[10px] bg-blue-500/20 border border-blue-500/30 text-blue-400 px-1.5 py-0.5 rounded font-black tracking-normal">
                      #{client.user.targets.client_code}
                    </span>
                  )}
                </h1>
                <p className="text-xs text-gray-400 mt-0.5 font-medium">@{client.user?.username || 'no-username'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5 border-t border-gray-800/60 pt-4 text-xs">
            <div>
              <p className="text-gray-500 font-semibold flex items-center gap-1"><Calendar size={10} /> Joined</p>
              <p className="text-gray-200 font-bold mt-1">{new Date(client.user?.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-gray-500 font-semibold flex items-center gap-1"><UserCheck size={10} /> Passcode</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="font-mono text-yellow-400 font-black tracking-wider">{client.generated_passcode}</span>
                <button 
                  onClick={handleCopyCredentials} 
                  className="text-gray-400 hover:text-white p-0.5 rounded bg-gray-800/80 border border-gray-700 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title="Copy Access Credentials"
                >
                  <Clipboard size={10} />
                </button>
              </div>
            </div>
            <div>
              <p className="text-gray-500 font-semibold flex items-center gap-1"><Phone size={10} /> Phone</p>
              <button 
                onClick={() => {
                  const phone = client.user?.targets?.phone_number || '';
                  if (phone) {
                    navigator.clipboard.writeText(phone);
                    toast.success('Copied phone number!');
                  }
                }}
                className="text-blue-400 hover:text-blue-300 font-bold mt-1 text-left cursor-pointer transition-colors block font-mono text-[11px]"
                title="Click to copy"
              >
                {client.user?.targets?.phone_number || 'Not set'}
              </button>
            </div>
          </div>
        </div>

        {/* Biometrics Card */}
        <Card className="p-5 space-y-4">
          <h2 className="text-sm font-extrabold text-white border-b border-gray-800 pb-2 uppercase tracking-wider flex items-center gap-2">
            <User className="text-blue-500 w-4 h-4" /> Deployed Biometrics
          </h2>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-[#181d29] p-2.5 rounded-xl border border-gray-800">
              <p className="text-[9px] text-gray-500 uppercase font-bold flex justify-center items-center gap-0.5"><Scale size={9} /> Wt</p>
              <p className="text-white font-extrabold text-xs mt-1">{latestWeight ? `${latestWeight}` : 'N/A'}<span className="text-gray-500 text-[9px]">kg</span></p>
            </div>
            <div className="bg-[#181d29] p-2.5 rounded-xl border border-gray-800">
              <p className="text-[9px] text-gray-500 uppercase font-bold flex justify-center items-center gap-0.5"><Ruler size={9} /> Ht</p>
              <p className="text-white font-extrabold text-xs mt-1">{client.height ? `${client.height}` : 'N/A'}<span className="text-gray-500 text-[9px]">cm</span></p>
            </div>
            <div className="bg-[#181d29] p-2.5 rounded-xl border border-gray-800">
              <p className="text-[9px] text-gray-500 uppercase font-bold flex justify-center items-center gap-0.5"><User size={9} /> Age</p>
              <p className="text-white font-extrabold text-xs mt-1">{client.age ? `${client.age}` : 'N/A'}<span className="text-gray-500 text-[9px]">yr</span></p>
            </div>
            <div className="bg-[#181d29] p-2.5 rounded-xl border border-gray-800">
              <p className="text-[9px] text-gray-500 uppercase font-bold">Sex</p>
              <p className="text-white font-extrabold text-[11px] mt-1 capitalize">{client.user?.targets?.gender?.charAt(0)?.toUpperCase() || 'N/A'}</p>
            </div>
          </div>

          <div className="space-y-3 text-xs border-t border-gray-800 pt-3">
            <div>
              <p className="text-gray-500 font-bold uppercase tracking-wider text-[9px]">Experience Level</p>
              <span className="inline-block bg-blue-950/60 border border-blue-800/30 text-blue-400 px-2 py-0.5 rounded font-black text-[10px] mt-1 select-none uppercase">
                {client.experience_level || 'Beginner'}
              </span>
            </div>
            <div>
              <p className="text-gray-500 font-bold uppercase tracking-wider text-[9px]">Primary Goals</p>
              <p className="text-gray-300 font-semibold mt-1 leading-relaxed">{client.goals || 'No goals specified.'}</p>
            </div>
            {client.injuries_notes && (
              <div>
                <p className="text-red-400 font-bold uppercase tracking-wider text-[9px]">Injuries &amp; Restrictions</p>
                <p className="text-red-300 font-medium mt-1 leading-relaxed bg-red-950/20 border border-red-900/30 p-2.5 rounded-lg">{client.injuries_notes}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Water Intake */}
        <Card className="p-4 flex items-center gap-4 border border-gray-800/80 bg-[#121620]/60">
          <div className="w-11 h-11 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl flex items-center justify-center shrink-0">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Daily Water Target</p>
            <p className="text-white font-extrabold text-2xl mt-0.5">
              {((client.user?.targets?.water_goal_ml || 3500) / 1000).toFixed(1)}<span className="text-base text-sky-400 font-black ml-1">L</span>
            </p>
          </div>
        </Card>

        {/* ── TRAINING SCHEDULE ── */}
        <div className="bg-[#0d1017] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-4 pb-3 flex items-center justify-between border-b border-gray-800/60">
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Dumbbell className="text-purple-400 w-4 h-4" /> Training Schedule
            </h2>
            <span className="text-[10px] text-gray-500 font-bold">{workoutDays.length} days</span>
          </div>

          {workoutDays.length === 0 ? (
            <p className="text-xs text-gray-500 italic text-center py-8">No workout splits assigned yet.</p>
          ) : (
            <>
              {/* Day Tab Selector */}
              <div className="flex overflow-x-auto gap-2 p-3 pb-0 scrollbar-hide">
                {workoutDays.map((day, idx) => (
                  <button
                    key={day.id}
                    onClick={() => setActiveDay(idx)}
                    className={`flex-shrink-0 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                      activeDay === idx
                        ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/30'
                        : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:text-gray-200 hover:border-gray-700'
                    }`}
                  >
                    <span className="block text-[8px] font-bold opacity-70">DAY {day.day_number}</span>
                    {day.day_name?.replace(' Day', '') || `Day ${day.day_number}`}
                  </button>
                ))}
              </div>

              {/* Active Day Content */}
              {currentDay && (() => {
                const splitKey = currentDay.day_name.replace(' Day', '').toUpperCase();
                const dayNutrition = client.user?.targets?.day_nutrition?.[splitKey] || {
                  kcal: client.user?.targets?.kcal,
                  protein: client.user?.targets?.protein,
                  carbs: client.user?.targets?.carbs,
                  fat: client.user?.targets?.fat
                };
                return (
                  <div className="p-3 pt-3 space-y-3">
                    {/* Macro Bar */}
                    <div className="flex gap-1.5 flex-wrap">
                      <span className="bg-blue-950/60 border border-blue-900/40 text-blue-300 text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Zap size={9} /> {dayNutrition.kcal || '—'} kcal
                      </span>
                      <span className="bg-emerald-950/60 border border-emerald-900/40 text-emerald-300 text-[10px] font-black px-2.5 py-1 rounded-lg">
                        P {dayNutrition.protein || '—'}g
                      </span>
                      <span className="bg-amber-950/60 border border-amber-900/40 text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-lg">
                        C {dayNutrition.carbs || '—'}g
                      </span>
                      <span className="bg-red-950/60 border border-red-900/40 text-red-300 text-[10px] font-black px-2.5 py-1 rounded-lg">
                        F {dayNutrition.fat || '—'}g
                      </span>
                    </div>

                    {/* Exercises */}
                    {(!currentDay.exercises || currentDay.exercises.length === 0) ? (
                      <p className="text-[10px] text-gray-500 italic text-center py-4">No exercises added to this split.</p>
                    ) : (
                      <div className="space-y-2">
                        {currentDay.exercises.map((ex: any, idx: number) => {
                          const colors = getMuscleColor(ex.muscle_group);
                          return (
                            <div key={idx} className={`flex items-center gap-3 bg-[#181d29] border border-gray-800/80 border-l-4 ${colors.border} rounded-xl p-3`}>
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-extrabold text-xs leading-snug">{ex.name}</p>
                                {ex.muscle_group && (
                                  <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border mt-1 ${colors.badge}`}>
                                    {ex.muscle_group}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <div className="text-center bg-gray-900/80 border border-gray-800 rounded-lg px-2 py-1.5">
                                  <p className="text-[7px] text-gray-500 uppercase font-bold">Sets</p>
                                  <p className="text-gray-100 font-black text-[11px] mt-0.5">{ex.sets}</p>
                                </div>
                                <div className="text-center bg-gray-900/80 border border-gray-800 rounded-lg px-2 py-1.5">
                                  <p className="text-[7px] text-gray-500 uppercase font-bold">Reps</p>
                                  <p className="text-gray-100 font-black text-[11px] mt-0.5">{ex.reps_min || 8}–{ex.reps_max || 12}</p>
                                </div>
                                <div className="text-center bg-gray-900/80 border border-gray-800 rounded-lg px-2 py-1.5">
                                  <p className="text-[7px] text-gray-500 uppercase font-bold">Rest</p>
                                  <p className="text-gray-100 font-black text-[11px] mt-0.5">{ex.rest || 120}s</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}
            </>
          )}
        </div>

        {/* Change Password Card */}
        <Card className="p-5 space-y-4">
          <h2 className="text-sm font-extrabold text-white border-b border-gray-800 pb-2 uppercase tracking-wider flex items-center gap-2">
            <Lock className="text-yellow-500 w-4 h-4" /> Change Password
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">New Client Password</label>
              <input 
                type="text"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter at least 6 characters"
                className="w-full bg-[#181d29] border border-gray-800 rounded-xl py-3 px-4 text-white text-xs outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              disabled={updatingPassword}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-blue-500/10 transition-all active:scale-[0.98] cursor-pointer mt-1 flex items-center justify-center gap-1.5"
            >
              {updatingPassword ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Key size={13} /> Update Password
                </>
              )}
            </button>
          </form>
        </Card>

        {/* AI Quota & Usage Card */}
        <Card className="p-5 space-y-4">
          <h2 className="text-sm font-extrabold text-white border-b border-gray-800 pb-2 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="text-blue-500 w-4 h-4" /> AI Coach Quota
          </h2>
          
          {/* Usage Metrics */}
          {(() => {
            const limit = client.user?.targets?.ai_quota_limit ?? 20;
            const usage = client.user?.targets?.ai_usage || { date: '', count: 0 };
            const todayStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
            const activeUsage = usage.date === todayStr ? usage.count : 0;
            const pct = Math.min((activeUsage / limit) * 100, 100);

            return (
              <div className="space-y-3.5">
                <div className="bg-[#181d29] border border-gray-800 rounded-xl p-3.5 flex justify-between items-center text-xs">
                  <div>
                    <p className="text-gray-500 font-bold uppercase tracking-wider text-[9px]">Today's AI Usage</p>
                    <p className="text-white font-extrabold text-base mt-0.5">{activeUsage} <span className="text-gray-500 text-xs font-normal">/ {limit} messages</span></p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-black text-blue-400 text-xs shadow-lg">
                    {Math.round(pct)}%
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })()}

          {/* Edit Form */}
          <form onSubmit={handleSaveAiQuota} className="space-y-3 pt-1">
            <div className="space-y-1">
              <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Daily Message Limit</label>
              <input 
                type="number"
                min="0"
                max="1000"
                value={aiQuotaInput}
                onChange={e => setAiQuotaInput(parseInt(e.target.value) || 0)}
                className="w-full bg-[#181d29] border border-gray-800 rounded-xl py-3 px-4 text-white text-xs outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              disabled={updatingQuota}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-blue-500/10 transition-all active:scale-[0.98] cursor-pointer mt-1 flex items-center justify-center gap-1.5"
            >
              {updatingQuota ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={13} /> Update Quota
                </>
              )}
            </button>
          </form>
        </Card>

        {/* Account Status Card */}
        <Card className="p-5 space-y-4">
          <h2 className="text-sm font-extrabold text-white border-b border-gray-800 pb-2 uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="text-emerald-500 w-4 h-4" /> Account Status
          </h2>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Current Status</p>
              <p className={`font-extrabold text-sm mt-0.5 ${client.user?.targets?.is_deactivated === true ? 'text-red-400' : 'text-emerald-400'}`}>
                {client.user?.targets?.is_deactivated === true ? '🔴 Suspended' : '🟢 Active'}
              </p>
            </div>
            
            <button
              onClick={handleToggleSuspension}
              disabled={updatingSuspension}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] disabled:bg-gray-800 disabled:text-gray-500 cursor-pointer border ${
                client.user?.targets?.is_deactivated === true
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/20'
                  : 'bg-red-600 hover:bg-red-500 text-white border-red-500/20'
              }`}
            >
              {updatingSuspension ? 'Updating...' : (client.user?.targets?.is_deactivated === true ? 'Reactivate Client' : 'Suspend Client')}
            </button>
          </div>

          {/* Auto Suspend Date */}
          <div className="border-t border-gray-800/60 pt-4 space-y-2">
            <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Auto-Suspend Date</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={client.user?.targets?.auto_suspend_date || ''}
                onChange={async (e) => {
                  const newDate = e.target.value || null;
                  try {
                    const currentTargets = client.user?.targets || {};
                    const updatedTargets = {
                      ...currentTargets,
                      auto_suspend_date: newDate
                    };

                    const { error } = await supabase
                      .from('profiles')
                      .update({ targets: updatedTargets })
                      .eq('id', client.user_id);

                    if (error) throw error;
                    toast.success(newDate ? `Auto-suspend set for ${newDate}` : 'Auto-suspend date removed');
                    fetchClientDetails();
                  } catch (err: any) {
                    console.error(err);
                    toast.error('Failed to update auto-suspend date.');
                  }
                }}
                className="flex-1 bg-[#181d29] border border-gray-800 rounded-xl py-3 px-4 text-white text-xs outline-none focus:border-blue-500 transition-colors"
              />
              {client.user?.targets?.auto_suspend_date && (
                <button
                  onClick={async () => {
                    try {
                      const currentTargets = client.user?.targets || {};
                      const updatedTargets = { ...currentTargets };
                      delete updatedTargets.auto_suspend_date;

                      const { error } = await supabase
                        .from('profiles')
                        .update({ targets: updatedTargets })
                        .eq('id', client.user_id);

                      if (error) throw error;
                      toast.success('Auto-suspend date cleared');
                      fetchClientDetails();
                    } catch (err: any) {
                      console.error(err);
                      toast.error('Failed to clear auto-suspend date.');
                    }
                  }}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            {client.user?.targets?.auto_suspend_date && (
              <p className="text-[10px] text-yellow-500 font-medium leading-relaxed">
                ⚠️ Account will automatically suspend on {client.user.targets.auto_suspend_date} at local time 00:00.
              </p>
            )}
          </div>
        </Card>

        {/* InBody Scan Records */}
        <div className="bg-[#0d1017] border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 pb-3 border-b border-gray-800/60 flex items-center gap-2">
            <TrendingUp className="text-emerald-400 w-4 h-4" />
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">Composition History</h2>
          </div>
          <div className="p-4">
            <InBodyHistory clientId={clientId} />
          </div>
        </div>

        {/* Coach Progress Notes */}
        <div className="bg-[#121620]/60 border border-gray-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h2 className="text-sm font-extrabold text-white border-b border-gray-800 pb-2 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="text-blue-400 w-4 h-4" /> Coach Notes
          </h2>
          <ProgressNotes clientId={clientId} coachId={client.coach_id} />
        </div>

        {/* Danger Zone */}
        <div className="bg-red-950/20 border border-red-900/30 rounded-2xl p-5 shadow-xl space-y-4">
          <h2 className="text-sm font-extrabold text-red-400 border-b border-red-950 pb-2 uppercase tracking-wider flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-red-500" /> Danger Zone
          </h2>
          <p className="text-xs text-red-300/80 leading-relaxed">
            Deleting this client will immediately terminate their active account and wipe all history (InBody, water, workouts, notes) from the system. This cannot be undone.
          </p>
          <button
            onClick={handleDeleteClient}
            disabled={deleting}
            className="w-full bg-red-600/90 hover:bg-red-500 text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-red-900/10 transition-all active:scale-[0.98] cursor-pointer mt-1 flex items-center justify-center gap-1.5"
          >
            {deleting ? 'Deleting client...' : (
              <>
                <Trash2 size={13} /> Delete Client Account
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── InBody History Component ────────────────────────────────────────────────
function InBodyHistory({ clientId }: any) {
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedScan, setExpandedScan] = useState<string | null>(null);

  useEffect(() => {
    const fetchScans = async () => {
      const { data } = await supabase
        .from('inbody_scans')
        .select('*')
        .eq('user_id', clientId)
        .order('date', { ascending: false });

      setScans(data || []);
      setLoading(false);
    };
    fetchScans();
  }, [clientId]);

  if (loading) return <DumbbellLoader label="Loading scans..." size={50} />;
  if (scans.length === 0) return <p className="text-xs text-gray-500 italic text-center py-4">No body composition records found.</p>;

  return (
    <div className="space-y-4">
      {scans.map(scan => {
        const isExpanded = expandedScan === scan.id;
        return (
          <div key={scan.id} className="bg-[#181d29] rounded-2xl border border-gray-800 overflow-hidden">
            {/* Scan Header */}
            <button
              onClick={() => setExpandedScan(isExpanded ? null : scan.id)}
              className="w-full text-left p-4 cursor-pointer hover:bg-gray-800/30 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-black text-white text-sm">
                    {new Date(scan.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  {scan.score || scan.inbody_score ? (
                    <span className="mt-1 inline-block bg-blue-950/80 border border-blue-900/40 text-blue-400 text-[10px] px-2 py-0.5 rounded font-black uppercase">
                      InBody Score: {scan.score || scan.inbody_score}
                    </span>
                  ) : null}
                </div>
                <ChevronRight size={14} className={`text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
              </div>

              {/* Quick Stats Row */}
              <div className="flex gap-3 mt-3 text-xs">
                <div className="flex-1 bg-gray-900/60 rounded-xl p-2.5 text-center">
                  <p className="text-[8px] text-gray-500 uppercase font-bold">Weight</p>
                  <p className="text-white font-black mt-0.5">{scan.weight || '—'}<span className="text-gray-500 text-[9px]">kg</span></p>
                </div>
                <div className="flex-1 bg-emerald-950/40 border border-emerald-900/30 rounded-xl p-2.5 text-center">
                  <p className="text-[8px] text-emerald-500 uppercase font-bold">Muscle</p>
                  <p className="text-emerald-300 font-black mt-0.5">{scan.smm || '—'}<span className="text-emerald-600 text-[9px]">kg</span></p>
                </div>
                <div className="flex-1 bg-red-950/40 border border-red-900/30 rounded-xl p-2.5 text-center">
                  <p className="text-[8px] text-red-500 uppercase font-bold">Body Fat</p>
                  <p className="text-red-300 font-black mt-0.5">{scan.bf_percent || '—'}<span className="text-red-600 text-[9px]">%</span></p>
                </div>
                <div className="flex-1 bg-blue-950/40 border border-blue-900/30 rounded-xl p-2.5 text-center">
                  <p className="text-[8px] text-blue-500 uppercase font-bold">BFM</p>
                  <p className="text-blue-300 font-black mt-0.5">{scan.bfm || '—'}<span className="text-blue-600 text-[9px]">kg</span></p>
                </div>
              </div>
            </button>

            {/* Expanded Full Readings */}
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-gray-800/60 pt-3 space-y-3">
                {/* Main Readings */}
                <p className="text-[9px] text-gray-500 uppercase font-black tracking-wider">Full Body Composition</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'BMR', value: scan.bmr ? `${scan.bmr} kcal` : null },
                    { label: 'Total Body Water', value: scan.segmental?.tbw ? `${scan.segmental.tbw} L` : null },
                    { label: 'Body Protein', value: scan.segmental?.protein ? `${scan.segmental.protein} kg` : null },
                    { label: 'Body Minerals', value: scan.segmental?.minerals ? `${scan.segmental.minerals} kg` : null },
                    { label: 'Visceral Fat', value: scan.segmental?.visceralFat ? `Level ${scan.segmental.visceralFat}` : null },
                    { label: 'Body Fat Mass', value: scan.bfm ? `${scan.bfm} kg` : null },
                  ].map(({ label, value }) => value ? (
                    <div key={label} className="bg-[#121620] p-2.5 rounded-xl border border-gray-800/60">
                      <p className="text-[8px] text-gray-500 uppercase font-black">{label}</p>
                      <p className="text-white font-extrabold text-xs mt-0.5">{value}</p>
                    </div>
                  ) : null)}
                </div>

                {/* Segmental Lean Analysis */}
                {(scan.segmental?.laLean || scan.segmental?.raLean || scan.segmental?.trunkLean || scan.segmental?.llLean || scan.segmental?.rlLean) && (
                  <>
                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-wider pt-1">Segmental Lean Analysis</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-[#121620] p-2.5 rounded-xl border border-gray-800 text-center">
                        <p className="text-[8px] text-gray-500 font-bold">Left Arm</p>
                        <p className="text-gray-200 font-extrabold text-[11px] mt-0.5">{scan.segmental?.laLean || '—'}<span className="text-gray-500 text-[8px]">kg</span></p>
                      </div>
                      <div className="bg-[#121620] p-2.5 rounded-xl border border-gray-800 text-center">
                        <p className="text-[8px] text-gray-500 font-bold">Trunk</p>
                        <p className="text-gray-200 font-extrabold text-[11px] mt-0.5">{scan.segmental?.trunkLean || '—'}<span className="text-gray-500 text-[8px]">kg</span></p>
                      </div>
                      <div className="bg-[#121620] p-2.5 rounded-xl border border-gray-800 text-center">
                        <p className="text-[8px] text-gray-500 font-bold">Right Arm</p>
                        <p className="text-gray-200 font-extrabold text-[11px] mt-0.5">{scan.segmental?.raLean || '—'}<span className="text-gray-500 text-[8px]">kg</span></p>
                      </div>
                      <div className="bg-[#121620] p-2.5 rounded-xl border border-gray-800 text-center">
                        <p className="text-[8px] text-gray-500 font-bold">Left Leg</p>
                        <p className="text-gray-200 font-extrabold text-[11px] mt-0.5">{scan.segmental?.llLean || '—'}<span className="text-gray-500 text-[8px]">kg</span></p>
                      </div>
                      <div className="bg-[#121620] p-2.5 rounded-xl border border-gray-800 text-center col-start-3">
                        <p className="text-[8px] text-gray-500 font-bold">Right Leg</p>
                        <p className="text-gray-200 font-extrabold text-[11px] mt-0.5">{scan.segmental?.rlLean || '—'}<span className="text-gray-500 text-[8px]">kg</span></p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Progress Notes Component ────────────────────────────────────────────────
function ProgressNotes({ clientId, coachId }: any) {
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      const { data } = await supabase
        .from('progress_notes')
        .select('*')
        .eq('user_id', clientId)
        .order('date', { ascending: false });

      setNotes(data || []);
    };
    fetchNotes();
  }, [clientId]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setAdding(true);

    const { error } = await supabase
      .from('progress_notes')
      .insert({
        user_id: clientId,
        coach_id: coachId,
        date: new Date().toISOString().split('T')[0],
        note: newNote.trim(),
        category: 'general'
      });

    if (!error) {
      setNewNote('');
      toast.success('Progress note saved');
      const { data } = await supabase
        .from('progress_notes')
        .select('*')
        .eq('user_id', clientId)
        .order('date', { ascending: false });
      setNotes(data || []);
    } else {
      toast.error('Unable to save coach note. Please try again.');
    }
    setAdding(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add training log notes..."
          className="flex-1 bg-[#181d29] border border-gray-800 rounded-xl py-3 px-4 text-white text-xs outline-none focus:border-blue-500 transition-colors"
          onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
        />
        <button
          onClick={handleAddNote}
          disabled={adding}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white font-extrabold text-xs px-4 py-3 rounded-xl transition-all active:scale-[0.98] cursor-pointer"
        >
          Add
        </button>
      </div>

      <div className="space-y-2.5">
        {notes.length === 0 ? (
          <p className="text-xs text-gray-500 italic text-center py-4">No logged notes for this athlete yet.</p>
        ) : (
          notes.map(note => (
            <div key={note.id} className="bg-[#181d29] p-3.5 rounded-xl border border-gray-800">
              <p className="text-gray-500 text-[9px] font-black uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar size={10} />
                {new Date(note.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <p className="text-gray-300 text-xs leading-relaxed font-medium">{note.note}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
