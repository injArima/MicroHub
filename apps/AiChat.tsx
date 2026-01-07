
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ArrowLeft, Sparkles } from 'lucide-react';
import { generateText } from '../services/gemini';
import { ChatMessage } from '../types';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface AiChatProps {
    onBack: () => void;
}

const AiChat: React.FC<AiChatProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'model', text: "Hello. I am Gemini. How can I assist you?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const container = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);

  // Animate new messages
  useGSAP(() => {
    const lastMessage = document.querySelector('.message-bubble:last-child');
    if (lastMessage) {
        gsap.fromTo(lastMessage, 
            { opacity: 0, y: 20, scale: 0.9 },
            { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.5)" }
        );
    }
  }, { scope: container, dependencies: [messages.length] });

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    try {
      const responseText = await generateText(input);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: responseText }]);
    } catch {
      setMessages(prev => [...prev, { id: 'err', role: 'model', text: "Connection error.", isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={container} className="w-full max-w-3xl mx-auto h-screen flex flex-col pb-24 pt-8 px-4">
       <div className="flex items-center gap-4 mb-4 px-2">
        <button onClick={onBack} className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-white hover:bg-white/10 hover:scale-110 transition-transform active:scale-95">
            <ArrowLeft size={20} />
        </button>
        <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">Gemini <Sparkles size={14} className="text-[var(--secondary)] animate-pulse"/></h1>
            <p className="text-[10px] text-[var(--secondary)] uppercase tracking-wider font-bold">Online</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 px-2 no-scrollbar pb-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-bubble flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-4 rounded-[20px] max-w-[80%] text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-white/10 text-white rounded-br-none border border-white/5' 
                  : 'glass-card text-[var(--secondary)] rounded-bl-none border border-[var(--secondary)]/20'
              }`}>
                {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                 <div className="glass-card px-4 py-3 rounded-[20px] rounded-bl-none flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-[var(--secondary)] rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-[var(--secondary)] rounded-full animate-bounce delay-75"></span>
                    <span className="w-1.5 h-1.5 bg-[var(--secondary)] rounded-full animate-bounce delay-150"></span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4">
        <div className="glass-card rounded-full p-1 pl-4 flex items-center gap-2 focus-within:border-[var(--secondary)]/50 transition-colors shadow-lg">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask something..."
            className="flex-1 bg-transparent text-white outline-none text-sm h-10 placeholder:text-gray-600"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 rounded-full bg-[var(--secondary)] flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiChat;
