import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, User, Activity, Clock, Eye, Download, FileDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ToastType } from '../components/Toast';
import LogDetailModal from '../components/LogDetailModal';
import Pagination from '../components/Pagination';
import jsPDF from 'jspdf';

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
  const [limite] = useState(10);
  
  // Modal de detalhes
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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

  const openLogDetail = (log: LogEntry) => {
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  };

  const closeLogDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedLog(null);
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

  const exportarLogsPDF = () => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Configurações de estilo
      const headerColor = [41, 128, 185]; // Azul
      const textColor = [44, 62, 80]; // Azul escuro
      const borderColor = [189, 195, 199]; // Cinza claro
      const accentColor = [52, 152, 219]; // Azul mais claro

      // Cabeçalho
      pdf.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SCI RECURSO', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Sistema de Controle de Internação de Recursos', pageWidth / 2, 30, { align: 'center' });
      
      // Título do relatório
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RELATÓRIO DE LOGS', 20, 55);
      
      // Data de geração
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth - 20, 55, { align: 'right' });
      
      // Linha decorativa
      pdf.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
      pdf.setLineWidth(0.5);
      pdf.line(20, 65, pageWidth - 20, 65);
      
      yPosition = 75;

      // Filtros aplicados
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Filtros Aplicados:', 20, yPosition);
      yPosition += 8;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      
      const filtros = [];
      if (usuario) filtros.push(`Usuário: ${usuario}`);
      if (acao) filtros.push(`Ação: ${acao}`);
      if (entidade) filtros.push(`Entidade: ${entidade}`);
      if (dataInicio) filtros.push(`Data Início: ${new Date(dataInicio).toLocaleDateString('pt-BR')}`);
      if (dataFim) filtros.push(`Data Fim: ${new Date(dataFim).toLocaleDateString('pt-BR')}`);
      
      if (filtros.length > 0) {
        filtros.forEach(filtro => {
          pdf.text(`• ${filtro}`, 25, yPosition);
          yPosition += 6;
        });
      } else {
        pdf.text('• Nenhum filtro aplicado', 25, yPosition);
        yPosition += 6;
      }
      
      pdf.text(`• Total de Registros: ${total}`, 25, yPosition);
      yPosition += 15;

      // Cabeçalho da tabela
      pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      pdf.rect(20, yPosition, pageWidth - 40, 10, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Data/Hora', 25, yPosition + 7);
      pdf.text('Usuário', 60, yPosition + 7);
      pdf.text('Ação', 90, yPosition + 7);
      pdf.text('Entidade', 120, yPosition + 7);
      pdf.text('Descrição', 150, yPosition + 7);
      pdf.text('IP', 180, yPosition + 7);
      
      yPosition += 10;

      // Dados da tabela
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
      pdf.setFont('helvetica', 'normal');
      logs.forEach((log, index) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
          
          // Repetir cabeçalho
          pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
          pdf.rect(20, yPosition, pageWidth - 40, 10, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Data/Hora', 25, yPosition + 7);
          pdf.text('Usuário', 60, yPosition + 7);
          pdf.text('Ação', 90, yPosition + 7);
          pdf.text('Entidade', 120, yPosition + 7);
          pdf.text('Descrição', 150, yPosition + 7);
          pdf.text('IP', 180, yPosition + 7);
          
          yPosition += 10;
          pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
          pdf.setFont('helvetica', 'normal');
        }
        
        // Linha separadora
        if (index > 0) {
          pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
          pdf.line(20, yPosition, pageWidth - 20, yPosition);
        }
        
        pdf.text(formatDate(log.data_hora), 25, yPosition + 7);
        pdf.text(log.usuario, 60, yPosition + 7);
        pdf.text(log.acao, 90, yPosition + 7);
        pdf.text(log.entidade, 120, yPosition + 7);
        
        // Truncar descrição se for muito longa
        const descricao = log.descricao || '-';
        const maxDescLength = 25;
        const truncatedDesc = descricao.length > maxDescLength ? descricao.substring(0, maxDescLength) + '...' : descricao;
        pdf.text(truncatedDesc, 150, yPosition + 7);
        
        pdf.text(log.ip_address || '-', 180, yPosition + 7);
        
        yPosition += 10;
      });
      
      // Rodapé
      const totalPages = (pdf as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        
        // Linha do rodapé
        pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
        pdf.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);
        
        // Texto do rodapé
        pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        pdf.text('SCI RECURSO - Sistema de Controle de Internação de Recursos', pageWidth / 2, pageHeight - 5, { align: 'center' });
      }
      
      // Salvar o PDF
      pdf.save(`relatorio logs ${new Date().toISOString().split('T')[0]}.pdf`);
      onNotify?.('Relatório PDF gerado com sucesso', 'success');
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      onNotify?.('Erro ao gerar relatório PDF', 'error');
    }
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
    <div className="space-y-1">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Logs do Sistema</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Visualize todas as atividades registradas</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          24h: {stats?.ultimas_24h || 0}
        </div>
      </div>

      {/* Estatísticas */}
      {stats && !loadingStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
          <div className="bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-xs text-gray-600 dark:text-gray-400 mb-0.5">Ações</h3>
            <div className="space-y-0.5">
              {stats.acoes.slice(0, 3).map((item, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span className={`px-1 py-0.5 rounded text-xs font-medium ${getAcaoColor(item.acao)}`}>
                    {item.acao}
                  </span>
                  <span className="text-gray-500">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-xs text-gray-600 dark:text-gray-400 mb-0.5">Entidades</h3>
            <div className="space-y-0.5">
              {stats.entidades.slice(0, 3).map((item, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span className="font-medium truncate">{item.entidade}</span>
                  <span className="text-gray-500">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-xs text-gray-600 dark:text-gray-400 mb-0.5">Usuários</h3>
            <div className="space-y-0.5">
              {stats.usuarios.slice(0, 3).map((item, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span className="font-medium truncate flex items-center gap-1">
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
      <div className="bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-1">
          <Filter className="h-3 w-3" />
          <h3 className="font-semibold text-xs">Filtros</h3>
          <button
            onClick={clearFilters}
            className="ml-auto text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Limpar
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1">
          <input
            type="text"
            placeholder="Usuário"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
          />
          
          <select
            value={acao}
            onChange={(e) => setAcao(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
          >
            <option value="">Ações</option>
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
            className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
          />
          
          <input
            type="datetime-local"
            placeholder="Data início"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
          />
          
          <input
            type="datetime-local"
            placeholder="Data fim"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
          />
          
          <div className="text-xs text-gray-500 flex items-center gap-2">
            Total: {total}
            {logs.length > 0 && (
              <button
                onClick={exportarLogsPDF}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                title="Exportar para PDF"
              >
                <FileDown size={12} />
                PDF
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista de Logs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-20">
            <div className="text-center">
              <Activity className="mx-auto h-5 w-5 text-gray-400 animate-spin mb-1" />
              <p className="text-gray-500 text-xs">Carregando...</p>
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex items-center justify-center h-20">
            <div className="text-center">
              <Search className="mx-auto h-5 w-5 text-gray-400 mb-1" />
              <p className="text-gray-500 text-xs">Nenhum log</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-2 py-0.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-2 py-0.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-2 py-0.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ação
                  </th>
                  <th className="px-2 py-0.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Entidade
                  </th>
                  <th className="px-2 py-0.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-2 py-0.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    IP
                  </th>
                  <th className="px-2 py-0.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {logs.map((log) => (
                  <tr key={log.id_log} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-2 py-0.5 text-xs text-gray-900 dark:text-white">
                      {formatDate(log.data_hora)}
                    </td>
                    <td className="px-2 py-0.5 text-xs">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-gray-400" />
                        {log.usuario}
                      </div>
                    </td>
                    <td className="px-2 py-0.5 text-xs">
                      <span className={`px-1 py-0.5 rounded text-xs font-medium ${getAcaoColor(log.acao)}`}>
                        {log.acao}
                      </span>
                    </td>
                    <td className="px-2 py-0.5 text-xs font-medium">
                      {log.entidade}
                    </td>
                    <td className="px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400 max-w-xs truncate">
                      {log.descricao}
                    </td>
                    <td className="px-2 py-0.5 text-xs text-gray-500">
                      {log.ip_address}
                    </td>
                    <td className="px-2 py-0.5 text-xs">
                      <button
                        onClick={() => openLogDetail(log)}
                        className="inline-flex items-center gap-1 px-1 py-0.5 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-colors"
                        title="Ver detalhes"
                      >
                        <Eye size={10} />
                        Ver
                      </button>
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
        <div className="mt-2">
          <Pagination
            currentPage={pagina}
            totalPages={totalPaginas}
            onPageChange={setPagina}
          />
        </div>
      )}

      {/* Modal de Detalhes do Log */}
      <LogDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeLogDetail}
        log={selectedLog}
      />
    </div>
  );
};

export default LogsView;
