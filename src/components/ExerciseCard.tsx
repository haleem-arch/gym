import { useState } from 'react';
import { ChevronDown, ChevronUp, Info, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WorkoutExercise, WorkoutSet } from '../hooks/useActiveWorkout';

import { SwipeToDeleteRow } from './SwipeToDeleteRow';

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  exerciseIndex: number;
  onUpdateSet: (exerciseIndex: number, setIndex: number, updates: Partial<WorkoutSet>) => void;
  onAddSet: (exerciseIndex: number) => void;
  onRemoveSet: (exerciseIndex: number, setIndex: number) => void;
  onUpdateNotes: (exerciseIndex: number, notes: string) => void;
  onSetComplete: (restTime: number) => void;
}

export const ExerciseCard = ({ exercise, exerciseIndex, onUpdateSet, onAddSet, onRemoveSet, onUpdateNotes, onSetComplete }: ExerciseCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'S+': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'S': return 'bg-gray-300/20 text-gray-200 border-gray-300/30';
      case 'A': return 'bg-success/20 text-success border-success/30';
      case 'B':
      case 'C': return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
      case 'F': return 'bg-danger/20 text-danger border-danger/30';
      default: return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  const handleSetToggle = (setIndex: number, currentDone: boolean) => {
    onUpdateSet(exerciseIndex, setIndex, { done: !currentDone });
    if (!currentDone) {
      onSetComplete(exercise.restTime || 120);
    }
  };

  const cleanName = (name: string) => name.replace(/\$\^\\circ\$/g, '°').replace(/\$\^\{\\circ\}\$/g, '°');

  return (
    <div className="bg-surface rounded-2xl border border-gray-800 overflow-hidden mb-4 shadow-lg">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getTierColor(exercise.tier)}`}>
              {exercise.tier} TIER
            </span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">{exercise.muscle_group}</span>
          </div>
          <h3 className="text-lg font-bold text-white leading-tight">{cleanName(exercise.name)}</h3>
        </div>
        <div className="text-gray-500 pl-4">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-gray-800 pt-3">
              
              <div className="flex items-center justify-between mb-3">
                <button 
                  onClick={() => setShowInfo(!showInfo)}
                  className="text-xs flex items-center gap-1 text-primary hover:text-blue-400 transition-colors"
                >
                  <Info size={14} /> {showInfo ? 'Hide details' : 'Show technique cue'}
                </button>
              </div>

              {showInfo && (
                <div className="bg-gray-900 rounded-xl p-3 mb-4 text-xs text-gray-300 border border-gray-800">
                  <p className="mb-1"><strong className="text-white">Cue:</strong> {exercise.cue}</p>
                  <p><strong className="text-white">Rationale:</strong> {exercise.rationale}</p>
                </div>
              )}

              {/* Set Headers */}
              <div className="grid grid-cols-12 gap-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 text-center">
                <div className="col-span-2">Set</div>
                <div className="col-span-3">kg</div>
                <div className="col-span-3">Reps</div>
                <div className="col-span-2">RPE</div>
                <div className="col-span-2">Done</div>
              </div>

              {/* Sets */}
              <div className="flex flex-col gap-1">
                {exercise.sets.map((set, setIndex) => (
                  <SwipeToDeleteRow 
                    key={setIndex}
                    onDelete={() => onRemoveSet(exerciseIndex, setIndex)}
                  >
                    <div className={`grid grid-cols-12 gap-2 py-1 items-center text-center ${set.done ? 'opacity-50' : ''}`}>
                      <div className="col-span-2 text-sm font-bold text-gray-400">{set.setNum}</div>
                      <div className="col-span-3">
                        <input 
                          type="number" 
                          value={set.weight || ''}
                          onChange={(e) => onUpdateSet(exerciseIndex, setIndex, { weight: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 text-center text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all disabled:opacity-50"
                          disabled={set.done}
                        />
                      </div>
                      <div className="col-span-3">
                        <input 
                          type="number" 
                          value={set.reps || ''}
                          onChange={(e) => onUpdateSet(exerciseIndex, setIndex, { reps: parseInt(e.target.value) || 0 })}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 text-center text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all disabled:opacity-50"
                          disabled={set.done}
                        />
                      </div>
                      <div className="col-span-2">
                        <input 
                          type="number" 
                          value={set.rpe || ''}
                          onChange={(e) => onUpdateSet(exerciseIndex, setIndex, { rpe: parseInt(e.target.value) || 0 })}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 text-center text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all disabled:opacity-50"
                          disabled={set.done}
                        />
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <button 
                          onClick={() => handleSetToggle(setIndex, set.done)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            set.done ? 'bg-success text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          }`}
                        >
                          {set.done ? '✓' : ''}
                        </button>
                      </div>
                    </div>
                  </SwipeToDeleteRow>
                ))}
              </div>

              <button 
                onClick={() => onAddSet(exerciseIndex)}
                className="w-full py-2 mt-2 border border-dashed border-gray-700 text-gray-400 rounded-lg text-xs font-semibold hover:bg-gray-800 hover:text-white transition-colors flex items-center justify-center gap-1"
              >
                <Plus size={14} /> Add Set
              </button>

              <div className="mt-4">
                <input 
                  type="text"
                  placeholder="Add notes for this exercise..."
                  value={exercise.notes}
                  onChange={(e) => onUpdateNotes(exerciseIndex, e.target.value)}
                  className="w-full bg-transparent border-b border-gray-800 py-2 text-xs text-gray-300 focus:border-primary outline-none transition-colors"
                />
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
