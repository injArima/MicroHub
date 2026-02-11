
import React, { useState, useEffect } from 'react';
import { Plus, ArrowLeft, Loader2, ArrowRight, Trash2, Box, CheckSquare, RotateCcw } from 'lucide-react';
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
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setIsDirty(true);
  };

  const filteredTasks = tasks.filter(t => filterPriority === 'All' ? true : t.priority === filterPriority);
  const visibleTasks = filteredTasks.filter(t => t.status === activePipeline);

  // --- STYLES ---

  const getPriorityStyle = (p: string) => {
      switch(p) {
          case 'High': return 'bg-red-500 text-white border-red-500';
          case 'Medium': return 'bg-yellow-400 text-black border-yellow-400';
          case 'Low': return 'bg-blue-300 text-black border-blue-300';
          default: return 'bg-gray-200 text-black';
      }
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen pb-32 px-6 flex flex-col bg-[var(--bg-color)]">
      
      {/* Header */}
      <div className="pt-8 pb-4 bg-[var(--bg-color)] sticky top-0 z-30 border-b-2 border-[var(--border-color)]">
        <div className="flex justify-between items-center mb-4">
            <button onClick={onBack} className="w-10 h-10 rounded-full border-2 border-[var(--border-color)] flex items-center justify-center text-[var(--text-color)] hover:bg-[var(--secondary)] hover:text-[var(--text-inverted)] transition-colors">
                <ArrowLeft size={20} strokeWidth={2.5} />
            </button>
            <div className="flex flex-col items-end">
                 <h1 className="text-xl font-black text-[var(--text-color)] uppercase tracking-tighter">COMMAND</h1>
                 <div className="flex items-center gap-2">
                    {saveStatus === 'saving' && <Loader2 size={12} className="animate-spin text-[var(--text-color)]" />}
                    {saveStatus === 'saved' && <span className="text-[10px] font-bold bg-[var(--secondary)] text-[var(--text-inverted)] px-1">SYNCED</span>}
                 </div>
            </div>
        </div>

        {/* Priority Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {['All', 'High', 'Medium', 'Low'].map(f => (
                <button 
                    key={f} 
                    onClick={() => setFilterPriority(f as any)}
                    className={`px-3 py-1 rounded-full text-xs font-black border-2 border-[var(--border-color)] transition-all ${
                        filterPriority === f 
                        ? 'bg-[var(--secondary)] text-[var(--text-inverted)] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]' 
                        : 'bg-[var(--bg-color)] text-[var(--text-color)] hover:bg-[var(--bg-secondary)]'
                    }`}
                >
                    {f.toUpperCase()}
                </button>
            ))}
        </div>
      </div>

      {/* Input Area */}
      <div className={`mt-6 mb-6 transition-all duration-300 ${isInputExpanded ? 'contra-card p-4' : 'contra-card p-2'}`}>
          <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsInputExpanded(!isInputExpanded)}
                className="w-8 h-8 rounded-lg bg-[var(--secondary)] text-[var(--text-inverted)] flex items-center justify-center flex-shrink-0"
              >
                  <Plus size={20} />
              </button>
              <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onFocus={() => setIsInputExpanded(true)}
                  placeholder="NEW DIRECTIVE..."
                  className="bg-transparent text-[var(--text-color)] placeholder:text-gray-400 outline-none text-sm flex-1 font-bold uppercase"
              />
          </div>
          
          {isInputExpanded && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                  <textarea 
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="DETAILS..."
                      className="w-full bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] rounded-lg p-3 text-xs text-[var(--text-color)] outline-none resize-none mb-3 min-h-[80px] font-mono"
                  />
                  <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                          {['High', 'Medium', 'Low'].map((p) => (
                              <button 
                                key={p}
                                onClick={() => setNewPriority(p as any)}
                                className={`w-6 h-6 rounded-full border-2 border-[var(--border-color)] flex items-center justify-center transition-all ${newPriority === p ? 'bg-[var(--secondary)] text-white' : 'bg-transparent text-transparent'}`}
                              >
                                  <div className={`w-2 h-2 rounded-full ${p === 'High' ? 'bg-red-500' : p === 'Medium' ? 'bg-yellow-400' : 'bg-blue-300'}`}></div>
                              </button>
                          ))}
                      </div>
                      <button onClick={addTask} className="text-xs font-black bg-[var(--secondary)] text-[var(--text-inverted)] px-6 py-2 rounded-full hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transition-shadow">
                          EXECUTE
                      </button>
                  </div>
              </div>
          )}
      </div>

      {/* Pipeline Tabs */}
      <div className="flex mb-6 border-b-2 border-[var(--border-color)]">
          {['Backlog', 'Active', 'Archive'].map(status => (
              <button
                key={status}
                onClick={() => setActivePipeline(status as any)}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-wider relative transition-colors ${
                    activePipeline === status 
                    ? 'text-[var(--text-color)] bg-[#bef264] border-t-2 border-x-2 border-[var(--border-color)] -mb-[2px] pb-[4px]' 
                    : 'text-gray-400 hover:text-[var(--text-color)] hover:bg-[var(--bg-secondary)]'
                }`}
              >
                  {status}
              </button>
          ))}
      </div>

      {/* List */}
      <div className="space-y-3 flex-1">
          {visibleTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 opacity-50 border-2 border-dashed border-gray-400 rounded-xl">
                  <Box size={40} className="text-gray-400 mb-2"/>
                  <span className="text-xs font-bold text-gray-400 uppercase">NO DATA</span>
              </div>
          ) : (
              visibleTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="contra-card p-4 group animate-in slide-in-from-bottom-2 duration-300"
                  >
                      <div className="flex justify-between items-start mb-2">
                          <div className={`px-2 py-0.5 rounded-sm border-2 text-[9px] font-black uppercase tracking-wider ${getPriorityStyle(task.priority)}`}>
                              {task.priority}
                          </div>
                          <button onClick={() => deleteTask(task.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                              <Trash2 size={16} />
                          </button>
                      </div>
                      
                      <h3 className="text-[var(--text-color)] font-bold text-lg leading-tight mb-1 uppercase">{task.title}</h3>
                      {task.description && (
                          <p className="text-xs text-gray-500 font-mono mb-4 border-l-2 border-[var(--border-color)] pl-2">{task.description}</p>
                      )}
                      
                      {/* Controls */}
                      <div className="flex justify-end gap-2 mt-4 pt-3 border-t-2 border-[var(--bg-secondary)]">
                          {activePipeline === 'Backlog' && (
                              <button onClick={() => moveTask(task.id, 'Active')} className="flex items-center gap-1 text-[10px] font-black bg-[var(--secondary)] text-[var(--text-inverted)] px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity">
                                  INITIATE <ArrowRight size={12} />
                              </button>
                          )}
                          {activePipeline === 'Active' && (
                              <>
                                <button onClick={() => moveTask(task.id, 'Backlog')} className="text-[var(--text-color)] hover:bg-[var(--bg-secondary)] px-2 rounded-full border-2 border-transparent hover:border-[var(--border-color)] transition-all">
                                    <RotateCcw size={14} />
                                </button>
                                <button onClick={() => moveTask(task.id, 'Archive')} className="flex items-center gap-1 text-[10px] font-black bg-[#bef264] text-black border-2 border-[var(--border-color)] px-3 py-1.5 rounded-full hover:shadow-[2px_2px_0px_0px_var(--border-color)] transition-all">
                                    <CheckSquare size={12} /> COMPLETE
                                </button>
                              </>
                          )}
                          {activePipeline === 'Archive' && (
                              <span className="text-[10px] font-mono text-gray-500">
                                  DONE: {new Date(task.completedAt || '').toLocaleDateString()}
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

export default TaskManager;
