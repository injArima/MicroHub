
import React, { useState, useEffect } from 'react';
import { Plus, ArrowLeft, Loader2, CheckCircle, Circle, ArrowUpRight, ArrowRight, Trash2, Box, Activity, CheckSquare, BarChart3, AlertCircle } from 'lucide-react';
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
  
  // UI State
  const [activePipeline, setActivePipeline] = useState<'Backlog' | 'Active' | 'Archive'>('Backlog');
  const [filterPriority, setFilterPriority] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  
  // Input State
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

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

  // --- ACTIONS ---

  const addTask = () => {
    if (!newTitle.trim()) return;
    const newTask: Task = {
        id: Date.now().toString(),
        title: newTitle,
        description: newDesc,
        status: 'Backlog',
        priority: newPriority,
        createdAt: new Date().toISOString()
    };
    setTasks([newTask, ...tasks]);
    setNewTitle('');
    setNewDesc('');
    setIsInputExpanded(false);
    setIsDirty(true);
    if(navigator.vibrate) navigator.vibrate(50);
  };

  const moveTask = (taskId: string, newStatus: 'Backlog' | 'Active' | 'Archive') => {
    setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
            return {
                ...t,
                status: newStatus,
                completedAt: newStatus === 'Archive' ? new Date().toISOString() : undefined
            };
        }
        return t;
    }));
    setIsDirty(true);
    if(navigator.vibrate) navigator.vibrate(20);
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setIsDirty(true);
  };

  // --- ANALYTICS ---

  // Calculate stats based on Current Filter to show "Interconnected" logic
  const filteredTasks = tasks.filter(t => filterPriority === 'All' ? true : t.priority === filterPriority);
  
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(t => t.status === 'Archive').length;
  const activeTasks = filteredTasks.filter(t => t.status === 'Active').length;
  const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

  // --- RENDERING HELPERS ---

  const getPriorityColor = (p: string) => {
      switch(p) {
          case 'High': return 'text-red-400 border-red-400/30 bg-red-400/10';
          case 'Medium': return 'text-[var(--primary)] border-[var(--primary)]/30 bg-[var(--primary)]/10';
          case 'Low': return 'text-blue-300 border-blue-300/30 bg-blue-300/10';
          default: return 'text-gray-400';
      }
  };

  const visibleTasks = filteredTasks.filter(t => t.status === activePipeline);

  return (
    <div className="w-full max-w-md mx-auto min-h-screen pb-32 px-4 flex flex-col">
      
      {/* 1. Header & Intelligence Dashboard */}
      <div className="mb-6 sticky top-0 z-40 -mx-4 px-4 pt-6 pb-4 bg-black/30 backdrop-blur-2xl border-b border-white/5 shadow-2xl shadow-black/20 transition-all">
        <div className="flex justify-between items-center mb-4">
            <button onClick={onBack} className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-white hover:bg-white/10">
                <ArrowLeft size={20} />
            </button>
            <div className="flex flex-col items-end">
                 <h1 className="text-lg font-bold text-white tracking-tight">Command Center</h1>
                 <div className="flex items-center gap-2">
                    {saveStatus === 'saving' && <Loader2 size={12} className="animate-spin text-[var(--primary)]" />}
                    {saveStatus === 'saved' && <span className="text-[10px] text-[var(--primary)]">Synced</span>}
                 </div>
            </div>
        </div>

        {/* Analytics Bar */}
        <div className="glass-card rounded-[24px] p-4 flex items-center justify-between shadow-lg relative overflow-hidden bg-white/5">
             {/* Productivity Ring */}
             <div className="flex items-center gap-4">
                 <div className="relative w-14 h-14 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                        <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" 
                            strokeDasharray={2 * Math.PI * 24} 
                            strokeDashoffset={2 * Math.PI * 24 * (1 - productivityScore / 100)} 
                            className="text-[var(--primary)] transition-all duration-1000 ease-out" 
                            strokeLinecap="round"
                        />
                    </svg>
                    <span className="absolute text-xs font-bold text-white">{productivityScore}%</span>
                 </div>
                 <div className="flex flex-col">
                     <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Sprint Health</span>
                     <span className="text-sm font-medium text-white">{activeTasks} Active Tasks</span>
                 </div>
             </div>
             
             {/* Simple Bar for volume */}
             <div className="h-full w-px bg-white/10 mx-2"></div>
             
             <div className="flex flex-col items-end">
                <span className="text-2xl font-light text-white">{completedTasks}</span>
                <span className="text-[10px] text-gray-500">Archived</span>
             </div>
        </div>
      </div>

      {/* 2. Interconnected Filtering */}
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar py-1">
          {['All', 'High', 'Medium', 'Low'].map(f => (
              <button 
                key={f} 
                onClick={() => setFilterPriority(f as any)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    filterPriority === f 
                    ? 'bg-white text-black border-white' 
                    : 'bg-transparent text-gray-500 border-white/10 hover:border-white/30'
                }`}
              >
                  {f}
              </button>
          ))}
      </div>

      {/* 3. Intake System (Command Input) */}
      <div className={`glass-card rounded-[24px] p-1 mb-6 transition-all duration-300 ${isInputExpanded ? 'bg-white/5' : ''}`}>
          <div className="flex items-center gap-2 p-2">
              <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-black">
                  <Plus size={18} />
              </div>
              <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onFocus={() => setIsInputExpanded(true)}
                  placeholder="Input command..."
                  className="bg-transparent text-white placeholder:text-gray-500 outline-none text-sm flex-1"
              />
          </div>
          
          {isInputExpanded && (
              <div className="px-3 pb-3 animate-in fade-in slide-in-from-top-2">
                  <textarea 
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="Add deep description..."
                      className="w-full bg-black/20 rounded-xl p-3 text-xs text-gray-300 outline-none resize-none mb-3 min-h-[60px]"
                  />
                  <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                          {['High', 'Medium', 'Low'].map((p) => (
                              <button 
                                key={p}
                                onClick={() => setNewPriority(p as any)}
                                className={`w-2 h-2 rounded-full ring-2 ring-offset-2 ring-offset-black/50 transition-all ${newPriority === p ? (p === 'High' ? 'bg-red-500 ring-red-500' : p === 'Medium' ? 'bg-[var(--primary)] ring-[var(--primary)]' : 'bg-blue-400 ring-blue-400') : 'bg-gray-700 ring-transparent'}`}
                              />
                          ))}
                          <span className="text-[10px] text-gray-500 ml-1">{newPriority} Priority</span>
                      </div>
                      <div className="flex gap-2">
                          <button onClick={() => setIsInputExpanded(false)} className="text-xs text-gray-500 px-3 py-1">Cancel</button>
                          <button onClick={addTask} className="text-xs font-bold bg-white text-black px-4 py-1.5 rounded-full">Enter</button>
                      </div>
                  </div>
              </div>
          )}
      </div>

      {/* 4. Dynamic Status Pipeline (Tabs) */}
      <div className="flex mb-4 bg-white/5 p-1 rounded-full relative">
          <div 
            className="absolute top-1 bottom-1 bg-white/10 rounded-full transition-all duration-300 ease-out"
            style={{ 
                left: activePipeline === 'Backlog' ? '4px' : activePipeline === 'Active' ? '33.33%' : '66.66%',
                width: 'calc(33.33% - 4px)',
                transform: activePipeline === 'Active' ? 'translateX(2px)' : activePipeline === 'Archive' ? 'translateX(-2px)' : 'none'
            }}
          />
          {['Backlog', 'Active', 'Archive'].map(status => (
              <button
                key={status}
                onClick={() => setActivePipeline(status as any)}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider relative z-10 transition-colors ${activePipeline === status ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                  {status}
              </button>
          ))}
      </div>

      {/* Task List */}
      <div className="space-y-3 flex-1">
          {visibleTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 opacity-50">
                  <Box size={40} className="text-gray-600 mb-2"/>
                  <span className="text-xs text-gray-500">Pipeline Empty</span>
              </div>
          ) : (
              visibleTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="glass-card p-4 rounded-[24px] group animate-in slide-in-from-bottom-2 duration-300 border-l-[3px] border-l-transparent hover:bg-white/5 transition-all"
                    style={{ borderLeftColor: task.priority === 'High' ? '#f87171' : task.priority === 'Medium' ? 'var(--primary)' : 'transparent' }}
                  >
                      <div className="flex justify-between items-start mb-2">
                          <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                          </div>
                          <button onClick={() => deleteTask(task.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                              <Trash2 size={14} />
                          </button>
                      </div>
                      
                      <h3 className="text-white font-medium mb-1 leading-snug">{task.title}</h3>
                      {task.description && (
                          <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{task.description}</p>
                      )}
                      
                      {/* Tactile Controls */}
                      <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-white/5">
                          {activePipeline === 'Backlog' && (
                              <button onClick={() => moveTask(task.id, 'Active')} className="flex items-center gap-1 text-[10px] font-bold text-[var(--primary)] hover:bg-[var(--primary)]/10 px-3 py-1.5 rounded-full transition-colors">
                                  Start Sprint <ArrowRight size={12} />
                              </button>
                          )}
                          {activePipeline === 'Active' && (
                              <>
                                <button onClick={() => moveTask(task.id, 'Backlog')} className="text-gray-500 hover:text-white px-2">
                                    <RotateCcw size={14} />
                                </button>
                                <button onClick={() => moveTask(task.id, 'Archive')} className="flex items-center gap-1 text-[10px] font-bold text-black bg-[var(--primary)] px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity">
                                    <CheckSquare size={12} /> Complete
                                </button>
                              </>
                          )}
                          {activePipeline === 'Archive' && (
                              <span className="text-[10px] text-gray-600 flex items-center gap-1 italic">
                                  Completed {new Date(task.completedAt || '').toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                              </span>
                          )}
                      </div>
                  </div>
              ))
          )}
      </div>
    </div>
  );
};

// Simple icon for restore
function RotateCcw({ size }: { size: number }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
        </svg>
    )
}

export default TaskManager;
