import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, AlertCircle, ArrowLeft } from 'lucide-react';
import { generateText } from '../services/gemini';
import { ChatMessage } from '../types';

interface AiChatProps {
    onBack: () => void;
}

const AiChat: React.FC<AiChatProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'model', text: "Hello! I'm Gemini. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await generateText(input);
      const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = { 
          id: (Date.now() + 1).toString(), 
          role: 'model', 
          text: "I'm having trouble connecting right now.", 
          isError: true 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-[#0f0f10] pb-24">
       {/* Header */}
       <div className="p-4 flex items-center gap-4 bg-[#0f0f10] sticky top-0 z-10 border-b border-white/5">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-[#27272a] flex items-center justify-center text-white hover:bg-[#3f3f46] transition-colors">
            <ArrowLeft size={20} />
        </button>
        <div>
            <h1 className="text-xl font-bold text-white">Gemini Assistant</h1>
            <p className="text-xs text-[#d9f99d]">Online</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'model' ? 'bg-[#d9f99d] text-black' : 'bg-[#27272a] text-white'}`}>
                {msg.role === 'model' ? <Bot size={16} /> : <User size={16} />}
              </div>

              <div className={`p-4 rounded-[20px] text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-[#27272a] text-white rounded-br-none' 
                  : msg.isError 
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20 rounded-bl-none'
                    : 'bg-[#d9f99d] text-black rounded-bl-none'
              }`}>
                {msg.isError && <AlertCircle size={16} className="inline mr-2 mb-1" />}
                {msg.text}
              </div>

            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                 <div className="flex items-end gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#d9f99d] flex items-center justify-center text-black">
                        <Bot size={16} />
                    </div>
                    <div className="bg-[#d9f99d] px-4 py-3 rounded-[20px] rounded-bl-none">
                        <div className="flex gap-1">
                            <span className="w-2 h-2 bg-black/40 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-black/40 rounded-full animate-bounce delay-75"></span>
                            <span className="w-2 h-2 bg-black/40 rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-[#0f0f10]">
        <div className="bg-[#27272a] rounded-[32px] p-2 pl-4 flex items-center gap-2 border border-white/5 focus-within:border-[#fde047] transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything..."
            className="flex-1 bg-transparent text-white outline-none text-sm placeholder:text-gray-500 h-10"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 rounded-full bg-[#fde047] flex items-center justify-center text-black disabled:opacity-50 hover:bg-[#facc15] transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiChat;