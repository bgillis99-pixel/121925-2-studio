import React, { useState, useRef, useEffect, useMemo } from 'react';
import { scoutTruckLead, parseRegistrationPhoto, SYSTEM_INSTRUCTION } from '../services/geminiService';
import { Lead, RegistrationData, Submission } from '../types';

type AdminTab = 'DASHBOARD' | 'DATABASE' | 'CAPTURE' | 'LEADS' | 'SYSTEM';

const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [processing, setProcessing] = useState(false);
  const [isLive, setIsLive] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadData = () => {
      const subs = JSON.parse(localStorage.getItem('vin_diesel_submissions') || '[]');
      setSubmissions(subs);
      const storedLeads = JSON.parse(localStorage.getItem('vin_diesel_leads') || '[]');
      setLeads(storedLeads);
    };
    loadData();
    if (isLive) {
      const interval = setInterval(loadData, 5000);
      return () => clearInterval(interval);
    }
  }, [isLive]);

  const stats = useMemo(() => {
    const total = submissions.length;
    const vinChecks = submissions.filter(s => s.type === 'VIN_CHECK').length;
    const engineScans = submissions.filter(s => s.type === 'ENGINE_TAG').length;
    const chatQueries = total - (vinChecks + engineScans);
    return { total, vinChecks, engineScans, chatQueries, potentialRev: total * 125 };
  }, [submissions]);

  const handleShareReport = async () => {
      const reportDate = new Date().toLocaleDateString();
      const reportBody = `CTC COMPLIANCE COACH - USAGE REPORT (${reportDate})\n\n` +
          `TOTAL INTERACTIONS: ${stats.total}\n` +
          `VIN CHECKS: ${stats.vinChecks}\n` +
          `ENGINE SCANS: ${stats.engineScans}\n` +
          `AI QUERIES: ${stats.chatQueries}\n\n` +
          `DETAILED LOG:\n` +
          submissions.map(s => `[${s.dateStr}] ${s.type}: ${s.summary}`).join('\n');

      if (navigator.share) {
          try {
              await navigator.share({
                  title: `Usage Report - ${reportDate}`,
                  text: reportBody
              });
          } catch (err) {
              window.open(`mailto:dispatch@cleantruckcheck.app?subject=Usage Report ${reportDate}&body=${encodeURIComponent(reportBody)}`);
          }
      } else {
          window.open(`mailto:dispatch@cleantruckcheck.app?subject=Usage Report ${reportDate}&body=${encodeURIComponent(reportBody)}`);
      }
  };

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessing(true);
    try {
        const lead = await scoutTruckLead(file);
        const updated = [lead, ...leads];
        setLeads(updated);
        localStorage.setItem('vin_diesel_leads', JSON.stringify(updated));
        setActiveTab('LEADS');
    } catch (err) {
      alert("Analysis Failed.");
    } finally {
      setProcessing(false);
      e.target.value = '';
    }
  };

  const TabButton = ({ id, label, icon }: { id: AdminTab, label: string, icon: string }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex-1 py-4 px-1 text-[9px] font-black uppercase tracking-tighter transition-all flex flex-col items-center gap-1 border-b-4 ${
        activeTab === id ? 'bg-white text-navy border-teslaRed' : 'bg-navy/5 text-gray-400 border-transparent'
      }`}
    >
      <span className="text-lg">{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl border-4 border-navy overflow-hidden mb-24 min-h-[550px] flex flex-col transition-colors">
      
      {/* COMMAND HEADER */}
      <div className="bg-navy p-5 border-b-4 border-teslaRed">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter leading-none">TESTER COMMAND</h2>
                <p className="text-[9px] font-black text-vibrantGreen uppercase tracking-widest mt-1">Local Data Recorder</p>
            </div>
            <button 
                onClick={handleShareReport}
                className="bg-white text-navy px-3 py-1.5 rounded-lg text-[9px] font-black uppercase shadow-lg active:scale-95 transition-all"
            >
                📤 Share Report
            </button>
        </div>
      </div>

      {/* DASHBOARD NAV */}
      <nav className="flex bg-gray-50 dark:bg-gray-900 border-b-2 border-navy/10">
        <TabButton id="DASHBOARD" label="Stats" icon="📊" />
        <TabButton id="DATABASE" label="History" icon="📝" />
        <TabButton id="LEADS" label="Leads" icon="🎯" />
        <TabButton id="SYSTEM" label="Config" icon="⚙️" />
      </nav>

      {/* CONTENT */}
      <div className="flex-1 p-5 overflow-y-auto bg-gray-50/30 dark:bg-gray-900/30">
        
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-navy p-4 rounded-2xl text-white">
                    <p className="text-[8px] font-black opacity-50 uppercase">Total Hits</p>
                    <p className="text-3xl font-black tracking-tighter">{stats.total}</p>
                </div>
                <div className="bg-teslaRed p-4 rounded-2xl text-white">
                    <p className="text-[8px] font-black opacity-50 uppercase">Est. Revenue</p>
                    <p className="text-2xl font-black tracking-tighter">${stats.potentialRev}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-700 p-4 rounded-2xl border-2 border-navy/10 space-y-3">
                <h4 className="text-[10px] font-black uppercase text-gray-400">Interaction Metrics</h4>
                {[
                  { label: "VIN CHECKS", val: stats.vinChecks, color: "bg-blue-500" },
                  { label: "ENGINE SCANS", val: stats.engineScans, color: "bg-orange-500" },
                  { label: "AI QUESTIONS", val: stats.chatQueries, color: "bg-purple-500" }
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-[9px] font-black uppercase">
                      <span>{item.label}</span>
                      <span>{item.val}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${(item.val / (stats.total || 1)) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="p-4 bg-vibrantGreen/10 border-2 border-vibrantGreen rounded-2xl">
                <p className="text-[10px] font-black text-navy uppercase leading-tight">
                    💡 <strong>Tester Tip:</strong> Have your team click "Share Report" at the end of their shift to send you their local interaction data.
                </p>
            </div>
          </div>
        )}

        {activeTab === 'DATABASE' && (
          <div className="space-y-3 animate-in fade-in">
            <h3 className="text-[10px] font-black text-gray-400 uppercase">Black Box Recorder</h3>
            {submissions.length === 0 ? (
                <div className="py-10 text-center opacity-20 text-xs font-black uppercase">No local logs found</div>
            ) : (
                <div className="space-y-2">
                    {submissions.map((sub, i) => (
                        <div key={i} className="p-3 bg-white dark:bg-gray-700 rounded-xl border border-navy/5 flex justify-between items-center shadow-sm">
                            <div className="min-w-0">
                                <p className="text-[8px] font-black text-gray-400 uppercase">{sub.dateStr}</p>
                                <p className="text-[10px] font-black text-navy dark:text-white truncate uppercase">{sub.summary}</p>
                            </div>
                            <span className="text-[8px] font-black bg-navy/10 dark:bg-navy/40 px-2 py-0.5 rounded text-navy dark:text-blue-300 ml-2">{sub.type}</span>
                        </div>
                    ))}
                </div>
            )}
          </div>
        )}

        {activeTab === 'LEADS' && (
          <div className="space-y-4">
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full btn-heavy py-4 rounded-xl flex items-center justify-center gap-2 text-xs"
             >
                 <span>📸</span> SCAN LEAD (DOT/PLATE)
             </button>
             <input type="file" ref={fileInputRef} onChange={handleCapture} className="hidden" accept="image/*" capture="environment" />
             
             {processing && <div className="text-center animate-pulse text-teslaRed font-black text-[10px] uppercase">AI Extracting Lead Data...</div>}
             
             <div className="space-y-2">
                 {leads.map((lead, i) => (
                    <div key={i} className="p-4 bg-white dark:bg-gray-700 rounded-2xl border-2 border-navy/10">
                        <h4 className="font-black text-navy dark:text-white text-xs uppercase">{lead.companyName}</h4>
                        <p className="text-[9px] font-bold text-gray-500 mt-1 uppercase">{lead.location} • DOT: {lead.dot}</p>
                    </div>
                 ))}
             </div>
          </div>
        )}

        {activeTab === 'SYSTEM' && (
          <div className="space-y-4">
             <div className="p-4 bg-navy rounded-xl">
                <p className="text-[9px] font-black text-white/50 uppercase mb-2">Internal Prompt Logic</p>
                <div className="h-32 overflow-y-auto text-[8px] font-mono text-vibrantGreen bg-black/20 p-2 rounded border border-white/10">
                    {SYSTEM_INSTRUCTION}
                </div>
             </div>
             <div className="p-4 border-2 border-dashed border-navy/20 rounded-xl text-center">
                 <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Cloud Connectivity</p>
                 <button disabled className="w-full py-3 rounded-lg bg-gray-100 text-[10px] font-black text-gray-400 uppercase">Connect Supabase (PRO)</button>
             </div>
          </div>
        )}

      </div>

      <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t-2 border-navy/10 text-center">
         <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Administrator: dispatch@cleantruckcheck.app</p>
      </div>
    </div>
  );
};

export default AdminView;