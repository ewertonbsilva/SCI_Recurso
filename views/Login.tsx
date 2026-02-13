
import React, { useState } from 'react';
import { Shield, Lock, User as UserIcon, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { ToastType } from '../components/Toast';

interface LoginProps {
  onNotify: (msg: string, type: ToastType) => void;
}

const Login: React.FC<LoginProps> = ({ onNotify }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nome: '',
    role: UserRole.OPERADOR
  });

  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const result = await login(formData.username, formData.password);
        if (!result.success) {
          onNotify?.(result.error || 'Erro ao fazer login', 'error');
        }
      } else {
        const result = await register(formData.username, formData.nome, formData.password, formData.role);
        if (!result.success) {
          onNotify?.(result.error || 'Erro ao criar usuário', 'error');
        }
      }
    } catch (error) {
      onNotify?.('Erro de conexão com o servidor', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      username: '',
      password: '',
      nome: '',
      role: UserRole.OPERADOR
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-3xl mb-4">
              <Shield className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
              SCI Recurso
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {isLogin ? 'Faça login para continuar' : 'Crie sua conta'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">
                  Nome Completo
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm outline-none focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/20 transition-all"
                    placeholder="Seu nome completo"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">
                Usuário
              </label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm outline-none focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/20 transition-all"
                  placeholder="Nome de usuário"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm outline-none focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/20 transition-all"
                  placeholder="Sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">
                  Tipo de Acesso
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm outline-none focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/20 transition-all cursor-pointer"
                >
                  <option value={UserRole.OPERADOR}>Operador (Acesso Operacional)</option>
                  <option value={UserRole.ADMIN}>Administrador (Acesso Total)</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  PROCESSANDO...
                </>
              ) : (
                <>
                  {isLogin ? 'ENTRAR' : 'CRIAR CONTA'}
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
{/*          <div className="mt-6 text-center">
            <button
              onClick={toggleMode}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors"
            >
              {isLogin ? 'Não tem uma conta? Criar nova conta' : 'Já tem uma conta? Fazer login'}
            </button>
          </div> */}

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-amber-600 dark:text-amber-400 mt-0.5" size={16} />
              <div className="text-xs text-amber-700 dark:text-amber-300">
                <p className="font-bold mb-1">Aviso de Segurança:</p>
                <p>
                  {isLogin 
                    ? 'Use suas credenciais pessoais. Não compartilhe seus dados de acesso.'
                    : 'Crie uma senha forte com letras, números e caracteres especiais.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
