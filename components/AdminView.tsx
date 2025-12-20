import React, { useState, useRef, useEffect, useMemo } from 'react';
import { scoutTruckLead, parseRegistrationPhoto, SYSTEM_INSTRUCTION } from '../services/geminiService';
import { Lead, RegistrationData, Submission } from '../types';

type AdminTab = 'DASHBOARD' | 'DATABASE' | 'CALENDAR' | 'CAPTURE' | 'LEADS' | 'FINANCIALS' | 'SYSTEM';

const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [processing, setProcessing] = useState(false);
  const [regData, setRegData] = useState<RegistrationData | null>(null);
  const [isLive, setIsLive] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadData = () => {
      const subs = JSON.parse(localStorage.getItem('vin_diesel_submissions') || '[]');
      setSubmissions(subs);
      // Simulate leads for demo if empty
      const storedLeads = JSON.parse(localStorage.getItem('vin_diesel_leads') || '[]');
      setLeads(storedLeads);
    };
    loadData();
    if (isLive) {
      const interval = setInterval(loadData, 3000);
      return () => clearInterval(interval);
    }
  }, [isLive]);

  // Analytics Calculations
  const stats = useMemo(() => {
    const total = submissions.length;
    const vinChecks = submissions.filter(s => s.type === 'VIN_CHECK').length;
    const engineScans = submissions.filter(s => s.type === 'ENGINE_TAG').length;
    const potentialRev = total * 125;
    return { total, vinChecks, engineScans, potentialRev };
  }, [submissions]);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>, type: 'SCOUT' | 'REG') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessing(true);
    try {
      if (type === 'SCOUT') {
        const lead = await scoutTruckLead(file);
        const updated = [lead, ...leads];
        setLeads(updated);
        localStorage.setItem('vin_diesel_leads', JSON.stringify(updated));
        setActiveTab('LEADS');
      } else {
        const data = await parseRegistrationPhoto(file);
        setRegData(data);
      }
    } catch (err) {
      alert("Analysis Failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const TabButton = ({ id, label, icon }: { id: AdminTab, label: string, icon: string }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex-1 py-4 px-2 text-[10px] font-black uppercase tracking-tighter transition-all flex flex-col items-center gap-1 border-b-4 ${
        activeTab === id ? 'bg-white text-navy border-vibrantGreen' : 'bg-navy/10 text-gray-400 border-transparent hover:bg-white/50'
      }`}
    >
      <span className="text-xl">{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl border-4 border-navy overflow-hidden mb-24 min-h-[600px] flex flex-col transition-colors">
      
      {/* HEADER */}
      <div className="bg-navy p-6 flex justify-between items-center border-b-4 border-vibrantGreen">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">Tester Command</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-vibrantGreen animate-pulse' : 'bg-gray-500'}`}></span>
            <span className="text-[9px] font-black text-white/60 tracking-widest uppercase">
              {isLive ? 'Live Link: cleantruckcheckvin.app' : 'Offline Monitor'}
            </span>
          </div>
        </div>
        <button 
          onClick={() => setIsLive(!isLive)}
          className={`px-4 py-2 rounded-xl text-[10px] font-black border-2 transition-all ${
            isLive ? 'bg-vibrantGreen text-navy border-white' : 'bg-transparent text-white border-white/20'
          }`}
        >
          {isLive ? 'MONITORING ON' : 'PAUSED'}
        </button>
      </div>

      {/* NAVIGATION */}
      <nav className="flex bg-gray-50 dark:bg-gray-900 border-b-2 border-navy/10 overflow-x-auto no-scrollbar">
        <TabButton id="DASHBOARD" label="Analytics" icon="📈" />
        <TabButton id="DATABASE" label="Visitors" icon="👥" />
        <TabButton id="CALENDAR" label="Calendar" icon="📅" />
        <TabButton id="CAPTURE" label="Uploads" icon="📸" />
        <TabButton id="LEADS" label="Leads" icon="📋" />
        <TabButton id="FINANCIALS" label="Empire" icon="💰" />
        <TabButton id="SYSTEM" label="Brain" icon="🧠" />
      </nav>

      {/* CONTENT AREA */}
      <div className="flex-1 p-6 overflow-y-auto">
        
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-navy p-6 rounded-[2rem] text-white space-y-1 shadow-lg">
                <p className="text-[10px] font-black opacity-50 uppercase">Total Interactions</p>
                <p className="text-4xl font-black tracking-tighter">{stats.total}</p>
              </div>
              <div className="bg-vibrantGreen p-6 rounded-[2rem] text-navy space-y-1 shadow-lg">
                <p className="text-[10px] font-black opacity-50 uppercase">Projected Revenue</p>
                <p className="text-3xl font-black tracking-tighter">${stats.potentialRev.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-3xl border-2 border-navy/5">
              <h4 className="font-black text-navy dark:text-white uppercase text-xs mb-4">Traffic Breakdown</h4>
              <div className="space-y-4">
                {[
                  { label: "VIN Lookups", val: stats.vinChecks, total: stats.total, color: "bg-blue-500" },
                  { label: "Engine Scans", val: stats.engineScans, total: stats.total, color: "bg-orange-500" },
                  { label: "Chat Queries", val: stats.total - (stats.vinChecks + stats.engineScans), total: stats.total, color: "bg-purple-500" }
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-black uppercase">
                      <span>{item.label}</span>
                      <span>{item.val}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${(item.val / (item.total || 1)) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'DATABASE' && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-navy dark:text-white uppercase tracking-tight">Interaction Log</h3>
              <button onClick={() => alert("CSV Export Initiated")} className="btn-heavy text-[9px] px-3 py-1 rounded-lg">Export CSV</button>
            </div>
            <div className="border-4 border-navy rounded-2xl overflow-hidden shadow-inner">
              <table className="w-full text-left text-[10px]">
                <thead className="bg-navy text-white font-black uppercase tracking-widest">
                  <tr>
                    <th className="p-3">Time</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Details</th>
                    <th className="p-3 text-right">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {submissions.map((sub, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="p-3 whitespace-nowrap opacity-50 font-bold">{sub.dateStr}</td>
                      <td className="p-3 font-black text-teslaRed">{sub.type}</td>
                      <td className="p-3 font-bold truncate max-w-[120px]">{sub.summary}</td>
                      <td className="p-3 text-right font-mono text-blue-500">
                        {sub.coordinates ? '📍 TRACKED' : '---'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'CALENDAR' && (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="grid grid-cols-7 gap-1">
               {['S','M','T','W','T','F','S'].map(d => (
                 <div key={d} className="text-center text-[10px] font-black text-gray-400 py-2">{d}</div>
               ))}
               {Array.from({length: 31}).map((_, i) => (
                 <div key={i} className={`aspect-square border-2 rounded-xl flex flex-col items-center justify-center relative ${
                   [12, 15, 22].includes(i+1) ? 'border-vibrantGreen bg-vibrantGreen/10' : 'border-gray-100 dark:border-gray-700'
                 }`}>
                   <span className="text-xs font-black">{i+1}</span>
                   {[12, 15, 22].includes(i+1) && <span className="w-1.5 h-1.5 bg-vibrantGreen rounded-full mt-1"></span>}
                 </div>
               ))}
             </div>
             <div className="bg-navy p-4 rounded-2xl text-white">
               <h4 className="text-[10px] font-black uppercase mb-2">Next Scheduled Test</h4>
               <p className="text-sm font-bold">🚛 Mobile Smoke Test: Unit #402</p>
               <p className="text-[10px] opacity-70">San Jose, CA • 10:30 AM</p>
             </div>
          </div>
        )}

        {activeTab === 'CAPTURE' && (
          <div className="space-y-6 text-center py-10">
            <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto flex items-center justify-center border-4 border-navy text-4xl shadow-inner">📄</div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-navy dark:text-white uppercase">Centralized OCR</h3>
              <p className="text-xs text-gray-500 font-bold">Process Engine Tags or Registration Cards into Leads.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              <button onClick={() => fileInputRef.current?.click()} className="btn-heavy py-5 rounded-2xl flex flex-col items-center gap-1">
                <span className="text-2xl">🚛</span>
                <span className="text-[9px]">ENGINE TAG</span>
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="btn-heavy py-5 rounded-2xl flex flex-col items-center gap-1">
                <span className="text-2xl">🪪</span>
                <span className="text-[9px]">REG CARD</span>
              </button>
            </div>
            <input type="file" ref={fileInputRef} onChange={(e) => handleCapture(e, 'SCOUT')} className="hidden" accept="image/*" />
            
            {processing && <div className="animate-pulse text-teslaRed font-black uppercase text-xs">AI Processing Document...</div>}
          </div>
        )}

        {activeTab === 'LEADS' && (
          <div className="space-y-4 animate-in fade-in duration-500">
             {leads.length === 0 ? (
               <div className="text-center py-20 opacity-20">No leads captured today.</div>
             ) : (
               leads.map((lead, i) => (
                 <div key={i} className="p-4 bg-white dark:bg-gray-700 rounded-2xl border-2 border-navy/10 flex justify-between items-center shadow-sm">
                   <div>
                     <h4 className="font-black text-navy dark:text-white text-sm uppercase">{lead.companyName}</h4>
                     <p className="text-[10px] font-bold text-gray-500">{lead.phone} • {lead.location}</p>
                   </div>
                   <button onClick={() => alert("Syncing to CRM...")} className="bg-blue-500 text-white p-2 rounded-lg">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                   </button>
                 </div>
               ))
             )}
          </div>
        )}

        {activeTab === 'FINANCIALS' && (
          <div className="space-y-6">
            <h3 className="font-black text-navy dark:text-white uppercase tracking-tight">Revenue Matrix</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Today", val: "$4,250", color: "text-vibrantGreen" },
                { label: "Weekly Avg", val: "$28,900", color: "text-navy dark:text-white" },
                { label: "Unbilled", val: "$1,125", color: "text-teslaRed" },
                { label: "Growth", val: "+14%", color: "text-blue-500" }
              ].map((item, i) => (
                <div key={i} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-navy/5">
                  <p className="text-[8px] font-black uppercase text-gray-400">{item.label}</p>
                  <p className={`text-xl font-black ${item.color}`}>{item.val}</p>
                </div>
              ))}
            </div>
            <div className="bg-navy p-6 rounded-[2.5rem] text-center space-y-2">
              <h4 className="text-white font-black uppercase text-xs">2027 Projections</h4>
              <p className="text-3xl font-black text-vibrantGreen">$2.4M ARR</p>
              <p className="text-[9px] text-white/50 font-black uppercase">Based on 4x/year testing mandate</p>
            </div>
          </div>
        )}

        {activeTab === 'SYSTEM' && (
          <div className="space-y-4">
             <div className="bg-navy p-4 rounded-2xl">
               <h4 className="text-white font-black text-xs uppercase mb-2">Internal Prompt Logic</h4>
               <textarea 
                 readOnly 
                 value={SYSTEM_INSTRUCTION} 
                 className="w-full h-40 bg-black/30 text-vibrantGreen font-mono text-[9px] p-4 rounded-xl outline-none"
               />
             </div>
             <button onClick={() => alert("System Alert Broadcasted")} className="w-full btn-heavy py-4 rounded-2xl text-xs">Broadcast Compliance Update</button>
          </div>
        )}

      </div>

      {/* FOOTER */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t-2 border-navy/10 text-center">
         <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Administrator Access • Secure Environment</p>
      </div>
    </div>
  );
};

export default AdminView;