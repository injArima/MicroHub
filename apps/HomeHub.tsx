
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
        <div className="w-full min-h-screen pb-32 px-6 pt-10 flex flex-col">
            
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 border-2 border-black rounded-full ${isConnected ? 'bg-black' : 'bg-transparent'}`}></div>
                    <span className="text-xs font-bold uppercase tracking-wider text-black">
                        MicroHub OS {isConnected ? 'Online' : 'Offline'}
                    </span>
                </div>
                <h1 className="text-4xl font-black text-black leading-none tracking-tighter">
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
                            <div className="w-10 h-10 border-2 border-black rounded-full flex items-center justify-center bg-[#f0f0f0]">
                                <ListTodo size={20} className="text-black" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-black leading-tight uppercase">Tasks</h3>
                        <p className="text-xs font-bold text-gray-500 mt-1">{tasks.length} PENDING</p>
                    </div>
                    
                    <div className="space-y-2 mt-4">
                        {tasks.length > 0 ? (
                            tasks.slice(0, 3).map((task, index) => (
                                <div key={task.id} className="border-2 border-black rounded-lg p-2 bg-white flex items-center gap-2 shadow-[2px_2px_0px_0px_#000]">
                                    <div className={`w-3 h-3 border-2 border-black rounded-sm ${index === 0 ? 'bg-black' : 'bg-white'}`}></div>
                                    <span className="text-[10px] font-bold truncate text-black">{task.title}</span>
                                </div>
                            ))
                        ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
                                <span className="text-[10px] font-bold text-gray-400">NO TASKS</span>
                            </div>
                        )}
                        <button className="w-full py-2 border-2 border-black rounded-lg text-[10px] font-black hover:bg-black hover:text-white transition-colors uppercase">
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
                         className="contra-card contra-card-hover aspect-square p-4 flex flex-col justify-between cursor-pointer bg-white"
                    >
                        <div className="flex justify-between items-start">
                            <h3 className="text-xl font-black text-black uppercase leading-none">Watch<br/>List</h3>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                            <Film size={24} className="text-black" strokeWidth={2.5}/>
                            <span className="text-lg font-black text-black">+4</span>
                        </div>
                    </div>
                </div>

                {/* Timer App */}
                <div 
                    onClick={() => onNavigate(AppRoute.TIMER)}
                    className="col-span-2 contra-card contra-card-hover p-4 flex items-center justify-between cursor-pointer"
                >
                    <div className="flex items-center gap-4">
                         <div className="w-12 h-12 border-2 border-black rounded-full flex items-center justify-center bg-black text-white">
                            <Timer size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-black uppercase">Focus Timer</h3>
                            <div className="flex gap-2">
                                <span className="text-[10px] border border-black px-2 py-0.5 rounded-full font-bold">25:00</span>
                                <span className="text-[10px] border border-black px-2 py-0.5 rounded-full font-bold">STOPWATCH</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-10 h-10 border-2 border-black rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                         <Zap size={20} fill="currentColor" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeHub;
