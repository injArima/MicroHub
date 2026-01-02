import React, { useState, useEffect } from 'react';
import { ListTodo, MessageSquare, Image as ImageIcon, BookOpen, Film, Settings, Database, Sparkles, Command } from 'lucide-react';
import { AppRoute, SheetConfig } from '../types';

interface HomeHubProps {
    onNavigate: (route: AppRoute) => void;
    config: SheetConfig | null;
}

const HomeHub: React.FC<HomeHubProps> = ({ onNavigate, config }) => {
    const [greeting, setGreeting] = useState('');
    const [dateString, setDateString] = useState('');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const hour = now.getHours();
            if (hour < 12) setGreeting('Good Morning');
            else if (hour < 18) setGreeting('Good Afternoon');
            else setGreeting('Good Evening');

            setDateString(now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
        };
        updateTime();
        const timer = setInterval(updateTime, 60000);
        return () => clearInterval(timer);
    }, []);

    const apps = [
        {
            id: 'tasks',
            name: 'Tasks',
            desc: 'Productivity',
            icon: <ListTodo size={24} />,
            color: 'bg-[#d9f99d]',
            textColor: 'text-black',
            route: AppRoute.TASKS,
            size: 'large'
        },
        {
            id: 'journal',
            name: 'Journal',
            desc: 'Notes & Thoughts',
            icon: <BookOpen size={24} />,
            color: 'bg-[#a78bfa]',
            textColor: 'text-black',
            route: AppRoute.JOURNAL,
            size: 'medium'
        },
        {
            id: 'movies',
            name: 'Cinema',
            desc: 'Watchlist',
            icon: <Film size={24} />,
            color: 'bg-[#22d3ee]',
            textColor: 'text-black',
            route: AppRoute.MOVIES,
            size: 'medium'
        },
        {
            id: 'ai',
            name: 'Gemini',
            desc: 'AI Assistant',
            icon: <Sparkles size={24} />,
            color: 'bg-[#27272a]',
            textColor: 'text-white',
            borderColor: 'border-white/10',
            route: AppRoute.AI_CHAT,
            size: 'medium'
        },
        {
            id: 'imagine',
            name: 'Studio',
            desc: 'Image Gen',
            icon: <ImageIcon size={24} />,
            color: 'bg-[#fca5a5]',
            textColor: 'text-black',
            route: AppRoute.IMAGE_GEN,
            size: 'medium'
        }
    ];

    return (
        <div className="w-full min-h-screen bg-[#0f0f10] pb-28 px-6 pt-10 flex flex-col">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-8 animate-in slide-in-from-top-4 duration-700">
                <div className="space-y-1">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{dateString}</p>
                    <h1 className="text-3xl font-bold text-white tracking-tight">{greeting},<br /><span className="text-gray-500">Traveler</span></h1>
                </div>
                <button 
                    onClick={() => onNavigate(AppRoute.PROFILE)}
                    className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${config ? 'bg-green-500/10 border-green-500/30 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-[#27272a] border-white/5 text-gray-400 hover:text-white'}`}
                >
                   {config ? <Database size={20} /> : <Settings size={20} />}
                </button>
            </div>

            {/* Connection Status Indicator */}
            {config && (
                <div className="mb-6 bg-green-500/5 border border-green-500/10 rounded-2xl p-3 flex items-center gap-3 animate-in fade-in duration-1000">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse ml-1"></div>
                    <p className="text-xs text-green-500 font-medium">Cloud Database Connected</p>
                </div>
            )}

            {/* Apps Grid */}
            <div className="grid grid-cols-2 gap-4 flex-1 content-start">
                {apps.map((app, index) => (
                    <div 
                        key={app.id}
                        onClick={() => onNavigate(app.route)}
                        className={`
                            ${app.size === 'large' ? 'col-span-2 aspect-[2/1]' : 'col-span-1 aspect-square'}
                            ${app.color} ${app.textColor}
                            ${app.borderColor ? `border ${app.borderColor}` : 'border-transparent'}
                            rounded-[32px] p-5 relative cursor-pointer 
                            transition-all duration-300 ease-out
                            hover:scale-[1.02] hover:shadow-xl active:scale-95
                            group overflow-hidden
                            animate-in slide-in-from-bottom-8 fill-mode-backwards
                        `}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-150 duration-700"></div>

                        {/* Icon */}
                        <div className={`
                            w-12 h-12 rounded-full flex items-center justify-center mb-3
                            ${app.textColor === 'text-white' ? 'bg-white/10' : 'bg-black/10'}
                            backdrop-blur-sm transition-transform group-hover:rotate-12 duration-300
                        `}>
                            {app.icon}
                        </div>

                        {/* Text */}
                        <div className="relative z-10 flex flex-col justify-end h-[calc(100%-3.5rem)]">
                            <p className={`text-xs font-bold uppercase tracking-wider opacity-60 mb-0.5`}>{app.desc}</p>
                            <h3 className="text-xl font-bold leading-none">{app.name}</h3>
                        </div>

                        {/* Action Icon for Large Tile */}
                        {app.size === 'large' && (
                            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="bg-black/10 p-2 rounded-full">
                                    <Command size={16} />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-8 text-center">
                <p className="text-[10px] text-gray-600 font-medium tracking-widest uppercase">MicroHub OS v1.2</p>
            </div>
        </div>
    );
};

export default HomeHub;