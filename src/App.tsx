import React, { useState, useCallback, useMemo, useRef } from 'react';
import { useDarkMode } from './hooks/useDarkMode';
import { useSoundAlert } from './hooks/useSoundAlert';
import { useWebSocket } from './hooks/useWebSocket';
import { BotData, DomainId, ToastNotification, DomainSummary } from './types/trading';

// Components
import { Header } from './components/Common/Header';
import { Footer } from './components/Common/Footer';
import { ToastContainer } from './components/Common/ToastContainer';
import { CommandCenter } from './components/Dashboard/CommandCenter';
import { BotCard } from './components/Dashboard/BotCard';
import { DomainGroup } from './components/Dashboard/DomainGroup';
import { PerformanceChart } from './components/Dashboard/PerformanceChart';
import { MetricsTable } from './components/Dashboard/MetricsTable';
import { DeepResearchInsights } from './components/Dashboard/DeepResearchInsights';
import { ExecutionLogs } from './components/Dashboard/ExecutionLogs';

// Modals
import { BotAnalysisModal } from './components/Modals/BotAnalysisModal';
import { QuickTradeModal } from './components/Modals/QuickTradeModal';
import { BotSettingsModal } from './components/Modals/BotSettingsModal';
import { EmergencyKillModal } from './components/Modals/EmergencyKillModal';

import {
  Layers,
  LayoutGrid,
  ListFilter,
  Sparkles,
  BarChart3,
  Terminal,
  BookOpen,
  Zap,
} from 'lucide-react';

