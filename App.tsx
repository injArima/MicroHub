import React, { useState } from 'react';
import BottomNav from './components/BottomNav';
import HomeHub from './apps/HomeHub';
import TaskManager from './apps/TaskManager';
import AiChat from './apps/AiChat';
import ImageGen from './apps/ImageGen';
import JournalApp from './apps/JournalApp';
import { AppRoute } from './types';

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.HOME);

  const renderScreen = () => {
    switch (currentRoute) {
      case AppRoute.HOME:
        return <HomeHub onNavigate={setCurrentRoute} />;
      case AppRoute.TASKS:
        return <TaskManager onBack={() => setCurrentRoute(AppRoute.HOME)} />;
      case AppRoute.JOURNAL:
        return <JournalApp onBack={() => setCurrentRoute(AppRoute.HOME)} />;
      case AppRoute.AI_CHAT:
        return <AiChat onBack={() => setCurrentRoute(AppRoute.HOME)} />;
      case AppRoute.IMAGE_GEN:
        return <ImageGen onBack={() => setCurrentRoute(AppRoute.HOME)} />;
      default:
        return <HomeHub onNavigate={setCurrentRoute} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f10] text-white selection:bg-[#fde047] selection:text-black">
      <main className="max-w-md mx-auto min-h-screen shadow-2xl relative bg-[#0f0f10] border-x border-white/5">
        {renderScreen()}
        <BottomNav currentRoute={currentRoute} onNavigate={setCurrentRoute} />
      </main>
    </div>
  );
};

export default App;