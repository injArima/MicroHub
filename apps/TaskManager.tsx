import React, { useState, useEffect } from 'react';
import { Share2, Clock, Plus, Calendar, ArrowLeft, Loader2, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { Task, SheetConfig } from '../types';
import { syncSheet } from '../services/sheet';

interface TaskManagerProps {
    onBack: () => void;
    sheetConfig: SheetConfig | null;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const TaskManager: React.FC<TaskManagerProps> = ({ onBack, sheetConfig }) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
     try {
         const saved = localStorage.getItem('microhub_tasks');
         return saved ? JSON.parse(saved) : [];
     } catch (e) {
         return [];
     }
  });

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // Auto Sync to Cloud Effect
  useEffect(() => {
      // Always save to local storage immediately
      localStorage.setItem('microhub_tasks', JSON.stringify(tasks));
      
      if (isDirty && sheetConfig) {
          const timeout = setTimeout(async () => {
              setSaveStatus('saving');
              setErrorMessage('');
              
              try {
                  await syncSheet(sheetConfig, 'Task_Tracker', tasks);
                  
                  setSaveStatus('saved');
                  setIsDirty(false);
                  
                  // Reset status after 3 seconds
                  setTimeout(() => {
                      setSaveStatus(prev => prev === 'saved' ? 'idle' : prev);
                  }, 3000);
              } catch (e: any) {
                  setSaveStatus('error');
                  setErrorMessage(e.message || "Failed to save");
              }
          }, 2000); // Debounce
          return () => clearTimeout(timeout);
      }
  }, [tasks, sheetConfig, isDirty]);

  // Manual Sync Handler
  const handleManualSync = async () => {
      if (!sheetConfig) return;
      setSaveStatus('saving');
      setErrorMessage('');
      try {
          await syncSheet(sheetConfig, 'Task_Tracker', tasks);
          setSaveStatus('saved');
          setIsDirty(false);
          setTimeout(() => setSaveStatus('idle'), 3000);
      } catch (e: any) {
          setSaveStatus('error');
          setErrorMessage(e.message || "Manual sync failed");
      }
  };

  const addTask = () => {
    // Dummy task for demo
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
    setSaveStatus('idle'); // Clear previous states
  };

  const dates = [
      { day: '06', mon: 'Apr' },
      { day: '07', mon: 'Apr' },
      { day: '08', mon: 'Apr', active: true, label: 'Today' },
      { day: '09', mon: 'Apr' },
      { day: '10', mon: 'Apr' },
  ];

  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case 'lime': return 'bg-[#d9f99d] text-black';
      case 'yellow': return 'bg-[#fde047] text-black';
      case 'red': return 'bg-[#fca5a5] text-black';
      default: return 'bg-white text-black';
    }
  };

  const getPillClasses = (theme: string) => {
      switch (theme) {
          case 'lime': return 'bg-[#bef264] text-black/70';
          case 'yellow': return 'bg-[#facc15] text-black/70';
          case 'red': return 'bg-[#f87171] text-black/70';
          default: return 'bg-gray-200';
      }
  }

  return (
    <div className="w-full min-h-screen bg-[#0f0f10] pb-24 pt-4 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-[#27272a] flex items-center justify-center text-white">
            <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
            {saveStatus === 'saving' && (
                <div className="flex items-center gap-2 bg-[#27272a] px-3 py-1 rounded-full border border-white/5">
                    <Loader2 size={12} className="animate-spin text-gray-400" />
                    <span className="text-xs text-gray-400">Syncing...</span>
                </div>
            )}
            {saveStatus === 'saved' && (
                <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                    <CheckCircle size={12} className="text-green-500" />
                    <span className="text-xs text-green-500">Saved</span>
                </div>
            )}
            {saveStatus === 'error' && (
                <div className="flex items-center gap-2 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20" title={errorMessage}>
                    <AlertTriangle size={12} className="text-red-400" />
                    <span className="text-xs text-red-400">Error</span>
                </div>
            )}
             {/* Manual Sync Button */}
             {sheetConfig && (
                <button 
                    onClick={handleManualSync}
                    className="w-10 h-10 rounded-full bg-[#27272a] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#3f3f46] transition-colors"
                    title="Force Sync"
                >
                    <RefreshCw size={16} className={saveStatus === 'saving' ? 'animate-spin' : ''} />
                </button>
            )}
            <button className="bg-[#fde047] text-black px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2">
                <span className="text-xs">✏️</span> Edit
            </button>
        </div>
      </div>

      <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Manage Your Task</h1>
            <p className="text-gray-400 text-sm">{tasks.length} tasks recorded</p>
          </div>
          <button className="text-gray-400 text-sm hover:text-white">See all</button>
      </div>

      {/* Date Strip */}
      <div className="flex justify-between gap-2 overflow-x-auto no-scrollbar mb-8">
          {dates.map((d, i) => (
              <div key={i} className={`flex flex-col items-center justify-center min-w-[64px] h-[80px] rounded-[24px] cursor-pointer transition-all ${d.active ? 'bg-[#fde047] text-black' : 'bg-[#27272a] text-gray-400 border border-white/5'}`}>
                  {d.label && <span className="text-[10px] font-bold uppercase mb-1">{d.label}</span>}
                  <span className={`text-lg font-bold ${d.label ? 'text-lg' : 'text-xl'}`}>{d.day}</span>
                  <span className="text-xs">{d.mon}</span>
              </div>
          ))}
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.map((task) => (
            <div key={task.id} className={`p-6 rounded-[32px] ${getThemeClasses(task.colorTheme)} relative group`}>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold leading-tight max-w-[70%]">{task.title}</h3>
                    <button className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors">
                        <Share2 size={18} className="text-current opacity-70" />
                    </button>
                </div>

                <div className="flex items-center gap-4 mb-6 opacity-70 text-sm font-medium">
                    <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        <span>{task.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        <span>{task.time}</span>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex -space-x-3">
                        {task.team.map((avatar, idx) => (
                            <img key={idx} src={avatar} alt="User" className="w-8 h-8 rounded-full border-2 border-white/20" />
                        ))}
                        <button className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center border-2 border-transparent text-xs font-bold">
                            <Plus size={12} />
                        </button>
                    </div>

                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getPillClasses(task.colorTheme)}`}>
                        {task.priority}
                    </span>
                </div>
            </div>
        ))}
      </div>

       <button 
        onClick={addTask}
        className="mt-6 w-full py-4 rounded-full bg-[#fde047] text-black font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#facc15] transition-colors"
       >
          <Plus size={20} /> Create New Task
       </button>
       
       {errorMessage && (
           <p className="text-red-400 text-center text-xs mt-4">{errorMessage}</p>
       )}
    </div>
  );
};

export default TaskManager;