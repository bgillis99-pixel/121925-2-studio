
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

const VinChecker: React.FC<Props> = ({ onAddToHistory, onNavigateChat, onNavigateEducation }) => {
  const [inputVal, setInputVal] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [countyResult, setCountyResult] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleVinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value.toUpperCase().replace(/\s/g, '').replace(/[OIQ]/g, '');
      if (val.length > 17) val = val.substring(0, 17);
      setInputVal(val);
  };

  const handleFindTester = async () => {
    if (!zipCode || zipCode.length < 5) return;
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

  return (
    <div className="w-full max-w-lg mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* AUTHORITATIVE HERO PANEL */}
      <section className="card-obsidian rounded-[2.5rem] p-10 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-liquidSilver/30 to-transparent"></div>
          
          <div className="relative z-10 space-y-8">
              <header className="space-y-1">
                  <h2 className="font-heading text-4xl text-white tracking-tighter leading-none">REGISTRATION CLEARANCE</h2>
                  <p className="text-liquidSilver text-[11px] font-black uppercase tracking-[0.4em] opacity-50">Identity Verification Protocol</p>
              </header>

              <div className="space-y-6">
                  <div className="space-y-3">
                      <div className="flex justify-between items-end px-1">
                        <label className="text-[10px] font-black text-white uppercase tracking-widest">ASSET VIN (17 CHARACTERS)</label>
                        <div className="flex items-center gap-2">
                            <span className={`text-[11px] font-black font-mono transition-all px-2 py-0.5 rounded ${inputVal.length === 17 ? 'bg-complianceGreen text-white shadow-[0_0_10px_rgba(0,200,83,0.5)]' : 'bg-white/10 text-liquidSilver/40'}`}>
                                {inputVal.length} / 17
                            </span>
                        </div>
                      </div>
                      <input 
                        type="text" 
                        value={inputVal} 
                        onChange={handleVinChange}
                        placeholder="VIN IDENTIFIER"
                        className="w-full p-7 input-stark text-3xl font-heading tracking-widest placeholder:opacity-10 uppercase shadow-[0_10px_30px_rgba(255,255,255,0.05)]"
                      />
                  </div>
                  
                  <button 
                    onClick={() => {
                        const cleaned = inputVal.trim();
                        if (cleaned) {
                            onAddToHistory(cleaned, 'VIN');
                            window.open(`https://cleantruckcheck.arb.ca.gov/Fleet/Vehicle/VehicleComplianceStatusLookup?vin=${cleaned}`, '_blank');
                        }
                    }}
                    className="w-full py-7 btn-metal text-2xl rounded-2xl active:scale-95 transition-all"
                  >
                      EXECUTE AUDIT
                  </button>
              </div>
          </div>
      </section>

      {/* DISPATCH MODULE */}
      <section className="bg-white/5 rounded-[2rem] p-8 border border-white/5 space-y-6">
          <h3 className="font-heading text-sm text-liquidSilver uppercase tracking-[0.3em] text-center opacity-60">Mobile Unit Dispatch</h3>
          <div className="flex gap-3">
              <input 
                type="number" 
                value={zipCode}
                onChange={e => setZipCode(e.target.value)}
                placeholder="ZIP"
                className="w-28 p-6 input-stark text-center text-2xl font-black"
              />
              <button 
                onClick={handleFindTester}
                className="flex-1 btn-metal rounded-2xl text-xl"
              >
                LOCATE UNIT
              </button>
          </div>
      </section>

      {/* OPTICAL CAPTURE */}
      <section className="flex flex-col items-center gap-4 py-4">
          <button 
            onClick={() => cameraInputRef.current?.click()}
            className="w-24 h-24 rounded-full bg-obsidian border-4 border-liquidSilver/20 flex items-center justify-center hover:border-liquidSilver hover:scale-110 transition-all active:scale-90 shadow-2xl"
          >
              <svg className="w-10 h-10 text-liquidSilver" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
          </button>
          <p className="text-liquidSilver text-[10px] font-black uppercase tracking-[0.5em] opacity-30">Scan Registration</p>
          <input type="file" ref={cameraInputRef} onChange={() => {}} accept="image/*" capture="environment" className="hidden" />
      </section>

      {/* DISPATCH OVERLAY */}
      {countyResult && (
          <div className="fixed inset-0 z-50 bg-obsidian/98 backdrop-blur-2xl flex items-center justify-center p-6 animate-in zoom-in duration-300">
              <div className="bg-white w-full max-w-sm rounded-[3rem] p-12 space-y-10 text-black shadow-[0_0_100px_rgba(255,255,255,0.1)] border-t-[12px] border-black">
                  <header className="text-center space-y-2">
                      <p className="text-[12px] font-black uppercase tracking-[0.3em] text-black/40">Tester Identified</p>
                      <h3 className="text-5xl font-heading uppercase tracking-tighter leading-none">{countyResult}</h3>
                  </header>
                  <div className="space-y-4">
                      <a href="tel:6173596953" className="block w-full py-7 bg-obsidian text-white rounded-3xl text-center font-heading text-2xl tracking-widest shadow-2xl active:scale-95 transition-all">CALL NOW</a>
                      <button onClick={() => setCountyResult(null)} className="block w-full py-4 text-[10px] font-black uppercase tracking-[0.5em] text-black/20">Return</button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default VinChecker;
