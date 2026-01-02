import React from 'react';
import { Home, ListTodo, MessageSquare, Image as ImageIcon, BookOpen, Film } from 'lucide-react';
import { AppRoute } from '../types';

interface BottomNavProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentRoute, onNavigate }) => {
  const isActive = (route: AppRoute) => currentRoute === route;

  const NavButton = ({ route, icon: Icon }: { route: AppRoute; icon: any }) => (
    <button 
        onClick={() => onNavigate(route)}
        className={`
            relative p-3 rounded-2xl transition-all duration-300 group
            ${isActive(route) ? 'bg-[#fde047] text-black shadow-[0_0_20px_rgba(253,224,71,0.3)] scale-110 -translate-y-2' : 'text-gray-400 hover:text-white hover:bg-white/5'}
        `}
    >
      <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive(route) ? 'scale-110' : 'group-hover:scale-110'}`} />
      {isActive(route) && (
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#fde047] rounded-full"></span>
      )}
    </button>
  );

  return (
    <div className="fixed bottom-8 left-0 right-0 px-6 z-50 pointer-events-none flex justify-center">
      <div className="bg-[#18181b]/90 backdrop-blur-xl rounded-[24px] p-2 shadow-2xl border border-white/10 pointer-events-auto flex gap-1 items-center px-3">
        
        <NavButton route={AppRoute.HOME} icon={Home} />
        <div className="w-px h-6 bg-white/5 mx-1"></div>
        <NavButton route={AppRoute.TASKS} icon={ListTodo} />
        <NavButton route={AppRoute.JOURNAL} icon={BookOpen} />
        <NavButton route={AppRoute.MOVIES} icon={Film} />
        <div className="w-px h-6 bg-white/5 mx-1"></div>
        <NavButton route={AppRoute.AI_CHAT} icon={MessageSquare} />
        <NavButton route={AppRoute.IMAGE_GEN} icon={ImageIcon} />

      </div>
    </div>
  );
};

export default BottomNav;