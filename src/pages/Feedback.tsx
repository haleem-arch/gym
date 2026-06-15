import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MessageSquare, Send, CheckCircle2, AlertCircle, Star, User, Mail, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RATING_DETAILS = [
  { value: 1, label: 'Bad', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  { value: 2, label: 'Poor', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { value: 3, label: 'OK', color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20' },
  { value: 4, label: 'Good', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { value: 5, label: 'Great', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
];

export default function Feedback() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);

  
  // Public user inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id);

        // Fetch user details to prefill form
        supabase
          .from('profiles')
          .select('display_name, email, targets')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setName(data.display_name || '');
              setEmail(data.email || '');
              setPhone(data.targets?.phone_number || '');
            }
          });
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Please enter your email.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Please enter your phone number.');
      return;
    }
    if (!rating) {
      setErrorMsg('Please select a star rating.');
      return;
    }
    if (!message.trim()) {
      setErrorMsg('Please write a comments message.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase
        .from('feedbacks')
        .insert([
          {
            user_id: userId || null, // null if anonymous
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            rating,
            message: message.trim()
          }
        ]);

      if (error) throw error;

      setSubmitted(true);
      setTimeout(() => {
        navigate('/');
      }, 2500);

    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      setErrorMsg(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeRating = hoverRating !== null ? hoverRating : rating;
  const currentDetail = RATING_DETAILS.find(d => d.value === rating);

  return (
    <div className="min-h-screen w-full bg-[#060713] flex flex-col items-center justify-center p-4 md:p-12 text-gray-200">
      
      {/* Horizontal split-screen container for desktop, stacked for mobile */}
      <div className="w-full max-w-5xl bg-surface/30 backdrop-blur-md border border-gray-800 rounded-[32px] overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        
        {/* Left Side: Premium Branding & Info Pane (Visible on Desktop) */}
        <div className="hidden md:flex md:col-span-5 flex-col justify-between p-12 bg-gradient-to-br from-blue-950/40 via-[#0a0d16] to-indigo-950/15 border-r border-gray-800/60 relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gray-950/80 border border-gray-800 flex items-center justify-center p-2.5 shadow-inner">
              <img src="/icon.svg" className="w-full h-full object-contain" alt="Life Gym Logo" />
            </div>
            <div className="space-y-2 pt-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">Life Gym Portal</h2>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">
                Your feedback directly impacts the design of training programs, meal templates, and dashboard updates. Tell us what's working and what we can improve!
              </p>
            </div>
          </div>

          <div className="relative z-10 border-t border-gray-850/60 pt-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <MessageSquare size={14} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Need Support?</p>
                <p className="text-xs text-gray-350 font-bold">Contact your coach directly inside the app.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Feedback Form Pane */}
        <div className="p-6 md:p-12 md:col-span-7 flex flex-col justify-center relative">
          
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form
                key="feedback-form"
                onSubmit={handleSubmit}
                className="space-y-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Form Header */}
                <div className="space-y-1">
                  <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <MessageSquare className="text-blue-500 md:hidden" /> Share Feedback
                  </h1>
                  <p className="text-xs text-gray-400">
                    Submit reviews or report problems without logging in.
                  </p>
                </div>

                {/* Identity Inputs (Name, Email, Phone) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name field */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[9px] uppercase tracking-wider text-gray-500 font-black">Full Name</label>
                    <div className="relative">
                      <User size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                      <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="e.g. Captain Ahmed"
                        className="w-full bg-[#121624]/60 border border-gray-800 focus:border-blue-500/50 rounded-xl py-3 pl-10 pr-4 text-xs text-white outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Phone field */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[9px] uppercase tracking-wider text-gray-500 font-black">Phone Number</label>
                    <div className="relative">
                      <Phone size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                      <input 
                        type="text" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        placeholder="e.g. 01128828954"
                        className="w-full bg-[#121624]/60 border border-gray-800 focus:border-blue-500/50 rounded-xl py-3 pl-10 pr-4 text-xs text-white outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email field */}
                  <div className="space-y-1.5 text-left sm:col-span-2">
                    <label className="text-[9px] uppercase tracking-wider text-gray-500 font-black">Email Address</label>
                    <div className="relative">
                      <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                      <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="e.g. user@stride.fit"
                        className="w-full bg-[#121624]/60 border border-gray-800 focus:border-blue-500/50 rounded-xl py-3 pl-10 pr-4 text-xs text-white outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Rating Star Selector */}
                <div className="p-4 bg-[#121624]/40 border border-gray-800/80 rounded-2xl flex flex-col items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                    How is your experience?
                  </span>
                  
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((starValue) => {
                      const isFilled = activeRating !== null && starValue <= activeRating;
                      return (
                        <button
                          key={starValue}
                          type="button"
                          onClick={() => setRating(starValue)}
                          onMouseEnter={() => setHoverRating(starValue)}
                          onMouseLeave={() => setHoverRating(null)}
                          className="p-1 rounded-full transition-transform active:scale-90 outline-none"
                        >
                          <Star
                            size={32}
                            className={`transition-all duration-150 ${
                              isFilled 
                                ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.3)] scale-110' 
                                : 'text-gray-700 hover:text-gray-500'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  <div className="h-5 flex items-center justify-center">
                    {currentDetail ? (
                      <span className={`px-2.5 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-wider ${currentDetail.color}`}>
                        {currentDetail.label}
                      </span>
                    ) : (
                      <span className="text-[9px] text-zinc-650 font-bold uppercase tracking-wider">
                        Tap stars to rate
                      </span>
                    )}
                  </div>
                </div>

                {/* Message Input */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[9px] uppercase tracking-wider text-gray-500 font-black">Comments / Problem Details</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your suggestions or report any issues..."
                    rows={4}
                    className="w-full bg-[#121624]/60 border border-gray-800 focus:border-blue-500/50 rounded-xl p-3 text-xs text-white outline-none transition-colors resize-none"
                  />
                </div>

                {/* Error Message */}
                {errorMsg && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2.5 text-xs text-red-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer border-0"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Submit Feedback
                    </>
                  )}
                </motion.button>
              </motion.form>
            ) : (
              <motion.div
                key="success-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 text-center space-y-4 py-12"
              >
                <div className="flex justify-center">
                  <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-white uppercase tracking-wider">Thank You!</h3>
                  <p className="text-xs text-gray-400">
                    Your feedback has been submitted successfully to the coaching team.
                  </p>
                </div>
                <p className="text-[10px] text-zinc-550 pt-6 animate-pulse uppercase tracking-widest font-black">
                  Redirecting back to dashboard...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
