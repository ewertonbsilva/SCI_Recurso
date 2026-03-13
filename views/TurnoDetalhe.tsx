import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Trash2, UserPlus, ListChecks, Eraser, Shield, UserCircle, Check, Ship, Waves, ShieldAlert, ChevronLeft, ChevronRightIcon, CheckCircle, XCircle, ArrowRightLeft, FileText, Settings, Flame } from 'lucide-react';
import { apiService } from '../apiService';
import { useAuth } from '../contexts/AuthContext';
import { FuncaoMilitar, StatusPresenca, StatusEquipe, CadastroMilitar, CadastroCivil } from '../types';
import type { ChamadaMilitar, ChamadaCivil, AtestadoMedico, Turno } from '../types';
import { ToastType } from '../components/Toast';

interface TurnoDetalheProps {
  id_turno: string;
  onBack: () => void;
  onNotify?: (msg: string, type: ToastType) => void;
}

const parseLocalDate = (dateStr: string) => {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const isMilitarRestricted = (militar: CadastroMilitar, atestados: AtestadoMedico[]) => {
  if (militar.restricao_medica) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return atestados.some(at => {
    if (at.matricula !== militar.matricula) return false;
    const inicio = parseLocalDate(at.data_inicio);
    inicio.setHours(0, 0, 0, 0);
    const fim = new Date(inicio);
    fim.setDate(inicio.getDate() + (at.dias - 1));
    fim.setHours(23, 59, 59, 999);
    return today >= inicio && today <= fim;
  });
};

const getMilitarActiveAtestado = (matricula: string, atestados: AtestadoMedico[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return atestados.find(at => {
    if (at.matricula !== matricula) return false;
    const inicio = parseLocalDate(at.data_inicio);
    inicio.setHours(0, 0, 0, 0);
    const fim = new Date(inicio);
    fim.setDate(inicio.getDate() + (at.dias - 1));
    fim.setHours(23, 59, 59, 999);
    return today >= inicio && today <= fim;
  });
};

const TurnoDetalhe: React.FC<TurnoDetalheProps> = ({ id_turno, onBack, onNotify }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [chamadaMilitar, setChamadaMilitar] = useState<ChamadaMilitar[]>([]);
  const [chamadaCivil, setChamadaCivil] = useState<ChamadaCivil[]>([]);
  const [militares, setMilitares] = useState<CadastroMilitar[]>([]);
  const [civis, setCivis] = useState<CadastroCivil[]>([]);
  const [atestados, setAtestados] = useState<AtestadoMedico[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'militar' | 'civil' | 'chamada'>('militar');
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingSelection, setPendingSelection] = useState<string[]>([]);
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = activeSubTab === 'chamada' ? 21 : 12; // 21 militares por página (3 linhas × 7 colunas) ou 12 itens por página (4 linhas × 3 colunas)
  
  // Estado para pesquisa na escala
  const [escalaSearchTerm, setEscalaSearchTerm] = useState('');

  useEffect(() => {
    // Resetar para página 1 quando mudar de aba ou pesquisar
    setCurrentPage(1);
  }, [activeSubTab, escalaSearchTerm]);

  useEffect(() => {
    // Só carregar dados quando autenticação estiver completa e usuário estiver autenticado
    if (!authLoading && isAuthenticated) {
      loadDadosFromAPI();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, id_turno]);

  const loadDadosFromAPI = async () => {
    try {
      setLoading(true);
      console.log('Procurando turno com ID:', id_turno);
      const [turnosData, chamadaMilData, chamadaCivData, militaresData, civisData, atestadosData] = await Promise.all([
        apiService.getTurnos(),
        apiService.getChamadaMilitar(id_turno),
        apiService.getChamadaCivil(id_turno),
        apiService.getMilitares(),
        apiService.getCivis(),
        apiService.getAtestados()
      ]);
      setTurnos(turnosData);
      setChamadaMilitar(chamadaMilData);
      setChamadaCivil(chamadaCivData);
      setMilitares(militaresData);
      setCivis(civisData);
      setAtestados(atestadosData);
      console.log('Dados do turno carregados:', { turnos: turnosData, chamadaMil: chamadaMilData, chamadaCiv: chamadaCivData });
      console.log('Turnos disponíveis:', turnosData.map(t => ({ id: t.id_turno, data: t.data, periodo: t.periodo })));
    } catch (error) {
      console.error('Erro ao carregar dados do turno:', error);
      onNotify?.('Erro ao carregar dados do banco de dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  const flattenData = (items: any[]): any[] => {
    if (!items || !Array.isArray(items)) return [];
    if (items.length > 0 && Array.isArray(items[0])) {
      return items[0];
    }
    return items;
  };

  const turno = flattenData([...turnos]).find(t => t.id_turno === id_turno);
  if (loading) return <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-widest">Carregando...</div>;
  if (!turno) return <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-widest">Turno não encontrado.</div>;

  const dataFormatada = new Date(turno.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

  const addMilitar = async () => {
    if (pendingSelection.length === 0) return;
    try {
      const newEntries = pendingSelection.map(matricula => ({
        id_chamada_militar: crypto.randomUUID(),
        id_turno,
        matricula,
        funcao: FuncaoMilitar.COMBATENTE,
        presenca: StatusPresenca.AUSENTE
      }));
      
      console.log('Dados enviados:', newEntries[0]); // Debug
      
      // Enviar cada militar individualmente
      for (const entry of newEntries) {
        await apiService.createChamadaMilitar(entry);
      }
      
      setChamadaMilitar(prev => [...prev, ...newEntries]);
      onNotify?.(`${newEntries.length} militar(es) adicionado(s).`, "success");
    } catch (error) {
      console.error('Erro ao adicionar militar:', error);
      onNotify?.('Erro ao adicionar militar no banco de dados', 'error');
    }
    setPendingSelection([]);
  };

  const addCivil = async () => {
    const newEntries: ChamadaCivil[] = pendingSelection.map(id => ({
      id_chamada_civil: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
      id_turno: id_turno,
      id_civil: id,
      quant_civil: 0,
      status: StatusEquipe.LIVRE,
      last_status_update: Date.now(),
      bairro: ''
    }));

    if (newEntries.length > 0) {
      try {
        // Salvar na API primeiro
        for (const entry of newEntries) {
          await apiService.createChamadaCivil(entry);
        }

        // Atualizar estado local
        setChamadaCivil(prev => [...prev, ...newEntries]);
        onNotify?.(`${newEntries.length} civil(is) adicionado(s).`, "success");
      } catch (error) {
        console.error('Erro ao adicionar civil:', error);
        onNotify?.('Erro ao adicionar civil no banco de dados', 'error');
      }
    }
    setPendingSelection([]);
  };

  // Função para obter cores e ícones para cada status
  const getStatusConfig = (status: StatusPresenca) => {
    switch (status) {
      case StatusPresenca.PRESENTE:
        return {
          bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40',
          label: 'PRESENTE',
          icon: '✓'
        };
      case StatusPresenca.AUSENTE:
        return {
          bg: 'bg-red-100 text-red-700 dark:bg-red-900/40',
          label: 'AUSENTE',
          icon: '✗'
        };
      case StatusPresenca.PERMUTA:
        return {
          bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40',
          label: 'PERMUTA',
          icon: '↔'
        };
      case StatusPresenca.ATESTADO:
        return {
          bg: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40',
          label: 'ATESTADO',
          icon: '📋'
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 dark:bg-slate-900/40',
          label: 'AUSENTE',
          icon: '✗'
        };
    }
  };

  // Função para obter cores para função
  const getFuncaoConfig = (funcao: FuncaoMilitar) => {
    switch (funcao) {
      case FuncaoMilitar.SCI:
        return {
          bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40',
          label: 'SCI'
        };
      case FuncaoMilitar.COMBATENTE:
        return {
          bg: 'bg-red-100 text-red-700 dark:bg-red-900/40',
          label: 'COMBATENTE'
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 dark:bg-slate-900/40',
          label: 'COMBATENTE'
        };
    }
  };

  const updateChamadaMil = async (id: string, updates: Partial<ChamadaMilitar>) => {
    try {
      // Encontrar o registro atual para obter o id_turno e função atual
      const currentChamada = chamadaMilitar.find(cm => cm.id_chamada_militar === id);
      if (!currentChamada) {
        throw new Error('Chamada militar não encontrada');
      }
      
      // Incluir o id_turno, matricula e função atual nas atualizações
      const updateData = {
        id_turno: currentChamada.id_turno,
        matricula: currentChamada.matricula,
        funcao: currentChamada.funcao, // Manter função atual
        ...updates // Aplicar apenas as atualizações enviadas
      };
      
      await apiService.updateChamadaMilitar(id, updateData);
      setChamadaMilitar(prev => prev.map(m => m.id_chamada_militar === id ? { ...m, ...updates } : m));
    } catch (error) {
      console.error('Erro ao atualizar chamada militar:', error);
    }
  };

  const updateChamadaCiv = async (id: string, updates: Partial<ChamadaCivil>) => {
    try {
      await apiService.updateChamadaCivil(id, updates);
      setChamadaCivil(prev => prev.map(c => c.id_chamada_civil === id ? { ...c, ...updates } : c));
    } catch (error: any) {
      console.error('Erro ao atualizar chamada civil:', error);

      // Handle 404 errors - record may have been deleted or data is stale
      if (error.message && error.message.includes('404')) {
        console.log('Record not found, reloading data...');
        onNotify?.('Registro não encontrado. Recarregando dados...', 'warning');
        await loadDadosFromAPI();
        return;
      }

      // Handle other errors
      onNotify?.('Erro ao atualizar chamada civil', 'error');
    }
  };

  const removeChamadaMil = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await apiService.deleteChamadaMilitar(id);
      setChamadaMilitar(prev => prev.filter(x => x.id_chamada_militar !== id));
      onNotify?.("Militar removido da escala.", "warning");
    } catch (error) {
      console.error('Erro ao remover militar:', error);
      onNotify?.('Erro ao remover militar do banco de dados', 'error');
    }
  };

  const removeChamadaCiv = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await apiService.deleteChamadaCivil(id);
      setChamadaCivil(prev => prev.filter(x => x.id_chamada_civil !== id));
      onNotify?.("Civil removido da escala.", "warning");
    } catch (error: any) {
      console.error('Erro ao remover civil:', error);

      // Handle 404 errors - record may have already been deleted
      if (error.message && error.message.includes('404')) {
        console.log('Record not found, reloading data...');
        onNotify?.('Registro já foi removido. Recarregando dados...', 'warning');
        await loadDadosFromAPI();
        return;
      }

      // Handle other errors
      onNotify?.('Erro ao remover civil do banco de dados', 'error');
    }
  };

  const chamadaMil = chamadaMilitar
    .filter(cm => cm.id_turno === id_turno)
    .sort((a, b) => {
      const m1 = militares.find(mil => mil.matricula === a.matricula);
      const m2 = militares.find(mil => mil.matricula === b.matricula);
      const nome1 = m1?.nome_guerra || '';
      const nome2 = m2?.nome_guerra || '';
      return nome1.localeCompare(nome2, 'pt-BR');
    });
  const militaresDisponiveis = militares.filter(m => !chamadaMil.some(cm => cm.matricula === m.matricula));
  const filteredMilitares = militaresDisponiveis.filter(m => m.nome_guerra.toLowerCase().includes(searchTerm.toLowerCase()) || m.matricula.includes(searchTerm));

  const chamadaCiv = chamadaCivil
    .filter(cc => cc.id_turno === id_turno)
    .sort((a, b) => {
      const c1 = civis.find(civ => civ.id_civil === a.id_civil);
      const c2 = civis.find(civ => civ.id_civil === b.id_civil);
      const nome1 = c1?.nome_completo || '';
      const nome2 = c2?.nome_completo || '';
      return nome1.localeCompare(nome2, 'pt-BR');
    });
  const civisDisponiveis = civis.filter(c => !chamadaCiv.some(cc => cc.id_civil === c.id_civil));
  const filteredCivis = civisDisponiveis.filter(c => c.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()));

  // Lógica de paginação com pesquisa
  const allData = activeSubTab === 'chamada' ? chamadaMil : (activeSubTab === 'militar' ? chamadaMil : chamadaCiv);
  const filteredEscalaData = allData.filter(item => {
    if (activeSubTab === 'chamada') {
      // Na aba de chamada, filtra todos os militares
      const m = militares.find(mil => mil.matricula === item.matricula);
      return m && (m.nome_guerra.toLowerCase().includes(escalaSearchTerm.toLowerCase()) || 
                   m.matricula.includes(escalaSearchTerm) ||
                   m.nome_posto_grad.toLowerCase().includes(escalaSearchTerm.toLowerCase()));
    } else if (activeSubTab === 'militar') {
      const m = militares.find(mil => mil.matricula === item.matricula);
      return m && (m.nome_guerra.toLowerCase().includes(escalaSearchTerm.toLowerCase()) || 
                   m.matricula.includes(escalaSearchTerm) ||
                   m.nome_posto_grad.toLowerCase().includes(escalaSearchTerm.toLowerCase()));
    } else {
      const c = civis.find(civ => civ.id_civil === item.id_civil);
      return c && (c.nome_completo.toLowerCase().includes(escalaSearchTerm.toLowerCase()) || 
                   c.nome_orgao.toLowerCase().includes(escalaSearchTerm.toLowerCase()));
    }
  });
  const totalPages = Math.ceil(filteredEscalaData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredEscalaData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSelectAll = () => {
    const allAvailableIds = activeSubTab === 'militar' ? filteredMilitares.map(m => m.matricula) : filteredCivis.map(c => c.id_civil);
    setPendingSelection(allAvailableIds);
  };

  const exportCSV = () => {
    const headers = activeSubTab === 'militar' ? ["Posto/Grad", "Guerra", "Matricula", "Funcao", "Presenca"] : ["Nome", "Orgao", "Qtd Equipe"];
    const rows = activeSubTab === 'militar' ? chamadaMil.map(cm => {
      const m = militares.find(mil => mil.matricula === cm.matricula);
      return [m?.nome_posto_grad, m?.nome_guerra, cm.matricula, cm.funcao, cm.presenca || 'AUSENTE'];
    }) : chamadaCiv.map(cc => {
      const c = civis.find(civ => civ.id_civil === cc.id_civil);
      return [c?.nome_completo, c?.nome_orgao, cc.quant_civil];
    });
    const csvContent = [headers, ...rows].map(e => e.join(";")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `chamada_${activeSubTab}_${id_turno}.csv`;
    link.click();
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-blue-600 transition-all"><ArrowLeft size={20} /></button>
          <div>
            <h2 className="text-3xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">{dataFormatada} <span className="text-primary">• {turno.periodo}</span></h2>
            <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-1">Controle de Chamada Unificado</p>
          </div>
        </div>
        <div className="flex bg-slate-50 dark:bg-slate-800 p-1.5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-inner">
          <button onClick={() => { setActiveSubTab('militar'); setPendingSelection([]); }} className={`px-8 py-3 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeSubTab === 'militar' ? 'bg-white dark:bg-slate-700 text-primary shadow-lg' : 'text-slate-400'}`}><Shield size={14} /> Militar</button>
          <button onClick={() => { setActiveSubTab('civil'); setPendingSelection([]); }} className={`px-8 py-3 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeSubTab === 'civil' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-lg' : 'text-slate-400'}`}><UserCircle size={14} /> Civil</button>
          <button onClick={() => { setActiveSubTab('chamada'); setPendingSelection([]); }} className={`px-8 py-3 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeSubTab === 'chamada' ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-lg' : 'text-slate-400'}`}><ListChecks size={14} /> Chamada</button>
        </div>
      </div>

      {activeSubTab === 'chamada' ? (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
            <div className="flex justify-between items-center gap-4">
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  Chamada Militar {chamadaMil.length > 0 && `(${chamadaMil.length} militares)`}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle size={14} className="text-emerald-600" /> Presente
                  </span>
                  <span className="flex items-center gap-1">
                    <XCircle size={14} className="text-red-600" /> Ausente
                  </span>
                  <span className="flex items-center gap-1">
                    <ArrowRightLeft size={14} className="text-blue-600" /> Permuta
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText size={14} className="text-yellow-600" /> Atestado
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <p className="text-center text-slate-400 dark:text-slate-600 italic font-medium">
                Clique nos botões para registrar presença dos militares
              </p>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
                  {paginatedData.map(cm => {
                  const m = militares.find(mil => mil.matricula === cm.matricula);
                  return (
                    <div key={cm.id_chamada_militar} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase leading-tight">{m?.nome_posto_grad} {m?.nome_guerra}</h4>
                          <p className="text-[10px] font-bold text-slate-400 mt-1">{cm.matricula}</p>
                        </div>
                        <div className="flex justify-center gap-2">
                          {m?.cpoe && <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-lg" title="CPOE"><Ship size={14} /></div>}
                          {m?.mergulhador && <div className="p-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 rounded-lg" title="CMAUT"><Waves size={14} /></div>}
                          <div className={`p-1.5 rounded-lg ${cm.funcao === FuncaoMilitar.SCI ? 'bg-purple-50 dark:bg-purple-950/30 text-purple-600' : 'bg-orange-50 dark:bg-orange-950/30 text-orange-600'}`} title={cm.funcao === FuncaoMilitar.SCI ? 'SCI' : 'Combatente'}>
                            {cm.funcao === FuncaoMilitar.SCI ? <Settings size={14} /> : <Flame size={14} />}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-1">
                        <button 
                          onClick={() => updateChamadaMil(cm.id_chamada_militar, { presenca: StatusPresenca.PRESENTE })}
                          className={`p-2 rounded-lg transition-all ${
                            cm.presenca === StatusPresenca.PRESENTE 
                              ? 'bg-emerald-600 text-white shadow-lg' 
                              : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 hover:bg-emerald-100'
                          }`}
                          title="Presente"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button 
                          onClick={() => updateChamadaMil(cm.id_chamada_militar, { presenca: StatusPresenca.AUSENTE })}
                          className={`p-2 rounded-lg transition-all ${
                            cm.presenca === StatusPresenca.AUSENTE 
                              ? 'bg-red-600 text-white shadow-lg' 
                              : 'bg-red-50 dark:bg-red-950/30 text-red-600 hover:bg-red-100'
                          }`}
                          title="Ausente"
                        >
                          <XCircle size={16} />
                        </button>
                        <button 
                          onClick={() => updateChamadaMil(cm.id_chamada_militar, { presenca: StatusPresenca.PERMUTA })}
                          className={`p-2 rounded-lg transition-all ${
                            cm.presenca === StatusPresenca.PERMUTA 
                              ? 'bg-blue-600 text-white shadow-lg' 
                              : 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 hover:bg-blue-100'
                          }`}
                          title="Permuta"
                        >
                          <ArrowRightLeft size={16} />
                        </button>
                        <button 
                          onClick={() => updateChamadaMil(cm.id_chamada_militar, { presenca: StatusPresenca.ATESTADO })}
                          className={`p-2 rounded-lg transition-all ${
                            cm.presenca === StatusPresenca.ATESTADO 
                              ? 'bg-yellow-600 text-white shadow-lg' 
                              : 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 hover:bg-yellow-100'
                          }`}
                          title="Atestado"
                        >
                          <FileText size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {chamadaMil.length === 0 && (
                <div className="py-24 text-center text-slate-300 dark:text-slate-600 italic font-medium">
                  Nenhum militar escalado neste turno.
                </div>
              )}
            </div>
            
            {/* Controles de Paginação */}
            {totalPages > 1 && (
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 rounded-lg text-sm font-black transition-all ${
                          currentPage === pageNum
                            ? 'text-white shadow-lg'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                        style={currentPage === pageNum ? { backgroundColor: '#3b82f6' } : {}}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRightIcon size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                <UserPlus size={16} /> 
                {activeSubTab === 'militar' ? 'Escalar Militar' : 'Escalar Civil'}
              </h3>
              <input placeholder="Pesquisar disponível..." className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none mb-4" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              <div className="flex gap-2 mb-4">
                <button onClick={handleSelectAll} className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-100 dark:bg-slate-800 text-[9px] font-black text-slate-500 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all uppercase tracking-widest"><ListChecks size={14} /> Tudo</button>
                <button onClick={() => setPendingSelection([])} className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-100 dark:bg-slate-800 text-[9px] font-black text-slate-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all uppercase tracking-widest"><Eraser size={14} /> Limpar</button>
              </div>
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {activeSubTab === 'militar' ? (
                  filteredMilitares.map(m => <button key={m.matricula} onClick={() => setPendingSelection(prev => prev.includes(m.matricula) ? prev.filter(x => x !== m.matricula) : [...prev, m.matricula])} className={`w-full p-4 rounded-2xl border text-left transition-all ${pendingSelection.includes(m.matricula) ? 'bg-primary border-primary text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}><p className="font-black text-[11px] uppercase flex justify-between">{m?.nome_posto_grad} {m?.nome_guerra}{pendingSelection.includes(m.matricula) && <Check size={14} />}</p><p className={`text-[9px] font-bold ${pendingSelection.includes(m.matricula) ? 'text-blue-100' : 'text-slate-400'}`}>{m.matricula}</p></button>)
                ) : (
                  filteredCivis.map(c => <button key={c.id_civil} onClick={() => setPendingSelection(prev => prev.includes(c.id_civil) ? prev.filter(id => id !== c.id_civil) : [...prev, c.id_civil])} className={`w-full p-4 rounded-2xl border text-left transition-all ${pendingSelection.includes(c.id_civil) ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}><p className="font-black text-[11px] uppercase flex justify-between">{c.nome_completo}{pendingSelection.includes(c.id_civil) && <Check size={14} />}</p><p className={`text-[9px] font-bold ${pendingSelection.includes(c.id_civil) ? 'text-emerald-100' : 'text-slate-400'}`}>{c.nome_orgao}</p></button>)
                )}
              </div>
              {(activeSubTab === 'militar' ? filteredMilitares : filteredCivis).length === 0 && <p className="text-center py-10 text-[10px] text-slate-400 italic font-bold uppercase tracking-widest">Nenhum disponível.</p>}
              <button disabled={pendingSelection.length === 0} onClick={activeSubTab === 'militar' ? addMilitar : addCivil} className="w-full mt-6 bg-slate-900 dark:bg-primary text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-30 shadow-xl transition-all active:scale-95">Confirmar ({pendingSelection.length})</button>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
                <div className="flex justify-between items-center gap-4">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                      Escala do Turno {filteredEscalaData.length > 0 && `(${filteredEscalaData.length} encontrados)`}
                    </h3>
                    {activeSubTab === 'militar' && (
                      <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Settings size={14} className="text-purple-600" /> SCI
                        </span>
                        <span className="flex items-center gap-1">
                          <Flame size={14} className="text-orange-600" /> Combatente
                        </span>
                      </div>
                    )}
                  </div>
                  <input 
                    placeholder={`Pesquisar ${activeSubTab === 'militar' ? 'militar' : 'civil'}...`} 
                    className="flex-1 max-w-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none" 
                    value={escalaSearchTerm} 
                    onChange={e => setEscalaSearchTerm(e.target.value)} 
                  />
                  <button onClick={exportCSV} className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:text-primary transition-colors">
                    <Download size={18} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {activeSubTab === 'militar' ? (
                    paginatedData.map(cm => {
                      const m = militares.find(mil => mil.matricula === cm.matricula);
                      return (
                        <div key={cm.id_chamada_militar} className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase leading-tight">{m?.nome_posto_grad} {m?.nome_guerra}</h4>
                              <p className="text-[10px] font-bold text-slate-400 mt-1">{cm.matricula}</p>
                            </div>
                            <div className="flex justify-center gap-2">
                              {m?.cpoe && <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-lg" title="CPOE"><Ship size={14} /></div>}
                              {m?.mergulhador && <div className="p-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 rounded-lg" title="CMAUT"><Waves size={14} /></div>}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold uppercase text-slate-400">Função</span>
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => updateChamadaMil(cm.id_chamada_militar, { funcao: FuncaoMilitar.SCI })}
                                  className={`p-2 rounded-lg transition-all ${
                                    cm.funcao === FuncaoMilitar.SCI 
                                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40' 
                                      : 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 hover:bg-purple-50 hover:text-purple-600'
                                  }`}
                                  title="SCI"
                                >
                                  <Settings size={14} />
                                </button>
                                <button 
                                  onClick={() => updateChamadaMil(cm.id_chamada_militar, { funcao: FuncaoMilitar.COMBATENTE })}
                                  className={`p-2 rounded-lg transition-all ${
                                    cm.funcao === FuncaoMilitar.COMBATENTE 
                                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40' 
                                      : 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 hover:bg-orange-50 hover:text-orange-600'
                                  }`}
                                  title="Combatente"
                                >
                                  <Flame size={14} />
                                </button>
                              </div>
                              <span className="text-[9px] font-bold uppercase text-slate-400">Status</span>
                              <div className={`border-none px-3 py-1.5 rounded-full text-[10px] font-black uppercase outline-none ${getStatusConfig(cm.presenca || StatusPresenca.AUSENTE).bg}`}>
                                {getStatusConfig(cm.presenca || StatusPresenca.AUSENTE).icon} {getStatusConfig(cm.presenca || StatusPresenca.AUSENTE).label}
                              </div>
                            </div>
                            <button onClick={(e) => removeChamadaMil(e, cm.id_chamada_militar)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    paginatedData.map(cc => {
                      const c = civis.find(civ => civ.id_civil === cc.id_civil);
                      return (
                        <div key={cc.id_chamada_civil} className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase leading-tight">{c?.nome_completo}</h4>
                              <p className="text-[10px] font-bold text-slate-400 mt-1">{c?.nome_orgao}</p>
                            </div>
                            <div className="flex justify-center gap-2">
                              {/* Espaço reservado para alinhamento com ícones dos militares */}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold uppercase text-slate-400">Qtd. Efetivo</span>
                              <input 
                                type="number" 
                                min="0" 
                                value={cc.quant_civil} 
                                onChange={e => {
                                  const value = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value) || 0);
                                  updateChamadaCiv(cc.id_chamada_civil, { quant_civil: value });
                                }} 
                                className="border-none w-20 px-3 py-1.5 rounded-full text-[10px] font-black uppercase outline-none text-center bg-slate-50 dark:bg-slate-800 text-blue-600"
                              />
                              <span className="text-[9px] font-bold uppercase text-slate-400">Saiu?</span>
                              <input 
                                type="checkbox" 
                                checked={!!cc.saida}
                                onChange={e => {
                                  if (e.target.checked) {
                                    // Se marcar, registrar hora atual
                                    const agora = new Date();
                                    const hora = agora.toTimeString().slice(0, 5); // HH:MM
                                    updateChamadaCiv(cc.id_chamada_civil, { saida: hora });
                                  } else {
                                    // Se desmarcar, limpar hora
                                    updateChamadaCiv(cc.id_chamada_civil, { saida: null });
                                  }
                                }} 
                                className="w-4 h-4 text-emerald-600 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded focus:ring-emerald-500"
                              />
                              {cc.saida && (
                                <span className="text-[9px] font-bold uppercase text-emerald-600">{cc.saida}</span>
                              )}
                            </div>
                            <button onClick={(e) => removeChamadaCiv(e, cc.id_chamada_civil)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                
                {paginatedData.length === 0 && (
                  <div className="py-24 text-center text-slate-300 dark:text-slate-600 italic font-medium">
                    {filteredEscalaData.length === 0 
                      ? (escalaSearchTerm 
                          ? `Nenhum ${activeSubTab === 'militar' ? 'militar' : 'civil'} encontrado para "${escalaSearchTerm}".`
                          : "Nenhum registro para este turno. Adicione pessoal à esquerda."
                        )
                      : "Nenhum registro nesta página."
                    }
                  </div>
                )}
              </div>
              
              {/* Controles de Paginação */}
              {totalPages > 1 && (
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1 rounded-lg text-sm font-black transition-all ${
                            currentPage === pageNum
                              ? 'text-white shadow-lg'
                              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                          }`}
                          style={currentPage === pageNum ? { backgroundColor: '#3b82f6' } : {}}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRightIcon size={16} />
                    </button>
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

export default TurnoDetalhe;
