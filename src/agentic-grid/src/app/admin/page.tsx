'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Activity, Target } from 'lucide-react';

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRuns: 0,
    totalRegistrations: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      const [usersCount, runsCount, regsCount] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('runs').select('*', { count: 'exact', head: true }),
        supabase.from('registrations').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        totalUsers: usersCount.count || 0,
        totalRuns: runsCount.count || 0,
        totalRegistrations: regsCount.count || 0,
      });
    }
    fetchStats();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6 flex flex-col gap-4">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[var(--color-volt)]">
            <Users size={20} />
          </div>
          <div>
            <div className="text-3xl font-black">{stats.totalUsers}</div>
            <div className="text-sm text-gray-400 font-medium">Total Registered Members</div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 flex flex-col gap-4">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[var(--color-volt)]">
            <Target size={20} />
          </div>
          <div>
            <div className="text-3xl font-black">{stats.totalRuns}</div>
            <div className="text-sm text-gray-400 font-medium">Total Runs Hosted</div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 flex flex-col gap-4">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[var(--color-volt)]">
            <Activity size={20} />
          </div>
          <div>
            <div className="text-3xl font-black">{stats.totalRegistrations}</div>
            <div className="text-sm text-gray-400 font-medium">Total RSVPs Processed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
