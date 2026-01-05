import React, { useState, useEffect } from 'react';
import { Share2, Clock, Plus, Calendar, ArrowLeft, Loader2, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
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
    <div className="w-full min-h-screen pb-32 pt-8 px-6 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <button onClick={onBack} className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-white hover:bg-white/10">
            <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
             {saveStatus === 'saving' && <Loader2 size={16} className="animate-spin text-[#d9f99d]" />}
             {saveStatus === 'saved' && <CheckCircle size={16} className="text-[#d9f99d]" />}
            <button className="btn-lime px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2">
                Manage
            </button>
        </div>
      </div>

      <div className="mb-8">
          <h1 className="text-3xl font-light text-white mb-2">My<br/><span className="font-bold text-[#d9f99d]">Tasks</span></h1>
          <p className="text-gray-400 text-sm">You have {tasks.length} pending tasks</p>
      </div>

      {/* Date Strip */}
      <div className="flex justify-between gap-3 overflow-x-auto no-scrollbar mb-8">
          {dates.map((d, i) => (
              <div key={i} className={`flex flex-col items-center justify-center min-w-[60px] h-[75px] rounded-[20px] cursor-pointer transition-all border ${d.active ? 'bg-[#d9f99d] border-[#d9f99d] text-black' : 'glass-card border-white/5 text-gray-400'}`}>
                  {d.label && <span className="text-[9px] font-bold uppercase mb-1 opacity-60">{d.label}</span>}
                  <span className="text-lg font-bold">{d.day}</span>
                  <span className="text-[10px]">{d.mon}</span>
              </div>
          ))}
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.map((task) => (
            <div key={task.id} className="glass-card p-5 rounded-[28px] relative group hover:bg-white/10 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white leading-tight max-w-[70%]">{task.title}</h3>
                    <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
                        <Share2 size={14} className="text-gray-400" />
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-6 text-gray-400 text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        <span>{task.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock size={12} />
                        <span>{task.time}</span>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-white/10 border border-black flex items-center justify-center text-[10px] text-white">AM</div>
                        <button className="w-8 h-8 rounded-full bg-[#d9f99d] border border-black flex items-center justify-center text-black">
                            <Plus size={14} />
                        </button>
                    </div>

                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-[#d9f99d] border border-[#d9f99d]/20">
                        {task.priority}
                    </span>
                </div>
            </div>
        ))}
      </div>

       <button 
        onClick={addTask}
        className="mt-6 w-full py-4 rounded-[24px] btn-lime font-bold text-sm flex items-center justify-center gap-2"
       >
          <Plus size={18} /> Add New Task
       </button>
    </div>
  );
};

export default TaskManager;