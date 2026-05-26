'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { Download, Search, ShieldAlert, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function MemberDirectory() {
  const [members, setMembers] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchMembers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (!error && data) setMembers(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const promoteToAdmin = async (id: string) => {
    if (!confirm('Promote this user to Admin?')) return;
    const { error } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', id);
    if (error) {
      toast.error('Failed to promote user.');
    } else {
      toast.success('User is now an admin.');
      fetchMembers();
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user completely?')) return;
    
    // Note: Due to Supabase auth relations, deleting from 'profiles' deletes the profile,
    // but the auth.user remains unless deleted via Edge Function/Admin API.
    // For this UI, we delete the profile and registrations cascade delete.
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    
    if (error) {
      toast.error('Failed to delete user.');
    } else {
      toast.success('User profile deleted.');
      fetchMembers();
    }
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Gender', 'Role', 'Joined Date'];
    const csvContent = [
      headers.join(','),
      ...members.map(m => `"${m.full_name}","${m.email}","${m.phone || ''}","${m.gender}","${m.role}","${m.created_at}"`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `run_club_members_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Export downloaded!');
  };

  const filteredMembers = members.filter(m => 
    m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Member Directory</h1>
        <button onClick={exportCSV} className="flex items-center gap-2 bg-[var(--color-volt)] text-black px-4 py-2 rounded-xl text-sm font-bold hover:bg-[var(--color-volt-hover)] transition-colors">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 bg-black/50 border border-white/10 px-4 py-2.5 rounded-xl mb-6">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-gray-400">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Phone</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">Loading members...</td>
                </tr>
              ) : filteredMembers.map(m => (
                <tr key={m.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  <td className="py-3 font-medium">{m.full_name}</td>
                  <td className="py-3 text-gray-400">{m.email}</td>
                  <td className="py-3 text-gray-400">{m.phone || '-'}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${m.role === 'admin' ? 'bg-[var(--color-volt)]/20 text-[var(--color-volt)]' : 'bg-white/10 text-gray-300'}`}>
                      {m.role}
                    </span>
                  </td>
                  <td className="py-3 text-right flex items-center justify-end gap-2">
                    {m.role !== 'admin' && (
                      <button onClick={() => promoteToAdmin(m.id)} title="Promote to Admin" className="p-1.5 text-gray-400 hover:text-[var(--color-volt)] hover:bg-[var(--color-volt)]/10 rounded-md transition-colors">
                        <ShieldAlert size={16} />
                      </button>
                    )}
                    <button onClick={() => deleteUser(m.id)} title="Delete User" className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors">
                      <Trash2 size={16} />
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
