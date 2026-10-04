import React from 'react';
import { DomainSummary, DomainId } from '../../types/trading';
import { ExternalLink, TrendingUp, Cpu, Globe, ArrowUpRight, Flame, Shield, Coins, BarChart3 } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

interface CommandCenterProps {
  domains: DomainSummary[];
  selectedDomainFilter: DomainId | 'ALL' | 'SERGIU';
  onSelectDomainFilter: (id: DomainId | 'ALL' | 'SERGIU') => void;
}

const CommandCenterComponent: React.FC<CommandCenterProps> = ({
  domains,
  selectedDomainFilter,
  onSelectDomainFilter,
}) => {
  // 2. Icons: 20px pe mobile (h-5 w-5)
  const getDomainIcon = (id: DomainId) => {
    switch (id) {
      case 'amteam.live':
        return <Globe className="h-5 w-5 text-blue-400" />;
      case 'amx.today':
        return <Flame className="h-5 w-5 text-amber-400" />;
      case 'aditrade.online':
        return <Coins className="h-5 w-5 text-emerald-400" />;
      case 'g4trade.online':
        return <BarChart3 className="h-5 w-5 text-purple-400" />;
    }
  };

  const getDomainColorTheme = (id: DomainId) => {
    switch (id) {
      case 'amteam.live':
        return {
          border: 'border-blue-500/30 hover:border-blue-500/60',
          gradient: 'from-blue-500/10 via-slate-900 to-slate-950',
          accent: 'text-blue-400',
          stroke: '#3b82f6',
          fill: '#3b82f6',
        };
      case 'amx.today':
        return {
          border: 'border-amber-500/30 hover:border-amber-500/60',
          gradient: 'from-amber-500/10 via-slate-900 to-slate-950',
          accent: 'text-amber-400',
          stroke: '#f59e0b',
          fill: '#f59e0b',
        };
      case 'aditrade.online':
        return {
          border: 'border-emerald-500/30 hover:border-emerald-500/60',
          gradient: 'from-emerald-500/10 via-slate-900 to-slate-950',
          accent: 'text-emerald-400',
          stroke: '#10b981',
          fill: '#10b981',
        };
      case 'g4trade.online':
        return {
          border: 'border-purple-500/30 hover:border-purple-500/60',
          gradient: 'from-purple-500/10 via-slate-900 to-slate-950',
          accent: 'text-purple-400',
          stroke: '#a855f7',
          fill: '#a855f7',
        };
    }
  };

  return (
    <section className="space-y-4">
      {/* Title & Controls */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-normal sm:tracking-wider text-slate-400 font-mono">
              Command Center • Master Domains Overview
            </h2>
          </div>
          <p className="text-lg sm:text-2xl font-extrabold text-slate-100 tracking-tight font-mono">
            Flota Trinity pe 4 Clustere Specializate
          </p>
        </div>

        {/* 5. Touch Targets: min 44x44px */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onSelectDomainFilter('ALL')}
            className={`flex min-h-[44px] items-center justify-center rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              selectedDomainFilter === 'ALL'
                ? 'bg-slate-100 text-slate-950 shadow-md font-bold'
                : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            Toate (20 Boți)
          </button>
          <button
            onClick={() => onSelectDomainFilter('SERGIU')}
            className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-bold transition-all ${
              selectedDomainFilter === 'SERGIU'
                ? 'border-yellow-400/80 bg-gradient-to-r from-amber-500/30 to-yellow-500/30 text-yellow-300 shadow-md glow-gold'
                : 'border-yellow-500/30 bg-slate-900/60 text-yellow-400/80 hover:border-yellow-500/60'
            }`}
          >
            <span className="font-mono text-base font-extrabold text-yellow-400">φ</span>
            <span>Doar SERGIU (4)</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Section Mobile: Grid 2 coloane pe mobile (nu 6), Padding: 16px (p-4), Icons: 20px (h-5 w-5), Font sizes: min 14px */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {domains.map((dom) => {
          const theme = getDomainColorTheme(dom.id);
          const isSelected = selectedDomainFilter === dom.id;

          return (
            <div
              key={dom.id}
              onClick={() => onSelectDomainFilter(dom.id)}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-gradient-to-b p-4 sm:p-5 shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-0.5 ${
                theme.gradient
              } ${isSelected ? 'border-cyan-400 ring-2 ring-cyan-400/40 glow-cyan' : theme.border}`}
            >
              {/* Top row: Name, Niche & Status */}
              <div>
                <div className="flex items-start justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    {/* Icon: 20px pe mobile (h-5 w-5) */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 shadow">
                      {getDomainIcon(dom.id)}
                    </div>
                    <div>
                      {/* Font size: min 14px pe mobile (text-sm sm:text-base) */}
                      <h3 className="font-mono text-sm sm:text-base font-bold text-slate-100 group-hover:text-white truncate max-w-[100px] sm:max-w-none">
                        {dom.name}
                      </h3>
                      <span className={`text-2xs sm:text-xs font-semibold uppercase tracking-normal sm:tracking-wider block ${theme.accent}`}>
                        {dom.niche}
                      </span>
                    </div>
                  </div>

                  {/* Active bots badge */}
                  <span className="shrink-0 rounded-full border border-slate-700 bg-slate-800/80 px-2 py-0.5 font-mono text-2xs font-bold text-slate-200">
                    {dom.activeBotsCount}/5
                  </span>
                </div>

                {/* Assets tags */}
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {dom.assets.slice(0, 3).map((asset) => (
                    <span
                      key={asset}
                      className="rounded-md border border-slate-800 bg-slate-950/70 px-1.5 py-0.5 font-mono text-2xs font-semibold text-slate-300"
                    >
                      {asset}
                    </span>
                  ))}
                  {dom.assets.length > 3 && (
                    <span className="rounded-md border border-slate-800 bg-slate-950/70 px-1 py-0.5 font-mono text-2xs text-slate-400">
                      +{dom.assets.length - 3}
                    </span>
                  )}
                </div>

                {/* Profit Total & Daily Pct (Font size: min 14px pe mobile: text-sm sm:text-xl) */}
                <div className="mt-3 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                  <div>
                    <span className="text-2xs font-medium uppercase tracking-normal sm:tracking-wider text-slate-400 block font-mono">
                      Profit Total
                    </span>
                    <p className="font-mono text-sm sm:text-xl font-extrabold text-emerald-400 tracking-tight">
                      +${dom.totalProfit.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="flex items-center text-xs font-bold text-emerald-400">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    <span>+{dom.dailyChangePct}%</span>
                  </div>
                </div>
              </div>

              {/* Sparkline Chart 24h */}
              <div className="mt-2 h-10 sm:h-14 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dom.sparkline24h}>
                    <defs>
                      <linearGradient id={`grad-${dom.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.stroke} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={theme.stroke} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border border-slate-800 bg-slate-950/90 px-2 py-1 text-[10px] font-mono text-slate-200 shadow">
                              ${Number(payload[0].value).toFixed(2)}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={theme.stroke}
                      strokeWidth={1.8}
                      fillOpacity={1}
                      fill={`url(#grad-${dom.id})`}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export const CommandCenter = React.memo(CommandCenterComponent);