export default function App() {
  // 1. Adaugă useRef pentru container-ul principal
  const mainContainerRef = useRef<HTMLElement>(null);

  // 2. Previne auto-scroll pe logs: state dedicat pentru auto-scroll
  const [autoScroll, setAutoScroll] = useState<boolean>(true);

  const { isDark, toggleDarkMode } = useDarkMode();
  const {
    soundEnabled,
    toggleSound,
    playTradeSound,
    playAlertSound,
    playClickSound,
    playKillSwitchSound,
  } = useSoundAlert();

  // Toast notifications state (3. Notificările sunt fixed position top-24 right-10, fără window.scrollTo)
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = useCallback(
    (type: ToastNotification['type'], title: string, message: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, type, title, message, timestamp: Date.now() }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // WebSocket custom hook with live simulated fallback
  const {
    status: connectionStatus,
    retryAttempt,
    currentDomain,
    bots,
    account,
    equityHistory,
    domains,
    sentiment,
    risk,
    logs,
    toggleBotStatus,
    updateBotSettings,
    sendManualTrade,
    triggerEmergencyKill,
    clearLogs,
  } = useWebSocket({
    onNewToast: addToast,
    onTradeSound: playTradeSound,
    onAlertSound: playAlertSound,
    onKillSound: playKillSwitchSound,
  });

  // Modals state
  const [analyzingBot, setAnalyzingBot] = useState<BotData | null>(null);
  const [settingsBot, setSettingsBot] = useState<BotData | null>(null);
  const [isQuickTradeOpen, setIsQuickTradeOpen] = useState(false);
  const [isEmergencyKillOpen, setIsEmergencyKillOpen] = useState(false);

  // Filter & Layout state
  const [domainFilter, setDomainFilter] = useState<DomainId | 'ALL' | 'SERGIU'>('ALL');
  const [viewLayout, setViewLayout] = useState<'GRID' | 'GROUPED'>('GRID');
  const [activeTab, setActiveTab] = useState<'COMMAND' | 'BOTS' | 'PERFORMANCE' | 'RESEARCH' | 'LOGS'>('COMMAND');

  // 4. Wrap bot updates în useCallback pentru a preveni re-render-uri inutile
  const handleAnalyzeBot = useCallback(
    (bot: BotData) => {
      playClickSound();
      setAnalyzingBot(bot);
    },
    [playClickSound]
  );

  const handleOpenSettings = useCallback(
    (bot: BotData) => {
      playClickSound();
      setSettingsBot(bot);
    },
    [playClickSound]
  );

  const handleCloseAnalyze = useCallback(() => {
    setAnalyzingBot(null);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setSettingsBot(null);
  }, []);

  const handleCloseQuickTrade = useCallback(() => {
    setIsQuickTradeOpen(false);
  }, []);

  const handleCloseEmergencyKill = useCallback(() => {
    setIsEmergencyKillOpen(false);
  }, []);

  const handleSelectDomainFilter = useCallback(
    (filter: DomainId | 'ALL' | 'SERGIU') => {
      playClickSound();
      setDomainFilter(filter);
      if (filter !== 'ALL') {
        setActiveTab('BOTS');
      }
    },
    [playClickSound]
  );

  // Filtrare boți
  const visibleBots = useMemo(() => {
    if (domainFilter === 'SERGIU') {
      return bots.filter((b) => b.isGoldenRatioMaster);
    }
    if (domainFilter === 'ALL') {
      return bots;
    }
    return bots.filter((b) => b.domain === domainFilter);
  }, [bots, domainFilter]);

  // Handler toggle status pentru toți boții dintr-un domeniu
  const handleToggleDomainAll = useCallback(
    (domainId: DomainSummary['id']) => {
      playClickSound();
      const domainBots = bots.filter((b) => b.domain === domainId);
      const allPaused = domainBots.every((b) => b.status === 'PAUSED');

      domainBots.forEach((b) => {
        if (allPaused && b.status === 'PAUSED') {
          toggleBotStatus(b.id);
        } else if (!allPaused && b.status !== 'PAUSED') {
          toggleBotStatus(b.id);
        }
      });

      addToast(
        'info',
        domainId,
        allPaused
          ? `Toți cei 5 boți din clusterul ${domainId} au fost porniți.`
          : `Toți cei 5 boți din clusterul ${domainId} au fost puși pe pauză.`
      );
    },
    [bots, toggleBotStatus, addToast, playClickSound]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-black">
      {/* 3. Toast Notification Container (fixed position top-24 right-10) */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <Header
        account={account}
        connectionStatus={connectionStatus}
        retryAttempt={retryAttempt}
        currentDomain={currentDomain}
        sentiment={sentiment}
        risk={risk}
        isDark={isDark}
        onToggleDarkMode={() => {
          playClickSound();
          toggleDarkMode();
        }}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          playClickSound();
          toggleSound();
        }}
        onOpenQuickTrade={() => {
          playClickSound();
          setIsQuickTradeOpen(true);
        }}
        onTriggerKillSwitchPrompt={() => {
          playAlertSound();
          setIsEmergencyKillOpen(true);
        }}
      />

      {/* 1. Main Container cu mainContainerRef */}
      <main ref={mainContainerRef} className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-10">
        {/* Navigation Quick Strip */}
        <div className="flex items-center justify-between overflow-x-auto pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            {[
              { id: 'COMMAND', label: 'Command Center', icon: Layers },
              { id: 'BOTS', label: 'All 20 Bots', icon: LayoutGrid },
              { id: 'PERFORMANCE', label: 'Performance & Ledger', icon: BarChart3 },
              { id: 'RESEARCH', label: 'Deep Research Playbooks', icon: BookOpen },
              { id: 'LOGS', label: 'Live Logs', icon: Terminal },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    playClickSound();
                    setActiveTab(tab.id as typeof activeTab);
                  }}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shrink-0 ${
                    isActive
                      ? 'border border-cyan-500/40 bg-cyan-500/15 text-cyan-300 shadow-md shadow-cyan-500/10 glow-cyan'
                      : 'border border-transparent text-slate-400 hover:border-slate-800 hover:bg-slate-900/60 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-slate-400">
            <span className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/50 px-2.5 py-1">
              <span className="font-serif font-extrabold text-yellow-400">φ</span>
              <span>4 Golden Ratio Masters</span>
            </span>
          </div>
        </div>

        {/* SECTION A: COMMAND CENTER (Top 4 Domain Cards) */}
        <section id="command-center" className="scroll-mt-24">
          <CommandCenter
            domains={domains}
            selectedDomainFilter={domainFilter}
            onSelectDomainFilter={handleSelectDomainFilter}
          />
        </section>

        {/* SECTION B: ALL 20 BOTS (Grid principal) */}
        <section id="all-bots" className="scroll-mt-24 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-cyan-400" />
                <h2 className="text-sm font-semibold uppercase tracking-normal sm:tracking-wider text-slate-400">
                  Algorithmic Fleet Grid
                </h2>
              </div>
              <h3 className="text-xl font-extrabold text-slate-100 tracking-tight sm:text-2xl leading-tight">
                All 20 Autonomous Bots ({visibleBots.length} afișați)
              </h3>
            </div>

            {/* Layout switch & Filter presets */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Layout toggle (Grid vs Grouped by domain) */}
              <div className="flex rounded-xl border border-slate-800 bg-slate-900/70 p-1">
                <button
                  onClick={() => {
                    playClickSound();
                    setViewLayout('GRID');
                  }}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    viewLayout === 'GRID'
                      ? 'bg-slate-100 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Afișează toți cei 20 de boți în format Grid compact"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span>Grid 20</span>
                </button>

                <button
                  onClick={() => {
                    playClickSound();
                    setViewLayout('GROUPED');
                  }}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    viewLayout === 'GROUPED'
                      ? 'bg-slate-100 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Afișează boții grupați pe cele 4 domenii"
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Grupat pe Domenii</span>
                </button>
              </div>

              {/* Filter by Golden Ratio Master */}
              <button
                onClick={() => {
                  playClickSound();
                  setDomainFilter(domainFilter === 'SERGIU' ? 'ALL' : 'SERGIU');
                }}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                  domainFilter === 'SERGIU'
                    ? 'border-yellow-400/80 bg-gradient-to-r from-amber-500/25 to-yellow-500/30 text-yellow-300 glow-gold'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-yellow-300'
                }`}
              >
                <span className="font-serif font-extrabold text-yellow-400">φ</span>
                <span>Doar SERGIU (4)</span>
              </button>
            </div>
          </div>

          {/* Render Bot Cards: Either as Flat Grid or Grouped */}
          {viewLayout === 'GROUPED' && domainFilter === 'ALL' ? (
            <div className="space-y-6">
              {domains.map((dom) => {
                const domainBots = bots.filter((b) => b.domain === dom.id);
                return (
                  <DomainGroup
                    key={dom.id}
                    domain={dom}
                    bots={domainBots}
                    onAnalyze={handleAnalyzeBot}
                    onToggleStatus={toggleBotStatus}
                    onOpenSettings={handleOpenSettings}
                    onToggleDomainAll={handleToggleDomainAll}
                  />
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {visibleBots.map((bot) => (
                <BotCard
                  key={bot.id}
                  bot={bot}
                  onAnalyze={handleAnalyzeBot}
                  onToggleStatus={toggleBotStatus}
                  onOpenSettings={handleOpenSettings}
                />
              ))}
            </div>
          )}
        </section>

        {/* SECTION C: PERFORMANCE OVERVIEW (Area Chart & 20-Bot Ledger) */}
        <section id="performance" className="scroll-mt-24 space-y-6">
          {/* 3. Lazy loading Recharts: render only when tab is active */}
          {(activeTab === 'COMMAND' || activeTab === 'PERFORMANCE') && (
            <PerformanceChart equityHistory={equityHistory} />
          )}
          <MetricsTable
            bots={bots}
            onAnalyze={handleAnalyzeBot}
            onToggleStatus={toggleBotStatus}
          />
        </section>

        {/* SECTION D: DEEP RESEARCH INSIGHTS */}
        <section id="research" className="scroll-mt-24">
          <DeepResearchInsights domains={domains} />
        </section>

        {/* SECTION E: LIVE EXECUTION LOGS (Terminal Viewer cu 2. autoScroll control) */}
        <section id="logs" className="scroll-mt-24">
          <ExecutionLogs
            logs={logs}
            onClearLogs={clearLogs}
            autoScroll={autoScroll}
            onAutoScrollChange={setAutoScroll}
          />
        </section>
      </main>

      {/* Footer */}
      <Footer domains={domains} />

      {/* 3. Lazy loading Modale: mount only when opened */}
      {analyzingBot && (
        <BotAnalysisModal
          bot={analyzingBot}
          onClose={handleCloseAnalyze}
          onToggleStatus={toggleBotStatus}
        />
      )}

      {isQuickTradeOpen && (
        <QuickTradeModal
          isOpen={isQuickTradeOpen}
          onClose={handleCloseQuickTrade}
          onExecuteTrade={sendManualTrade}
        />
      )}

      {settingsBot && (
        <BotSettingsModal
          bot={settingsBot}
          isOpen={!!settingsBot}
          onClose={handleCloseSettings}
          onSaveSettings={updateBotSettings}
        />
      )}

      {isEmergencyKillOpen && (
        <EmergencyKillModal
          isOpen={isEmergencyKillOpen}
          onClose={handleCloseEmergencyKill}
          onConfirmKill={triggerEmergencyKill}
        />
      )}
    </div>
  );
}
