import React, { useState, useEffect } from 'react';
import { ListTodo, BookOpen, Film } from 'lucide-react';
import { AppRoute, SheetConfig } from '../types';

interface HomeHubProps {
    onNavigate: (route: AppRoute) => void;
    config: SheetConfig | null;
    userName: string;
}

const HomeHub: React.FC<HomeHubProps> = ({ onNavigate, config, userName }) => {
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    return (
        <div className="w-full min-h-screen pb-32 px-6 pt-12 flex flex-col">
            
            {/* Header Section */}
            <div className="flex justify-between items-start mb-8 animate-in slide-in-from-top-4 duration-700">
                <div>
                    <h1 className="text-4xl font-light text-white leading-tight">
                        {greeting},<br />
                        <span className="font-bold text-[#d9f99d]">{userName}</span>
                    </h1>
                </div>
            </div>

            {/* Apps Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                
                {/* Tasks Card - Spans 2 rows on mobile, 2 columns on desktop */}
                <div 
                    onClick={() => onNavigate(AppRoute.TASKS)}
                    className="col-span-1 row-span-2 md:col-span-2 md:row-span-1 glass-card rounded-[32px] p-5 flex flex-col justify-between cursor-pointer group hover:bg-white/10 transition-colors relative overflow-hidden min-h-[280px]"
                >
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-white leading-5">Plan for<br/>the day</h3>
                            <div className="bg-[#d9f99d] p-1.5 rounded-full text-black">
                                <ListTodo size={14} />
                            </div>
                        </div>
                        
                        <div className="space-y-3 mt-4">
                            <div className="flex items-center gap-2 text-xs text-gray-300">
                                <div className="w-4 h-4 rounded-full border border-[#d9f99d] flex items-center justify-center">
                                    <div className="w-2 h-2 bg-[#d9f99d] rounded-full"></div>
                                </div>
                                <span>Focus</span>
                            </div>
                             <div className="flex items-center gap-2 text-xs text-gray-400">
                                <div className="w-4 h-4 rounded-full border border-gray-600"></div>
                                <span>Meeting</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <div className="w-4 h-4 rounded-full border border-gray-600"></div>
                                <span>Review</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-white/5">
                        <span className="text-[10px] uppercase tracking-wider text-[#d9f99d] font-bold">3 Pending</span>
                    </div>

                    {/* Decorative blur */}
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#d9f99d]/10 rounded-full blur-2xl pointer-events-none"></div>
                </div>

                {/* Right Column Stack */}
                <div className="col-span-1 flex flex-col gap-4 md:gap-6">
                    {/* Journal Card */}
                    <div 
                        onClick={() => onNavigate(AppRoute.JOURNAL)}
                        className="aspect-square glass-card rounded-[32px] p-5 flex flex-col justify-between cursor-pointer group hover:bg-white/10 transition-colors relative overflow-hidden"
                    >
                         <div className="flex justify-between items-start">
                            <h3 className="text-lg font-bold text-white leading-5">Daily<br/>Journal</h3>
                            <BookOpen size={16} className="text-gray-400 group-hover:text-[#d9f99d] transition-colors" />
                        </div>
                         {/* Abstract Decoration */}
                         <div className="absolute right-[-10px] bottom-[-10px] w-20 h-20 bg-blue-500/10 rounded-full blur-xl pointer-events-none"></div>
                        <div className="text-xs text-gray-500 mt-2 relative z-10">
                            Capture thoughts
                        </div>
                    </div>

                    {/* Cinema Card */}
                    <div 
                         onClick={() => onNavigate(AppRoute.MOVIES)}
                         className="aspect-square glass-card rounded-[32px] p-5 flex flex-col justify-between cursor-pointer hover:bg-white/10 transition-colors relative overflow-hidden"
                    >
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-bold text-white leading-5">Cinema<br/>Log</h3>
                            <Film size={16} className="text-gray-400 group-hover:text-[#d9f99d] transition-colors" />
                        </div>
                        {/* Abstract Decoration */}
                         <div className="absolute right-[-10px] bottom-[-10px] w-20 h-20 bg-[#d9f99d]/10 rounded-full blur-xl pointer-events-none"></div>
                        <div className="text-xs text-gray-500 mt-2 relative z-10">
                            Watchlist
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default HomeHub;