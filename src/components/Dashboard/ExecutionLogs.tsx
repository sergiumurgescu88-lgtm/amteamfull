import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { LogEntry, LogLevel } from '../../types/trading';
import {
  Terminal,
  Zap,
  Info,
  AlertTriangle,
  AlertCircle,
  Search,
  ArrowDown,
  Trash2,
  Copy,
  Check,
  X,
  Play,
  Pause,
  ExternalLink,
  ShieldAlert,
  Archive,
} from 'lucide-react';

interface ExecutionLogsProps {
  logs: LogEntry[];
  onClearLogs?: () => void;
  autoScroll?: boolean;
  onAutoScrollChange?: (val: boolean) => void;
}

// 4. Color coding îmbunătățit cu iconițe specifice
const renderLevelBadge = (level: LogLevel) => {
  switch (level) {
    case 'TRADE':
      return (
        <span className="inline-flex items-center gap-1 rounded border border-emerald-500/50 bg-emerald-500/15 px-1.5 py-0.5 text-2xs font-semibold text-emerald-400">
          <Zap className="h-2.5 w-2.5" />
          TRADE
        </span>
      );
    case 'WARN':
      return (
        <span className="inline-flex items-center gap-1 rounded border border-amber-500/50 bg-amber-500/15 px-1.5 py-0.5 text-2xs font-semibold text-amber-300">
          <AlertTriangle className="h-2.5 w-2.5" />
          WARN
        </span>
      );
    case 'ERROR':
      return (
        <span className="inline-flex items-center gap-1 rounded border border-rose-500/50 bg-rose-500/20 px-1.5 py-0.5 text-2xs font-semibold text-rose-400">
          <AlertCircle className="h-2.5 w-2.5" />
          ERROR
        </span>
      );
    case 'INFO':
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-2xs font-semibold text-slate-300">
          <Info className="h-2.5 w-2.5" />
          INFO
        </span>
      );
  }
};

const getMessageColor = (level: LogLevel) => {
  switch (level) {
    case 'TRADE':
      return 'text-emerald-300 font-semibold';
    case 'WARN':
      return 'text-amber-300';
    case 'ERROR':
      return 'text-rose-300 font-bold';
    case 'INFO':
    default:
      return 'text-slate-300';
  }
};

// 1. Memoizare: Wrap LogLine în React.memo
interface LogLineProps {
  log: LogEntry;
  onSelect: (log: LogEntry) => void;
}

const LogLineComponent: React.FC<LogLineProps> = ({ log, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(log)}
      className="flex items-start gap-2 rounded px-2 py-1 transition-colors hover:bg-slate-900/90 cursor-pointer group"
      title="Click pentru detalii complete & stack trace"
      style={{ minHeight: '28px' }}
    >
      {/* Timestamp */}
      <span className="text-slate-500 shrink-0 font-medium text-2xs mt-0.5">
        [{log.timestamp}]
      </span>

      {/* Level Badge cu Iconiță */}
      <div className="shrink-0 mt-0.5">
        {renderLevelBadge(log.level)}
      </div>

      {/* Bot ID & Domain */}
      <span className="rounded bg-slate-900 px-1.5 py-0.5 text-2xs font-semibold text-slate-300 border border-slate-800 shrink-0">
        {log.botName || log.botId}
      </span>

      {/* Message */}
      <span className={`break-words text-xs flex-1 ${getMessageColor(log.level)}`}>
        {log.message}
      </span>
    </div>
  );
};

export const LogLine = React.memo(LogLineComponent);

