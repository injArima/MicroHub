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
            ${isActive(route) ? 'text-[#d9f99d]' : 'text-gray-500 hover:text-gray-300'}
        `}
    >
      <Icon className={`w-6 h-6 transition-transform duration-300 ${isActive(route) ? 'scale-110' : 'group-hover:scale-105'}`} />
      
      {/* Active Dot Indicator */}
      {isActive(route) && (
          <span className="absolute bottom-2 w-1 h-1 bg-[#d9f99d] rounded-full shadow-[0_0_8px_#d9f99d]"></span>
      )}
    </button>
  );

  return (
    <div className="fixed bottom-6 left-0 right-0 px-6 z-50 flex justify-center pointer-events-none">
      <div className="glass-panel rounded-[28px] px-4 py-2 shadow-2xl pointer-events-auto flex items-center gap-1">
        
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