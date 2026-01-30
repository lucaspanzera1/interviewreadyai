import React, { useEffect } from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  onClose: (id: string) => void;
}

/**
 * Componente de notificação toast - Estilo "Violet Evolution"
 */
const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  description,
  duration = 5000,
  onClose
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const getStyleConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />,
          bgIcon: 'bg-green-100 dark:bg-green-900/30',
          border: 'border-green-200 dark:border-green-800',
          progress: 'from-green-500 to-emerald-400',
          glow: 'shadow-green-500/20'
        };
      case 'error':
        return {
          icon: <XCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />,
          bgIcon: 'bg-red-100 dark:bg-red-900/30',
          border: 'border-red-200 dark:border-red-800',
          progress: 'from-red-500 to-rose-400',
          glow: 'shadow-red-500/20'
        };
      case 'warning':
        return {
          icon: <ExclamationTriangleIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />,
          bgIcon: 'bg-amber-100 dark:bg-amber-900/30',
          border: 'border-amber-200 dark:border-amber-800',
          progress: 'from-amber-500 to-yellow-400',
          glow: 'shadow-amber-500/20'
        };
      case 'info':
      default:
        // Using Primary (Violet) for Info to match brand
        return {
          icon: <InformationCircleIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />,
          bgIcon: 'bg-primary-100 dark:bg-primary-900/30',
          border: 'border-primary-200 dark:border-primary-800',
          progress: 'from-primary-500 to-violet-400',
          glow: 'shadow-primary-500/20'
        };
    }
  };

  const style = getStyleConfig();

  return (
    <div
      className={`
        relative overflow-hidden w-full max-w-sm
        bg-white/95 dark:bg-slate-800/95 backdrop-blur-md
        border ${style.border} rounded-2xl
        shadow-lg ${style.glow}
        transform transition-all duration-300 hover:scale-[1.02]
        animate-slide-up
      `}
      role="alert"
    >
      <div className="p-4 flex items-start gap-4">
        {/* Icon Container */}
        <div className={`flex-shrink-0 p-2 rounded-xl ${style.bgIcon} transition-colors duration-300`}>
          {style.icon}
        </div>

        {/* Content */}
        <div className="flex-1 pt-0.5 min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 leading-snug">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Close Button */}
        <div className="flex-shrink-0 -ml-2 -mt-1">
          <button
            onClick={() => onClose(id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          >
            <span className="sr-only">Fechar</span>
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-700/50">
          <div
            className={`h-full bg-gradient-to-r ${style.progress}`}
            style={{ animation: `shrink ${duration}ms linear forwards` }}
          />
        </div>
      )}

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default Toast;