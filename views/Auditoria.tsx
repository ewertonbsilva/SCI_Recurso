import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, Trash2, Calendar, User, Activity, Database, FileText } from 'lucide-react';
import { apiService } from '../apiService';

interface LogAuditoria {
  id: string;
  timestamp: number;
  usuario: string;
  acao: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  modulo: string;
  entidade: string;
  id_entidade: string;
  dados_antigos?: any;
  dados_novos?: any;
  ip_address?: string;
  user_agent?: string;
}

const Auditoria: React.FC = () => {
  const [logs, setLogs] = useState<LogAuditoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState({
    modulo: '',
    acao: '',
    usuario: '',
    dataInicio: '',
    dataFim: ''
  });
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [logSelecionado, setLogSelecionado] = useState<LogAuditoria | null>(null);

  useEffect(() => {
    carregarLogs();
  }, [pagina, filtro]);

  const carregarLogs = async () => {
    try {
      setLoading(true);
      
      // Tentar carregar do localStorage primeiro
      const logsSalvos = localStorage.getItem('sci_auditoria_logs');
      let logsFiltrados: LogAuditoria[] = [];
      
      if (logsSalvos) {
        logsFiltrados = JSON.parse(logsSalvos);
      }
      
      // Se não houver logs, mostrar mensagem explicativa
      if (logsFiltrados.length === 0) {
        setLoading(false);
        setLogs([]);
        setTotalPaginas(0);
        return;
      }
      
      // Aplicar filtros
      if (filtro.modulo) {
        logsFiltrados = logsFiltrados.filter(log => 
          log.modulo.toLowerCase().includes(filtro.modulo.toLowerCase())
        );
      }
      
      if (filtro.acao) {
        logsFiltrados = logsFiltrados.filter(log => 
          log.acao.toLowerCase().includes(filtro.acao.toLowerCase())
        );
      }
      
      if (filtro.usuario) {
        logsFiltrados = logsFiltrados.filter(log => 
          log.usuario.toLowerCase().includes(filtro.usuario.toLowerCase())
        );
      }

      // Filtro de data
      if (filtro.dataInicio) {
        const dataInicio = new Date(filtro.dataInicio).getTime();
        logsFiltrados = logsFiltrados.filter(log => log.timestamp >= dataInicio);
      }
      
      if (filtro.dataFim) {
        const dataFim = new Date(filtro.dataFim);
        dataFim.setHours(23, 59, 59, 999); // Final do dia
        const dataFimTimestamp = dataFim.getTime();
        logsFiltrados = logsFiltrados.filter(log => log.timestamp <= dataFimTimestamp);
      }

      setLogs(logsFiltrados);
      setTotalPaginas(Math.ceil(logsFiltrados.length / 20));
    } catch (error) {
      console.error('Erro ao carregar logs de auditoria:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportarLogs = () => {
    const csv = [
      ['Data/Hora', 'Usuário', 'Ação', 'Módulo', 'Entidade', 'ID Entidade', 'Detalhes'],
      ...logs.map(log => [
        new Date(log.timestamp).toLocaleString('pt-BR'),
        log.usuario,
        log.acao,
        log.modulo,
        log.entidade,
        log.id_entidade,
        JSON.stringify(log.dados_novos || log.dados_antigos || {})
      ])
    ].map(row => row.join(';')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `auditoria_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getAcaoIcon = (acao: string) => {
    switch (acao) {
      case 'CREATE': return <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-xs font-bold">+</div>;
      case 'UPDATE': return <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xs font-bold">✓</div>;
      case 'DELETE': return <div className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center text-xs font-bold">-</div>;
      case 'LOGIN': return <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-xs font-bold">→</div>;
      case 'LOGOUT': return <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center text-xs font-bold">←</div>;
      default: return <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center text-xs font-bold">?</div>;
    }
  };

  const getAcaoColor = (acao: string) => {
    switch (acao) {
      case 'CREATE': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'UPDATE': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'DELETE': return 'text-red-600 bg-red-50 border-red-200';
      case 'LOGIN': return 'text-green-600 bg-green-50 border-green-200';
      case 'LOGOUT': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-2 h-full bg-primary opacity-20 group-hover:opacity-100 transition-opacity"></div>
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Gestão de <span className="text-primary">Auditoria</span></h3>
          <p className="text-sm text-slate-400 font-medium mt-1">Registro completo de todas as operações realizadas no sistema para fins de auditoria e segurança.</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">Módulo</label>
            <input
              type="text"
              value={filtro.modulo}
              onChange={e => setFiltro(prev => ({ ...prev, modulo: e.target.value }))}
              placeholder="Ex: Turnos, Equipes..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">Ação</label>
            <select
              value={filtro.acao}
              onChange={e => setFiltro(prev => ({ ...prev, acao: e.target.value }))}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              <option value="CREATE">Criação</option>
              <option value="UPDATE">Atualização</option>
              <option value="DELETE">Exclusão</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
            </select>
          </div>
          
          <div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">Usuário</label>
            <input
              type="text"
              value={filtro.usuario}
              onChange={e => setFiltro(prev => ({ ...prev, usuario: e.target.value }))}
              placeholder="Nome do usuário"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">Data Início</label>
            <input
              type="date"
              value={filtro.dataInicio}
              onChange={e => setFiltro(prev => ({ ...prev, dataInicio: e.target.value }))}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">Data Fim</label>
            <input
              type="date"
              value={filtro.dataFim}
              onChange={e => setFiltro(prev => ({ ...prev, dataFim: e.target.value }))}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <button
            onClick={carregarLogs}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-bold"
          >
            <Search size={16} /> Filtrar
          </button>
          <button
            onClick={exportarLogs}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 text-sm font-bold"
          >
            <Download size={16} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Lista de Logs */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-20 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Carregando logs de auditoria...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-20 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 italic">Nenhum registro encontrado com os filtros aplicados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="text-left p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Data/Hora</th>
                  <th className="text-left p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Usuário</th>
                  <th className="text-left p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Ação</th>
                  <th className="text-left p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Módulo</th>
                  <th className="text-left p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Entidade</th>
                  <th className="text-left p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Detalhes</th>
                  <th className="text-center p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={log.id} className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/50'}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {new Date(log.timestamp).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="text-xs text-slate-500">
                            {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{log.usuario}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getAcaoIcon(log.acao)}
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${getAcaoColor(log.acao)}`}>
                          {log.acao}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{log.modulo}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-slate-600 dark:text-slate-400">{log.entidade}</span>
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        ID: {log.id_entidade}
                        {log.ip_address && (
                          <div className="text-xs text-slate-500">IP: {log.ip_address}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setLogSelecionado(log)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-colors"
                        title="Ver detalhes"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Página {pagina} de {totalPaginas}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagina(prev => Math.max(1, prev - 1))}
                disabled={pagina === 1}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Anterior
              </button>
              <button
                onClick={() => setPagina(prev => Math.min(totalPaginas, prev + 1))}
                disabled={pagina === totalPaginas}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {logSelecionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Detalhes da Auditoria</h3>
                <button
                  onClick={() => setLogSelecionado(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Data/Hora</label>
                  <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">
                    {new Date(logSelecionado.timestamp).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Usuário</label>
                  <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">{logSelecionado.usuario}</p>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Ação</label>
                  <div className="flex items-center gap-2 mt-1">
                    {getAcaoIcon(logSelecionado.acao)}
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${getAcaoColor(logSelecionado.acao)}`}>
                      {logSelecionado.acao}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Módulo</label>
                  <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">{logSelecionado.modulo}</p>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Entidade</label>
                <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">
                  {logSelecionado.entidade} (ID: {logSelecionado.id_entidade})
                </p>
              </div>
              
              {logSelecionado.ip_address && (
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Endereço IP</label>
                  <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">{logSelecionado.ip_address}</p>
                </div>
              )}
              
              {(logSelecionado.dados_antigos || logSelecionado.dados_novos) && (
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Dados da Operação</label>
                  <div className="mt-2 space-y-2">
                    {logSelecionado.dados_antigos && (
                      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                        <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-2">Valores Anteriores:</p>
                        <pre className="text-xs text-red-700 dark:text-red-300 whitespace-pre-wrap">
                          {JSON.stringify(logSelecionado.dados_antigos, null, 2)}
                        </pre>
                      </div>
                    )}
                    {logSelecionado.dados_novos && (
                      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3">
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2">Valores Novos:</p>
                        <pre className="text-xs text-emerald-700 dark:text-emerald-300 whitespace-pre-wrap">
                          {JSON.stringify(logSelecionado.dados_novos, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auditoria;
