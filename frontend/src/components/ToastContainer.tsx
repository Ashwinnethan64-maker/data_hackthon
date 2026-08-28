import { useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ToastContainer() {
  const { toasts, dismissToast, subscribe } = useToast();

  useEffect(() => {
    const unsubscribe = subscribe();
    return () => unsubscribe();
  }, [subscribe]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-xl shadow-2xl ${
                isSuccess
                  ? 'bg-slate-900/90 border-cyan/40 text-slate-100 shadow-cyan/10'
                  : isError
                  ? 'bg-slate-900/90 border-red-500/40 text-slate-100 shadow-red-500/10'
                  : isWarning
                  ? 'bg-slate-900/90 border-amber-500/40 text-slate-100 shadow-amber-500/10'
                  : 'bg-slate-900/90 border-slate-700 text-slate-100'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isSuccess && <CheckCircle2 className="w-4 h-4 text-cyan" />}
                {isError && <XCircle className="w-4 h-4 text-red-400" />}
                {isWarning && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                {!isSuccess && !isError && !isWarning && <Info className="w-4 h-4 text-blue-400" />}
              </div>
              <div className="flex-1 min-w-0">
                {toast.title && <div className="text-xs font-semibold text-white leading-tight mb-0.5">{toast.title}</div>}
                <div className="text-xs text-slate-300 leading-relaxed break-words">{toast.message}</div>
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-slate-400 hover:text-white transition-colors shrink-0 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
