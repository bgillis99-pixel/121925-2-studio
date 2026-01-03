
import React, { useState, useEffect } from 'react';
import VinChecker from './components/VinChecker';
import ChatAssistant from './components/ChatAssistant';
import MediaTools from './components/MediaTools';
import ProfileView from './components/ProfileView';
import AdminView from './components/AdminView';
import EducationCenter from './components/EducationCenter';
import { AppView, User, HistoryItem } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isFlashMode, setIsFlashMode] = useState(true);

  const handleAddToHistory = (value: string, type: 'VIN' | 'ENTITY' | 'TRUCRS') => {
    const newItem: HistoryItem = { id: Date.now().toString(), value: value.trim().toUpperCase(), type, timestamp: Date.now() };
    setHistory([newItem, ...history].slice(0, 20));
  };

  return (
    <div className="min-h-screen bg-obsidian flex flex-col font-sans selection:bg-liquidSilver selection:text-obsidian">
      
      {/* ELITE HEADER */}
      <header className="px-8 py-12 sticky top-0 z-40 bg-obsidian/90 backdrop-blur-xl flex justify-between items-center border-b border-white/5">
        <div>
            <h1 className="font-heading text-3xl text-white tracking-tighter uppercase leading-none">COMPLIANCE COMMAND</h1>
            <p className="text-liquidSilver text-[10px] font-black uppercase tracking-[0.4em] mt-2 opacity-40">California Fleet Authority</p>
        </div>
        <div className="flex items-center gap-6">
            <button className="text-white/20 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            </button>
        </div>
      </header>

      {/* PRIMARY VIEWPORT */}
      <main className="flex-1 px-8 pt-8 pb-40 max-w-xl mx-auto w-full">
        {currentView === AppView.HOME && (
          <VinChecker 
            onAddToHistory={handleAddToHistory}
            onNavigateChat={() => setCurrentView(AppView.ASSISTANT)}
            onNavigateEducation={() => setCurrentView(AppView.EDUCATION)}
            onInstallApp={() => {}}
            onShare={() => {}}
            isFlashMode={isFlashMode}
          />
        )}
        {currentView === AppView.ASSISTANT && <ChatAssistant />}
        {currentView === AppView.EDUCATION && <EducationCenter />}
        {currentView === AppView.TOOLS && <MediaTools />}
        {currentView === AppView.PROFILE && <ProfileView user={null} history={history} onLogin={() => {}} onRegister={() => {}} onLogout={() => {}} isFlashMode={isFlashMode} toggleFlash={() => setIsFlashMode(!isFlashMode)} />}
      </main>

      {/* MINIMALIST COMMAND NAV */}
      <nav className="fixed bottom-10 left-8 right-8 h-24 bg-white rounded-[2.5rem] flex items-center justify-around px-6 shadow-[0_30px_60px_rgba(0,0,0,0.8)] z-50 transition-all border-t border-white/20">
        {[
          { id: AppView.HOME, icon: "M13 10V3L4 14h7v7l9-11h-7z", label: "Audit" },
          { id: AppView.ASSISTANT, icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z", label: "Coach" },
          { id: AppView.EDUCATION, icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", label: "Intel" },
          { id: AppView.PROFILE, icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", label: "System" }
        ].map(btn => (
          <button 
            key={btn.id} 
            onClick={() => setCurrentView(btn.id as AppView)}
            className={`flex flex-col items-center gap-2 transition-all ${currentView === btn.id ? 'scale-110 text-obsidian' : 'text-obsidian/20 hover:text-obsidian/40'}`}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={currentView === btn.id ? 2.5 : 1} d={btn.icon} />
            </svg>
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">{btn.label}</span>
          </button>
        ))}
      </nav>

    </div>
  );
}
