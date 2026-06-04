import { useEffect, useRef, useState } from 'react';
import { useAiAgent } from '../hooks/useAiAgent';
import type { AiMessage } from '../hooks/useAiAgent';
import { Send, Bot, Loader2, Sparkles, Dumbbell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { SwipeToDeleteRow } from '../components/SwipeToDeleteRow';

const cardStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@600;700&display=swap');

  .user-bubble-custom {
    align-self: flex-end;
    background: #3b82f6;
    color: #fff;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.5;
    padding: 12px 16px;
    border-radius: 18px 18px 4px 18px;
    max-width: 78%;
    word-break: break-word;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  }

  .coach-card-custom {
    width: 100%;
    max-width: 420px;
    background: #111827;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    overflow: hidden;
    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
    display: flex;
    flex-direction: column;
    font-family: 'DM Sans', sans-serif;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .coach-header-custom {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px 12px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  .coach-avatar-custom {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6, #60a5fa);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    flex-shrink: 0;
  }

  .coach-meta-custom {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .coach-name-custom {
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: #fff;
    letter-spacing: 0.02em;
  }

  .coach-tag-custom {
    font-size: 10px;
    font-weight: 500;
    color: #3b82f6;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .timing-badge-custom {
    margin-left: auto;
    background: rgba(59, 130, 246, 0.12);
    border: 1px solid rgba(59, 130, 246, 0.25);
    color: #60a5fa;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.05em;
    padding: 4px 9px;
    border-radius: 20px;
    text-transform: uppercase;
  }

  .coach-body-custom {
    padding: 14px 16px 14px;
    display: flex;
    flex-direction: column;
  }

  .coach-intro-custom {
    font-size: 13.5px;
    font-weight: 400;
    color: #b0b0c0;
    line-height: 1.6;
  }

  .coach-intro-custom strong {
    color: #ffffff;
    font-weight: 500;
  }

  .meal-label-custom {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #3b82f6;
    margin-top: 14px;
    margin-bottom: 8px;
  }

  .meal-items-custom {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 14px;
  }

  .meal-item-custom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 10px;
    padding: 9px 12px;
    gap: 8px;
    animation: fadeIn 0.3s ease both;
    width: 100%;
  }

  .meal-item-custom:nth-child(1) { animation-delay: 0.1s; }
  .meal-item-custom:nth-child(2) { animation-delay: 0.18s; }
  .meal-item-custom:nth-child(3) { animation-delay: 0.26s; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateX(-6px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .item-left-custom {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .item-icon-custom {
    font-size: 16px;
    flex-shrink: 0;
  }

  .item-name-custom {
    font-size: 13px;
    font-weight: 500;
    color: #e8e8f0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-grams-custom {
    font-size: 11px;
    color: #666680;
    font-weight: 400;
    flex-shrink: 0;
    white-space: nowrap;
  }

  .hydration-note-custom {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    background: rgba(56, 189, 248, 0.07);
    border: 1px solid rgba(56, 189, 248, 0.15);
    border-radius: 10px;
    padding: 9px 11px;
    margin-top: 4px;
  }

  .hydration-icon-custom {
    font-size: 14px;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .hydration-text-custom {
    font-size: 12px;
    color: #7dd3f0;
    line-height: 1.5;
  }

  .hydration-text-custom strong {
    color: #bae6fd;
    font-weight: 500;
  }

  .macro-footer-custom {
    background: rgba(59, 130, 246, 0.06);
    border-top: 1px solid rgba(59, 130, 246, 0.12);
    padding: 13px 16px 14px;
  }

  .macro-header-row-custom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .macro-title-custom {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #666680;
  }

  .total-kcal-custom {
    font-family: 'Syne', sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: #fff;
  }

  .total-kcal-custom span {
    font-size: 11px;
    font-weight: 500;
    color: #666680;
    margin-left: 2px;
  }

  .macro-pills-custom {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }

  .macro-pill-custom {
    background: rgba(255,255,255,0.05);
    border-radius: 8px;
    padding: 7px 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .macro-pill-value-custom {
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: #fff;
    line-height: 1;
  }

  .macro-pill-label-custom {
    font-size: 9.5px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .macro-pill-custom.protein .macro-pill-value-custom  { color: #3b82f6; }
  .macro-pill-custom.protein .macro-pill-label-custom  { color: #3b82f6; opacity: 0.7; }
  .macro-pill-custom.carbs   .macro-pill-value-custom  { color: #fbbf24; }
  .macro-pill-custom.carbs   .macro-pill-label-custom  { color: #fbbf24; opacity: 0.7; }
  .macro-pill-custom.fat     .macro-pill-value-custom  { color: #ef4444; }
  .macro-pill-custom.fat     .macro-pill-label-custom  { color: #ef4444; opacity: 0.7; }

  .cta-row-custom {
    padding: 12px 16px 14px;
    border-top: 1px solid rgba(255,255,255,0.05);
  }

  .cta-question-custom {
    font-size: 13px;
    color: #b0b0c0;
    line-height: 1.5;
    margin-bottom: 10px;
  }

  .cta-buttons-custom {
    display: flex;
    gap: 8px;
  }

  .btn-log-custom {
    flex: 1;
    background: #22c55e;
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 10px 0;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .btn-log-custom:hover    { background: #16a34a; }
  .btn-log-custom:active   { transform: scale(0.97); }

  .btn-skip-custom {
    flex: 1;
    background: rgba(255,255,255,0.05);
    color: #888898;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    padding: 10px 0;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
  }

  .btn-skip-custom:hover { background: rgba(255,255,255,0.09); color: #aaa; }
`;

const getTimingBadgeText = (messages: AiMessage[], currentMsgIndex: number) => {
  const currentMsg = messages[currentMsgIndex];
  let text = '';
  
  if (currentMsgIndex > 0) {
    const prevMsg = messages[currentMsgIndex - 1];
    if (prevMsg.role === 'user') {
      text = prevMsg.text;
    }
  } else {
    text = currentMsg.text;
  }
  
  if (!text) return null;
  const hourMatch = text.match(/(\d+)\s*(?:hour|hours|hr|hrs|h)\b/i);
  const minMatch = text.match(/(\d+)\s*(?:min|m|minutes)\b/i);
  const isTraining = text.includes('train') || text.includes('workout') || text.includes('practice') || text.includes('gym');
  
  if (isTraining) {
    if (hourMatch) return `⚡ ${hourMatch[1]}h to train`;
    if (minMatch) return `⚡ ${minMatch[1]}m to train`;
    return `⚡ Train today`;
  }
  return null;
};

const checkHasHydration = (msgText: string, timingBadge: string | null) => {
  const text = msgText.toLowerCase();
  return !!timingBadge || text.includes('water') || text.includes('hydrate') || text.includes('hydration') || text.includes('pre-workout') || text.includes('training');
};

const getItemIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('egg')) return '🥚';
  if (n.includes('bread') || n.includes('toast') || n.includes('aish') || n.includes('baladi') || n.includes('sandwich')) return '🍞';
  if (n.includes('honey') || n.includes('sweetener')) return '🍯';
  if (n.includes('rice') || n.includes('grain')) return '🍚';
  if (n.includes('banana')) return '🍌';
  if (n.includes('oat') || n.includes('porridge') || n.includes('cereal')) return '🥣';
  if (n.includes('milk') || n.includes('yogurt') || n.includes('cheese') || n.includes('dairy') || n.includes('curd')) return '🥛';
  if (n.includes('chicken') || n.includes('poultry') || n.includes('breast')) return '🍗';
  if (n.includes('beef') || n.includes('meat') || n.includes('steak') || n.includes('pork')) return '🥩';
  if (n.includes('fish') || n.includes('salmon') || n.includes('tuna') || n.includes('seafood')) return '🐟';
  if (n.includes('apple')) return '🍎';
  if (n.includes('fruit') || n.includes('berry') || n.includes('berries') || n.includes('strawberry') || n.includes('blueberry')) return '🍓';
  if (n.includes('water')) return '💧';
  if (n.includes('shake') || n.includes('whey') || n.includes('protein')) return '🥛';
  if (n.includes('oil') || n.includes('butter') || n.includes('fat') || n.includes('avocado')) return '🥑';
  return '🥗';
};

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

const CoachCard = ({
  msg,
  messages,
  msgIndex,
  onUpdateMessage
}: {
  msg: AiMessage;
  messages: AiMessage[];
  msgIndex: number;
  onUpdateMessage: (id: string, updates: Partial<AiMessage>) => void;
}) => {
  const [data, setData] = useState(msg.draftMeal);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setData(msg.draftMeal);
  }, [msg.draftMeal]);

  const handleDeleteItem = (itemId: string) => {
    if (!data) return;
    const updatedItems = data.items.filter((item: any) => item.id !== itemId);
    const newData = { ...data, items: updatedItems };
    setData(newData);
    onUpdateMessage(msg.id, { draftMeal: newData });
  };

  const handleLog = async () => {
    if (!data || data.items.length === 0) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('diet_meals').insert(data);
      if (error) throw error;
      window.dispatchEvent(new CustomEvent('diet_updated'));
      onUpdateMessage(msg.id, {
        draftMeal: null,
        text: msg.text + "\n\n*(✓ Saved)*"
      });
    } catch (err) {
      console.error("Failed to save draft meal", err);
      alert("Failed to save meal");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    onUpdateMessage(msg.id, { draftMeal: null });
  };

  const timingBadgeText = getTimingBadgeText(messages, msgIndex);
  const hasHydration = checkHasHydration(msg.text, timingBadgeText);

  const totalKcal = data?.items?.reduce((acc: number, item: any) => acc + (item.macros?.kcal || 0), 0) || 0;
  const totalProtein = data?.items?.reduce((acc: number, item: any) => acc + (item.macros?.protein || 0), 0) || 0;
  const totalCarbs = data?.items?.reduce((acc: number, item: any) => acc + (item.macros?.carbs || 0), 0) || 0;
  const totalFat = data?.items?.reduce((acc: number, item: any) => acc + (item.macros?.fat || 0), 0) || 0;

  return (
    <div className="coach-card-custom">
      {/* Header */}
      <div className="coach-header-custom">
        <div className="coach-avatar-custom">
          <Dumbbell size={16} className="text-white" />
        </div>
        <div className="coach-meta-custom">
          <div className="coach-name-custom">Alberto</div>
          <div className="coach-tag-custom">Your Coach</div>
        </div>
        {timingBadgeText && (
          <div className="timing-badge-custom">{timingBadgeText}</div>
        )}
      </div>

      {/* Body */}
      <div className="coach-body-custom">
        <div className="coach-intro-custom">
          <MessageText text={msg.text} />
        </div>

        {data && data.items && data.items.length > 0 && (
          <>
            <div className="meal-label-custom">Suggested Meal</div>
            <div className="meal-items-custom">
              {data.items.map((item: any) => (
                <SwipeToDeleteRow key={item.id} onDelete={() => handleDeleteItem(item.id)}>
                  <div className="meal-item-custom">
                    <div className="item-left-custom">
                      <span className="item-icon-custom">{getItemIcon(item.name)}</span>
                      <span className="item-name-custom">{item.name}</span>
                    </div>
                    <span className="item-grams-custom">
                      {item.grams}g
                    </span>
                  </div>
                </SwipeToDeleteRow>
              ))}
            </div>

            {hasHydration && (
              <div className="hydration-note-custom">
                <span className="hydration-icon-custom">💧</span>
                <p className="hydration-text-custom">
                  Sip water steadily over the next 2 hours. <strong>Don't chug right before training</strong> — it causes bloating and cramps.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {data && data.items && data.items.length > 0 && (
        <>
          {/* Macro footer */}
          <div className="macro-footer-custom">
            <div className="macro-header-row-custom">
              <span className="macro-title-custom">Total Meal Macros</span>
              <span className="total-kcal-custom">
                {Math.round(totalKcal)}
                <span>kcal</span>
              </span>
            </div>
            <div className="macro-pills-custom">
              <div className="macro-pill-custom protein">
                <span className="macro-pill-value-custom">{Math.round(totalProtein)}g</span>
                <span className="macro-pill-label-custom">Protein</span>
              </div>
              <div className="macro-pill-custom carbs">
                <span className="macro-pill-value-custom">{Math.round(totalCarbs)}g</span>
                <span className="macro-pill-label-custom">Carbs</span>
              </div>
              <div className="macro-pill-custom fat">
                <span className="macro-pill-value-custom">{Math.round(totalFat)}g</span>
                <span className="macro-pill-label-custom">Fat</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="cta-row-custom">
            <p className="cta-question-custom">Want me to log this meal for you?</p>
            <div className="cta-buttons-custom">
              <button onClick={handleLog} disabled={isSaving} className="btn-log-custom">
                {isSaving ? <Loader2 size={13} className="animate-spin" /> : "Yes, log it ✓"}
              </button>
              <button onClick={handleDiscard} disabled={isSaving} className="btn-skip-custom">
                Not now
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const AiCoach = () => {
  const { messages, isTyping, sendMessage, updateMessage, initChat, startNewChat, quotaLimit, usageCount } = useAiAgent();
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
    <div className="flex flex-col h-full bg-background">
      <style dangerouslySetInnerHTML={{ __html: cardStyles }} />

      {/* Header — fixed at top, never scrolls */}
      <div className="flex-shrink-0 bg-surface/90 backdrop-blur-md px-5 py-3 border-b border-gray-800 z-30 flex items-center justify-between shadow-lg">
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
        <button onClick={startNewChat} className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors">
          + New Chat
        </button>
      </div>

      {/* Messages — scrollable, takes remaining height */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-4 no-scrollbar">
        {messages.length === 0 && !isTyping && (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600 gap-3 py-16">
            <Bot size={40} />
            <p className="text-sm text-center px-4">Ask me anything about your training or nutrition.</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'user' ? (
                <div className="user-bubble-custom">
                  {msg.text}
                </div>
              ) : (
                <CoachCard
                  msg={msg}
                  messages={messages}
                  msgIndex={index}
                  onUpdateMessage={updateMessage}
                />
              )}
            </motion.div>
          ))}

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
