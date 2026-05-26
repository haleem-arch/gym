'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import RunCard, { RunCardSkeleton } from '@/components/RunCard';
import { useAuth } from '@/components/AuthProvider';
import AuthModal from '@/components/AuthModal';

type Run = Database['public']['Tables']['runs']['Row'];
type Registration = Database['public']['Tables']['registrations']['Row'];

export default function Home() {
  const { user } = useAuth();
  const [runs, setRuns] = useState<Run[]>([]);
  const [registrationsCount, setRegistrationsCount] = useState<Record<string, number>>({});
  const [userRegistrations, setUserRegistrations] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Hero countdown state
  const [timeLeft, setTimeLeft] = useState({ hours: 48, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Dummy countdown logic for the hero
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) { seconds--; }
        else {
          seconds = 59;
          if (minutes > 0) { minutes--; }
          else { minutes = 59; hours = Math.max(0, hours - 1); }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      // Fetch upcoming runs
      const { data: runsData, error: runsError } = await supabase
        .from('runs')
        .select('*')
        .eq('status', 'upcoming')
        .order('date_time', { ascending: true });

      if (runsError) throw runsError;
      setRuns(runsData || []);

      if (!runsData || runsData.length === 0) {
        setIsLoading(false);
        return;
      }

      const runIds = runsData.map(r => r.id);

      // Fetch registration counts
      const { data: countsData, error: countsError } = await supabase
        .from('registrations')
        .select('run_id');

      if (!countsError && countsData) {
        const counts: Record<string, number> = {};
        countsData.forEach(reg => {
          counts[reg.run_id] = (counts[reg.run_id] || 0) + 1;
        });
        setRegistrationsCount(counts);
      }

      // Fetch user's registrations if logged in
      if (user) {
        const { data: userRegs } = await supabase
          .from('registrations')
          .select('run_id')
          .eq('user_id', user.id)
          .in('run_id', runIds);
          
        if (userRegs) {
          setUserRegistrations(new Set(userRegs.map(r => r.run_id)));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return (
    <div className="flex flex-col items-center pt-8 pb-20 px-5 max-w-5xl mx-auto w-full">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center py-12 w-full border-b border-white/5 mb-12">
        <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold tracking-widest text-[var(--color-volt)] uppercase mb-6">
          Next Scheduled Run
        </div>
        <div className="flex gap-4 sm:gap-8 text-center">
          <div className="flex flex-col items-center">
            <span className="text-5xl sm:text-7xl font-black tracking-tighter tabular-nums">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="text-xs sm:text-sm text-gray-500 font-medium uppercase tracking-wider mt-2">Hours</span>
          </div>
          <span className="text-5xl sm:text-7xl font-black text-gray-800 animate-pulse">:</span>
          <div className="flex flex-col items-center">
            <span className="text-5xl sm:text-7xl font-black tracking-tighter tabular-nums">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="text-xs sm:text-sm text-gray-500 font-medium uppercase tracking-wider mt-2">Mins</span>
          </div>
          <span className="text-5xl sm:text-7xl font-black text-gray-800 animate-pulse">:</span>
          <div className="flex flex-col items-center">
            <span className="text-5xl sm:text-7xl font-black tracking-tighter tabular-nums text-white">{String(timeLeft.seconds).padStart(2, '0')}</span>
            <span className="text-xs sm:text-sm text-gray-500 font-medium uppercase tracking-wider mt-2">Secs</span>
          </div>
        </div>
      </section>

      {/* Runs Feed */}
      <section className="w-full">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Upcoming Runs</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <>
              <RunCardSkeleton />
              <RunCardSkeleton />
              <RunCardSkeleton />
            </>
          ) : runs.length > 0 ? (
            runs.map((run) => (
              <RunCard 
                key={run.id} 
                run={run} 
                registeredCount={registrationsCount[run.id] || 0}
                isRegistered={userRegistrations.has(run.id)}
                isAuthenticated={!!user}
                onRequireAuth={() => setIsAuthModalOpen(true)}
                onRsvpChange={fetchData}
              />
            ))
          ) : (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-500 bg-white/5 rounded-3xl border border-white/5">
              <p className="text-lg font-medium">No upcoming runs scheduled.</p>
              <p className="text-sm">Check back later for new events.</p>
            </div>
          )}
        </div>
      </section>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
