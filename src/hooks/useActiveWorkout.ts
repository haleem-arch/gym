import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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

export const useActiveWorkout = () => {
  const [workout, setWorkout] = useState<ActiveWorkout | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (workout) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workout));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [workout]);

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
      newExercises[exerciseIndex].notes = notes;
      return { ...prev, exercises: newExercises };
    });
  };

  const updateWorkoutNotes = (notes: string) => {
    setWorkout(prev => prev ? { ...prev, notes } : prev);
  }

  const endWorkout = () => {
    setWorkout(null);
  };

  const loadWorkout = (savedWorkout: ActiveWorkout) => {
    setWorkout(savedWorkout);
  };

  const replaceExercise = async (oldExerciseName: string, newExerciseName: string) => {
    const { data: newEx } = await supabase.from('exercises').select('*').eq('name', newExerciseName).single();
    if (!newEx) return;

    setWorkout(prev => {
      if (!prev) return prev;
      const newExercises = prev.exercises.map(ex => {
        if (ex.name.toLowerCase() === oldExerciseName.toLowerCase()) {
          return {
            ...ex,
            id: newEx.id,
            name: newEx.name,
            muscle_group: newEx.muscle_group,
            tier: newEx.tier || 'A',
            cue: newEx.cue || '',
            rationale: newEx.rationale || ''
          };
        }
        return ex;
      });
      return { ...prev, exercises: newExercises };
    });
  };

  useEffect(() => {
    const handleReplace = (e: any) => {
      const { oldName, newName } = e.detail;
      replaceExercise(oldName, newName);
    };
    window.addEventListener('replace_active_exercise', handleReplace);
    return () => window.removeEventListener('replace_active_exercise', handleReplace);
  }, []);

  return { workout, startWorkout, updateSet, addSet, removeSet, updateExerciseNotes, updateWorkoutNotes, endWorkout, loadWorkout, replaceExercise };
};
