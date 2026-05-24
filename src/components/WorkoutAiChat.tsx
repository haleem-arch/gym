import { useEffect } from 'react';
import { useAiAgent } from '../hooks/useAiAgent';
import { Bot, Loader2, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Basic markdown rendering
const MessageText = ({ text }: { text: string }) => {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;
        const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
          p.startsWith('**') && p.endsWith('**')
            ? <strong key={j} className="font-semibold text-white">{p.slice(2, -2)}</strong>
            : p
        );
        const isBullet = /^[-•*]\s/.test(line);
        return (
          <div key={i} className={`flex ${isBullet ? 'gap-2' : ''}`}>
            {isBullet && <span className="text-primary mt-0.5 flex-shrink-0">•</span>}
            <span>{isBullet ? parts.map((p, _j) => typeof p === 'string' ? p.replace(/^[-•*]\s/, '') : p) : parts}</span>
          </div>
        );
      })}
    </div>
  );
};

interface WorkoutAiChatProps {
  workout: any;
  exercises: any[];
  onClose: () => void;
}

export const WorkoutAiChat = ({ workout, exercises, onClose }: WorkoutAiChatProps) => {
  const storageKey = `workout_chat_${workout.id}`;
  const { messages, isTyping, sendInvisibleMessage, initChat } = useAiAgent({ storageKey, mode: 'workout' });

  // Initialize and trigger analysis if empty
  useEffect(() => {
    initChat().then(() => {
      // If there are no messages in this isolated chat history, trigger the analysis automatically
      const saved = localStorage.getItem(storageKey);
      const parsed = saved ? JSON.parse(saved) : [];
      if (parsed.length === 0) {
        // Build the analysis prompt
        let exSummary = '';
        exercises.forEach(ex => {
          const name = ex.exercises?.name || 'Unknown';
          const completedSets = ex.sets.filter((s: any) => s.done);
          if (completedSets.length > 0) {
            const setStrs = completedSets.map((s: any) => `${s.weight}kg x ${s.reps}`).join(', ');
            exSummary += `- ${name}: ${setStrs}\n`;
          }
        });
        
        const prompt = `Perform a clinical-grade, highly analytical strength and conditioning analysis of this gym session:
Date: ${workout.date}
Session Type: ${workout.day_type}
Total Volume Lifted: ${workout.total_volume}kg

Exercise Log:
${exSummary}

Deconstruct my performance. Specifically analyze set-to-set mechanical tension, rep drops, potential early peripheral fatigue, and load selection consistency. Provide serious physiological feedback and suggest scientific adjustments. Keep the explanation concise and professional.`;

        sendInvisibleMessage(prompt);
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
      className="fixed inset-x-0 bottom-0 z-[100] flex flex-col bg-background border-t border-gray-800 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] max-w-lg mx-auto"
      style={{ height: '85dvh' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-surface/50 rounded-t-3xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40">
            <Sparkles size={16} className="text-primary animate-pulse" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm tracking-tight">Coach Analysis</h3>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{workout.day_type} Session</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-full transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Chat Area / Feedback Box */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3 no-scrollbar pb-10">
        {messages.length === 0 && isTyping && (
           <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-3 py-20">
             <Bot size={40} className="text-gray-700" />
             <p className="text-xs font-bold uppercase tracking-wider animate-pulse">Analyzing your session...</p>
           </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            msg.role === 'model' && (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex w-full justify-start"
              >
                <div className="w-full bg-surface border border-gray-800 text-gray-200 rounded-2xl px-5 py-4 leading-relaxed text-sm shadow-md">
                  <MessageText text={msg.text} />
                </div>
              </motion.div>
            )
          ))}

          {isTyping && messages.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-surface border border-gray-800 rounded-2xl px-4 py-3 flex items-center gap-2.5">
                <Loader2 size={14} className="animate-spin text-primary flex-shrink-0" />
                <span className="text-xs text-gray-400">Updating analysis...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
