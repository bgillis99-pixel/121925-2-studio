import React, { useState, useRef } from 'react';
import { extractVinFromImage, lookupCountyByZip } from '../services/geminiService';

interface Props {
  onAddToHistory: (value: string, type: 'VIN' | 'ENTITY' | 'TRUCRS') => void;
  onNavigateChat: () => void;
  onNavigateEducation: () => void;
  onInstallApp: () => void;
  onShare: () => void;
}

const NORTH_CA_COUNTIES = [
  "ALAMEDA", "ALPINE", "AMADOR", "BUTTE", "CALAVERAS", "COLUSA", "CONTRA COSTA", "DEL NORTE", 
  "EL DORADO", "FRESNO", "GLENN", "HUMBOLDT", "KINGS", "LAKE", "LASSEN", "MADERA", "MARIN", 
  "MARIPOSA", "MENDOCINO", "MERCED", "MODOC", "MONO", "MONTEREY", "NAPA", "NEVADA", "PLACER", 
  "PLUMAS", "SACRAMENTO", "SAN BENITO", "SAN FRANCISCO", "SAN JOAQUIN", "SAN MATEO", 
  "SANTA CLARA", "SANTA CRUZ", "SHASTA", "SIERRA", "SISKIYOU", "SOLANO", "SONOMA", 
  "STANISLAUS", "SUTTER", "TEHAMA", "TRINITY", "TULARE", "TUOLUMNE", "YOLO", "YUBA"
];

