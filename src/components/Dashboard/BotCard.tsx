import React from 'react';
import { BotData, BotStatus } from '../../types/trading';
import {
  ExternalLink,
  Play,
  Pause,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Waves,
  Eye,
  Zap,
  Compass,
  Target,
} from 'lucide-react';

interface BotCardProps {
  bot: BotData;
  onAnalyze: (bot: BotData) => void;
  onToggleStatus: (botId: string) => void;
  onOpenSettings: (bot: BotData) => void;
}

interface FibonacciInfo {
  strategyLabel: string;
  confirmationDetail: string;
  currentLevel: string;
  nextLevel: string;
  distance: string;
  swingPoints: [number, number, number, number, number];
}

/**
 * Calcul și extragere informații Fibonacci dedicate conform cerințelor:
 * 3. SERGIU-Majors (EURUSD): Classic Retracement: 0.618 | Confirmare pe M15
 * 4. SERGIU-Metals (XAUUSD): Deep Golden Zone: 0.618 - 0.65 | Confirmare pe M30
 * 5. SERGIU-Crypto (GBPJPY / BTCUSD): Equilibrium Level: 0.500 | Stop Loss în afara 0.786
 * 6. SERGIU-Macro (EURJPY / OIL): Fibonacci + Psychological Level | Verifică suprapunere cu numere rotunde
 */
function getFibonacciData(bot: BotData): FibonacciInfo {
  const idLower = bot.id.toLowerCase();
  const nameLower = bot.name.toLowerCase();
  const asset = bot.asset.toUpperCase();

  // 3. SERGIU-Majors (EURUSD)
  if (nameLower.includes('sergiu-majors') || (nameLower.includes('sergiu') && asset === 'EURUSD')) {
    return {
      strategyLabel: 'Classic Retracement: 0.618',
      confirmationDetail: 'Confirmare pe M15',
      currentLevel: '0.618 (Golden Pocket)',
      nextLevel: '1.618 Extension',
      distance: '+24 pips to 1.618',
      swingPoints: [22, 88, 44, 94, 61.8],
    };
  }

  // 4. SERGIU-Metals (XAUUSD)
  if (nameLower.includes('sergiu-metals') || (nameLower.includes('sergiu') && asset === 'XAUUSD')) {
    return {
      strategyLabel: 'Deep Golden Zone: 0.618 - 0.65',
      confirmationDetail: 'Confirmare pe M30',
      currentLevel: '0.618 - 0.65 (Deep Golden)',
      nextLevel: '2.618 Macro Ext.',
      distance: '+42 pips to 1.618',
      swingPoints: [18, 92, 38, 96, 63.5],
    };
  }

  // 5. SERGIU-Crypto (GBPJPY sau BTCUSD)
  if (nameLower.includes('sergiu-crypto') || asset === 'GBPJPY' || (nameLower.includes('sergiu') && asset === 'BTCUSD')) {
    return {
      strategyLabel: 'Equilibrium Level: 0.500',
      confirmationDetail: 'Stop Loss în afara 0.786',
      currentLevel: '0.500 (Equilibrium)',
      nextLevel: '0.618 Golden Pocket',
      distance: '-18 pips to 0.786 SL',
      swingPoints: [28, 82, 50, 86, 50.0],
    };
  }

  // 6. SERGIU-Macro (EURJPY sau OIL)
  if (nameLower.includes('sergiu-macro') || asset === 'EURJPY' || (nameLower.includes('sergiu') && asset === 'OIL')) {
    return {
      strategyLabel: 'Fibonacci + Psychological Level',
      confirmationDetail: 'Verifică suprapunere cu numere rotunde',
      currentLevel: '0.618 + Round Level ($75.00)',
      nextLevel: '1.618 Target Level',
      distance: '+1.25$ to Round Nbr',
      swingPoints: [20, 76, 42, 88, 61.8],
    };
  }

  // Fallback pentru alți boți / Gamma bots
  return {
    strategyLabel: 'Harmonic Retracement 0.50 - 0.618',
    confirmationDetail: `Confirmare pe ${bot.technicalParameters.timeframe}`,
    currentLevel: '0.500 / 0.618 Cluster',
    nextLevel: '1.272 / 1.618 Ext.',
    distance: '+16 pips to target',
    swingPoints: [25, 78, 48, 85, 58],
  };
}

