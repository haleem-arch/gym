'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { format } from 'date-fns';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

type Run = Database['public']['Tables']['runs']['Row'];

const runSchema = z.object({
  title: z.string().min(3),
  date: z.string(),
  time: z.string(),
  location_name: z.string().min(3),
  distance_km: z.string().min(1),
  max_capacity: z.string().optional(),
  target_paces: z.string(),
});

export default function RunManager() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm<z.infer<typeof runSchema>>({
    resolver: zodResolver(runSchema),
    defaultValues: {
      title: '',
      date: '',
      time: '',
      location_name: '',
      distance_km: '5',
      max_capacity: '',
      target_paces: '5:00/km, 6:00/km',
    }
  });

  const fetchRuns = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('runs')
      .select('*')
      .order('date_time', { ascending: false });
      
    if (!error && data) setRuns(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  const onSubmit = async (values: z.infer<typeof runSchema>) => {
    setIsCreating(true);
    const dateTime = new Date(`${values.date}T${values.time}`).toISOString();
    
    const { error } = await supabase.from('runs').insert({
      title: values.title,
      date_time: dateTime,
      location_name: values.location_name,
      distance_km: parseFloat(values.distance_km),
      max_capacity: values.max_capacity ? parseInt(values.max_capacity, 10) : null,
      target_paces: values.target_paces.split(',').map(s => s.trim()),
      status: 'upcoming'
    });

    setIsCreating(false);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Run created successfully!');
      form.reset();
      fetchRuns();
    }
  };

  const deleteRun = async (id: string) => {
    if (!confirm('Are you sure you want to delete this run?')) return;
    
    const { error } = await supabase.from('runs').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete run.');
    } else {
      toast.success('Run deleted.');
      fetchRuns();
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Run Manager</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create Form */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Plus size={18} className="text-[var(--color-volt)]" /> Create New Run
            </h2>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1 block">TITLE</label>
                <input {...form.register('title')} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[var(--color-volt)] outline-none" placeholder="Saturday Long Run" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1 block">DATE</label>
                  <input type="date" {...form.register('date')} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[var(--color-volt)] outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1 block">TIME</label>
                  <input type="time" {...form.register('time')} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[var(--color-volt)] outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1 block">LOCATION</label>
                <input {...form.register('location_name')} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[var(--color-volt)] outline-none" placeholder="Gate 6 Loop" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1 block">DISTANCE (KM)</label>
                  <input type="number" step="0.1" {...form.register('distance_km')} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[var(--color-volt)] outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1 block">MAX CAPACITY</label>
                  <input type="number" {...form.register('max_capacity')} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[var(--color-volt)] outline-none" placeholder="Optional" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1 block">TARGET PACES (Comma separated)</label>
                <input {...form.register('target_paces')} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[var(--color-volt)] outline-none" placeholder="4:30/km, 5:30/km" />
              </div>
              <button disabled={isCreating} className="w-full bg-white text-black font-bold py-2.5 rounded-xl hover:bg-gray-200 transition-colors mt-2 flex justify-center items-center h-10">
                {isCreating ? <Loader2 size={18} className="animate-spin" /> : 'Publish Run'}
              </button>
            </form>
          </div>
        </div>

        {/* Runs List */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {isLoading ? (
            <div className="animate-pulse h-20 bg-white/5 rounded-xl w-full"></div>
          ) : runs.map(run => (
            <div key={run.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
              <div>
                <h4 className="font-bold text-[15px] flex items-center gap-2">
                  {run.title}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${run.status === 'upcoming' ? 'bg-[var(--color-volt)]/20 text-[var(--color-volt)]' : 'bg-white/10 text-gray-400'}`}>
                    {run.status}
                  </span>
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  {format(new Date(run.date_time), 'MMM do, yyyy • h:mm a')} | {run.distance_km}km | {run.location_name}
                </p>
              </div>
              <button onClick={() => deleteRun(run.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
