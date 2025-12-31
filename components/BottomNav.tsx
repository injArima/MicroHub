import React from 'react';
import { Home, ListTodo, MessageSquare, Image as ImageIcon, BookOpen } from 'lucide-react';
import { AppRoute } from '../types';

interface BottomNavProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentRoute, onNavigate }) => {
  const getIconColor = (route: AppRoute) => {
    return currentRoute === route ? 'text-black' : 'text-gray-400';
  };

  const getBgClass = (route: AppRoute) => {
      return currentRoute === route ? 'bg-[#FDE047]' : 'transparent';
  }

  return (
    <div className="fixed bottom-6 left-0 right-0 px-6 z-50 pointer-events-none">
      <div className="mx-auto max-w-sm bg-[#27272a] rounded-full p-2 shadow-2xl border border-white/5 pointer-events-auto flex justify-between items-center">
        
        <button 
            onClick={() => onNavigate(AppRoute.HOME)}
            className={`p-3 rounded-full transition-all duration-300 ${getBgClass(AppRoute.HOME)}`}
        >
          <Home className={`w-6 h-6 ${getIconColor(AppRoute.HOME)}`} />
        </button>

        <button 
            onClick={() => onNavigate(AppRoute.TASKS)}
            className={`p-3 rounded-full transition-all duration-300 ${getBgClass(AppRoute.TASKS)}`}
        >
          <ListTodo className={`w-6 h-6 ${getIconColor(AppRoute.TASKS)}`} />
        </button>

        <button 
            onClick={() => onNavigate(AppRoute.JOURNAL)}
            className={`p-3 rounded-full transition-all duration-300 ${getBgClass(AppRoute.JOURNAL)}`}
        >
          <BookOpen className={`w-6 h-6 ${getIconColor(AppRoute.JOURNAL)}`} />
        </button>

        <button 
            onClick={() => onNavigate(AppRoute.AI_CHAT)}
            className={`p-3 rounded-full transition-all duration-300 ${getBgClass(AppRoute.AI_CHAT)}`}
        >
          <MessageSquare className={`w-6 h-6 ${getIconColor(AppRoute.AI_CHAT)}`} />
        </button>

        <button 
             onClick={() => onNavigate(AppRoute.IMAGE_GEN)}
             className={`p-3 rounded-full transition-all duration-300 ${getBgClass(AppRoute.IMAGE_GEN)}`}
        >
          <ImageIcon className={`w-6 h-6 ${getIconColor(AppRoute.IMAGE_GEN)}`} />
        </button>

      </div>
    </div>
  );
};

export default BottomNav;