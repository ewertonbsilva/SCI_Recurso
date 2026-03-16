
import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  Clock,
  ClipboardCheck,
  LayoutDashboard,
  Activity,
  Menu,
  X,
  Truck,
  UserCircle,
  Settings,
  LogOut,
  Moon,
  Sun,
  FileText,
  Palette,
  Database,
  Check
} from 'lucide-react';
import { UserRole, User } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user?: User | null;
  fullscreen?: boolean;
}

const THEMES = [
  { id: 'default', color: 'bg-blue-600', label: 'Padrão' },
  { id: 'ocean', color: 'bg-sky-500', label: 'Oceano' },
  { id: 'forest', color: 'bg-emerald-500', label: 'Floresta' },
  { id: 'indigo', color: 'bg-indigo-600', label: 'Noite' },
  { id: 'crimson', color: 'bg-red-600', label: 'Alerta' },
];

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, user: propUser, fullscreen = false }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('sci_theme') === 'dark');
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('sci_ui_theme') || 'default');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const { logout: authLogout } = useAuth();

  const user = propUser;

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sci_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sci_theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('sci_ui_theme', currentTheme);
  }, [currentTheme]);

  const handleLogout = () => {
    authLogout();
    // Força o redirecionamento imediato limpando a URL para evitar cache de estado
    window.location.href = window.location.origin + window.location.pathname;
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: [UserRole.ADMIN] },
    { id: 'monitoramento', label: 'Monitoramento', icon: <Activity size={20} />, roles: [UserRole.ADMIN, UserRole.OPERADOR] },
    { id: 'equipes', label: 'Gestão de Equipes', icon: <Truck size={20} />, roles: [UserRole.ADMIN, UserRole.OPERADOR] },
    { id: 'cadastro', label: 'Cadastros Base', icon: <Users size={20} />, roles: [UserRole.ADMIN, UserRole.OPERADOR] },
    { id: 'turnos', label: 'Gestão de Turnos', icon: <Clock size={20} />, roles: [UserRole.ADMIN, UserRole.OPERADOR] },
    { id: 'usuarios', label: 'Configurações', icon: <Settings size={20} />, roles: [UserRole.ADMIN] },
  ];

  const filteredNavItems = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#020617] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'} flex flex-col md:grid md:grid-cols-[288px_1fr] transition-colors duration-500`}>
      <header className={`md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md p-4 flex justify-between items-center sticky top-0 z-50 transition-all duration-300 ${fullscreen ? 'opacity-0 pointer-events-none h-0 overflow-hidden' : ''}`}>
        <h1 className="text-xl font-black flex items-center gap-2 tracking-tighter uppercase">
          <Shield className="text-red-600 fill-red-600/10" /> SCI
        </h1>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsMobileProfileOpen(true)} className="p-2 text-slate-500">
            <UserCircle />
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`
        hidden md:flex fixed md:static inset-y-0 left-0 z-40 w-72 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/50 transform transition-transform duration-500 ease-in-out flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${fullscreen ? 'opacity-0 pointer-events-none md:opacity-0 md:pointer-events-none' : ''}
      `}>
        <div className="p-8 hidden md:block">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tighter uppercase group cursor-default">
              <Shield className="text-red-600 fill-red-600/10 group-hover:scale-110 transition-transform" />
              SCI <span className="text-primary transition-colors">RECURSO</span>
            </h1>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-black uppercase tracking-[0.2em]">Centro de Comando</p>
        </div>

        <nav className="hidden md:block mt-4 px-4 space-y-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-slate-100 dark:scrollbar-thumb-blue-400 dark:scrollbar-track-slate-800">
          {filteredNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
              className={`
                w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm
                ${activeTab === item.id
                  ? 'bg-primary text-white shadow-lg shadow-blue-500/20 scale-[1.02]'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'}
              `}
            >
              <span className={`${activeTab === item.id ? 'text-white' : 'text-primary opacity-60'}`}>
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="hidden md:block p-6 bg-gradient-to-t from-white dark:from-slate-900 via-white dark:via-slate-900 to-transparent">
          {/* Theme Selector */}
          <div className="mb-4 relative">
            <button
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500"
            >
              <div className="flex items-center gap-2">
                <Palette size={14} className="text-primary" /> Temas
              </div>
              <div className={`w-3 h-3 rounded-full ${THEMES.find(t => t.id === currentTheme)?.color}`}></div>
            </button>

            {isThemeMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-2 grid grid-cols-5 gap-1 animate-in slide-in-from-bottom-2">
                {THEMES.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => { setCurrentTheme(theme.id); setIsThemeMenuOpen(false); }}
                    className={`w-full aspect-square rounded-xl ${theme.color} flex items-center justify-center transition-transform hover:scale-110 active:scale-95`}
                    title={theme.label}
                  >
                    {currentTheme === theme.id && <X size={12} className="text-white rotate-45" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mb-4 p-4 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-xs font-black text-white shadow-xl">
              {user?.nome.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.nome}</p>
              <p className="text-[8px] text-primary font-black uppercase tracking-widest">{user?.role}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex-1 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={handleLogout}
              className="flex-[2] flex items-center justify-center gap-2 p-3 rounded-2xl border border-red-100 dark:border-red-900/20 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all font-bold text-[10px]"
            >
              <LogOut size={16} /> SAIR
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`overflow-x-hidden relative transition-all duration-300 w-full mb-16 md:mb-0 ${fullscreen ? 'p-0' : 'p-6 md:p-12'}`}>
        <div className="w-full mx-auto page-transition min-h-0">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {!fullscreen && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50 flex justify-around items-center p-2 pb-safe">
          {filteredNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                flex flex-col items-center p-2 rounded-xl transition-all duration-300 w-16
                ${activeTab === item.id
                  ? 'text-primary scale-110'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}
              `}
            >
              <div className={`${activeTab === item.id ? 'bg-primary/10 p-1.5 rounded-lg' : ''}`}>
                {item.icon}
              </div>
              <span className={`text-[9px] font-bold mt-1 truncate w-full text-center ${activeTab === item.id ? 'opacity-100' : 'opacity-70'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      )}

      {/* Mobile Profile Modal */}
      {isMobileProfileOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center bg-slate-900/50 backdrop-blur-sm md:hidden animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-h-[90vh] rounded-t-[2rem] sm:rounded-[2rem] sm:max-w-md shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Opções</h3>
              <button
                onClick={() => setIsMobileProfileOpen(false)}
                className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-lg font-black text-white shadow-lg">
                  {user?.nome.substring(0, 2).toUpperCase()}
                </div>
                <div className="overflow-hidden flex-1">
                  <p className="font-bold text-slate-900 dark:text-white truncate">{user?.nome}</p>
                  <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                    {user?.role}
                  </p>
                </div>
              </div>

              {/* Theme Settings */}
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Aparência</p>
                <div className="grid grid-cols-5 gap-2">
                  {THEMES.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => setCurrentTheme(theme.id)}
                      className={`aspect-square rounded-2xl ${theme.color} flex items-center justify-center transition-transform active:scale-95`}
                      title={theme.label}
                    >
                      {currentTheme === theme.id && <Check size={16} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm active:scale-95 transition-transform"
              >
                <div className="flex items-center gap-3">
                  {isDarkMode ? <Moon size={20} className="text-indigo-400" /> : <Sun size={20} className="text-orange-500" />}
                  {isDarkMode ? 'Modo Escuro' : 'Modo Claro'}
                </div>
                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
              </button>

              {/* Logout Button */}
              <button
                onClick={() => { setIsMobileProfileOpen(false); handleLogout(); }}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-sm uppercase text-red-500 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 active:scale-95 transition-all"
              >
                <LogOut size={18} /> Sair do Sistema
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Overlay para mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
