import React, { useState } from 'react';
import { Share2, Clock, MoreHorizontal, Plus, Calendar, ArrowLeft } from 'lucide-react';
import { AppRoute, Task } from '../types';

interface TaskManagerProps {
    onBack: () => void;
}

const TaskManager: React.FC<TaskManagerProps> = ({ onBack }) => {
  const [tasks] = useState<Task[]>([
    {
      id: '1',
      title: 'February Dribbble Shot Design',
      date: '26 Feb',
      time: '10:15pm',
      priority: 'Medium',
      team: ['https://picsum.photos/32/32?random=1', 'https://picsum.photos/32/32?random=2', 'https://picsum.photos/32/32?random=3'],
      colorTheme: 'lime'
    },
    {
      id: '2',
      title: 'Mobile App Prototype',
      date: '27 Feb',
      time: '02:00pm',
      priority: 'High',
      team: ['https://picsum.photos/32/32?random=4'],
      colorTheme: 'yellow'
    },
    {
      id: '3',
      title: 'Client Meeting Preparation',
      date: '28 Feb',
      time: '09:00am',
      priority: 'Medium',
      team: ['https://picsum.photos/32/32?random=5', 'https://picsum.photos/32/32?random=6'],
      colorTheme: 'red'
    }
  ]);

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
            <button className="bg-[#fde047] text-black px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2">
                <span className="text-xs">✏️</span> Edit Task
            </button>
        </div>
      </div>

      <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Manage Your Task</h1>
            <p className="text-gray-400 text-sm">3 tasks for today</p>
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

       <button className="mt-6 w-full py-4 rounded-full bg-[#fde047] text-black font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#facc15] transition-colors">
          <Plus size={20} /> Create New Task
       </button>
    </div>
  );
};

export default TaskManager;