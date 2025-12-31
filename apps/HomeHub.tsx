import React from 'react';
import { ListTodo, MessageSquare, Image as ImageIcon, Bell, BookOpen } from 'lucide-react';
import { AppRoute } from '../types';

interface HomeHubProps {
    onNavigate: (route: AppRoute) => void;
}

const HomeHub: React.FC<HomeHubProps> = ({ onNavigate }) => {
    return (
        <div className="w-full min-h-screen bg-[#0f0f10] pb-24 px-4 pt-6">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Good Morning,</h1>
                    <h2 className="text-3xl font-light text-gray-400">Alex</h2>
                </div>
                <button className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/5 transition-colors">
                    <Bell size={20} />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Task App Tile - Large */}
                <div 
                    onClick={() => onNavigate(AppRoute.TASKS)}
                    className="col-span-2 bg-[#d9f99d] rounded-[32px] p-6 h-48 relative cursor-pointer hover:scale-[1.02] transition-transform active:scale-95"
                >
                    <div className="absolute top-6 right-6 w-10 h-10 bg-black/10 rounded-full flex items-center justify-center text-black">
                        <ListTodo size={20} />
                    </div>
                    <div className="absolute bottom-6 left-6">
                        <p className="text-black/60 text-sm font-semibold mb-1">Productivity</p>
                        <h3 className="text-3xl font-bold text-black leading-tight">Manage<br/>Tasks</h3>
                    </div>
                </div>

                 {/* Journal Tile - Large */}
                 <div 
                    onClick={() => onNavigate(AppRoute.JOURNAL)}
                    className="col-span-2 bg-[#a78bfa] rounded-[32px] p-6 h-40 relative cursor-pointer hover:scale-[1.02] transition-transform active:scale-95"
                >
                    <div className="absolute top-6 right-6 w-10 h-10 bg-black/10 rounded-full flex items-center justify-center text-black">
                        <BookOpen size={20} />
                    </div>
                     <div className="absolute bottom-6 left-6">
                        <p className="text-black/60 text-sm font-semibold mb-1">Daily Log</p>
                        <h3 className="text-2xl font-bold text-black leading-tight">My<br/>Journal</h3>
                    </div>
                </div>

                {/* AI Chat Tile */}
                <div 
                    onClick={() => onNavigate(AppRoute.AI_CHAT)}
                    className="bg-[#27272a] rounded-[32px] p-6 h-44 relative cursor-pointer border border-white/5 hover:border-[#fde047]/50 transition-all hover:scale-[1.02] active:scale-95 group"
                >
                    <div className="w-10 h-10 bg-[#fde047] rounded-full flex items-center justify-center text-black mb-4 group-hover:rotate-12 transition-transform">
                        <MessageSquare size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Gemini<br/>Chat</h3>
                    </div>
                </div>

                {/* Image Gen Tile */}
                <div 
                    onClick={() => onNavigate(AppRoute.IMAGE_GEN)}
                    className="bg-[#fca5a5] rounded-[32px] p-6 h-44 relative cursor-pointer hover:scale-[1.02] transition-transform active:scale-95"
                >
                    <div className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center text-black mb-4">
                        <ImageIcon size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-black">Art<br/>Studio</h3>
                    </div>
                </div>
                
            </div>
        </div>
    );
};

export default HomeHub;