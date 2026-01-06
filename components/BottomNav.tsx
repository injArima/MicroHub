import React from 'react';
import { Home, ListTodo, BookOpen, Film, User } from 'lucide-react';
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
            relative w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 group
            ${isActive(route) ? 'text-[#bef264]' : 'text-white/40 hover:text-white'}
        `}
    >
      <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive(route) ? 'scale-110 drop-shadow-[0_0_8px_rgba(190,242,100,0.5)]' : 'group-hover:scale-105'}`} strokeWidth={isActive(route) ? 2.5 : 2} />
      
      {/* Active Dot Indicator */}
      {isActive(route) && (
          <span className="absolute bottom-2.5 w-1 h-1 bg-[#bef264] rounded-full shadow-[0_0_8px_#bef264]"></span>
      )}
    </button>
  );

  return (
    <div className="fixed bottom-8 left-0 right-0 px-6 z-50 flex justify-center pointer-events-none">
      <div className="glass-panel rounded-[32px] px-3 py-2 pointer-events-auto flex items-center gap-2 bg-[#0a0a0a]/80 backdrop-blur-xl border-white/10 shadow-2xl">
        
        <NavButton route={AppRoute.HOME} icon={Home} />
        <NavButton route={AppRoute.TASKS} icon={ListTodo} />
        <NavButton route={AppRoute.JOURNAL} icon={BookOpen} />
        <NavButton route={AppRoute.MOVIES} icon={Film} />
        <NavButton route={AppRoute.PROFILE} icon={User} />

      </div>
    </div>
  );
};

export default BottomNav;