
import React, { useState } from 'react';
import { UserPlus, Trash2, User as UserIcon, Users, Edit2 } from 'lucide-react';
import { loadData, saveData } from '../store';
import { User, UserRole } from '../types';
import { ToastType } from '../components/Toast';
import { apiService } from '../apiService';

interface UsuariosProps {
  onNotify?: (msg: string, type: ToastType) => void;
}

const Usuarios: React.FC<UsuariosProps> = ({ onNotify }) => {
  const [data, setData] = useState(loadData());
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  React.useEffect(() => {
    loadDadosFromAPI();
  }, []);

  const loadDadosFromAPI = async () => {
    try {
      setLoading(true);
      const usersData = await apiService.getUsers();
      setUsers(usersData);
      console.log('Usuários carregados:', usersData);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;

    if (users.some(u => u.username === username)) {
      onNotify?.("Este nome de usuário já existe.", "error");
      return;
    }

    const newUser: User = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
      username: username,
      nome: formData.get('nome') as string,
      password: formData.get('password') as string,
      role: formData.get('role') as UserRole,
    };

    try {
      await apiService.createUser(newUser);
      setUsers([newUser, ...users]);
      setIsAdding(false);
      onNotify?.("Usuário criado com sucesso!", "success");
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      onNotify?.('Erro ao criar usuário no banco de dados', 'error');
    }
  };

  const removeUser = async (id: string) => {
    if (users.length <= 1) {
      onNotify?.("Não é possível remover o único usuário.", "error");
      return;
    }
    
    try {
      await apiService.deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
      onNotify?.("Usuário removido.", "warning");
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
      onNotify?.('Erro ao remover usuário do banco de dados', 'error');
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tighter">
            <Users className="text-blue-600" /> Gestão de Usuários
          </h2>
          <p className="text-sm text-slate-500 font-medium">Controle quem pode acessar e gerenciar o sistema.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-slate-900 dark:bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg"
        >
          <UserPlus size={20} /> {isAdding ? 'CANCELAR' : 'NOVO USUÁRIO'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-blue-200 dark:border-slate-800 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Nome Completo</label>
              <input name="nome" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 font-medium" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Usuário (Login)</label>
              <input name="username" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 font-medium" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Senha Provisória</label>
              <input name="password" type="password" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 font-medium" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Perfil de Acesso</label>
              <select name="role" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 font-bold">
                <option value={UserRole.ADMIN}>Administrador (Acesso Total)</option>
                <option value={UserRole.OPERADOR}>Operador (Operacional)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">
                CADASTRAR USUÁRIO
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="p-6 text-left font-bold text-slate-500 uppercase text-[10px] tracking-widest">Identificação</th>
              <th className="p-6 text-left font-bold text-slate-500 uppercase text-[10px] tracking-widest">Usuário</th>
              <th className="p-6 text-center font-bold text-slate-500 uppercase text-[10px] tracking-widest">Perfil</th>
              <th className="p-6 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                      <UserIcon size={20} />
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">{u.nome}</span>
                  </div>
                </td>
                <td className="p-6 font-mono text-blue-600 dark:text-blue-400 font-bold">{u.username}</td>
                <td className="p-6 text-center">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${u.role === UserRole.ADMIN ? 'bg-red-100 text-red-700 dark:bg-red-900/30' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-6 text-right">
                  <button onClick={() => removeUser(u.id)} className="text-slate-200 hover:text-red-500 transition-colors p-2 opacity-0 group-hover:opacity-100">
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Usuarios;
