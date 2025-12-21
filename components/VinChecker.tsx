import React, { useState, useRef } from 'react';
import { extractVinFromImage, lookupCountyByZip } from '../services/geminiService';

interface Props {
  onAddToHistory: (value: string, type: 'VIN' | 'ENTITY' | 'TRUCRS') => void;
  onNavigateChat: () => void;
  onNavigateEducation: () => void;
  onInstallApp: () => void;
}

const NORTH_CA_COUNTIES = [
  "ALAMEDA", "ALPINE", "AMADOR", "BUTTE", "CALAVERAS", "COLUSA", "CONTRA COSTA", "DEL NORTE", 
  "EL DORADO", "FRESNO", "GLENN", "HUMBOLDT", "KINGS", "LAKE", "LASSEN", "MADERA", "MARIN", 
  "MARIPOSA", "MENDOCINO", "MERCED", "MODOC", "MONO", "MONTEREY", "NAPA", "NEVADA", "PLACER", 
  "PLUMAS", "SACRAMENTO", "SAN BENITO", "SAN FRANCISCO", "SAN JOAQUIN", "SAN MATEO", 
  "SANTA CLARA", "SANTA CRUZ", "SHASTA", "SIERRA", "SISKIYOU", "SOLANO", "SONOMA", 
  "STANISLAUS", "SUTTER", "TEHAMA", "TRINITY", "TULARE", "TUOLUMNE", "YOLO", "YUBA"
];

