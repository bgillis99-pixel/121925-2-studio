
import React, { useState, useRef } from 'react';
import { extractVinFromImage, lookupCountyByZip } from '../services/geminiService';

interface Props {
  isGuest: boolean;
  onAddToHistory: (value: string, type: 'VIN' | 'ENTITY' | 'TRUCRS') => void;
  onNavigateChat: () => void;
  onNavigateEducation: () => void;
  onNavigateProfile: () => void;
  onInstallApp: () => void;
}

const VinChecker: React.FC<Props> = ({ isGuest, onAddToHistory, onNavigateChat, onNavigateEducation, onNavigateProfile, onInstallApp }) => {
  const [inputVal, setInputVal] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [quickQuery, setQuickQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'VIN' | 'OWNER'>('VIN');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<{vin: string, details: string} | null>(null);
  const [countyResult, setCountyResult] = useState<string | null>(null);
  const [showAccountPrompt, setShowAccountPrompt] = useState(false);
  
  const cameraInputRef = useRef<HTMLInputElement>(null);

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
          alert('No VIN detected. Try a clearer photo or steady your hand.');
      }
    } catch (err) {
      alert('Scan failed. Please try again.');
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
      
      // If guest, show account prompt after a successful check
      if (isGuest) {
          setTimeout(() => setShowAccountPrompt(true), 2000);
      }
  };

  const handleQuickChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuery.trim()) return;
    sessionStorage.setItem('pending_chat_query', quickQuery);
    onNavigateChat();
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4 animate-in fade-in duration-500">
      
      {/* 1. PRIMARY: SCAN & MANUAL INPUT */}
      <div className="bg-white/95 dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border-4 border-navy p-6 space-y-4">
          <button 
            onClick={() => cameraInputRef.current?.click()} 
            disabled={loading} 
            className="w-full btn-heavy py-7 rounded-2xl flex flex-col items-center gap-1"
          >
              <span className="text-3xl">📸</span>
              <span className="text-xl tracking-tighter">{loading ? 'SCANNING...' : 'SCAN VIN / BARCODE'}</span>
          </button>
          <input type="file" ref={cameraInputRef} onChange={handleScan} accept="image/*" capture="environment" className="hidden" />

          <div className="space-y-3 pt-2">
              <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={inputVal} 
                    onChange={(e) => setInputVal(e.target.value.toUpperCase())} 
                    placeholder={searchMode === 'VIN' ? "ENTER VIN" : "ENTER TRUCRS ID"} 
                    className="flex-1 p-4 bg-gray-50 dark:bg-gray-700 dark:text-white border-2 border-navy rounded-xl text-center font-mono text-lg font-bold outline-none focus:border-teslaRed transition-all" 
                  />
                  <button onClick={() => setSearchMode(searchMode === 'VIN' ? 'OWNER' : 'VIN')} className="px-4 btn-heavy rounded-xl text-[10px]">
                      {searchMode === 'VIN' ? 'ID' : 'VIN'}
                  </button>
              </div>
              
              <button 
                onClick={() => handleComplianceCheck(inputVal, searchMode)} 
                className="w-full btn-heavy py-4 rounded-xl tracking-tighter"
              >
                CHECK CARB STATUS
              </button>
          </div>
      </div>

      {/* 2. REVENUE: FIND A TESTER */}
      <div className="bg-white/95 dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border-4 border-navy">
          <div className="bg-navy p-2 text-center text-[10px] text-white font-black uppercase tracking-widest">Find Certified Mobile Tester</div>
          <div className="p-6 space-y-4">
              <div className="flex gap-2">
                  <input 
                    type="number" 
                    pattern="[0-9]*"
                    value={zipCode} 
                    onChange={e => setZipCode(e.target.value)} 
                    placeholder="ENTER ZIP" 
                    className="flex-1 p-4 bg-gray-50 dark:bg-gray-700 dark:text-white border-2 border-navy rounded-xl font-black text-center outline-none focus:border-teslaRed"
                  />
                  <button onClick={handleFindTester} disabled={loading} className="px-6 btn-heavy rounded-xl text-xs">GO</button>
              </div>
              <p className="text-[10px] text-center text-gray-500 font-bold uppercase tracking-tight">Immediate Mobile Dispatch Statewide CA</p>
          </div>
      </div>

      {/* 3. EDUCATION: ROADMAP */}
      <div onClick={onNavigateEducation} className="bg-white/95 p-4 rounded-3xl shadow-lg flex items-center justify-between cursor-pointer border-4 border-navy active:scale-95 transition-all">
        <div className="flex items-center gap-3">
          <div className="bg-teslaRed p-2 rounded-xl text-lg animate-bounce text-white shadow-sm">📢</div>
          <div>
            <h4 className="font-black text-navy text-xs uppercase tracking-tight">Compliance Roadmap</h4>
            <p className="text-[10px] text-gray-500 font-bold">The state isn't talking, but we are.</p>
          </div>
        </div>
        <span className="text-xl text-navy">›</span>
      </div>

      {/* 4. NEW: QUICK AI CHAT SECTION */}
      <div className="bg-navy p-6 rounded-3xl shadow-2xl border-2 border-white/20">
          <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🤖</span>
              <h4 className="text-white font-black text-xs uppercase tracking-widest">Quick AI Help</h4>
          </div>
          <form onSubmit={handleQuickChatSubmit} className="relative">
              <input 
                type="text" 
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder="Ask a compliance question..."
                className="w-full p-4 pr-12 rounded-2xl bg-white/10 border-2 border-white/30 text-white placeholder:text-white/50 text-sm font-bold focus:outline-none focus:border-white transition-all"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-navy p-2 rounded-xl font-black text-xs hover:bg-gray-100">
                  GO
              </button>
          </form>
          <p className="text-[9px] text-white/50 mt-2 font-black uppercase text-center tracking-tighter">Powered by VIN DIESEL Regulatory Intelligence</p>
      </div>

      {/* MODAL: ACCOUNT PROMPT */}
      {showAccountPrompt && (
          <div className="fixed inset-0 z-[110] bg-navy/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in" onClick={() => setShowAccountPrompt(false)}>
              <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center space-y-6 border-4 border-teslaRed" onClick={e => e.stopPropagation()}>
                  <div className="text-4xl">💾</div>
                  <h3 className="font-black text-navy uppercase text-xl leading-tight">Save Your History?</h3>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-tight leading-relaxed">Create a free account to sync your VIN checks and compliance logs across all devices.</p>
                  <div className="space-y-3">
                      <button onClick={() => { setShowAccountPrompt(false); onNavigateProfile(); }} className="w-full btn-heavy py-4 rounded-xl">CREATE ACCOUNT</button>
                      <button onClick={() => setShowAccountPrompt(false)} className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Maybe Later</button>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL: TESTER DISPATCH */}
      {countyResult && (
          <div className="fixed inset-0 z-[100] bg-navy/95 backdrop-blur-md flex items-center justify-center p-6 animate-in zoom-in duration-300" onClick={() => setCountyResult(null)}>
              <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-10 w-full max-sm:p-6 max-w-sm shadow-2xl space-y-8 text-center border-t-[12px] border-teslaRed" onClick={e => e.stopPropagation()}>
                  <div className="w-20 h-20 bg-teslaRed/10 text-teslaRed rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner border border-teslaRed/20">🚛</div>
                  
                  <div className="space-y-2">
                    <h3 className="font-black text-2xl text-navy dark:text-white uppercase leading-none tracking-tighter">Tester Found!</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dispatch Area:</p>
                    <p className="text-xl font-black text-navy dark:text-white dark:bg-gray-700 py-3 rounded-2xl border-2 border-navy uppercase tracking-tight">{countyResult}</p>
                  </div>
                  
                  <div className="space-y-4">
                      <a href="tel:6173596953" className="block w-full py-6 btn-heavy rounded-[1.5rem] shadow-xl text-xl animate-pulse">
                          <span className="block text-[10px] tracking-widest opacity-70 mb-1">TAP TO CALL NOW</span>
                          617-359-6953
                      </a>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none">24/7 Priority Support • Fast Response</p>
                  </div>
                  
                  <button onClick={() => setCountyResult(null)} className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] pt-4 hover:text-navy transition-colors">Close Window</button>
              </div>
          </div>
      )}

      {/* Scan Result Modal */}
      {scanResult && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setScanResult(null)}>
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 border-4 border-navy" onClick={e => e.stopPropagation()}>
                  <h3 className="font-black text-xl text-navy dark:text-white text-center uppercase tracking-tight">VIN Detected</h3>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl font-mono text-center font-black text-lg text-navy dark:text-white border-2 border-navy shadow-inner">{scanResult.vin}</div>
                  <p className="text-xs text-gray-500 text-center uppercase font-bold">{scanResult.details}</p>
                  
                  <div className="space-y-3">
                      <button onClick={() => { handleComplianceCheck(scanResult.vin, 'VIN'); setScanResult(null); }} className="w-full py-4 btn-heavy rounded-xl">CONFIRM & CHECK STATUS</button>
                      <a href="tel:6173596953" className="block w-full py-3 bg-navy text-white text-center font-black rounded-xl text-xs border-b-4 border-black/20">CALL FOR IMMEDIATE TEST</a>
                      <button onClick={() => setScanResult(null)} className="w-full py-2 text-[10px] text-gray-400 font-bold uppercase">RE-SCAN</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default VinChecker;
