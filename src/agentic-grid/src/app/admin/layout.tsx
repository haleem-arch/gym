'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { LayoutDashboard, CalendarDays, Users, CheckSquare } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, isLoading]);

  if (isLoading || !isAdmin) return null;

  const navItems = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Run Manager', href: '/admin/runs', icon: CalendarDays },
    { name: 'Member Directory', href: '/admin/members', icon: Users },
    { name: 'Attendance Check-in', href: '/admin/attendance', icon: CheckSquare },
  ];

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-5 py-8 gap-8">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 flex flex-col gap-2">
        <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4 px-4">Command Center</h2>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-[var(--color-volt)] text-black font-bold' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white font-medium'
              }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}
