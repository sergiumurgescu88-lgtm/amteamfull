import React from 'react';
import { AlertOctagon, ShieldAlert, X } from 'lucide-react';

interface EmergencyKillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmKill: () => void;
}

export const EmergencyKillModal: React.FC<EmergencyKillModalProps> = ({
  isOpen,
  onClose,
  onConfirmKill,
}) => {
  if (!isOpen) return null;

  return (
    // 4. Modals Mobile: Bottom-sheet slide-up, full screen pe mobile
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-md bg-black/85">
      <div className="relative w-full max-w-lg h-full sm:h-auto max-h-screen sm:max-h-[92vh] rounded-t-3xl sm:rounded-3xl border border-rose-500/80 bg-slate-950 p-6 shadow-2xl text-slate-100 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-bottom duration-300">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between border-b border-rose-900/50 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 shrink-0">
                <AlertOctagon className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-mono text-lg font-black tracking-tight text-rose-300">
                  EMERGENCY KILL SWITCH
                </h3>
                <p className="text-xs text-rose-400/80 font-mono">
                  Protocol de siguranță critic nivel Alpha
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

          {/* Warning Content */}
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-slate-300 font-sans">
            <div className="rounded-2xl border border-rose-500/40 bg-rose-950/30 p-4 text-rose-200">
              <p className="font-bold text-base text-rose-100 flex items-center gap-2 mb-1.5">
                <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0" />
                CONFIRMARE OPRIRE DE URGENȚĂ
              </p>
              <p className="text-xs sm:text-sm text-rose-300/90 leading-normal">
                Ești sigur că vrei să declanșezi Kill Switch-ul global pentru întreaga flotă AM Team Trinity?
              </p>
            </div>

            <div className="space-y-2.5 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 font-mono text-xs">
              <span className="font-bold uppercase tracking-wider text-slate-400 block mb-2 font-sans text-xs">
                Acțiuni Imediate Executate:
              </span>
              <div className="flex items-start gap-2 text-rose-300">
                <span className="font-bold">1.</span>
                <span>Toți cei 20 de boți din cele 4 clustere vor fi opriți instantaneu (PAUSED).</span>
              </div>
              <div className="flex items-start gap-2 text-rose-300">
                <span className="font-bold">2.</span>
                <span>Toate pozițiile active deschise în piață vor fi închise la prețul curent de piață.</span>
              </div>
              <div className="flex items-start gap-2 text-rose-300">
                <span className="font-bold">3.</span>
                <span>Ordinele în așteptare (Pending Limit/Stop) vor fi anulate pe toate brokerajele.</span>
              </div>
              <div className="flex items-start gap-2 text-emerald-400 pt-1">
                <span className="font-bold">✓</span>
                <span>Capitalul contului va fi înghețat în siguranță.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions - 5. Spacing min 12px (gap-3), min 44x44px touch targets */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 mt-4 border-t border-slate-800/80 font-sans">
          <button
            onClick={onClose}
            className="flex min-h-[48px] items-center justify-center rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Anulează (Nu opri flota)
          </button>
          <button
            onClick={() => {
              onConfirmKill();
              onClose();
            }}
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-6 py-2.5 text-sm font-black text-white hover:from-rose-500 hover:to-red-500 shadow-xl shadow-rose-600/40 active:scale-95 transition-all"
          >
            <AlertOctagon className="h-5 w-5" />
            <span>CONFIRMĂ OPRIREA GLOBALĂ (KILL)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
