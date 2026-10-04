import React, { useState, useMemo } from 'react';
import { BotData, BotStatus, DomainId } from '../../types/trading';
import {
  Download,
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
  Play,
  Pause,
  AlertTriangle,
  Filter,
} from 'lucide-react';

interface MetricsTableProps {
  bots: BotData[];
  onAnalyze: (bot: BotData) => void;
  onToggleStatus: (botId: string) => void;
}

type SortField =
  | 'name'
  | 'domain'
  | 'asset'
  | 'status'
  | 'winRate'
  | 'profitFactor'
  | 'totalTrades'
  | 'avgWin'
  | 'avgLoss'
  | 'maxDrawdown'
  | 'totalProfit'
  | 'livePl'
  | 'lastTrade';

// Helper pentru timestamp simulat/real ultimul trade
function getLastTradeTimestamp(bot: BotData): string {
  const hash = bot.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const minutes = (hash % 45) + 5;
  const seconds = (hash * 3) % 60;
  const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const secStr = seconds < 10 ? `0${seconds}` : `${seconds}`;
  return `10:${minStr}:${secStr}`;
}

const MetricsTableComponent: React.FC<MetricsTableProps> = ({
  bots,
  onAnalyze,
  onToggleStatus,
}) => {
  // 3. Filtrare avansată
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [symbolFilter, setSymbolFilter] = useState<string>('ALL');

  // 2. Sortare funcțională
  const [sortField, setSortField] = useState<SortField>('totalProfit');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Extragere simboluri unice din flotă
  const uniqueSymbols = useMemo(() => {
    return Array.from(new Set(bots.map((b) => b.asset))).sort();
  }, [bots]);

  // Filtrare și sortare date
  const filteredAndSortedBots = useMemo(() => {
    return bots
      .filter((bot) => {
        // Căutare după nume bot sau activ
        const matchesSearch =
          bot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bot.asset.toLowerCase().includes(searchTerm.toLowerCase());

        // Filtru domeniu
        const matchesDomain = domainFilter === 'ALL' || bot.domain === domainFilter;

        // Filtru status
        const matchesStatus = statusFilter === 'ALL' || bot.status === statusFilter;

        // Filtru simbol
        const matchesSymbol = symbolFilter === 'ALL' || bot.asset === symbolFilter;

        return matchesSearch && matchesDomain && matchesStatus && matchesSymbol;
      })
      .sort((a, b) => {
        if (sortField === 'lastTrade') {
          const tA = getLastTradeTimestamp(a);
          const tB = getLastTradeTimestamp(b);
          return sortAsc ? tA.localeCompare(tB) : tB.localeCompare(tA);
        }

        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === 'string') {
          return sortAsc
            ? (valA as string).localeCompare(valB as string)
            : (valB as string).localeCompare(valA as string);
        }

        return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      });
  }, [bots, searchTerm, domainFilter, statusFilter, symbolFilter, sortField, sortAsc]);

  // Handler sortare
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // implicit descrescător
    }
  };

  // Render indicator de sortare
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <span className="opacity-20 text-[10px]">⇅</span>;
    }
    return sortAsc ? (
      <ChevronUp className="h-3.5 w-3.5 text-cyan-400" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5 text-cyan-400" />
    );
  };

  // 4. Export CSV îmbunătățit cu BOM UTF-8 pentru Excel
  const handleExportCsv = () => {
    const headers = [
      'Nume Bot',
      'Domeniu',
      'Simbol',
      'Status',
      'Golden Ratio Master',
      'Win Rate %',
      'Profit Factor',
      'Total Trades',
      'Avg Win $',
      'Avg Loss $',
      'Max Drawdown %',
      'Total Profit $',
      'Live P/L $',
      'Last Trade Timestamp',
    ];

    const rows = filteredAndSortedBots.map((b) => [
      `"${b.name}"`,
      `"${b.domain}"`,
      `"${b.asset}"`,
      `"${b.status}"`,
      b.isGoldenRatioMaster ? 'DA (φ)' : 'NU',
      b.winRate,
      b.profitFactor,
      b.totalTrades,
      b.avgWin,
      b.avgLoss,
      b.maxDrawdown,
      b.totalProfit,
      b.livePl,
      `"${getLastTradeTimestamp(b)}"`,
    ]);

    // Format UTF-8 cu BOM (\uFEFF) pentru compatibilitate garantată cu Microsoft Excel
    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    // Nume fișier: trinity_metrics_{domain}_{date}.csv
    const domainTag = domainFilter.replace(/[^a-zA-Z0-9]/g, '_');
    const dateTag = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `trinity_metrics_${domainTag}_${dateTag}.csv`);
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
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 font-mono text-2xs font-semibold text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            ÎN TRADE
          </span>
        );
      case 'SCANNING':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/40 bg-cyan-500/15 px-2 py-0.5 font-mono text-2xs font-semibold text-cyan-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            SCANNING
          </span>
        );
      case 'COOLDOWN':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 font-mono text-2xs font-semibold text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            COOLDOWN
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/15 px-2 py-0.5 font-mono text-2xs font-semibold text-rose-300">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            PAUSED
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800/90 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-5 shadow-2xl">
      {/* Top Header: Title, Search, Dropdowns & Export CSV */}
      <div className="flex flex-col gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-xs font-semibold uppercase tracking-normal sm:tracking-wider text-slate-400 font-mono">
                Fleet Performance Ledger • Full 20-Bot Matrix
              </h3>
            </div>
            <p className="text-xl font-extrabold text-slate-100 tracking-tight font-mono leading-heading">
              Tabel Analitic & Raport Detaliat ({filteredAndSortedBots.length} Boți)
            </p>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCsv}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/50 bg-emerald-500/15 px-3.5 py-2 text-xs font-bold text-emerald-300 transition-all hover:bg-emerald-500/25 hover:border-emerald-400 hover:glow-emerald active:scale-95"
            title="Exportă tabelul complet în format CSV (UTF-8 cu BOM pentru Excel)"
          >
            <Download className="h-3.5 w-3.5" />
            <span>EXPORT CSV (EXCEL UTF-8)</span>
          </button>
        </div>

        {/* 3. Filtrare Avansată: Search, Domeniu, Status, Simbol */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {/* Search by Bot Name */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Caută după nume sau activ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
            />
          </div>

          {/* Filter by Domain */}
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs font-semibold text-slate-200 focus:border-cyan-500 focus:outline-none font-sans"
          >
            <option value="ALL">Toate Domeniile (4 Clustere)</option>
            <option value="amteam.live">amteam.live (Forex Majors)</option>
            <option value="amx.today">amx.today (Metals & Volatility)</option>
            <option value="aditrade.online">aditrade.online (Crypto & Exotic)</option>
            <option value="g4trade.online">g4trade.online (Commodities & Macro)</option>
          </select>

          {/* Filter by Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs font-semibold text-slate-200 focus:border-cyan-500 focus:outline-none font-sans"
          >
            <option value="ALL">Toate Statusurile</option>
            <option value="ÎN TRADE">Doar ÎN TRADE</option>
            <option value="SCANNING">Doar SCANNING</option>
            <option value="COOLDOWN">Doar COOLDOWN</option>
            <option value="PAUSED">Doar PAUSED</option>
          </select>

          {/* Filter by Symbol */}
          <select
            value={symbolFilter}
            onChange={(e) => setSymbolFilter(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs font-semibold text-slate-200 focus:border-cyan-500 focus:outline-none font-mono"
          >
            <option value="ALL">Toate Simbolurile</option>
            {uniqueSymbols.map((sym) => (
              <option key={sym} value={sym}>
                {sym}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 1. Coloane Tabel cu 2. Sortare Funcțională & 5. Row Highlighting */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-2xs font-semibold uppercase tracking-normal sm:tracking-wider text-slate-400 select-none">
              {/* Bot Name */}
              <th
                onClick={() => handleSort('name')}
                className="cursor-pointer py-3 px-3 hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Bot Name</span>
                  {renderSortIndicator('name')}
                </div>
              </th>

              {/* Domain */}
              <th
                onClick={() => handleSort('domain')}
                className="cursor-pointer py-3 px-3 hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Domain</span>
                  {renderSortIndicator('domain')}
                </div>
              </th>

              {/* Symbol */}
              <th
                onClick={() => handleSort('asset')}
                className="cursor-pointer py-3 px-3 hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Symbol</span>
                  {renderSortIndicator('asset')}
                </div>
              </th>

              {/* Status */}
              <th
                onClick={() => handleSort('status')}
                className="cursor-pointer py-3 px-3 hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  {renderSortIndicator('status')}
                </div>
              </th>

              {/* Win Rate % */}
              <th
                onClick={() => handleSort('winRate')}
                className="cursor-pointer py-3 px-3 hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Win Rate %</span>
                  {renderSortIndicator('winRate')}
                </div>
              </th>

              {/* Profit Factor */}
              <th
                onClick={() => handleSort('profitFactor')}
                className="cursor-pointer py-3 px-3 hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Profit Factor</span>
                  {renderSortIndicator('profitFactor')}
                </div>
              </th>

              {/* Total Trades */}
              <th
                onClick={() => handleSort('totalTrades')}
                className="cursor-pointer py-3 px-3 hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Total Trades</span>
                  {renderSortIndicator('totalTrades')}
                </div>
              </th>

              {/* Avg Win $ */}
              <th
                onClick={() => handleSort('avgWin')}
                className="cursor-pointer py-3 px-3 hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Avg Win $</span>
                  {renderSortIndicator('avgWin')}
                </div>
              </th>

              {/* Avg Loss $ */}
              <th
                onClick={() => handleSort('avgLoss')}
                className="cursor-pointer py-3 px-3 hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Avg Loss $</span>
                  {renderSortIndicator('avgLoss')}
                </div>
              </th>

              {/* Max Drawdown % */}
              <th
                onClick={() => handleSort('maxDrawdown')}
                className="cursor-pointer py-3 px-3 hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Max Drawdown %</span>
                  {renderSortIndicator('maxDrawdown')}
                </div>
              </th>

              {/* Total Profit $ */}
              <th
                onClick={() => handleSort('totalProfit')}
                className="cursor-pointer py-3 px-3 hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Total Profit $</span>
                  {renderSortIndicator('totalProfit')}
                </div>
              </th>

              {/* Live P/L $ */}
              <th
                onClick={() => handleSort('livePl')}
                className="cursor-pointer py-3 px-3 hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Live P/L $</span>
                  {renderSortIndicator('livePl')}
                </div>
              </th>

              {/* Last Trade */}
              <th
                onClick={() => handleSort('lastTrade')}
                className="cursor-pointer py-3 px-3 hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Last Trade</span>
                  {renderSortIndicator('lastTrade')}
                </div>
              </th>

              {/* Acțiuni */}
              <th className="py-3 px-3 text-right">Comandă</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredAndSortedBots.map((bot) => {
              const isPnlPositive = bot.livePl > 0;
              const isPnlNegative = bot.livePl < 0;
              // 5. Bots cu drawdown > 10% (sau prag ridicat >= 5.0%) au row background roșu subtil
              const isHighDrawdown = bot.maxDrawdown >= 5.0 || bot.maxDrawdown > 10.0;
              const lastTradeTime = getLastTradeTimestamp(bot);

              return (
                <tr
                  key={bot.id}
                  onClick={() => onAnalyze(bot)}
                  className={`cursor-pointer transition-colors group ${
                    isHighDrawdown
                      ? 'bg-rose-950/25 border-l-2 border-rose-500 hover:bg-rose-900/35'
                      : bot.isGoldenRatioMaster
                      ? 'bg-amber-500/5 hover:bg-amber-500/10'
                      : 'hover:bg-slate-800/50'
                  }`}
                  title="Click pe rând pentru a deschide analiza detaliată a botului"
                >
                  {/* Bot Name (cu badge SERGIU φ dacă e cazul) */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      {bot.isGoldenRatioMaster ? (
                        <div
                          className="flex h-5 w-5 items-center justify-center rounded bg-amber-400/20 text-yellow-300 ring-1 ring-amber-400/50 shadow"
                          title="SERGIU - Golden Ratio Master (φ = 1.618)"
                        >
                          <span className="font-serif font-extrabold text-xs">φ</span>
                        </div>
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-400 transition-colors" />
                      )}

                      <div className="flex flex-col">
                        <span
                          className={`font-bold font-sans ${
                            bot.isGoldenRatioMaster ? 'text-yellow-300' : 'text-slate-100'
                          }`}
                        >
                          {bot.name}
                        </span>
                        {bot.isGoldenRatioMaster && (
                          <span className="text-2xs font-mono text-yellow-400/80">
                            GOLDEN RATIO MASTER
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Domain */}
                  <td className="py-3 px-3 font-sans text-slate-400">
                    <a
                      href={`https://${bot.domain}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="hover:text-cyan-400 inline-flex items-center gap-1 transition-colors"
                      title={`Deschide https://${bot.domain}`}
                    >
                      <span>{bot.domain}</span>
                      <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                    </a>
                  </td>

                  {/* Symbol */}
                  <td className="py-3 px-3">
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-2xs font-bold text-slate-200">
                      {bot.asset}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3">{renderStatusBadge(bot.status)}</td>

                  {/* Win Rate % */}
                  <td className="py-3 px-3">
                    <span
                      className={`font-bold ${
                        bot.winRate >= 80 ? 'text-emerald-400' : 'text-slate-200'
                      }`}
                    >
                      {bot.winRate}%
                    </span>
                  </td>

                  {/* Profit Factor */}
                  <td className="py-3 px-3">
                    <span className="font-bold text-cyan-300">{bot.profitFactor}</span>
                  </td>

                  {/* Total Trades */}
                  <td className="py-3 px-3 text-slate-300">{bot.totalTrades}</td>

                  {/* Avg Win $ */}
                  <td className="py-3 px-3 text-emerald-400 font-medium">
                    +${bot.avgWin}
                  </td>

                  {/* Avg Loss $ */}
                  <td className="py-3 px-3 text-rose-400 font-medium">
                    -${bot.avgLoss}
                  </td>

                  {/* Max Drawdown % */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1">
                      {isHighDrawdown && <AlertTriangle className="h-3 w-3 text-rose-400 shrink-0" />}
                      <span className={`font-bold ${isHighDrawdown ? 'text-rose-400' : 'text-slate-300'}`}>
                        {bot.maxDrawdown}%
                      </span>
                    </div>
                  </td>

                  {/* Total Profit $ */}
                  <td className="py-3 px-3">
                    <span className="font-bold text-emerald-400">
                      +${bot.totalProfit.toLocaleString()}
                    </span>
                  </td>

                  {/* Live P/L $ (colorat verde/roșu) */}
                  <td className="py-3 px-3">
                    <span
                      className={`font-bold ${
                        isPnlPositive
                          ? 'text-emerald-400'
                          : isPnlNegative
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {isPnlPositive ? '+' : ''}${bot.livePl.toFixed(2)}
                    </span>
                  </td>

                  {/* Last Trade (timestamp) */}
                  <td className="py-3 px-3 text-slate-400 text-[11px]">
                    {lastTradeTime}
                  </td>

                  {/* Acțiuni (Pause / Resume) cu stopPropagation */}
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStatus(bot.id);
                      }}
                      className={`rounded-lg border px-2 py-1 text-[11px] font-bold transition-all ${
                        bot.status === 'PAUSED'
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                          : 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                      }`}
                      title={bot.status === 'PAUSED' ? 'Pornește botul' : 'Pauzează botul'}
                    >
                      {bot.status === 'PAUSED' ? (
                        <div className="flex items-center gap-1">
                          <Play className="h-3 w-3 fill-current" />
                          <span className="hidden sm:inline">START</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Pause className="h-3 w-3 fill-current" />
                          <span className="hidden sm:inline">PAUSE</span>
                        </div>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredAndSortedBots.length === 0 && (
          <div className="py-8 text-center text-xs text-slate-500 font-sans">
            Niciun bot nu corespunde filtrelor selectate.
          </div>
        )}
      </div>
    </div>
  );
};

export const MetricsTable = React.memo(MetricsTableComponent);
