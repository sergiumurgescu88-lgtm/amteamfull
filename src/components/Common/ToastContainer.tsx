import { ToastNotification } from '../../types/trading';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';

interface ToastContainerProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-24 right-10 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-slate-800 bg-slate-900/95 text-slate-100';
        let icon = <Info className="w-5 h-5 text-cyan-400 shrink-0" />;

        if (toast.type === 'success') {
          borderClass = 'border-emerald-500/40 bg-slate-900/95 text-emerald-100 glow-emerald';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
        } else if (toast.type === 'error') {
          borderClass = 'border-rose-500/50 bg-slate-900/95 text-rose-100 glow-rose';
          icon = <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />;
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-500/40 bg-slate-900/95 text-amber-100 glow-amber';
          icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 transform translate-y-0 ${borderClass}`}
          >
            <div className="pt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {toast.title}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed break-words">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-200 p-0.5 rounded transition-colors"
              title="Închide"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
