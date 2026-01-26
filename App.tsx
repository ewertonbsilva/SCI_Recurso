
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
import Usuarios from './views/Usuarios';
import OperationalLog from './views/OperationalLog';
import Login from './views/Login';
import Toast, { ToastType } from './components/Toast';
import { getCurrentUser } from './store';
import { UserRole } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTurnoId, setSelectedTurnoId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setIsAuthenticated(true);
      setCurrentUser(user);
    }
  }, []);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentUser(getCurrentUser());
  };

  const handleSelectTurno = (id: string) => {
    setSelectedTurnoId(id);
    setActiveTab('turno_detalhe');
  };

  const renderContent = () => {
    if (!isAuthenticated) return null;

    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'monitoramento': return <Monitoramento />;
      case 'diario': return <OperationalLog />;
      case 'equipes': return <GestaoEquipes onNotify={showToast} />;
      case 'cadastro': 
        return currentUser?.role === UserRole.ADMIN ? <Cadastros onNotify={showToast} /> : <Dashboard />;
      case 'turnos': 
        return currentUser?.role === UserRole.ADMIN ? <Turnos onNotify={showToast} onSelectTurno={handleSelectTurno} /> : <Dashboard />;
      case 'turno_detalhe':
        return selectedTurnoId ? (
          <TurnoDetalhe 
            idTurno={selectedTurnoId} 
            onBack={() => setActiveTab('turnos')} 
            onNotify={showToast} 
          />
        ) : <Dashboard />;
      case 'chamada_mil': return <Chamadas onNotify={showToast} />;
      case 'chamada_civ': return <ChamadaCivilView onNotify={showToast} />;
      case 'usuarios': 
        return currentUser?.role === UserRole.ADMIN ? <Usuarios onNotify={showToast} /> : <Dashboard />;
      default: return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Login onLoginSuccess={handleLoginSuccess} onNotify={showToast} />
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </>
    );
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={(tab) => {
      setActiveTab(tab);
      if (tab !== 'turno_detalhe') setSelectedTurnoId(null);
    }}>
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

export default App;
