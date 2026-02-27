
import React, { useState, useEffect } from 'react';
import {
    Users,
    Shield,
    MapPin,
    Building2,
    Award,
    Plus,
    Trash2,
    Edit2,
    Save,
    X,
    UserPlus,
    Type,
    Lock,
    Key,
    UserCircle,
    User as UserIcon
} from 'lucide-react';
import { User, UserRole } from '../types';
import { ToastType } from '../components/Toast';
import { apiService } from '../apiService';

interface ConfiguracoesProps {
    onNotify?: (msg: string, type: ToastType) => void;
}

type TabType = 'usuarios' | 'forcas' | 'postos' | 'orgaos' | 'ubms';

const Configuracoes: React.FC<ConfiguracoesProps> = ({ onNotify }) => {
    const [activeTab, setActiveTab] = useState<TabType>('usuarios');
    const [loading, setLoading] = useState(false);

    // States for different data
    const [users, setUsers] = useState<User[]>([]);
    const [forcas, setForcas] = useState<any[]>([]);
    const [postos, setPostos] = useState<any[]>([]);
    const [orgaos, setOrgaos] = useState<any[]>([]);
    const [ubms, setUbms] = useState<any[]>([]);

    // States for UI
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | number | null>(null);
    const [editingItem, setEditingItem] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        setIsAdding(false);
        setEditingId(null);
        setEditingItem(null);
        try {
            switch (activeTab) {
                case 'usuarios':
                    const userData = await apiService.getUsers();
                    setUsers(userData);
                    break;
                case 'forcas':
                    const forcaData = await apiService.getForcas();
                    setForcas(forcaData);
                    break;
                case 'postos':
                    const postoData = await apiService.getPostosGrad();
                    setPostos(postoData);
                    break;
                case 'orgaos':
                    const orgaoData = await apiService.getOrgaosOrigem();
                    setOrgaos(orgaoData);
                    break;
                case 'ubms':
                    const ubmData = await apiService.getUBMs();
                    setUbms(ubmData);
                    break;
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            onNotify?.("Erro ao carregar dados do banco.", "error");
        } finally {
            setLoading(false);
        }
    };

    // --- User Management Handlers ---
    const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const userData = {
            username: formData.get('username') as string,
            nome: formData.get('nome') as string,
            password: formData.get('password') as string,
            role: formData.get('role') as UserRole,
        };

        try {
            if (editingId) {
                await apiService.updateUser(editingId as string, userData);
                setUsers(users.map(u => u.id === editingId ? { ...u, ...userData } : u));
                onNotify?.("Usuário atualizado com sucesso!", "success");
            } else {
                const newUser = { id: crypto.randomUUID(), ...userData };
                await apiService.createUser(newUser);
                setUsers([newUser as User, ...users]);
                onNotify?.("Usuário criado com sucesso!", "success");
            }
            setIsAdding(false);
            setEditingId(null);
            setEditingItem(null);
        } catch (error) {
            onNotify?.("Erro ao salvar usuário.", "error");
        }
    };

    const removeUser = async (id: string) => {
        if (users.length <= 1) {
            onNotify?.("Não é possível remover o único usuário.", "error");
            return;
        }
        if (!confirm("Tem certeza que deseja remover este usuário?")) return;
        try {
            await apiService.deleteUser(id);
            setUsers(users.filter(u => u.id !== id));
            onNotify?.("Usuário removido.", "warning");
        } catch (error) {
            onNotify?.("Erro ao remover usuário.", "error");
        }
    };

    const resetPassword = async (id: string, username: string) => {
        const newPassword = prompt(`Digite a nova senha para o usuário @${username}:`);
        
        if (!newPassword || newPassword.trim() === '') {
            onNotify?.("Senha não pode ser vazia.", "error");
            return;
        }

        if (newPassword.length < 4) {
            onNotify?.("Senha deve ter pelo menos 4 caracteres.", "error");
            return;
        }

        try {
            await apiService.resetUserPassword(id, newPassword);
            onNotify?.(`Senha do usuário @${username} redefinida com sucesso!`, "success");
        } catch (error) {
            onNotify?.("Erro ao redefinir senha.", "error");
        }
    };

    // --- CRUD for Generic Enums ---
    const handleSaveItem = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        try {
            let result;
            switch (activeTab) {
                case 'forcas':
                    if (editingId) {
                        result = await apiService.updateForca(editingId as number, { nome_forca: formData.get('nome') as string });
                        setForcas(forcas.map(i => i.id_forca === editingId ? result : i));
                    } else {
                        result = await apiService.createForca({ nome_forca: formData.get('nome') as string });
                        setForcas([...forcas, result]);
                    }
                    break;
                case 'postos':
                    const postoData = {
                        nome_posto_grad: formData.get('nome') as string,
                        hierarquia: parseInt(formData.get('hierarquia') as string)
                    };
                    if (editingId) {
                        result = await apiService.updatePostoGrad(editingId as number, postoData);
                        setPostos(postos.map(i => i.id_posto_grad === editingId ? result : i));
                    } else {
                        result = await apiService.createPostoGrad(postoData);
                        setPostos([...postos, result]);
                    }
                    break;
                case 'orgaos':
                    if (editingId) {
                        result = await apiService.updateOrgaoOrigem(editingId as number, { nome_orgao: formData.get('nome') as string });
                        setOrgaos(orgaos.map(i => i.id_orgao_origem === editingId ? result : i));
                    } else {
                        result = await apiService.createOrgaoOrigem({ nome_orgao: formData.get('nome') as string });
                        setOrgaos([...orgaos, result]);
                    }
                    break;
                case 'ubms':
                    const ubmName = formData.get('nome') as string;
                    if (editingId) {
                        result = await apiService.updateUBM(editingId as string, { nome_ubm: ubmName });
                        setUbms(ubms.map(i => i.id_ubm === editingId ? result : i));
                    } else {
                        const ubmId = ubmName.toUpperCase().replace(/\s+/g, '_');
                        result = await apiService.createUBM({ id_ubm: ubmId, nome_ubm: ubmName });
                        setUbms([...ubms, result]);
                    }
                    break;
            }
            setIsAdding(false);
            setEditingId(null);
            setEditingItem(null);
            onNotify?.("Item salvo com sucesso!", "success");
        } catch (error) {
            onNotify?.("Erro ao salvar item.", "error");
        }
    };

    const removeItem = async (id: string | number) => {
        if (!confirm("Tem certeza que deseja remover este item?")) return;
        try {
            switch (activeTab) {
                case 'forcas':
                    await apiService.deleteForca(id as number);
                    setForcas(forcas.filter(i => i.id_forca !== id));
                    break;
                case 'postos':
                    await apiService.deletePostoGrad(id as number);
                    setPostos(postos.filter(i => i.id_posto_grad !== id));
                    break;
                case 'orgaos':
                    await apiService.deleteOrgaoOrigem(id as number);
                    setOrgaos(orgaos.filter(i => i.id_orgao_origem !== id));
                    break;
                case 'ubms':
                    await apiService.deleteUBM(id as number);
                    setUbms(ubms.filter(i => i.id_ubm !== id));
                    break;
            }
            onNotify?.("Item removido com sucesso.", "warning");
        } catch (error: any) {
            const msg = error.details || "Erro ao remover item. Pode haver registros vinculados.";
            onNotify?.(msg, "error");
        }
    };

    const renderTabs = () => {
        const tabs = [
            { id: 'usuarios', label: 'Usuários', icon: <Users size={18} /> },
            { id: 'forcas', label: 'Forças', icon: <Shield size={18} /> },
            { id: 'postos', label: 'Postos/Grad', icon: <Award size={18} /> },
            { id: 'orgaos', label: 'Órgãos', icon: <Building2 size={18} /> },
            { id: 'ubms', label: 'UBMs', icon: <MapPin size={18} /> },
        ];

        return (
            <div className="flex flex-wrap gap-2 mb-10 p-2 bg-slate-100/50 dark:bg-slate-800/30 backdrop-blur-md rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/50 shadow-inner justify-between">
                <div className="flex flex-wrap gap-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={`
                              relative flex items-center gap-2 px-4 py-2.5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all duration-300 overflow-hidden group
                              ${activeTab === tab.id
                                    ? 'bg-white dark:bg-slate-900 text-primary shadow-xl scale-105'
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'}
                            `}
                        >
                            {activeTab === tab.id && (
                                <span className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent animate-pulse"></span>
                            )}
                            <span className={`transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                                {tab.icon}
                            </span>
                            <span className="relative z-10 text-[10px]">{tab.label}</span>
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="relative flex items-center gap-2 px-4 py-2.5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all duration-300 overflow-hidden group bg-slate-900 dark:bg-primary text-white hover:scale-105 active:scale-95 shadow-xl"
                >
                    {isAdding ? <X size={18} /> : (activeTab === 'usuarios' ? <UserPlus size={18} /> : <Plus size={18} />)}
                    <span className="relative z-10 text-[10px]">{isAdding ? 'CANCELAR' : 'NOVO'}</span>
                </button>
            </div>
        );
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center p-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                </div>
            );
        }

        switch (activeTab) {
            case 'usuarios': return renderUsuariosTable();
            case 'forcas': return renderGenericTable('id_forca', 'nome_forca', 'forcas');
            case 'postos': return renderPostosTable();
            case 'orgaos': return renderGenericTable('id_orgao_origem', 'nome_orgao', 'orgaos_origem');
            case 'ubms': return renderGenericTable('id_ubm', 'nome_ubm', 'ubms');
        }
    };

    const renderUsuariosTable = () => (
        <div className="space-y-4">

            {isAdding && (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border-2 border-primary/20 dark:border-primary/10 shadow-xl animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                    <form onSubmit={handleSaveUser} className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-3">Nome Completo</label>
                            <div className="relative group/input">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within/input:text-primary transition-colors">
                                    <UserCircle size={18} />
                                </div>
                                <input name="nome" defaultValue={editingItem?.nome} required placeholder="Ex: João Silva" className="w-full pl-12 pr-5 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-primary/15 transition-all font-bold text-slate-700 dark:text-white text-sm" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-3">Usuário (Login)</label>
                            <div className="relative group/input">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within/input:text-primary transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input name="username" defaultValue={editingItem?.username} required placeholder="ex: joao.silva" className="w-full pl-12 pr-5 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-primary/15 transition-all font-bold text-slate-700 dark:text-white text-sm" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-3">Senha {editingId ? '(Vazio para manter)' : 'Provisória'}</label>
                            <div className="relative group/input">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within/input:text-primary transition-colors">
                                    <Key size={18} />
                                </div>
                                <input name="password" type="password" required={!editingId} placeholder="••••••••" className="w-full pl-12 pr-5 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-primary/15 transition-all font-bold text-slate-700 dark:text-white text-sm" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-3">Perfil de Acesso</label>
                            <div className="relative group/input">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within/input:text-primary transition-colors">
                                    <Shield size={18} />
                                </div>
                                <select name="role" defaultValue={editingItem?.role} required className="w-full pl-12 pr-5 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-primary/15 transition-all font-bold text-slate-700 dark:text-white text-sm appearance-none">
                                    <option value="">Selecione...</option>
                                    <option value="Administrador">Administrador</option>
                                    <option value="Operador">Operador</option>
                                </select>
                            </div>
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-3">
                            <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); setEditingItem(null); }} className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-slate-600 transition-all">
                                CANCELAR
                            </button>
                            <button type="submit" className="px-8 py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                                <Save size={18} /> {editingId ? 'ATUALIZAR' : 'CADASTRAR'} USUÁRIO
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                            <th className="p-4 text-left font-black text-slate-400 uppercase text-[9px] tracking-[0.2em]">Nome do Operador</th>
                            <th className="p-4 text-left font-black text-slate-400 uppercase text-[9px] tracking-[0.2em]">Identificação</th>
                            <th className="p-4 text-center font-black text-slate-400 uppercase text-[9px] tracking-[0.2em]">Status de Acesso</th>
                            <th className="p-4 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all group">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors border border-slate-200 dark:border-slate-600 shadow-sm">
                                            <UserIcon size={20} />
                                        </div>
                                        <span className="font-black text-slate-700 dark:text-slate-200 text-sm">{u.nome}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="font-mono text-[9px] font-black py-1 px-2 bg-primary/5 text-primary rounded-md border border-primary/10">
                                        @{u.username}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${u.role === UserRole.ADMIN ? 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/20 dark:border-red-900/30' : 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/30'}`}>
                                        <div className={`w-1 h-1 rounded-full animate-pulse ${u.role === UserRole.ADMIN ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-3 group-hover:translate-x-0 duration-300">
                                        <button onClick={() => { setEditingId(u.id); setEditingItem(u); setIsAdding(true); }} className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-500 hover:bg-blue-500 hover:text-white rounded-lg transition-all shadow-sm" title="Editar usuário">
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => resetPassword(u.id, u.username)} className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-500 hover:bg-amber-500 hover:text-white rounded-lg transition-all shadow-sm" title="Redefinir senha">
                                            <Key size={14} />
                                        </button>
                                        <button onClick={() => removeUser(u.id)} className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all shadow-sm" title="Excluir usuário">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderGenericTable = (idKey: string, nameKey: string, tableLabel: string) => {
        const data = activeTab === 'forcas' ? forcas : (activeTab === 'orgaos' ? orgaos : ubms);

        return (
            <div className="space-y-6">

                {(isAdding || editingId) && (
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-primary/20 dark:border-primary/10 shadow-xl animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                        <form onSubmit={handleSaveItem} className="relative z-10 flex flex-col md:flex-row gap-4">
                            <div className="flex-1 space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-3">Nome da Entrada</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within/input:text-primary transition-colors">
                                        <Type size={16} />
                                    </div>
                                    <input
                                        name="nome"
                                        defaultValue={editingItem?.[nameKey]}
                                        required
                                        autoFocus
                                        placeholder="Digite o nome..."
                                        className="w-full pl-12 pr-5 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary/50 transition-all font-bold text-slate-700 dark:text-white placeholder:text-slate-300 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="flex items-end">
                                <button type="submit" className="w-full md:w-auto px-8 h-[50px] bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                                    <Save size={16} /> {editingId ? 'ATUALIZAR' : 'SALVAR'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200/60 dark:border-slate-800/60 p-8 shadow-sm">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {data.map(item => (
                            <div key={item[idKey]} className="bg-slate-50/50 dark:bg-slate-800/30 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all group">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-slate-700 dark:text-slate-200 text-sm tracking-tight break-words leading-tight">
                                            {item[nameKey]}
                                        </h3>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0 duration-300">
                                        <button
                                            onClick={() => { setEditingId(item[idKey]); setEditingItem(item); setIsAdding(false); }}
                                            className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-500 hover:bg-blue-500 hover:text-white rounded-md transition-all shadow-sm"
                                            title="Editar"
                                        >
                                            <Edit2 size={12} />
                                        </button>
                                        <button
                                            onClick={() => removeItem(item[idKey])}
                                            className="p-1.5 bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white rounded-md transition-all shadow-sm"
                                            title="Excluir"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderPostosTable = () => (
        <div className="space-y-6">

            {(isAdding || editingId) && (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-blue-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-4">
                    <form onSubmit={handleSaveItem} className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Descrição (Ex: 1º SGT)</label>
                            <input name="nome" defaultValue={editingItem?.nome_posto_grad} required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 font-bold" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Hierarquia (Ordem)</label>
                            <input name="hierarquia" type="number" defaultValue={editingItem?.hierarquia} required placeholder="Ex: 5" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 font-bold" />
                        </div>
                        <div className="col-span-3">
                            <button type="submit" className="w-full py-4 bg-primary text-white rounded-2xl font-black hover:opacity-90 shadow-lg shadow-blue-500/20 transition-all">
                                {editingId ? 'ATUALIZAR' : 'SALVAR'} POSTO/GRADUAÇÃO
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200/60 dark:border-slate-800/60 p-8 shadow-sm">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {postos.map(item => (
                            <div key={item.id_posto_grad} className="bg-slate-50/50 dark:bg-slate-800/30 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all group">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-slate-900 dark:text-white text-sm tracking-tighter uppercase break-words leading-tight">
                                            {item.nome_posto_grad}
                                        </h3>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0 duration-300">
                                        <button 
                                            onClick={() => { setEditingId(item.id_posto_grad); setEditingItem(item); setIsAdding(false); }} 
                                            className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-500 hover:bg-blue-500 hover:text-white rounded-md transition-all shadow-sm"
                                            title="Editar"
                                        >
                                            <Edit2 size={12} />
                                        </button>
                                        <button 
                                            onClick={() => removeItem(item.id_posto_grad)} 
                                            className="p-1.5 bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white rounded-md transition-all shadow-sm"
                                            title="Excluir"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
        </div>
    );

    return (
        <div className="space-y-12 pb-24 page-transition">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-[3.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl animate-pulse"></div>
                    <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-2 py-1 bg-primary/10 text-primary rounded-full text-[8px] font-black uppercase tracking-[0.2em] mb-2">
                                <Shield size={10} /> Painel Administrativo
                            </div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tighter leading-none">
                                Configurações do <span className="text-primary dark:text-blue-400">Sistema</span>
                            </h2>
                            <p className="text-slate-400 font-medium mt-2 max-w-xl text-sm">
                                Central de controle para gestão de acessos, parâmetros operacionais e integridade do banco de dados.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-primary">
                                <Building2 size={18} />
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Base de Dados</p>
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">MySQL Online</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {renderTabs()}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {renderContent()}
            </div>
        </div>
    );
};

export default Configuracoes;
