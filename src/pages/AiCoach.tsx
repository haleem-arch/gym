import { useEffect, useRef, useState } from 'react';
import { useAiAgent } from '../hooks/useAiAgent';
import { Send, Bot, Loader2, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { SwipeToDeleteRow } from '../components/SwipeToDeleteRow';

// Renders model text with line breaks and basic markdown (bold, bullets)
const MessageText = ({ text }: { text: string }) => {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;
        // Bold: **text**
        const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
          p.startsWith('**') && p.endsWith('**')
            ? <strong key={j} className="font-semibold text-white">{p.slice(2, -2)}</strong>
            : p
        );
        // Bullet detection
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

const DraftMealBox = ({ initialData, onComplete }: { initialData: any; onComplete: (saved: boolean) => void }) => {
  const [data, setData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);

  const handleDeleteItem = (itemId: string) => {
    setData((prev: any) => ({
      ...prev,
      items: prev.items.filter((item: any) => item.id !== itemId)
    }));
  };

  const handleLog = async () => {
    if (data.items.length === 0) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('diet_meals').insert(data);
      if (error) throw error;
      
      // Dispatch an event so the Diet page updates
      window.dispatchEvent(new CustomEvent('diet_updated'));
      onComplete(true);
    } catch (err) {
      console.error("Failed to save draft meal", err);
      alert("Failed to save meal");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    onComplete(false);
  };

  if (!data || data.items.length === 0) {
    return (
      <div className="mt-3 p-3 bg-surface border border-gray-800 rounded-xl flex items-center justify-between opacity-50">
        <span className="text-xs text-gray-500">Draft empty</span>
        <button onClick={handleDiscard} className="text-[10px] uppercase font-bold text-gray-400">Dismiss</button>
      </div>
    );
  }

  const totalKcal = data.items.reduce((acc: number, item: any) => acc + (item.macros?.kcal || 0), 0);

  return (
    <div className="mt-3 bg-surface border border-gray-700/50 rounded-xl overflow-hidden shadow-lg shadow-black/20">
      <div className="bg-gray-800/40 px-3 py-2 border-b border-gray-700/50 flex justify-between items-center">
        <span className="text-xs font-bold text-gray-300 tracking-wide uppercase">Draft Meal</span>
        <span className="text-xs font-black text-white">{Math.round(totalKcal)} kcal</span>
      </div>
      
      <div className="flex flex-col">
        {data.items.map((item: any) => (
          <SwipeToDeleteRow key={item.id} onDelete={() => handleDeleteItem(item.id)}>
            <div className="px-3 py-2.5 border-b border-gray-800/30 flex justify-between items-center bg-surface">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-200">{item.name}</span>
                <span className="text-[10px] text-gray-500">{item.grams}g</span>
              </div>
              <div className="flex gap-2 text-[10px] font-semibold">
                <span className="text-blue-400">{Math.round(item.macros?.protein || 0)}P</span>
                <span className="text-orange-400">{Math.round(item.macros?.carbs || 0)}C</span>
                <span className="text-red-400">{Math.round(item.macros?.fat || 0)}F</span>
              </div>
            </div>
          </SwipeToDeleteRow>
        ))}
      </div>

      <div className="p-2 flex gap-2">
        <button 
          onClick={handleDiscard}
          disabled={isSaving}
          className="flex-1 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs transition-colors"
        >
          Discard
        </button>
        <button 
          onClick={handleLog}
          disabled={isSaving}
          className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 shadow-md shadow-emerald-900/20"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} strokeWidth={3} />} Log
        </button>
      </div>
    </div>
  );
};

const AiCoach = () => {
  const { 
    messages, 
    isTyping, 
    sendMessage, 
    updateMessage, 
    initChat, 
    startNewChat,
    quotaLimit,
    usageCount
  } = useAiAgent();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => { 
    initChat(); 
    
    // Check lock status
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        supabase
          .from('profiles')
          .select('targets')
          .eq('id', session.user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data?.targets?.disable_ai) {
              setIsLocked(true);
            }
          });
      }
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping || usageCount >= quotaLimit) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e as any); }
  };

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 bg-background text-gray-200">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
          <Bot size={28} className="text-red-500" />
        </div>
        <h1 className="text-xl font-black text-white">Section Locked</h1>
        <p className="text-gray-400 text-xs mt-3 max-w-[280px] leading-relaxed">
          This section has been locked by your coach. Please contact your coach if you need access.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background relative" style={{ height: '100dvh' }}>
      {/* Header */}
      <div className="bg-surface/90 backdrop-blur-md px-5 py-3 border-b border-gray-800 sticky top-0 z-30 flex items-center justify-between shadow-lg flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40">
            <Sparkles size={15} className="text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm tracking-tight flex items-center gap-1.5">
              AI Coach
              <span className="text-[9px] bg-blue-500/15 border border-blue-500/30 text-blue-400 px-2 py-0.5 rounded-full font-black select-none tracking-normal">
                ⚡ {quotaLimit === Infinity ? '∞' : `${usageCount}/${quotaLimit}`}
              </span>
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
              Session · {messages.length} msg{messages.length !== 1 && 's'}
            </p>
          </div>
        </div>
        <button
          onClick={startNewChat}
          className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
        >
          + New Chat
        </button>
      </div>

      {/* Chat Area — scrollable, confined */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 no-scrollbar min-h-0">
        {messages.length === 0 && !isTyping && (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600 gap-3 py-16">
            <Bot size={40} />
            <p className="text-sm">Ask me anything about your training or nutrition.</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  text-sm leading-relaxed break-words
                  ${msg.role === 'user'
                    ? 'max-w-[80%] bg-primary text-white rounded-2xl rounded-tr-sm px-4 py-2.5'
                    : 'max-w-[90%] bg-surface border border-gray-800 text-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 overflow-y-auto overflow-x-hidden'
                  }
                `}
                style={msg.role === 'model' ? { maxHeight: '420px', wordBreak: 'break-word', overflowWrap: 'anywhere' } : {}}
              >
                {msg.role === 'model' ? <MessageText text={msg.text} /> : msg.text}
                
                {msg.draftMeal && (
                  <DraftMealBox 
                    initialData={msg.draftMeal} 
                    onComplete={(saved) => {
                      if (saved) {
                        updateMessage(msg.id, { 
                          draftMeal: null, 
                          text: msg.text + "\n\n*(✓ Successfully saved to database)*" 
                        });
                      } else {
                        updateMessage(msg.id, { draftMeal: null });
                      }
                    }}
                  />
                )}
              </div>
            </motion.div>
          ))}

          {/* Single clean thinking indicator — no step-by-step clutter */}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-surface border border-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2.5">
                <Loader2 size={14} className="animate-spin text-primary flex-shrink-0" />
                <span className="text-xs text-gray-400">Thinking...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {usageCount >= quotaLimit && (
        <div className="mx-4 my-2 p-3 bg-red-950/25 border border-red-900/30 text-red-300 rounded-xl text-center text-xs font-semibold leading-relaxed shadow-lg shadow-black/20 flex items-center justify-center gap-1.5">
          🔒 Daily limit of {quotaLimit} messages reached. Ask your coach to raise your limit!
        </div>
      )}

      {/* Input — sticky at bottom */}
      <div className="p-3 bg-background border-t border-gray-800 sticky bottom-0 z-30 flex-shrink-0 pb-20">
        <form onSubmit={handleSubmit} className="flex items-end gap-2 relative">
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
            onKeyDown={handleKeyDown}
            placeholder={usageCount >= quotaLimit ? "Daily quota exceeded." : "Log a meal, ask about progress, change plan..."}
            rows={1}
            className="flex-1 bg-surface border border-gray-700 rounded-2xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-primary transition-colors resize-none overflow-hidden leading-relaxed disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ minHeight: '46px', maxHeight: '120px' }}
            disabled={isTyping || usageCount >= quotaLimit}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping || usageCount >= quotaLimit}
            className="absolute right-2 bottom-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white disabled:opacity-40 disabled:bg-gray-700 transition-all hover:scale-105"
          >
            <Send size={13} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiCoach;
