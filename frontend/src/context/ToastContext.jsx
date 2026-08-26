import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Conteneur de toasts — coin bas-droit */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast doit être utilisé dans un ToastProvider');
  return ctx;
}

const TOAST_STYLES = {
  success: {
    wrapper: 'bg-slate-900/95 border-emerald-500/40 shadow-emerald-500/10',
    icon: <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
    bar: 'bg-emerald-500',
    text: 'text-emerald-300'
  },
  error: {
    wrapper: 'bg-slate-900/95 border-red-500/40 shadow-red-500/10',
    icon: <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />,
    bar: 'bg-red-500',
    text: 'text-red-300'
  },
  info: {
    wrapper: 'bg-slate-900/95 border-blue-500/40 shadow-blue-500/10',
    icon: <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />,
    bar: 'bg-blue-500',
    text: 'text-blue-300'
  },
  warning: {
    wrapper: 'bg-slate-900/95 border-amber-500/40 shadow-amber-500/10',
    icon: <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />,
    bar: 'bg-amber-500',
    text: 'text-amber-300'
  }
};

function ToastItem({ toast, onClose }) {
  const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;

  return (
    <div
      className={`pointer-events-auto w-80 rounded-2xl border backdrop-blur-xl shadow-2xl overflow-hidden toast-slide-in ${style.wrapper}`}
    >
      {/* Barre de progression en haut */}
      <div className={`h-0.5 ${style.bar} animate-toast-bar`} />

      <div className="flex items-center gap-3 px-4 py-3.5">
        {style.icon}
        <p className="flex-1 text-sm font-semibold text-slate-100 leading-snug">
          {toast.message}
        </p>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
