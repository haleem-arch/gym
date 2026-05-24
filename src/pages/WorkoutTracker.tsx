import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useActiveWorkout } from '../hooks/useActiveWorkout';
import type { WorkoutExercise } from '../hooks/useActiveWorkout';
import { ExerciseCard } from '../components/ExerciseCard';
import { RestTimer } from '../components/RestTimer';
import { Check, ArrowLeft, Clock } from 'lucide-react';

const WorkoutTracker = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { workout, startWorkout, updateSet, addSet, removeSet, updateExerciseNotes, updateWorkoutNotes, endWorkout } = useActiveWorkout();
  
  const [restTimer, setRestTimer] = useState<{ active: boolean; time: number }>({ active: false, time: 0 });
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);


  useEffect(() => {
    if (state?.startNew && !workout && state.plan?.exercises?.length > 0) {
      const realExercises: WorkoutExercise[] = state.plan.exercises.map((dbEx: any) => ({
        id: dbEx.id,
        name: dbEx.name,
        muscle_group: dbEx.muscle_group,
        tier: dbEx.tier || 'A',
        cue: dbEx.cue || '',
        rationale: dbEx.rationale || '',
        restTime: 120,
        notes: '',
        sets: [
          { setNum: 1, weight: 0, reps: 0, rpe: 8, done: false },
          { setNum: 2, weight: 0, reps: 0, rpe: 8, done: false },
          { setNum: 3, weight: 0, reps: 0, rpe: 8, done: false },
        ]
      }));
      
      startWorkout(state.plan.type, state.plan.title, realExercises, state.activeDateStr);
      window.history.replaceState({}, document.title);
    }
  }, [state, workout, startWorkout]);

  useEffect(() => {
    if (!workout?.startTime) return;
    const interval = setInterval(() => {
      const start = new Date(workout.startTime).getTime();
      const now = new Date().getTime();
      setElapsedTime(Math.floor((now - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [workout?.startTime]);

  const handleSetComplete = (time: number) => {
    setRestTimer({ active: false, time: 0 });
    setTimeout(() => {
      setRestTimer({ active: true, time });
    }, 50);
  };

  const handleSaveClick = () => {
    executeSave('completed');
  };

  const executeSave = async (status: 'completed' | 'in_progress') => {
    if (!workout) return;
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        alert("Not authenticated. Please ensure you are logged in.");
        setIsSaving(false);
        return;
      }

      let totalVolume = 0;
      workout.exercises.forEach(ex => {
        ex.sets.forEach(set => {
          if (set.done && set.weight && set.reps) {
            totalVolume += (set.weight * set.reps);
          }
        });
      });

      const duration = workout.startTime ? Math.floor((new Date().getTime() - new Date(workout.startTime).getTime()) / 1000) : 0;
      
      // Fix timezone offset for proper date insertion
      const d = new Date();
      const localDateStr = workout.date || new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];

      const { data: workoutData, error: workoutError } = await supabase.from('workouts').upsert({
        id: workout.id, // Primary key match triggers update if resumed
        user_id: session.user.id,
        date: localDateStr,
        day_type: workout.dayType,
        duration: duration,
        total_volume: totalVolume,
        notes: workout.notes,
        status: status
      }).select().single();

      if (workoutError || !workoutData) throw workoutError;

      // For resumed workouts, clear old sets before inserting new ones
      await supabase.from('workout_exercises').delete().eq('workout_id', workout.id);

      const exerciseInserts = workout.exercises.map(ex => ({
        workout_id: workoutData.id,
        exercise_id: ex.id, 
        sets: ex.sets,
        notes: ex.notes
      }));

      const { error: exError } = await supabase.from('workout_exercises').insert(exerciseInserts);
      if (exError) throw exError;

      // Count completed sets
      let totalSets = 0;
      workout.exercises.forEach(ex => {
        ex.sets.forEach(set => { if (set.done) totalSets++; });
      });

      // Find the heaviest lift as a PR highlight
      let maxWeight = 0;
      let bestExercise = '';
      let bestReps = 0;
      workout.exercises.forEach(ex => {
        ex.sets.forEach(set => {
          if (set.done && set.weight > maxWeight) {
            maxWeight = set.weight;
            bestExercise = ex.name;
            bestReps = set.reps;
          }
        });
      });
      const prExercise = bestExercise ? `${bestExercise}: ${maxWeight}kg x ${bestReps} reps` : undefined;

      endWorkout();

      // Dispatch custom window event to trigger root-level barbell plate stacker + premium receipt
      window.dispatchEvent(new CustomEvent('trigger-gym-saved', {
        detail: {
          workoutName: `${workout.dayType} Day`,
          totalVolume: totalVolume,
          totalSets: totalSets,
          durationMinutes: Math.floor(duration / 60) || 1,
          prExercise: prExercise,
          workoutId: workoutData.id,
        }
      }));

      // Navigate back to history list (covered seamlessly by the root splash overlay)
      navigate('/workout', { replace: true });
    } catch (e: any) {
      alert("Error saving workout: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!workout) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full text-center mt-20">
        <h2 className="text-xl font-bold mb-2">No Active Workout</h2>
        <p className="text-gray-400 mb-6">You don't have a workout in progress.</p>
        <button onClick={() => navigate('/workout')} className="bg-primary px-6 py-3 rounded-xl font-bold text-white">Go to Workouts</button>
      </div>
    );
  }

  const formatElapsed = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col min-h-full bg-background relative pb-28">
      <div className="bg-surface px-4 py-4 border-b border-gray-800 sticky top-0 z-30 flex items-center justify-between">
        <button onClick={() => navigate('/workout')} className="text-gray-400 hover:text-white p-1">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="font-bold text-white tracking-tight">{workout.title}</h1>
          <div className="flex items-center justify-center gap-1 text-primary text-xs font-semibold mt-0.5">
            <Clock size={12} />
            {formatElapsed(elapsedTime)}
          </div>
        </div>
        <div className="w-6"></div>
      </div>

      <div className="p-4 flex-1">
        {workout.exercises.map((ex, idx) => (
          <ExerciseCard
            key={idx}
            exercise={ex}
            exerciseIndex={idx}
            onUpdateSet={updateSet}
            onAddSet={addSet}
            onRemoveSet={removeSet}
            onUpdateNotes={updateExerciseNotes}
            onSetComplete={handleSetComplete}
          />
        ))}

        <div className="mt-6">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Session Notes</label>
          <textarea
            className="w-full bg-surface border border-gray-800 rounded-xl p-3 text-sm text-gray-300 focus:border-primary outline-none min-h-[100px]"
            placeholder="How did the session feel? Any pain or PRs?"
            value={workout.notes}
            onChange={(e) => updateWorkoutNotes(e.target.value)}
          ></textarea>
        </div>

        <button 
          onClick={handleSaveClick}
          disabled={isSaving}
          className="w-full mt-6 bg-success hover:bg-green-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-success/20 transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          {isSaving ? (
            'SAVING...'
          ) : (
            <>
              <Check size={20} />
              FINISH & SAVE WORKOUT
            </>
          )}
        </button>

        <button 
          onClick={async () => {
            if (window.confirm('Are you sure you want to discard this workout? This cannot be undone.')) {
              const { data: { session } } = await supabase.auth.getSession();
              if (session?.user?.id) {
                // Delete ALL in_progress sessions for this user to completely clear ghost sessions
                await supabase.from('workouts').delete().eq('user_id', session.user.id).eq('status', 'in_progress');
              }
              endWorkout();
              navigate('/workout', { replace: true });
            }
          }}
          className="w-full mt-4 text-gray-500 font-semibold py-3 text-sm flex items-center justify-center transition-colors hover:text-danger active:scale-[0.98]"
        >
          Discard Session
        </button>
      </div>

      <RestTimer 
        initialTime={restTimer.time} 
        isActive={restTimer.active} 
        onClose={() => setRestTimer({ active: false, time: 0 })} 
      />


    </div>
  );
};

export default WorkoutTracker;
