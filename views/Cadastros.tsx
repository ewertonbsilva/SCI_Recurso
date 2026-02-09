
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, UserCheck, ShieldAlert, Info, Ship, Waves, CheckCircle2, Edit2, X, Award, FileText, Calendar, Clock, UserPlus } from 'lucide-react';
import { loadData, saveData, sysLog } from '../store';
import { CadastroCivil, CadastroMilitar, FORCAS, POSTOS_GRAD, ORGAOS_ORIGEM, AtestadoMedico } from '../types';
import { ToastType } from '../components/Toast';
import { apiService } from '../apiService';

interface CadastrosProps {
  onNotify?: (msg: string, type: ToastType) => void;
}

const generateId = () => {
  return typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11);
};

const parseLocalDate = (dateStr: string) => {
  if (!dateStr) return new Date();
  
  // Se for formato ISO (com T), extrair apenas a parte da data
  if (dateStr.includes('T')) {
    dateStr = dateStr.split('T')[0];
  }
  
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

const MilitarHoverCard: React.FC<{ militar: CadastroMilitar, atestados: AtestadoMedico[] }> = ({ militar, atestados }) => {
  const activeAtestado = getMilitarActiveAtestado(militar.matricula, atestados);
  const restricted = isMilitarRestricted(militar, atestados);

  return (
    <div className="absolute top-0 right-full mr-4 w-80 p-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-2xl rounded-[2.5rem] z-[100] hidden group-hover:block animate-in fade-in slide-in-from-right-4 duration-300 pointer-events-none">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-black text-slate-900 dark:text-white text-base leading-tight">{militar.nome_completo}</h4>
          <p className="text-[10px] text-blue-500 font-black uppercase mt-1 tracking-widest">{militar.posto_grad} {militar.nome_guerra} • {militar.forca}</p>
        </div>
      </div>

      <div className="space-y-3.5 text-xs">
        <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <span className="text-slate-400 font-bold uppercase text-[9px]">Matrícula / RG</span>
          <span className="text-slate-800 dark:text-slate-200 font-mono font-bold">{militar.matricula}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className={`flex items-center gap-2 p-3 rounded-2xl border ${militar.cpoe ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-700' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-400'}`}>
            <Ship size={16} />
            <span className="font-bold">CPOE</span>
          </div>
          <div className={`flex items-center gap-2 p-3 rounded-2xl border ${militar.mergulhador ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30 text-blue-700' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-400'}`}>
            <Waves size={16} />
            <span className="font-bold">CMAUT</span>
          </div>
        </div>

        <div className="pt-2">
          {restricted ? (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold mb-1">
                <ShieldAlert size={16} />
                <span className="text-[10px] uppercase">{activeAtestado ? 'ATESTADO MÉDICO ATIVO' : 'RESTRIÇÃO MÉDICA'}</span>
              </div>
              <p className="text-[11px] text-red-600 dark:text-red-300 italic">
                {activeAtestado 
                  ? `${activeAtestado.motivo} (Até ${(() => {
                      const inicio = parseLocalDate(activeAtestado.data_inicio);
                      const fim = new Date(inicio);
                      fim.setDate(inicio.getDate() + (activeAtestado.dias - 1));
                      return fim.toLocaleDateString();
                    })()})` 
                  : (militar.descRestMed || 'Nenhuma descrição.')}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
              <CheckCircle2 size={16} />
              <span className="text-[10px] uppercase">PRONTO PARA SERVIÇO</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Validar telefone
const validateTelefone = (telefone: string): boolean => {
  const cleaned = telefone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 11;
};

// Validar placa de veículo (formato brasileiro)
const validatePlaca = (placa: string): boolean => {
  if (!placa) return true; // opcional
  const pattern = /^[A-Z]{3}[0-9][A-Z0-9][0-9]$/; // Mercosul: ABC1D23 ou ABC1234
  return pattern.test(placa.replace(/[-\s]/g, '').toUpperCase());
};

const Cadastros: React.FC<CadastrosProps> = ({ onNotify }) => {
  const [atestados, setAtestados] = useState<AtestadoMedico[]>([]);
  const [militares, setMilitares] = useState<CadastroMilitar[]>([]);
  const [civis, setCivis] = useState<CadastroCivil[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'militar' | 'civil' | 'atestado'>('militar');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);


  useEffect(() => {
    loadDadosFromAPI();
  }, []);

  const loadDadosFromAPI = async () => {
    try {
      setLoading(true);
      console.log('Carregando dados da API...');
      
      const [militaresData, civisData, atestadosData] = await Promise.all([
        apiService.getMilitares(),
        apiService.getCivis(),
        apiService.getAtestados()
      ]);
      
      setMilitares(militaresData);
      setCivis(civisData);
      setAtestados(atestadosData);
      
      console.log('Dados carregados com sucesso:', { 
        militares: militaresData.length, 
        civis: civisData.length,
        atestados: atestadosData.length 
      });
    } catch (error) {
      console.error('Erro ao carregar dados da API:', error);
      onNotify?.('Erro ao carregar dados do banco de dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toLocaleDateString('en-CA');

  const [militarForm, setMilitarForm] = useState<Partial<CadastroMilitar>>({
    matricula: '', nome_completo: '', posto_grad: 'Soldado', nome_guerra: '', rg: '', forca: 'CBMAC', cpoe: false, mergulhador: false, restricao_medica: false, desc_rest_med: ''
  });
  const [civilForm, setCivilForm] = useState<Partial<CadastroCivil>>({
    nome_completo: '', contato: '', orgao_origem: 'Defesa Civil', motorista: false, modelo_veiculo: '', placa_veiculo: ''
  });
  const [atestadoForm, setAtestadoForm] = useState<Partial<AtestadoMedico>>({
    matricula: '', data_inicio: todayStr, dias: 1, motivo: ''
  });

  const handleEditMilitar = (m: CadastroMilitar) => {
    setActiveSubTab('militar');
    setEditingId(m.matricula);
    setMilitarForm(m);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditCivil = (c: CadastroCivil) => {
    setActiveSubTab('civil');
    setEditingId(c.id_civil);
    setCivilForm(c);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setMilitarForm({ matricula: '', nome_completo: '', posto_grad: 'Soldado', nome_guerra: '', rg: '', forca: 'CBMAC', cpoe: false, mergulhador: false, restricao_medica: false, desc_rest_med: '' });
    setCivilForm({ nome_completo: '', contato: '', orgao_origem: 'Defesa Civil', motorista: false, modelo_veiculo: '', placa_veiculo: '' });
    setAtestadoForm({ matricula: '', data_inicio: todayStr, dias: 1, motivo: '' });
  };

  const handleSaveMilitar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!militarForm.matricula || !militarForm.nome_completo) {
      onNotify?.("Preencha os campos obrigatórios.", "error");
      return;
    }

    try {
      if (editingId) {
        await apiService.updateMilitar(editingId, militarForm);
        onNotify?.("Militar atualizado com sucesso!", "success");
      } else {
        await apiService.createMilitar(militarForm);
        onNotify?.("Militar cadastrado com sucesso!", "success");
      }
      
      setMilitarForm({ matricula: '', nome_completo: '', posto_grad: 'Soldado', nome_guerra: '', rg: '', forca: 'CBMAC', cpoe: false, mergulhador: false, restricao_medica: false, desc_rest_med: '' });
      setEditingId(null);
      await loadDadosFromAPI();
    } catch (error) {
      console.error('Erro ao salvar militar:', error);
      onNotify?.('Erro ao salvar militar no banco de dados', 'error');
    }
    cancelEdit();
  };

  const handleSaveCivil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!civilForm.nome_completo || !civilForm.contato) {
      onNotify?.("Preencha os campos obrigatórios.", "error");
      return;
    }

    // Validar telefone
    if (!validateTelefone(civilForm.contato)) {
      onNotify?.("Telefone inválido. Use o formato (00) 00000-0000.", "error");
      return;
    }

    // Validar placa se preenchida
    if (civilForm.placa_veiculo && !validatePlaca(civilForm.placa_veiculo)) {
      onNotify?.("Placa inválida. Use o formato ABC1234 ou ABC1D23.", "error");
      return;
    }

    try {
      if (editingId) {
        await apiService.updateCivil(editingId, civilForm);
        onNotify?.("Civil atualizado com sucesso!", "success");
      } else {
        await apiService.createCivil(civilForm);
        onNotify?.("Civil cadastrado com sucesso!", "success");
      }
      
      setCivilForm({ nome_completo: '', contato: '', orgao_origem: 'Defesa Civil', motorista: false, modelo_veiculo: '', placa_veiculo: '' });
      setEditingId(null);
      await loadDadosFromAPI();
    } catch (error) {
      console.error('Erro ao salvar civil:', error);
      onNotify?.('Erro ao salvar civil no banco de dados', 'error');
    }
    cancelEdit();
  };

  const handleSaveAtestado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!atestadoForm.matricula || !atestadoForm.data_inicio || !atestadoForm.dias) {
        onNotify?.("Preencha os campos obrigatórios.", "error");
        return;
    }

    try {
        await apiService.createAtestado(atestadoForm);
        setAtestadoForm({ matricula: '', data_inicio: todayStr, dias: 1, motivo: '' });
        onNotify?.("Atestado registrado com sucesso!", "success");
        await loadDadosFromAPI();
    } catch (error) {
        console.error('Erro ao salvar atestado:', error);
        onNotify?.('Erro ao salvar atestado no banco de dados', 'error');
    }
  };

  const removeMilitar = async (e: React.MouseEvent, matricula: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await apiService.deleteMilitar(matricula);
      onNotify?.("Militar excluído com sucesso.", "warning");
      await loadDadosFromAPI();
    } catch (error) {
      console.error('Erro ao excluir militar:', error);
      onNotify?.('Erro ao excluir militar', 'error');
    }
    if (editingId === matricula) cancelEdit();
  };

  const removeCivil = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await apiService.deleteCivil(id);
      onNotify?.("Civil excluído com sucesso.", "warning");
      await loadDadosFromAPI();
    } catch (error) {
      console.error('Erro ao excluir civil:', error);
      onNotify?.('Erro ao excluir civil', 'error');
    }
    if (editingId === id) cancelEdit();
  };

  const removeAtestado = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await apiService.deleteAtestado(id);
      onNotify?.("Atestado removido com sucesso.", "warning");
      await loadDadosFromAPI();
    } catch (error) {
      console.error('Erro ao excluir atestado:', error);
      onNotify?.('Erro ao excluir atestado', 'error');
    }
  };

  const filteredMilitares = militares.filter(m => 
    m.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.nome_guerra.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.matricula.includes(searchTerm)
  );

  const filteredCivis = civis.filter(c => 
    c.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.orgao_origem.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAtestados = atestados.filter(at => {
    const m = militares.find(mil => mil.matricula === at.matricula);
    return m?.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) || at.matricula.includes(searchTerm);
  }).sort((a,b) => b.data_inicio.localeCompare(a.data_inicio));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">Recursos <span className="text-blue-600">Base</span></h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Gestão e prontuário de pessoal.</p>
        </div>
        
        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm w-fit self-start">
          <button onClick={() => { setActiveSubTab('militar'); cancelEdit(); }} className={`px-6 py-2.5 rounded-[1.5rem] font-bold text-xs uppercase tracking-widest transition-all ${activeSubTab === 'militar' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Militares</button>
          <button onClick={() => { setActiveSubTab('civil'); cancelEdit(); }} className={`px-6 py-2.5 rounded-[1.5rem] font-bold text-xs uppercase tracking-widest transition-all ${activeSubTab === 'civil' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Civis</button>
          <button onClick={() => { setActiveSubTab('atestado'); cancelEdit(); }} className={`px-6 py-2.5 rounded-[1.5rem] font-bold text-xs uppercase tracking-widest transition-all ${activeSubTab === 'atestado' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Atestados</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm sticky top-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black uppercase tracking-tighter">
                {activeSubTab === 'atestado' ? 'Lançar' : (editingId ? 'Editar' : 'Novo')} <span className="text-blue-600">{activeSubTab === 'militar' ? 'Militar' : activeSubTab === 'civil' ? 'Civil' : 'Atestado'}</span>
              </h3>
              {editingId && <button onClick={cancelEdit} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-red-500 transition-colors"><X size={16} /></button>}
            </div>
            
            {activeSubTab === 'atestado' ? (
                <form onSubmit={handleSaveAtestado} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Militar</label>
                        <select value={atestadoForm.matricula} onChange={e => setAtestadoForm({...atestadoForm, matricula: e.target.value})} required className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm outline-none cursor-pointer">
                            <option value="">Selecione o Militar...</option>
                            {militares.map(m => <option key={m.matricula} value={m.matricula}>{m.posto_grad} {m.nome_guerra} ({m.matricula})</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Data Início</label>
                            <input type="date" value={atestadoForm.data_inicio} onChange={e => setAtestadoForm({...atestadoForm, data_inicio: e.target.value})} required className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm outline-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Dias</label>
                            <input type="number" min="1" value={atestadoForm.dias} onChange={e => setAtestadoForm({...atestadoForm, dias: parseInt(e.target.value) || 1})} required className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm outline-none" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Motivo / CID</label>
                        <input value={atestadoForm.motivo} onChange={e => setAtestadoForm({...atestadoForm, motivo: e.target.value})} required placeholder="Ex: CID M54.5" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm outline-none" />
                    </div>
                    <button type="submit" className="w-full bg-red-600 text-white py-4 rounded-[1.5rem] flex items-center justify-center gap-2 hover:bg-red-700 active:scale-95 transition-all font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-red-500/20"><Plus size={18} /> Registrar Atestado</button>
                </form>
            ) : (
                <form onSubmit={activeSubTab === 'militar' ? handleSaveMilitar : handleSaveCivil} className="space-y-5">
                {activeSubTab === 'militar' ? (
                    <>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Matrícula</label>
                        <input value={militarForm.matricula} onChange={e => setMilitarForm({...militarForm, matricula: e.target.value})} disabled={!!editingId} required placeholder="00.000-0" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm outline-none disabled:opacity-50" />
                        </div>
                        <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">RG</label>
                        <input value={militarForm.rg} onChange={e => setMilitarForm({...militarForm, rg: e.target.value})} placeholder="Opcional" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm outline-none" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Nome Completo</label>
                        <input value={militarForm.nome_completo} onChange={e => setMilitarForm({...militarForm, nome_completo: e.target.value})} required className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Posto/Grad</label>
                        <select value={militarForm.posto_grad} onChange={e => setMilitarForm({...militarForm, posto_grad: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm outline-none">
                            {Object.values(POSTOS_GRAD).map(posto => (
                                <option key={posto} value={posto}>{posto}</option>
                            ))}
                        </select>
                        </div>
                        <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Força</label>
                        <select value={militarForm.forca} onChange={e => setMilitarForm({...militarForm, forca: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm outline-none">
                            {Object.values(FORCAS).map(f => (
                                <option key={f} value={f}>{f}</option>
                            ))}
                        </select>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Nome de Guerra</label>
                        <input value={militarForm.nome_guerra} onChange={e => setMilitarForm({...militarForm, nome_guerra: e.target.value})} required className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm outline-none" />
                    </div>
                    <div className="flex gap-4 p-4 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50">
                        <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={militarForm.cpoe} onChange={e => setMilitarForm({...militarForm, cpoe: e.target.checked})} className="w-4 h-4 rounded-lg accent-blue-600" />
                        <span className="text-[10px] font-bold text-slate-500 group-hover:text-blue-600">CPOE</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={militarForm.mergulhador} onChange={e => setMilitarForm({...militarForm, mergulhador: e.target.checked})} className="w-4 h-4 rounded-lg accent-blue-600" />
                        <span className="text-[10px] font-bold text-slate-500 group-hover:text-blue-600">CMAUT</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={militarForm.restricao_medica} onChange={(e) => { setMilitarForm({...militarForm, restricao_medica: e.target.checked}) }} className="w-4 h-4 rounded-lg accent-red-600" />
                        <span className="text-[10px] font-bold text-red-500">RESTRIÇÃO</span>
                        </label>
                    </div>
                    {militarForm.restricao_medica && (
                        <div className="space-y-1.5 animate-in slide-in-from-top-2">
                             <label className="text-[10px] font-black uppercase text-red-500 tracking-widest ml-4 flex items-center gap-2"><ShieldAlert size={12} /> Descrição Obrigatória</label>
                             <input value={militarForm.desc_rest_med} onChange={e => setMilitarForm({...militarForm, desc_rest_med: e.target.value})} placeholder="Motivo da restrição..." required className={`w-full px-5 py-3.5 bg-red-50 dark:bg-red-950/20 border rounded-[1.5rem] text-sm outline-none transition-all ${!militarForm.desc_rest_med?.trim() ? 'border-red-400 ring-2 ring-red-100' : 'border-red-100 dark:border-red-900/30'}`} />
                        </div>
                    )}
                    </>
                ) : (
                    <>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Nome Completo</label>
                        <input value={civilForm.nome_completo} onChange={e => setCivilForm({...civilForm, nome_completo: e.target.value})} required className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm outline-none" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Contato</label>
                        <input value={civilForm.contato} onChange={e => setCivilForm({...civilForm, contato: e.target.value})} required placeholder="(00) 00000-0000" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm outline-none" />
                        {civilForm.contato && !validateTelefone(civilForm.contato) && (
                          <p className="text-red-500 text-xs mt-1 ml-4">Telefone inválido</p>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Órgão</label>
                        <select value={civilForm.orgao_origem} onChange={e => setCivilForm({...civilForm, orgao_origem: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm outline-none">
                            {Object.values(ORGAOS_ORIGEM).map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Vtr (Modelo)</label>
                        <input value={civilForm.modelo_veiculo} onChange={e => setCivilForm({...civilForm, modelo_veiculo: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm outline-none" />
                        </div>
                        <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Placa</label>
                        <input value={civilForm.placa_veiculo} onChange={e => setCivilForm({...civilForm, placa_veiculo: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7)})} placeholder="ABC1234" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm outline-none" />
                        {civilForm.placa_veiculo && !validatePlaca(civilForm.placa_veiculo) && (
                          <p className="text-red-500 text-xs mt-1 ml-4">Placa inválida (ex: ABC1234)</p>
                        )}
                        </div>
                    </div>
                    <div className="p-4 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50">
                        <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={civilForm.motorista} onChange={e => setCivilForm({...civilForm, motorista: e.target.checked})} className="w-4 h-4 rounded-lg accent-emerald-600" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Motorista Autorizado</span>
                        </label>
                    </div>
                    </>
                )}
                <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-[1.5rem] flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition-all font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20">{editingId ? <Edit2 size={18} /> : <Plus size={18} />} {editingId ? 'Atualizar' : 'Salvar'} Cadastro</button>
                </form>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 group">
            <Search className="text-slate-400 group-focus-within:text-blue-500 transition-colors ml-4" size={20} />
            <input placeholder="Filtre por nome, matrícula ou unidade..." className="bg-transparent border-none focus:ring-0 w-full outline-none text-sm font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-visible">
            {loading ? (
              <div className="py-20 text-center text-slate-400 font-medium">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                Carregando dados do banco de dados...
              </div>
            ) : (
              <>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-8 py-5 font-black text-slate-400 uppercase text-[10px] tracking-widest">{activeSubTab === 'atestado' ? 'Militar / Período' : 'Identificação'}</th>
                  <th className="px-8 py-5 font-black text-slate-400 uppercase text-[10px] tracking-widest text-center">{activeSubTab === 'atestado' ? 'Status' : 'Perfil'}</th>
                  <th className="px-8 py-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeSubTab === 'militar' ? (
                  filteredMilitares.map((m) => {
                    const restricted = isMilitarRestricted(m, atestados);
                    return (
                    <tr key={m.matricula} className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group ${editingId === m.matricula ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                        <td className="px-8 py-5 relative">
                            <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white cursor-help">{m.posto_grad} {m.nome_guerra}<Info size={12} className="text-slate-300 group-hover:text-blue-500" /></div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{m.matricula} • {m.forca}</div>
                            <MilitarHoverCard militar={m} atestados={atestados} />
                        </td>
                        <td className="px-8 py-5 text-center">
                            <div className="flex justify-center gap-1.5">
                            {m.cpoe && <div className="w-2 h-2 rounded-full bg-emerald-500" title="CPOE"></div>}
                            {m.mergulhador && <div className="w-2 h-2 rounded-full bg-blue-500" title="CMAUT"></div>}
                            {restricted && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Restrição Ativa"></div>}
                            </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditMilitar(m); }} className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-xl transition-all"><Edit2 size={18} /></button>
                            <button onClick={(e) => removeMilitar(e, m.matricula)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"><Trash2 size={18} /></button>
                            </div>
                        </td>
                        </tr>
                    );
                  })
                ) : activeSubTab === 'civil' ? (
                  filteredCivis.map((c) => (
                    <tr key={c.id_civil} className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group ${editingId === c.id_civil ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                      <td className="px-8 py-5">
                        <div className="font-black text-slate-900 dark:text-white">{c.nome_completo}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{c.contato} • {c.orgao_origem}</div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex flex-wrap justify-center gap-2">
                          {c.motorista && <UserCheck size={16} className="text-emerald-500" />}
                          {c.modelo_veiculo && <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full uppercase tracking-tighter">{c.modelo_veiculo}</span>}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditCivil(c); }} className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-xl transition-all"><Edit2 size={18} /></button>
                          <button onClick={(e) => removeCivil(e, c.id_civil)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                    filteredAtestados.map((at) => {
                        const m = militares.find(mil => mil.matricula === at.matricula);
                        
                        // Verificar se este atestado específico está ativo
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const inicioDate = parseLocalDate(at.data_inicio);
                        inicioDate.setHours(0, 0, 0, 0);
                        const fim = new Date(inicioDate);
                        fim.setDate(inicioDate.getDate() + at.dias - 1);
                        fim.setHours(23, 59, 59, 999);
                        const isActive = today >= inicioDate && today <= fim;
                        
                        return (
                            <tr key={at.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                <td className="px-8 py-5">
                                    <div className="font-black text-slate-900 dark:text-white uppercase leading-tight">{m?.posto_grad} {m?.nome_guerra}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">{inicioDate.toLocaleDateString()} — {fim.toLocaleDateString()} ({at.dias} dias)</div>
                                    <div className="text-[9px] text-red-500 font-bold uppercase mt-1 italic">{at.motivo}</div>
                                </td>
                                <td className="px-8 py-5 text-center">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isActive ? 'bg-red-100 text-red-700 dark:bg-red-900/30' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>{isActive ? 'Ativo' : 'Expirado'}</span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <button onClick={(e) => removeAtestado(e, at.id)} className="p-2 text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        );
                    })
                )}
                {(activeSubTab === 'militar' ? filteredMilitares : activeSubTab === 'civil' ? filteredCivis : filteredAtestados).length === 0 && (
                  <tr><td colSpan={3} className="py-20 text-center text-slate-400 font-medium italic">Nenhum registro encontrado.</td></tr>
                )}
              </tbody>
            </table>
            </>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cadastros;
