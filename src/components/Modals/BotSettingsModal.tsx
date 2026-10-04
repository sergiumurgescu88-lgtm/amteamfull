import React, { useState, useEffect } from 'react';
import { BotData, BotSettings } from '../../types/trading';
import { X, SlidersHorizontal, Save, ShieldAlert, Sparkles } from 'lucide-react';

interface BotSettingsModalProps {
  bot: BotData | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveSettings: (botId: string, settings: BotSettings) => void;
}

export const BotSettingsModal: React.FC<BotSettingsModalProps> = ({
  bot,
  isOpen,
  onClose,
  onSaveSettings,
}) => {
  const [maxDrawdownPct, setMaxDrawdownPct] = useState(5.0);
  const [lossThresholdUsd, setLossThresholdUsd] = useState(1500);
  const [autoPauseEnabled, setAutoPauseEnabled] = useState(true);
  const [maxLotSize, setMaxLotSize] = useState(5.0);

  useEffect(() => {
    if (bot) {
      setMaxDrawdownPct(bot.settings.maxDrawdownPct);
      setLossThresholdUsd(bot.settings.lossThresholdUsd);
      setAutoPauseEnabled(bot.settings.autoPauseEnabled);
      setMaxLotSize(bot.settings.maxLotSize);
    }
  }, [bot]);

  if (!isOpen || !bot) return null;

  const handleSave = () => {
    onSaveSettings(bot.id, {
      maxDrawdownPct: Number(maxDrawdownPct),
      lossThresholdUsd: Number(lossThresholdUsd),
      autoPauseEnabled,
      maxLotSize: Number(maxLotSize),
    });
    onClose();
  };

  return (
    // 4. Modals Mobile: Bottom-sheet slide-up animation, full-screen on mobile
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-md bg-black/80">
      <div className="relative w-full max-w-md h-full sm:h-auto max-h-screen sm:max-h-[92vh] rounded-t-3xl sm:rounded-3xl border border-slate-700/80 bg-slate-900 p-6 shadow-2xl text-slate-100 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-bottom duration-300">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-mono text-base font-bold text-white">
                    SETĂRI BOT: {bot.name}
                  </h3>
                  {bot.isGoldenRatioMaster && (
                    <span className="text-yellow-400 font-mono text-xs font-bold">φ</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  {bot.asset} • {bot.domain}
                </p>
              </div>
            </div>

            {/* Close button touch target: min 44x44px */}
            <button
              onClick={onClose}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form Body - 5. Input fields: min height 48px, text-base (min 16px) */}
          <div className="mt-5 space-y-4 font-sans text-xs">
            {/* Max Drawdown Pct */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Max Drawdown Limită (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="25.0"
                value={maxDrawdownPct}
                onChange={(e) => setMaxDrawdownPct(parseFloat(e.target.value))}
                className="w-full min-h-[48px] rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-base font-bold text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Dacă drawdown-ul depășește acest procent, botul se va opri automat.
              </span>
            </div>

            {/* Loss Threshold USD */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Prag Maxim Pierdere Sesiune (USD)
              </label>
              <input
                type="number"
                step="100"
                min="100"
                max="10000"
                value={lossThresholdUsd}
                onChange={(e) => setLossThresholdUsd(parseFloat(e.target.value))}
                className="w-full min-h-[48px] rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-base font-bold text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Pierdere maximă admisă în 24 de ore înainte de auto-decuplare.
              </span>
            </div>

            {/* Max Lot Size */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Volum Maxim Permis (Lots)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.1"
                max="20.0"
                value={maxLotSize}
                onChange={(e) => setMaxLotSize(parseFloat(e.target.value))}
                className="w-full min-h-[48px] rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-base font-bold text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Auto Pause Toggle - 5. Touch target min 44px */}
            <div className="flex min-h-[48px] items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
              <div>
                <span className="text-xs font-bold text-slate-200 block">Auto-Pauză pe Anomaly Alert</span>
                <span className="text-[11px] text-slate-400">Oprește execuția când VIX &gt; 35</span>
              </div>
              <button
                type="button"
                onClick={() => setAutoPauseEnabled(!autoPauseEnabled)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoPauseEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    autoPauseEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Actions - 5. Spacing min 12px (gap-3), min 44x44px touch targets */}
        <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none flex min-h-[48px] items-center justify-center rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Anulează
          </button>
          <button
            onClick={handleSave}
            className="flex-1 sm:flex-none flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
          >
            <Save className="h-4 w-4" />
            <span>Salvează Setări</span>
          </button>
        </div>
      </div>
    </div>
  );
};
