import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EMOJIS = [
  { value: 1, label: '😠', description: 'Bad' },
  { value: 2, label: '🙁', description: 'Poor' },
  { value: 3, label: '😐', description: 'OK' },
  { value: 4, label: '🙂', description: 'Good' },
  { value: 5, label: '😍', description: 'Great' }
];

export default function Feedback() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id);
      } else {
        // Redirect to Auth/Profile page if not logged in
        navigate('/profile');
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setErrorMsg('You must be logged in to submit feedback.');
      return;
    }
    if (!rating) {
      setErrorMsg('Please select a rating emoji.');
      return;
    }
    if (!message.trim()) {
      setErrorMsg('Please write a short message.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase
        .from('feedbacks')
        .insert([
          {
            user_id: userId,
            rating,
            message: message.trim()
          }
        ]);

      if (error) throw error;

      setSubmitted(true);
      // Redirect back to home after 2.5 seconds
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

  return (
    <div className="p-5 flex flex-col gap-6 min-h-full pb-28 text-gray-200">
      
      {/* Title */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <MessageSquare className="text-blue-500" /> Share Feedback
        </h1>
        <p className="text-sm text-gray-400">
          Tell us about your experience so we can make Life Gym even better!
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.form
            key="feedback-form"
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Rating Selector */}
            <div className="p-5 bg-surface border border-gray-800 rounded-3xl space-y-4 shadow-lg">
              <label className="text-xs font-black uppercase tracking-wider text-gray-400 block text-center">
                How is your overall experience?
              </label>
              
              <div className="flex justify-between items-center max-w-xs mx-auto pt-2">
                {EMOJIS.map((emoji) => {
                  const isSelected = rating === emoji.value;
                  return (
                    <button
                      key={emoji.value}
                      type="button"
                      onClick={() => setRating(emoji.value)}
                      className={`relative flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all ${
                        isSelected 
                          ? 'bg-blue-600/10 border border-blue-500/30 scale-110 shadow-md shadow-blue-500/5' 
                          : 'border border-transparent hover:bg-gray-900/40 active:scale-95'
                      }`}
                      style={{ transform: 'translateZ(0)' }} // Enable hardware acceleration
                    >
                      <span className="text-3xl filter drop-shadow select-none leading-none">
                        {emoji.label}
                      </span>
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${
                        isSelected ? 'text-blue-400' : 'text-gray-500'
                      }`}>
                        {emoji.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message Area */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
                Your Comments & Suggestions
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What can we improve? What do you like the most?"
                rows={5}
                className="w-full bg-surface border border-gray-800 rounded-2xl p-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all resize-none shadow-inner"
              />
            </div>

            {/* Error Message */}
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-2.5 text-xs text-red-400"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={submitting}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer border-0"
              style={{ transform: 'translateZ(0)' }} // Enable hardware acceleration
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
            className="p-6 bg-surface border border-gray-800 rounded-3xl text-center space-y-4 shadow-xl py-12"
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            style={{ transform: 'translateZ(0)' }}
          >
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1, damping: 15 }}
              >
                <CheckCircle2 className="w-16 h-16 text-emerald-500" />
              </motion.div>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-white uppercase tracking-wider">Thank You!</h3>
              <p className="text-xs text-gray-400">
                Your feedback has been submitted successfully to the coaching team.
              </p>
            </div>
            <p className="text-[10px] text-zinc-550 pt-4 animate-pulse uppercase tracking-widest font-black">
              Redirecting back to dashboard...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
