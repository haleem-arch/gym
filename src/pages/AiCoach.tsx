import { useEffect, useRef, useState } from 'react';
import { useAiAgent } from '../hooks/useAiAgent';
import { Send, Bot, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { SwipeToDeleteRow } from '../components/SwipeToDeleteRow';

const BrandLogo = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 512 512"
    xmlns="http://www.w3.org/2000/svg"
    shapeRendering="geometricPrecision"
    className="overflow-visible"
  >
    <g transform="translate(256 256) rotate(-45)">
      {/* Bar/Handle */}
      <rect x="-120" y="-16" width="240" height="32" rx="8" fill="#e2e8f0" />

      {/* Left weight plates */}
      <g>
        <rect x="-110" y="-60" width="30" height="120" rx="8" fill="#3b82f6" />
        <rect x="-150" y="-80" width="30" height="160" rx="10" fill="#3b82f6" />
        <rect x="-170" y="-40" width="10" height="80" rx="4" fill="#60a5fa" />
      </g>

      {/* Right weight plates */}
      <g>
        <rect x="80"  y="-60" width="30" height="120" rx="8" fill="#3b82f6" />
        <rect x="120" y="-80" width="30" height="160" rx="10" fill="#3b82f6" />
        <rect x="160" y="-40" width="10" height="80" rx="4" fill="#60a5fa" />
      </g>
    </g>
  </svg>
);

const parseMessageContent = (text: string) => {
  const statusRegex = /\n\n(\*\(✓ [^*]+\)\*|\*\(⚠ [^*]+\)\*)$/;
  const match = text.match(statusRegex);
  
  if (match) {
    const statusText = match[1];
    const coreText = text.replace(statusRegex, '').trim();
    return {
      coreText,
      statusText,
    };
  }
  
  const trimmed = text.trim();
  const isPureStatus = trimmed.startsWith('*(✓') || 
                       trimmed.startsWith('*(⚠') || 
                       trimmed.startsWith('⏱️') || 
                       trimmed.startsWith('🤖') || 
                       trimmed.startsWith('✓') || 
                       trimmed.startsWith('⚠️') || 
                       trimmed.includes('saved to database') || 
                       trimmed.includes('Saved successfully') ||
                       trimmed.includes('capacity. Please try again') ||
                       trimmed.includes('busy right now');
                       
  if (isPureStatus) {
    return {
      coreText: '',
      statusText: text,
    };
  }
  
  return {
    coreText: text,
    statusText: null,
  };
};

const RenderStatusCard = ({ text }: { text: string }) => {
  const isSuccess = text.includes('✓') || text.includes('saved');
  const cleanText = text
    .replace(/^\*\(/, '')
    .replace(/\)\*$/, '')
    .replace(/^\*|\*$/g, '')
    .replace(/^✓\s*/, '')
    .replace(/^⚠\s*/, '')
    .trim();

  return (
    <div className={`w-full max-w-[90%] flex items-start gap-3 p-3.5 rounded-[15px] border ${
      isSuccess 
        ? 'bg-emerald-500/5 border-emerald-500/15 text-emerald-300' 
        : 'bg-amber-500/5 border-amber-500/15 text-amber-300'
    } shadow-md`}>
      <span className="flex-shrink-0 mt-0.5">
        {isSuccess ? <CheckCircle2 size={16} className="text-emerald-400" /> : <AlertCircle size={16} className="text-amber-400" />}
      </span>
      <div className="text-xs leading-relaxed font-semibold">
        {cleanText}
      </div>
    </div>
  );
};

// Renders model text with line breaks and basic markdown (bold, bullets)
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

