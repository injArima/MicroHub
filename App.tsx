import React, { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';
import HomeHub from './apps/HomeHub';
import TaskManager from './apps/TaskManager';
import JournalApp from './apps/JournalApp';
import MovieApp from './apps/MovieApp';
import ProfileApp from './apps/ProfileApp';
import { AppRoute, SheetConfig } from './types';
import { getSheetConfig, fetchCloudData, disconnectSheet } from './services/sheet';
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
            } catch (e: any) {
                console.error("Sync failed", e);
                // Auto-disconnect if credentials are invalid to prevent infinite error loops
                if (e.message && (e.message.includes("Invalid Credentials") || e.message.includes("Unauthorized"))) {
                    disconnectSheet();
                    setSheetConfig(null);
                    alert("Database connection failed: Invalid Credentials. Please reconnect in Profile.");
                }
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
            <div className="flex flex-col items-center justify-center min-h-screen z-10 relative">
                <Loader2 className="w-10 h-10 text-[#d9f99d] animate-spin mb-4" />
                <p className="text-gray-400 text-sm">Syncing...</p>
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
      case AppRoute.PROFILE:
        return (
          <ProfileApp 
            config={sheetConfig} 
            onConnect={handleConnect} 
            onDisconnect={handleDisconnect} 
          />
        );
      default:
        return <HomeHub onNavigate={setCurrentRoute} config={sheetConfig} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#d9f99d] selection:text-black overflow-hidden relative font-sans">
      
      {/* Ambient Background Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-green-900/20 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#d9f99d]/5 rounded-full blur-[100px] opacity-40" />
        <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-blue-900/10 rounded-full blur-[80px] opacity-30" />
      </div>

      <main className="max-w-md mx-auto min-h-screen relative z-10 backdrop-blur-[1px]">
        {renderScreen()}
        <BottomNav currentRoute={currentRoute} onNavigate={setCurrentRoute} />
      </main>
    </div>
  );
};

export default App;