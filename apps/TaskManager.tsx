import React, { useState, useEffect } from 'react';
import { Share2, Clock, Plus, Calendar, ArrowLeft, Loader2, CheckCircle, Circle, ArrowUpRight } from 'lucide-react';
import { Task, SheetConfig } from '../types';
import { syncSheet } from '../services/sheet';

interface TaskManagerProps {
    onBack: () => void;
    sheetConfig: SheetConfig | null;
}

const TaskManager: React.FC<TaskManagerProps> = ({ onBack, sheetConfig }) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
     try {
         const saved = localStorage.getItem('microhub_tasks');
         return saved ? JSON.parse(saved) : [];
     } catch (e) {
         return [];
     }
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
      localStorage.setItem('microhub_tasks', JSON.stringify(tasks));
      if (isDirty && sheetConfig) {
          const timeout = setTimeout(async () => {
              setSaveStatus('saving');
              try {
                  await syncSheet(sheetConfig, 'Task_Tracker', tasks);
                  setSaveStatus('saved');
                  setIsDirty(false);
                  setTimeout(() => setSaveStatus('idle'), 3000);
              } catch (e) {
                  setSaveStatus('error');
              }
          }, 2000); 
          return () => clearTimeout(timeout);
      }
  }, [tasks, sheetConfig, isDirty]);

  const addTask = () => {
    const newTask: Task = {
        id: Date.now().toString(),
        title: 'New Task Item',
        date: 'Today',
        time: '12:00pm',
        priority: 'Medium',
        team: [],
        colorTheme: 'yellow'
    };
    setTasks([newTask, ...tasks]);
    setIsDirty(true);
  };

  const dates = [
      { day: '06', mon: 'Apr' },
      { day: '07', mon: 'Apr' },
      { day: '08', mon: 'Apr', active: true, label: 'Today' },
      { day: '09', mon: 'Apr' },
      { day: '10', mon: 'Apr' },
  ];

  return (
    <div className="w-full max-w-md mx-auto min-h-screen pb-32 pt-8 px-6 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <button onClick={onBack} className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-white hover:bg-white/10">
            <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
             {saveStatus === 'saving' && <Loader2 size={16} className="animate-spin text-[#bef264]" />}
             {saveStatus === 'saved' && <CheckCircle size={16} className="text-[#bef264]" />}
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`} alt="User" />
            </div>
        </div>
      </div>

      <div className="mb-8">
          <h1 className="text-3xl font-light text-white mb-2">My<br/><span className="font-medium text-[#bef264]">Schedule</span></h1>
      </div>

      {/* Date Strip */}
      <div className="flex justify-between gap-3 overflow-x-auto no-scrollbar mb-8 pb-2">
          {dates.map((d, i) => (
              <div key={i} className={`flex flex-col items-center justify-center min-w-[56px] h-[72px] rounded-[22px] cursor-pointer transition-all border ${d.active ? 'bg-[#bef264] border-[#bef264] text-black shadow-[0_0_15px_rgba(190,242,100,0.3)]' : 'glass-card border-white/5 text-gray-500 hover:bg-white/5'}`}>
                  {d.label && <span className="text-[9px] font-bold uppercase mb-1 opacity-60">{d.label}</span>}
                  <span className="text-lg font-bold">{d.day}</span>
                  <span className="text-[10px]">{d.mon}</span>
              </div>
          ))}
      </div>

      {/* Pill-shaped Task List */}
      <div className="space-y-3">
        {tasks.map((task, idx) => {
            const isActive = idx === 0; // Simulate first one being active/checked
            return (
                <div key={task.id} className={`
                    w-full p-1 pl-1.5 pr-4 rounded-full flex items-center gap-3 transition-all cursor-pointer group
                    ${isActive ? 'bg-[#bef264] text-black shadow-[0_4px_20px_rgba(190,242,100,0.2)]' : 'glass-card text-gray-300 hover:bg-white/5'}
                `}>
                    <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors
                        ${isActive ? 'bg-black text-white' : 'bg-white/5 border border-white/5 group-hover:bg-white/10'}
                    `}>
                        {isActive ? <CheckCircle size={20} className="text-[#bef264]" fill="black" /> : <Circle size={20} className="text-gray-500" />}
                    </div>

                    <div className="flex-1 min-w-0 py-2">
                        <h3 className={`text-sm font-bold leading-tight ${isActive ? 'text-black' : 'text-white'}`}>{task.title}</h3>
                        <p className={`text-[10px] truncate ${isActive ? 'text-black/60' : 'text-gray-500'}`}>
                            {task.time} • {task.priority}
                        </p>
                    </div>

                    <div className={`
                         w-8 h-8 rounded-full flex items-center justify-center
                         ${isActive ? 'bg-black/10' : 'bg-white/5'}
                    `}>
                         <ArrowUpRight size={14} className={isActive ? 'text-black' : 'text-gray-500'} />
                    </div>
                </div>
            )
        })}
      </div>

       <button 
        onClick={addTask}
        className="mt-8 w-full py-4 rounded-[24px] btn-lime font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
       >
          <Plus size={18} /> Add New Task
       </button>
    </div>
  );
};

export default TaskManager;