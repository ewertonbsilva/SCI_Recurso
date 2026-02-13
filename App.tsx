
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import Monitoramento from './views/Monitoramento';
import Cadastros from './views/Cadastros';
import Turnos from './views/Turnos';
import TurnoDetalhe from './views/TurnoDetalhe';
import Chamadas from './views/Chamadas';
import ChamadaCivilView from './views/ChamadaCivil';
import GestaoEquipes from './views/GestaoEquipes';
import Login from './views/Login';
import Configuracoes from './views/Configuracoes';
import Toast, { ToastType } from './components/Toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FullscreenProvider, useFullscreen } from './contexts/FullscreenContext';
import { UserRole } from './types';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTurnoId, setSelectedTurnoId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const { user, isAuthenticated, isLoading } = useAuth();
  const { isFullscreen } = useFullscreen();

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedTurnoId(null);
        setActiveTab('dashboard');
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onNotify={showToast} />;
  }

  const handleSelectTurno = (id: string) => {
    setSelectedTurnoId(id);
    setActiveTab('turno_detalhe');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'monitoramento': return <Monitoramento />;
      case 'equipes': return <GestaoEquipes onNotify={showToast} />;
      case 'cadastro':
        return user?.role === UserRole.ADMIN ? <Cadastros onNotify={showToast} /> : <Dashboard />;
      case 'turnos':
        return user?.role === UserRole.ADMIN ? <Turnos onNotify={showToast} onSelectTurno={handleSelectTurno} /> : <Dashboard />;
      case 'turno_detalhe':
        return selectedTurnoId ? (
          <TurnoDetalhe
            id_turno={selectedTurnoId}
            onBack={() => setActiveTab('turnos')}
            onNotify={showToast}
          />
        ) : <Dashboard />;
      case 'chamada_mil': return <Chamadas onNotify={showToast} />;
      case 'chamada_civ': return <ChamadaCivilView onNotify={showToast} />;
      case 'usuarios':
        return user?.role === UserRole.ADMIN ? <Configuracoes onNotify={showToast} /> : <Dashboard />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={(tab) => {
      setActiveTab(tab);
      if (tab !== 'turno_detalhe') setSelectedTurnoId(null);
    }} user={user} fullscreen={isFullscreen}>
      <div className="pb-12">
        {renderContent()}
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <FullscreenProvider>
        <AppContent />
      </FullscreenProvider>
    </AuthProvider>
  );
};

export default App;
