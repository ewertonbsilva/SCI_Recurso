
import React, { useState } from 'react';
import { Send, FileText, Clock, AlertTriangle, Info, User, Trash2, Users } from 'lucide-react';
import { loadData, saveData, getCurrentUser } from '../store';
import { LogOperacional } from '../types';
import { apiService } from '../apiService';

const OperationalLog: React.FC = () => {
  const [data, setData] = useState(loadData());
  const [logs, setLogs] = useState<LogOperacional[]>([]);
  const [turnos, setTurnos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [categoria, setCategoria] = useState<LogOperacional['categoria']>('Informativo');
  const user = getCurrentUser();

  React.useEffect(() => {
    loadDadosFromAPI();
  }, []);

  const loadDadosFromAPI = async () => {
    try {
      setLoading(true);
      const [turnosData, logsData] = await Promise.all([
        apiService.getTurnos(),
        apiService.getLogs()
      ]);
      setTurnos(turnosData);
      setLogs(logsData);
      console.log('Dados de logs carregados:', { turnos: turnosData, logs: logsData });
    } catch (error) {
      console.error('Erro ao carregar dados de logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentTurno = [...turnos].sort((a,b) => b.data.localeCompare(a.data))[0];

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim() || !user || !currentTurno) return;

    const newLog: LogOperacional = {
      id: crypto.randomUUID(),
      id_turno: currentTurno.idTurno,
      timestamp: Date.now(),
      mensagem: msg.trim(),
      categoria,
      usuario: user.nome
    };

    try {
      await apiService.createLog(newLog);
      setLogs([newLog, ...logs]);
      setMsg('');
      console.log('Log adicionado com sucesso:', newLog);
    } catch (error) {
      console.error('Erro ao adicionar log:', error);
    }
  };

  const removeLog = async (id: string) => {
    try {
      await apiService.deleteLog(id);
      setLogs(logs.filter(l => l.id !== id));
      console.log('Log removido com sucesso:', id);
    } catch (error) {
      console.error('Erro ao remover log:', error);
    }
  };

  const currentLogs = logs.filter(l => l.id_turno === currentTurno?.idTurno);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tighter">
          <FileText className="text-blue-600" /> Diário de Operações
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Registro cronológico de eventos e ocorrências do turno atual.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
        <form onSubmit={handleAddLog} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <select 
              value={categoria} 
              onChange={e => setCategoria(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Informativo">🟢 Informativo</option>
              <option value="Equipe">🔵 Movimentação Equipe</option>
              <option value="Urgente">🔴 Ocorrência Urgente</option>
            </select>
            <div className="flex-1 relative">
              <input 
                value={msg}
                onChange={e => setMsg(e.target.value)}
                placeholder="Descreva o evento..."
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-4 pr-12 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all">
                <Send size={18} />
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {currentLogs.map(log => (
          <div key={log.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex gap-4 animate-in slide-in-from-left-4 duration-300">
            <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
              log.categoria === 'Urgente' ? 'bg-red-100 text-red-600 dark:bg-red-950' : 
              log.categoria === 'Equipe' ? 'bg-blue-100 text-blue-600 dark:bg-blue-950' : 
              'bg-emerald-100 text-emerald-600 dark:bg-emerald-950'
            }`}>
              {log.categoria === 'Urgente' ? <AlertTriangle size={20} /> : log.categoria === 'Equipe' ? <Users size={20} /> : <Info size={20} />}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                    <Clock size={10} /> {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                    <User size={10} /> {log.usuario}
                  </span>
                </div>
                <button onClick={() => removeLog(log.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{log.mensagem}</p>
            </div>
          </div>
        ))}
        {currentLogs.length === 0 && (
          <div className="py-20 text-center text-slate-400 dark:text-slate-600 italic border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            Nenhum registro para o turno selecionado.
          </div>
        )}
      </div>
    </div>
  );
};

export default OperationalLog;
