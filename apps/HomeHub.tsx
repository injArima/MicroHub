import React, { useState, useEffect } from 'react';
import { ListTodo, BookOpen, Film, ArrowUpRight, PlayCircle, Heart } from 'lucide-react';
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

    const FilterPill = ({ label, active = false }: { label: string, active?: boolean }) => (
        <button className={`px-5 py-2.5 rounded-full text-xs font-medium transition-all ${active ? 'bg-[#333] text-white border border-white/10' : 'glass-button text-gray-400 hover:bg-white/10'}`}>
            {label}
        </button>
    );

    return (
        <div className="w-full min-h-screen pb-32 px-6 pt-14 flex flex-col">
            
            {/* Header Section */}
            <div className="mb-8 animate-in slide-in-from-top-4 duration-700">
                <span className="text-[#bef264] text-xs font-bold uppercase tracking-wider mb-2 block flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#bef264] animate-pulse"></span>
                    MicroHub OS
                </span>
                <h1 className="text-[42px] font-thin text-white leading-[1.1] tracking-tight">
                    My practical <br />
                    <span className="font-normal text-white">plan</span>
                </h1>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar mb-8 pb-1">
                <FilterPill label="All" active />
                <FilterPill label="Mantras" />
                <FilterPill label="Meditation" />
                <FilterPill label="Sleep" />
            </div>

            {/* Apps Grid */}
            <div className="grid grid-cols-2 gap-4">
                
                {/* Large Task Card - Vertical on Left */}
                <div 
                    onClick={() => onNavigate(AppRoute.TASKS)}
                    className="col-span-1 row-span-2 glass-card glass-card-hover rounded-[32px] p-5 flex flex-col justify-between cursor-pointer relative overflow-hidden min-h-[320px] group"
                >
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5 text-white">
                                <Heart size={18} className="text-[#bef264]" fill="rgba(190, 242, 100, 0.2)" />
                            </div>
                        </div>
                        
                        <h3 className="text-2xl font-light text-white leading-tight mb-4">Plan for<br/>the day</h3>
                        
                        <div className="space-y-3">
                            <div className="glass-button p-1 pl-1.5 pr-3 rounded-full flex items-center gap-2 w-max">
                                <div className="w-6 h-6 rounded-full bg-[#bef264] flex items-center justify-center">
                                    <ListTodo size={12} className="text-black" />
                                </div>
                                <span className="text-[10px] font-bold text-white">Affirmation</span>
                            </div>
                             <div className="glass-button p-1 pl-1.5 pr-3 rounded-full flex items-center gap-2 w-max opacity-60">
                                <div className="w-6 h-6 rounded-full border border-white/30 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
                                </div>
                                <span className="text-[10px] font-bold text-gray-300">Meditation</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column Stack */}
                <div className="col-span-1 flex flex-col gap-4">
                    {/* Journal Card (Gradient) */}
                    <div 
                        onClick={() => onNavigate(AppRoute.JOURNAL)}
                        className="aspect-square rounded-[32px] p-5 flex flex-col justify-between cursor-pointer group relative overflow-hidden transition-transform hover:scale-[1.02]"
                        style={{
                            background: 'linear-gradient(135deg, rgba(190, 242, 100, 0.15) 0%, rgba(190, 242, 100, 0.05) 100%)',
                            border: '1px solid rgba(190, 242, 100, 0.2)'
                        }}
                    >
                         <div className="flex justify-between items-start z-10">
                            <h3 className="text-lg font-medium text-white leading-tight">Daily<br/>Journal</h3>
                        </div>
                        
                        {/* Wavy Decoration */}
                        <div className="absolute inset-0 opacity-30 pointer-events-none">
                            <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 140 60" preserveAspectRatio="none">
                                <path d="M0,30 C40,10 80,50 140,20 L140,60 L0,60 Z" fill="#bef264" fillOpacity="0.3"/>
                                <path d="M0,45 C40,25 80,65 140,35 L140,60 L0,60 Z" fill="#bef264" fillOpacity="0.5"/>
                            </svg>
                        </div>
                        
                        <div className="text-[10px] font-bold uppercase tracking-widest text-[#bef264] z-10 flex items-center gap-1">
                            7 Day Series <ArrowUpRight size={10} />
                        </div>
                    </div>

                    {/* Cinema Card (Darker) */}
                    <div 
                         onClick={() => onNavigate(AppRoute.MOVIES)}
                         className="aspect-square glass-card glass-card-hover rounded-[32px] p-5 flex flex-col justify-between cursor-pointer relative overflow-hidden"
                    >
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-medium text-white leading-tight">Cinema<br/>Log</h3>
                            <PlayCircle size={20} className="text-[#bef264]" />
                        </div>
                        
                        <div className="flex items-center gap-2 mt-auto">
                            <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full bg-white/20 border border-black" />
                                <div className="w-6 h-6 rounded-full bg-white/10 border border-black" />
                            </div>
                            <span className="text-[10px] text-gray-400">+12</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Wide Card - AI Chat or Profile Access */}
                <div 
                    onClick={() => onNavigate(AppRoute.PROFILE)}
                    className="col-span-2 glass-card glass-card-hover rounded-[32px] p-5 flex items-center justify-between cursor-pointer group mt-2"
                >
                    <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white border border-white/5">
                            <PlayCircle size={20} fill="white" className="text-transparent" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-medium mb-0.5">Affirmations to close your day</p>
                            <div className="flex gap-2">
                                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-gray-300">15 min</span>
                                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-gray-300">Evening</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-full btn-lime flex items-center justify-center">
                         <ArrowUpRight size={18} />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default HomeHub;