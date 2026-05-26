'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { LogOut, LayoutDashboard, ShieldAlert, Activity } from 'lucide-react';
import AuthModal from './AuthModal';

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <>
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[var(--color-volt)] flex items-center justify-center">
              <Activity className="text-black" size={18} />
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:block">STRIDE CLUB</span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                {isAdmin && (
                  <Link href="/admin" className="text-sm font-medium text-[var(--color-volt)] flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                    <ShieldAlert size={16} />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}
                <Link href="/dashboard" className="text-sm font-medium text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors">
                  <LayoutDashboard size={16} />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <button 
                  onClick={signOut}
                  className="text-sm font-medium text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors ml-2"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsAuthOpen(true)}
                className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
