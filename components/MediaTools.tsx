import React, { useState, useRef } from 'react';
import { analyzeMedia, generateAppImage, generateSpeech, transcribeAudio } from '../services/geminiService';
import { ASPECT_RATIOS, IMAGE_SIZES } from '../constants';
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
  },
  rv: {
    label: "Motorhome",
    items: [
        "Locate Engine Label (often in closet/bedroom)",
        "Confirm GVWR is > 14,000 lbs",
        "Ensure safe access to exhaust pipe",
        "Warm up engine completely"
    ]
  }
};

const MediaTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analyze' | 'generate' | 'audio'>('analyze');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  // Analyze Tab State
  const [subTab, setSubTab] = useState<'ovi' | 'obd' | 'rv'>('ovi');
  const [contactName, setContactName] = useState('');
  const [contactInfo, setContactInfo] = useState(''); // Phone or Email

  const [analysisPrompt, setAnalysisPrompt] = useState('Check this Engine Control Label for legibility and family name.');
  
  // Generate Tab State
  const [genPrompt, setGenPrompt] = useState('A professional decal for a clean diesel fleet truck, vector style');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [size, setSize] = useState('1K');
  const [genImage, setGenImage] = useState('');

  // Audio Tab State
  const [ttsText, setTtsText] = useState('All trucks must be compliant by 2025.');

  const logSubmission = (type: string, summary: string, details: any) => {
      // Helper to log to the local "database" for the Admin view
      const submission: Submission = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          dateStr: new Date().toLocaleString(),
          type: 'ENGINE_TAG', // Generic type for media tools uploads
          summary: `${type}: ${summary} (${contactName || 'No Name'})`,
          details: { ...details, contactName, contactInfo },
          coordinates: null, // Could add geolocation here if needed
          status: 'NEW'
      };
      
      try {
        const existing = JSON.parse(localStorage.getItem('vin_diesel_submissions') || '[]');
        localStorage.setItem('vin_diesel_submissions', JSON.stringify([submission, ...existing]));
      } catch (e) {
          console.error("Failed to log submission", e);
      }
  };

  const handleAnalyze = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setResult('');
    try {
        const type = file.type.startsWith('video') ? 'video' : 'image';
        const contextPrompt = `${analysisPrompt} \n\n[USER CONTACT INFO: Name: ${contactName}, Contact: ${contactInfo} - If analysis fails, ask tester to contact user.]`;
        
        const text = await analyzeMedia(file, contextPrompt, type);
        setResult(text);
        
        // Log to Admin DB
        logSubmission('Visual Inspection', `Uploaded ${type}`, { result: text });

    } catch (err) {
        setResult("Analysis failed. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!genPrompt) return;
    setLoading(true);
    try {
        const b64 = await generateAppImage(genPrompt, { aspectRatio, size });
        setGenImage(b64);
    } catch (err) {
        alert("Image generation failed");
    } finally {
        setLoading(false);
    }
  };

  const handleTTS = async () => {
    if (!ttsText) return;
    setLoading(true);
    try {
        const b64 = await generateSpeech(ttsText);
        if (b64) alert("Audio generated successfully!");
    } catch (err) {
        alert("TTS failed");
    } finally {
        setLoading(false);
    }
  };
  
  const handleTranscribe = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if(!file) return;
      setLoading(true);
      try {
          const text = await transcribeAudio(file);
          setResult(`Transcription:\n${text}`);
      } catch (err) {
          setResult("Transcription failed");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-20 transition-colors">
      {/* Main Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button className={`flex-1 p-4 font-bold text-sm ${activeTab === 'analyze' ? 'text-[#003366] dark:text-white border-b-4 border-[#15803d]' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`} onClick={() => setActiveTab('analyze')}>Analyze</button>
        <button className={`flex-1 p-4 font-bold text-sm ${activeTab === 'generate' ? 'text-[#003366] dark:text-white border-b-4 border-[#15803d]' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`} onClick={() => setActiveTab('generate')}>Generate</button>
        <button className={`flex-1 p-4 font-bold text-sm ${activeTab === 'audio' ? 'text-[#003366] dark:text-white border-b-4 border-[#15803d]' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`} onClick={() => setActiveTab('audio')}>Audio</button>
      </div>

      <div className="p-6">
        {activeTab === 'analyze' && (
            <div className="space-y-6">
                
                {/* SUB-TABS for Test Types (Blue Text Overlay Logic) */}
                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-1">
                    {(Object.keys(CHECKLISTS) as Array<keyof typeof CHECKLISTS>).map((key) => (
                        <button
                            key={key}
                            onClick={() => setSubTab(key)}
                            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${subTab === key ? 'bg-white dark:bg-gray-600 shadow text-[#003366] dark:text-blue-300' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {CHECKLISTS[key].label}
                        </button>
                    ))}
                </div>

                {/* DYNAMIC CHECKLIST */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                    <h4 className="text-xs font-black text-[#003366] dark:text-blue-300 uppercase mb-2 flex items-center gap-1">
                        <span>📋</span> {CHECKLISTS[subTab].label} Pre-Test Checklist
                    </h4>
                    <ul className="space-y-1">
                        {CHECKLISTS[subTab].items.map((item, idx) => (
                            <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                <span className="text-green-500 font-bold">✓</span> {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="text-[#003366] dark:text-white font-bold text-lg leading-tight">Visual Inspection</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Upload photos of Engine Tags, Smoke Tests, or Trucks.</p>
                </div>

                {/* Prompt Presets - Matched to Screenshot Style */}
                <div className="flex gap-2">
                    <button onClick={() => setAnalysisPrompt("Check this Engine Control Label for legibility and family name.")} className="px-4 py-2 text-xs font-bold bg-gray-100 border border-gray-200 text-[#003366] rounded-lg hover:bg-white hover:shadow-sm transition-all">
                        Engine Tag
                    </button>
                    <button onClick={() => setAnalysisPrompt("Analyze smoke opacity from this tailpipe video.")} className="px-4 py-2 text-xs font-bold bg-gray-100 border border-gray-200 text-[#003366] rounded-lg hover:bg-white hover:shadow-sm transition-all">
                        Smoke
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-xl border-2 border-gray-100 dark:border-gray-600 p-1">
                    <textarea 
                        rows={3} 
                        value={analysisPrompt} 
                        onChange={(e) => setAnalysisPrompt(e.target.value)} 
                        className="w-full p-2 text-sm bg-transparent border-none focus:ring-0 dark:text-white resize-none"
                    />
                </div>

                {/* Contact Info Form - "Have them leave name..." */}
                <div className="space-y-3 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-600">
                    <div className="flex justify-between items-center">
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Contact Info</p>
                        <span className="text-[9px] text-gray-400">If info doesn't transmit</span>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Driver/Owner Name" 
                        value={contactName} 
                        onChange={e => setContactName(e.target.value)}
                        className="w-full p-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-500 dark:text-white"
                    />
                    <input 
                        type="text" 
                        placeholder="Phone or Email" 
                        value={contactInfo} 
                        onChange={e => setContactInfo(e.target.value)}
                        className="w-full p-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-500 dark:text-white"
                    />
                </div>

                {/* Upload Button - Matched to Screenshot (Dark Navy) */}
                <label className="block w-full p-4 bg-[#003366] text-white text-center rounded-xl cursor-pointer font-bold hover:bg-[#002244] shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2">
                    <span>📷</span> Upload Photo/Video
                    <input type="file" accept="image/*,video/*" className="hidden" onChange={handleAnalyze} />
                </label>
            </div>
        )}

        {activeTab === 'generate' && (
            <div className="space-y-4">
                <h3 className="text-[#003366] dark:text-white font-bold text-lg">Image Generation</h3>
                <textarea rows={3} value={genPrompt} onChange={(e) => setGenPrompt(e.target.value)} className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-[#003366] outline-none text-sm dark:bg-gray-700 dark:text-white" placeholder="Describe the image..." />
                <div className="flex gap-2">
                     <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="flex-1 p-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                        {ASPECT_RATIOS.map(r => <option key={r} value={r}>{r}</option>)}
                     </select>
                     <select value={size} onChange={(e) => setSize(e.target.value)} className="flex-1 p-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                        {IMAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                </div>
                <button onClick={handleGenerate} className="w-full p-4 bg-[#15803d] text-white rounded-xl font-bold hover:bg-[#166534]">✨ Generate</button>
                {genImage && <img src={genImage} alt="Generated" className="w-full rounded-xl border-2 border-[#003366]" />}
            </div>
        )}

        {activeTab === 'audio' && (
            <div className="space-y-6">
                <div>
                    <h3 className="text-[#003366] dark:text-white font-bold text-lg mb-2">Text to Speech</h3>
                    <textarea rows={2} value={ttsText} onChange={(e) => setTtsText(e.target.value)} className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-[#003366] outline-none text-sm mb-2 dark:bg-gray-700 dark:text-white" />
                    <button onClick={handleTTS} className="w-full p-3 bg-[#003366] text-white rounded-xl font-bold hover:bg-[#002244]">🔊 Speak</button>
                </div>
                <div className="border-t dark:border-gray-700 pt-4">
                    <h3 className="text-[#003366] dark:text-white font-bold text-lg mb-2">Transcribe Audio</h3>
                     <label className="block w-full p-4 bg-gray-100 dark:bg-gray-700 text-[#003366] dark:text-white text-center rounded-xl cursor-pointer font-bold border-2 border-dashed border-[#003366] dark:border-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600">
                        🎙️ Upload Audio
                        <input type="file" accept="audio/*" className="hidden" onChange={handleTranscribe} />
                    </label>
                </div>
            </div>
        )}

        {loading && <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 text-[#15803d] dark:text-green-400 text-center rounded-xl animate-pulse font-bold">Processing...</div>}
        {result && <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 text-[#003366] dark:text-white rounded-xl border border-gray-200 dark:border-gray-600 whitespace-pre-wrap text-sm">{result}</div>}
      </div>
    </div>
  );
};

export default MediaTools;