const VinChecker: React.FC<Props> = ({ onAddToHistory, onNavigateChat, onNavigateEducation, onInstallApp, onShare }) => {
  const [inputVal, setInputVal] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [quickQuery, setQuickQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'VIN' | 'OWNER'>('VIN');
  const [loading, setLoading] = useState(false);
  const [countyResult, setCountyResult] = useState<string | null>(null);
  
  // Modal State for Dispatch Details
  const [testType, setTestType] = useState<'OVI' | 'OBD' | null>(null);
  const [truckYear, setTruckYear] = useState('');
  const [desiredDate, setDesiredDate] = useState('');
  
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const isNorCal = (county: string) => {
      const clean = county.toUpperCase().replace(' COUNTY', '').trim();
      return NORTH_CA_COUNTIES.includes(clean);
  };

  const handleVinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value.toUpperCase().replace(/\s/g, '');
      val = val.replace(/[OIQ]/g, '');
      if (searchMode === 'VIN' && val.length > 17) val = val.substring(0, 17);
      setInputVal(val);
  };

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const result = await extractVinFromImage(file);
      if (result.vin) {
          setInputVal(result.vin);
          if (navigator.vibrate) navigator.vibrate(50);
      } else {
          alert('No VIN detected. Try a clearer photo.');
      }
    } catch (err) {
      alert('Scan failed.');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const handleFindTester = async () => {
    if (!zipCode || zipCode.length < 5) return alert("Enter 5-digit ZIP");
    setLoading(true);
    try {
        const county = await lookupCountyByZip(zipCode);
        setCountyResult(county);
    } catch (err) {
        setCountyResult("CALIFORNIA");
    } finally {
        setLoading(false);
    }
  };

  const handleComplianceCheck = (val: string, mode: 'VIN' | 'OWNER') => {
      const cleaned = val.trim().toUpperCase();
      if (!cleaned) return;
      onAddToHistory(cleaned, mode === 'VIN' ? 'VIN' : 'ENTITY');
      const param = mode === 'VIN' ? 'vin' : 'entity';
      window.open(`https://cleantruckcheck.arb.ca.gov/Fleet/Vehicle/VehicleComplianceStatusLookup?${param}=${cleaned}`, '_blank');
  };

  const handleQuickChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuery.trim()) return;
    sessionStorage.setItem('pending_chat_query', quickQuery);
    onNavigateChat();
  };

  const smsLink = `sms:6173596953?body=${encodeURIComponent(
    `CARB TEST REQUEST:\nType: ${testType || 'Unknown'}\nYear: ${truckYear || 'Unknown'}\nDesired Date: ${desiredDate || 'Asap'}\nZip: ${zipCode}\nVIN: ${inputVal || 'Manual'}`
  )}`;

  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* HERO: DISPATCH FINDER */}
      <div className="bg-teslaRed rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-navy p-6 space-y-4">
          <div className="flex justify-between items-center px-1">
             <h3 className="font-black text-white uppercase text-xs tracking-tight">Dispatch Mobile Tester</h3>
             <span className="text-xs font-black text-white/60 uppercase tracking-widest">Same-Day</span>
          </div>
          <div className="flex gap-2">
              <input 
                type="number" 
                pattern="[0-9]*"
                value={zipCode} 
                onChange={e => setZipCode(e.target.value)} 
                placeholder="ZIP CODE" 
                className="flex-1 p-4 bg-white border-4 border-navy rounded-2xl font-black text-center outline-none focus:ring-4 ring-white/20 text-lg shadow-inner text-navy placeholder:text-navy/30"
              />
              <button onClick={handleFindTester} disabled={loading} className="px-6 btn-heavy py-4 rounded-2xl text-xs font-black bg-white !text-navy border-4 border-navy shadow-lg active:scale-95">FIND</button>
          </div>
      </div>

      {/* CORE: SCAN & MANUAL INPUT */}
      <div className="bg-teslaRed rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-navy p-6 space-y-6">
          <button 
            onClick={() => cameraInputRef.current?.click()} 
            disabled={loading} 
            className="w-full bg-white text-navy py-5 rounded-2xl flex items-center justify-center gap-3 active:scale-[0.97] transition-all shadow-xl border-4 border-navy font-black"
          >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-lg tracking-tight uppercase">{loading ? 'SCANNING...' : 'SCAN TRUCK VIN'}</span>
          </button>
          <input type="file" ref={cameraInputRef} onChange={handleScan} accept="image/*" capture="environment" className="hidden" />

          <div className="space-y-4">
              <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={inputVal} 
                    onChange={handleVinChange} 
                    placeholder={searchMode === 'VIN' ? "ENTER VIN" : "OWNER ID"} 
                    className="flex-1 p-4 bg-white border-4 border-navy rounded-2xl text-center font-mono text-lg font-black outline-none focus:ring-4 ring-white/20 transition-all shadow-inner uppercase text-navy placeholder:text-navy/30" 
                  />
                  <button onClick={() => setSearchMode(searchMode === 'VIN' ? 'OWNER' : 'VIN')} className="px-3 bg-white border-4 border-navy rounded-2xl text-xs flex flex-col items-center justify-center active:bg-navy active:text-white transition-all text-navy font-black shadow-lg">
                      <span className="opacity-60 uppercase text-[10px]">TYPE</span>
                      <span>{searchMode === 'VIN' ? 'VIN' : 'ID'}</span>
                  </button>
              </div>
              
              <button 
                onClick={() => handleComplianceCheck(inputVal, searchMode)} 
                className="w-full bg-white text-navy py-6 rounded-2xl text-lg tracking-tight border-4 border-navy shadow-2xl active:scale-95 transition-all font-black uppercase"
              >
                CHECK COMPLIANCE STATUS
              </button>
          </div>
      </div>

      {/* QUICK AI SEARCH */}
      <div className="bg-navy p-6 rounded-[2.5rem] shadow-2xl border-4 border-white/10">
          <h4 className="text-white font-black text-xs uppercase tracking-[0.1em] text-center mb-5 opacity-80">Compliance Support AI</h4>
          <form onSubmit={handleQuickChatSubmit} className="relative">
              <input 
                type="text" 
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder="Ex: Why is my reg held?"
                className="w-full p-4.5 pr-14 rounded-2xl bg-white/10 border-2 border-white/30 text-white placeholder:text-white/40 text-sm font-black focus:outline-none focus:border-white transition-all shadow-inner"
              />
              <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-white text-navy p-2.5 rounded-xl font-black text-xs shadow-lg active:scale-95">
                  ASK
              </button>
          </form>
      </div>

      {/* TESTER RESULT MODAL */}
      {countyResult && (
          <div className="fixed inset-0 z-[100] bg-navy/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto pt-10" onClick={() => setCountyResult(null)}>
              <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-6 w-full max-w-sm shadow-2xl space-y-6 text-center border-t-[14px] border-teslaRed transition-all animate-in zoom-in" onClick={e => e.stopPropagation()}>
                  
                  {/* Rating Stars Header */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="flex gap-1 text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Top Rated Mobile Service</p>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="font-black text-2xl text-navy dark:text-white uppercase leading-none tracking-tighter">Tester Found!</h3>
                    <p className="text-sm font-black text-navy/50 uppercase tracking-widest">{countyResult} AREA</p>
                  </div>

                  {/* Pre-Dispatch Questions */}
                  <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-[2rem] border-2 border-navy/5 space-y-4">
                      <div className="space-y-2">
                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Select Test Type:</p>
                        <div className="flex gap-2">
                            {['OVI', 'OBD'].map((type) => (
                                <button 
                                    key={type} 
                                    onClick={() => setTestType(type as any)}
                                    className={`flex-1 py-4 rounded-xl font-black text-sm transition-all border-2 ${testType === type ? 'bg-navy text-white border-navy shadow-lg scale-105' : 'bg-white dark:bg-gray-700 text-navy dark:text-gray-300 border-gray-200 dark:border-gray-600'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-left">
                          <div className="space-y-1">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-tight px-1">Truck Year</label>
                            <input 
                                type="number" 
                                placeholder="YEAR" 
                                value={truckYear}
                                onChange={e => setTruckYear(e.target.value)}
                                className="w-full p-4 rounded-xl bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-sm font-black outline-none focus:border-navy"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-tight px-1">Date</label>
                            <input 
                                type="text" 
                                placeholder="ASAP" 
                                value={desiredDate}
                                onChange={e => setDesiredDate(e.target.value)}
                                className="w-full p-4 rounded-xl bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-sm font-black outline-none focus:border-navy"
                            />
                          </div>
                      </div>
                  </div>
                  
                  <div className="space-y-4">
                      <a href={smsLink} className="block w-full py-5 rounded-2xl shadow-xl text-lg bg-vibrantGreen text-navy border-4 border-navy font-black uppercase">
                          TEXT DISPATCH NOW
                      </a>
                      
                      <div className="flex items-center gap-4 py-1">
                          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                          <span className="text-xs font-black text-gray-400 uppercase">OR CALL</span>
                          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                      </div>

                      <a href="tel:6173596953" className="block w-full py-4 rounded-2xl text-lg bg-teslaRed text-white border-4 border-navy font-black shadow-lg">
                          617-359-6953
                      </a>
                      
                      {/* Secondary Action Icons */}
                      <div className="flex justify-center gap-10 pt-2">
                        <button onClick={onShare} className="flex flex-col items-center gap-2 group">
                          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-2xl border-2 border-navy/10 group-active:scale-90 transition-all shadow-md">
                             <svg className="w-6 h-6 text-navy dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                          </div>
                          <span className="text-xs font-black text-gray-500 uppercase">Share</span>
                        </button>
                        <a href="mailto:dispatch@cleantruckcheck.app" className="flex flex-col items-center gap-2 group">
                          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-2xl border-2 border-navy/10 group-active:scale-90 transition-all shadow-md">
                             <svg className="w-6 h-6 text-navy dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          </div>
                          <span className="text-xs font-black text-gray-500 uppercase">Email</span>
                        </a>
                      </div>
                  </div>
                  
                  <button onClick={() => setCountyResult(null)} className="text-xs text-gray-400 font-black uppercase tracking-widest pt-4">Dismiss</button>
              </div>
          </div>
      )}
    </div>
  );
};

export default VinChecker;