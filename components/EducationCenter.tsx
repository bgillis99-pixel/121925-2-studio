
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
      <div className="bg-navy p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-green/20 rounded-full blur-3xl"></div>
        <h2 className="text-3xl font-black mb-2">Knowledge Base</h2>
        <p className="text-green-300 font-bold text-sm">The state isn't talking, but we are.</p>
      </div>

      <section className="px-1">
        <h3 className="text-navy dark:text-white font-black text-xl mb-4 flex items-center gap-2">
          <span>📅</span> Regulatory Roadmap
        </h3>
        <div className="space-y-4">
          {MILESTONES.map((m, idx) => (
            <div key={idx} className={`p-4 rounded-2xl border-2 flex gap-4 items-center ${
              m.status === 'current' 
                ? 'bg-green/5 border-green shadow-md' 
                : m.status === 'past' 
                  ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60'
                  : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 border-dashed'
            }`}>
              <div className={`w-24 text-center font-black text-xs px-2 py-1 rounded-full ${
                m.status === 'current' ? 'bg-green text-white' : 'bg-navy text-white'
              }`}>
                {m.date}
              </div>
              <div>
                <h4 className="font-bold text-navy dark:text-white text-sm">{m.title}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">{m.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-navy dark:text-white font-black text-lg mb-4">Proactive Compliance Tips</h3>
        <div className="space-y-4">
          {[
            { q: "What is GVWR?", a: "Gross Vehicle Weight Rating. If it's over 14,000 lbs and diesel, you're in the program." },
            { q: "Drive Cycle Issues?", a: "If you clear codes, you must drive ~50-100 miles for monitors to set before testing." },
            { q: "Annual Fee vs Test?", a: "The $30 fee goes to the state. The test fee goes to the tester. You need BOTH for registration." }
          ].map((tip, i) => (
            <div key={i} className="group cursor-pointer">
              <details className="outline-none">
                <summary className="list-none flex justify-between items-center font-bold text-sm text-navy dark:text-white py-2">
                  {tip.q}
                  <span className="text-green text-xl group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <p className="text-xs text-gray-600 dark:text-gray-400 pb-2 leading-relaxed">
                  {tip.a}
                </p>
              </details>
              <div className="h-px bg-gray-100 dark:bg-gray-700 w-full mt-2"></div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-br from-green to-navy p-6 rounded-3xl text-white">
        <h3 className="text-xl font-black mb-2">Tester Insights</h3>
        <p className="text-sm opacity-90 mb-4">Common mistakes our testers see daily:</p>
        <ul className="text-xs space-y-3 font-medium">
          <li className="flex gap-2"><span className="text-yellow-400">⚠️</span> **Engine Tags:** Many are missing or unreadable. Without an EFN (Engine Family Name), we cannot submit a test.</li>
          <li className="flex gap-2"><span className="text-yellow-400">⚠️</span> **Registration Matching:** Ensure your VIN on the test matches your registration card EXACTLY (no Os for 0s).</li>
          <li className="flex gap-2"><span className="text-yellow-400">⚠️</span> **Deadlines:** Tests must be submitted within 90 days BEFORE your registration expires.</li>
        </ul>
      </section>

      <div className="text-center p-4">
        <button 
          onClick={() => window.open('https://ww2.arb.ca.gov/our-work/programs/clean-truck-check', '_blank')}
          className="text-xs font-bold text-navy dark:text-blue-400 underline"
        >
          View Official State Resources
        </button>
      </div>
    </div>
  );
};

export default EducationCenter;
