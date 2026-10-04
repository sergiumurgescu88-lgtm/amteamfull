import React, { useState } from 'react';
import { AccountData, MarketSentiment, RiskOverview } from '../../types/trading';
import { ConnectionStatus } from '../../hooks/useWebSocket';
import {
  ShieldAlert,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Zap,
  Radio,
  TrendingUp,
  Layers,
  ArrowUpRight,
  Menu,
  X,
  Activity,
  AlertTriangle,
} from 'lucide-react';

interface HeaderProps {
  account: AccountData;
  connectionStatus: ConnectionStatus;
  retryAttempt?: number;
  currentDomain?: string;
  sentiment: MarketSentiment;
  risk: RiskOverview;
  isDark: boolean;
  onToggleDarkMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenQuickTrade: () => void;
  onTriggerKillSwitchPrompt: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  account,
  connectionStatus,
  retryAttempt = 0,
  currentDomain,
  sentiment,
  risk,
  isDark,
  onToggleDarkMode,
  soundEnabled,
  onToggleSound,
  onOpenQuickTrade,
  onTriggerKillSwitchPrompt,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isPnlPositive = account.dailyPnl >= 0;

  // Formatare valută USD
  const formatUsd = (num: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(num);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl transition-colors">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Brand / Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-600 p-[1.5px] shadow-lg shadow-emerald-500/15">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
                <Layers className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-slate-100 sm:text-xl leading-heading">
                  AM TEAM <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">TRINITY</span>
                </h1>
                <span className="hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-2xs font-semibold text-emerald-300 sm:inline-block">
                  FLEET v4.2
                </span>
              </div>
              <p className="hidden sm:block text-2xs font-medium text-slate-400 tracking-normal sm:tracking-wider leading-body">
                20 Algorithmic Bots Across 4 Master Domains
              </p>
            </div>
          </div>

          {/* 1. Live Equity - Vizibil întotdeauna pe Mobile & Desktop (Sticky Top) */}
          <div className="flex items-center gap-2 sm:gap-6">
            <div className="flex items-center gap-2 sm:gap-3 rounded-xl border border-slate-800/90 bg-slate-900/80 px-2.5 py-1.5 sm:px-4 sm:py-2 shadow-inner">
              <div className="flex flex-col">
                <span className="text-2xs font-semibold uppercase tracking-normal sm:tracking-wider text-slate-400">
                  Live Equity
                </span>
                <div className="flex items-baseline gap-1.5 sm:gap-2">
                  <span className="font-mono text-sm sm:text-xl font-bold tracking-tight text-slate-100">
                    {formatUsd(account.equity)}
                  </span>
                  <span
                    className={`inline-flex items-center font-mono text-2xs sm:text-xs font-semibold ${
                      isPnlPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    <ArrowUpRight className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${isPnlPositive ? '' : 'rotate-90'}`} />
                    {isPnlPositive ? '+' : ''}
                    {account.dailyPnlPct}%
                  </span>
                </div>
              </div>

              {/* Balanță & P/L pe Desktop */}
              <div className="hidden lg:flex flex-col text-right border-l border-slate-800 pl-3">
                <span className="text-2xs font-medium text-slate-400">Bal: {formatUsd(account.balance)}</span>
                <span className="text-2xs font-mono text-emerald-400/90 font-medium">
                  P/L: {isPnlPositive ? '+' : ''}{formatUsd(account.dailyPnl)}
                </span>
              </div>
            </div>

            {/* Desktop Only: Market Sentiment & Risk Score */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="flex flex-col rounded-lg border border-slate-800 bg-slate-900/40 px-2.5 py-1.5 text-center">
                <span className="text-2xs font-semibold uppercase tracking-normal sm:tracking-wider text-slate-400">VIX Volatility</span>
                <span className="font-mono text-xs font-bold text-cyan-300">{sentiment.vix} • {sentiment.label}</span>
              </div>
              <div className="flex flex-col rounded-lg border border-slate-800 bg-slate-900/40 px-2.5 py-1.5 text-center">
                <span className="text-2xs font-semibold uppercase tracking-normal sm:tracking-wider text-slate-400">Risk Level</span>
                <span
                  className={`font-mono text-xs font-bold ${
                    risk.riskScore === 'OPTIMAL' || risk.riskScore === 'LOW' ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {risk.riskScore} ({risk.totalExposure}%)
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Right actions: Status, Sound, Quick Trade, Kill Switch, Theme */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* WebSocket Status Indicator */}
            <div
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold backdrop-blur-sm ${
                connectionStatus === 'CONNECTED'
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                  : connectionStatus === 'SIMULATED'
                  ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
                  : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
              }`}
            >
              <Radio className="h-3.5 w-3.5 animate-pulse" />
              <span className="font-mono">
                {connectionStatus === 'CONNECTED'
                  ? `WS LIVE (${currentDomain || 'amteam.live'})`
                  : connectionStatus === 'SIMULATED'
                  ? `SIMULATOR (2s)`
                  : `RETRY #${retryAttempt}`}
              </span>
            </div>

            {/* Quick Trade Button */}
            <button
              onClick={onOpenQuickTrade}
              className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3.5 py-2 text-xs font-bold text-emerald-300 transition-all hover:bg-emerald-500/25 hover:border-emerald-400 active:scale-95"
            >
              <Zap className="h-4 w-4 text-emerald-400" />
              <span>QUICK TRADE</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border p-2.5 transition-colors ${
                soundEnabled
                  ? 'border-slate-700 bg-slate-900 text-cyan-400 hover:border-cyan-500/50'
                  : 'border-slate-800 bg-slate-900/50 text-slate-500 hover:text-slate-400'
              }`}
              title={soundEnabled ? 'Alerte audio active' : 'Alerte audio oprite'}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 p-2.5 text-slate-300 transition-colors hover:border-slate-700 hover:text-slate-100"
              title={isDark ? 'Comută mod luminos' : 'Comută mod întunecat'}
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-400" />}
            </button>

            {/* EMERGENCY KILL SWITCH */}
            <button
              onClick={onTriggerKillSwitchPrompt}
              className="group relative flex min-h-[44px] items-center gap-1.5 overflow-hidden rounded-xl border border-rose-500/70 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 px-3.5 py-2 text-xs font-extrabold text-white shadow-lg shadow-rose-600/30 transition-all hover:brightness-110 active:scale-95"
            >
              <ShieldAlert className="h-4 w-4 animate-bounce" />
              <span className="tracking-normal sm:tracking-wider">KILL SWITCH</span>
            </button>
          </div>

          {/* 1. Mobile Hamburger Menu Button (min 44x44px touch target) */}
          <div className="flex sm:hidden items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-slate-200 transition-colors hover:bg-slate-800 active:scale-95"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6 text-rose-400" /> : <Menu className="h-6 w-6 text-cyan-400" />}
            </button>
          </div>
        </div>

        {/* 1. Mobile Drawer Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-800/90 bg-slate-950 p-4 space-y-4 animate-in slide-in-from-top-2 duration-200 shadow-2xl">
            {/* Account Info Details */}
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-2xs">BALANȚĂ CONT</span>
                <span className="font-bold text-slate-200 text-sm">{formatUsd(account.balance)}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-2xs">P/L ZI CURENTĂ</span>
                <span className={`font-bold text-sm ${isPnlPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPnlPositive ? '+' : ''}{formatUsd(account.dailyPnl)}
                </span>
              </div>
            </div>

            {/* VIX & Risk Indicators */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-2.5 flex items-center justify-between">
                <span className="text-slate-400 text-2xs">VIX VOLATILITATE:</span>
                <span className="font-bold text-cyan-300">{sentiment.vix}</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-2.5 flex items-center justify-between">
                <span className="text-slate-400 text-2xs">RISK FLEET:</span>
                <span className={`font-bold ${risk.riskScore === 'OPTIMAL' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {risk.riskScore}
                </span>
              </div>
            </div>

            {/* Quick Actions List (Toate butoanele min 44x44px) */}
            <div className="space-y-3 pt-1">
              {/* Quick Trade in Mobile Menu */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenQuickTrade();
                }}
                className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-500/20 py-3 text-sm font-bold text-emerald-300 active:scale-95 transition-all shadow-md"
              >
                <Zap className="h-5 w-5 text-emerald-400" />
                <span>LANSARE QUICK TRADE</span>
              </button>

              {/* Emergency Kill in Mobile Menu */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onTriggerKillSwitchPrompt();
                }}
                className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl border border-rose-500/60 bg-gradient-to-r from-rose-600 to-red-600 py-3 text-sm font-extrabold text-white active:scale-95 transition-all shadow-lg shadow-rose-600/30"
              >
                <ShieldAlert className="h-5 w-5 animate-pulse" />
                <span>EMERGENCY KILL SWITCH</span>
              </button>

              {/* Secondary Controls: Sound & Theme toggles */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={onToggleSound}
                  className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2.5 text-xs font-semibold text-slate-300"
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4 text-cyan-400" /> : <VolumeX className="h-4 w-4 text-slate-500" />}
                  <span>{soundEnabled ? 'Alerte Active' : 'Alerte Oprite'}</span>
                </button>

                <button
                  onClick={onToggleDarkMode}
                  className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2.5 text-xs font-semibold text-slate-300"
                >
                  {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-400" />}
                  <span>{isDark ? 'Mod Luminos' : 'Mod Dark'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 1. Quick Trade Floating Action Button (FAB) pe Mobile (< sm) */}
      <button
        onClick={onOpenQuickTrade}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 sm:hidden items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 shadow-2xl shadow-emerald-500/50 ring-2 ring-emerald-300/40 active:scale-90 transition-transform"
        aria-label="Quick Trade FAB"
        title="Lansare Quick Trade"
      >
        <Zap className="h-6 w-6 fill-current text-slate-950" />
      </button>
    </>
  );
};
