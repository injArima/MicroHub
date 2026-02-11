
import React, { useState, useEffect } from 'react';
import { ListTodo, BookOpen, Film, ArrowUpRight, PlayCircle, Plus, Timer, Zap } from 'lucide-react';
import { AppRoute, SheetConfig, Task } from '../types';

interface HomeHubProps {
    onNavigate: (route: AppRoute) => void;
    config: SheetConfig | null;
    userName: string;
}

const HomeHub: React.FC<HomeHubProps> = ({ onNavigate, config, userName }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const isConnected = !!config;

    useEffect(() => {
        try {
            const stored = localStorage.getItem('microhub_tasks');
            if (stored) {
                setTasks(JSON.parse(stored));
            }
        } catch (e) {
            console.error("Failed to load tasks", e);
        }
    }, []);

    return (
        <div className="w-full min-h-screen pb-32 px-6 pt-10 flex flex-col bg-[var(--bg-color)]">
            
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 border-2 border-[var(--border-color)] rounded-full ${isConnected ? 'bg-[var(--secondary)]' : 'bg-transparent'}`}></div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-color)]">
                        MicroHub OS {isConnected ? 'Online' : 'Offline'}
                    </span>
                </div>
                <h1 className="text-4xl font-black text-[var(--text-color)] leading-none tracking-tighter">
                    HELLO,<br />
                    {userName.toUpperCase()}.
                </h1>
            </div>

            {/* Apps Grid */}
            <div className="grid grid-cols-2 gap-4">
                
                {/* Tasks Card */}
                <div 
                    onClick={() => onNavigate(AppRoute.TASKS)}
                    className="col-span-1 row-span-2 contra-card contra-card-hover p-4 flex flex-col justify-between cursor-pointer min-h-[300px]"
                >
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 border-2 border-[var(--border-color)] rounded-full flex items-center justify-center bg-[var(--bg-secondary)]">
                                <ListTodo size={20} className="text-[var(--text-color)]" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-[var(--text-color)] leading-tight uppercase">Tasks</h3>
                        <p className="text-xs font-bold text-gray-500 mt-1">{tasks.length} PENDING</p>
                    </div>
                    
                    <div className="space-y-2 mt-4">
                        {tasks.length > 0 ? (
                            tasks.slice(0, 3).map((task, index) => (
                                <div key={task.id} className="border-2 border-[var(--border-color)] rounded-lg p-2 bg-[var(--bg-color)] flex items-center gap-2 shadow-[2px_2px_0px_0px_var(--border-color)]">
                                    <div className={`w-3 h-3 border-2 border-[var(--border-color)] rounded-sm ${index === 0 ? 'bg-[var(--secondary)]' : 'bg-[var(--bg-color)]'}`}></div>
                                    <span className="text-[10px] font-bold truncate text-[var(--text-color)]">{task.title}</span>
                                </div>
                            ))
                        ) : (
                            <div className="border-2 border-dashed border-gray-400 rounded-lg p-3 text-center">
                                <span className="text-[10px] font-bold text-gray-400">NO TASKS</span>
                            </div>
                        )}
                        <button className="w-full py-2 border-2 border-[var(--border-color)] rounded-lg text-[10px] font-black hover:bg-[var(--secondary)] hover:text-[var(--text-inverted)] text-[var(--text-color)] transition-colors uppercase">
                            + New Task
                        </button>
                    </div>
                </div>

                {/* Right Column */}
                <div className="col-span-1 flex flex-col gap-4">
                    {/* Journal Card */}
                    <div 
                        onClick={() => onNavigate(AppRoute.JOURNAL)}
                        className="contra-card contra-card-hover aspect-square p-4 flex flex-col justify-between cursor-pointer bg-[var(--primary)]"
                    >
                         <div className="flex justify-between items-start">
                            <h3 className="text-xl font-black text-black uppercase leading-none">Daily<br/>Log</h3>
                            <ArrowUpRight size={20} className="text-black" />
                        </div>
                        <BookOpen size={24} className="text-black mt-auto" strokeWidth={2.5}/>
                    </div>

                    {/* Cinema Card */}
                    <div 
                         onClick={() => onNavigate(AppRoute.MOVIES)}
                         className="contra-card contra-card-hover aspect-square p-4 flex flex-col justify-between cursor-pointer bg-[var(--bg-color)]"
                    >
                        <div className="flex justify-between items-start">
                            <h3 className="text-xl font-black text-[var(--text-color)] uppercase leading-none">Watch<br/>List</h3>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                            <Film size={24} className="text-[var(--text-color)]" strokeWidth={2.5}/>
                            <span className="text-lg font-black text-[var(--text-color)]">+4</span>
                        </div>
                    </div>
                </div>

                {/* Timer App */}
                <div 
                    onClick={() => onNavigate(AppRoute.TIMER)}
                    className="col-span-2 contra-card contra-card-hover p-4 flex items-center justify-between cursor-pointer"
                >
                    <div className="flex items-center gap-4">
                         <div className="w-12 h-12 border-2 border-[var(--border-color)] rounded-full flex items-center justify-center bg-[var(--secondary)] text-[var(--text-inverted)]">
                            <Timer size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-[var(--text-color)] uppercase">Focus Timer</h3>
                            <div className="flex gap-2">
                                <span className="text-[10px] border border-[var(--border-color)] px-2 py-0.5 rounded-full font-bold text-[var(--text-color)]">25:00</span>
                                <span className="text-[10px] border border-[var(--border-color)] px-2 py-0.5 rounded-full font-bold text-[var(--text-color)]">STOPWATCH</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-10 h-10 border-2 border-[var(--border-color)] rounded-full flex items-center justify-center hover:bg-[var(--secondary)] hover:text-[var(--text-inverted)] text-[var(--text-color)] transition-colors">
                         <Zap size={20} fill="currentColor" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeHub;
