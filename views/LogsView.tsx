import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, User, Activity, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ToastType } from '../components/Toast';

interface LogEntry {
  id_log: string;
  data_hora: string;
  usuario: string;
  acao: string;
  entidade: string;
  registro_id?: string;
  descricao?: string;
  ip_address?: string;
  user_agent?: string;
}

interface LogStats {
  acoes: { acao: string; count: number }[];
  entidades: { entidade: string; count: number }[];
  usuarios: { usuario: string; count: number }[];
  ultimas_24h: number;
}

const LogsView: React.FC<{ onNotify?: (msg: string, type: ToastType) => void }> = ({ onNotify }) => {
  const { isAuthenticated } = useAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Filtros
  const [usuario, setUsuario] = useState('');
  const [acao, setAcao] = useState('');
  const [entidade, setEntidade] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  
  // Paginação
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [limite] = useState(50);

  useEffect(() => {
    console.log('=== VERIFICAÇÃO DE AUTENTICAÇÃO ===');
    console.log('isAuthenticated:', isAuthenticated);
    
    const token = localStorage.getItem('auth_token');
    console.log('Token no localStorage:', !!token);
    console.log('Token valor:', token?.substring(0, 20) + '...');
    
    if (!isAuthenticated || !token) {
      console.log('Usuário não autenticado ou sem token - não carregando dados');
      return;
    }
    
    console.log('Usuário autenticado com token válido, carregando dados...');
    loadLogs();
    loadStats();
  }, [isAuthenticated, usuario, acao, entidade, dataInicio, dataFim, pagina]);

  const loadLogs = async () => {
    try {
      console.log('=== INICIANDO LOADLOGS ===');
      setLoading(true);
      
      const token = localStorage.getItem('auth_token');
      console.log('Token disponível em loadLogs:', !!token);
      
      if (!token) {
        console.log('SEM TOKEN - não fazendo requisição');
        setLoading(false); // Importante: resetar loading
        throw new Error('Token não encontrado');
      }
      
      const params: any = {
        pagina: pagina.toString(),
        limite: limite.toString()
      };

      if (usuario) params.usuario = usuario;
      if (acao) params.acao = acao;
      if (entidade) params.entidade = entidade;
      if (dataInicio) params.data_inicio = dataInicio;
      if (dataFim) params.data_fim = dataFim;

      // Construir URL com query params
      const queryString = new URLSearchParams(params).toString();
      console.log('Fazendo requisição para:', `/api/logs?${queryString}`);
      console.log('Headers da requisição:', {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
      
      const response = await fetch(`http://192.168.88.2:3001/api/logs?${queryString}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        mode: 'cors'
      });

      console.log('Response status loadLogs:', response.status);
      console.log('Response headers loadLogs:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Resposta de erro loadLogs (text):', errorText);
        setLoading(false); // Importante: resetar loading
        
        if (errorText.includes('<!DOCTYPE')) {
          console.log('Detectado HTML em loadLogs - rota não encontrada ou servidor erro');
          throw new Error('Servidor indisponível ou rota não encontrada');
        }
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Dados dos logs carregados:', data);
      console.log('Setando logs:', data.logs || []);
      setLogs(data.logs || []);
      setTotal(data.total || 0);
      console.log('Setando total:', data.total || 0);
      console.log('Resetando loading para false');
      setLoading(false); // Forçar reset do loading
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      console.log('Erro - Resetando loading para false');
      setLoading(false); // Forçar reset do loading
      onNotify?.('Erro ao carregar logs', 'error');
    } finally {
      // Garantir que loading seja resetado
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      console.log('=== INICIANDO LOADSTATS ===');
      setLoadingStats(true);
      
      const token = localStorage.getItem('auth_token');
      console.log('Token disponível em loadStats:', !!token);
      
      if (!token) {
        console.log('SEM TOKEN em loadStats - não fazendo requisição');
        setLoadingStats(false); // Importante: resetar loading
        throw new Error('Token não encontrado');
      }
      
      console.log('Headers da requisição loadStats:', {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
      
      const response = await fetch(`http://192.168.88.2:3001/api/logs/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        mode: 'cors'
      });

      console.log('Response status loadStats:', response.status);
      console.log('Response headers loadStats:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Resposta de erro loadStats (text):', errorText);
        setLoadingStats(false); // Importante: resetar loading
        
        if (errorText.includes('<!DOCTYPE')) {
          console.log('Detectado HTML em loadStats - rota não encontrada ou servidor erro');
          throw new Error('Servidor indisponível ou rota não encontrada');
        }
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Dados das estatísticas:', data);
      setStats(data);
      console.log('Resetando loadingStats para false');
      setLoadingStats(false); // Forçar reset do loading
    } catch (error) {
      console.error('Erro completo ao carregar estatísticas:', error);
      console.log('Erro Stats - Resetando loadingStats para false');
      setLoadingStats(false); // Forçar reset do loading
      onNotify?.('Erro ao carregar estatísticas', 'error');
    } finally {
      // Garantir que loadingStats seja resetado
      setLoadingStats(false);
    }
  };

  const clearFilters = () => {
    setUsuario('');
    setAcao('');
    setEntidade('');
    setDataInicio('');
    setDataFim('');
    setPagina(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getAcaoColor = (acao: string) => {
    switch (acao) {
      case 'CREATE': return 'text-green-600 bg-green-50';
      case 'UPDATE': return 'text-blue-600 bg-blue-50';
      case 'DELETE': return 'text-red-600 bg-red-50';
      case 'LOGIN': return 'text-emerald-600 bg-emerald-50';
      case 'LOGOUT': return 'text-orange-600 bg-orange-50';
      case 'READ': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const totalPaginas = Math.ceil(total / limite);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 mb-4">Faça login para acessar os logs</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Logs do Sistema</h2>
          <p className="text-gray-500 dark:text-gray-400">Visualize todas as atividades registradas</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          Últimas 24h: {stats?.ultimas_24h || 0}
        </div>
      </div>

      {/* Estatísticas */}
      {stats && !loadingStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-2">Ações Mais Comuns</h3>
            <div className="space-y-1">
              {stats.acoes.slice(0, 3).map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getAcaoColor(item.acao)}`}>
                    {item.acao}
                  </span>
                  <span className="text-gray-500">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-2">Entidades Acessadas</h3>
            <div className="space-y-1">
              {stats.entidades.slice(0, 3).map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="font-medium">{item.entidade}</span>
                  <span className="text-gray-500">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-2">Usuários Ativos</h3>
            <div className="space-y-1">
              {stats.usuarios.slice(0, 3).map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="font-medium flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {item.usuario}
                  </span>
                  <span className="text-gray-500">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4" />
          <h3 className="font-semibold">Filtros</h3>
          <button
            onClick={clearFilters}
            className="ml-auto text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Limpar filtros
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <input
            type="text"
            placeholder="Usuário"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
          />
          
          <select
            value={acao}
            onChange={(e) => setAcao(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
          >
            <option value="">Todas as ações</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="LOGIN">LOGIN</option>
            <option value="LOGOUT">LOGOUT</option>
            <option value="READ">READ</option>
          </select>
          
          <input
            type="text"
            placeholder="Entidade"
            value={entidade}
            onChange={(e) => setEntidade(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
          />
          
          <input
            type="datetime-local"
            placeholder="Data início"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
          />
          
          <input
            type="datetime-local"
            placeholder="Data fim"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
          />
          
          <div className="text-sm text-gray-500 flex items-center">
            Total: {total} registros
          </div>
        </div>
      </div>

      {/* Lista de Logs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Activity className="mx-auto h-8 w-8 text-gray-400 animate-spin mb-2" />
              <p className="text-gray-500">Carregando logs...</p>
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Search className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-500">Nenhum log encontrado</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ação
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Entidade
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    IP
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {logs.map((log) => (
                  <tr key={log.id_log} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {formatDate(log.data_hora)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-gray-400" />
                        {log.usuario}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getAcaoColor(log.acao)}`}>
                        {log.acao}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {log.entidade}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                      {log.descricao}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {log.ip_address}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPagina(pagina - 1)}
            disabled={pagina === 1}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50"
          >
            Anterior
          </button>
          
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Página {pagina} de {totalPaginas}
          </span>
          
          <button
            onClick={() => setPagina(pagina + 1)}
            disabled={pagina === totalPaginas}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
};

export default LogsView;