const VinChecker: React.FC<Props> = ({ onAddToHistory, onNavigateChat, onNavigateEducation, onInstallApp }) => {
  const [inputVal, setInputVal] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [quickQuery, setQuickQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'VIN' | 'OWNER'>('VIN');
  const [loading, setLoading] = useState(false);
  const [countyResult, setCountyResult] = useState<string | null>(null);
  
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
      // Entity lookup uses different param on CARB VIS
      const param = mode === 'VIN' ? 'vin' : 'entity';
      window.open(`https://cleantruckcheck.arb.ca.gov/Fleet/Vehicle/VehicleComplianceStatusLookup?${param}=${cleaned}`, '_blank');
  };

  const handleQuickChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuery.trim()) return;
    sessionStorage.setItem('pending_chat_query', quickQuery);
    onNavigateChat();
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-5 animate-in fade-in duration-500 pb-10">
      
      {/* HERO: DISPATCH FINDER */}
      <div className="bg-vibrantGreen rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-navy p-6 space-y-4">
          <div className="flex justify-between items-center">
             <h3 className="font-black text-navy uppercase text-sm tracking-tighter">Dispatch Certified Tester</h3>
             <span className="text-[10px] font-black text-navy/40 uppercase tracking-widest">Same-Day Mobile</span>
          </div>
          <div className="flex gap-2">
              <input 
                type="number" 
                pattern="[0-9]*"
                value={zipCode} 
                onChange={e => setZipCode(e.target.value)} 
                placeholder="ENTER ZIP CODE" 
                className="flex-1 p-4 bg-white border-3 border-navy rounded-2xl font-black text-center outline-none focus:border-teslaRed text-lg shadow-inner"
              />
              <button onClick={handleFindTester} disabled={loading} className="px-8 btn-heavy rounded-2xl text-sm font-black bg-navy !text-white !border-navy shadow-lg">FIND</button>
          </div>
      </div>

      {/* CORE: SCAN & MANUAL INPUT */}
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-navy p-8 space-y-6">
          <button 
            onClick={() => cameraInputRef.current?.click()} 
            disabled={loading} 
            className="w-full btn-heavy py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-[0.97] transition-all shadow-lg border-navy"
          >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-base tracking-tighter font-black">{loading ? 'AI EXTRACTING...' : 'SCAN TRUCK VIN'}</span>
          </button>
          <input type="file" ref={cameraInputRef} onChange={handleScan} accept="image/*" capture="environment" className="hidden" />

          <div className="space-y-4">
              <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={inputVal} 
                    onChange={handleVinChange} 
                    placeholder={searchMode === 'VIN' ? "ENTER VIN" : "OWNER/ENTITY ID"} 
                    className="flex-1 p-4 bg-gray-50 dark:bg-gray-700 dark:text-white border-3 border-navy rounded-2xl text-center font-mono text-lg font-black outline-none focus:border-teslaRed transition-all shadow-inner uppercase" 
                  />
                  <button onClick={() => setSearchMode(searchMode === 'VIN' ? 'OWNER' : 'VIN')} className="px-4 btn-heavy rounded-2xl text-[10px] flex flex-col items-center justify-center border-navy active:bg-navy active:text-white transition-all">
                      <span className="opacity-40 font-bold uppercase">MODE</span>
                      <span className="font-black">{searchMode === 'VIN' ? 'VIN' : 'ENTITY'}</span>
                  </button>
              </div>
              
              <button 
                onClick={() => handleComplianceCheck(inputVal, searchMode)} 
                className="w-full btn-heavy py-5 rounded-2xl text-lg tracking-tighter bg-navy !text-white !border-navy dark:!bg-white dark:!text-navy shadow-xl active:scale-95 transition-all"
              >
                CHECK COMPLIANCE STATUS
              </button>
          </div>
      </div>

      {/* QUICK AI SEARCH */}
      <div className="bg-navy p-7 rounded-[2.5rem] shadow-2xl border-2 border-white/20">
          <h4 className="text-white font-black text-[10px] uppercase tracking-[0.2em] text-center mb-5 opacity-70">Regulatory Support AI</h4>
          <form onSubmit={handleQuickChatSubmit} className="relative">
              <input 
                type="text" 
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder="Ex: Why is my reg held?"
                className="w-full p-4.5 pr-14 rounded-2xl bg-white/10 border-2 border-white/30 text-white placeholder:text-white/30 text-sm font-black focus:outline-none focus:border-white transition-all shadow-inner"
              />
              <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-white text-navy p-2.5 rounded-xl font-black text-xs shadow-lg active:scale-95">
                  ASK
              </button>
          </form>
      </div>

      {/* TESTER RESULT MODAL */}
      {countyResult && (
          <div className="fixed inset-0 z-[100] bg-navy/95 backdrop-blur-md flex items-center justify-center p-6" onClick={() => setCountyResult(null)}>
              <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-10 w-full max-w-sm shadow-2xl space-y-8 text-center border-t-[14px] border-navy transition-all animate-in zoom-in" onClick={e => e.stopPropagation()}>
                  <div className="w-20 h-20 bg-navy/5 text-navy rounded-full flex items-center justify-center mx-auto shadow-inner border-2 border-navy/10">
                    <img src="/logo.svg" alt="CTC Logo" className="w-12 h-12 opacity-80" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-black text-2xl text-navy dark:text-white uppercase leading-none tracking-tighter">Tester Available!</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Dispatch Area:</p>
                    <p className="text-xl font-black text-navy dark:text-white dark:bg-gray-700 py-4 rounded-2xl border-3 border-navy uppercase tracking-tight shadow-md">{countyResult}</p>
                    {isNorCal(countyResult) && (
                        <p className="text-[10px] font-black text-navy dark:text-vibrantGreen uppercase mt-2 tracking-widest">Verified Partner</p>
                    )}
                  </div>
                  
                  <div className="space-y-4 pt-4">
                      <a href="tel:6173596953" className="block w-full py-6 btn-heavy rounded-2xl shadow-xl text-xl animate-pulse !bg-teslaRed !text-white !border-teslaRed border-4">
                          617-359-6953
                      </a>
                      <div className="flex flex-col gap-1.5">
                        <a href="mailto:dispatch@cleantruckcheck.app" className="text-xs font-black text-navy dark:text-white underline uppercase tracking-tight">dispatch@cleantruckcheck.app</a>
                      </div>
                  </div>
                  
                  <button onClick={() => setCountyResult(null)} className="text-[10px] text-gray-400 font-black uppercase tracking-widest pt-4">Dismiss</button>
              </div>
          </div>
      )}
    </div>
  );
};

export default VinChecker;