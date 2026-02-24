import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Truck,
  Plus,
  Trash2,
  Check,
  MapPin,
  Activity,
  Clock,
  User,
  Calendar,
  X,
  Search,
  ChevronRight,
  ArrowLeft,
  Users,
  UserPlus,
  Type,
  UserCheck
} from 'lucide-react';
import { Equipe, StatusEquipe, FuncaoMilitar, Turno, Periodo, ALFABETO_FONETICO } from '../types';
import { ToastType } from '../components/Toast';
import { apiService } from '../apiService';
import { useAuth } from '../contexts/AuthContext';

interface GestaoEquipesProps {
  onNotify?: (msg: string, type: ToastType) => void;
}

const GestaoEquipes: React.FC<GestaoEquipesProps> = ({ onNotify }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [chamadaMilitar, setChamadaMilitar] = useState<any[]>([]);
  const [chamadaCivil, setChamadaCivil] = useState<any[]>([]);
  const [militares, setMilitares] = useState<any[]>([]);
  const [civis, setCivis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTurnoId, setSelectedTurnoId] = useState('');

  // Modais de atribuição
  const [isChefeModalOpen, setIsChefeModalOpen] = useState<{ open: boolean, idEquipe: string | null }>({ open: false, idEquipe: null });
  const [isMotoristaModalOpen, setIsMotoristaModalOpen] = useState<{ open: boolean, idEquipe: string | null }>({ open: false, idEquipe: null });
  const [isComponenteModalOpen, setIsComponenteModalOpen] = useState<{ open: boolean, idEquipe: string | null }>({ open: false, idEquipe: null });

  const [militarSearch, setMilitarSearch] = useState('');
  const [civilSearch, setCivilSearch] = useState('');
  const [componentesEquipe, setComponentesEquipe] = useState<{ [idEquipe: string]: any[] }>({});

  const modalRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsChefeModalOpen({ open: false, idEquipe: null });
        setIsMotoristaModalOpen({ open: false, idEquipe: null });
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Só carregar dados quando autenticação estiver completa e usuário estiver autenticado
    if (!authLoading && isAuthenticated) {
      loadDadosBase();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  const loadDadosBase = async () => {
    try {
      setLoading(true);
      const [turnosData, militaresData, civisData] = await Promise.all([
        apiService.getTurnos(),
        apiService.getMilitares(),
        apiService.getCivis()
      ]);
      setTurnos(turnosData);
      setMilitares(militaresData);
      setCivis(civisData);
    } catch (error) {
      console.error('Erro ao carregar dados base:', error);
      onNotify?.('Erro ao carregar dados do sistema', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadTurnoSpecificData = async (idTurno: string) => {
    try {
      const [equipesData, cmData, ccData] = await Promise.all([
        apiService.getEquipes(idTurno),
        apiService.getChamadaMilitar(idTurno),
        apiService.getChamadaCivil(idTurno)
      ]);
      setEquipes(equipesData);
      setChamadaMilitar(cmData);
      setChamadaCivil(ccData);

      // Carregar componentes para cada equipe
      const componentesPromises = equipesData.map(e => apiService.getComponentesEquipe(e.id_equipe));
      const componentesResults = await Promise.all(componentesPromises);
      const componentesMap: { [id: string]: any[] } = {};
      equipesData.forEach((e, idx) => {
        componentesMap[e.id_equipe] = componentesResults[idx];
      });
      setComponentesEquipe(componentesMap);
    } catch (error) {
      console.error('Erro ao carregar dados do turno:', error);
    }
  };

  useEffect(() => {
    if (selectedTurnoId) {
      loadTurnoSpecificData(selectedTurnoId);
    }
  }, [selectedTurnoId]);

  const updateEquipeData = async (id: string, updates: Partial<Equipe>, immediate = true) => {
    // Atualiza o estado local imediatamente para feedback instantâneo
    setEquipes(prev => prev.map(e => e.id_equipe === id ? { ...e, ...updates } : e));

    if (immediate) {
      try {
        await apiService.updateEquipe(id, updates);
      } catch (error) {
        onNotify?.("Erro ao salvar alterações.", "error");
      }
    } else {
      // Debounce para campos de texto
      if (debounceTimerRef.current[id]) {
        clearTimeout(debounceTimerRef.current[id]);
      }
      debounceTimerRef.current[id] = setTimeout(async () => {
        try {
          await apiService.updateEquipe(id, updates);
        } catch (error) {
          onNotify?.("Erro ao salvar alterações.", "error");
        }
        delete debounceTimerRef.current[id];
      }, 800);
    }
  };

  const handleAddEquipe = async () => {
    const alphabet = Object.values(ALFABETO_FONETICO);
    const nextIndex = equipes.length;
    const cycle = Math.floor(nextIndex / alphabet.length);
    const letterIndex = nextIndex % alphabet.length;

    // Helper para numerais romanos simples (para os ciclos)
    const getRoman = (n: number) => {
      if (n <= 0) return '';
      const romans = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
      return romans[n] || n.toString();
    };

    const suffix = cycle > 0 ? ` ${getRoman(cycle + 1)}` : '';
    const teamName = `${alphabet[letterIndex]}${suffix}`;

    const newEquipe = {
      id_turno: selectedTurnoId,
      nome_equipe: teamName,
      status: StatusEquipe.LIVRE,
      total_efetivo: 0,
      bairro: ''
    };

    try {
      await apiService.createEquipe(newEquipe);
      await loadTurnoSpecificData(selectedTurnoId);
      onNotify?.("Equipe criada com sucesso!", "success");
    } catch (error) {
      onNotify?.("Erro ao criar equipe.", "error");
    }
  };

  const removeEquipe = async (id: string) => {
    if (!window.confirm("Deseja realmente remover esta equipe?")) return;
    try {
      await apiService.deleteEquipe(id);
      setEquipes(prev => prev.filter(e => e.id_equipe !== id));
      onNotify?.("Equipe removida.", "warning");
    } catch (error) {
      onNotify?.("Erro ao remover equipe.", "error");
    }
  };

  const handleAssignChefe = async (idEquipe: string | null, matricula: string) => {
    if (!idEquipe) return;
    try {
      const chamMilitar = chamadaMilitar.find(cm => cm.matricula === matricula);
      if (chamMilitar) {
        await apiService.updateEquipe(idEquipe, { id_chamada_militar: chamMilitar.id_chamada_militar });
        await loadTurnoSpecificData(selectedTurnoId);
        setIsChefeModalOpen({ open: false, idEquipe: null });
        onNotify?.("Chefe atribuído!", "success");
      } else {
        onNotify?.("Militar não está escalado neste turno.", "error");
      }
    } catch (error) {
      onNotify?.("Erro ao atribuir chefe.", "error");
    }
  };

  const handleAssignMotorista = async (idEquipe: string | null, idCivil: string) => {
    if (!idEquipe) return;
    try {
      let chamCivil = chamadaCivil.find(cc => cc.id_civil === idCivil);

      if (!chamCivil) {
        const id_chamada_civil = crypto.randomUUID ? crypto.randomUUID() : `cc_${Date.now()}`;
        const newCC = {
          id_chamada_civil,
          id_turno: selectedTurnoId,
          id_civil: idCivil,
          quant_civil: 1
        };
        await apiService.createChamadaCivil(newCC);
        // Recarregar os dados para pegar o ID correto e o join do motorista
        await loadTurnoSpecificData(selectedTurnoId);
        chamCivil = { id_chamada_civil }; // Dummy para o próximo passo
      }

      // Agora atualiza a equipe com o id_chamada_civil (seja o novo ou o existente)
      // Buscamos novamente o chamCivil para garantir que temos o id_chamada_civil atualizado
      const freshCC = (await apiService.getChamadaCivil(selectedTurnoId)).find(cc => cc.id_civil === idCivil);

      if (freshCC) {
        await apiService.updateEquipe(idEquipe, { id_chamada_civil: freshCC.id_chamada_civil });
        await loadTurnoSpecificData(selectedTurnoId);
        setIsMotoristaModalOpen({ open: false, idEquipe: null });
        onNotify?.("Motorista atribuído!", "success");
      }
    } catch (error) {
      console.error('Erro ao atribuir motorista:', error);
      onNotify?.("Erro ao atribuir motorista.", "error");
    }
  };

  const handleAddComponente = async (idEquipe: string | null, id_chamada_militar: string) => {
    if (!idEquipe) return;
    try {
      await apiService.addComponenteEquipe({
        id_equipe: idEquipe,
        id_chamada_militar,
        id_turno: selectedTurnoId
      });
      await loadTurnoSpecificData(selectedTurnoId);
      setIsComponenteModalOpen({ open: false, idEquipe: null });
      onNotify?.("Integrante adicionado!", "success");
    } catch (error) {
      onNotify?.("Erro ao adicionar integrante.", "error");
    }
  };

  const handleRemoveComponente = async (idComponente: string) => {
    try {
      await apiService.deleteComponenteEquipe(idComponente);
      await loadTurnoSpecificData(selectedTurnoId);
      onNotify?.("Integrante removido.", "success");
    } catch (error) {
      onNotify?.("Erro ao remover integrante.", "error");
    }
  };

  const calculateTotalEfetivo = (equipe: Equipe) => {
    let total = 0;
    // Chefe conta como 1
    if (equipe.id_chamada_militar) total += 1;
    // Motorista e auxiliares civis
    if (equipe.id_chamada_civil) {
      // 1 (Motorista) + quant_civil (Auxiliares/Civis adicionais)
      total += 1 + (equipe.quant_civil || 0);
    }
    // Componentes da Guarnição (Militares)
    const componentes = componentesEquipe[equipe.id_equipe] || [];
    total += componentes.length;

    return total;
  };

  const getStatusConfig = (status: StatusEquipe) => {
    switch (status) {
      case StatusEquipe.LIVRE:
        return { color: 'bg-emerald-500', icon: <Check size={16} />, label: 'Livre' };
      case StatusEquipe.EMPENHADA:
        return { color: 'bg-amber-500', icon: <Activity size={16} />, label: 'Empenhada' };
      case StatusEquipe.PAUSA_OPERACIONAL:
        return { color: 'bg-slate-500', icon: <Clock size={16} />, label: 'Pausa' };
      default:
        return { color: 'bg-emerald-500', icon: <Check size={16} />, label: 'Livre' };
    }
  };

  if (!selectedTurnoId) {
    return (
      <div className="space-y-10 page-transition">
        <div>
          <h2 className="text-4xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">
            Gestão de <span className="text-primary">Equipes</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Escolha um turno para configurar o dispositivo.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {turnos.sort((a, b) => b.data.localeCompare(a.data)).map((t) => (
            <button
              key={t.id_turno}
              onClick={() => setSelectedTurnoId(t.id_turno)}
              className="group relative bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:scale-[1.03] transition-all text-left overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-primary opacity-20 group-hover:opacity-100 transition-opacity"></div>

              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${t.periodo === Periodo.MANHA ? 'bg-orange-50 text-orange-500 dark:bg-orange-900/20' : 'bg-indigo-50 text-indigo-500 dark:bg-indigo-900/20'}`}>
                  <Clock size={24} />
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl text-center">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Equipes</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white leading-none mt-1">
                    {t.total_equipes || 0}
                  </p>
                </div>
              </div>

              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-1">
                {new Date(t.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
              </p>
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{t.periodo}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const currentTurno = turnos.find(t => t.id_turno === selectedTurnoId);

  return (
    <div className="space-y-8 page-transition">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6 text-black dark:text-white">
          <button
            onClick={() => setSelectedTurnoId('')}
            className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-primary transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-black tracking-tighter uppercase">
              Gerenciamento de <span className="text-primary font-black">Equipes</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {currentTurno ? `${new Date(currentTurno.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} • ${currentTurno.periodo}` : ''}
            </p>
          </div>
        </div>
        <button
          onClick={handleAddEquipe}
          className="group flex items-center justify-center gap-3 bg-primary text-white px-8 py-4 rounded-[2rem] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 font-black text-sm uppercase"
        >
          <Plus size={18} />
          Nova Equipe
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {equipes.map((equipe) => {
          const statusCfg = getStatusConfig(equipe.status);
          const chefe = militares.find(m => m.matricula === equipe.matricula_militar);

          return (
            <div key={equipe.id_equipe} className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all flex flex-col overflow-hidden relative">
              <div className={`absolute top-0 left-0 w-2 h-full ${statusCfg.color}`}></div>

              <div className="p-6 pb-0 flex justify-between items-start ml-2">
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 group-hover:text-primary transition-colors shrink-0">
                    <Type size={20} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <input
                      placeholder="Nome da Equipe"
                      className="w-full bg-transparent border-none p-0 font-black text-lg text-slate-900 dark:text-white uppercase tracking-tighter leading-none outline-none focus:ring-0 placeholder:text-slate-300"
                      value={equipe.nome_equipe}
                      onChange={(e) => updateEquipeData(equipe.id_equipe, { nome_equipe: e.target.value }, false)}
                    />
                    <div className="flex items-center gap-2 mt-1">
                      <div className="bg-primary/10 text-primary text-[9px] px-2 py-0.5 rounded-full font-black uppercase">
                        {calculateTotalEfetivo(equipe)} Integrantes
                      </div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest truncate">
                        {equipe.vtr_modelo || 'VTR N/D'}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeEquipe(equipe.id_equipe)}
                  className="p-2 text-slate-200 hover:text-red-500 transition-colors shrink-0"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5 ml-2 flex-1">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Chefe de Equipe</label>
                  {chefe ? (
                    <button
                      onClick={() => setIsChefeModalOpen({ open: true, idEquipe: equipe.id_equipe })}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl flex items-center gap-3 border border-transparent hover:border-primary/20 transition-all text-left group/item"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-primary font-black text-xs border border-slate-100 dark:border-slate-800 shadow-sm">
                        {chefe.nome_guerra.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase leading-tight truncate">{chefe.nome_posto_grad} {chefe.nome_guerra}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{chefe.matricula}</p>
                      </div>
                      <ChevronRight className="text-slate-200 group-hover/item:text-primary transition-colors" size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsChefeModalOpen({ open: true, idEquipe: equipe.id_equipe })}
                      className="w-full p-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:text-primary hover:border-primary/30 transition-all font-bold text-xs uppercase tracking-widest"
                    >
                      <UserPlus size={16} /> Atribuir Chefe
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-left border border-transparent hover:border-primary/20 transition-all flex flex-col gap-2">
                    <button
                      onClick={() => setIsMotoristaModalOpen({ open: true, idEquipe: equipe.id_equipe })}
                      className="text-left group/mot w-full"
                    >
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1 group-hover/mot:text-primary transition-colors">
                        <User size={10} /> Motorista
                      </p>
                      <p className="font-bold text-[10px] text-slate-700 dark:text-slate-300 truncate uppercase underline-offset-4 group-hover/mot:underline">
                        {equipe.nome_motorista || 'Atribuir'}
                      </p>
                    </button>

                    {equipe.id_chamada_civil && (
                      <div className="flex items-center gap-2 mt-1 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                        <Users size={10} className="text-primary" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-tight">
                          {equipe.quant_civil || 0} Civis Auxiliares
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex flex-col justify-between border border-transparent hover:border-primary/10 transition-all shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <MapPin size={10} /> Setor de Atuação
                    </p>
                    <input
                      placeholder="Não definido"
                      className="bg-transparent border-none p-0 w-full font-black text-[10px] text-primary outline-none focus:ring-0 placeholder:text-slate-300 uppercase"
                      value={equipe.bairro || ''}
                      onChange={(e) => updateEquipeData(equipe.id_equipe, { bairro: e.target.value }, false)}
                    />
                  </div>
                </div>

                {/* Guarnição / Componentes */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Guarnição</label>
                    <button
                      onClick={() => setIsComponenteModalOpen({ open: true, idEquipe: equipe.id_equipe })}
                      className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all"
                    >
                      <UserPlus size={14} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(componentesEquipe[equipe.id_equipe] || []).length > 0 ? (
                      (componentesEquipe[equipe.id_equipe] || []).map((comp) => (
                        <div key={comp.id_componente} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-800">
                              <User size={14} />
                            </div>
                            <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase truncate">
                              {comp.nome_posto_grad} {comp.nome_guerra}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveComponente(comp.id_componente)}
                            className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 border-2 border-dashed border-slate-50 dark:border-slate-800/50 rounded-2xl">
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Sem guarnição</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 ml-2">
                <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl">
                  {([StatusEquipe.LIVRE, StatusEquipe.EMPENHADA, StatusEquipe.PAUSA_OPERACIONAL]).map((st) => {
                    const cfg = getStatusConfig(st);
                    const isActive = equipe.status === st;
                    return (
                      <button
                        key={st}
                        onClick={() => updateEquipeData(equipe.id_equipe, { status: st })}
                        className={`
                          flex-1 flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl transition-all
                          ${isActive
                            ? `${cfg.color} text-white shadow-lg scale-105 font-black`
                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}
                        `}
                      >
                        {cfg.icon}
                        <span className="text-[8px] uppercase tracking-tighter font-bold">{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Chefe */}
      {isChefeModalOpen.open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div ref={modalRef} className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col max-h-[80vh] overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center text-black dark:text-white">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Escolher <span className="text-primary font-black">Chefe</span></h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Militares Escalados</p>
              </div>
              <button onClick={() => setIsChefeModalOpen({ open: false, idEquipe: null })} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-red-500 transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <Search size={18} className="text-slate-400" />
                <input
                  placeholder="Pesquisar militar..."
                  className="bg-transparent border-none text-sm font-bold outline-none w-full dark:text-white uppercase"
                  value={militarSearch}
                  onChange={e => setMilitarSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="p-8 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4 custom-scrollbar">
              {(() => {
                const filteredMilitares = chamadaMilitar
                  .filter(cm => {
                    const searchTerm = militarSearch.toLowerCase();
                    return cm.nome_guerra.toLowerCase().includes(searchTerm) || cm.matricula.includes(searchTerm);
                  })
                  .filter(cm => {
                    // Excluir militares que já são chefes de outra equipe (exceto a atual se já for ele)
                    const isChefeEmOutraEquipe = equipes.some(e =>
                      e.id_chamada_militar === cm.id_chamada_militar &&
                      e.id_equipe !== isChefeModalOpen.idEquipe
                    );
                    // Excluir militares que já são componentes em outras equipes
                    const isComponenteEmOutraEquipe = (Object.values(componentesEquipe) as any[][]).some(list =>
                      list.some(comp => comp.id_chamada_militar === cm.id_chamada_militar)
                    );
                    const isAvailable = !isChefeEmOutraEquipe && !isComponenteEmOutraEquipe;
                    if (!isAvailable) {
                      if (isChefeEmOutraEquipe) {
                        console.log(`Militar ${cm.nome_guerra} já é chefe em outra equipe`);
                      } else if (isComponenteEmOutraEquipe) {
                        console.log(`Militar ${cm.nome_guerra} já é componente em outra equipe`);
                      }
                    }
                    return isAvailable;
                  });
                
                console.log(`Chefes disponíveis: ${filteredMilitares.length} de ${chamadaMilitar.length} militares escalados`);
                return filteredMilitares.map(cm => (
                  <button
                    key={cm.matricula}
                    onClick={() => handleAssignChefe(isChefeModalOpen.idEquipe, cm.matricula)}
                    className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 hover:border-primary hover:shadow-lg transition-all text-left group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-primary font-black text-sm border border-slate-100 dark:border-slate-800 shadow-sm group-hover:scale-110 transition-transform">
                      {cm.nome_guerra.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-black text-xs text-slate-900 dark:text-white uppercase leading-tight truncate">{cm.nome_posto_grad} {cm.nome_guerra}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{cm.matricula}</p>
                    </div>
                  </button>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Modal Motorista */}
      {isMotoristaModalOpen.open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div ref={modalRef} className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col max-h-[80vh] overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center text-black dark:text-white">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Escolher <span className="text-primary font-black">Motorista</span></h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Civis Motoristas</p>
              </div>
              <button onClick={() => setIsMotoristaModalOpen({ open: false, idEquipe: null })} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-red-500 transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <Search size={18} className="text-slate-400" />
                <input
                  placeholder="Pesquisar motorista..."
                  className="bg-transparent border-none text-sm font-bold outline-none w-full dark:text-white uppercase"
                  value={civilSearch}
                  onChange={e => setCivilSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="p-8 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4 custom-scrollbar">
              {chamadaCivil
                .filter(cc => {
                  const searchTerm = civilSearch.toLowerCase();
                  return cc.nome_completo.toLowerCase().includes(searchTerm) || cc.placa_veiculo?.toLowerCase().includes(searchTerm);
                })
                .filter(cc => {
                  // Excluir motoristas que já estão em outra equipe
                  const isAssigned = equipes.some(e =>
                    e.id_chamada_civil === cc.id_chamada_civil &&
                    e.id_equipe !== isMotoristaModalOpen.idEquipe
                  );
                  return !isAssigned;
                })
                .map(cc => (
                  <button
                    key={cc.id_civil}
                    onClick={() => handleAssignMotorista(isMotoristaModalOpen.idEquipe, cc.id_civil)}
                    className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 hover:border-primary hover:shadow-lg transition-all text-left group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-primary font-black text-sm border border-slate-100 dark:border-slate-800 shadow-sm group-hover:scale-110 transition-transform">
                      {cc.nome_completo.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-black text-xs text-slate-900 dark:text-white uppercase leading-tight truncate">{cc.nome_completo}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase truncate">{cc.nome_orgao || 'Sem órgão'}</p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
      {/* Modal Guarnição */}
      {isComponenteModalOpen.open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div ref={modalRef} className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col max-h-[80vh] overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center text-black dark:text-white">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Adicionar à <span className="text-primary font-black">Guarnição</span></h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Militares Escalados</p>
              </div>
              <button onClick={() => setIsComponenteModalOpen({ open: false, idEquipe: null })} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-red-500 transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <Search size={18} className="text-slate-400" />
                <input
                  placeholder="Pesquisar militar..."
                  className="bg-transparent border-none text-sm font-bold outline-none w-full dark:text-white uppercase"
                  value={militarSearch}
                  onChange={e => setMilitarSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="p-8 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4 custom-scrollbar">
              {chamadaMilitar
                .filter(cm => {
                  const searchTerm = militarSearch.toLowerCase();
                  return cm.nome_guerra.toLowerCase().includes(searchTerm) || cm.matricula.includes(searchTerm);
                })
                .filter(cm => {
                  // Excluir militares que já estão em alguma equipe
                  // 1. Checar se é chefe de alguma equipe
                  const isChefe = equipes.some(e => e.id_chamada_militar === cm.id_chamada_militar);
                  // 2. Checar se já é componente de alguma equipe
                  const isComponente = (Object.values(componentesEquipe) as any[][]).some(list =>
                    list.some(comp => comp.id_chamada_militar === cm.id_chamada_militar)
                  );
                  const isAvailable = !isChefe && !isComponente;
                  if (!isAvailable) {
                    if (isChefe) {
                      console.log(`Militar ${cm.nome_guerra} já é chefe em outra equipe`);
                    } else if (isComponente) {
                      console.log(`Militar ${cm.nome_guerra} já é componente em outra equipe`);
                    }
                  }
                  return isAvailable;
                })
                .map(cm => (
                  <button
                    key={cm.matricula}
                    onClick={() => handleAddComponente(isComponenteModalOpen.idEquipe, cm.id_chamada_militar)}
                    className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 hover:border-primary hover:shadow-lg transition-all text-left group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-primary font-black text-sm border border-slate-100 dark:border-slate-800 shadow-sm group-hover:scale-110 transition-transform">
                      {cm.nome_guerra.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-black text-xs text-slate-900 dark:text-white uppercase leading-tight truncate">{cm.nome_posto_grad} {cm.nome_guerra}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{cm.matricula}</p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestaoEquipes;
