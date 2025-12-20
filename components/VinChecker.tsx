
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
  const [scanResult, setScanResult] = useState<{vin: string, details: string} | null>(null);
  const [countyResult, setCountyResult] = useState<string | null>(null);
  
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const isNorCal = (county: string) => {
      const clean = county.toUpperCase().replace(' COUNTY', '').trim();
      return NORTH_CA_COUNTIES.includes(clean);
  };

  const handleVinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value.toUpperCase().replace(/\s/g, '');
      // ISO 3779 (Global Standard since 1981): Prohibit O, I, Q to prevent number confusion
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
          setScanResult({ vin: result.vin, details: result.description });
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
    if (!zipCode || zipCode.length < 5) return alert("Please enter a valid 5-digit California ZIP code.");
    setLoading(true);
    try {
        const county = await lookupCountyByZip(zipCode);
        setCountyResult(county);
    } catch (err) {
        setCountyResult("Your Local Area");
    } finally {
        setLoading(false);
    }
  };

  const handleComplianceCheck = (val: string, mode: 'VIN' | 'OWNER') => {
      const cleaned = val.trim().toUpperCase();
      if (!cleaned) return;
      onAddToHistory(cleaned, mode === 'VIN' ? 'VIN' : 'ENTITY');
      window.open(`https://cleantruckcheck.arb.ca.gov/Fleet/Vehicle/VehicleComplianceStatusLookup?${mode === 'VIN' ? 'vin' : 'entity'}=${cleaned}`, '_blank');
  };

  const handleQuickChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuery.trim()) return;
    sessionStorage.setItem('pending_chat_query', quickQuery);
    onNavigateChat();
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4 animate-in fade-in duration-500">
      
      {/* 1. SCAN & MANUAL INPUT - NOW FIRST POSITION */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border-4 border-navy p-6 space-y-4">
          <button 
            onClick={() => cameraInputRef.current?.click()} 
            disabled={loading} 
            className="w-full btn-heavy py-8 rounded-2xl flex flex-col items-center gap-1 hover:bg-gray-50 active:scale-[0.98] transition-all"
          >
              <span className="text-4xl mb-1">📸</span>
              <span className="text-xl tracking-tighter font-black">{loading ? 'SCANNING...' : 'SCAN TRUCK VIN'}</span>
          </button>
          <input type="file" ref={cameraInputRef} onChange={handleScan} accept="image/*" capture="environment" className="hidden" />

          <div className="space-y-3 pt-2">
              <div className="relative">
                  <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={inputVal} 
                        onChange={handleVinChange} 
                        placeholder={searchMode === 'VIN' ? "ENTER VIN" : "TRUCRS ID"} 
                        className="flex-1 p-4 bg-gray-50 dark:bg-gray-700 dark:text-white border-2 border-navy rounded-xl text-center font-mono text-lg font-bold outline-none focus:border-teslaRed transition-all" 
                      />
                      <button onClick={() => setSearchMode(searchMode === 'VIN' ? 'OWNER' : 'VIN')} className="px-3 btn-heavy rounded-xl text-[10px] flex flex-col items-center justify-center leading-tight">
                          <span className="opacity-50">MODE</span>
                          <span className="font-black">{searchMode === 'VIN' ? 'VIN' : 'ID'}</span>
                      </button>
                  </div>
                  {searchMode === 'VIN' && (
                      <div className="flex justify-between items-start mt-2 px-1">
                          <p className="text-[9px] font-black text-teslaRed uppercase leading-tight">
                              ISO 3779 Standard (since 1981):<br/>No O, I, or Q characters allowed
                          </p>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded ${inputVal.length === 17 ? 'bg-vibrantGreen text-navy' : 'text-gray-400'}`}>
                              {inputVal.length}/17
                          </span>
                      </div>
                  )}
              </div>
              
              <button 
                onClick={() => handleComplianceCheck(inputVal, searchMode)} 
                className="w-full btn-heavy py-5 rounded-xl text-lg tracking-tighter shadow-md"
              >
                CHECK CARB STATUS
              </button>
          </div>
      </div>

      {/* 2. TESTER DISPATCH (REVENUE) - NOW SECOND POSITION */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border-4 border-navy">
          <div className="bg-navy p-2 text-center text-[10px] text-white font-black uppercase tracking-widest">Immediate Dispatch Certified Testers</div>
          <div className="p-6 space-y-4">
              <div className="flex gap-2">
                  <input 
                    type="number" 
                    pattern="[0-9]*"
                    value={zipCode} 
                    onChange={e => setZipCode(e.target.value)} 
                    placeholder="ZIP CODE" 
                    className="flex-1 p-4 bg-gray-50 dark:bg-gray-700 dark:text-white border-2 border-navy rounded-xl font-black text-center outline-none focus:border-teslaRed text-lg"
                  />
                  <button onClick={handleFindTester} disabled={loading} className="px-8 btn-heavy rounded-xl text-sm font-black shadow-lg">FIND</button>
              </div>
              <div className="flex items-center justify-center gap-4 py-1">
                  <span className="text-[9px] font-black text-gray-400 uppercase">● Mobile Testing</span>
                  <span className="text-[9px] font-black text-gray-400 uppercase">● Same Day</span>
                  <span className="text-[9px] font-black text-gray-400 uppercase">● CA Licensed</span>
              </div>
          </div>
      </div>

      {/* 3. UNIFORM AI COMPLIANCE SECTION - REFINED */}
      <div className="bg-navy p-6 rounded-3xl shadow-2xl border-2 border-white/20">
          <div className="mb-4">
              <h4 className="text-white font-black text-[11px] uppercase tracking-[0.2em] text-center border-b border-white/10 pb-2">ASK COMPLIANCE QUESTION</h4>
          </div>
          <form onSubmit={handleQuickChatSubmit} className="relative">
              <input 
                type="text" 
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder="Ex: Why is my reg being held?"
                className="w-full p-4 pr-12 rounded-2xl bg-white/10 border-2 border-white/30 text-white placeholder:text-white/40 text-sm font-bold focus:outline-none focus:border-white transition-all shadow-inner"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-navy p-2 rounded-xl font-black text-xs hover:bg-gray-100 transition-colors">
                  SEND
              </button>
          </form>
      </div>

      {/* MODAL: TESTER DISPATCH */}
      {countyResult && (
          <div className="fixed inset-0 z-[100] bg-navy/95 backdrop-blur-md flex items-center justify-center p-6 animate-in zoom-in duration-300" onClick={() => setCountyResult(null)}>
              <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-10 w-full max-sm:p-6 max-w-sm shadow-2xl space-y-8 text-center border-t-[12px] border-teslaRed" onClick={e => e.stopPropagation()}>
                  <div className="w-20 h-20 bg-teslaRed/10 text-teslaRed rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner border border-teslaRed/20">🚛</div>
                  
                  <div className="space-y-2">
                    <h3 className="font-black text-2xl text-navy dark:text-white uppercase leading-none tracking-tighter">Tester Found!</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dispatch Area:</p>
                    <p className="text-xl font-black text-navy dark:text-white dark:bg-gray-700 py-3 rounded-2xl border-2 border-navy uppercase tracking-tight">{countyResult}</p>
                    {isNorCal(countyResult) && (
                        <p className="text-[9px] font-black text-teslaRed uppercase animate-pulse">Verified NorCal CARB Mobile Partner</p>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                      <a href="tel:6173596953" className="block w-full py-6 btn-heavy rounded-[1.5rem] shadow-xl text-xl animate-pulse">
                          617-359-6953
                      </a>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none">Tap to Call Now for immediate booking.</p>
                  </div>
                  
                  <button onClick={() => setCountyResult(null)} className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] pt-4 hover:text-navy transition-colors">Close Window</button>
              </div>
          </div>
      )}
    </div>
  );
};

export default VinChecker;
