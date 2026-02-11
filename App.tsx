
import React, { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';
import HomeHub from './apps/HomeHub';
import TaskManager from './apps/TaskManager';
import JournalApp from './apps/JournalApp';
import MovieApp from './apps/MovieApp';
import ProfileApp from './apps/ProfileApp';
import AiChat from './apps/AiChat';
import TimeApp from './apps/TimeApp';
import ImageGen from './apps/ImageGen';
import { AppRoute, SheetConfig, ThemeConfig } from './types';
import { getSheetConfig, fetchCloudData, disconnectSheet } from './services/sheet';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.HOME);
  const [sheetConfig, setSheetConfig] = useState<SheetConfig | null>(getSheetConfig());
  const [isSyncing, setIsSyncing] = useState(false);
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('microhub_username') || 'Traveler');

  // Theme State
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    try {
        const saved = localStorage.getItem('microhub_theme');
        return saved ? JSON.parse(saved) : { primary: '#bef264', secondary: '#000000' };
    } catch {
        return { primary: '#bef264', secondary: '#000000' };
    }
  });

  const updateTheme = (newTheme: ThemeConfig) => {
      setTheme(newTheme);
      localStorage.setItem('microhub_theme', JSON.stringify(newTheme));
  };

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
                
                if (cloudData.user?.name) {
                    setUserName(cloudData.user.name);
                    localStorage.setItem('microhub_username', cloudData.user.name);
                }

            } catch (e: any) {
                console.error("Sync failed", e);
                if (e.message && (e.message.includes("Invalid Credentials") || e.message.includes("Unauthorized"))) {
                    disconnectSheet();
                    setSheetConfig(null);
                    alert("Database connection failed. Please reconnect in Profile.");
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
    setUserName('Traveler');
    localStorage.removeItem('microhub_username');
  };

  const renderScreen = () => {
    if (isSyncing) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen z-10 relative bg-white">
                <Loader2 className="w-10 h-10 text-black animate-spin mb-4" />
                <p className="text-black font-bold text-sm">SYNCING DATA...</p>
            </div>
        );
    }

    switch (currentRoute) {
      case AppRoute.HOME:
        return <HomeHub onNavigate={setCurrentRoute} config={sheetConfig} userName={userName} />;
      case AppRoute.TASKS:
        return <TaskManager onBack={() => setCurrentRoute(AppRoute.HOME)} sheetConfig={sheetConfig} />;
      case AppRoute.JOURNAL:
        return <JournalApp onBack={() => setCurrentRoute(AppRoute.HOME)} sheetConfig={sheetConfig} />;
      case AppRoute.MOVIES:
        return <MovieApp onBack={() => setCurrentRoute(AppRoute.HOME)} sheetConfig={sheetConfig} />;
      case AppRoute.TIMER:
        return <TimeApp onBack={() => setCurrentRoute(AppRoute.HOME)} initialMode="timer" />;
      case AppRoute.STOPWATCH:
        return <TimeApp onBack={() => setCurrentRoute(AppRoute.HOME)} initialMode="stopwatch" />;
      case AppRoute.PROFILE:
        return (
          <ProfileApp 
            config={sheetConfig} 
            onConnect={handleConnect} 
            onDisconnect={handleDisconnect}
            theme={theme}
            onUpdateTheme={updateTheme}
          />
        );
      default:
        return <HomeHub onNavigate={setCurrentRoute} config={sheetConfig} userName={userName} />;
    }
  };

  // Construct CSS Variables Style Object
  const themeStyles = {
      '--primary': theme.primary,
      '--secondary': theme.secondary,
  } as React.CSSProperties;

  return (
    <div style={themeStyles} className="min-h-screen bg-white text-black font-sans relative">
      
      {/* Grid Background for Wireframe Effect */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" 
           style={{
               backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
               backgroundSize: '20px 20px'
           }}
      />

      <main className="w-full md:max-w-md mx-auto min-h-screen relative z-10 flex flex-col">
        {renderScreen()}
        <BottomNav currentRoute={currentRoute} onNavigate={setCurrentRoute} />
      </main>
    </div>
  );
};

export default App;
