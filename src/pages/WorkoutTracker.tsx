import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useActiveWorkout } from '../hooks/useActiveWorkout';
import type { WorkoutExercise } from '../hooks/useActiveWorkout';
import { ExerciseCard } from '../components/ExerciseCard';
import { RestTimer } from '../components/RestTimer';
import { Check, ArrowLeft, Clock } from 'lucide-react';

const WorkoutTracker = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { workout, startWorkout, updateSet, addSet, updateExerciseNotes, updateWorkoutNotes, endWorkout } = useActiveWorkout();
  
  const [restTimer, setRestTimer] = useState<{ active: boolean; time: number }>({ active: false, time: 0 });
  const [elapsedTime, setElapsedTime] = useState(0);

  // If a new workout is passed via navigation state and no workout is active, start it.
  useEffect(() => {
    if (state?.startNew && !workout) {
      // In a real scenario, we'd fetch the rich exercise data from Supabase here.
      // For Phase 2 UI, we mock the fetched rich data based on the plan string array passed.
      const mockExercises: WorkoutExercise[] = state.plan.exercises.map((name: string, i: number) => ({
        id: `mock-id-${i}`,
        name,
        muscle_group: state.plan.type,
        tier: i === 0 ? 'S+' : 'A',
        cue: 'Keep chest up and drive through the heels.',
        rationale: 'Maximizes mechanical tension across the target muscle.',
        restTime: 120,
        notes: '',
        sets: [
          { setNum: 1, weight: 0, reps: 0, rpe: 8, done: false },
          { setNum: 2, weight: 0, reps: 0, rpe: 8, done: false },
        ]
      }));
      
      startWorkout(state.plan.type, state.plan.title, mockExercises);
      // Clear history state so refresh doesn't trigger start again
      window.history.replaceState({}, document.title);
    }
  }, [state, workout, startWorkout]);

  // Elapsed time counter
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
    setRestTimer({ active: false, time: 0 }); // reset
    setTimeout(() => {
      setRestTimer({ active: true, time });
    }, 50);
  };

  const handleEndWorkout = () => {
    // In Phase 3, this will send the payload to Supabase
    alert('Workout Saved to Supabase!');
    endWorkout();
    navigate('/');
  };

  if (!workout) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full text-center mt-20">
        <h2 className="text-xl font-bold mb-2">No Active Workout</h2>
        <p className="text-gray-400 mb-6">You don't have a workout in progress.</p>
        <button onClick={() => navigate('/')} className="bg-primary px-6 py-3 rounded-xl font-bold text-white">Go to Today View</button>
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
    <div className="flex flex-col min-h-full bg-background relative">
      {/* Header */}
      <div className="bg-surface px-4 py-4 border-b border-gray-800 sticky top-0 z-30 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="font-bold text-white tracking-tight">{workout.title}</h1>
          <div className="flex items-center justify-center gap-1 text-primary text-xs font-semibold mt-0.5">
            <Clock size={12} />
            {formatElapsed(elapsedTime)}
          </div>
        </div>
        <div className="w-6"></div> {/* Spacer */}
      </div>

      {/* Exercises */}
      <div className="p-4 flex-1 pb-32">
        {workout.exercises.map((ex, idx) => (
          <ExerciseCard
            key={idx}
            exercise={ex}
            exerciseIndex={idx}
            onUpdateSet={updateSet}
            onAddSet={addSet}
            onUpdateNotes={updateExerciseNotes}
            onSetComplete={handleSetComplete}
          />
        ))}

        {/* Global Workout Notes */}
        <div className="mt-6">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Session Notes</label>
          <textarea
            className="w-full bg-surface border border-gray-800 rounded-xl p-3 text-sm text-gray-300 focus:border-primary outline-none min-h-[100px]"
            placeholder="How did the session feel? Any pain or PRs?"
            value={workout.notes}
            onChange={(e) => updateWorkoutNotes(e.target.value)}
          ></textarea>
        </div>

        {/* End Workout Button */}
        <button 
          onClick={handleEndWorkout}
          className="w-full mt-6 bg-success hover:bg-green-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-success/20 transition-transform active:scale-[0.98]"
        >
          <Check size={20} />
          FINISH & SAVE WORKOUT
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
