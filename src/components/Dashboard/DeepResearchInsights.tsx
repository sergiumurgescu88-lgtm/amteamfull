import React, { useState, useEffect, useRef } from 'react';
import { DomainSummary, DomainId } from '../../types/trading';
import {
  BookOpen,
  TrendingUp,
  Flame,
  Bitcoin,
  BarChart3,
  CheckCircle2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';

interface DeepResearchInsightsProps {
  domains: DomainSummary[];
}

interface DomainResearchConfig {
  id: DomainId;
  title: string;
  assets: string[];
  profile: string;
  botStrategies: { name: string; rule: string; isGolden?: boolean }[];
  colorTheme: {
    badge: string;
    border: string;
    headerBg: string;
    accentText: string;
    cardBg: string;
    glow: string;
  };
}

/**
 * Specificații exacte conform cerințelor utilizatorului:
 * 1. amteam.live (Forex Majors)
 * 2. amx.today (Metals & Volatility)
 * 3. aditrade.online (Crypto & Exotic)
 * 4. g4trade.online (Commodities & Macro)
 */
const DEEP_RESEARCH_SPECS: Record<DomainId, DomainResearchConfig> = {
  'amteam.live': {
    id: 'amteam.live',
    title: 'The Forex Majors Specialist',
    assets: ['EURUSD', 'GBPUSD', 'USDCHF'],
    profile: 'Lichiditate uriașă, spread-uri 0.1-0.5 pips, mișcări tehnice curate',
    botStrategies: [
      { name: 'Alpha-Majors', rule: 'ADX(14) pe M15, EMA(21/50), Pin Bar confirmation' },
      { name: 'Beta-Majors', rule: 'Asian Range breakout la 10:00-11:00 GMT' },
      { name: 'SERGIU-Majors', rule: 'Fibonacci 0.618 cu confirmare M15', isGolden: true },
      { name: 'Delta-Majors', rule: 'Bollinger Bands + RSI range scalping' },
      { name: 'Epsilon-Majors', rule: 'Turtle Soup liquidity hunting' },
    ],
    colorTheme: {
      badge: 'border-blue-500/40 bg-blue-500/15 text-blue-300',
      border: 'border-blue-500/30 hover:border-blue-500/60',
      headerBg: 'from-blue-500/15 via-slate-900 to-slate-950',
      accentText: 'text-blue-400',
      cardBg: 'from-slate-900 via-slate-900/90 to-slate-950',
      glow: 'shadow-blue-500/10',
    },
  },
  'amx.today': {
    id: 'amx.today',
    title: 'The Volatility & Metals Specialist',
    assets: ['XAUUSD', 'US30', 'NAS100'],
    profile: 'Volatilitate extremă, wicks lungi, mișcări dictate de macro',
    botStrategies: [
      { name: 'Alpha-Metals', rule: 'ADX pe H1 (nu M15), SL 2.5x ATR' },
      { name: 'Beta-Metals', rule: 'NY Open breakout la 16:30, Whale Intensity > 2.0' },
      { name: 'SERGIU-Metals', rule: 'Deep Golden Zone 0.618-0.65 pe M30', isGolden: true },
      { name: 'Delta-Metals', rule: 'XAGUSD Asian session scalping' },
      { name: 'Epsilon-Metals', rule: 'News sweep mean reversion' },
    ],
    colorTheme: {
      badge: 'border-amber-500/40 bg-amber-500/15 text-amber-300',
      border: 'border-amber-500/30 hover:border-amber-500/60',
      headerBg: 'from-amber-500/15 via-slate-900 to-slate-950',
      accentText: 'text-amber-400',
      cardBg: 'from-slate-900 via-slate-900/90 to-slate-950',
      glow: 'shadow-amber-500/10',
    },
  },
  'aditrade.online': {
    id: 'aditrade.online',
    title: 'The Crypto & Exotic Crosses',
    assets: ['BTCUSD', 'ETHUSD', 'GBPJPY'],
    profile: "Crypto 24/7 haotic, GBPJPY 'The Beast' extrem de volatil",
    botStrategies: [
      { name: 'Alpha-Crypto', rule: 'ADX > 20, EMA(50) pe H1' },
      { name: 'Beta-Crypto', rule: 'Volume absorption la rezistență' },
      { name: 'SERGIU-Crypto', rule: 'Equilibrium 0.500, SL în afara 0.786', isGolden: true },
      { name: 'Delta-Crypto', rule: 'Night shift scalping 22:00-04:00 GMT' },
      { name: 'Epsilon-Crypto', rule: 'Long/Short squeeze hunting' },
    ],
    colorTheme: {
      badge: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
      border: 'border-emerald-500/30 hover:border-emerald-500/60',
      headerBg: 'from-emerald-500/15 via-slate-900 to-slate-950',
      accentText: 'text-emerald-400',
      cardBg: 'from-slate-900 via-slate-900/90 to-slate-950',
      glow: 'shadow-emerald-500/10',
    },
  },
  'g4trade.online': {
    id: 'g4trade.online',
    title: 'The Commodities & Macro Specialist',
    assets: ['OIL', 'XAGUSD', 'EURJPY', 'AUDCAD'],
    profile: 'Mărfuri dictate de geopolitică, cross-uri cu tendințe lungi',
    botStrategies: [
      { name: 'Alpha-Commodities', rule: 'OIL H4 trend following' },
      { name: 'Beta-Commodities', rule: 'XAGUSD breakout cu trailing stop' },
      { name: 'SERGIU-Macro', rule: 'Fibonacci 0.618 + psychological levels', isGolden: true },
      { name: 'Delta-Commodities', rule: 'AUDCAD mean reversion' },
      { name: 'Epsilon-Commodities', rule: 'EIA report sniper (miercuri 17:30)' },
    ],
    colorTheme: {
      badge: 'border-purple-500/40 bg-purple-500/15 text-purple-300',
      border: 'border-purple-500/30 hover:border-purple-500/60',
      headerBg: 'from-purple-500/15 via-slate-900 to-slate-950',
      accentText: 'text-purple-400',
      cardBg: 'from-slate-900 via-slate-900/90 to-slate-950',
      glow: 'shadow-purple-500/10',
    },
  },
};

const DeepResearchInsightsComponent: React.FC<DeepResearchInsightsProps> = ({ domains }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // 3. Lazy loading cu Intersection Observer: încarcă doar când devine vizibil
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px', threshold: 0.05 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Stare expand/collapse pentru fiecare domeniu (implicit expandat)
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({
    'amteam.live': true,
    'amx.today': true,
    'aditrade.online': true,
    'g4trade.online': true,
  });

  const toggleExpand = (domainId: string) => {
    setExpandedDomains((prev) => ({
      ...prev,
      [domainId]: !prev[domainId],
    }));
  };

  const getDomainIcon = (id: DomainId) => {
    switch (id) {
      case 'amteam.live':
        return <TrendingUp className="h-5 w-5 text-blue-400" />;
      case 'amx.today':
        return <Flame className="h-5 w-5 text-amber-400" />;
      case 'aditrade.online':
        return <Bitcoin className="h-5 w-5 text-emerald-400" />;
      case 'g4trade.online':
        return <BarChart3 className="h-5 w-5 text-purple-400" />;
    }
  };

  return (
    <section ref={containerRef} className="space-y-4">
      {/* Title Bar */}
      <div>
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Algorithmic Architecture • Deep Research Documentation
          </h2>
        </div>
        <p className="text-xl font-extrabold text-slate-100 tracking-tight sm:text-2xl">
          Deep Research Strategy & Execution Playbooks
        </p>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Ghid operațional aprofundat pentru cele 4 clustere specializate. Fiecare domeniu rulează o echipă
          de 5 algoritmi dedicați cu reguli stricte de intrare, confirmare multi-timeframe și gestiune a riscului.
        </p>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {domains.map((dom) => {
          const spec = DEEP_RESEARCH_SPECS[dom.id];
          const isExpanded = !!expandedDomains[dom.id];
          const theme = spec.colorTheme;
          const strategy = dom.deepResearchStrategy;

          return (
            <div
              key={dom.id}
              className={`flex flex-col justify-between rounded-2xl border bg-gradient-to-b ${theme.cardBg} ${theme.border} p-5 shadow-xl ${theme.glow} transition-all duration-300`}
            >
              <div>
                {/* Header Card */}
                <div className="flex items-start justify-between border-b border-slate-800/80 pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-900/90 shadow-inner">
                      {getDomainIcon(dom.id)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-extrabold text-slate-100">
                          {dom.name}
                        </span>
                        {/* 5. Badge VERIFIED STRATEGY cu checkmark */}
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/50 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          <span>VERIFIED STRATEGY</span>
                        </span>
                      </div>
                      <h3 className={`mt-0.5 text-base font-extrabold ${theme.accentText}`}>
                        {spec.title}
                      </h3>
                    </div>
                  </div>

                  {/* Link direct către domeniu */}
                  <a
                    href={dom.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/80 px-2 py-1 text-2xs font-semibold text-slate-400 hover:text-cyan-300 transition-colors"
                    title={`Deschide ${dom.url}`}
                  >
                    <span>Domeniu</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {/* Profil & Active */}
                <div className="mt-3 space-y-2">
                  <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-3">
                    <span className="text-2xs font-semibold uppercase tracking-normal sm:tracking-wider text-slate-400 block mb-1">
                      Profil & Mediu de Piață:
                    </span>
                    <p className="text-xs text-slate-200 font-medium leading-relaxed">
                      "{spec.profile}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Active Tranzacționate:</span>
                    <div className="flex gap-1.5 font-mono">
                      {spec.assets.map((asset) => (
                        <span
                          key={asset}
                          className="rounded-md border border-slate-800 bg-slate-950 px-2 py-0.5 text-2xs font-bold text-slate-200"
                        >
                          {asset}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 5 Strategii Specifice per Bot */}
                <div className="mt-4 rounded-xl border border-slate-800/80 bg-slate-950/80 p-3.5 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-2xs font-semibold uppercase tracking-normal sm:tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                      Flota de 5 Algoritmi Specializați
                    </span>
                    <span className="text-2xs font-mono text-slate-500">5 Boți Aliniați</span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {spec.botStrategies.map((botSpec, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-1 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                          botSpec.isGolden
                            ? 'border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 text-yellow-200 shadow-sm'
                            : 'bg-slate-900/60 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {botSpec.isGolden ? (
                            <span className="font-serif font-extrabold text-yellow-400 text-xs">φ</span>
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                          )}
                          <span className={`font-mono font-bold ${botSpec.isGolden ? 'text-yellow-300' : 'text-slate-100'}`}>
                            {botSpec.name}:
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-300 sm:text-right">
                          {botSpec.rule}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Expand/Collapse pentru Detalii Complete */}
                {isExpanded && (
                  <div className="mt-4 space-y-3 animate-in fade-in duration-300">
                    {/* Descrierea extinsă din Deep Research */}
                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                      <span className="text-2xs font-semibold uppercase tracking-normal sm:tracking-wider text-cyan-400 block mb-1">
                        Sinteză Teoretică Deep Research:
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {strategy.description}
                      </p>
                    </div>

                    {/* Parametrii Tehnici Cheie */}
                    <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-3">
                      <span className="text-2xs font-semibold uppercase tracking-normal sm:tracking-wider text-cyan-400 flex items-center gap-1.5 mb-2">
                        <Cpu className="h-3.5 w-3.5" /> Parametri Tehnici Cheie
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                        {strategy.keyParameters.map((param, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                            <span>{param}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reguli de Angajare & Adaptări Critice */}
                    <div className="grid grid-cols-1 gap-2.5">
                      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                        <span className="text-2xs font-semibold uppercase tracking-normal sm:tracking-wider text-emerald-400 flex items-center gap-1.5 mb-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Reguli de Angajare (Execution Rules)
                        </span>
                        <ul className="space-y-1 text-xs text-slate-300">
                          {strategy.engagementRules.map((rule, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-emerald-400 font-bold">✓</span>
                              <span>{rule}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                        <span className="text-2xs font-semibold uppercase tracking-normal sm:tracking-wider text-amber-400 flex items-center gap-1.5 mb-1.5">
                          <ShieldCheck className="h-3.5 w-3.5" /> Adaptări Critice & Slippage Guards
                        </span>
                        <ul className="space-y-1 text-xs text-slate-400">
                          {strategy.criticalAdaptations.map((adapt, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-amber-400 font-bold">⚠</span>
                              <span>{adapt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions: Expand Toggle Button */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => toggleExpand(dom.id)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white hover:border-slate-700 transition-colors"
                >
                  <span>{isExpanded ? 'RESTRÂNGE DETALII' : 'VEZI DETALII COMPLETE'}</span>
                  {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>

                <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Protocol Trinity v4.2</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export const DeepResearchInsights = React.memo(DeepResearchInsightsComponent);
