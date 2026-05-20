import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Card } from '../../components/Card';
import { ChevronLeft, ChevronDown, Edit2, Check, Plus, Trash2, Search, Calendar, Activity, ClipboardList } from 'lucide-react';

export default function ClientManagementPage() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<any>(null);
  const [workoutDays, setWorkoutDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (clientId) {
      fetchClientProfile();
    }
  }, [clientId]);

  const fetchClientProfile = async () => {
    const { data, error } = await supabase
      .from('client_profiles')
      .select(`
        *,
        user:profiles(id, username, email, display_name, created_at)
      `)
      .eq('user_id', clientId)
      .single();

    if (error) {
      console.error('Error fetching client:', error);
      toast.error('Athlete not found');
      navigate('/coach/clients');
      return;
    }

    setClient(data);

    const { data: days } = await supabase
      .from('client_workout_days')
      .select('*')
      .eq('user_id', clientId)
      .order('day_number', { ascending: true });

    setWorkoutDays(days || []);
    setLoading(false);
  };

  const handleUpdateDaysPerWeek = async (newDaysPerWeek: number) => {
    const existingDays = workoutDays.length;
    if (newDaysPerWeek > existingDays) {
      for (let i = existingDays + 1; i <= newDaysPerWeek; i++) {
        await supabase.from('client_workout_days').insert({
          user_id: clientId,
          day_number: i,
          day_name: `Day ${i}`,
          exercises: []
        });
      }
    } else if (newDaysPerWeek < existingDays) {
      for (let i = newDaysPerWeek + 1; i <= existingDays; i++) {
        const dayToDelete = workoutDays.find(d => d.day_number === i);
        if (dayToDelete) {
          await supabase.from('client_workout_days').delete().eq('id', dayToDelete.id);
        }
      }
    }

    await supabase
      .from('client_profiles')
      .update({ workouts_per_week: newDaysPerWeek })
      .eq('user_id', clientId);

    toast.success(`Protocol updated to ${newDaysPerWeek} sessions/week`);
    fetchClientProfile();
  };

  if (loading) return <div className="p-12 text-center font-mono text-[10px] text-gray-500 animate-pulse tracking-widest bg-background min-h-screen flex items-center justify-center">LOADING ATHLETE INTEL...</div>;
  if (!client) return <div className="p-12 text-center font-mono text-xs text-red-500 bg-background min-h-screen flex items-center justify-center">CRITICAL ERROR: DATA CORRUPTION</div>;

  return (
    <div className="p-4 max-w-7xl mx-auto pb-24 animate-slide-up relative min-h-screen">
      {/* Swirling Cosmic Background Mesh */}
      <div className="cosmic-mesh">
        <div className="cosmic-blob-1" />
        <div className="cosmic-blob-2" />
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/coach/clients')} className="p-2 bg-background/40 hover:bg-surface/60 rounded-xl transition-all border border-white/[0.05] hover:border-white/[0.15] active:scale-95 text-white">
          <ChevronLeft size={20} className="text-secondary" />
        </button>
        <div>
          <h1 className="font-outfit text-4xl font-black tracking-tight uppercase text-white">Athlete <span className="text-accent">Profile</span></h1>
          <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-1">ID: {clientId?.slice(0, 8)} | STATUS: ACTIVE</p>
        </div>
        <div className="ml-auto">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${
              editMode 
                ? 'bg-success/20 text-success border-success/30 hover:bg-success/30 shadow-lg shadow-success/10' 
                : 'bg-background/40 text-gray-400 border-white/[0.05] hover:border-secondary hover:text-white shadow-lg'
            }`}
          >
            {editMode ? <><Check size={16} /> Deploy Changes</> : <><Edit2 size={14} /> Modify Protocol</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Personal Info & Profile */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel glass-panel-hover border border-secondary/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-secondary/30 to-accent/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700 -translate-y-1/3 translate-x-1/3 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="font-outfit text-2xl font-black uppercase tracking-tight mb-4 text-white group-hover:text-secondary transition-colors duration-300">{client.user?.display_name || 'Classified'}</h2>

              <div className="space-y-4">
                <InfoRow label="Access Pass" value={client.generated_passcode} mono accent />
                <InfoRow label="Handle" value={`@${client.user?.username}`} mono />
                <InfoRow label="Email" value={client.user?.email} mono small />
                <InfoRow label="Deployment" value={new Date(client.user?.created_at).toLocaleDateString()} />
              </div>
            </div>
          </div>

          <Card>
            <h3 className="font-outfit text-xs font-black uppercase tracking-[3px] text-gray-500 mb-6 border-b border-white/[0.05] pb-2 flex items-center gap-2">
              <ClipboardList size={14} className="text-secondary" /> Biometrics & Goals
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <BioItem label="Age" value={client.age} unit="yr" />
              <BioItem label="Height" value={client.height} unit="cm" />
              <BioItem label="Level" value={client.experience_level} badge />
              <BioItem label="Week Ops" value={client.workouts_per_week} unit="x" />
            </div>
            <div className="mt-8 bg-[#0b0e14]/40 p-4 rounded-xl border border-white/[0.03]">
              <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest mb-2 block">Mission Objectives</span>
              <p className="text-gray-300 text-xs leading-relaxed italic">"{client.goals || 'No specific goals set.'}"</p>
            </div>
          </Card>

          <Card>
            <h3 className="font-outfit text-xs font-black uppercase tracking-[3px] text-gray-500 mb-6 border-b border-white/[0.05] pb-2 flex items-center gap-2">
              <Activity size={14} className="text-accent" /> Body Composition
            </h3>
            <InBodyHistory clientId={clientId} />
          </Card>
        </div>

        {/* Right Column: Workout Schedule & Notes */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel rounded-2xl p-6 shadow-xl border border-white/[0.03]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-outfit text-xs font-black uppercase tracking-[3px] text-gray-500 flex items-center gap-2">
                <Calendar size={14} className="text-secondary" /> Training Protocol
              </h3>
              {editMode && (
                <div className="flex items-center gap-3 bg-background/40 px-3 py-1.5 rounded-xl border border-white/[0.05]">
                  <span className="font-mono text-[9px] text-gray-500 uppercase tracking-wider">Frequency:</span>
                  <select
                    defaultValue={client.workouts_per_week || 3}
                    onChange={(e) => handleUpdateDaysPerWeek(parseInt(e.target.value))}
                    className="bg-transparent text-secondary font-mono text-xs font-black outline-none cursor-pointer border-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map(n => <option key={n} value={n} className="bg-[#0b0e14] text-white">{n} SESSIONS/WK</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {workoutDays.map((day) => (
                <WorkoutDayCard
                  key={day.id}
                  day={day}
                  clientId={clientId}
                  editMode={editMode}
                  onUpdate={fetchClientProfile}
                />
              ))}
            </div>
          </div>

          <Card>
            <h3 className="font-outfit text-xs font-black uppercase tracking-[3px] text-gray-500 mb-6 border-b border-white/[0.05] pb-2 flex items-center gap-2">
              <Edit2 size={14} className="text-secondary" /> Tactical Command Notes
            </h3>
            <ProgressNotes clientId={clientId} coachId={client.coach_id} />
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono, accent, small }: any) {
  return (
    <div className="flex flex-col">
      <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest">{label}</span>
      <span className={`uppercase font-bold ${mono ? 'font-mono' : 'font-outfit'} ${accent ? 'text-accent' : 'text-white'} ${small ? 'text-xs' : 'text-sm'} mt-0.5`}>
        {value || '---'}
      </span>
    </div>
  );
}

function BioItem({ label, value, unit, badge }: any) {
  return (
    <div className="relative group/bio p-3.5 bg-background/30 rounded-xl border border-white/[0.03] hover:border-secondary/20 transition-all duration-300">
      <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest block mb-1 group-hover/bio:text-secondary/70 transition-colors">{label}</span>
      {badge ? (
        <span className="inline-block bg-secondary/10 text-secondary text-[9px] font-black px-2.5 py-1 rounded uppercase mt-0.5 border border-secondary/20 group-hover/bio:bg-secondary/20 group-hover/bio:border-secondary/40 transition-all">
          {value || 'Beginner'}
        </span>
      ) : (
        <span className="font-outfit text-xl font-black text-white mt-0.5 flex items-baseline gap-0.5">
          {value || '--'}<span className="text-gray-500 text-[10px] font-mono uppercase tracking-wider">{unit}</span>
        </span>
      )}
    </div>
  );
}

function WorkoutDayCard({ day, editMode }: any) {
  const [dayName, setDayName] = useState(day.day_name);
  const [exercises, setExercises] = useState(day.exercises || []);
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAddExercise = async (exercise: any) => {
    const newExercises = [...exercises, exercise];
    setExercises(newExercises);
    await supabase.from('client_workout_days').update({ exercises: newExercises }).eq('id', day.id);
    toast.success(`DEPLOYED: ${exercise.name}`);
  };

  const handleRemoveExercise = async (exerciseId: string) => {
    const newExercises = exercises.filter((e: any) => e.id !== exerciseId);
    setExercises(newExercises);
    await supabase.from('client_workout_days').update({ exercises: newExercises }).eq('id', day.id);
    toast.success('EXERCISE RETRACTED');
  };

  const handleRenameDay = async (newName: string) => {
    setDayName(newName);
    await supabase.from('client_workout_days').update({ day_name: newName }).eq('id', day.id);
  };

  const handleHeaderClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('input') || (e.target as HTMLElement).closest('button')) {
      return;
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-background/30 border border-white/[0.04] rounded-2xl p-5 hover:border-secondary/30 transition-all duration-300 group shadow-lg">
      <div 
        onClick={handleHeaderClick}
        className="flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-3 flex-1 mr-4">
          {editMode ? (
            <input
              type="text"
              value={dayName}
              onChange={(e) => handleRenameDay(e.target.value)}
              className="bg-[#0b0e14]/60 text-secondary font-outfit font-black uppercase text-lg px-3 py-1.5 rounded-xl border border-white/[0.05] focus:border-secondary outline-none flex-1 transition-all"
            />
          ) : (
            <h4 className="font-outfit font-black text-lg uppercase tracking-tight text-white group-hover:text-secondary transition-colors duration-300">{dayName}</h4>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[9px] font-bold text-gray-500 uppercase tracking-widest bg-background/50 px-2.5 py-1 rounded-lg border border-white/[0.05]">
            DAY {day.day_number}
          </span>
          <ChevronDown
            size={18}
            className={`text-gray-400 group-hover:text-secondary transition-transform duration-300 ${isExpanded ? 'rotate-180 text-secondary' : ''}`}
          />
        </div>
      </div>

      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1000px] opacity-100 mt-5' : 'max-h-0 opacity-0'}`}>
        <div className="space-y-2 mb-6">
          {exercises.length === 0 ? (
            <p className="text-gray-600 font-mono text-[10px] uppercase italic py-4">No tactical modules assigned</p>
          ) : (
            exercises.map((exercise: any, idx: number) => (
              <div key={idx} className="bg-background/20 border border-white/[0.02] p-3.5 rounded-xl flex justify-between items-center group/item hover:border-secondary/40 transition-all duration-300 hover:bg-background/40">
                <div>
                  <p className="font-outfit font-black text-sm uppercase text-white group-hover/item:text-secondary transition-colors duration-300">{exercise.name}</p>
                  <div className="flex gap-3 mt-1">
                    <span className="font-mono text-[9px] text-accent uppercase font-bold tracking-wider">{exercise.sets} SETS</span>
                    <span className="font-mono text-[9px] text-secondary uppercase font-bold tracking-wider">{exercise.reps_min}-{exercise.reps_max} REPS</span>
                  </div>
                </div>
                {editMode && (
                  <button onClick={() => handleRemoveExercise(exercise.id)} className="text-gray-600 hover:text-red-500 transition-colors p-1.5 hover:bg-background/60 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {editMode && (
          <button
            onClick={() => setShowExerciseSearch(!showExerciseSearch)}
            className="w-full bg-background/25 border border-white/[0.05] border-dashed hover:border-secondary hover:bg-secondary/[0.02] text-gray-500 hover:text-secondary py-3.5 rounded-xl font-mono text-[10px] font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Plus size={14} /> Assign Exercise Module
          </button>
        )}
      </div>

      {showExerciseSearch && (
        <ExerciseSearchModal
          onSelect={handleAddExercise}
          onClose={() => setShowExerciseSearch(false)}
        />
      )}
    </div>
  );
}

function ExerciseSearchModal({ onSelect, onClose }: any) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (search.length < 2) { setResults([]); return; }
    const fetchExercises = async () => {
      const { data } = await supabase.from('exercises').select('*').ilike('name', `%${search}%`).limit(10);
      setResults(data || []);
    };
    fetchExercises();
  }, [search]);

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <Card className="w-full max-w-xl border-secondary/50 shadow-secondary/20 animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-outfit font-black text-xl uppercase text-white tracking-tight">Tactical <span className="text-secondary">Library</span></h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white p-1 hover:bg-white/[0.05] rounded-lg transition-all">✕</button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="FILTER EXERCISES..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            className="w-full bg-[#0b0e14]/60 border border-white/[0.05] rounded-xl pl-12 pr-4 py-4 font-mono text-sm uppercase tracking-widest text-white outline-none focus:border-secondary transition-all"
          />
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto no-scrollbar">
          {results.map(exercise => (
            <button
              key={exercise.id}
              onClick={() => { onSelect({ ...exercise, sets: 3, reps_min: 8, reps_max: 12 }); onClose(); }}
              className="w-full bg-background/40 hover:bg-secondary/10 border border-white/[0.03] hover:border-secondary p-4 rounded-xl text-left transition-all flex justify-between items-center group"
            >
              <div>
                <p className="font-outfit font-black text-lg uppercase text-white group-hover:text-secondary transition-colors duration-300">{exercise.name}</p>
                <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-1">{exercise.muscle_group} | {exercise.equipment || 'BODYWEIGHT'}</p>
              </div>
              <Plus size={20} className="text-gray-600 group-hover:text-secondary transition-all duration-300" />
            </button>
          ))}
          {search.length >= 2 && results.length === 0 && (
            <p className="text-center font-mono text-[10px] text-gray-600 py-12 uppercase tracking-[5px]">No match found in library</p>
          )}
        </div>
      </Card>
    </div>
  );
}

