
import React from 'react';
import { RegulatoryMilestone } from '../types';

const MILESTONES: RegulatoryMilestone[] = [
  { date: 'JAN 2024', title: 'Open Reporting', description: 'Mandatory reporting in CTC-VIS began.', status: 'past' },
  { date: 'JAN 2025', title: '2x Yearly Testing', description: 'Testing required twice per year based on DMV date.', status: 'current' },
  { date: 'JAN 2027', title: '4x Yearly Testing', description: 'Testing frequency doubles for all HD diesel vehicles.', status: 'future' },
];

const EducationCenter: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header Card */}
      <div className="bg-white/95 p-6 rounded-3xl shadow-xl border-4 border-navy relative overflow-hidden">
        <h2 className="text-3xl font-black text-navy uppercase leading-none mb-2">Knowledge Base</h2>
        <p className="text-teslaRed font-black text-xs uppercase tracking-widest">The state isn't talking, but we are.</p>
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-teslaRed/5 rounded-full blur-2xl"></div>
      </div>

      {/* Regulatory Roadmap */}
      <section className="space-y-4">
        <h3 className="text-white font-black text-xl uppercase tracking-tighter flex items-center gap-2 drop-shadow-md">
          <span>📅</span> Regulatory Roadmap
        </h3>
        <div className="space-y-3">
          {MILESTONES.map((m, idx) => (
            <div key={idx} className={`p-5 rounded-2xl border-4 flex gap-4 items-center transition-all ${
              m.status === 'current' 
                ? 'bg-white border-navy shadow-xl scale-105 z-10' 
                : 'bg-white/80 border-navy/30 opacity-80'
            }`}>
              <div className={`w-24 text-center font-black text-[10px] px-2 py-2 rounded-xl border-2 ${
                m.status === 'current' ? 'bg-teslaRed text-white border-navy' : 'bg-navy text-white border-white/20'
              }`}>
                {m.date}
              </div>
              <div className="flex-1">
                <h4 className="font-black text-navy uppercase text-sm leading-tight">{m.title}</h4>
                <p className="text-[10px] font-bold text-gray-600 mt-1 leading-snug">{m.description}</p>
              </div>
              {m.status === 'current' && <span className="text-teslaRed text-xl animate-pulse">●</span>}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="bg-white/95 p-6 rounded-3xl shadow-xl border-4 border-navy">
        <h3 className="text-navy font-black text-lg uppercase mb-4 tracking-tighter">Proactive Compliance Tips</h3>
        <div className="space-y-4">
          {[
            { q: "What is GVWR?", a: "Gross Vehicle Weight Rating. If your truck is over 14,000 lbs and diesel-powered, you are legally required to participate in the Clean Truck Check program." },
            { q: "Registration Blocked?", a: "The most common reason is a missing $30 annual compliance fee or a test result that is older than 90 days from your registration date." },
            { q: "Drive Cycle Help?", a: "If you've recently cleared codes or repaired your DPF, you must drive approximately 50-100 miles under varied conditions for the internal monitors to 'set' before a test can pass." }
          ].map((tip, i) => (
            <div key={i} className="group">
              <details className="outline-none">
                <summary className="list-none flex justify-between items-center font-black text-xs text-navy uppercase py-3 cursor-pointer">
                  {tip.q}
                  <span className="text-teslaRed text-xl group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <div className="text-[11px] font-bold text-gray-600 pb-4 leading-relaxed border-t border-gray-100 pt-2">
                  {tip.a}
                </div>
              </details>
              <div className="h-0.5 bg-gray-100 w-full"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Tester Insights Card */}
      <section className="bg-navy p-6 rounded-3xl text-white shadow-2xl border-2 border-white/20">
        <h3 className="text-xl font-black mb-3 uppercase tracking-tighter text-teslaRed">Certified Insights</h3>
        <p className="text-[11px] font-bold opacity-80 mb-4 uppercase tracking-wider">Avoid these common roadside and testing failures:</p>
        <ul className="space-y-4">
          {[
            { icon: "🏷️", title: "ENGINE TAGS", text: "Tags must be readable. Without an EFN (Engine Family Name), a legal test cannot be submitted." },
            { icon: "📝", title: "DATA MATCHING", text: "Ensure your VIN on the test matches your DMV registration EXACTLY (check for Os vs 0s)." },
            { icon: "⏰", title: "90-DAY WINDOW", text: "Tests must be performed and submitted within the 90-day window PRIOR to your registration expiration." }
          ].map((item, idx) => (
            <li key={idx} className="flex gap-3 items-start">
              <span className="text-xl bg-white/10 p-2 rounded-xl">{item.icon}</span>
              <div>
                <h5 className="font-black text-[10px] text-teslaRed uppercase">{item.title}</h5>
                <p className="text-[10px] font-bold opacity-90 leading-normal">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="text-center pt-4">
        <button 
          onClick={() => window.open('https://ww2.arb.ca.gov/our-work/programs/clean-truck-check', '_blank')}
          className="btn-heavy py-4 px-8 rounded-2xl text-[10px]"
        >
          OFFICIAL STATE RESOURCES
        </button>
        <p className="mt-4 text-[9px] text-white/50 font-black uppercase tracking-widest">Always verify with official CARB documentation.</p>
      </div>
    </div>
  );
};

export default EducationCenter;
