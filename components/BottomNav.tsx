
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
            relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200
            ${isActive(route) ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]' : 'text-black hover:bg-gray-100'}
        `}
    >
      <Icon className="w-5 h-5" strokeWidth={2.5} />
    </button>
  );

  return (
    <div className="fixed bottom-6 left-0 right-0 px-6 z-50 flex justify-center pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-1 bg-white border-2 border-black rounded-2xl px-2 py-2 shadow-[4px_4px_0px_0px_#000]">
        
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
