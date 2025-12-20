
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
  toggleTheme?: () => void;
}

const ProfileView: React.FC<Props> = ({ user, history, onLogin, onRegister, onLogout, onAdminAccess, isOnline = true, isDarkMode, toggleTheme }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'value'>('newest');
  
  const [notifPermission, setNotifPermission] = useState(Notification.permission);

  useEffect(() => {
    if ('Notification' in window) {
        setNotifPermission(Notification.permission);
    }
  }, []);

  const requestNotifications = async () => {
    if (!('Notification' in window)) return;
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

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border-4 border-navy">
            <h2 className="text-2xl font-black text-[#003366] dark:text-white mb-6 text-center">{isRegistering ? 'Create Account' : 'Guest Mode'}</h2>
            <p className="text-xs text-gray-500 text-center mb-6">Create an account to sync your history across devices.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border-2 border-navy rounded-xl outline-none dark:bg-gray-700 dark:text-white" placeholder="trucker@example.com" />
            </div>
            <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-1">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border-2 border-navy rounded-xl outline-none dark:bg-gray-700 dark:text-white" placeholder="••••••••" />
            </div>
            <button type="submit" className="w-full btn-heavy py-4 rounded-xl">{isRegistering ? 'SIGN UP' : 'LOG IN'}</button>
            </form>
            <div className="mt-4 text-center">
            <button onClick={() => setIsRegistering(!isRegistering)} className="text-[#003366] text-xs font-black hover:underline">{isRegistering ? 'ALREADY HAVE AN ACCOUNT? LOG IN' : 'NEED AN ACCOUNT? SIGN UP'}</button>
            </div>
        </div>

        <HistorySection filteredHistory={filteredHistory} search={search} setSearch={setSearch} sort={sort} setSort={setSort} isOnline={isOnline} />
        
        <div className="pt-6 border-t border-white/20 text-center">
            <button onClick={handlePartnerAccess} className="text-xs text-white/50 hover:text-white font-bold uppercase tracking-wider">🔒 Admin Access</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20 space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border-4 border-navy flex justify-between items-center">
        <div>
            <h2 className="text-xl font-black text-[#003366] dark:text-white truncate max-w-[200px]">{user.email}</h2>
            <div className="mt-2 inline-block bg-navy/10 text-navy text-[10px] font-black px-2 py-1 rounded-full">FLEET PRO PLAN</div>
        </div>
        <button onClick={onLogout} className="text-red-600 text-xs font-black border-2 border-red-600 px-4 py-2 rounded-xl hover:bg-red-50">SIGN OUT</button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border-4 border-navy">
        <h3 className="font-black text-[#003366] dark:text-white text-lg mb-4">Device Settings</h3>
        <div className="space-y-4">
             <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-black text-sm text-gray-700 dark:text-gray-200">Push Notifications</h4>
                    <p className="text-[10px] text-gray-500">Alerts for 2025 testing deadlines.</p>
                </div>
                {notifPermission === 'granted' ? (
                    <span className="text-green text-[10px] font-black">ACTIVE</span>
                ) : (
                    <button onClick={requestNotifications} className="bg-navy text-white text-[10px] font-black px-4 py-2 rounded-full">ENABLE</button>
                )}
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                <div>
                    <h4 className="font-black text-sm text-gray-700 dark:text-gray-200">Dark Interface</h4>
                    <p className="text-[10px] text-gray-500">Optimized for night driving.</p>
                </div>
                <button 
                    onClick={toggleTheme} 
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${isDarkMode ? 'bg-teslaRed' : 'bg-gray-300'}`}
                >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
            </div>
        </div>
      </div>

      <HistorySection filteredHistory={filteredHistory} search={search} setSearch={setSearch} sort={sort} setSort={setSort} isOnline={isOnline} />
      
      <div className="text-center">
         <button onClick={handlePartnerAccess} className="text-xs text-white/70 hover:text-white font-bold uppercase p-4 border-2 border-dashed border-white/30 rounded-2xl w-full">
            🔑 INTERNAL PARTNER LOGIN
         </button>
      </div>
    </div>
  );
};

interface HistorySectionProps {
    filteredHistory: HistoryItem[];
    search: string;
    setSearch: (v: string) => void;
    sort: string;
    setSort: (v: any) => void;
    isOnline: boolean;
}

const HistorySection: React.FC<HistorySectionProps> = ({ filteredHistory, search, setSearch, sort, setSort, isOnline }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border-4 border-navy overflow-hidden">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b-2 border-navy">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-[#003366] dark:text-white">Recent Checks</h3>
                    <span className="text-[10px] font-bold text-gray-400">{filteredHistory.length} Total</span>
                </div>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                        <input type="text" placeholder="Filter VIN..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 text-xs border-2 border-navy rounded-xl dark:bg-gray-600 dark:text-white" />
                    </div>
                    <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="p-2 text-xs border-2 border-navy rounded-xl dark:bg-gray-600 dark:text-white font-bold">
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="value">A-Z</option>
                    </select>
                </div>
            </div>
            
            <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
                {filteredHistory.length === 0 ? (
                    <div className="p-12 text-center">
                        <span className="text-4xl block mb-2">📋</span>
                        <p className="text-xs text-gray-500 font-bold">No history available yet.</p>
                    </div>
                ) : (
                    filteredHistory.map((item) => (
                        <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between items-center">
                            <div className="flex-1 min-w-0">
                                <div className="font-mono font-black text-[#003366] dark:text-white text-lg tracking-wider truncate">{item.value}</div>
                                <div className="text-[10px] text-gray-500 dark:text-gray-400 flex gap-2 items-center mt-1">
                                    <span className={`px-2 py-0.5 rounded-full font-black ${item.type === 'VIN' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{item.type}</span>
                                    <span>{new Date(item.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 ml-4">
                                {isOnline ? (
                                    <a href={`https://cleantruckcheck.arb.ca.gov/Fleet/Vehicle/VehicleComplianceStatusLookup?${item.type === 'VIN' ? 'vin' : 'entity'}=${item.value}`} target="_blank" rel="noreferrer" className="btn-heavy text-[10px] px-4 py-2 rounded-xl">CHECK</a>
                                ) : (
                                    <span className="text-gray-400 text-[10px] font-bold border border-gray-200 px-3 py-1 rounded-full">OFFLINE</span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ProfileView;
