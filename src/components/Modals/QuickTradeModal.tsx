import React, { useState } from 'react';
import { X, Zap, TrendingUp, TrendingDown, ShieldAlert, DollarSign } from 'lucide-react';

interface QuickTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteTrade: (side: 'BUY' | 'SELL', symbol: string, lot: number, sl?: number, tp?: number) => void;
}

const COMMON_SYMBOLS = [
  'EURUSD',
  'GBPUSD',
  'USDCHF',
  'XAUUSD',
  'US30',
  'NAS100',
  'BTCUSD',
  'ETHUSD',
  'GBPJPY',
  'OIL',
  'XAGUSD',
  'EURJPY',
  'AUDCAD',
];

export const QuickTradeModal: React.FC<QuickTradeModalProps> = ({
  isOpen,
  onClose,
  onExecuteTrade,
}) => {
  const [symbol, setSymbol] = useState('EURUSD');
  const [lot, setLot] = useState('0.50');
  const [slPips, setSlPips] = useState('25');
  const [tpPips, setTpPips] = useState('60');

  if (!isOpen) return null;

  const lotNum = parseFloat(lot) || 0.1;
  const estimatedMargin = lotNum * 1000;

  const handleTrade = (side: 'BUY' | 'SELL') => {
    onExecuteTrade(
      side,
      symbol,
      lotNum,
      parseFloat(slPips) || undefined,
      parseFloat(tpPips) || undefined
    );
    onClose();
  };

  return (
    // 4. Modals Mobile: Full-screen/Bottom-sheet cu slide-up animation
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-md bg-black/80">
      <div className="relative w-full max-w-md h-full sm:h-auto max-h-screen sm:max-h-[92vh] rounded-t-3xl sm:rounded-3xl border border-slate-700/80 bg-slate-900 p-6 shadow-2xl text-slate-100 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-bottom duration-300">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-mono text-base font-bold text-white">
                  QUICK TRADE EXECUTION
                </h3>
                <p className="text-xs text-slate-400 font-sans">
                  Execuție directă pe nodul WebSocket la broker
                </p>
              </div>
            </div>
            {/* Touch target min 44x44px */}
            <button
              onClick={onClose}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form Body - 5. Input fields: min height 48px, text-base (min 16px) */}
          <div className="mt-5 space-y-4 font-mono">
            {/* Symbol Selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5 font-sans">
                Activ / Simbol
              </label>
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full min-h-[48px] rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-base font-bold text-slate-100 focus:border-emerald-500 focus:outline-none"
              >
                {COMMON_SYMBOLS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Lot Size */}
            <div>
              <div className="flex justify-between items-center mb-1.5 font-sans">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Lot Size
                </label>
                <span className="text-xs text-slate-400 font-mono">
                  Marjă: ~${estimatedMargin.toFixed(0)} USD
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="20.0"
                  value={lot}
                  onChange={(e) => setLot(e.target.value)}
                  className="w-full min-h-[48px] rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-base font-bold text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
                <div className="flex gap-1.5 shrink-0">
                  {['0.1', '0.5', '1.0', '2.0'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setLot(preset)}
                      className="flex-1 sm:flex-none flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SL & TP Pips - 5. Input fields: min height 48px, text-base */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-rose-400 block mb-1.5 font-sans">
                  Stop Loss (Pips)
                </label>
                <input
                  type="number"
                  value={slPips}
                  onChange={(e) => setSlPips(e.target.value)}
                  className="w-full min-h-[48px] rounded-xl border border-rose-500/40 bg-slate-950 px-3 py-2 text-base font-bold text-slate-100 focus:border-rose-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1.5 font-sans">
                  Take Profit (Pips)
                </label>
                <input
                  type="number"
                  value={tpPips}
                  onChange={(e) => setTpPips(e.target.value)}
                  className="w-full min-h-[48px] rounded-xl border border-emerald-500/40 bg-slate-950 px-3 py-2 text-base font-bold text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 text-xs text-slate-400 font-sans flex items-start gap-2">
              <ShieldAlert className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Ordinul va fi rutat prin WebSocket către nodul de execuție al flotei cu protecție slippage 1.2 pips.
              </span>
            </div>
          </div>
        </div>

        {/* BUY & SELL Buttons - 5. Spacing min 12px (gap-3), min 44x44px touch targets */}
        <div className="grid grid-cols-2 gap-3 pt-4 mt-4 border-t border-slate-800 font-sans">
          <button
            onClick={() => handleTrade('BUY')}
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3 text-base font-extrabold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 active:scale-95 transition-all"
          >
            <TrendingUp className="h-5 w-5 stroke-[3]" />
            <span>BUY (LONG)</span>
          </button>

          <button
            onClick={() => handleTrade('SELL')}
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-rose-500 py-3 text-base font-extrabold text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 active:scale-95 transition-all"
          >
            <TrendingDown className="h-5 w-5 stroke-[3]" />
            <span>SELL (SHORT)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
