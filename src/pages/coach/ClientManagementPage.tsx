import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Card } from '../../components/Card';

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
      toast.error('Client not found');
      navigate('/coach/clients');
      return;
    }

    setClient(data);
    
    // Fetch workout days
    const { data: days } = await supabase
      .from('client_workout_days')
      .select('*')
      .eq('user_id', clientId)
      .order('day_number', { ascending: true });

    setWorkoutDays(days || []);
    setLoading(false);
  };

  const handleUpdateDaysPerWeek = async (newDaysPerWeek: number) => {
    // Create missing days
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
      // Delete excess days
      for (let i = newDaysPerWeek + 1; i <= existingDays; i++) {
        const dayToDelete = workoutDays.find(d => d.day_number === i);
        if (dayToDelete) {
          await supabase.from('client_workout_days').delete().eq('id', dayToDelete.id);
        }
      }
    }

    // Update client profile
    await supabase
      .from('client_profiles')
      .update({ workouts_per_week: newDaysPerWeek })
      .eq('user_id', clientId);

    toast.success(`Updated to ${newDaysPerWeek} days/week`);
    fetchClientProfile();
  };

  if (loading) return <div className="p-4 text-gray-400">Loading...</div>;
  if (!client) return <div className="p-4 text-red-400">Client not found</div>;

  return (
    <div className="p-4 pb-20 overflow-y-auto h-full">
      {/* Client Header Card */}
      <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-lg p-6 mb-6 text-white shadow-xl">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{client.user?.display_name || 'Unnamed Client'}</h1>
            <p className="text-gray-300 text-sm mt-2">@{client.user?.username || 'no-username'}</p>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition-colors"
          >
            {editMode ? 'Done' : 'Edit'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <p className="text-gray-300 text-xs uppercase tracking-wider">Email</p>
            <p className="font-mono text-sm break-all">{client.user?.email}</p>
          </div>
          <div>
            <p className="text-gray-300 text-xs uppercase tracking-wider">Username</p>
            <p className="font-mono text-sm">{client.user?.username}</p>
          </div>
          <div>
            <p className="text-gray-300 text-xs uppercase tracking-wider">Passcode</p>
            <p className="font-mono text-sm font-bold text-yellow-400">{client.generated_passcode}</p>
          </div>
          <div>
            <p className="text-gray-300 text-xs uppercase tracking-wider">Member Since</p>
            <p className="text-sm">{new Date(client.user?.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Client Details */}
      <Card className="mb-6">
        <h2 className="text-xl font-bold mb-4 text-white border-b border-gray-700 pb-2">Profile</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-xs uppercase">Age</label>
            <p className="text-white font-medium">{client.age || 'Not set'}</p>
          </div>
          <div>
            <label className="text-gray-400 text-xs uppercase">Height (cm)</label>
            <p className="text-white font-medium">{client.height || 'Not set'}</p>
          </div>
          <div>
            <label className="text-gray-400 text-xs uppercase">Level</label>
            <div>
              <span className="inline-block bg-blue-600 text-white px-2 py-1 rounded text-xs mt-1 font-bold">
                {(client.experience_level || 'Beginner').toUpperCase()}
              </span>
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-xs uppercase">Goals</label>
            <p className="text-white text-sm mt-1">{client.goals || 'Not set'}</p>
          </div>
        </div>
      </Card>

      {/* Workout Schedule */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6 shadow-lg border border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-white border-b border-gray-700 pb-2">Workout Schedule</h2>
        
        {editMode && (
          <div className="mb-6 flex items-center gap-3 bg-gray-700 p-3 rounded-lg">
            <label className="text-gray-300 text-sm font-bold">Days per week:</label>
            <select
              defaultValue={client.workouts_per_week || 3}
              onChange={(e) => handleUpdateDaysPerWeek(parseInt(e.target.value))}
              className="bg-gray-600 text-white rounded px-3 py-1 text-sm border border-gray-500"
            >
              {[1, 2, 3, 4, 5, 6, 7].map(n => (
                <option key={n} value={n}>{n} days</option>
              ))}
            </select>
          </div>
        )}

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

      {/* InBody History */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6 shadow-lg border border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-white border-b border-gray-700 pb-2">Body Composition</h2>
        <InBodyHistory clientId={clientId} />
      </div>

      {/* Progress Notes */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-white border-b border-gray-700 pb-2">Coach Notes</h2>
        <ProgressNotes clientId={clientId} coachId={client.coach_id} />
      </div>
    </div>
  );
}

// Workout Day Card Component
function WorkoutDayCard({ day, editMode }: any) {
  const [dayName, setDayName] = useState(day.day_name);
  const [exercises, setExercises] = useState(day.exercises || []);
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);

  const handleAddExercise = async (exercise: any) => {
    const newExercises = [...exercises, exercise];
    setExercises(newExercises);

    await supabase
      .from('client_workout_days')
      .update({ exercises: newExercises })
      .eq('id', day.id);

    toast.success(`Added ${exercise.name}`);
  };

  const handleRemoveExercise = async (exerciseId: string) => {
    const newExercises = exercises.filter((e: any) => e.id !== exerciseId);
    setExercises(newExercises);

    await supabase
      .from('client_workout_days')
      .update({ exercises: newExercises })
      .eq('id', day.id);

    toast.success('Exercise removed');
  };

  const handleRenameDay = async (newName: string) => {
    setDayName(newName);
    await supabase
      .from('client_workout_days')
      .update({ day_name: newName })
      .eq('id', day.id);
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
      <div className="flex items-center justify-between mb-4">
        {editMode ? (
          <input
            type="text"
            value={dayName}
            onChange={(e) => handleRenameDay(e.target.value)}
            className="bg-gray-600 text-white rounded px-3 py-2 flex-1 mr-4 border border-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="Day name (e.g., Push, Pull, Legs)"
          />
        ) : (
          <h3 className="text-lg font-bold text-white">{dayName}</h3>
        )}
        <span className="bg-gray-600 text-gray-300 text-xs px-2 py-1 rounded font-bold">DAY {day.day_number}</span>
      </div>

      {/* Exercise List */}
      <div className="space-y-2 mb-4">
        {exercises.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No exercises added yet.</p>
        ) : (
          exercises.map((exercise: any, idx: number) => (
            <div key={idx} className="bg-gray-600 p-3 rounded flex justify-between items-center border border-gray-500">
              <div>
                <p className="text-white font-bold">{exercise.name}</p>
                <p className="text-gray-300 text-xs">{exercise.sets}×{exercise.reps_min}-{exercise.reps_max}</p>
              </div>
              {editMode && (
                <button
                  onClick={() => handleRemoveExercise(exercise.id)}
                  className="text-red-400 text-sm hover:text-red-300 font-bold"
                >
                  Remove
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {editMode && (
        <button
          onClick={() => setShowExerciseSearch(!showExerciseSearch)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-bold transition-colors"
        >
          + Add Exercise
        </button>
      )}

      {showExerciseSearch && (
        <ExerciseSearchModal
          onSelect={handleAddExercise}
          onClose={() => setShowExerciseSearch(false)}
        />
      )}
    </div>
  );
}

// Exercise Search Modal
function ExerciseSearchModal({ onSelect, onClose }: any) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (search.length < 2) {
      setResults([]);
      return;
    }

    const fetchExercises = async () => {
      // Trying both tables as per standard schema
      const { data } = await supabase
        .from('exercises')
        .select('*')
        .ilike('name', `%${search}%`)
        .limit(10);

      setResults(data || []);
    };

    fetchExercises();
  }, [search]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-gray-800 w-full max-w-md rounded-lg p-4 shadow-2xl border border-gray-700 max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-bold">Add Exercise</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <input
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
          className="w-full bg-gray-700 text-white rounded px-4 py-2 mb-4 border border-gray-600 focus:outline-none focus:border-blue-500"
        />

        <div className="space-y-2 overflow-y-auto flex-1">
          {results.length === 0 && search.length >= 2 ? (
            <p className="text-center text-gray-500 py-4">No exercises found.</p>
          ) : (
            results.map(exercise => (
              <button
                key={exercise.id}
                onClick={() => {
                  onSelect({
                    ...exercise,
                    sets: 3,
                    reps_min: 8,
                    reps_max: 12
                  });
                  onClose();
                }}
                className="w-full bg-gray-700 hover:bg-gray-600 p-3 rounded text-left border border-gray-600 transition-colors"
              >
                <p className="font-bold text-white">{exercise.name}</p>
                <p className="text-gray-400 text-xs">{exercise.muscle_group} · {exercise.equipment || 'No equipment'}</p>
              </button>
            ))
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 bg-gray-700 text-white py-2 rounded font-bold hover:bg-gray-600 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// InBody History Component
function InBodyHistory({ clientId }: any) {
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p className="text-gray-400 animate-pulse">Loading scans...</p>;
  if (scans.length === 0) return <p className="text-gray-500 italic">No scans yet.</p>;

  return (
    <div className="space-y-3">
      {scans.map(scan => (
        <div key={scan.id} className="bg-gray-700 p-4 rounded border border-gray-600">
          <div className="flex justify-between items-center mb-3">
            <p className="font-bold text-white">{new Date(scan.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            <span className="bg-blue-900 text-blue-200 text-[10px] px-2 py-0.5 rounded font-bold">SCORE: {scan.score || scan.inbody_score || 'N/A'}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-gray-800 p-2 rounded">
              <p className="text-gray-400 text-[10px] uppercase">Weight</p>
              <p className="text-white font-bold text-sm">{scan.weight}kg</p>
            </div>
            <div className="bg-gray-800 p-2 rounded">
              <p className="text-gray-400 text-[10px] uppercase">SMM</p>
              <p className="text-green-400 font-bold text-sm">{scan.smm}kg</p>
            </div>
            <div className="bg-gray-800 p-2 rounded">
              <p className="text-gray-400 text-[10px] uppercase">BF%</p>
              <p className="text-red-400 font-bold text-sm">{scan.bf_percent}%</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Progress Notes Component
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
        note: newNote,
        category: 'general'
      });

    if (!error) {
      setNewNote('');
      toast.success('Note added');
      // Refresh notes
      const { data } = await supabase
        .from('progress_notes')
        .select('*')
        .eq('user_id', clientId)
        .order('date', { ascending: false });
      setNotes(data || []);
    } else {
      toast.error('Failed to add note');
    }
    setAdding(false);
  };

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note for the client..."
          className="flex-1 bg-gray-700 text-white rounded px-4 py-2 border border-gray-600 focus:outline-none focus:border-blue-500"
          onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
        />
        <button
          onClick={handleAddNote}
          disabled={adding}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold transition-colors disabled:bg-gray-600"
        >
          {adding ? '...' : 'Add'}
        </button>
      </div>

      <div className="space-y-3">
        {notes.length === 0 ? (
          <p className="text-gray-500 italic text-sm text-center py-4">No notes for this client yet.</p>
        ) : (
          notes.map(note => (
            <div key={note.id} className="bg-gray-700 p-3 rounded border border-gray-600">
              <p className="text-gray-400 text-[10px] font-bold uppercase mb-1">{new Date(note.date).toLocaleDateString()}</p>
              <p className="text-white text-sm leading-relaxed">{note.note}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