export const ExecutionLogs: React.FC<ExecutionLogsProps> = ({
  logs,
  onClearLogs,
  autoScroll: externalAutoScroll,
  onAutoScrollChange,
}) => {
  // 2. Filtrare funcțională
  const [filterLevel, setFilterLevel] = useState<LogLevel | 'ALL'>('ALL');
  const [filterDomain, setFilterDomain] = useState<string>('ALL');
  const [filterBot, setFilterBot] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // 3. Auto-scroll control (suport atât extern cât și intern)
  const [internalAutoScroll, setInternalAutoScroll] = useState<boolean>(true);
  const autoScroll = externalAutoScroll !== undefined ? externalAutoScroll : internalAutoScroll;
  const setAutoScroll = (val: boolean) => {
    setInternalAutoScroll(val);
    onAutoScrollChange?.(val);
  };
  const [isScrolledUp, setIsScrolledUp] = useState<boolean>(false);

  // 4. Virtualizare logs: state pentru scroll position
  const [scrollTop, setScrollTop] = useState<number>(0);
  const ITEM_HEIGHT = 32;
  const VISIBLE_COUNT = 25;

  // 5. Modal detalii log selectat
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // 6. Confirmare Clear logs
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState<boolean>(false);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);

  // Logs locale pentru cazul în care componenta gestionează curățarea independent
  const [localLogs, setLocalLogs] = useState<LogEntry[]>(logs);

  useEffect(() => {
    setLocalLogs(logs);
  }, [logs]);

  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Extragere boți unici pentru dropdown
  const uniqueBots = useMemo(() => {
    const map = new Map<string, string>();
    localLogs.forEach((l) => {
      map.set(l.botId, l.botName || l.botId);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [localLogs]);

  // Filtrare completă
  const filteredLogs = useMemo(() => {
    return localLogs.filter((log) => {
      const matchesLevel = filterLevel === 'ALL' || log.level === filterLevel;
      const matchesDomain = filterDomain === 'ALL' || log.domain === filterDomain;
      const matchesBot = filterBot === 'ALL' || log.botId === filterBot;
      const matchesSearch =
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.botName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.botId.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesLevel && matchesDomain && matchesBot && matchesSearch;
    });
  }, [localLogs, filterLevel, filterDomain, filterBot, searchTerm]);

  // 4. Virtualizare logs: dacă sunt > 30 logs, randează doar cele 20-30 vizibile
  const totalLogsCount = filteredLogs.length;
  const isVirtual = totalLogsCount > 30;
  const startIndex = isVirtual ? Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - 3) : 0;
  const endIndex = isVirtual ? Math.min(totalLogsCount, startIndex + VISIBLE_COUNT + 6) : totalLogsCount;
  const visibleLogs = isVirtual ? filteredLogs.slice(startIndex, endIndex) : filteredLogs;
  const topSpacerHeight = isVirtual ? startIndex * ITEM_HEIGHT : 0;
  const bottomSpacerHeight = isVirtual ? (totalLogsCount - endIndex) * ITEM_HEIGHT : 0;

  // 3. Auto-scroll la loguri noi: doar dacă autoScroll === true ȘI containerul e la bottom (!isScrolledUp)
  useEffect(() => {
    if (autoScroll && !isScrolledUp && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredLogs, autoScroll, isScrolledUp]);

  // 3. Detectare scroll manual utilizator & update scrollTop pentru virtualizare
  const handleScroll = () => {
    if (!terminalContainerRef.current) return;
    const { scrollTop: currentScroll, scrollHeight, clientHeight } = terminalContainerRef.current;
    setScrollTop(currentScroll);
    const isAtBottom = scrollHeight - currentScroll - clientHeight < 35;

    if (!isAtBottom && autoScroll) {
      setAutoScroll(false);
    }
    setIsScrolledUp(!isAtBottom);
  };

  // Scroll manual la final
  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setAutoScroll(true);
    setIsScrolledUp(false);
  };

  // 5. Copy to Clipboard
  const handleCopyLogDetails = (log: LogEntry) => {
    const payload = JSON.stringify(
      {
        id: log.id,
        timestamp: log.timestamp,
        level: log.level,
        botId: log.botId,
        botName: log.botName,
        domain: log.domain,
        message: log.message,
        systemTrace: log.level === 'ERROR' ? `at TrinityEngine.executeSignal (engine.ts:241)\n at RiskGuardian.checkRiskLimits (risk.ts:88)` : undefined,
      },
      null,
      2
    );

    navigator.clipboard.writeText(payload).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // 6. Clear logs cu confirmare și salvare în localStorage ca backup
  const handleConfirmClear = () => {
    try {
      localStorage.setItem('am_trinity_logs_backup', JSON.stringify(localLogs));
      const backupCount = localLogs.length;
      setBackupMessage(`Au fost arhivate ${backupCount} jurnale în localStorage (am_trinity_logs_backup).`);
      setTimeout(() => setBackupMessage(null), 4000);
    } catch {
      // Ignoră erorile de spațiu localStorage
    }

    setLocalLogs([]);
    if (onClearLogs) {
      onClearLogs();
    }
    setIsConfirmClearOpen(false);
  };

  return (
    <div className="relative rounded-2xl border border-slate-800/90 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-5 shadow-2xl">
      {/* Top Header */}
      <div className="flex flex-col gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-rose-500/80" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-cyan-400" />
                <h3 className="font-mono text-sm font-semibold uppercase tracking-normal sm:tracking-wider text-slate-100">
                  LIVE EXECUTION LOGS • FLEET TERMINAL
                </h3>
              </div>
              <p className="text-2xs text-slate-400 font-mono">
                Flux de mesaje live ({filteredLogs.length} afișate / {localLogs.length} total • Virtualizat: {visibleLogs.length} noduri active)
              </p>
            </div>
          </div>

          {/* Quick Actions: Clear logs & Auto-scroll Toggle */}
          <div className="flex items-center gap-2">
            {/* Auto-scroll toggle */}
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-mono text-xs font-bold transition-all ${
                autoScroll
                  ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-300'
                  : 'border-slate-800 bg-slate-950 text-slate-500 hover:text-slate-300'
              }`}
              title="Comută derularea automată a jurnalului la fiecare log nou"
            >
              {autoScroll ? <Play className="h-3.5 w-3.5 fill-current" /> : <Pause className="h-3.5 w-3.5" />}
              <span>AUTO-SCROLL: {autoScroll ? 'ON' : 'OFF'}</span>
            </button>

            {/* 6. Clear Logs Button */}
            <button
              onClick={() => setIsConfirmClearOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 font-mono text-xs font-semibold text-slate-400 hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
              title="Golește jurnalul curent (creează backup automat în localStorage)"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">CLEAR LOGS</span>
            </button>
          </div>
        </div>

        {/* 2. Filtrare Funcțională: Toggle Buttons + Search + Dropdowns */}
        <div className="flex flex-col gap-2.5 pt-2">
          {/* Level Toggle Buttons (ALL, TRADE, INFO, WARN, ERROR) */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-2xs font-semibold uppercase tracking-normal sm:tracking-wider text-slate-500 mr-1 font-mono">
              LEVEL:
            </span>
            {(['ALL', 'TRADE', 'INFO', 'WARN', 'ERROR'] as const).map((lvl) => {
              const isActive = filterLevel === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => setFilterLevel(lvl)}
                  className={`rounded-lg px-2.5 py-1 font-mono text-xs font-bold transition-all ${
                    isActive
                      ? lvl === 'TRADE'
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : lvl === 'WARN'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : lvl === 'ERROR'
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'border border-slate-800 bg-slate-950/70 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>

          {/* Search Box & Dropdown Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Caută în mesaj..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/90 py-1.5 pl-8 pr-3 font-mono text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Filter by Bot */}
            <select
              value={filterBot}
              onChange={(e) => setFilterBot(e.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-950/90 px-3 py-1.5 font-mono text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
            >
              <option value="ALL">Toți Boții ({uniqueBots.length})</option>
              {uniqueBots.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            {/* Filter by Domain */}
            <select
              value={filterDomain}
              onChange={(e) => setFilterDomain(e.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-950/90 px-3 py-1.5 font-mono text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
            >
              <option value="ALL">Toate Clusterele</option>
              <option value="amteam.live">amteam.live (Forex)</option>
              <option value="amx.today">amx.today (Metals)</option>
              <option value="aditrade.online">aditrade.online (Crypto)</option>
              <option value="g4trade.online">g4trade.online (Macro)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Backup Notification Banner */}
      {backupMessage && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/15 p-2.5 font-mono text-xs text-cyan-300 animate-in fade-in">
          <Archive className="h-4 w-4 shrink-0 text-cyan-400" />
          <span>{backupMessage}</span>
        </div>
      )}

      {/* Terminal Output Area with 4. Virtualizare logs (20-30 max) */}
      <div
        ref={terminalContainerRef}
        onScroll={handleScroll}
        className="relative mt-3 h-80 overflow-y-auto rounded-xl border border-slate-800/90 bg-slate-950 p-3 font-mono text-xs leading-relaxed shadow-inner"
      >
        {filteredLogs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-slate-500 gap-1.5">
            <Info className="h-6 w-6 opacity-40" />
            <p>Niciun eveniment nu corespunde filtrelor aplicate.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Top Virtual Spacer */}
            {topSpacerHeight > 0 && <div style={{ height: `${topSpacerHeight}px` }} />}

            {/* Render doar cele 20-30 logs vizibile cu LogLine memoizat */}
            {visibleLogs.map((log) => (
              <LogLine key={log.id} log={log} onSelect={setSelectedLog} />
            ))}

            {/* Bottom Virtual Spacer */}
            {bottomSpacerHeight > 0 && <div style={{ height: `${bottomSpacerHeight}px` }} />}

            <div ref={terminalEndRef} />
          </div>
        )}

        {/* 3. Buton "Scroll to Bottom" */}
        {isScrolledUp && (
          <button
            onClick={scrollToBottom}
            className="sticky bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 rounded-full border border-cyan-500/50 bg-cyan-500/25 px-3 py-1 text-xs font-bold text-cyan-200 shadow-lg backdrop-blur-md hover:bg-cyan-500/35 transition-all"
          >
            <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
            <span>Scroll to Bottom</span>
          </button>
        )}
      </div>

      {/* Terminal Bottom Status Bar */}
      <div className="mt-2.5 flex items-center justify-between text-2xs font-mono text-slate-500 px-1">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>WebSocket Stream: Connected (Event Listener Active)</span>
        </div>
        <span className="text-slate-500">Trinity Fleet Execution Core v4.2</span>
      </div>

      {/* 5. MODAL DETALII LOG & STACK TRACE */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-cyan-400" />
                <h4 className="font-bold text-slate-100 text-sm">
                  Log Entry Inspector
                </h4>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Log Details Content */}
            <div className="mt-3.5 space-y-2.5">
              <div className="flex items-center justify-between bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400">Timestamp:</span>
                <span className="text-slate-200 font-bold">{selectedLog.timestamp}</span>
              </div>

              <div className="flex items-center justify-between bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400">Level:</span>
                <div>{renderLevelBadge(selectedLog.level)}</div>
              </div>

              <div className="flex items-center justify-between bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400">Bot:</span>
                <span className="text-cyan-300 font-bold">{selectedLog.botName} ({selectedLog.botId})</span>
              </div>

              <div className="flex items-center justify-between bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400">Domain Cluster:</span>
                <span className="text-slate-300">{selectedLog.domain}</span>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Message:</span>
                <p className={`leading-relaxed break-words ${getMessageColor(selectedLog.level)}`}>
                  {selectedLog.message}
                </p>
              </div>

              {/* Stack Trace dacă e eroare */}
              {selectedLog.level === 'ERROR' && (
                <div className="bg-rose-950/30 p-3 rounded-xl border border-rose-500/30">
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold mb-1">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span>Diagnostic Stack Trace:</span>
                  </div>
                  <pre className="text-2xs text-rose-300 leading-tight overflow-x-auto">
                    {`Error: ${selectedLog.message}\n  at TrinityEngine.executeOrder (execution_core.ts:214:15)\n  at RiskGuardian.validateLimits (risk_module.ts:98:12)\n  at WebSocketDispatcher.handleEvent (ws_feed.ts:167:9)`}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={() => handleCopyLogDetails(selectedLog)}
                className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/25 transition-all"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copiat în Clipboard!' : 'Copy to Clipboard'}</span>
              </button>

              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-colors"
              >
                Închide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL CONFIRMARE CLEAR LOGS */}
      {isConfirmClearOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/40 bg-slate-900 p-5 shadow-2xl font-mono text-xs">
            <div className="flex items-center gap-2 text-rose-400 text-sm font-bold border-b border-slate-800 pb-3">
              <AlertTriangle className="h-5 w-5" />
              <span>Confirmare Golire Jurnal</span>
            </div>

            <p className="mt-3 text-slate-300 leading-relaxed font-sans text-xs">
              Sunteți pe cale să goliți toate cele <strong>{localLogs.length}</strong> evenimente din bufferul local.
              Un backup automat va fi salvat în memoria browserului (<em>localStorage</em>).
            </p>

            <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsConfirmClearOpen(false)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Anulează
              </button>

              <button
                onClick={handleConfirmClear}
                className="rounded-xl border border-rose-500 bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition-all active:scale-95"
              >
                Golește & Salvează Backup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