const BotCardComponent: React.FC<BotCardProps> = ({
  bot,
  onAnalyze,
  onToggleStatus,
  onOpenSettings,
}) => {
  const isProfit = bot.livePl > 0;
  const isLoss = bot.livePl < 0;

  // 1. Detectare boturi SERGIU sau GAMMA sau GOLDEN RATIO MASTER
  const isGoldenBot =
    bot.id.toLowerCase().includes('sergiu') ||
    bot.id.toLowerCase().includes('gamma') ||
    bot.name.toLowerCase().includes('sergiu') ||
    bot.name.toLowerCase().includes('gamma') ||
    bot.isGoldenRatioMaster;

  const fibData = getFibonacciData(bot);

  // Status badge classes
  const getStatusBadge = (status: BotStatus) => {
    switch (status) {
      case 'ÎN TRADE':
        return (
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            ÎN TRADE
          </span>
        );
      case 'SCANNING':
        return (
          <span className="flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/15 px-2.5 py-0.5 font-mono text-[10px] font-bold text-cyan-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            SCANNING
          </span>
        );
      case 'COOLDOWN':
        return (
          <span className="flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 font-mono text-2xs font-semibold text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            COOLDOWN
          </span>
        );
      case 'PAUSED':
        return (
          <span className="flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/15 px-2.5 py-0.5 font-mono text-2xs font-semibold text-rose-300">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            PAUSED
          </span>
        );
    }
  };

  // Bias badge
  const getBiasBadge = () => {
    if (bot.bias === 'BUY') {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-1.5 py-0.5 font-mono text-2xs font-bold text-emerald-300">
          <TrendingUp className="h-3 w-3" /> BUY
        </span>
      );
    }
    if (bot.bias === 'SELL') {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-rose-500/20 px-1.5 py-0.5 font-mono text-2xs font-bold text-rose-300">
          <TrendingDown className="h-3 w-3" /> SELL
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded bg-slate-700/50 px-1.5 py-0.5 font-mono text-2xs font-medium text-slate-300">
        <Minus className="h-3 w-3" /> NEUTRAL
      </span>
    );
  };

  // Coordonate pentru mini graficul celor 5 Swing Points (SW1 .. SW5)
  // Lățime 100%, înălțime 36px
  const svgPoints = fibData.swingPoints;
  const svgCoords = svgPoints.map((val, idx) => {
    const x = 10 + idx * 36; // 10, 46, 82, 118, 154
    const y = 32 - (val / 100) * 26; // inversare axa Y (valori mai mari sus)
    return { x, y, val };
  });
  const pointsPath = svgCoords.map((pt) => `${pt.x},${pt.y}`).join(' ');

  return (
    <div
      className={`group relative flex flex-col justify-between min-h-[280px] rounded-2xl transition-all duration-300 hover:-translate-y-1 ${
        isGoldenBot
          ? 'p-[1.5px] bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 shadow-[0_0_30px_rgba(251,191,36,0.4)] animate-pulse'
          : bot.status === 'ÎN TRADE'
          ? 'border border-emerald-500/40 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 shadow-lg hover:border-emerald-500/70 p-4'
          : bot.status === 'PAUSED'
          ? 'border border-slate-800 bg-slate-950/60 opacity-80 hover:opacity-100 p-4'
          : 'border border-slate-800/90 bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-950 hover:border-slate-700 shadow-md p-4'
      }`}
    >
      {/* Container intern pentru cardurile cu border gradient auriu */}
      <div
        className={`flex flex-col justify-between h-full w-full rounded-[14px] ${
          isGoldenBot ? 'bg-slate-950/95 p-3.5 backdrop-blur-sm' : ''
        }`}
      >
        {/* 1. Golden Ratio Master Badge cu iconiță φ (Phi) */}
        {isGoldenBot && (
          <div className="mb-2.5 flex items-center justify-between rounded-xl border border-yellow-400/60 bg-gradient-to-r from-amber-500/30 via-yellow-500/25 to-amber-600/30 px-2.5 py-1 text-yellow-300 shadow-sm">
            <div className="flex items-center gap-1.5 font-mono text-2xs font-extrabold tracking-normal sm:tracking-wider uppercase">
              <span className="font-serif text-base font-extrabold text-yellow-300">φ</span>
              <Sparkles className="h-3.5 w-3.5 text-yellow-400 animate-spin" />
              <span>GOLDEN RATIO MASTER</span>
            </div>
            <span className="font-mono text-2xs font-bold text-yellow-400/95 bg-yellow-500/20 px-1.5 py-0.5 rounded border border-yellow-400/40">
              φ = 1.618
            </span>
          </div>
        )}

        {/* Header: Nume, Activ, Domeniu & Setări */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <h4
                  className={`font-mono text-sm font-bold tracking-tight ${
                    isGoldenBot ? 'text-yellow-200' : 'text-slate-100'
                  }`}
                >
                  {bot.name}
                </h4>
                <span className="rounded bg-slate-800/90 px-1.5 py-0.5 font-mono text-2xs font-bold text-slate-300">
                  {bot.asset}
                </span>
              </div>

              {/* Link către domeniul părinte */}
              <a
                href={`https://${bot.domain}`}
                target="_blank"
                rel="noreferrer"
                className="mt-0.5 inline-flex items-center gap-1 text-2xs text-slate-400 hover:text-cyan-400 transition-colors"
              >
                <span>{bot.domain}</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onOpenSettings(bot)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                title="Setări Bot & Risk Thresholds"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </button>
              {getStatusBadge(bot.status)}
            </div>
          </div>

          {/* 2. SECȚIUNE FIBONACCI ANALYSIS (Nivel, Distanță, Mini Grafic Swing Points) */}
          <div className={`mt-3 rounded-xl border p-2.5 font-mono ${
            isGoldenBot
              ? 'border-yellow-500/40 bg-gradient-to-b from-yellow-500/10 via-slate-900/90 to-slate-950'
              : 'border-slate-800 bg-slate-950/70'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
              <div className="flex items-center gap-1 text-2xs font-semibold uppercase tracking-normal sm:tracking-wider text-yellow-400">
                <Compass className="h-3 w-3 text-yellow-400" />
                <span>Fibonacci Analysis</span>
              </div>
              <span className="text-2xs font-bold text-emerald-400 flex items-center gap-0.5">
                <Target className="h-2.5 w-2.5" />
                {fibData.distance}
              </span>
            </div>

            {/* Specificații exacte conform cerințelor 3, 4, 5, 6 */}
            <div className="mt-1.5 flex flex-col gap-1 text-2xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Nivel Curent:</span>
                <span className="font-bold text-yellow-300">{fibData.currentLevel}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Strategie:</span>
                <span className="font-semibold text-slate-200 truncate max-w-[155px]" title={fibData.strategyLabel}>
                  {fibData.strategyLabel}
                </span>
              </div>
              <div className="flex items-center justify-between text-2xs text-cyan-300/90">
                <span className="text-slate-500 font-sans">Condiție:</span>
                <span className="font-mono text-cyan-300">{fibData.confirmationDetail}</span>
              </div>
            </div>

            {/* Mini Grafic cu ultimele 5 Swing Points (SW1 - SW5) */}
            <div className="mt-2 pt-1 border-t border-slate-800/60">
              <div className="flex items-center justify-between text-2xs text-slate-500 font-sans mb-1">
                <span>Swing Flow (SW1 → SW5)</span>
                <span className="text-yellow-400/90 font-mono">0.618 Golden Pocket</span>
              </div>

              <div className="relative h-9 w-full bg-slate-950/80 rounded border border-slate-800/60 overflow-hidden px-1">
                <svg viewBox="0 0 164 36" className="w-full h-full overflow-visible">
                  {/* Linii orizontale de ghidaj Fibonacci (0.382, 0.618) */}
                  <line x1="0" y1="22" x2="164" y2="22" stroke="#334155" strokeDasharray="2 2" strokeWidth="0.8" />
                  <line x1="0" y1="13.9" x2="164" y2="13.9" stroke="#ca8a04" strokeDasharray="3 2" strokeWidth="0.9" opacity="0.6" />

                  {/* Polyline între cele 5 swing points */}
                  <polyline
                    fill="none"
                    stroke={isGoldenBot ? '#fbbf24' : '#22d3ee'}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={pointsPath}
                  />

                  {/* Cercuri pe fiecare dintre cele 5 swing points */}
                  {svgCoords.map((pt, i) => {
                    const isLast = i === svgCoords.length - 1;
                    return (
                      <g key={i}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isLast ? '3' : '2'}
                          fill={isLast ? '#fbbf24' : '#020617'}
                          stroke={isLast ? '#ffffff' : isGoldenBot ? '#f59e0b' : '#38bdf8'}
                          strokeWidth="1.5"
                        />
                        {isLast && (
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="5"
                            fill="none"
                            stroke="#fbbf24"
                            strokeWidth="1"
                            className="animate-ping"
                          />
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Marcaje Swing Points */}
                <div className="absolute bottom-0.5 inset-x-2 flex justify-between text-2xs font-mono text-slate-500">
                  <span>SW1</span>
                  <span>SW2</span>
                  <span>SW3</span>
                  <span>SW4</span>
                  <span className="text-yellow-400 font-bold">SW5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Metrics Grid (ADX, Whale Intensity, Lot) */}
          <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl border border-slate-800/80 bg-slate-950/60 p-2 text-center">
            {/* ADX */}
            <div className="flex flex-col">
              <span className="text-2xs font-semibold uppercase tracking-normal sm:tracking-wider text-slate-400 flex items-center justify-center gap-1">
                <Activity className="h-2.5 w-2.5 text-cyan-400" /> ADX
              </span>
              <span
                className={`font-mono text-xs font-bold ${
                  bot.adx > 30 ? 'text-emerald-400' : bot.adx > 20 ? 'text-cyan-300' : 'text-slate-400'
                }`}
              >
                {bot.adx}
              </span>
            </div>

            {/* Whale Intensity */}
            <div className="flex flex-col">
              <span className="text-2xs font-semibold uppercase tracking-normal sm:tracking-wider text-slate-400 flex items-center justify-center gap-1">
                <Waves className="h-2.5 w-2.5 text-purple-400" /> WHALE
              </span>
              <span
                className={`font-mono text-xs font-bold ${
                  bot.whaleIntensity > 80
                    ? 'text-purple-400'
                    : bot.whaleIntensity > 60
                    ? 'text-indigo-300'
                    : 'text-slate-400'
                }`}
              >
                {bot.whaleIntensity}%
              </span>
            </div>

            {/* Lot Size */}
            <div className="flex flex-col">
              <span className="text-2xs font-semibold uppercase tracking-normal sm:tracking-wider text-slate-400 flex items-center justify-center gap-1">
                <Zap className="h-2.5 w-2.5 text-amber-400" /> LOT
              </span>
              <span className="font-mono text-xs font-bold text-slate-200">{bot.lotSize}</span>
            </div>
          </div>

          {/* H4 Bias & Live P/L bar */}
          <div className="mt-3 flex items-center justify-between border-t border-slate-800/60 pt-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-2xs font-medium text-slate-400">H4 Bias:</span>
              {getBiasBadge()}
            </div>

            {/* Live P/L */}
            <div className="text-right">
              <span className="text-2xs font-semibold uppercase tracking-normal sm:tracking-wider text-slate-400 block">Live P/L</span>
              <span
                className={`font-mono text-sm font-extrabold tracking-tight ${
                  isProfit ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-slate-400'
                }`}
              >
                {isProfit ? '+' : ''}${bot.livePl.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons: ANALYZE & PAUSE/RESUME with min 44px touch target & 12px spacing */}
        <div className="mt-3.5 flex items-center gap-3 pt-2.5 border-t border-slate-800/80">
          <button
            onClick={() => onAnalyze(bot)}
            className="flex-1 flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/70 py-2 text-xs font-bold text-slate-200 transition-all hover:bg-slate-700 hover:text-white hover:border-slate-600 active:scale-95"
          >
            <Eye className="h-4 w-4 text-cyan-400" />
            <span>ANALYZE</span>
          </button>

          <button
            onClick={() => onToggleStatus(bot.id)}
            className={`flex min-h-[44px] min-w-[56px] items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-bold transition-all active:scale-95 ${
              bot.status === 'PAUSED'
                ? 'border border-emerald-500/50 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                : 'border border-amber-500/50 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'
            }`}
            title={bot.status === 'PAUSED' ? 'Repornește botul' : 'Pauzează botul'}
          >
            {bot.status === 'PAUSED' ? (
              <>
                <Play className="h-4 w-4 fill-current" />
                <span className="hidden sm:inline">START</span>
              </>
            ) : (
              <>
                <Pause className="h-4 w-4 fill-current" />
                <span className="hidden sm:inline">PAUSE</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export const BotCard = React.memo(BotCardComponent);
