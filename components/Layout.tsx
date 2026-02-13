
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
  Database
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
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: [UserRole.ADMIN, UserRole.OPERADOR] },
    { id: 'monitoramento', label: 'Monitoramento', icon: <Activity size={20} />, roles: [UserRole.ADMIN, UserRole.OPERADOR] },
    { id: 'equipes', label: 'Gestão de Equipes', icon: <Truck size={20} />, roles: [UserRole.ADMIN, UserRole.OPERADOR] },
    { id: 'cadastro', label: 'Cadastros Base', icon: <Users size={20} />, roles: [UserRole.ADMIN] },
    { id: 'turnos', label: 'Gestão de Turnos', icon: <Clock size={20} />, roles: [UserRole.ADMIN] },
    { id: 'usuarios', label: 'Configurações', icon: <Settings size={20} />, roles: [UserRole.ADMIN] },
  ];

  const filteredNavItems = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#020617] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'} grid grid-cols-[auto_1fr] transition-colors duration-500`}>
      {/* Mobile Header */}
      <header className={`md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md p-4 flex justify-between items-center sticky top-0 z-50 transition-all duration-300 ${fullscreen ? 'opacity-0 pointer-events-none h-0 overflow-hidden' : ''}`}>
        <h1 className="text-xl font-black flex items-center gap-2 tracking-tighter uppercase">
          <Shield className="text-red-600 fill-red-600/10" /> SCI
        </h1>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-500">
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-[60] w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/50 transform transition-transform duration-500 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
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

        <nav className="mt-4 px-4 space-y-2 overflow-y-auto h-[calc(100vh-320px)] scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-slate-100 dark:scrollbar-thumb-blue-400 dark:scrollbar-track-slate-800">
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

        <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-white dark:from-slate-900 via-white dark:via-slate-900 to-transparent">
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
      <main className={`overflow-x-hidden relative transition-all duration-300 ${fullscreen ? 'p-0' : 'p-6 md:p-12'}`}>
        <div className="max-w-6xl mx-auto page-transition min-h-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
