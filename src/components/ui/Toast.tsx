'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export const useToast = () => useContext(ToastContext);

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const COLORS = {
  success: 'bg-green-900/90 border-green-500/60 text-green-200',
  error: 'bg-red-900/90 border-red-500/60 text-red-200',
  info: 'bg-blue-900/90 border-blue-500/60 text-blue-200',
  warning: 'bg-yellow-900/90 border-yellow-500/60 text-yellow-200',
};

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const remove = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm" role="status" aria-live="polite">
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <div
              key={t.id}
              className={clsx(
                'flex items-start gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md animate-in slide-in-from-right',
                COLORS[t.type]
              )}
            >
              <Icon className="w-5 h-5 flex-none mt-0.5" />
              <p className="text-sm font-medium flex-1">{t.message}</p>
              <button
                onClick={() => remove(t.id)}
                className="flex-none opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Chiudi notifica"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
