
import React, { useState, useEffect } from 'react';
import { ListTodo, BookOpen, Film, ArrowUpRight, PlayCircle, Plus, Timer, Watch } from 'lucide-react';
import { AppRoute, SheetConfig, Task } from '../types';
import pkg from '../../package.json';

const { version } = pkg;

interface HomeHubProps {
    onNavigate: (route: AppRoute) => void;
    config: SheetConfig | null;
    userName: string;
}

const HomeHub: React.FC<HomeHubProps> = ({ onNavigate, config, userName }) => {
    const [greeting, setGreeting] = useState('');
    const [tasks, setTasks] = useState<Task[]>([]);
    const isConnected = !!config;

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');

        // Load tasks for preview
        try {
            const saved = localStorage.getItem('microhub_tasks');
            if (saved) {
                setTasks(JSON.parse(saved));
            }
        } catch (e) {
            console.error("Failed to load tasks", e);
        }
    }, []);

    return (
        <div className="w-full min-h-screen pb-32 px-6 pt-14 flex flex-col relative">

            {/* Version Badge - Top Right */}
            <div className="absolute top-6 right-6 z-50">
                <span className="text-[10px] font-mono text-white/20 hover:text-white/40 transition-colors cursor-default select-none">
                    v{version}
                </span>
            </div>

            {/* Header Section */}
            <div className="mb-8 animate-in slide-in-from-top-4 duration-700">
                <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 mb-2 ${isConnected ? 'text-[var(--primary)]' : 'text-red-400'}`}>
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[var(--primary)] animate-pulse' : 'bg-red-500'}`}></span>
                    MicroHub OS
                </span>
                <h1 className="text-[42px] font-thin text-white leading-[1.1] tracking-tight">
                    My practical <br />
                    <span className="font-normal text-white">plan</span>
                </h1>
            </div>

            {/* Apps Grid */}
            <div className="grid grid-cols-2 gap-4">

                {/* Large Task Card - Vertical on Left */}
                <div
                    onClick={() => onNavigate(AppRoute.TASKS)}
                    className="col-span-1 row-span-2 glass-card glass-card-hover rounded-[32px] p-5 flex flex-col justify-between cursor-pointer relative overflow-hidden min-h-[320px] group"
                >
                    <div className="relative z-10 w-full">
                        {/* Header with Title Left and Icon Right */}
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-2xl font-light text-white leading-tight">My<br />Schedule</h3>

                            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5 text-white">
                                <ListTodo size={20} className="text-[var(--primary)]" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            {tasks.length > 0 ? (
                                tasks.slice(0, 3).map((task, index) => (
                                    <div key={task.id} className={`glass-button p-1 pl-1.5 pr-3 rounded-full flex items-center gap-2 w-max max-w-full ${index !== 0 ? 'opacity-60' : ''}`}>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${index === 0 ? 'bg-[var(--primary)]' : 'border border-white/30'}`}>
                                            {index === 0 ? <ListTodo size={12} className="text-black" /> : <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>}
                                        </div>
                                        <span className={`text-[10px] font-bold truncate ${index === 0 ? 'text-white' : 'text-gray-300'}`}>{task.title}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-start gap-2 animate-in fade-in duration-500">
                                    <span className="text-xs text-gray-500 font-light ml-1">Free for today</span>
                                    <div className="glass-button px-3 py-2 rounded-full text-[10px] font-bold text-[var(--primary)] flex items-center gap-1 hover:bg-[var(--primary)]/10 transition-colors">
                                        <Plus size={12} /> Add Task
                                    </div>
                                </div>
                            )}
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
                            background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.15) 0%, rgba(var(--primary-rgb), 0.05) 100%)',
                            border: '1px solid rgba(var(--primary-rgb), 0.2)'
                        }}
                    >
                        <div className="flex justify-between items-start z-10">
                            <h3 className="text-lg font-medium text-white leading-tight">Daily<br />Journal</h3>
                        </div>

                        {/* Wavy Decoration */}
                        <div className="absolute inset-0 opacity-30 pointer-events-none">
                            <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 140 60" preserveAspectRatio="none">
                                <path d="M0,30 C40,10 80,50 140,20 L140,60 L0,60 Z" fill="var(--primary)" fillOpacity="0.3" />
                                <path d="M0,45 C40,25 80,65 140,35 L140,60 L0,60 Z" fill="var(--primary)" fillOpacity="0.5" />
                            </svg>
                        </div>

                        <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--primary)] z-10 flex items-center gap-1">
                            7 Day Series <ArrowUpRight size={10} />
                        </div>
                    </div>

                    {/* Cinema Card (Darker) */}
                    <div
                        onClick={() => onNavigate(AppRoute.MOVIES)}
                        className="aspect-square glass-card glass-card-hover rounded-[32px] p-5 flex flex-col justify-between cursor-pointer relative overflow-hidden"
                    >
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-medium text-white leading-tight">Cinema<br />Log</h3>
                            <PlayCircle size={20} className="text-[var(--primary)]" />
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

                {/* Bottom Wide Card - Time App (Consolidated) */}
                <div
                    onClick={() => onNavigate(AppRoute.TIMER)}
                    className="col-span-2 glass-card glass-card-hover rounded-[32px] p-5 flex items-center justify-between cursor-pointer group mt-2"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white border border-white/5">
                            <Timer size={20} className="text-[var(--primary)]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-white leading-tight">Time</h3>
                            <div className="flex gap-2">
                                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-gray-300">Timer</span>
                                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-gray-300">Stopwatch</span>
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
