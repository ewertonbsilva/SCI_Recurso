
import React, { useState } from 'react';
import { Shield, Lock, User as UserIcon, LogIn } from 'lucide-react';
import { loadData, login } from '../store';
import { ToastType } from '../components/Toast';

interface LoginProps {
  onLoginSuccess: () => void;
  onNotify: (msg: string, type: ToastType) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onNotify }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = loadData();
    const user = data.users.find(u => u.username === username && u.password === password);

    if (user) {
      login(user);
      onLoginSuccess();
      onNotify("Login realizado com sucesso!", "success");
    } else {
      onNotify("Usuário ou senha incorretos.", "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="bg-slate-900 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl border-4 border-white">
            <Shield size={40} className="text-red-500" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">SCI Recurso</h1>
          <p className="text-slate-500 mt-2 font-medium">Gestão de Efetivo e Logística</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
            <LogIn className="text-blue-600" /> Acessar Sistema
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Usuário</label>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  type="text" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all font-medium text-slate-700"
                  placeholder="Seu usuário"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all font-medium text-slate-700"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg tracking-tight hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xl shadow-slate-200"
            >
              ENTRAR
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-slate-400 bg-slate-50 p-4 rounded-xl">
            Acesso restrito a pessoal autorizado.<br/>
            Versão 1.0.0
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
