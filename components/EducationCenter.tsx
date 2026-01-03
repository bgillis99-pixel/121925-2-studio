
import React from 'react';

const EducationCenter: React.FC = () => {
  return (
    <div className="space-y-12 pb-24 animate-in slide-in-from-bottom-10 duration-700">
      
      <header className="space-y-2">
        <h2 className="font-heading text-4xl text-white tracking-tighter leading-none">THE TRUTH DESK</h2>
        <p className="text-liquidSilver text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Proactive Regulatory Briefing</p>
      </header>

      <section className="space-y-6">
        <div className="card-obsidian rounded-2xl p-8 border-l-8 border-l-teslaRed space-y-4">
            <h4 className="text-white font-heading text-lg tracking-tight uppercase">Deadlines vs Reality</h4>
            <p className="text-sm font-bold leading-relaxed text-liquidSilver/80">
                The state won't tell you that your registration hold is triggered <span className="text-white underline">90 days</span> BEFORE your expiration. If you wait for the letter, you've already lost.
            </p>
        </div>

        <div className="card-obsidian rounded-2xl p-8 border-l-8 border-l-complianceGreen space-y-4">
            <h4 className="text-white font-heading text-lg tracking-tight uppercase">The $30 Trap</h4>
            <p className="text-sm font-bold leading-relaxed text-liquidSilver/80">
                Paying the fee is NOT compliance. It is merely the right to be tested. Without a certified smoke report in the VIS portal, your DMV status remains <span className="text-teslaRed uppercase">Blocked</span>.
            </p>
        </div>

        <div className="bg-white rounded-2xl p-8 space-y-6 text-black shadow-2xl">
            <h4 className="font-heading text-xl tracking-tighter uppercase leading-none">Regulatory Decode</h4>
            <div className="space-y-4 divide-y divide-black/10">
                {[
                  { tag: "NON-COMPLIANCE", mean: "Missing Fee or missing current OBD/Smoke test." },
                  { tag: "ADVISORY", mean: "Less than 60 days to registration freeze." },
                  { tag: "INCONSISTENCY", mean: "Engine Tag Data (EFN) mismatch found by auditor." }
                ].map((item, i) => (
                  <div key={i} className="pt-4 flex justify-between items-start gap-4">
                      <span className="text-[10px] font-black bg-obsidian text-white px-2 py-1 rounded shrink-0">{item.tag}</span>
                      <p className="text-xs font-bold text-right">{item.mean}</p>
                  </div>
                ))}
            </div>
        </div>
      </section>

      <footer className="text-center">
          <p className="text-[10px] font-black text-liquidSilver/30 uppercase tracking-[0.4em]">Expert Assistance: 617-359-6953</p>
      </footer>

    </div>
  );
};

export default EducationCenter;
