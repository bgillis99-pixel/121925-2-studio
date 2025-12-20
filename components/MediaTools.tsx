
import React, { useState, useRef } from 'react';
import { analyzeMedia, extractEngineTagInfo } from '../services/geminiService';
import { Submission } from '../types';

const CHECKLISTS = {
  ovi: {
    label: "OVI (Smoke)",
    items: [
        "Warm up engine to operating temp (>185°F)",
        "Inspect exhaust system for leaks",
        "Check oil & coolant levels",
        "Disable exhaust brake/retarder"
    ]
  },
  obd: {
    label: "OBD",
    items: [
        "Verify MIL (Check Engine Light) is working",
        "Ensure no active diagnostic codes",
        "Locate OBD port (9-pin or 16-pin)",
        "Drive cycle complete (if codes cleared recently)"
    ]
  }
};

const MediaTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scan' | 'analyze' | 'generate'>('scan');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [engineTagResult, setEngineTagResult] = useState<{familyName: string, modelYear: string} | null>(null);
  const [subTab, setSubTab] = useState<'ovi' | 'obd'>('ovi');

  const engineTagRef = useRef<HTMLInputElement>(null);

  const logSubmission = (type: string, summary: string, details: any) => {
      const submission: Submission = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          dateStr: new Date().toLocaleString(),
          type: 'ENGINE_TAG',
          summary: `${type}: ${summary}`,
          details,
          coordinates: null,
          status: 'NEW'
      };
      
      try {
        const existing = JSON.parse(localStorage.getItem('vin_diesel_submissions') || '[]');
        localStorage.setItem('vin_diesel_submissions', JSON.stringify([submission, ...existing]));
      } catch (e) {
          console.error("Failed to log submission", e);
      }
  };

  const handleEngineTagScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setLoading(true);
      setEngineTagResult(null);
      try {
          const result = await extractEngineTagInfo(file);
          setEngineTagResult(result);
          logSubmission('Engine Tag Scan', result.familyName, result);
      } catch (err) {
          alert('Engine label read failed. Ensure the family name is visible.');
      } finally {
          setLoading(false);
          e.target.value = '';
      }
  };

  const handleAnalyze = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setResult('');
    try {
        const type = file.type.startsWith('video') ? 'video' : 'image';
        const text = await analyzeMedia(file, "Analyze this diesel component for CARB compliance.", type);
        setResult(text);
        logSubmission('Visual Inspection', `Uploaded ${type}`, { result: text });
    } catch (err) {
        setResult("Analysis failed. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl border-4 border-navy overflow-hidden mb-20 transition-colors">
      {/* Tools Tabs */}
      <div className="flex border-b-4 border-navy bg-gray-50 dark:bg-gray-900">
        <button className={`flex-1 p-4 font-black text-[10px] uppercase tracking-tighter ${activeTab === 'scan' ? 'text-teslaRed border-b-4 border-teslaRed bg-white dark:bg-gray-800' : 'text-gray-400'}`} onClick={() => setActiveTab('scan')}>Engine Scan</button>
        <button className={`flex-1 p-4 font-black text-[10px] uppercase tracking-tighter ${activeTab === 'analyze' ? 'text-teslaRed border-b-4 border-teslaRed bg-white dark:bg-gray-800' : 'text-gray-400'}`} onClick={() => setActiveTab('analyze')}>Checklists</button>
        <button className={`flex-1 p-4 font-black text-[10px] uppercase tracking-tighter ${activeTab === 'generate' ? 'text-teslaRed border-b-4 border-teslaRed bg-white dark:bg-gray-800' : 'text-gray-400'}`} onClick={() => setActiveTab('generate')}>Decals</button>
      </div>

      <div className="p-6 min-h-[400px]">
        {activeTab === 'scan' && (
            <div className="space-y-6 text-center animate-in fade-in zoom-in">
                <div className="w-20 h-20 bg-navy/10 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner border-2 border-navy/20">🔖</div>
                <div>
                    <h3 className="text-xl font-black text-navy dark:text-white uppercase">Engine Family Reader</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Extract the EFN code from the valve cover label.</p>
                </div>
                
                <button 
                  onClick={() => engineTagRef.current?.click()} 
                  className="w-full btn-heavy py-5 rounded-2xl text-lg flex items-center justify-center gap-3"
                >
                    <span>📸</span> SCAN ENGINE TAG
                </button>
                <input type="file" ref={engineTagRef} onChange={handleEngineTagScan} accept="image/*" className="hidden" />

                {engineTagResult && (
                    <div className="p-6 bg-orange-50 dark:bg-orange-900/20 border-4 border-navy rounded-2xl space-y-4 animate-in slide-in-from-bottom-2">
                        <div className="text-center">
                            <p className="text-[10px] font-black text-navy uppercase">EFN Detected</p>
                            <h4 className="text-2xl font-mono font-black text-navy dark:text-white uppercase tracking-widest">{engineTagResult.familyName}</h4>
                            <p className="text-xs text-gray-500">Model Year: {engineTagResult.modelYear}</p>
                        </div>
                        <div className="space-y-2">
                             <a href={`sms:6173596953?body=I scanned EFN ${engineTagResult.familyName} and need a test.`} className="block w-full btn-heavy py-3 rounded-xl text-sm">TEXT TO DISPATCH</a>
                             <a href="tel:6173596953" className="block w-full btn-heavy py-3 rounded-xl text-sm">CALL TO BOOK</a>
                        </div>
                        <button onClick={() => setEngineTagResult(null)} className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Clear Result</button>
                    </div>
                )}
            </div>
        )}

        {activeTab === 'analyze' && (
            <div className="space-y-6">
                <div className="flex justify-between items-center bg-navy/5 dark:bg-gray-700 rounded-lg p-1 border-2 border-navy/20">
                    {(Object.keys(CHECKLISTS) as Array<keyof typeof CHECKLISTS>).map((key) => (
                        <button
                            key={key}
                            onClick={() => setSubTab(key)}
                            className={`flex-1 py-2 text-xs font-black uppercase rounded-md transition-all ${subTab === key ? 'bg-navy text-white shadow-lg' : 'text-gray-400 hover:text-navy'}`}
                        >
                            {CHECKLISTS[key].label}
                        </button>
                    ))}
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border-4 border-navy">
                    <h4 className="text-xs font-black text-navy dark:text-blue-300 uppercase mb-2 flex items-center gap-1">
                        <span>📋</span> {CHECKLISTS[subTab].label} Pre-Test Checklist
                    </h4>
                    <ul className="space-y-1">
                        {CHECKLISTS[subTab].items.map((item, idx) => (
                            <li key={idx} className="text-xs text-navy dark:text-gray-300 flex items-start gap-2 font-bold">
                                <span className="text-teslaRed font-black">✓</span> {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="space-y-3">
                    <p className="text-xs font-black text-navy dark:text-white uppercase">Visual Support</p>
                    <label className="block w-full btn-heavy p-4 rounded-xl cursor-pointer flex items-center justify-center gap-2">
                        <span>📷</span> Upload Photo/Video
                        <input type="file" accept="image/*,video/*" className="hidden" onChange={handleAnalyze} />
                    </label>
                    <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-tight">Analysis logs are reviewed by certified testers.</p>
                </div>
            </div>
        )}

        {activeTab === 'generate' && (
            <div className="space-y-4">
                <h3 className="text-navy dark:text-white font-black text-lg uppercase tracking-tight">Decal Generation</h3>
                <p className="text-xs text-gray-500 font-bold">Generate professional door decals for your fleet.</p>
                <button className="w-full btn-heavy p-4 rounded-xl opacity-50 cursor-not-allowed">✨ Generate (Pro Only)</button>
            </div>
        )}

        {loading && <div className="mt-4 p-4 bg-navy/5 text-teslaRed text-center rounded-xl animate-pulse font-black uppercase text-xs">Processing...</div>}
        {result && <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 text-navy dark:text-white rounded-xl border-2 border-navy whitespace-pre-wrap text-xs font-black uppercase">{result}</div>}
      </div>
    </div>
  );
};

export default MediaTools;
