'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email({ message: 'Valid email required' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const signupSchema = z.object({
  email: z.string().email({ message: 'Valid email required' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  fullName: z.string().min(2, { message: 'Full name required' }),
  phone: z.string().min(5, { message: 'Phone number required' }),
  gender: z.enum(['Male', 'Female', 'Unspecified']),
});

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '', fullName: '', phone: '', gender: 'Unspecified' }
  });

  const onLogin = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    setIsLoading(false);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back!");
      onClose();
    }
  };

  const onSignup = async (values: z.infer<typeof signupSchema>) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
          phone: values.phone,
          gender: values.gender,
        }
      }
    });
    setIsLoading(false);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created successfully!");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-md bg-[var(--color-surface)] border border-white/10 rounded-2xl overflow-hidden relative shadow-2xl"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="p-8">
              <h2 className="text-2xl font-bold mb-1">
                {mode === 'login' ? 'Welcome Back' : 'Join Stride Club'}
              </h2>
              <p className="text-sm text-gray-400 mb-6">
                {mode === 'login' ? 'Enter your credentials to access your dashboard.' : 'Sign up to RSVP for upcoming runs.'}
              </p>

              {mode === 'login' ? (
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-400 mb-1 block">EMAIL</label>
                    <input 
                      {...loginForm.register('email')}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-volt)] transition-colors"
                      placeholder="runner@example.com"
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-400 mb-1 block">PASSWORD</label>
                    <input 
                      type="password"
                      {...loginForm.register('password')}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-volt)] transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <button 
                    disabled={isLoading}
                    className="w-full mt-2 bg-[var(--color-volt)] text-black font-bold py-3 rounded-xl hover:bg-[var(--color-volt-hover)] transition-colors disabled:opacity-50 flex items-center justify-center h-[48px]"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Log In"}
                  </button>
                  
                  <div className="mt-4 text-center text-sm text-gray-400">
                    Don't have an account?{' '}
                    <button type="button" onClick={() => setMode('signup')} className="text-white hover:text-[var(--color-volt)] font-medium transition-colors">
                      Sign Up
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={signupForm.handleSubmit(onSignup)} className="flex flex-col gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-400 mb-1 block">FULL NAME</label>
                    <input 
                      {...signupForm.register('fullName')}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-volt)] transition-colors"
                      placeholder="Eliud Kipchoge"
                    />
                    {signupForm.formState.errors.fullName && (
                      <p className="text-red-500 text-xs mt-1">{signupForm.formState.errors.fullName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-400 mb-1 block">EMAIL</label>
                    <input 
                      {...signupForm.register('email')}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-volt)] transition-colors"
                      placeholder="runner@example.com"
                    />
                    {signupForm.formState.errors.email && (
                      <p className="text-red-500 text-xs mt-1">{signupForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-400 mb-1 block">PHONE</label>
                      <input 
                        {...signupForm.register('phone')}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-volt)] transition-colors"
                        placeholder="+1 234 567 890"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-400 mb-1 block">GENDER</label>
                      <select 
                        {...signupForm.register('gender')}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-volt)] transition-colors appearance-none"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Unspecified">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-400 mb-1 block">PASSWORD</label>
                    <input 
                      type="password"
                      {...signupForm.register('password')}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-volt)] transition-colors"
                      placeholder="••••••••"
                    />
                    {signupForm.formState.errors.password && (
                      <p className="text-red-500 text-xs mt-1">{signupForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  
                  <button 
                    disabled={isLoading}
                    className="w-full mt-2 bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center h-[48px]"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Create Account"}
                  </button>
                  
                  <div className="mt-3 text-center text-sm text-gray-400">
                    Already have an account?{' '}
                    <button type="button" onClick={() => setMode('login')} className="text-white hover:text-[var(--color-volt)] font-medium transition-colors">
                      Log In
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
