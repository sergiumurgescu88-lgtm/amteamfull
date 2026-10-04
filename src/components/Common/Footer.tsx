import React, { useState, useEffect } from 'react';
import { DomainSummary } from '../../types/trading';
import { ExternalLink, Terminal, ShieldCheck, Activity } from 'lucide-react';

interface FooterProps {
  domains: DomainSummary[];
}

export const Footer: React.FC<FooterProps> = ({ domains }) => {
  const [time, setTime] = useState<{ utc: string; local: string }>({
    utc: '',
    local: '',
  });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime({
        utc: now.toUTCString().slice(17, 25) + ' UTC',
        local: now.toLocaleTimeString('ro-RO') + ' EET',
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="mt-16 border-t border-slate-800/80 bg-slate-950/90 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Brand & info */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-200">AM TEAM TRINITY</span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                20 Bots Autonomous Network
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-md">
              Sistem unificat de control și execuție algoritmică de înaltă frecvență bazat pe geometria de aur și fluxuri instituționale.
            </p>
          </div>

          {/* Quick links to the 4 domains */}
          <div className="flex flex-wrap items-center gap-3">
            {domains.map((dom) => (
              <a
                key={dom.id}
                href={dom.url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:border-slate-700 hover:text-emerald-400"
              >
                <span>{dom.name}</span>
                <ExternalLink className="h-3 w-3 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-emerald-400" />
              </a>
            ))}
          </div>

          {/* Real-time clocks */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/40 px-2.5 py-1">
              <Activity className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-slate-300">{time.utc}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/40 px-2.5 py-1">
              <Terminal className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-slate-300">{time.local}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between border-t border-slate-900 pt-4 text-[11px] text-slate-600 sm:flex-row">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500/70" />
            <span>Strictly Algorithmic Execution • Slippage Limit 1.2 Pips • Golden Ratio Mathematical Safeguards</span>
          </div>
          <p className="mt-2 sm:mt-0">© {new Date().getFullYear()} AM Team Trinity. Toate drepturile rezervate.</p>
        </div>
      </div>
    </footer>
  );
};
