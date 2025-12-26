
import React, { useState, useMemo, useEffect } from 'react';
import { User, HistoryItem } from '../types';

interface Props {
  user: User | null;
  history: HistoryItem[];
  onLogin: (email: string) => void;
  onRegister: (email: string) => void;
  onLogout: () => void;
  onAdminAccess?: () => void;
  isOnline?: boolean;
  isDarkMode?: boolean;
  isFlashMode?: boolean;
  toggleTheme?: () => void;
  toggleFlash?: () => void;
}

const ProfileView: React.FC<Props> = ({ user, history, onLogin, onRegister, onLogout, onAdminAccess, isOnline = true, isDarkMode, isFlashMode, toggleTheme, toggleFlash }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'value'>('newest');
  
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
        setNotifPermission(Notification.permission);
    }
  }, []);

  const requestNotifications = async () => {
    if (typeof Notification === 'undefined') return;
    const permission = await Notification.requestPermission();
    setNotifPermission(permission);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (isRegistering) onRegister(email);
    else onLogin(email);
  };

  const handlePartnerAccess = () => {
      const code = prompt("Enter Partner Access Code:");
      if (code === '1225') onAdminAccess?.();
      else if (code) alert("Access Denied");
  };

  const filteredHistory = useMemo(() => {
    let items = [...history];
    if (search) items = items.filter(i => i.value.includes(search.toUpperCase()));
    items.sort((a, b) => {
      if (sort === 'newest') return b.timestamp - a.timestamp;
      if (sort === 'oldest') return a.timestamp - b.timestamp;
      if (sort === 'value') return a.value.localeCompare(b.value);
      return 0;
    });
    return items;
  }, [history, search, sort]);

  const SettingsCard = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border-4 border-navy transition-colors">
        <h3 className="font-black text-navy dark:text-white text-lg mb-4 uppercase tracking-tighter">App Personalization</h3>
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-black text-sm text-gray-700 dark:text-gray-200 uppercase leading-none">Flash UI Mode</h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">High-shine Tesla aesthetics</p>
                </div>
                <button 
                    onClick={toggleFlash} 
                    className={`w-14 h-7 rounded-full p-1 transition-all duration-300 ease-in-out border-2 border-navy flex items-center ${isFlashMode ? 'bg-vibrantGreen' : 'bg-gray-200'}`}
                >
                    <div className={`bg-white w-5 h-5 rounded-full shadow-lg transform transition-transform duration-300 ease-in-out ${isFlashMode ? 'translate-x-7' : 'translate-x-0'} flex items-center justify-center text-[10px]`}>
                        {isFlashMode ? '✨' : '➖'}
                    </div>
                </button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                <div>
                    <h4 className="font-black text-sm text-gray-700 dark:text-gray-200 uppercase leading-none">Dark Theme</h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Easier on the eyes at night</p>
                </div>
                <button 
                    onClick={toggleTheme} 
                    className={`w-14 h-7 rounded-full p-1 transition-all duration-300 ease-in-out border-2 border-navy flex items-center ${isDarkMode ? 'bg-teslaRed' : 'bg-gray-200'}`}
                >
                    <div className={`bg-white w-5 h-5 rounded-full shadow-lg transform transition-transform duration-300 ease-in-out ${isDarkMode ? 'translate-x-7' : 'translate-x-0'} flex items-center justify-center text-[10px]`}>
                        {isDarkMode ? '🌙' : '☀️'}
                    </div>
                </button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                <div>
                    <h4 className="font-black text-sm text-gray-700 dark:text-gray-200 uppercase leading-none">Notifications</h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Deadline & status alerts</p>
                </div>
                {notifPermission === 'granted' ? (
                    <span className="text-vibrantGreen text-[10px] font-black bg-vibrantGreen/10 px-2 py-1 rounded">ACTIVE</span>
                ) : (
                    <button onClick={requestNotifications} className="btn-heavy text-[10px] px-4 py-2 rounded-full border-2">ENABLE</button>
                )}
            </div>
        </div>
    </div>
  );

  if (!user) {
    return (
      <div className="space-y-6 pb-20">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border-4 border-navy transition-colors">
            <h2 className="text-2xl font-black text-navy dark:text-white mb-6 text-center uppercase tracking-tighter">{isRegistering ? 'Create Account' : 'Guest Mode'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Fleet Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 border-2 border-navy rounded-xl outline-none dark:bg-gray-700 dark:text-white font-bold" placeholder="trucker@example.com" />
                </div>
                <button type="submit" className="w-full btn-heavy py-5 rounded-xl text-lg tracking-tighter">
                    {isRegistering ? 'INITIALIZE ACCOUNT' : 'CONTINUE AS GUEST'}
                </button>
            </form>
            <div className="mt-4 text-center">
                <button onClick={() => setIsRegistering(!isRegistering)} className="text-navy dark:text-blue-400 text-[10px] font-black hover:underline uppercase tracking-widest">
                    {isRegistering ? 'LOGIN' : 'REGISTER FLEET'}
                </button>
            </div>
