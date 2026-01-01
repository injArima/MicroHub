import React, { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';
import HomeHub from './apps/HomeHub';
import TaskManager from './apps/TaskManager';
import AiChat from './apps/AiChat';
import ImageGen from './apps/ImageGen';
import JournalApp from './apps/JournalApp';
import MovieApp from './apps/MovieApp';
import ProfileApp from './apps/ProfileApp';
import { AppRoute, SheetConfig } from './types';
import { getSheetConfig, fetchCloudData } from './services/sheet.ts';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.HOME);
  const [sheetConfig, setSheetConfig] = useState<SheetConfig | null>(getSheetConfig());
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync Data on Startup if Connected
  useEffect(() => {
    const syncData = async () => {
        if (sheetConfig) {
            setIsSyncing(true);
            try {
                const cloudData = await fetchCloudData(sheetConfig);
                if (cloudData.tasks) localStorage.setItem('microhub_tasks', JSON.stringify(cloudData.tasks));
                if (cloudData.journal) localStorage.setItem('microhub_journal_entries', JSON.stringify(cloudData.journal));
                if (cloudData.movies) localStorage.setItem('microhub_movies', JSON.stringify(cloudData.movies));
                
                // Force reload of components by flipping route or just letting React Re-render logic handle it?
                // Since apps initialize state from LocalStorage on mount, fetching here might race if we don't block.
                // We are blocking render below.
            } catch (e) {
                console.error("Sync failed", e);
            } finally {
                setIsSyncing(false);
            }
        }
    };
    syncData();
  }, [sheetConfig]);

  const handleConnect = (config: SheetConfig) => {
    setSheetConfig(config);
  };

  const handleDisconnect = () => {
    setSheetConfig(null);
  };

  const renderScreen = () => {
    if (isSyncing) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="w-10 h-10 text-[#fde047] animate-spin mb-4" />
                <p className="text-gray-400 text-sm">Syncing with Google Sheets...</p>
            </div>
        );
    }

    switch (currentRoute) {
      case AppRoute.HOME:
        return <HomeHub onNavigate={setCurrentRoute} config={sheetConfig} />;
      case AppRoute.TASKS:
        return <TaskManager onBack={() => setCurrentRoute(AppRoute.HOME)} sheetConfig={sheetConfig} />;
      case AppRoute.JOURNAL:
        return <JournalApp onBack={() => setCurrentRoute(AppRoute.HOME)} sheetConfig={sheetConfig} />;
      case AppRoute.MOVIES:
        return <MovieApp onBack={() => setCurrentRoute(AppRoute.HOME)} sheetConfig={sheetConfig} />;
      case AppRoute.AI_CHAT:
        return <AiChat onBack={() => setCurrentRoute(AppRoute.HOME)} />;
      case AppRoute.IMAGE_GEN:
        return <ImageGen onBack={() => setCurrentRoute(AppRoute.HOME)} />;
      case AppRoute.PROFILE:
        return (
          <ProfileApp 
            config={sheetConfig} 
            onConnect={handleConnect} 
            onDisconnect={handleDisconnect} 
            onBack={() => setCurrentRoute(AppRoute.HOME)} 
          />
        );
      default:
        return <HomeHub onNavigate={setCurrentRoute} config={sheetConfig} />;
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