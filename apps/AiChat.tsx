
import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Sparkles } from 'lucide-react';
import { generateText } from '../services/gemini';
import { ChatMessage } from '../types';

interface AiChatProps {
    onBack: () => void;
}

const AiChat: React.FC<AiChatProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'model', text: "SYSTEM ONLINE. AWAITING QUERY." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

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
      setMessages(prev => [...prev, { id: 'err', role: 'model', text: "CONNECTION ERROR.", isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto h-screen flex flex-col pb-24 pt-8 px-4 bg-white">
       <div className="flex items-center gap-4 mb-4 px-2 border-b-2 border-black pb-4">
        <button onClick={onBack} className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors">
            <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
        <div>
            <h1 className="text-lg font-black text-black flex items-center gap-2 uppercase">Gemini Core <Sparkles size={16} /></h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 px-2 no-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-4 max-w-[85%] text-sm font-medium leading-relaxed border-2 border-black shadow-[4px_4px_0px_0px_#000] ${
                msg.role === 'user' 
                  ? 'bg-black text-white rounded-t-2xl rounded-bl-2xl' 
                  : 'bg-white text-black rounded-t-2xl rounded-br-2xl'
              }`}>
                {msg.text.toUpperCase()}
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                 <div className="px-4 py-3 rounded-t-2xl rounded-br-2xl border-2 border-black bg-gray-100 flex gap-1 items-center">
                    <span className="w-2 h-2 bg-black rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-black rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-black rounded-full animate-bounce delay-150"></span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 pt-2">
        <div className="contra-card p-2 pl-4 flex items-center gap-2 rounded-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="INPUT COMMAND..."
            className="flex-1 bg-transparent text-black outline-none text-sm h-10 placeholder:text-gray-400 font-bold uppercase"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white hover:scale-105 transition-transform disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiChat;
