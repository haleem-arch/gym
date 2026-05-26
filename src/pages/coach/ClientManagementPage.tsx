import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabaseAdmin } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Card } from '../../components/Card';
import { DumbbellLoader } from '../../components/DumbbellLoader';
import { 
  ChevronLeft, Key, Trash2, Calendar, Scale, Ruler, 
  Droplets, Dumbbell, Clipboard, Lock, Sparkles, User, UserCheck
} from 'lucide-react';

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

  useEffect(() => {
    if (clientId) {
      fetchClientDetails();
    }
  }, [clientId]);

  const fetchClientDetails = async () => {
    try {
      setLoading(true);
      // 1. Fetch client profile & user credentials with specified user join relation
      const { data: clientProfile, error: profileErr } = await supabaseAdmin
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

      // 2. Fetch latest body composition scan weight
      const { data: scans } = await supabaseAdmin
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



      // 4. Fetch workout day plans (read-only splits)
      const { data: days } = await supabaseAdmin
        .from('client_workout_days')
        .select('*')
        .eq('user_id', clientId)
        .order('day_number', { ascending: true });

      setWorkoutDays(days || []);
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
      // Update Authentication account password
      const { error: authErr } = await supabaseAdmin.auth.admin.updateUserById(
        client.user_id,
        { password: newPassword.trim() }
      );
      if (authErr) throw authErr;

      // Update client passcode indicator in client_profiles table
      const { error: dbErr } = await supabaseAdmin
        .from('client_profiles')
        .update({ generated_passcode: newPassword.trim() })
        .eq('user_id', client.user_id);
      if (dbErr) throw dbErr;

      toast.success('Password updated successfully!');
      setNewPassword('');
      fetchClientDetails();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to change client password');
    } finally {
      setUpdatingPassword(false);
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

      // 1. Delete auth account
      const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(uid);
      if (authErr) {
        console.warn('Auth user delete warning:', authErr);
      }

      // 2. Cascade delete database records
      await supabaseAdmin.from('inbody_scans').delete().eq('user_id', uid);
      await supabaseAdmin.from('client_workout_days').delete().eq('user_id', uid);
      await supabaseAdmin.from('user_workout_plans').delete().eq('user_id', uid);
      await supabaseAdmin.from('progress_notes').delete().eq('user_id', uid);
      await supabaseAdmin.from('water_logs').delete().eq('user_id', uid);
      await supabaseAdmin.from('client_profiles').delete().eq('user_id', uid);
      await supabaseAdmin.from('profiles').delete().eq('id', uid);

      toast.success('Client deleted successfully');
      navigate('/coach/clients');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to delete client account');
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
        <div className="w-16" /> {/* spacer */}
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

          <div className="grid grid-cols-2 gap-4 mt-5 border-t border-gray-850 pt-4 text-xs">
            <div>
              <p className="text-gray-500 font-semibold flex items-center gap-1.5"><Calendar size={12} /> Joined</p>
              <p className="text-gray-200 font-bold mt-0.5">{new Date(client.user?.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-gray-500 font-semibold flex items-center gap-1.5"><UserCheck size={12} /> Passcode</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono text-yellow-400 font-black tracking-wider">{client.generated_passcode}</span>
                <button 
                  onClick={handleCopyCredentials} 
                  className="text-gray-400 hover:text-white p-0.5 rounded bg-gray-800/80 border border-gray-700 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title="Copy Access Credentials"
                >
                  <Clipboard size={11} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Biometrics Card */}
        <Card className="p-5 space-y-4">
          <h2 className="text-sm font-extrabold text-white border-b border-gray-850 pb-2 uppercase tracking-wider flex items-center gap-2">
            <User className="text-blue-500 w-4 h-4" /> Deployed Biometrics
          </h2>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-[#181d29] p-2.5 rounded-xl border border-gray-850">
              <p className="text-[9px] text-gray-500 uppercase font-bold flex justify-center items-center gap-0.5"><Scale size={10} /> Weight</p>
              <p className="text-white font-extrabold text-xs mt-1">{latestWeight ? `${latestWeight} kg` : 'N/A'}</p>
            </div>
            <div className="bg-[#181d29] p-2.5 rounded-xl border border-gray-850">
              <p className="text-[9px] text-gray-500 uppercase font-bold flex justify-center items-center gap-0.5"><Ruler size={10} /> Height</p>
              <p className="text-white font-extrabold text-xs mt-1">{client.height ? `${client.height} cm` : 'N/A'}</p>
            </div>
            <div className="bg-[#181d29] p-2.5 rounded-xl border border-gray-850">
              <p className="text-[9px] text-gray-500 uppercase font-bold flex justify-center items-center gap-0.5"><User size={10} /> Age</p>
              <p className="text-white font-extrabold text-xs mt-1">{client.age ? `${client.age} yrs` : 'N/A'}</p>
            </div>
            <div className="bg-[#181d29] p-2.5 rounded-xl border border-gray-850">
              <p className="text-[9px] text-gray-500 uppercase font-bold flex justify-center items-center gap-0.5">⚧ Gender</p>
              <p className="text-white font-extrabold text-xs mt-1 capitalize">{client.user?.targets?.gender || 'N/A'}</p>
            </div>
          </div>

          <div className="space-y-3 text-xs border-t border-gray-850 pt-3">
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

        {/* Water Intake Goal Display */}
        <Card className="p-5 flex items-center justify-between border border-gray-800/80 bg-[#121620]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl flex items-center justify-center">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Water Intake Target</p>
              <p className="text-white font-extrabold text-lg mt-0.5">
                {((client.user?.targets?.water_goal_ml || 3500) / 1000).toFixed(1)} Liters
              </p>
            </div>
          </div>
        </Card>

        {/* Workout Program splits — READ ONLY */}
        <div className="bg-[#121620]/60 border border-gray-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h2 className="text-sm font-extrabold text-white border-b border-gray-850 pb-2 uppercase tracking-wider flex items-center gap-2">
            <Dumbbell className="text-purple-400 w-4 h-4" /> Training Schedule
          </h2>
          
          {workoutDays.length === 0 ? (
            <p className="text-xs text-gray-500 italic text-center py-4">No workout splits assigned yet.</p>
          ) : (
            <div className="space-y-4">
              {workoutDays.map((day) => {
                // Extract split key to find day-specific macros
                const splitKey = day.day_name.replace(' Day', '').toUpperCase();
                const dayNutrition = client.user?.targets?.day_nutrition?.[splitKey] || {
                  kcal: client.user?.targets?.kcal,
                  protein: client.user?.targets?.protein,
                  carbs: client.user?.targets?.carbs,
                  fat: client.user?.targets?.fat
                };

                return (
                  <div key={day.id} className="bg-[#181d29] p-4 rounded-xl border border-gray-850/80 shadow-inner">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3 border-b border-gray-850/60 pb-3">
                      <div>
                        <h3 className="text-xs font-black text-gray-200 uppercase tracking-widest flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-purple-500" />
                          {day.day_name}
                        </h3>
                        {/* Day Macros Display */}
                        <div className="mt-1.5 flex flex-wrap gap-1.5 text-[9px] text-gray-400">
                          <span className="bg-blue-950/40 border border-blue-900/30 px-1.5 py-0.5 rounded text-blue-300 font-bold">
                            {dayNutrition.kcal || '—'} kcal
                          </span>
                          <span className="bg-emerald-950/40 border border-emerald-900/30 px-1.5 py-0.5 rounded text-emerald-300 font-bold">
                            {dayNutrition.protein || '—'}g P
                          </span>
                          <span className="bg-amber-950/40 border border-amber-900/30 px-1.5 py-0.5 rounded text-amber-300 font-bold">
                            {dayNutrition.carbs || '—'}g C
                          </span>
                          <span className="bg-red-950/40 border border-red-900/30 px-1.5 py-0.5 rounded text-red-300 font-bold">
                            {dayNutrition.fat || '—'}g F
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] bg-purple-950/60 border border-purple-800/30 text-purple-400 px-2 py-0.5 rounded font-black uppercase shrink-0">
                        DAY {day.day_number}
                      </span>
                    </div>

                    {/* Exercises List */}
                    <div className="space-y-2">
                      {(!day.exercises || day.exercises.length === 0) ? (
                        <p className="text-[10px] text-gray-500 italic">No exercises added to this split.</p>
                      ) : (
                        day.exercises.map((ex: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-xs bg-[#121620]/60 border border-gray-850/40 p-2.5 rounded-lg hover:border-gray-800 transition-colors">
                            <div>
                              <p className="text-gray-200 font-bold">{ex.name}</p>
                              {ex.muscle_group && (
                                <p className="text-[9px] text-gray-500 font-semibold mt-0.5 uppercase tracking-wide">{ex.muscle_group}</p>
                              )}
                            </div>
                            <span className="font-mono text-gray-400 text-[10px] bg-gray-900 border border-gray-850 px-2 py-1 rounded">
                              {ex.sets} sets × {ex.reps_min || 8}-{ex.reps_max || 12} reps
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Change Password Card */}
        <Card className="p-5 space-y-4">
          <h2 className="text-sm font-extrabold text-white border-b border-gray-850 pb-2 uppercase tracking-wider flex items-center gap-2">
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
                className="w-full bg-[#181d29] border border-gray-850 rounded-xl py-3 px-4 text-white text-xs outline-none focus:border-blue-500 transition-colors"
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

        {/* InBody Scan Records */}
        <div className="bg-[#121620]/60 border border-gray-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h2 className="text-sm font-extrabold text-white border-b border-gray-850 pb-2 uppercase tracking-wider flex items-center gap-2">
            <Scale className="text-blue-400 w-4 h-4" /> Composition History
          </h2>
          <InBodyHistory clientId={clientId} />
        </div>

        {/* Coach Progress Notes */}
        <div className="bg-[#121620]/60 border border-gray-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h2 className="text-sm font-extrabold text-white border-b border-gray-850 pb-2 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="text-blue-400 w-4 h-4" /> Coach Notes
          </h2>
          <ProgressNotes clientId={clientId} coachId={client.coach_id} />
        </div>

        {/* Danger Zone: Delete Client */}
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

// InBody History Component using supabaseAdmin
function InBodyHistory({ clientId }: any) {
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScans = async () => {
      const { data } = await supabaseAdmin
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
    <div className="space-y-3">
      {scans.map(scan => (
        <div key={scan.id} className="bg-[#181d29] p-4 rounded-xl border border-gray-850">
          <div className="flex justify-between items-center mb-3">
            <p className="font-bold text-xs text-white">
              {new Date(scan.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            <span className="bg-blue-950/80 border border-blue-900/40 text-blue-400 text-[10px] px-2 py-0.5 rounded font-black select-none uppercase">
              SCORE: {scan.score || scan.inbody_score || 'N/A'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-[#121620]/60 p-2 rounded-lg border border-gray-850/40">
              <p className="text-gray-500 text-[9px] uppercase font-bold">Weight</p>
              <p className="text-white font-extrabold mt-0.5">{scan.weight}kg</p>
            </div>
            <div className="bg-[#121620]/60 p-2 rounded-lg border border-gray-850/40">
              <p className="text-gray-500 text-[9px] uppercase font-bold">SMM</p>
              <p className="text-emerald-400 font-extrabold mt-0.5">{scan.smm}kg</p>
            </div>
            <div className="bg-[#121620]/60 p-2 rounded-lg border border-gray-850/40">
              <p className="text-gray-500 text-[9px] uppercase font-bold">BF%</p>
              <p className="text-red-400 font-extrabold mt-0.5">{scan.bf_percent}%</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Progress Notes Component using supabaseAdmin
function ProgressNotes({ clientId, coachId }: any) {
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      const { data } = await supabaseAdmin
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

    const { error } = await supabaseAdmin
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
      // Refresh notes list
      const { data } = await supabaseAdmin
        .from('progress_notes')
        .select('*')
        .eq('user_id', clientId)
        .order('date', { ascending: false });
      setNotes(data || []);
    } else {
      toast.error('Failed to save note');
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
          className="flex-1 bg-[#181d29] border border-gray-850 rounded-xl py-3 px-4 text-white text-xs outline-none focus:border-blue-500 transition-colors"
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
            <div key={note.id} className="bg-[#181d29] p-3.5 rounded-xl border border-gray-850">
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
