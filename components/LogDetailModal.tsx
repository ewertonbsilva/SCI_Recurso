import React, { useEffect, useState } from 'react';
import { Eye, X, Copy, User, Calendar, Activity, Globe, Monitor } from 'lucide-react';

interface LogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: any;
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

const LogDetailModal: React.FC<LogDetailModalProps> = ({
  isOpen,
  onClose,
  log
}) => {
  const [themeColors, setThemeColors] = useState(getThemeColors());
  const [copied, setCopied] = useState(false);

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

  if (!isOpen || !log) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getAcaoColor = (acao: string) => {
    switch (acao) {
      case 'CREATE': return 'text-green-600 bg-green-50 dark:bg-green-950/20 dark:text-green-400';
      case 'UPDATE': return 'text-blue-600 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400';
      case 'DELETE': return 'text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400';
      case 'LOGIN': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400';
      case 'LOGOUT': return 'text-orange-600 bg-orange-50 dark:bg-orange-950/20 dark:text-orange-400';
      case 'READ': return 'text-purple-600 bg-purple-50 dark:bg-purple-950/20 dark:text-purple-400';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950/20 dark:text-gray-400';
    }
  };

  const copyToClipboard = () => {
    const logText = `
ID: ${log.id_log}
Data/Hora: ${formatDate(log.data_hora)}
Usuário: ${log.usuario}
Ação: ${log.acao}
Entidade: ${log.entidade}
Registro ID: ${log.registro_id || 'N/A'}
Descrição: ${log.descricao || 'N/A'}
IP Address: ${log.ip_address || 'N/A'}
User Agent: ${log.user_agent || 'N/A'}
    `.trim();

    navigator.clipboard.writeText(logText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <Eye size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                Detalhes do Log
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                ID: {log.id_log}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                title="Copiar log"
              >
                <Copy size={20} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            {/* Informações Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Data/Hora</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {formatDate(log.data_hora)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Usuário</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {log.usuario}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ação</p>
                    <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${getAcaoColor(log.acao)}`}>
                      {log.acao}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Entidade</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {log.entidade}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 bg-gradient-to-br from-green-500 to-teal-600 rounded" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Registro ID</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {log.registro_id || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">IP Address</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {log.ip_address || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Descrição */}
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Descrição</p>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {log.descricao || 'Nenhuma descrição disponível'}
                </p>
              </div>
            </div>

            {/* User Agent */}
            {log.user_agent && (
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">User Agent</p>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-start gap-2">
                    <Monitor className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-mono break-all">
                      {log.user_agent}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {copied && (
                <span className="text-green-600 dark:text-green-400">
 ✓ Copiado para área de transferência
                </span>
              )}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all active:scale-95"
              style={{ backgroundColor: themeColors.primary, color: 'white', borderColor: 'transparent' }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = themeColors.primaryHover;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = themeColors.primary;
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogDetailModal;
