
import React, { useState, useEffect } from 'react';
import VinChecker from './components/VinChecker';
import ChatAssistant from './components/ChatAssistant';
import MediaTools from './components/MediaTools';
import ProfileView from './components/ProfileView';
import AdminView from './components/AdminView';
import EducationCenter from './components/EducationCenter';
import { AppView, User, HistoryItem } from './types';

const THEME_KEY = 'vin_diesel_theme';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
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

  const handleShare = async () => {
      if (navigator.share) {
          try {
              await navigator.share({
                  title: 'CTC Compliance Coach',
                  text: 'Instant compliance checks for HD Diesel trucks.',
                  url: shareUrl
              });
          } catch (err) { alert("Sharing failed"); }
      }
  };

  const handleAddToHistory = (value: string, type: 'VIN' | 'ENTITY' | 'TRUCRS') => {
    const newItem: HistoryItem = { id: Date.now().toString(), value: value.trim().toUpperCase(), type, timestamp: Date.now() };
    const updated = [newItem, ...history.filter(h => h.value !== newItem.value)].slice(0, 50);
    setHistory(updated);
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-iceWhite'} font-sans text-navy dark:text-gray-100 overflow-x-hidden transition-colors duration-300`}>
      
      {/* HEADER SECTION - SHINING NAVY */}
      <header className="bg-navy dark:bg-gray-800 px-4 py-6 sticky top-0 z-40 border-b-4 border-teslaRed pt-safe flex flex-col gap-6 shadow-2xl">
        <div className="flex justify-between items-center">
            <div className="flex flex-col cursor-pointer" onClick={() => setCurrentView(AppView.HOME)}>
                <h1 className="text-3xl font-black tracking-tighter text-white uppercase leading-none">Compliance Coach</h1>
                <p className="text-vibrantGreen text-sm font-black tracking-widest uppercase mt-1">HD Diesel Solutions</p>
            </div>
            <button 
              onClick={handleShare} 
              className="bg-white text-navy text-xs font-black px-5 py-3 rounded-xl uppercase tracking-wider border-2 border-navy shadow-lg active:scale-95 transition-all"
            >
              SHARE
            </button>
        </div>
        
        {/* TOP ACTION ROW */}
        <div className="flex gap-3">
            <a href="tel:6173596953" className="flex-1 btn-heavy py-4 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-xl active:scale-95 transition-all">
                CALL DISPATCH
            </a>
            <button onClick={() => setCurrentView(AppView.HOME)} className="flex-1 bg-vibrantGreen text-white py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-black border-4 border-navy shadow-xl active:scale-95 transition-all uppercase">
                FIND TESTER
            </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 px-4 pt-8 pb-24 max-w-lg mx-auto w-full flex flex-col">
        <div className="flex-1">
          {currentView === AppView.HOME && (
              <VinChecker 
                  onAddToHistory={handleAddToHistory} 
                  onNavigateChat={() => setCurrentView(AppView.ASSISTANT)}
                  onNavigateEducation={() => setCurrentView(AppView.EDUCATION)}
                  onInstallApp={() => {}}
                  onShare={handleShare}
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
        </div>
        
        {/* FOOTER INFO */}
        <div className="mt-auto py-12 text-center border-t-2 border-navy/5">
            <p className="text-sm font-black text-navy/40 dark:text-white/40 uppercase tracking-[0.2em] leading-loose px-6">
                Statewide Compliance & Testing<br/>
                Serving All 58 California Counties<br/>
                © 2026 CTC COMPLIANCE COACH
            </p>
        </div>
      </main>

      {/* NAVIGATION BAR - FROSTED GLASS LOOK */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-t-4 border-navy pb-safe pt-2 px-3 flex justify-around items-end z-50 shadow-[0_-10px_40px_rgba(14,51,134,0.15)] h-[95px] transition-colors">
        {[
            { id: AppView.HOME, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", label: "STATUS" },
            { id: AppView.TOOLS, icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z", label: "TOOLS" },
            { id: AppView.ASSISTANT, icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z", label: "COACH" },
            { id: AppView.EDUCATION, icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", label: "LEARN" },
            { id: AppView.PROFILE, icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", label: "PROFILE" }
        ].map(btn => (
            <button key={btn.id} onClick={() => setCurrentView(btn.id as AppView)} className={`flex flex-col items-center justify-center flex-1 h-full pb-4 transition-all duration-300 ${currentView === btn.id ? '-translate-y-2' : 'opacity-50 hover:opacity-100'}`}>
                <div className={`p-3 rounded-2xl mb-1 transition-all ${currentView === btn.id ? 'bg-navy text-white shadow-2xl scale-125' : 'text-navy'}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={currentView === btn.id ? 3 : 2} d={btn.icon} /></svg>
                </div>
                <span className={`text-[11px] font-black tracking-tight uppercase ${currentView === btn.id ? 'text-navy dark:text-white' : 'text-navy/60 dark:text-white/60'}`}>{btn.label}</span>
            </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
