import React, { useRef, useState, useMemo } from 'react';
import { BotData, DomainSummary, DomainId } from '../../types/trading';
import { BotCard } from './BotCard';
import { ExternalLink, Layers, Power, CheckCircle2 } from 'lucide-react';

interface DomainGroupProps {
  domain: DomainSummary;
  bots: BotData[];
  onAnalyze: (bot: BotData) => void;
  onToggleStatus: (botId: string) => void;
  onOpenSettings: (bot: BotData) => void;
  onToggleDomainAll: (domainId: DomainSummary['id']) => void;
}

/**
 * Mapare exactă a URL-urilor pentru cele 4 domenii:
 * 1. amteam.live → https://amteam.live
 * 2. amx.today → https://amx.today
 * 3. aditrade.online → https://aditrade.online
 * 4. g4trade.online → https://g4trade.online
 */
const DOMAIN_URL_MAP: Record<DomainId, string> = {
  'amteam.live': 'https://amteam.live',
  'amx.today': 'https://amx.today',
  'aditrade.online': 'https://aditrade.online',
  'g4trade.online': 'https://g4trade.online',
};

export const DomainGroup: React.FC<DomainGroupProps> = ({
  domain,
  bots,
  onAnalyze,
  onToggleStatus,
  onOpenSettings,
  onToggleDomainAll,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const allPaused = bots.every((b) => b.status === 'PAUSED');

  // 1. URL corect
  const targetUrl = DOMAIN_URL_MAP[domain.id] || `https://${domain.id}`;

  // 4. Verificare dacă utilizatorul se află deja PE domeniul respectiv
  const isCurrentDomain = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const hostname = window.location.hostname.toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);
    const accountParam = searchParams.get('account');
    return hostname.includes(domain.id) || accountParam === domain.id;
  }, [domain.id]);

  // Handler click VIEW DETAILS
  const handleViewDetailsClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // 4. Când utilizatorul este deja pe domeniul respectiv:
    // - Nu deschide tab nou
    // - Scroll smooth la secțiunea de boți pentru acel domeniu
    // - Highlight temporar cardul
    if (isCurrentDomain) {
      e.preventDefault();

      // Scroll smooth
      if (containerRef.current) {
        containerRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }

      // Highlight vizual temporar (2.5 secunde)
      setIsHighlighted(true);
      setTimeout(() => {
        setIsHighlighted(false);
      }, 2500);
    }
  };

  return (
    <div
      ref={containerRef}
      id={`domain-group-${domain.id}`}
      className={`relative rounded-2xl border transition-all duration-500 backdrop-blur-sm p-4 sm:p-5 ${
        isHighlighted
          ? 'border-cyan-400 bg-gradient-to-b from-cyan-950/40 via-slate-900/90 to-slate-950 ring-2 ring-cyan-400/80 shadow-[0_0_35px_rgba(34,211,238,0.35)] scale-[1.008]'
          : 'border-slate-800/90 bg-slate-900/40 hover:border-slate-700/80'
      }`}
    >
      {/* Banner de confirmare când este domeniul curent activat prin click */}
      {isHighlighted && (
        <div className="mb-3 flex items-center justify-between rounded-xl border border-cyan-400/60 bg-cyan-500/20 px-3 py-1.5 text-cyan-200 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 font-mono text-xs font-bold">
            <CheckCircle2 className="h-4 w-4 text-cyan-300 shrink-0" />
            <span>Sunteți conectat pe nodul de cluster: {domain.name} (Focalizare activată)</span>
          </div>
          <span className="text-2xs font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-400/30">
            LOCAL INSTANCE
          </span>
        </div>
      )}

      {/* Domain Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/90 border border-slate-700/80 text-cyan-400 shadow-inner">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-mono text-base font-extrabold text-slate-100 sm:text-lg">
                {domain.name}
              </h3>
              <span className="rounded-full border border-slate-700 bg-slate-800/70 px-2.5 py-0.5 text-2xs font-semibold text-cyan-300">
                {domain.niche}
              </span>
              {isCurrentDomain && (
                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 font-mono text-2xs font-bold text-emerald-300">
                  DOMENIU ACTIV
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
              {domain.description}
            </p>
          </div>
        </div>

        {/* Action Controls: VIEW DETAILS & Pause Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono text-xs text-slate-400">
            {domain.activeBotsCount}/5 Boți Activi
          </span>

          {/* 1, 2, 3, 4. Butonul "VIEW DETAILS" */}
          <a
            href={targetUrl}
            target={isCurrentDomain ? '_self' : '_blank'}
            rel="noreferrer"
            onClick={handleViewDetailsClick}
            className={`group flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
              isCurrentDomain
                ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 hover:border-cyan-400'
                : 'border-slate-700 bg-slate-800/80 text-slate-200 hover:border-emerald-500/50 hover:bg-emerald-500/15 hover:text-emerald-300'
            }`}
            title={
              isCurrentDomain
                ? `Sunteți deja pe ${domain.name} (click pentru derulare și evidențiere)`
                : `Deschide ${targetUrl} într-un tab nou`
            }
          >
            <span>VIEW DETAILS</span>
            <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>

          {/* Comutare starea întregului grup de 5 boți */}
          <button
            onClick={() => onToggleDomainAll(domain.id)}
            className={`flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
              allPaused
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:border-amber-500/40 hover:text-amber-300'
            }`}
          >
            <Power className="h-3.5 w-3.5" />
            <span>{allPaused ? 'PORNEȘTE GRUPUL' : 'PAUZĂ GRUP'}</span>
          </button>
        </div>
      </div>

      {/* Grid cu cei 5 boți ai domeniului */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {bots.map((bot) => (
          <BotCard
            key={bot.id}
            bot={bot}
            onAnalyze={onAnalyze}
            onToggleStatus={onToggleStatus}
            onOpenSettings={onOpenSettings}
          />
        ))}
      </div>
    </div>
  );
};
