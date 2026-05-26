import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Users, Check, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

type Run = Database['public']['Tables']['runs']['Row'];

interface RunCardProps {
  run: Run;
  registeredCount: number;
  isRegistered: boolean;
  onRsvpChange: () => void;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
}

export default function RunCard({ run, registeredCount, isRegistered, onRsvpChange, isAuthenticated, onRequireAuth }: RunCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  const isFull = run.max_capacity !== null && registeredCount >= run.max_capacity;
  const capacityPercentage = run.max_capacity ? Math.min(100, (registeredCount / run.max_capacity) * 100) : 0;

  const handleRSVP = async () => {
    if (!isAuthenticated) {
      onRequireAuth();
      return;
    }
    
    if (isRegistered || isFull) return;

    setIsLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsLoading(false);
      return;
    }

    const { error } = await supabase
      .from('registrations')
      .insert({ run_id: run.id, user_id: user.id });

    setIsLoading(false);

    if (error) {
      if (error.code === '23505') {
        toast.info("You're already registered for this run.");
      } else {
        toast.error("Failed to RSVP. Please try again.");
      }
    } else {
      toast.success(`You're in for ${run.title}!`);
      setShowParticles(true);
      onRsvpChange();
      setTimeout(() => setShowParticles(false), 1000);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 relative overflow-hidden flex flex-col">
      {/* Glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--color-volt)] opacity-[0.03] rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold">{run.title}</h2>
          <p className="text-[var(--color-volt)] text-sm font-medium mt-1">
            {format(new Date(run.date_time), 'EEEE, MMMM do • h:mm a')}
          </p>
        </div>
      </div>
      
      <div className="flex flex-col gap-3 mb-6 flex-1">
        <div className="flex items-center gap-3 text-gray-300">
          <MapPin className="text-gray-500" size={18} />
          <span className="text-[14px]">{run.location_name}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-300">
          <div className="w-[18px] flex justify-center text-gray-500 font-bold text-xs">KM</div>
          <span className="text-[14px]">{run.distance_km} km distance</span>
        </div>
        <div className="flex items-start gap-3 text-gray-300">
          <Clock className="text-gray-500 shrink-0" size={18} />
          <span className="text-[14px] leading-snug">
            Target Paces:<br/>
            <span className="text-gray-500 text-sm mt-0.5 block">{run.target_paces.join(', ')}</span>
          </span>
        </div>
      </div>

      {run.max_capacity && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
              <Users size={12} /> Capacity
            </div>
            <span className="text-xs font-bold text-white">{registeredCount} / {run.max_capacity}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${capacityPercentage >= 100 ? 'bg-red-500' : 'bg-[var(--color-volt)]'}`}
              style={{ width: `${capacityPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* RSVP Button */}
      <div className="relative mt-auto">
        {showParticles && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 360) / 12;
              const velocity = 50 + Math.random() * 50;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: 0,
                    scale: 1.5,
                    x: Math.cos((angle * Math.PI) / 180) * velocity,
                    y: Math.sin((angle * Math.PI) / 180) * velocity,
                  }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute w-2 h-2 rounded-full bg-[var(--color-volt)]"
                />
              );
            })}
          </div>
        )}
        
        <motion.button
          whileTap={{ scale: (isRegistered || isFull) ? 1 : 0.96 }}
          onClick={handleRSVP}
          disabled={isLoading || isRegistered || isFull}
          className={`w-full h-14 rounded-2xl font-bold text-md flex items-center justify-center transition-all duration-300 relative overflow-hidden ${
            isRegistered 
              ? 'bg-white/10 text-white border border-white/20 cursor-default' 
              : isFull
              ? 'bg-red-500/10 text-red-500 border border-red-500/20 cursor-not-allowed'
              : 'bg-white text-black hover:bg-gray-200'
          }`}
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Loader2 className="animate-spin text-black" size={20} />
              </motion.div>
            ) : isRegistered ? (
              <motion.div key="checked" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
                <Check size={20} className="text-[var(--color-volt)]" />
                <span>You're In</span>
              </motion.div>
            ) : isFull ? (
              <motion.span key="full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Run Full
              </motion.span>
            ) : (
              <motion.span key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                RSVP Now
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}

export function RunCardSkeleton() {
  return (
    <div className="glass-card rounded-3xl p-6 flex flex-col h-[320px] animate-pulse">
      <div className="h-6 w-2/3 bg-white/10 rounded mb-2"></div>
      <div className="h-4 w-1/3 bg-[var(--color-volt)]/20 rounded mb-6"></div>
      
      <div className="flex flex-col gap-4 mb-8">
        <div className="h-4 w-full bg-white/5 rounded"></div>
        <div className="h-4 w-3/4 bg-white/5 rounded"></div>
        <div className="h-4 w-5/6 bg-white/5 rounded"></div>
      </div>
      
      <div className="mt-auto h-14 w-full bg-white/10 rounded-2xl"></div>
    </div>
  );
}
