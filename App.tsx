
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

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '190, 242, 100';
}

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.HOME);
  const [sheetConfig, setSheetConfig] = useState<SheetConfig | null>(getSheetConfig());
  const [isSyncing, setIsSyncing] = useState(false);
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('microhub_username') || 'Traveler');

  // Theme State
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    try {
        const saved = localStorage.getItem('microhub_theme');
        return saved ? JSON.parse(saved) : { primary: '#bef264', secondary: '#d9f99d' };
    } catch {
        return { primary: '#bef264', secondary: '#d9f99d' };
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
    setUserName('Traveler');
    localStorage.removeItem('microhub_username');
  };

  const renderScreen = () => {
    if (isSyncing) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen z-10 relative">
                <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin mb-4" />
                <p className="text-gray-400 text-sm font-light">Syncing cloud data...</p>
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
      '--primary-rgb': hexToRgb(theme.primary),
      '--secondary': theme.secondary,
      '--secondary-rgb': hexToRgb(theme.secondary),
  } as React.CSSProperties;

  return (
    <div style={themeStyles} className="min-h-screen bg-[#050505] text-white selection:bg-[var(--primary)] selection:text-black overflow-hidden relative font-sans transition-colors duration-500">
      
      {/* Refined Ambient Background Blobs with Animation */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Main Glow (Top Left) */}
        <div className="absolute top-[-20%] left-[-20%] w-[140vw] h-[140vw] md:w-[600px] md:h-[600px] bg-[var(--primary)] rounded-full blur-[100px] opacity-25 mix-blend-screen animate-blob" />
        
        {/* Secondary Glow (Bottom Right) */}
        <div className="absolute bottom-[-10%] right-[-20%] w-[120vw] h-[120vw] md:w-[500px] md:h-[500px] bg-[var(--primary)] rounded-full blur-[100px] opacity-20 mix-blend-screen animate-blob animation-delay-2000" />
        
        {/* Subtle Middle Accent */}
        <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 w-[100vw] h-[100vw] md:w-[400px] md:h-[400px] bg-white rounded-full blur-[120px] opacity-10 animate-blob animation-delay-4000" />
      </div>

      <main className="w-full md:max-w-md mx-auto min-h-screen relative z-10 transition-all duration-300 flex flex-col">
        {renderScreen()}
        <BottomNav currentRoute={currentRoute} onNavigate={setCurrentRoute} />
      </main>
    </div>
  );
};

export default App;
