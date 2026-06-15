import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MessageSquare, Send, CheckCircle2, AlertCircle, Star } from 'lucide-react';
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
      } else {
        navigate('/client-login');
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
      setErrorMsg('Please select a rating.');
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
            <div className="p-6 bg-surface border border-gray-800 rounded-3xl space-y-5 shadow-lg flex flex-col items-center">
              <label className="text-xs font-black uppercase tracking-wider text-gray-400 block text-center">
                How is your overall experience?
              </label>
              
              {/* Star Row */}
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
                      className="p-1 rounded-full transition-transform active:scale-90 outline-none focus:ring-2 focus:ring-blue-500/20"
                      style={{ transform: 'translateZ(0)' }}
                    >
                      <Star
                        size={36}
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

              {/* Dynamic Selected Rating Badge */}
              <div className="h-6 flex items-center justify-center">
                {currentDetail ? (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider ${currentDetail.color}`}
                  >
                    Rating: {currentDetail.label}
                  </motion.span>
                ) : (
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    Select a rating above
                  </span>
                )}
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
              style={{ transform: 'translateZ(0)' }}
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
