'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { Calendar, Trash2, Activity, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();
  
  const [myRuns, setMyRuns] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    } else if (user) {
      fetchMyRuns();
    }
  }, [user, isLoading]);

  const fetchMyRuns = async () => {
    if (!user) return;
    setLoadingData(true);
    const { data, error } = await supabase
      .from('registrations')
      .select(`
        id,
        status,
        run:runs (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Filter out null runs just in case of weird joins
      setMyRuns(data.filter(r => r.run));
    }
    setLoadingData(false);
  };

  const cancelRsvp = async (regId: string) => {
    const { error } = await supabase
      .from('registrations')
      .delete()
      .eq('id', regId);
      
    if (error) {
      toast.error('Failed to cancel RSVP.');
    } else {
      toast.success('RSVP cancelled.');
      fetchMyRuns();
    }
  };

  if (isLoading || !user) return null;

  const totalRuns = myRuns.filter(r => r.status === 'checked_in').length;
  const upcomingRuns = myRuns.filter(r => r.run.status === 'upcoming');

  return (
    <div className="max-w-4xl mx-auto w-full px-5 py-10 flex-1">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* Left Column - Profile & QR */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          <div className="glass-card rounded-3xl p-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[var(--color-volt)] to-[var(--color-volt-hover)] flex items-center justify-center text-black text-2xl font-black mb-4">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <h1 className="text-2xl font-bold">{profile?.full_name}</h1>
            <p className="text-gray-400 text-sm">{profile?.email}</p>
            <div className="mt-4 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-widest text-[var(--color-volt)] uppercase">
              {profile?.role === 'admin' ? 'Admin' : 'Runner'}
            </div>
            
            {profile?.role !== 'admin' && (
              <button 
                onClick={async () => {
                  const { error } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id);
                  if (error) toast.error('Error: ' + error.message);
                  else {
                    toast.success('You are now an Admin! Refresh the page.');
                    window.location.reload();
                  }
                }}
                className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-colors border border-white/20"
              >
                Make Me Admin (Dev Tool)
              </button>
            )}
          </div>

          <div className="glass-card rounded-3xl p-6 flex flex-col items-center">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Your Runner ID</h3>
            <div className="bg-white p-4 rounded-xl">
              <QRCode value={user.id} size={150} />
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">Scan this code at the start line for attendance check-in.</p>
          </div>
        </div>

        {/* Right Column - Stats & Schedule */}
        <div className="w-full md:w-2/3 flex flex-col gap-6">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card rounded-3xl p-6 flex flex-col items-start">
              <Award className="text-[var(--color-volt)] mb-3" size={24} />
              <div className="text-3xl font-black">{totalRuns}</div>
              <div className="text-sm text-gray-400 font-medium">Completed Runs</div>
            </div>
            <div className="glass-card rounded-3xl p-6 flex flex-col items-start">
              <Activity className="text-[var(--color-volt)] mb-3" size={24} />
              <div className="text-3xl font-black">{upcomingRuns.length}</div>
              <div className="text-sm text-gray-400 font-medium">Upcoming RSVPs</div>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Calendar className="text-[var(--color-volt)]" size={20} />
              My Schedule
            </h3>

            {loadingData ? (
              <div className="animate-pulse flex flex-col gap-4">
                <div className="h-16 bg-white/5 rounded-xl w-full"></div>
                <div className="h-16 bg-white/5 rounded-xl w-full"></div>
              </div>
            ) : myRuns.length > 0 ? (
              <div className="flex flex-col gap-3">
                {myRuns.map(reg => (
                  <div key={reg.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                    <div>
                      <h4 className="font-bold text-[15px]">{reg.run.title}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {format(new Date(reg.run.date_time), 'MMM do, yyyy • h:mm a')}
                      </p>
                    </div>
                    {reg.run.status === 'upcoming' ? (
                      <button 
                        onClick={() => cancelRsvp(reg.id)}
                        className="text-red-400 hover:text-red-300 p-2 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                      >
                        Cancel <Trash2 size={14} />
                      </button>
                    ) : (
                      <div className="px-3 py-1 rounded bg-white/10 text-xs font-bold text-gray-300 uppercase tracking-wider">
                        {reg.status === 'checked_in' ? 'Attended' : 'Missed'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                You haven't RSVP'd to any runs yet.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