function InBodyHistory({ clientId }: any) {
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScans = async () => {
      const { data } = await supabase.from('inbody_scans').select('*').eq('user_id', clientId).order('date', { ascending: false });
      setScans(data || []);
      setLoading(false);
    };
    fetchScans();
  }, [clientId]);

  if (loading) return <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest animate-pulse py-2">Scanning history...</p>;
  if (scans.length === 0) return <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest italic opacity-50 py-2">No scan data available</p>;

  return (
    <div className="space-y-4">
      {scans.slice(0, 3).map(scan => (
        <div key={scan.id} className="bg-[#0b0e14]/40 border border-white/[0.04] hover:border-secondary/20 p-4 rounded-xl transition-all duration-300">
          <div className="flex justify-between items-center mb-3">
            <p className="font-mono text-[10px] font-bold text-white/80 uppercase">{new Date(scan.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</p>
            <div className="text-right flex items-center gap-1.5 bg-secondary/10 px-2 py-0.5 rounded border border-secondary/20">
              <span className="font-mono text-[8px] text-gray-400 uppercase">SCORE:</span>
              <span className="font-outfit text-xs font-black text-secondary">{scan.score || scan.inbody_score || '--'}</span>
            </div>
          </div>
          <div className="space-y-2">
            <ProgressBarLabel label="Weight" value={scan.weight} max={150} unit="kg" color="from-white/40 to-white" />
            <ProgressBarLabel label="Body Fat" value={scan.bf_percent} max={50} unit="%" color="from-accent/40 to-accent" />
            <ProgressBarLabel label="Muscle Mass" value={scan.smm} max={80} unit="kg" color="from-secondary/40 to-secondary" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProgressBarLabel({ label, value, max, unit, color }: any) {
  if (!value) return null;
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div>
      <div className="flex justify-between text-[9px] font-mono uppercase tracking-wider mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-bold">{value}{unit}</span>
      </div>
      <div className="h-1 bg-background/50 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${color} rounded-full`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function ProgressNotes({ clientId, coachId }: any) {
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      const { data } = await supabase.from('progress_notes').select('*').eq('user_id', clientId).order('date', { ascending: false });
      setNotes(data || []);
    };
    fetchNotes();
  }, [clientId]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setAdding(true);
    const { error } = await supabase.from('progress_notes').insert({
      user_id: clientId, coach_id: coachId, date: new Date().toISOString().split('T')[0], note: newNote, category: 'general'
    });
    if (!error) {
      setNewNote('');
      toast.success('COMMUNIQUE LOGGED');
      const { data } = await supabase.from('progress_notes').select('*').eq('user_id', clientId).order('date', { ascending: false });
      setNotes(data || []);
    } else {
      toast.error('Failed to log note.');
    }
    setAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="ENTER COMMAND OR FEEDBACK..."
          className="flex-1 bg-[#0b0e14]/60 border border-white/[0.05] rounded-xl px-4 py-3.5 font-mono text-xs uppercase tracking-widest text-white outline-none focus:border-secondary transition-all"
          onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
        />
        <button 
          onClick={handleAddNote} 
          disabled={adding}
          className="bg-secondary hover:bg-secondary/80 disabled:bg-gray-600 text-white px-6 rounded-xl font-outfit font-black text-xs uppercase tracking-widest transition-all duration-300"
        >
          {adding ? '...' : 'LOG'}
        </button>
      </div>

      <div className="space-y-3">
        {notes.length === 0 ? (
          <p className="text-center font-mono text-[10px] text-gray-600 py-6 uppercase tracking-widest italic">No command directives logged</p>
        ) : (
          notes.map(note => (
            <div key={note.id} className="bg-[#0b0e14]/40 border-l-2 border-secondary p-4 rounded-r-xl">
              <p className="font-mono text-[8px] text-secondary font-bold uppercase mb-2">{new Date(note.date).toLocaleDateString()} | COMMAND DIRECTIVE</p>
              <p className="text-gray-300 text-sm leading-relaxed">{note.note}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
