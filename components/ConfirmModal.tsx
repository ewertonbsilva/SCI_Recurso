import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

// Função para obter cores do tema atual (igual aos outros componentes)
const getThemeColors = () => {
  const root = document.documentElement;
  const theme = root.getAttribute('data-theme') || 'default';

  const themeColors: Record<string, { primary: string; primaryHover: string; rgb: string }> = {
    default: { primary: '#3b82f6', primaryHover: '#2563eb', rgb: '59, 130, 246' },
    ocean: { primary: '#0ea5e9', primaryHover: '#0284c7', rgb: '14, 165, 233' },
    forest: { primary: '#10b981', primaryHover: '#059669', rgb: '16, 185, 129' },
    crimson: { primary: '#dc2626', primaryHover: '#b91c1c', rgb: '220, 38, 38' },
    indigo: { primary: '#4f46e5', primaryHover: '#4338ca', rgb: '79, 70, 229' }
  };

  return themeColors[theme] || themeColors.default;
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger'
}) => {
  const [themeColors, setThemeColors] = useState(getThemeColors());

  // Monitorar mudanças no tema
  useEffect(() => {
    const handleThemeChange = () => {
      setThemeColors(getThemeColors());
    };

    // Observer para mudanças no atributo data-theme
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          handleThemeChange();
        }
      });
    });

    // Observer para mudanças no localStorage (tema salvo)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sci_ui_theme') {
        handleThemeChange();
      }
    };

    // Iniciar observers
    observer.observe(document.documentElement, { attributes: true });
    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      observer.disconnect();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      bg: 'bg-red-50 dark:bg-red-950/20',
      border: 'border-red-100 dark:border-red-900/30',
      icon: 'text-red-500',
      button: 'bg-red-500 hover:bg-red-600 text-white'
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-950/20',
      border: 'border-yellow-100 dark:border-yellow-900/30',
      icon: 'text-yellow-500',
      button: 'bg-yellow-500 hover:bg-yellow-600 text-white'
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      border: 'border-blue-100 dark:border-blue-900/30',
      icon: 'text-blue-500',
      button: 'bg-blue-500 hover:bg-blue-600 text-white'
    }
  };

  const currentStyle = typeStyles[type];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className={`p-6 border-b border-slate-100 dark:border-slate-800 ${currentStyle.bg} ${currentStyle.border} rounded-t-3xl`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl ${currentStyle.bg} ${currentStyle.border}`}>
              <AlertTriangle size={24} className={currentStyle.icon} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 rounded-b-3xl">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all active:scale-95"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-6 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 ${currentStyle.button}`}
              style={{ backgroundColor: type === 'info' ? themeColors.primary : undefined }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
