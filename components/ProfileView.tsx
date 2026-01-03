
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

const ProfileView: React.FC<Props> = ({ 
  user, 
  history, 
  onLogin, 
  onRegister, 
  onLogout, 
  onAdminAccess, 
  isOnline = true, 
  isDarkMode, 
  isFlashMode, 
  toggleTheme, 
  toggleFlash 
}) => {
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
    if (!email) return;
    if (isRegistering) onRegister(email);
    else onLogin(email);
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
        </div>

        <SettingsCard />
        <HistorySection filteredHistory={filteredHistory} search={search} setSearch={setSearch} sort={sort} setSort={setSort} isOnline={isOnline} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20 space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border-4 border-navy flex justify-between items-center transition-colors">
        <div>
            <h2 className="text-xl font-black text-navy dark:text-white truncate max-w-[200px] uppercase tracking-tighter">{user.email}</h2>
            <div className="mt-2 inline-block bg-navy/10 dark:bg-navy/40 text-navy dark:text-blue-300 text-[10px] font-black px-3 py-1 rounded-full border border-navy/20">FLEET PRO</div>
        </div>
        <button onClick={onLogout} className="text-teslaRed dark:text-red-400 text-xs font-black border-2 border-teslaRed dark:border-red-400 px-4 py-2 rounded-xl uppercase">LOGOUT</button>
      </div>

      <SettingsCard />
      <HistorySection filteredHistory={filteredHistory} search={search} setSearch={setSearch} sort={sort} setSort={setSort} isOnline={isOnline} />
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
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border-4 border-navy overflow-hidden transition-colors">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b-2 border-navy">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-navy dark:text-white uppercase tracking-tighter">Recent Checks</h3>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{filteredHistory.length} Total</span>
                </div>
                <div className="flex gap-2">
                    <input type="text" placeholder="FILTER..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 px-3 py-2 text-xs border-2 border-navy rounded-xl dark:bg-gray-600 dark:text-white font-bold" />
                    <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="p-2 text-xs border-2 border-navy rounded-xl dark:bg-gray-600 dark:text-white font-black uppercase tracking-tighter">
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                    </select>
                </div>
            </div>
            
            <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
                {filteredHistory.length === 0 ? (
                    <div className="p-12 text-center opacity-20 text-xs font-black uppercase">No history</div>
                ) : (
                    filteredHistory.map((item) => (
                        <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between items-center transition-colors">
                            <div className="flex-1 min-w-0">
                                <div className="font-mono font-black text-navy dark:text-white text-lg tracking-wider truncate">{item.value}</div>
                                <div className="text-[10px] text-gray-500 flex gap-2 items-center mt-1">
                                    <span className="font-black uppercase tracking-tighter bg-navy/10 dark:bg-navy/40 px-2 py-0.5 rounded">{item.type}</span>
                                    <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                                </div>
                            </div>
                            {isOnline && (
                                <a href={`https://cleantruckcheck.arb.ca.gov/Fleet/Vehicle/VehicleComplianceStatusLookup?${item.type === 'VIN' ? 'vin' : 'entity'}=${item.value}`} target="_blank" rel="noreferrer" className="btn-heavy text-[9px] px-4 py-2 rounded-xl border-2">LOOKUP</a>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ProfileView;
