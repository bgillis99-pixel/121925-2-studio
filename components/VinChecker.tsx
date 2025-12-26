
import React, { useState, useRef } from 'react';
import { extractVinFromImage, lookupCountyByZip } from '../services/geminiService';

interface Props {
  onAddToHistory: (value: string, type: 'VIN' | 'ENTITY' | 'TRUCRS') => void;
  onNavigateChat: () => void;
  onNavigateEducation: () => void;
  onInstallApp: () => void;
  onShare: () => void;
  isFlashMode?: boolean;
}

const VinChecker: React.FC<Props> = ({ onAddToHistory, onNavigateChat, onNavigateEducation, onInstallApp, onShare, isFlashMode = true }) => {
  const [inputVal, setInputVal] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [searchMode, setSearchMode] = useState<'VIN' | 'OWNER'>('VIN');
  const [loading, setLoading] = useState(false);
  const [countyResult, setCountyResult] = useState<string | null>(null);
  
  const [testType, setTestType] = useState<'OVI' | 'OBD' | null>(null);
  const [truckYear, setTruckYear] = useState('');
  const [desiredDate, setDesiredDate] = useState('');
  
  const cameraInputRef = useRef<HTMLInputElement>(null);

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
          alert('No VIN detected. Please try a clearer photo.');
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

  const handleComplianceCheck = () => {
      const cleaned = inputVal.trim().toUpperCase();
      if (!cleaned) return alert("Please enter a VIN or ID first.");
      onAddToHistory(cleaned, searchMode === 'VIN' ? 'VIN' : 'ENTITY');
      const param = searchMode === 'VIN' ? 'vin' : 'entity';
      window.open(`https://cleantruckcheck.arb.ca.gov/Fleet/Vehicle/VehicleComplianceStatusLookup?${param}=${cleaned}`, '_blank');
  };

  const smsLink = `sms:6173596953?body=${encodeURIComponent(
    `CARB TEST REQUEST:\nType: ${testType || 'Pending'}\nYear: ${truckYear || 'Pending'}\nDesired Date: ${desiredDate || 'Asap'}\nZip: ${zipCode}\nVIN: ${inputVal || 'Manual'}`
  )}`;

  const sectionClass = isFlashMode 
    ? "bg-shine-red card-shine rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-navy p-8 space-y-6"
    : "bg-teslaRed rounded-[2.5rem] shadow-xl overflow-hidden border-4 border-navy p-8 space-y-6";

  return (
    <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in duration-700 pb-16">
      
      {/* SECTION 1: DISPATCH FINDER */}
      <div className={sectionClass}>
          <div className="flex justify-between items-center px-1">
             <h3 className="font-black text-white uppercase text-sm tracking-tighter">Mobile Tester Dispatch</h3>
             <span className="text-[10px] font-black text-white/70 uppercase tracking-widest bg-navy/20 px-3 py-1 rounded-lg">Same-Day</span>
          </div>
          <div className="flex gap-3">
              <input 
                type="number" 
                pattern="[0-9]*"
                value={zipCode} 
                onChange={e => setZipCode(e.target.value)} 
                placeholder="ZIP CODE" 
                className="flex-1 p-5 bg-white border-4 border-navy rounded-2xl font-black text-center outline-none focus:ring-4 ring-white/30 text-xl shadow-inner text-navy placeholder:text-navy/20"
              />
              <button onClick={handleFindTester} disabled={loading} className="px-8 btn-heavy py-5 rounded-2xl text-base font-black active:scale-95 transition-all">FIND</button>
          </div>
      </div>

      {/* SECTION 2: COMPLIANCE CHECK */}
      <div className={isFlashMode ? "bg-shine-red card-shine rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-navy p-8 space-y-8" : "bg-teslaRed rounded-[2.5rem] shadow-xl overflow-hidden border-4 border-navy p-8 space-y-8"}>
          <div className="space-y-4">
              <p className="text-white font-black text-center text-xs uppercase tracking-[0.2em] opacity-80">Auto-Scan Registration</p>
              <button 
                onClick={() => cameraInputRef.current?.click()} 
                disabled={loading} 
                className="w-full bg-white text-navy py-6 rounded-2xl flex items-center justify-center gap-4 active:scale-[0.97] transition-all shadow-2xl border-4 border-navy font-black"
              >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-xl tracking-tight uppercase">{loading ? 'READING...' : 'SCAN TRUCK VIN'}</span>
              </button>
              <input type="file" ref={cameraInputRef} onChange={handleScan} accept="image/*" capture="environment" className="hidden" />
          </div>

          <div className="space-y-6">
              <div className="space-y-3">
                  <div className="flex justify-between items-center px-2">
                    <label className="text-white font-black text-xs uppercase tracking-widest">Manual VIN Field</label>
                  </div>
                  <div className="flex gap-3">
                      <input 
                        type="text" 
                        value={inputVal} 
                        onChange={handleVinChange} 
                        placeholder={searchMode === 'VIN' ? "ENTER VIN" : "COMPANY ID"} 
                        className="flex-1 p-5 bg-white border-4 border-navy rounded-2xl text-center font-mono text-xl font-black outline-none focus:ring-4 ring-white/30 transition-all shadow-inner uppercase text-navy placeholder:text-navy/20" 
                      />
                      <button onClick={() => setSearchMode(searchMode === 'VIN' ? 'OWNER' : 'VIN')} className="px-4 bg-white border-4 border-navy rounded-2xl text-xs flex flex-col items-center justify-center active:bg-navy active:text-white transition-all text-navy font-black shadow-lg">
                          <span className="opacity-40 uppercase text-[9px]">TOGGLE</span>
                          <span className="tracking-tighter font-black">{searchMode === 'VIN' ? 'VIN' : 'ID'}</span>
                      </button>
                  </div>
              </div>
              
              <button 
                onClick={handleComplianceCheck} 
                className="w-full bg-white text-navy py-6 rounded-2xl text-2xl tracking-tighter border-4 border-navy shadow-[0_12px_40px_rgba(14,51,134,0.3)] active:scale-[0.96] transition-all font-black uppercase hover:bg-navy hover:text-white"
              >
                CHECK COMPLIANCE
              </button>
          </div>
      </div>

      {/* SECTION 3: AI COACH */}
      <div className={`p-8 rounded-[2.5rem] shadow-2xl border-4 border-white/10 relative overflow-hidden group transition-all ${isFlashMode ? 'bg-navy' : 'bg-navy dark:bg-gray-800'}`}>
          <div className={`absolute top-0 right-0 w-48 h-48 bg-electricNavy blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity ${isFlashMode ? 'animate-pulse' : ''}`}></div>
          <h4 className="text-white font-black text-sm uppercase tracking-[0.2em] text-center mb-6 relative">Regulatory Support AI</h4>
          <div className="relative">
              <input 
                type="text" 
                placeholder="Ex: Why is my reg held?"
                className="w-full p-5 pr-16 rounded-2xl bg-white/10 border-2 border-white/20 text-white placeholder:text-white/30 text-base font-black focus:outline-none focus:border-vibrantGreen transition-all shadow-inner"
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        sessionStorage.setItem('pending_chat_query', (e.target as HTMLInputElement).value);
                        onNavigateChat();
                    }
                }}
              />
              <button onClick={onNavigateChat} className="absolute right-3 top-1/2 -translate-y-1/2 bg-vibrantGreen text-white p-3 rounded-xl font-black shadow-lg active:scale-90 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
          </div>
      </div>

      {/* DISPATCH RESULT MODAL */}
      {countyResult && (
          <div className="fixed inset-0 z-[100] bg-navy/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto" onClick={() => setCountyResult(null)}>
              <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-8 w-full max-w-sm shadow-2xl space-y-8 text-center border-t-[16px] border-teslaRed transition-all animate-in zoom-in" onClick={e => e.stopPropagation()}>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="flex gap-1.5 text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-7 h-7 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      ))}
                    </div>
                    <p className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Verified Mobile Tester</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-black text-3xl text-navy dark:text-white uppercase leading-none tracking-tighter">Tester Available!</h3>
                    <p className="text-lg font-black text-navy/50 uppercase tracking-widest">{countyResult} AREA</p>
                  </div>

                  <div className="bg-iceWhite dark:bg-gray-700/50 p-8 rounded-[2.5rem] border-4 border-navy/5 space-y-6">
                      <div className="space-y-4">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Select Compliance Test:</p>
                        <div className="flex gap-4">
                            {['OVI', 'OBD'].map((type) => (
                                <button key={type} onClick={() => setTestType(type as any)} className={`flex-1 py-6 rounded-2xl font-black text-base transition-all border-4 ${testType === type ? 'bg-navy text-white border-navy shadow-xl scale-105' : 'bg-white text-navy border-gray-200'}`}>{type}</button>
                            ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-left">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-tight px-1">Truck Year</label>
                            <input type="number" placeholder="YYYY" value={truckYear} onChange={e => setTruckYear(e.target.value)} className="w-full p-4 rounded-xl bg-white border-2 border-gray-200 text-lg font-black outline-none focus:border-navy" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-tight px-1">Preferred Date</label>
                            <input type="text" placeholder="ASAP" value={desiredDate} onChange={e => setDesiredDate(e.target.value)} className="w-full p-4 rounded-xl bg-white border-2 border-gray-200 text-lg font-black outline-none focus:border-navy" />
                          </div>
                      </div>
                  </div>
                  
                  <div className="space-y-4">
                      <a href={smsLink} className="block w-full py-6 rounded-2xl shadow-[0_15px_40px_rgba(34,197,94,0.4)] text-2xl bg-vibrantGreen text-white border-4 border-navy font-black uppercase active:scale-[0.98] transition-all">TEXT DISPATCH</a>
                      <a href="tel:6173596953" className="block w-full py-5 rounded-2xl text-xl bg-teslaRed text-white border-4 border-navy font-black shadow-xl uppercase active:scale-[0.98] transition-all">CALL: 617-359-6953</a>
                  </div>
                  <button onClick={() => setCountyResult(null)} className="text-sm text-gray-400 font-black uppercase tracking-widest pt-4 hover:text-navy transition-colors">Dismiss</button>
              </div>
          </div>
      )}
    </div>
  );
};

export default VinChecker;