const getFoodEmoji = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('egg')) return '🥚';
  if (n.includes('oat') || n.includes('porridge')) return '🥣';
  if (n.includes('banana')) return '🍌';
  if (n.includes('honey')) return '🍯';
  if (n.includes('bread') || n.includes('baladi') || n.includes('toast') || n.includes('aish')) return '🍞';
  if (n.includes('milk') || n.includes('yogurt') || n.includes('labneh') || n.includes('cheese') || n.includes('skyr') || n.includes('cottage')) return '🥛';
  if (n.includes('apple')) return '🍎';
  if (n.includes('date') || n.includes('palm')) return '🌴';
  if (n.includes('tuna') || n.includes('fish') || n.includes('salmon')) return '🐟';
  if (n.includes('rice')) return '🍚';
  if (n.includes('chicken') || n.includes('breast') || n.includes('poultry')) return '🍗';
  if (n.includes('beef') || n.includes('steak') || n.includes('meat')) return '🥩';
  if (n.includes('protein') || n.includes('shake') || n.includes('whey')) return '🥤';
  if (n.includes('potato') || n.includes('sweet potato')) return '🍠';
  if (n.includes('peanut') || n.includes('butter') || n.includes('almond') || n.includes('nut')) return '🥜';
  if (n.includes('oil') || n.includes('olive')) return '🫒';
  if (n.includes('salad') || n.includes('lettuce') || n.includes('vegetable')) return '🥗';
  if (n.includes('pasta') || n.includes('spaghetti')) return '🍝';
  return '🍽️';
};

