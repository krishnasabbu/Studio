import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_DURATION = 5000;

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, TOAST_DURATION);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full font-sans">
        {toasts.map((toast) => {
          const bgColor =
            toast.type === 'success' || toast.type === 'info'
              ? 'bg-[#0052A0]/90 text-white'
              : toast.type === 'error'
              ? 'bg-[#E01E37]/90 text-white'
              : 'bg-[#FFC72C]/90 text-black';

          const barColor =
            toast.type === 'success' || toast.type === 'info'
              ? 'bg-[#FFC72C]'
              : toast.type === 'error'
              ? 'bg-[#FFC72C]'
              : 'bg-[#0052A0]';

          return (
            <div
              key={toast.id}
              className={`relative px-5 py-4 rounded-md shadow-md transform transition-all duration-300 ease-out animate-slide-in overflow-hidden ${bgColor}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex-1">{toast.message}</span>
                <button
                  onClick={() => removeToast(toast.id)}
                  className={`ml-3 ${
                    toast.type === 'warning' ? 'text-black' : 'text-white'
                  } opacity-80 hover:opacity-100 text-lg font-bold`}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              {/* Progress bar */}
              <div
                className={`absolute bottom-0 left-0 h-1 ${barColor} animate-progress`}
                style={{ animationDuration: `${TOAST_DURATION}ms` }}
              />
            </div>
          );
        })}
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .animate-progress {
          animation: progress linear forwards;
        }
        .font-sans {
          font-family: 'Helvetica Neue', Arial, sans-serif;
        }
      `}</style>
    </ToastContext.Provider>
  );
};

// Hook
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};