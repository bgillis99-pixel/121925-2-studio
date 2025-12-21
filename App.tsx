import React, { useState, useEffect } from 'react';
import VinChecker from './components/VinChecker';
import ChatAssistant from './components/ChatAssistant';
import MediaTools from './components/MediaTools';
import ProfileView from './components/ProfileView';
import AdminView from './components/AdminView';
import EducationCenter from './components/EducationCenter';
import { AppView, User, HistoryItem } from './types';

const USERS_KEY = 'vin_diesel_users';
const CURRENT_USER_KEY = 'vin_diesel_current_user';
const GLOBAL_HISTORY_KEY = 'vin_diesel_global_history';
const THEME_KEY = 'vin_diesel_theme';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showInstall, setShowInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem(THEME_KEY) === 'dark';
  });

  const shareUrl = 'https://cleantruckcheckvin.app';

  useEffect(() => {
    localStorage.setItem(THEME_KEY, isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const checkIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(checkIOS);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    const currentEmail = localStorage.getItem(CURRENT_USER_KEY);
    if (currentEmail) {
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
      if (users[currentEmail]) {
        setUser({ email: currentEmail, history: users[currentEmail].history || [] });
        setHistory(users[currentEmail].history || []);
      }
    } else {
      const globalHistory = JSON.parse(localStorage.getItem(GLOBAL_HISTORY_KEY) || '[]');
      setHistory(globalHistory);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) setShowInstall(true);
    else if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') setDeferredPrompt(null);
    } else setShowInstall(true);
  };

  const handleShare = async () => {
      if (navigator.share) {
          try {
              await navigator.share({
                  title: 'CTC Compliance Coach',
                  text: 'Instant compliance checks for HD Diesel trucks.',
                  url: shareUrl
              });
          } catch (err) { setShowInstall(true); }
      } else setShowInstall(true);
  };

  const handleAddToHistory = (value: string, type: 'VIN' | 'ENTITY' | 'TRUCRS') => {
    const newItem: HistoryItem = { id: Date.now().toString(), value: value.trim().toUpperCase(), type, timestamp: Date.now() };
    const updated = [newItem, ...history.filter(h => h.value !== newItem.value)].slice(0, 50);
    setHistory(updated);
    if (!user) localStorage.setItem(GLOBAL_HISTORY_KEY, JSON.stringify(updated));
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-navy'} font-sans text-navy dark:text-gray-100 overflow-x-hidden transition-colors duration-300`}>
      
      {/* HEADER SECTION */}
      <header className="bg-navy dark:bg-gray-800 px-4 py-4 sticky top-0 z-40 border-b-2 border-white/10 pt-safe flex flex-col gap-4">
        <div className="flex justify-between items-start">
            <div className="flex flex-col cursor-pointer" onClick={() => setCurrentView(AppView.HOME)}>
                <h1 className="text-2xl font-black tracking-tighter text-white uppercase leading-none">Compliance Coach</h1>
                <p className="text-vibrantGreen text-[10px] font-black tracking-widest uppercase mt-1">Heavy Duty Support</p>
            </div>
            <button 
              onClick={handleInstallClick} 
              className="bg-white/10 border-2 border-white/20 text-white text-[10px] font-black px-4 py-2.5 rounded-xl uppercase tracking-wider hover:bg-white/20 transition-all shadow-lg active:scale-95"
            >
              DOWNLOAD APP
            </button>
        </div>
        
        {/* TOP ACTION ROW */}
        <div className="flex gap-3">
            <a href="tel:6173596953" className="flex-1 btn-heavy py-3.5 rounded-xl flex items-center justify-center gap-2 text-[11px] !bg-white !text-navy shadow-xl border-navy active:scale-95 transition-all">
                CALL DISPATCH
            </a>
            <button onClick={handleShare} className="flex-1 btn-heavy py-3.5 rounded-xl flex items-center justify-center gap-2 text-[11px] !bg-white !text-navy shadow-xl border-navy active:scale-95 transition-all">
                SHARE
            </button>
            <button onClick={() => setCurrentView(AppView.HOME)} className="flex-1 btn-heavy py-3.5 rounded-xl flex items-center justify-center gap-2 text-[11px] !bg-vibrantGreen !text-navy !border-navy shadow-xl active:scale-95 transition-all">
                FIND TESTER
            </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 px-4 pt-6 pb-24 max-w-lg mx-auto w-full overflow-y-auto">
        {currentView === AppView.HOME && (
            <VinChecker 
                onAddToHistory={handleAddToHistory} 
                onNavigateChat={() => setCurrentView(AppView.ASSISTANT)}
                onNavigateEducation={() => setCurrentView(AppView.EDUCATION)}
                onInstallApp={handleInstallClick}
            />
        )}
        {currentView === AppView.ASSISTANT && <ChatAssistant />}
        {currentView === AppView.EDUCATION && <EducationCenter />}
        {currentView === AppView.TOOLS && <MediaTools />}
        {currentView === AppView.PROFILE && (
          <ProfileView 
            user={user} 
            history={history} 
            onLogin={() => {}} 
            onRegister={() => {}} 
            onLogout={() => {}} 
            isDarkMode={isDarkMode}
            toggleTheme={() => setIsDarkMode(!isDarkMode)}
            onAdminAccess={() => setCurrentView(AppView.ADMIN)}
          />
        )}
        {currentView === AppView.ADMIN && <AdminView />}
        
        {/* FOOTER INFO */}
        <div className="mt-12 space-y-6 text-center pb-24 border-t-2 border-white/10 pt-10">
            <div className="flex flex-col items-center gap-3">
              <img src="/logo.svg" alt="CTC Logo" className="w-12 h-12 opacity-50" />
              <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] leading-loose">
                  Statewide Compliance & Testing<br/>
                  Serving All 58 California Counties<br/>
                  © 2026 CTC COMPLIANCE COACH
              </p>
            </div>
        </div>
      </main>

      {/* NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t-2 border-gray-200 dark:border-gray-700 pb-safe pt-1 px-2 flex justify-around items-end z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.15)] h-[85px] transition-colors">
        {[
            { id: AppView.HOME, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", label: "STATUS" },
            { id: AppView.TOOLS, icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z", label: "TOOLS" },
            { id: AppView.ASSISTANT, icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z", label: "COACH AI" },
            { id: AppView.EDUCATION, icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", label: "LEARN" },
            { id: AppView.PROFILE, icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", label: "PROFILE" }
        ].map(btn => (
            <button key={btn.id} onClick={() => setCurrentView(btn.id as AppView)} className={`flex flex-col items-center justify-center flex-1 h-full pb-4 transition-all duration-300 ${currentView === btn.id ? '-translate-y-2' : 'opacity-60'}`}>
                <div className={`p-2.5 rounded-2xl mb-1 transition-all ${currentView === btn.id ? 'bg-navy text-white shadow-xl' : 'text-gray-500 dark:text-gray-400'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={btn.icon} /></svg>
                </div>
                <span className={`text-[9px] font-black tracking-tighter uppercase ${currentView === btn.id ? 'text-navy dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{btn.label}</span>
            </button>
        ))}
      </nav>
    </div>
  );
};

export default App;