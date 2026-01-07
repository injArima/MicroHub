
import React, { useRef } from 'react';
import { Home, ListTodo, BookOpen, Film, User } from 'lucide-react';
import { AppRoute } from '../types';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface BottomNavProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentRoute, onNavigate }) => {
  const container = useRef(null);
  
  const isActive = (route: AppRoute) => currentRoute === route;

  // Animate active icon when currentRoute changes
  useGSAP(() => {
    // Select the active icon svg
    const activeIcon = document.querySelector('.nav-icon-active');
    if (activeIcon) {
        gsap.fromTo(activeIcon, 
            { scale: 0.8, rotation: -15 },
            { scale: 1.1, rotation: 0, duration: 0.6, ease: "elastic.out(1, 0.5)" }
        );
    }
  }, { scope: container, dependencies: [currentRoute] });

  const NavButton = ({ route, icon: Icon }: { route: AppRoute; icon: any }) => (
    <button 
        onClick={() => onNavigate(route)}
        className={`
            relative w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 group
            ${isActive(route) ? 'text-[var(--primary)]' : 'text-white/40 hover:text-white'}
        `}
    >
      <Icon 
        className={`w-5 h-5 transition-transform duration-300 ${isActive(route) ? 'nav-icon-active drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]' : 'group-hover:scale-105'}`} 
        strokeWidth={isActive(route) ? 2.5 : 2} 
      />
      
      {/* Active Dot Indicator - Animated via CSS transition mainly, but GSAP handles the icon pop */}
      {isActive(route) && (
          <span className="absolute bottom-2.5 w-1 h-1 bg-[var(--primary)] rounded-full shadow-[0_0_8px_var(--primary)] animate-in fade-in zoom-in duration-300"></span>
      )}
    </button>
  );

  return (
    <div ref={container} className="fixed bottom-8 left-0 right-0 px-6 z-50 flex justify-center pointer-events-none">
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
