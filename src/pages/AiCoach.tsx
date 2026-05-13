import { useEffect, useRef, useState } from 'react';
import { useAiAgent } from '../hooks/useAiAgent';
import { Send, Bot, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AiCoach = () => {
  const { messages, isTyping, sendMessage, initChat } = useAiAgent();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initChat();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-background relative pb-16">
      {/* Header */}
      <div className="bg-surface/90 backdrop-blur-md px-5 py-4 border-b border-gray-800 sticky top-0 z-30 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50">
            <Sparkles size={16} className="text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-tight">AI Coach</h1>
            <p className="text-[10px] text-gray-400 font-semibold uppercase">Omnipotent Assistant</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 no-scrollbar">
        {messages.length === 0 && !isTyping && (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 opacity-50">
            <Bot size={48} className="mb-4" />
            <p>Initializing neural link...</p>
          </div>
        )}
        
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex \${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-2xl p-3 text-sm \${
                msg.isAction 
                  ? 'bg-transparent border border-dashed border-primary text-primary text-xs font-mono py-2'
                  : msg.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-sm' 
                    : 'bg-surface border border-gray-800 text-gray-200 rounded-tl-sm'
              }`}>
                {msg.text}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-surface border border-gray-800 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-primary" />
                <span className="text-xs text-gray-400">Agent is thinking...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background border-t border-gray-800 sticky bottom-0 z-30">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me to log a meal, change your plan..."
            className="flex-1 bg-surface border border-gray-700 rounded-full py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-primary transition-colors"
            disabled={isTyping}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white disabled:opacity-50 disabled:bg-gray-700 transition-colors"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiCoach;
