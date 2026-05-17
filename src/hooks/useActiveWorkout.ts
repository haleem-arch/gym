import { useState, useEffect } from 'react';

export interface WorkoutSet {
  setNum: number;
  weight: number;
  reps: number;
  rpe: number; // Also used for RIR depending on user preference
  done: boolean;
}

export interface WorkoutExercise {
  id: string; // From exercises table
  name: string;
  muscle_group: string;
  tier: string;
  cue: string;
  rationale: string;
  sets: WorkoutSet[];
  notes: string;
  restTime: number; // Default rest time in seconds
}

export interface ActiveWorkout {
  id: string;
  dayType: string;
  title: string;
  startTime: string;
  exercises: WorkoutExercise[];
  notes: string;
}

const STORAGE_KEY = 'athlete_dashboard_active_workout';

// ─── Shared Global Workout State Store ───
// This guarantees all hook instances in all mounted/unmounted components share the exact same state.
let globalWorkoutState: ActiveWorkout | null = (() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return null;
    }
  }
  return null;
})();

const listeners = new Set<(w: ActiveWorkout | null) => void>();

const updateGlobalWorkoutState = (newWorkout: ActiveWorkout | null) => {
  globalWorkoutState = newWorkout;
  if (newWorkout) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newWorkout));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
  listeners.forEach(listener => listener(newWorkout));
};

export const useActiveWorkout = () => {
  const [workout, setWorkoutState] = useState<ActiveWorkout | null>(globalWorkoutState);

  // Subscribe to changes in the global workout state
  useEffect(() => {
    listeners.add(setWorkoutState);
    return () => {
      listeners.delete(setWorkoutState);
    };
  }, []);

  // Standard React state setter wrapper that updates the global store
  const setWorkout = (newVal: ActiveWorkout | null | ((prev: ActiveWorkout | null) => ActiveWorkout | null)) => {
    if (typeof newVal === 'function') {
      const resolved = newVal(globalWorkoutState);
      updateGlobalWorkoutState(resolved);
    } else {
      updateGlobalWorkoutState(newVal);
    }
  };

  const startWorkout = (dayType: string, title: string, exercises: WorkoutExercise[]) => {
    setWorkout({
      id: crypto.randomUUID(),
      dayType,
      title,
      startTime: new Date().toISOString(),
      exercises,
      notes: ''
    });
  };

  const updateSet = (exerciseIndex: number, setIndex: number, updates: Partial<WorkoutSet>) => {
    setWorkout(prev => {
      if (!prev) return prev;
      const newExercises = [...prev.exercises];
      newExercises[exerciseIndex] = { ...newExercises[exerciseIndex] };
      newExercises[exerciseIndex].sets = [...newExercises[exerciseIndex].sets];
      
      newExercises[exerciseIndex].sets[setIndex] = {
        ...newExercises[exerciseIndex].sets[setIndex],
        ...updates
      };
      return { ...prev, exercises: newExercises };
    });
  };

  const addSet = (exerciseIndex: number) => {
    setWorkout(prev => {
      if (!prev) return prev;
      const newExercises = [...prev.exercises];
      const currentSets = newExercises[exerciseIndex].sets;
      const lastSet = currentSets[currentSets.length - 1];
      
      newExercises[exerciseIndex].sets.push({
        setNum: currentSets.length + 1,
        weight: lastSet ? lastSet.weight : 0,
        reps: lastSet ? lastSet.reps : 0,
        rpe: lastSet ? lastSet.rpe : 8,
        done: false,
      });
      return { ...prev, exercises: newExercises };
    });
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    setWorkout(prev => {
      if (!prev) return prev;
      const newExercises = [...prev.exercises];
      newExercises[exerciseIndex] = { ...newExercises[exerciseIndex] };
      newExercises[exerciseIndex].sets = newExercises[exerciseIndex].sets.filter((_, i) => i !== setIndex);
      
      // Re-number the sets
      newExercises[exerciseIndex].sets.forEach((set, i) => {
        set.setNum = i + 1;
      });
      
      return { ...prev, exercises: newExercises };
    });
  };

  const updateExerciseNotes = (exerciseIndex: number, notes: string) => {
     setWorkout(prev => {
      if (!prev) return prev;
      const newExercises = [...prev.exercises];
      newExercises[exerciseIndex] = { ...newExercises[exerciseIndex] };
      newExercises[exerciseIndex].notes = notes;
      return { ...prev, exercises: newExercises };
    });
  };

  const updateWorkoutNotes = (notes: string) => {
    setWorkout(prev => prev ? { ...prev, notes } : prev);
  };

  const endWorkout = () => {
    setWorkout(null);
  };

  const loadWorkout = (savedWorkout: ActiveWorkout) => {
    setWorkout(savedWorkout);
  };

  return { workout, startWorkout, updateSet, addSet, removeSet, updateExerciseNotes, updateWorkoutNotes, endWorkout, loadWorkout };
};
