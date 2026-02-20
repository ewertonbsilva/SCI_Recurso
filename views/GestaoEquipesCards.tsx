import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, User, Truck, Plus, Edit2, Trash2, Shield, CheckCircle, AlertCircle, Activity, Clock, MapPin, UserPlus, X, Search, ChevronRight } from 'lucide-react';
import { Equipe, StatusEquipe, ChamadaMilitar, ChamadaCivil, Turno } from '../types';
import { ToastType } from '../components/Toast';
import { apiService } from '../apiService';

interface GestaoEquipesProps {
  id_turno: string;
  onBack: () => void;
  onNotify?: (msg: string, type: ToastType) => void;
}

const GestaoEquipes: React.FC<GestaoEquipesProps> = ({ id_turno, onBack, onNotify }) => {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [chamadaMilitar, setChamadaMilitar] = useState<ChamadaMilitar[]>([]);
  const [chamadaCivil, setChamadaCivil] = useState<ChamadaCivil[]>([]);
  const [militares, setMilitares] = useState<any[]>([]);
  const [civis, setCivis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEquipe, setEditingEquipe] = useState<Equipe | null>(null);
  const [isMilitarModalOpen, setIsMilitarModalOpen] = useState<{ open: boolean, idEquipe: string | null }>({ open: false, idEquipe: null });
  const [isCivilModalOpen, setIsCivilModalOpen] = useState<{ open: boolean, idEquipe: string | null }>({ open: false, idEquipe: null });
  const [militarSearch, setMilitarSearch] = useState('');
  const [civilSearch, setCivilSearch] = useState('');
  const [formData, setFormData] = useState({
    nome_equipe: '',
    id_chamada_militar: '',
    id_chamada_civil: '',
    status: StatusEquipe.LIVRE,
    bairro: ''
  });

  useEffect(() => {
    loadDados();
  }, [id_turno]);

  const loadDados = async () => {
    try {
      setLoading(true);
      const [equipesData, militarData, civilData, militaresData, civisData] = await Promise.all([
        apiService.getEquipes(id_turno),
        apiService.getChamadaMilitar(id_turno),
        apiService.getChamadaCivil(id_turno),
        apiService.getMilitares(),
        apiService.getCivis()
      ]);
      
      setEquipes(equipesData);
      setChamadaMilitar(militarData);
      setChamadaCivil(civilData);
      setMilitares(militaresData);
      setCivis(civisData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      onNotify?.('Erro ao carregar dados das equipes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome_equipe: '',
      id_chamada_militar: '',
      id_chamada_civil: '',
      status: StatusEquipe.LIVRE,
      bairro: ''
    });
    setEditingEquipe(null);
    setShowCreateForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingEquipe) {
        await apiService.updateEquipe(editingEquipe.id_equipe, formData);
        onNotify?.('Equipe atualizada com sucesso!', 'success');
      } else {
        await apiService.createEquipe({
          ...formData,
          id_turno
        });
        onNotify?.('Equipe criada com sucesso!', 'success');
      }
      
      resetForm();
      loadDados();
    } catch (error) {
      console.error('Erro ao salvar equipe:', error);
      onNotify?.('Erro ao salvar equipe', 'error');
    }
  };

  const handleEdit = (equipe: Equipe) => {
    setEditingEquipe(equipe);
    setFormData({
      nome_equipe: equipe.nome_equipe,
      id_chamada_militar: equipe.id_chamada_militar || '',
      id_chamada_civil: equipe.id_chamada_civil || '',
      status: equipe.status,
      bairro: equipe.bairro || ''
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (equipe: Equipe) => {
    if (!confirm(`Deseja remover a equipe "${equipe.nome_equipe}"?`)) return;
    
    try {
      await apiService.deleteEquipe(equipe.id_equipe);
      onNotify?.('Equipe removida com sucesso!', 'success');
      loadDados();
    } catch (error) {
      console.error('Erro ao remover equipe:', error);
      onNotify?.('Erro ao remover equipe', 'error');
    }
  };

  const handleAssignMilitar = async (idEquipe: string, matricula: string) => {
    try {
      await apiService.updateEquipe(idEquipe, { id_chamada_militar: matricula, id_chamada_civil: '' });
      setIsMilitarModalOpen({ open: false, idEquipe: null });
      onNotify?.("Militar atribuído com sucesso!", "success");
      loadDados();
    } catch (error) {
      onNotify?.("Erro ao atribuir militar.", "error");
    }
  };

  const handleAssignCivil = async (idEquipe: string, idCivil: string) => {
    try {
      await apiService.updateEquipe(idEquipe, { id_chamada_civil: idCivil, id_chamada_militar: '' });
      setIsCivilModalOpen({ open: false, idEquipe: null });
      onNotify?.("Motorista atribuído com sucesso!", "success");
      loadDados();
    } catch (error) {
      onNotify?.("Erro ao atribuir motorista.", "error");
    }
  };

  const updateEquipeStatus = async (idEquipe: string, status: StatusEquipe) => {
    try {
      await apiService.updateEquipe(idEquipe, { status });
      onNotify?.("Status atualizado com sucesso!", "success");
      loadDados();
    } catch (error) {
      onNotify?.("Erro ao atualizar status.", "error");
    }
  };

  const militaresDisponiveis = militares.filter(m => 
    !equipes.some(e => e.id_chamada_militar && e.id_chamada_militar.includes(m.matricula))
  );

  const civisDisponiveis = civis.filter(c => 
    c.motorista && !equipes.some(e => e.id_chamada_civil && e.id_chamada_civil.includes(c.id_civil))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Carregando equipes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <button
            onClick={onBack}
            className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-primary transition-all"
            title="Voltar"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
              Equipes do Turno
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {id_turno}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="group flex items-center justify-center gap-3 bg-primary text-white px-6 py-4 rounded-[2rem] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 font-bold text-sm"
        >
          <Plus size={18} />
          NOVA EQUIPE
        </button>
      </div>

      {/* Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {editingEquipe ? 'Editar Equipe' : 'Nova Equipe'}
            </h2>
            <button
              onClick={resetForm}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              ×
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nome da Equipe
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome_equipe}
                  onChange={(e) => setFormData({ ...formData, nome_equipe: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusEquipe })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value={StatusEquipe.LIVRE}>Livre</option>
                  <option value={StatusEquipe.EMPENHADA}>Empenhada</option>
                  <option value={StatusEquipe.PAUSA_OPERACIONAL}>Pausa Operacional</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Militar (Opcional)
                </label>
                <select
                  value={formData.id_chamada_militar}
                  onChange={(e) => setFormData({ ...formData, id_chamada_militar: e.target.value, id_chamada_civil: '' })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">Selecione um militar</option>
                  {chamadaMilitar.map((cm) => (
                    <option key={cm.id_chamada_militar} value={cm.id_chamada_militar}>
                      {cm.matricula} - {cm.funcao}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Civil/VTR (Opcional)
                </label>
                <select
                  value={formData.id_chamada_civil}
                  onChange={(e) => setFormData({ ...formData, id_chamada_civil: e.target.value, id_chamada_militar: '' })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">Selecione uma VTR</option>
                  {chamadaCivil.map((cc) => (
                    <option key={cc.id_chamada_civil} value={cc.id_chamada_civil}>
                      {cc.quant_civil} pessoas - {cc.nome_completo}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Bairro (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.bairro}
                  onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="Bairro onde a equipe está atuando"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {editingEquipe ? 'Atualizar' : 'Criar'} Equipe
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cards das Equipes - Design Original */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {equipes.map((equipe) => {
          const statusColors = {
            [StatusEquipe.LIVRE]: 'bg-emerald-500',
            [StatusEquipe.EMPENHADA]: 'bg-amber-500',
            [StatusEquipe.PAUSA_OPERACIONAL]: 'bg-slate-500',
          };

          return (
            <div key={equipe.id_equipe} className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all flex flex-col overflow-hidden relative">
              <div className={`absolute top-0 left-0 w-2 h-full ${statusColors[equipe.status]}`}></div>

              <div className="p-6 pb-0 flex justify-between items-start ml-2">
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 group-hover:text-primary transition-colors shrink-0">
                    {equipe.id_chamada_militar ? (
                      <Shield size={20} />
                    ) : (
                      <Truck size={20} />
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <input
                      value={equipe.nome_equipe || ''}
                      onChange={(e) => updateEquipeStatus(equipe.id_equipe, { ...equipe, nome_equipe: e.target.value })}
                      placeholder="Nome da Equipe"
                      className="w-full bg-transparent border-none p-0 font-black text-lg text-slate-900 dark:text-white uppercase tracking-tighter leading-none outline-none focus:ring-0 placeholder:text-slate-300"
                    />
                    <p className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-widest truncate">
                      {equipe.vtr_modelo} • {equipe.nome_motorista}
                    </p>
                  </div>
                </div>
                <button onClick={() => handleEdit(equipe)} className="p-2 text-slate-200 hover:text-red-500 transition-colors shrink-0">
                  <Edit2 size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5 ml-2 flex-1">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                    {equipe.id_chamada_militar ? 'Militar' : 'Motorista'}
                  </label>
                  {equipe.nome_militar ? (
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl group/slot">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white text-xs font-black shadow-lg">
                          {equipe.nome_militar.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-xs text-slate-900 dark:text-white uppercase">{equipe.nome_militar}</p>
                          <p className="text-[9px] text-primary font-bold">{equipe.matricula_militar}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleEdit({ ...equipe, id_chamada_militar: undefined })}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover/slot:opacity-100"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : equipe.nome_motorista ? (
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl group/slot">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white text-xs font-black shadow-lg">
                          {equipe.nome_motorista.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-xs text-slate-900 dark:text-white uppercase">{equipe.nome_motorista}</p>
                          <p className="text-[9px] text-primary font-bold">{equipe.vtr_modelo}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleEdit({ ...equipe, id_chamada_civil: undefined })}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover/slot:opacity-100"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsMilitarModalOpen({ open: true, idEquipe: equipe.id_equipe })}
                      className="w-full p-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:text-primary hover:border-primary/30 transition-all font-bold text-xs uppercase tracking-widest"
                    >
                      <UserPlus size={16} /> Atribuir {equipe.id_chamada_militar ? 'Motorista' : 'Militar'}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <MapPin size={10} /> Setor
                    </p>
                    <input
                      value={equipe.bairro || ''}
                      onChange={(e) => updateEquipeStatus(equipe.id_equipe, { ...equipe, bairro: e.target.value })}
                      placeholder="Não definido"
                      className="bg-transparent border-none p-0 w-full font-black text-[10px] text-primary outline-none placeholder:text-slate-300"
                    />
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Users size={10} /> Efetivo
                    </p>
                    <p className="font-bold text-[10px] text-slate-700 dark:text-slate-300">{equipe.total_efetivo} pessoa(s)</p>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 ml-2">
                <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl">
                  {[
                    { id: StatusEquipe.LIVRE, icon: <CheckCircle size={16} />, color: 'bg-emerald-500', hover: 'hover:text-emerald-500', label: 'Livre' },
                    { id: StatusEquipe.EMPENHADA, icon: <Activity size={16} />, color: 'bg-amber-500', hover: 'hover:text-amber-500', label: 'Empenhada' },
                    { id: StatusEquipe.PAUSA_OPERACIONAL, icon: <Clock size={16} />, color: 'bg-slate-500', hover: 'hover:text-slate-500', label: 'Pausa' }
                  ].map(st => (
                    <button
                      key={st.id}
                      onClick={() => updateEquipeStatus(equipe.id_equipe, { ...equipe, status: st.id })}
                      className={`
                        flex-1 flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl transition-all
                        ${equipe.status === st.id
                          ? `${st.color} text-white shadow-lg scale-105 font-black` 
                          : `text-slate-400 dark:text-slate-500 ${st.hover}`}
                      `}
                    >
                      {st.icon}
                      <span className="text-[8px] uppercase tracking-tighter font-bold">{st.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {equipes.length === 0 && (
        <div className="col-span-full py-32 text-center text-slate-400 font-black uppercase tracking-widest border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem]">
          Nenhuma equipe configurada para este turno.
        </div>
      )}

      {/* Modal Militar */}
      {isMilitarModalOpen.open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col max-h-[80vh] overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Escolher <span className="text-primary">Militar</span></h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Disponíveis</p>
              </div>
              <button onClick={() => setIsMilitarModalOpen({ open: false, idEquipe: null })} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-red-500 transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <Search size={18} className="text-slate-400" />
                <input
                  placeholder="Pesquisar militar..."
                  className="bg-transparent border-none text-sm font-bold outline-none w-full dark:text-white"
                  value={militarSearch}
                  onChange={e => setMilitarSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="p-8 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4 custom-scrollbar">
              {militaresDisponiveis
                .filter(m => {
                  return m?.nome_guerra?.toLowerCase().includes(militarSearch.toLowerCase()) || m?.matricula?.includes(militarSearch);
                })
                .map(m => (
                  <button
                    key={m.matricula}
                    onClick={() => handleAssignMilitar(isMilitarModalOpen.idEquipe!, m.matricula)}
                    className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 hover:border-primary hover:shadow-lg transition-all text-left group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-primary font-black text-sm border border-slate-100 dark:border-slate-800 shadow-sm group-hover:scale-110 transition-transform">
                      {m.nome_guerra?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-xs text-slate-900 dark:text-white uppercase leading-tight">{m.nome_posto_grad} {m.nome_guerra}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1">{m.matricula}</p>
                    </div>
                    <ChevronRight className="ml-auto text-slate-200 group-hover:text-primary transition-colors" size={16} />
                  </button>
                ))
              }
              {militaresDisponiveis.length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-400 font-black uppercase tracking-widest text-xs">
                  Nenhum militar disponível
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Civil */}
      {isCivilModalOpen.open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col max-h-[80vh] overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Escolher <span className="text-primary">Motorista</span></h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">VTRs Disponíveis</p>
              </div>
              <button onClick={() => setIsCivilModalOpen({ open: false, idEquipe: null })} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-red-500 transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <Search size={18} className="text-slate-400" />
                <input
                  placeholder="Pesquisar VTR..."
                  className="bg-transparent border-none text-sm font-bold outline-none w-full dark:text-white"
                  value={civilSearch}
                  onChange={e => setCivilSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="p-8 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4 custom-scrollbar">
              {civisDisponiveis
                .filter(c => {
                  return (c.modelo_veiculo || '').toLowerCase().includes(civilSearch.toLowerCase()) || 
                         (c.placa_veiculo || '').toLowerCase().includes(civilSearch.toLowerCase()) ||
                         c.nome_completo?.toLowerCase().includes(civilSearch.toLowerCase());
                })
                .map(c => (
                  <button
                    key={c.id_civil}
                    onClick={() => handleAssignCivil(isCivilModalOpen.idEquipe!, c.id_civil)}
                    className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 hover:border-primary hover:shadow-lg transition-all text-left group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-primary font-black text-sm border border-slate-100 dark:border-slate-800 shadow-sm group-hover:scale-110 transition-transform">
                      {c.modelo_veiculo?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-xs text-slate-900 dark:text-white uppercase leading-tight">{c.modelo_veiculo}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1">{c.placa_veiculo} • {c.nome_completo}</p>
                    </div>
                    <ChevronRight className="ml-auto text-slate-200 group-hover:text-primary transition-colors" size={16} />
                  </button>
                ))
              }
              {civisDisponiveis.length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-400 font-black uppercase tracking-widest text-xs">
                  Nenhuma VTR disponível
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestaoEquipes;
