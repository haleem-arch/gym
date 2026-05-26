'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { format } from 'date-fns';
import { toast } from 'sonner';

type Run = Database['public']['Tables']['runs']['Row'];
type Registration = Database['public']['Tables']['registrations']['Row'] & { profile: Database['public']['Tables']['profiles']['Row'] };

export default function AttendanceManager() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string>('');
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRuns() {
      const { data } = await supabase.from('runs').select('*').order('date_time', { ascending: false });
      if (data) {
        setRuns(data);
        if (data.length > 0) setSelectedRunId(data[0].id);
      }
      setIsLoading(false);
    }
    fetchRuns();
  }, []);

  useEffect(() => {
    if (!selectedRunId) return;
    
    async function fetchRegistrations() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          profile:profiles (*)
        `)
        .eq('run_id', selectedRunId);
        
      if (!error && data) setRegistrations(data);
      setIsLoading(false);
    }
    
    fetchRegistrations();
  }, [selectedRunId]);

  const toggleCheckIn = async (regId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'checked_in' ? 'registered' : 'checked_in';
    
    // Optimistic update
    setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, status: newStatus } : r));

    const { error } = await supabase
      .from('registrations')
      .update({ status: newStatus })
      .eq('id', regId);

    if (error) {
      toast.error('Failed to update attendance.');
      // Revert optimistic update
      setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, status: currentStatus } : r));
    } else {
      toast.success(`Runner marked as ${newStatus === 'checked_in' ? 'Present' : 'Absent'}`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Attendance Check-in</h1>

      <div className="glass-card rounded-2xl p-6">
        <div className="mb-6">
          <label className="text-xs font-medium text-gray-400 mb-2 block">SELECT RUN</label>
          <select 
            value={selectedRunId} 
            onChange={(e) => setSelectedRunId(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-volt)] appearance-none"
          >
            {runs.map(run => (
              <option key={run.id} value={run.id}>
                {format(new Date(run.date_time), 'MMM do')} - {run.title}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-gray-400">
                <th className="pb-3 font-medium">Runner Name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium text-right">Check In</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-500">Loading registrations...</td>
                </tr>
              ) : registrations.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-500">No one has RSVP'd to this run yet.</td>
                </tr>
              ) : registrations.map(reg => (
                <tr key={reg.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  <td className="py-3 font-medium flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-[var(--color-volt)]">
                      {reg.profile?.full_name?.charAt(0) || '?'}
                    </div>
                    {reg.profile?.full_name}
                  </td>
                  <td className="py-3 text-gray-400">{reg.profile?.email}</td>
                  <td className="py-3 text-right">
                    <button 
                      onClick={() => toggleCheckIn(reg.id, reg.status)}
                      className={`px-4 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
                        reg.status === 'checked_in' 
                          ? 'bg-[var(--color-volt)] text-black' 
                          : 'bg-white/10 text-gray-400 hover:bg-white/20'
                      }`}
                    >
                      {reg.status === 'checked_in' ? 'Present' : 'Check In'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