const DraftMealBox = ({ initialData, onComplete, showHydration }: { initialData: any; onComplete: (saved: boolean) => void; showHydration: boolean }) => {
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
      window.dispatchEvent(new CustomEvent('diet_updated'));
      onComplete(true);
    } catch (err) {
      console.error("Failed to save draft meal", err);
      alert("Failed to save meal");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => onComplete(false);

  if (!data || data.items.length === 0) {
    return (
      <div className="mt-3 p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between opacity-50">
        <span className="text-xs text-gray-500">Draft empty</span>
        <button onClick={handleDiscard} className="text-[10px] uppercase font-bold text-gray-400">Dismiss</button>
      </div>
    );
  }

  // Calculate totals
  const totals = data.items.reduce((acc: any, item: any) => {
    return {
      kcal: acc.kcal + (item.macros?.kcal || 0),
      protein: acc.protein + (item.macros?.protein || 0),
      carbs: acc.carbs + (item.macros?.carbs || 0),
      fat: acc.fat + (item.macros?.fat || 0)
    };
  }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });

  return (
    <div className="flex flex-col gap-3">
      {/* Meal items */}
      <div className="flex flex-col gap-2">
        {data.items.map((item: any) => (
          <SwipeToDeleteRow key={item.id} onDelete={() => handleDeleteItem(item.id)}>
            <div className="flex items-center justify-between bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2.5 gap-2 w-full">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base flex-shrink-0">{getFoodEmoji(item.name)}</span>
                <span className="text-xs font-semibold text-gray-200 truncate">{item.name}</span>
              </div>
              <span className="text-[11px] text-gray-500 font-medium flex-shrink-0">
                {item.grams}g
              </span>
            </div>
          </SwipeToDeleteRow>
        ))}
      </div>

      {/* Hydration note (pre-workout only) */}
      {showHydration && (
        <div className="flex items-start gap-2.5 bg-blue-500/5 border border-blue-500/15 rounded-xl p-3">
          <span className="text-xs flex-shrink-0 mt-0.5">💧</span>
          <p className="text-[11px] text-blue-300 leading-relaxed">
            Sip water steadily over the next 2 hours. <strong>Don't chug right before training</strong> — it causes bloating and cramps.
          </p>
        </div>
      )}

      {/* Macro Footer */}
      <div className="bg-blue-500/5 border-t border-b border-blue-500/12 py-3 px-1 my-1">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[9px] font-semibold tracking-wider text-gray-500 uppercase">Total Meal Macros</span>
          <span className="font-extrabold text-white text-base">
            {Math.round(totals.kcal)}<span className="text-[11px] text-gray-500 font-medium ml-0.5">kcal</span>
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/5 border border-white/5 rounded-lg py-1.5 px-2 flex flex-col items-center gap-0.5">
            <span className="font-extrabold text-xs text-[#3b82f6]">{Math.round(totals.protein)}g</span>
            <span className="text-[8px] font-bold text-[#3b82f6]/70 uppercase tracking-wider">Protein</span>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-lg py-1.5 px-2 flex flex-col items-center gap-0.5">
            <span className="font-extrabold text-xs text-[#fbbf24]">{Math.round(totals.carbs)}g</span>
            <span className="text-[8px] font-bold text-[#fbbf24]/70 uppercase tracking-wider">Carbs</span>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-lg py-1.5 px-2 flex flex-col items-center gap-0.5">
            <span className="font-extrabold text-xs text-[#a78bfa]">{Math.round(totals.fat)}g</span>
            <span className="text-[8px] font-bold text-[#a78bfa]/70 uppercase tracking-wider">Fat</span>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col gap-2 mt-1">
        <p className="text-xs text-gray-400">Want me to log this meal for you?</p>
        <div className="flex gap-2">
          <button
            onClick={handleDiscard}
            disabled={isSaving}
            className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-300 font-bold text-xs transition-colors border border-white/5 cursor-pointer"
          >
            Not now
          </button>
          <button
            onClick={handleLog}
            disabled={isSaving}
            className="flex-1 py-2 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1 shadow-md shadow-[#3b82f6]/20 cursor-pointer"
          >
            {isSaving ? <Loader2 size={13} className="animate-spin" /> : null}
            <span>Yes, log it ✓</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const AiCoach = () => {
  const { messages, isTyping, sendMessage, updateMessage, initChat, startNewChat, quotaLimit, usageCount, clientName } = useAiAgent();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    initChat();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        supabase.from('profiles').select('targets').eq('id', session.user.id).maybeSingle().then(({ data }) => {
          if (data?.targets?.disable_ai) setIsLocked(true);
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
      <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-200">
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
    // h-full fills the ChatPageTransition container (which is w-full h-full flex flex-col)
    // flex flex-col with min-h-0 on the messages area makes it properly scroll
    <div className="flex flex-col h-full bg-background">

      {/* Header — fixed at top, never scrolls */}
      <div className="flex-shrink-0 bg-surface/90 backdrop-blur-md px-5 py-3 border-b border-gray-800 z-30 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
            <BrandLogo size={18} />
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
        <button onClick={startNewChat} className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors cursor-pointer">
          + New Chat
        </button>
      </div>

      {/* Messages — scrollable, takes remaining height */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-3 no-scrollbar">
        {messages.length === 0 && !isTyping && (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600 gap-3 py-16">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-2 shadow-inner">
              <BrandLogo size={24} />
            </div>
            <p className="text-sm text-center px-4 text-gray-400">Ask me anything about your training or nutrition.</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const hasTiming = !!msg.draftMeal && /pre-workout|before training|before your workout|before your session/i.test(msg.text);

            if (msg.role === 'user') {
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex w-full justify-end"
                >
                  <div className="w-full max-w-[85%] bg-[#1c2434] border border-blue-500/20 rounded-[20px] shadow-xl shadow-black/20 p-4 flex flex-col gap-2 mb-2 ml-auto">
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-extrabold text-blue-400 text-[10px] tracking-widest uppercase">{clientName}</span>
                    </div>
                    <div className="text-xs leading-relaxed text-gray-200 whitespace-pre-wrap">
                      {msg.text}
                    </div>
                  </div>
                </motion.div>
              );
            }

            const { coreText, statusText } = parseMessageContent(msg.text);
            const isCoachMealCard = msg.draftMeal;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex w-full flex-col gap-2.5 items-start mb-2"
              >
                {coreText && (
                  isCoachMealCard ? (
                    /* Layout A: Meal Suggestion Card */
                    <div className="w-full max-w-[90%] bg-[#1a1a22] border border-white/10 rounded-[20px] overflow-hidden shadow-xl shadow-black/35 flex flex-col">
                      {/* Coach Card Header */}
                      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/5 flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                          <BrandLogo size={26} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-xs tracking-wide">Alberto</span>
                          <span className="text-[9px] text-[#3b82f6] font-bold tracking-wider uppercase">Your Coach</span>
                        </div>
                        {hasTiming && (
                          <div className="ml-auto bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold tracking-wider px-2 py-1 rounded-full uppercase">
                            ⚡ 2h to train
                          </div>
                        )}
                      </div>

                      {/* Coach Card Body */}
                      <div className="p-4 flex flex-col gap-3">
                        <div className="text-xs leading-relaxed text-gray-300">
                          <MessageText text={coreText} />
                        </div>

                        <div className="text-[9px] font-extrabold tracking-widest text-[#3b82f6] uppercase mt-2 border-b border-white/5 pb-1">
                          🍴 Suggested Meal
                        </div>

                        <DraftMealBox
                          initialData={msg.draftMeal}
                          showHydration={hasTiming}
                          onComplete={(saved) => {
                            if (saved) {
                              updateMessage(msg.id, { draftMeal: null, text: coreText + "\n\n*(✓ Successfully saved to database)*" });
                            } else {
                              updateMessage(msg.id, { draftMeal: null });
                            }
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    /* Layout B: General Coaching Card */
                    <div className="w-full max-w-[90%] bg-[#1a1a22] border border-white/10 rounded-[20px] overflow-hidden shadow-xl shadow-black/35 flex flex-col">
                      {/* Coach Card Header */}
                      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/5 flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                          <BrandLogo size={26} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-xs tracking-wide">Alberto</span>
                          <span className="text-[9px] text-[#3b82f6] font-bold tracking-wider uppercase">Your Coach</span>
                        </div>
                        {hasTiming && (
                          <div className="ml-auto bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold tracking-wider px-2 py-1 rounded-full uppercase">
                            ⚡ 2h to train
                          </div>
                        )}
                      </div>

                      {/* Coach Card Body */}
                      <div className="p-4 flex flex-col gap-3">
                        <div className="text-xs leading-relaxed text-gray-300">
                          <MessageText text={coreText} />
                        </div>
                      </div>
                    </div>
                  )
                )}

                {statusText && (
                  /* Layout C: Status Banner Card */
                  <RenderStatusCard text={statusText} />
                )}
              </motion.div>
            );
          })}

          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start mb-2">
              <div className="bg-[#1a1a22] border border-white/10 rounded-[20px] px-4 py-3 flex items-center gap-2.5">
                <Loader2 size={14} className="animate-spin text-blue-500 flex-shrink-0" />
                <span className="text-xs text-gray-400">Thinking...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Quota warning */}
      {usageCount >= quotaLimit && (
        <div className="flex-shrink-0 mx-4 my-2 p-3 bg-red-950/25 border border-red-900/30 text-red-300 rounded-xl text-center text-xs font-semibold leading-relaxed flex items-center justify-center gap-1.5">
          🔒 Daily limit of {quotaLimit} messages reached. Ask your coach to raise your limit!
        </div>
      )}

      {/* Input bar */}
      <div className="flex-shrink-0 p-3 bg-background border-t border-gray-800">
        <form onSubmit={handleSubmit} className="flex items-end gap-2 relative">
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
            onKeyDown={handleKeyDown}
            placeholder={usageCount >= quotaLimit ? "Daily quota exceeded." : "Log a meal, ask about progress, change plan..."}
            rows={1}
            className="flex-1 bg-surface border border-gray-700 rounded-2xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors resize-none overflow-hidden leading-relaxed disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ minHeight: '46px', maxHeight: '120px' }}
            disabled={isTyping || usageCount >= quotaLimit}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping || usageCount >= quotaLimit}
            className="absolute right-2 bottom-2 w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 flex items-center justify-center text-white disabled:opacity-40 transition-all hover:scale-105 cursor-pointer"
          >
            <Send size={13} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiCoach;
