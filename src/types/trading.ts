/**
 * Tipuri de date pentru platforma AM Team Trinity
 * Definire completă a structurilor de date pentru cei 20 de boți algoritmici,
 * metrici, loguri, WebSocket și comenzi de tranzacționare.
 */

export type DomainId = 'amteam.live' | 'amx.today' | 'aditrade.online' | 'g4trade.online';

export type BotStatus = 'SCANNING' | 'ÎN TRADE' | 'COOLDOWN' | 'PAUSED';

export type BiasType = 'BUY' | 'SELL' | 'NEUTRAL';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'TRADE';

export interface BotSettings {
  maxDrawdownPct: number;
  lossThresholdUsd: number;
  autoPauseEnabled: boolean;
  maxLotSize: number;
}

export interface BotData {
  id: string;
  name: string;
  domain: DomainId;
  asset: string;
  status: BotStatus;
  adx: number;
  whaleIntensity: number; // 0 - 100%
  lotSize: number;
  bias: BiasType;
  livePl: number;
  isGoldenRatioMaster: boolean; // Botul #3 "SERGIU" din fiecare domeniu
  
  // Statistici de performanță pe 30 de zile
  winRate: number; // e.g. 74.2%
  profitFactor: number; // e.g. 2.45
  avgWin: number;
  avgLoss: number;
  totalTrades: number;
  maxDrawdown: number; // e.g. 4.8%
  avgTradeTime: string; // e.g. "45m"
  sharpeRatio: number; // e.g. 2.18
  totalProfit: number;
  
  // Detalii strategie Deep Research
  strategyName: string;
  strategyDescription: string;
  technicalParameters: {
    adxThreshold: number;
    whaleThreshold: number;
    fibonacciLevels: string[];
    timeframe: string;
    stopLossPips: number;
    takeProfitRatio: string;
  };
  entryRules: string[];
  exitRules: string[];
  
  // Istoric recent de P/L pentru grafic individual
  historyPl: { date: string; pl: number; cumulative: number }[];
  
  // Setări personalizabile salvate în localStorage
  settings: BotSettings;
}

export interface EquityHistoryPoint {
  timestamp: string;
  equity: number;
  drawdown: number;
  sp500?: number;
  gold?: number;
  bestTrade?: { symbol: string; profit: number };
  worstTrade?: { symbol: string; loss: number };
  dailyGain?: number;
}

export interface DomainSummary {
  id: DomainId;
  name: string;
  niche: string;
  assets: string[];
  activeBotsCount: number;
  totalBotsCount: number;
  totalProfit: number;
  dailyChangePct: number;
  url: string;
  sparkline24h: { time: string; value: number }[];
  description: string;
  deepResearchStrategy: {
    title: string;
    description: string;
    keyParameters: string[];
    engagementRules: string[];
    criticalAdaptations: string[];
  };
}

export interface LogEntry {
  id: string;
  timestamp: string;
  botId: string;
  botName: string;
  level: LogLevel;
  message: string;
  domain: DomainId;
}

export interface AccountData {
  equity: number;
  balance: number;
  currency: string;
  dailyPnl: number;
  dailyPnlPct: number;
  marginUsed: number;
  freeMargin: number;
  marginLevel: number;
}

export interface MarketSentiment {
  vix: number;
  label: 'EXTREME FEAR' | 'FEAR' | 'NEUTRAL' | 'GREED' | 'EXTREME GREED';
  marketStatus: 'OPEN' | 'HIGH VOLATILITY' | 'SESSION OVERLAP';
}

export interface RiskOverview {
  riskScore: 'LOW' | 'OPTIMAL' | 'ELEVATED' | 'CRITICAL';
  totalExposure: number;
  openPositionsCount: number;
  var95: number; // Value at Risk 95%
}

export interface TradeOrderPayload {
  type: 'MANUAL_TRADE';
  side: 'BUY' | 'SELL';
  symbol: string;
  lot: number;
  sl?: number;
  tp?: number;
}

export interface BotCommandPayload {
  type: 'BOT_COMMAND';
  botId: string;
  command: 'PAUSE' | 'RESUME' | 'CLOSE_POSITIONS';
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
}
