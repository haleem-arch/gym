import { useEffect, useRef, useState } from 'react';
import { useAiAgent } from '../hooks/useAiAgent';
import { Send, Bot, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

// ─── Swipe-to-delete wrapper ──────────────────────────────────────────────────
const SwipeToDelete = ({ children, onDelete }: { children: React.ReactNode; onDelete: () => void }) => {
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const threshold = 72;

  const onTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setSwiping(true);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!swiping) return;
    const delta = e.touches[0].clientX - startX;
    if (delta < 0) setOffsetX(Math.max(delta, -threshold - 20));
  };
  const onTouchEnd = () => {
    setSwiping(false);
    if (offsetX <= -threshold) {
      onDelete();
    }
    setOffsetX(0);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Red delete background */}
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-center bg-red-600 px-5 transition-opacity"
        style={{ opacity: offsetX < -10 ? 1 : 0 }}
      >
        <Trash2 size={16} className="text-white" />
      </div>
      {/* Sliding content */}
      <div
        style={{ transform: `translateX(${offsetX}px)`, transition: swiping ? 'none' : 'transform 0.25s ease', background: '#1a1f2e' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};

const AiCoach = () => {
  const { messages, isTyping, sendMessage, initChat, startNewChat, executeActions, updateMessageStatus, setMessages } = useAiAgent();
  const [input, setInput] = useState('');
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { initChat(); }, []);

  useEffect(() => {
    const dStr = localStorage.getItem('athlete_dashboard_selected_date') || new Date().toISOString().split('T')[0];
    try {
      const parts = dStr.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      const formatted = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      setSelectedDateStr(formatted);
    } catch (e) {
      setSelectedDateStr(dStr);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e as any); }
  };

  const handleChipClick = (promptText: string) => {
    if (isTyping) return;
    sendMessage(promptText);
  };

  const handleDeleteItem = (msgId: string, itemIdx: number) => {
    setMessages((prev: any) => prev.map((m: any) => {
      if (m.id === msgId && m.actions) {
        const updatedActions = m.actions.map((act: any) => {
          if (act.table === 'diet_meals' && act.data?.items) {
            const updatedItems = act.data.items.filter((_: any, idx: number) => idx !== itemIdx);
            return {
              ...act,
              data: {
                ...act.data,
                items: updatedItems
              }
            };
          }
          return act;
        });
        return {
          ...m,
          actions: updatedActions
        };
      }
      return m;
    }));
  };

  const handleAcceptActions = async (msg: any) => {
    if (!msg.actions || msg.actions.length === 0) return;
    
    const validActions = msg.actions.filter((act: any) => {
      if (act.table === 'diet_meals' && (!act.data?.items || act.data.items.length === 0)) {
        return false;
      }
      return true;
    });

    if (validActions.length > 0) {
      const { success, errorMsg } = await executeActions(validActions);
      if (success) {
        setMessages((prev: any) => prev.map((m: any) => {
          if (m.id === msg.id) {
            return {
              ...m,
              text: m.text + "\n\n*(✓ Successfully saved to your diet)*",
              actionStatus: 'accepted'
            };
          }
          return m;
        }));
      } else {
        alert("Failed to save: " + (errorMsg || "Unknown error"));
      }
    } else {
      handleRejectActions(msg);
    }
  };

  const handleRejectActions = (msg: any) => {
    updateMessageStatus(msg.id, 'rejected');
    setTimeout(() => {
      setMessages((prev: any) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'model',
          text: "No problem! How else can I help you today?"
        }
      ]);
    }, 400);
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-background z-20 pb-[82px]">
      {/* Header */}
      <div className="bg-surface/90 backdrop-blur-md px-5 py-3 border-b border-gray-800 sticky top-0 z-30 flex items-center justify-between shadow-lg flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40">
            <Sparkles size={15} className="text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm tracking-tight">AI Coach</h1>
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
          {messages.map((msg) => {
            // Extract meal items from actions if pending
            const mealAction = msg.actions?.find((a: any) => a.table === 'diet_meals' && a.data?.items);
            const isPending = msg.actionStatus === 'pending';
            const isAccepted = msg.actionStatus === 'accepted';

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex flex-col w-full ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Message bubble */}
                <div
                  className={`
                    text-sm leading-relaxed break-words
                    ${msg.role === 'user'
                      ? 'max-w-[80%] bg-primary text-white rounded-2xl rounded-tr-sm px-4 py-2.5'
                      : 'max-w-[90%] bg-surface border border-gray-800 text-gray-200 rounded-2xl rounded-tl-sm px-4 py-3'
                    }
                  `}
                  style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                >
                  {msg.role === 'model' ? <MessageText text={msg.text} /> : msg.text}
                </div>

                {/* Meal confirmation card — only shown while pending */}
                {msg.role === 'model' && mealAction && isPending && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.25 }}
                    className="mt-2 w-full max-w-[90%] bg-surface border border-primary/30 rounded-2xl overflow-hidden shadow-lg shadow-primary/10"
                  >
                    {/* Card header */}
                    <div className="px-4 pt-3 pb-2 border-b border-gray-800/60 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white tracking-tight">🥗 Suggested Meal</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Swipe left on any item to remove it</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-primary">
                          {mealAction.data.items.reduce((sum: number, it: any) => sum + (it.macros?.kcal || 0), 0)} kcal
                        </p>
                        <p className="text-[10px] text-gray-500">
                          P:{mealAction.data.items.reduce((s: number, it: any) => s + (it.macros?.protein || 0), 0).toFixed(0)}g·
                          C:{mealAction.data.items.reduce((s: number, it: any) => s + (it.macros?.carbs || 0), 0).toFixed(0)}g·
                          F:{mealAction.data.items.reduce((s: number, it: any) => s + (it.macros?.fat || 0), 0).toFixed(0)}g
                        </p>
                      </div>
                    </div>

                    {/* Food items list — swipeable delete */}
                    <div className="divide-y divide-gray-800/50">
                      {mealAction.data.items.map((item: any, idx: number) => (
                        <SwipeToDelete
                          key={`${msg.id}-${idx}`}
                          onDelete={() => handleDeleteItem(msg.id, idx)}
                        >
                          <div className="flex items-center justify-between px-4 py-2.5">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white font-medium truncate">{item.name}</p>
                              <p className="text-[10px] text-gray-500">{item.grams}g</p>
                            </div>
                            <div className="text-right flex-shrink-0 ml-3">
                              <p className="text-xs font-bold text-primary">{item.macros?.kcal || 0} kcal</p>
                              <p className="text-[10px] text-gray-600">
                                P:{(item.macros?.protein || 0).toFixed(0)} C:{(item.macros?.carbs || 0).toFixed(0)} F:{(item.macros?.fat || 0).toFixed(0)}
                              </p>
                            </div>
                          </div>
                        </SwipeToDelete>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div className="flex border-t border-gray-800/60">
                      <button
                        onClick={() => handleRejectActions(msg)}
                        className="flex-1 py-3 text-sm font-bold text-gray-500 hover:text-gray-300 hover:bg-gray-800/40 transition-colors"
                      >
                        Dismiss
                      </button>
                      <div className="w-px bg-gray-800/60" />
                      <button
                        onClick={() => handleAcceptActions(msg)}
                        className="flex-1 py-3 text-sm font-bold text-primary hover:bg-primary/10 transition-colors"
                      >
                        Save to Diet ✓
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Accepted state badge */}
                {msg.role === 'model' && mealAction && isAccepted && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-emerald-500 font-semibold">
                    <span>✓</span><span>Saved to your diet</span>
                  </div>
                )}
              </motion.div>
            );
          })}

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
      </div>

      {/* Suggestions Chips */}
      {!isTyping && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-4 py-2 bg-background border-t border-gray-900/60 flex-shrink-0">
          <button
            type="button"
            onClick={() => handleChipClick(`Analyze my readiness for ${selectedDateStr || 'my selected date'}`)}
            className="flex items-center gap-1.5 bg-surface/40 border border-gray-800 hover:border-primary/50 text-[10px] uppercase tracking-wider text-gray-300 font-black px-3.5 py-2 rounded-xl transition-all active:scale-95 whitespace-nowrap cursor-pointer hover:text-white"
          >
            <span>🔋</span>
            <span>Readiness Report</span>
          </button>
          <button
            type="button"
            onClick={() => handleChipClick("Review my workout volume progress")}
            className="flex items-center gap-1.5 bg-surface/40 border border-gray-800 hover:border-primary/50 text-[10px] uppercase tracking-wider text-gray-300 font-black px-3.5 py-2 rounded-xl transition-all active:scale-95 whitespace-nowrap cursor-pointer hover:text-white"
          >
            <span>🏋️‍♂️</span>
            <span>Workout Progress</span>
          </button>
          <button
            type="button"
            onClick={() => handleChipClick("Suggest a meal breakdown for my REST split today")}
            className="flex items-center gap-1.5 bg-surface/40 border border-gray-800 hover:border-primary/50 text-[10px] uppercase tracking-wider text-gray-300 font-black px-3.5 py-2 rounded-xl transition-all active:scale-95 whitespace-nowrap cursor-pointer hover:text-white"
          >
            <span>🥗</span>
            <span>Meal Breakdown</span>
          </button>
        </div>
      )}

      {/* Input — sticky at bottom */}
      <div className="p-3 bg-background border-t border-gray-800 sticky bottom-0 z-30 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex items-end gap-2 relative">
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
            onKeyDown={handleKeyDown}
            placeholder="Log a meal, ask about progress, change plan..."
            rows={1}
            className="flex-1 bg-surface border border-gray-700 rounded-2xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-primary transition-colors resize-none overflow-hidden leading-relaxed"
            style={{ minHeight: '46px', maxHeight: '120px' }}
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
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
