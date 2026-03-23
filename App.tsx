
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
import Relatorios from './views/Relatorios';
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

  // Define página inicial quando o usuário é carregado
  useEffect(() => {
    if (user && isAuthenticated) {
      const initialTab = user.role === UserRole.OPERADOR ? 'monitoramento' : 'dashboard';
      setActiveTab(initialTab);
    }
  }, [user, isAuthenticated]);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedTurnoId(null);
        // Define página inicial baseada no perfil do usuário
        const fallbackTab = user?.role === UserRole.OPERADOR ? 'monitoramento' : 'dashboard';
        setActiveTab(fallbackTab);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [user]);

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
        return user?.role === UserRole.ADMIN || user?.role === UserRole.OPERADOR ? <Cadastros onNotify={showToast} /> : <Monitoramento />;
      case 'turnos':
        return user?.role === UserRole.ADMIN || user?.role === UserRole.OPERADOR ? <Turnos onNotify={showToast} onSelectTurno={handleSelectTurno} /> : <Monitoramento />;
      case 'turno_detalhe':
        return selectedTurnoId ? (
          <TurnoDetalhe
            id_turno={selectedTurnoId}
            onBack={() => setActiveTab('turnos')}
            onNotify={showToast}
          />
        ) : (user?.role === UserRole.OPERADOR ? <Monitoramento /> : <Dashboard />);
      case 'relatorios':
        return user?.role === UserRole.ADMIN || user?.role === UserRole.OPERADOR ? <Relatorios onNotify={showToast} /> : <Monitoramento />;
      case 'chamada_mil': return <Chamadas onNotify={showToast} />;
      case 'chamada_civ': return <ChamadaCivilView onNotify={showToast} />;
      case 'usuarios':
        return user?.role === UserRole.ADMIN ? <Configuracoes onNotify={showToast} /> : <Monitoramento />;
      default: 
        // Define página padrão baseada no perfil do usuário
        return user?.role === UserRole.OPERADOR ? <Monitoramento /> : <Dashboard />;
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
