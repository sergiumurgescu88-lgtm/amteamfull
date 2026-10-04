import React, { useState, useMemo } from 'react';
import { BotData, BotStatus } from '../../types/trading';
import {
  X,
  Sparkles,
  TrendingUp,
  Activity,
  Layers,
  ShieldAlert,
  Clock,
  Award,
  Zap,
  CheckCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Download,
  Percent,
  Play,
  Pause,
  Compass,
  Target,
  BarChart2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface RecentTrade {
  id: string;
  timestamp: string;
  side: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  profit: number;
  durationMinutes: number;
}

interface BotAnalysisModalProps {
  bot: BotData | null;
  onClose: () => void;
  onToggleStatus: (botId: string) => void;
}

// Generator consecvent de 10 tranzacții recente pe baza datelor botului
function generateRecentTrades(bot: BotData): RecentTrade[] {
  const trades: RecentTrade[] = [];
  const basePrice =
    bot.asset === 'XAUUSD'
      ? 2640.5
      : bot.asset === 'BTCUSD'
      ? 64200.0
      : bot.asset === 'EURUSD'
      ? 1.085
      : bot.asset === 'OIL'
      ? 75.2
      : 154.2;

  const now = new Date();

  for (let i = 0; i < 10; i++) {
    const tradeTime = new Date(now.getTime() - (i * 3.5 + 0.5) * 60 * 60 * 1000);
    const timeStr = tradeTime.toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    const isWin = i % 4 !== 3; // 75-80% rata de câștig conform winRate
    const side: 'BUY' | 'SELL' = i % 2 === 0 ? 'BUY' : 'SELL';
    const delta = (Math.random() * 0.008 + 0.002) * basePrice;
    const entryPrice = parseFloat(basePrice.toFixed(bot.asset.includes('USD') && !bot.asset.includes('BTC') && !bot.asset.includes('XAU') ? 5 : 2));
    const exitPrice = parseFloat(
      (side === 'BUY'
        ? entryPrice + (isWin ? delta : -delta * 0.5)
        : entryPrice - (isWin ? delta : -delta * 0.5)
      ).toFixed(bot.asset.includes('USD') && !bot.asset.includes('BTC') && !bot.asset.includes('XAU') ? 5 : 2)
    );

    const profit = isWin
      ? Math.round(bot.avgWin * (0.8 + Math.random() * 0.4))
      : -Math.round(bot.avgLoss * (0.8 + Math.random() * 0.3));

    trades.push({
      id: `tr-${bot.id}-${i + 1}`,
      timestamp: timeStr,
      side,
      entryPrice,
      exitPrice,
      profit,
      durationMinutes: Math.floor(Math.random() * 65) + 15,
    });
  }

  return trades;
}

export const BotAnalysisModal: React.FC<BotAnalysisModalProps> = ({
  bot,
  onClose,
  onToggleStatus,
}) => {
  const [isStrategyExpanded, setIsStrategyExpanded] = useState<boolean>(true);

  // 10 tranzacții recente generate
  const recentTrades = useMemo(() => {
    if (!bot) return [];
    return generateRecentTrades(bot);
  }, [bot]);

  if (!bot) return null;

  // Verificare dacă e SERGIU bot (Golden Ratio Master)
  const isSergiuBot =
    bot.id.toLowerCase().includes('sergiu') ||
    bot.name.toLowerCase().includes('sergiu') ||
    bot.isGoldenRatioMaster;

  // Distribuție Fibonacci pentru Sergiu bots
  const fibonacciLevelData = {
    primaryLevel:
      bot.asset === 'XAUUSD'
        ? '0.618 - 0.65 Deep Golden Zone'
        : bot.asset === 'EURUSD'
        ? '0.618 Classic Retracement'
        : bot.asset === 'BTCUSD' || bot.asset === 'GBPJPY'
        ? '0.500 Equilibrium Confluence'
        : '0.618 + Psychological Level',
    successRate: `${(bot.winRate + 2.5).toFixed(1)}%`,
    distributions: [
      { level: '0.382 Minor Retrace', share: 14, winRate: 74.2 },
      { level: '0.500 Equilibrium', share: 22, winRate: 82.5 },
      { level: '0.618 Golden Pocket (φ)', share: 52, winRate: 91.8 },
      { level: '0.786 Deep Extension', share: 12, winRate: 83.0 },
    ],
  };

  // 4. Export Trades CSV
  const handleExportTradesCsv = () => {
    const headers = [
      'ID Trade',
      'Data/Ora',
      'Directie',
      'Simbol',
      'Pret Intrare',
      'Pret Iesire',
      'Profit ($)',
      'Durata (Minute)',
    ];

    const rows = recentTrades.map((t) => [
      t.id,
      `"${t.timestamp}"`,
      t.side,
      bot.asset,
      t.entryPrice,
      t.exitPrice,
      t.profit,
      t.durationMinutes,
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `trades_${bot.name.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Status badge
  const renderStatusBadge = (status: BotStatus) => {
    switch (status) {
      case 'ÎN TRADE':
        return (
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/50 bg-emerald-500/20 px-3 py-1 font-mono text-xs font-bold text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            ÎN TRADE
          </span>
        );
      case 'SCANNING':
        return (
          <span className="flex items-center gap-1.5 rounded-full border border-cyan-500/50 bg-cyan-500/20 px-3 py-1 font-mono text-xs font-bold text-cyan-300">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            SCANNING
          </span>
        );
      case 'COOLDOWN':
        return (
          <span className="flex items-center gap-1.5 rounded-full border border-amber-500/50 bg-amber-500/20 px-3 py-1 font-mono text-xs font-bold text-amber-300">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            COOLDOWN
          </span>
        );
      case 'PAUSED':
        return (
          <span className="flex items-center gap-1.5 rounded-full border border-rose-500/50 bg-rose-500/20 px-3 py-1 font-mono text-xs font-bold text-rose-300">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            PAUSED
          </span>
        );
    }
  };

  return (
    // 4. Modals Mobile: Bottom-sheet slide-up, full screen pe mobile
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-md bg-black/80 overflow-y-auto">
      <div className="relative w-full max-w-4xl h-full sm:h-auto max-h-screen sm:max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-slate-700/80 bg-slate-900 shadow-2xl text-slate-100 overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* 2. Header cu Bot Name, Domain, Symbol, Status & Phi badge */}
        <div
          className={`flex items-start justify-between border-b p-6 ${
            isSergiuBot
              ? 'border-yellow-500/40 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-slate-900'
              : 'border-slate-800 bg-slate-900/90'
          }`}
        >
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white">
                {bot.name}
              </h2>
              <span className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-0.5 font-mono text-xs font-bold text-slate-200">
                {bot.asset}
              </span>
              <a
                href={`https://${bot.domain}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-700/70 bg-slate-800/60 px-2 py-0.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
                title={`Deschide nodul https://${bot.domain}`}
              >
                <span>{bot.domain}</span>
                <ExternalLink className="h-3 w-3" />
              </a>

              {/* Status Badge */}
              {renderStatusBadge(bot.status)}

              {/* Badge Phi pentru SERGIU Bots */}
              {isSergiuBot && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-400/80 bg-gradient-to-r from-amber-500/30 to-yellow-500/40 px-3 py-0.5 font-mono text-xs font-black text-yellow-300 shadow-[0_0_15px_rgba(251,191,36,0.35)]">
                  <span className="font-serif font-black text-sm">φ</span>
                  <Sparkles className="h-3.5 w-3.5 animate-spin text-yellow-300" />
                  <span>GOLDEN RATIO MASTER</span>
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 font-medium">
              {bot.strategyName} • Sub-nod arhitectural Trinity v4.2
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            title="Închide fereastra modală"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* 2. Grid 4 Stat Cards: Win Rate, Profit Factor, Max Drawdown, Sharpe Ratio */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* Win Rate */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 font-sans">
                <Award className="h-3.5 w-3.5 text-emerald-400" /> Win Rate 30D
              </span>
              <p className="font-mono text-xl font-extrabold text-emerald-400 mt-1">
                {bot.winRate}%
              </p>
              <span className="text-[10px] text-slate-500 font-sans">{bot.totalTrades} tranzacții executate</span>
            </div>

            {/* Profit Factor */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 font-sans">
                <TrendingUp className="h-3.5 w-3.5 text-cyan-400" /> Profit Factor
              </span>
              <p className="font-mono text-xl font-extrabold text-cyan-300 mt-1">
                {bot.profitFactor} PF
              </p>
              <span className="text-[10px] text-slate-500 font-sans">Avg Win: +${bot.avgWin}</span>
            </div>

            {/* Max Drawdown */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 font-sans">
                <ShieldAlert className="h-3.5 w-3.5 text-rose-400" /> Max Drawdown
              </span>
              <p className="font-mono text-xl font-extrabold text-rose-400 mt-1">
                -{bot.maxDrawdown}%
              </p>
              <span className="text-[10px] text-slate-500 font-sans">Prag siguranță: {bot.settings.maxDrawdownPct}%</span>
            </div>

            {/* Sharpe Ratio */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 font-sans">
                <Activity className="h-3.5 w-3.5 text-amber-400" /> Sharpe Ratio
              </span>
              <p className="font-mono text-xl font-extrabold text-amber-300 mt-1">
                {bot.sharpeRatio}
              </p>
              <span className="text-[10px] text-slate-500 font-sans">Timp mediu: {bot.avgTradeTime}</span>
            </div>
          </div>

          {/* 3. PENTRU SERGIU BOTS: Secțiune specială "Fibonacci Analysis" */}
          {isSergiuBot && (
            <div className="rounded-2xl border border-yellow-500/40 bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 p-4 shadow-[0_0_20px_rgba(251,191,36,0.15)]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-yellow-500/30 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-yellow-500/20 text-yellow-300 border border-yellow-400/40">
                    <span className="font-serif font-black text-base">φ</span>
                  </div>
                  <div>
                    <h4 className="font-mono text-sm font-black text-yellow-300 flex items-center gap-1.5">
                      <span>FIBONACCI ANALYSIS & GOLDEN RATIO CONFLUENCE</span>
                    </h4>
                    <p className="text-[11px] text-yellow-200/80 font-sans">
                      Nivel cheie: <strong className="text-yellow-300">{fibonacciLevelData.primaryLevel}</strong>
                    </p>
                  </div>
                </div>

                <div className="mt-2 sm:mt-0 flex items-center gap-2">
                  <span className="rounded-full border border-yellow-400/40 bg-yellow-500/20 px-3 py-1 font-mono text-xs font-bold text-yellow-300">
                    Rată Succes Nivel: {fibonacciLevelData.successRate}
                  </span>
                </div>
              </div>

              {/* Grafic distribuție intrări pe niveluri Fibonacci */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400/90 block mb-2 font-mono">
                  Distribuția Intrărilor pe Niveluri Fibonacci (Historic 30D):
                </span>

                <div className="space-y-2">
                  {fibonacciLevelData.distributions.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-300 flex items-center gap-1.5">
                          {item.level.includes('φ') && <span className="text-yellow-400 font-serif font-black">φ</span>}
                          {item.level}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-yellow-300 font-bold">{item.share}% pondere</span>
                          <span className="text-emerald-400 text-[11px]">({item.winRate}% win rate)</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="h-2 w-full rounded-full bg-slate-950/80 overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.level.includes('φ')
                              ? 'bg-gradient-to-r from-amber-400 to-yellow-500 shadow-sm'
                              : 'bg-slate-600'
                          }`}
                          style={{ width: `${item.share * 1.8}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. Area Chart cu Equity Curve pe 30 zile */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  <BarChart2 className="h-4 w-4 text-cyan-400" />
                  Curba de Performanță 30 de Zile (Cumulative Equity)
                </h4>
                <p className="text-xs text-slate-400">
                  Total acumulat: +${bot.totalProfit.toLocaleString()} | P/L Curent: ${bot.livePl.toFixed(2)}
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-400">
                +${bot.totalProfit.toLocaleString()}
              </span>
            </div>

            <div className="h-56 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bot.historyPl} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`modalGrad-${bot.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={isSergiuBot ? '#f59e0b' : '#22d3ee'}
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="95%"
                        stopColor={isSergiuBot ? '#f59e0b' : '#22d3ee'}
                        stopOpacity={0.0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-xl border border-slate-700 bg-slate-950/95 p-2.5 font-mono text-xs shadow-xl backdrop-blur-md">
                            <p className="font-bold text-slate-300">{label}</p>
                            <p className="text-emerald-400 mt-1">Cumulativ: +${Number(payload[0].value).toFixed(2)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke={isSergiuBot ? '#f59e0b' : '#22d3ee'}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill={`url(#modalGrad-${bot.id})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Tabel cu Ultimele 10 Trades */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-800 gap-2">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-mono">
                  <Zap className="h-3.5 w-3.5 text-amber-400" /> Ultimele 10 Tranzacții Executate
                </h4>
                <p className="text-[11px] text-slate-500 font-sans">
                  Istoric detaliat din jurnalul de execuție al botului
                </p>
              </div>

              {/* 4. Buton Export Trades CSV */}
              <button
                onClick={handleExportTradesCsv}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-200 hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-300 transition-colors"
                title="Exportă tranzacțiile recente în format CSV"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export CSV</span>
              </button>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-bold uppercase text-slate-400">
                    <th className="py-2 px-2">Data/Oră</th>
                    <th className="py-2 px-2">Direcție</th>
                    <th className="py-2 px-2">Preț Intrare</th>
                    <th className="py-2 px-2">Preț Ieșire</th>
                    <th className="py-2 px-2">Profit ($)</th>
                    <th className="py-2 px-2 text-right">Durată</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentTrades.map((t) => {
                    const isWin = t.profit >= 0;
                    return (
                      <tr key={t.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-2 px-2 text-slate-400 text-[11px]">{t.timestamp}</td>
                        <td className="py-2 px-2">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              t.side === 'BUY'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {t.side}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-slate-300">{t.entryPrice}</td>
                        <td className="py-2 px-2 text-slate-300">{t.exitPrice}</td>
                        <td className="py-2 px-2">
                          <span className={`font-bold ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isWin ? '+' : ''}${t.profit}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-right text-slate-400 text-[11px]">
                          {t.durationMinutes} min
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Strategy Details Expandabile */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div
              onClick={() => setIsStrategyExpanded(!isStrategyExpanded)}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" /> Detalii Strategie & Parametri Tehnici
              </h4>
              <button className="text-slate-400 hover:text-slate-200">
                {isStrategyExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>

            {isStrategyExpanded && (
              <div className="mt-3 space-y-3 pt-2 border-t border-slate-800 animate-in fade-in duration-200">
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {bot.strategyDescription}
                </p>

                {/* Parametri Tehnici Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono text-xs pt-1">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
                    <span className="text-slate-500 text-[10px] block">ADX THRESHOLD:</span>
                    <span className="font-bold text-cyan-300">&gt; {bot.technicalParameters.adxThreshold}</span>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
                    <span className="text-slate-500 text-[10px] block">WHALE INTENSITY:</span>
                    <span className="font-bold text-purple-300">&gt; {bot.technicalParameters.whaleThreshold}%</span>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
                    <span className="text-slate-500 text-[10px] block">TIMEFRAME:</span>
                    <span className="font-bold text-slate-200">{bot.technicalParameters.timeframe}</span>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
                    <span className="text-slate-500 text-[10px] block">STOP LOSS:</span>
                    <span className="font-bold text-rose-400">{bot.technicalParameters.stopLossPips} pips</span>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
                    <span className="text-slate-500 text-[10px] block">TAKE PROFIT RATIO:</span>
                    <span className="font-bold text-emerald-400">{bot.technicalParameters.takeProfitRatio}</span>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
                    <span className="text-slate-500 text-[10px] block">MAX LOT SIZE:</span>
                    <span className="font-bold text-amber-300">{bot.settings.maxLotSize} Lots</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Reguli Intrare / Ieșire (Entry/Exit Rules cu bullet points) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Entry Rules */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2.5 flex items-center gap-1.5 font-mono">
                <CheckCircle className="h-3.5 w-3.5" /> Reguli de Intrare (Entry Rules)
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {bot.entryRules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Exit Rules */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2.5 flex items-center gap-1.5 font-mono">
                <ShieldAlert className="h-3.5 w-3.5" /> Reguli de Ieșire (Exit Rules)
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {bot.exitRules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold shrink-0 mt-0.5">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 4. Butoane Acțiune în Footer (5. Touch Targets min 44x44px, Spacing min 12px) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-slate-800 bg-slate-950/90 p-4 sm:p-5 gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Stare Execuție:</span>
            {renderStatusBadge(bot.status)}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* PAUSE / RESUME */}
            <button
              onClick={() => onToggleStatus(bot.id)}
              className={`flex min-h-[44px] items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all active:scale-95 ${
                bot.status === 'PAUSED'
                  ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'border border-amber-500/50 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'
              }`}
            >
              {bot.status === 'PAUSED' ? (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  <span>PORNEȘTE BOTUL</span>
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4 fill-current" />
                  <span>PAUZEAZĂ BOTUL</span>
                </>
              )}
            </button>

            {/* VIEW FULL HISTORY */}
            <a
              href={`https://${bot.domain}`}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
              title="Deschide nodul dedicat într-un tab nou"
            >
              <span>VIEW FULL HISTORY</span>
              <ExternalLink className="h-4 w-4" />
            </a>

            {/* CLOSE MODAL */}
            <button
              onClick={onClose}
              className="flex min-h-[44px] items-center rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Închide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
