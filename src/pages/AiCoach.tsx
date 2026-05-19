import { useEffect, useRef, useState } from 'react';
import { useAiAgent } from '../hooks/useAiAgent';
import { Send, Bot, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { TypewriterText } from '../components/TypewriterText';

const AiCoach = () => {
  const { messages, isTyping, sendMessage, initChat, startNewChat } = useAiAgent();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { initChat(); }, []);

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

  return (
    <div className="flex flex-col h-full bg-background relative" style={{ height: '100dvh' }}>
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
                {msg.role === 'model' ? <TypewriterText text={msg.text} speed={10} glitchProbability={0.08} /> : msg.text}
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
