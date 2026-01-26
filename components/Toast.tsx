
import React from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
  };

  const icons = {
    success: <CheckCircle2 className="text-green-500" size={20} />,
    error: <AlertCircle className="text-red-500" size={20} />,
    warning: <AlertCircle className="text-amber-500" size={20} />,
  };

  return (
    <div className={`
      fixed top-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl animate-in slide-in-from-right duration-300 min-w-[320px] max-w-md
      ${styles[type]}
    `}>
      <div className="shrink-0">{icons[type]}</div>
      <div className="flex-1 text-sm font-medium whitespace-pre-line">{message}</div>
      <button 
        onClick={onClose}
        className="shrink-0 p-1 hover:bg-black/5 rounded-full transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
