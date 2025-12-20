
import React, { useState } from 'react';
import { RegulatoryMilestone } from '../types';

const MILESTONES: RegulatoryMilestone[] = [
  { date: 'JAN 2024', title: 'Open Reporting', description: 'Mandatory reporting in CTC-VIS began.', status: 'past' },
  { date: 'JAN 2025', title: '2x Yearly Testing', description: 'Testing required twice per year based on DMV date.', status: 'current' },
  { date: 'JAN 2027', title: '4x Yearly Testing', description: 'Testing frequency doubles for all HD diesel vehicles.', status: 'future' },
];

const EducationCenter: React.FC = () => {
  const [showHealthCheck, setShowHealthCheck] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header Card */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border-4 border-navy relative overflow-hidden">
        <h2 className="text-3xl font-black text-navy dark:text-white uppercase leading-none mb-2">Tester's Truth</h2>
        <p className="text-teslaRed font-black text-xs uppercase tracking-widest">The state isn't proactive. We are.</p>
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-teslaRed/5 rounded-full blur-2xl"></div>
      </div>

      {/* PROACTIVE HEALTH CHECK BUTTON */}
      <div 
        onClick={() => setShowHealthCheck(true)}
        className="bg-vibrantGreen p-6 rounded-[2rem] shadow-2xl border-4 border-navy cursor-pointer active:scale-95 transition-all flex items-center justify-between"
      >
          <div className="flex items-center gap-4">
              <span className="text-3xl bg-white p-2 rounded-2xl shadow-inner">⚡</span>
              <div>
                  <h4 className="font-black text-navy text-sm uppercase leading-none mb-1">Health Check</h4>
                  <p className="text-[10px] text-navy font-bold uppercase opacity-70">Catch holds before the DMV does.</p>
              </div>
          </div>
          <span className="text-navy font-black text-2xl tracking-tighter">START</span>
      </div>

      {/* THE STATE VS REALITY SECTION */}
      <section className="bg-teslaRed p-6 rounded-3xl text-white shadow-2xl border-4 border-white/20">
        <h3 className="text-xl font-black mb-4 uppercase tracking-tighter">The State vs. Reality</h3>
        <div className="space-y-4">
            <div className="bg-white/10 p-4 rounded-2xl border border-white/20">
                <p className="text-[10px] font-black text-white/60 uppercase">The State Claims:</p>
                <p className="text-sm font-bold">"We will notify you of compliance requirements."</p>
                <hr className="my-2 border-white/10" />
                <p className="text-[10px] font-black text-vibrantGreen uppercase">The Reality (Tester Insight):</p>
                <p className="text-sm font-bold text-white">Registration holds often appear WITHOUT warning. If you wait for a letter, you're already late. Check your status 90 days before renewal.</p>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl border border-white/20">
                <p className="text-[10px] font-black text-white/60 uppercase">The State Claims:</p>
                <p className="text-sm font-bold">"Just pay the $30 fee to stay compliant."</p>
                <hr className="my-2 border-white/10" />
                <p className="text-[10px] font-black text-vibrantGreen uppercase">The Reality (Tester Insight):</p>
                <p className="text-sm font-bold text-white">The fee is just the ticket to play. Without a passing Smoke/OBD test uploaded to the VIS portal, that $30 won't clear your DMV hold.</p>
            </div>
        </div>
      </section>

      {/* CONFUSING LETTER DECODER */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border-4 border-navy">
        <h3 className="text-navy dark:text-white font-black text-lg uppercase mb-4 tracking-tighter">Decode That Letter</h3>
        <div className="space-y-3">
          {[
            { tag: "NON-COMPLIANCE NOTICE", mean: "Your truck is identified in the system but missing either the $30 fee or a current test result." },
            { tag: "DMV HOLD ADVISORY", mean: "You have less than 60 days to get a certified test result into the portal or your registration will be frozen." },
            { tag: "EFN INCONSISTENCY", mean: "Your engine family name doesn't match the one on file. Physical inspection required." }
          ].map((item, i) => (
            <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-2 border-navy/10">
                <span className="text-[9px] font-black bg-navy text-white px-2 py-0.5 rounded uppercase">{item.tag}</span>
                <p className="text-[11px] font-bold text-navy dark:text-gray-200 mt-2">{item.mean}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Regulatory Roadmap */}
      <section className="space-y-4">
        <h3 className="text-white font-black text-xl uppercase tracking-tighter flex items-center gap-2 drop-shadow-md">
          <span>📅</span> Compliance Timeline
        </h3>
        <div className="space-y-3">
          {MILESTONES.map((m, idx) => (
            <div key={idx} className={`p-5 rounded-2xl border-4 flex gap-4 items-center transition-all ${
              m.status === 'current' 
                ? 'bg-white dark:bg-gray-800 border-navy shadow-xl scale-105 z-10' 
                : 'bg-white/80 dark:bg-gray-800/80 border-navy/30 opacity-80'
            }`}>
              <div className={`w-24 text-center font-black text-[10px] px-2 py-2 rounded-xl border-2 ${
                m.status === 'current' ? 'bg-teslaRed text-white border-navy' : 'bg-navy text-white border-white/20'
              }`}>
                {m.date}
              </div>
              <div className="flex-1">
                <h4 className="font-black text-navy dark:text-white uppercase text-sm leading-tight">{m.title}</h4>
                <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400 mt-1 leading-snug">{m.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MODAL: PROACTIVE HEALTH CHECK */}
      {showHealthCheck && (
          <div className="fixed inset-0 z-[110] bg-navy/95 backdrop-blur-lg flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
              <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl space-y-6 border-t-[12px] border-vibrantGreen relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setShowHealthCheck(false)} className="absolute top-4 right-4 text-gray-400 text-2xl font-black">&times;</button>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black text-navy dark:text-white uppercase tracking-tighter">Health Check</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Answer 3 questions for instant diagnosis</p>
                  </div>
                  
                  <div className="space-y-6 pt-4">
                      {[
                          { q: "Have you paid your $30 CARB fee for 2025?", icon: "💰" },
                          { q: "Was your last smoke/OBD test within 90 days?", icon: "💨" },
                          { q: "Is your DPF light currently off?", icon: "🚨" }
                      ].map((item, i) => (
                          <div key={i} className="flex flex-col gap-2">
                              <p className="text-xs font-black text-navy dark:text-white flex items-center gap-2">
                                  <span>{item.icon}</span> {item.q}
                              </p>
                              <div className="flex gap-2">
                                  <button onClick={() => {}} className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-xs font-black hover:bg-vibrantGreen hover:text-white transition-all">YES</button>
                                  <button onClick={() => {}} className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-xs font-black hover:bg-teslaRed hover:text-white transition-all">NO</button>
                              </div>
                          </div>
                      ))}
                  </div>
                  
                  <button 
                    onClick={() => {
                        alert("Diagnosis Required: You likely have an active hold. Call 617-359-6953 to verify with a tester.");
                        setShowHealthCheck(false);
                    }}
                    className="w-full btn-heavy py-5 rounded-2xl shadow-lg mt-4 text-lg"
                  >
                      GET DIAGNOSIS
                  </button>
              </div>
          </div>
      )}

      <div className="text-center pt-4">
        <button 
          onClick={() => window.open('https://ww2.arb.ca.gov/our-work/programs/inspection-and-maintenance-program/vehicle-owner-information', '_blank')}
          className="btn-heavy py-4 px-8 rounded-2xl text-[10px]"
        >
          OFFICIAL STATE RESOURCES
        </button>
      </div>
    </div>
  );
};

export default EducationCenter;
