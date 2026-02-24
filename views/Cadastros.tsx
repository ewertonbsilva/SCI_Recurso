import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, UserCheck, ShieldAlert, Info, Ship, Waves, CheckCircle2, Edit2, X, Award, FileText, Calendar, Clock, UserPlus } from 'lucide-react';
import { CadastroCivil, CadastroMilitar, AtestadoMedico, PostoGrad, Forca, OrgaoOrigem } from '../types';
import { ToastType } from '../components/Toast';
import { apiService } from '../apiService';
import { useAuth } from '../contexts/AuthContext';

// Função para obter cores do tema atual (fora do componente)
const getThemeColors = () => {
  const root = document.documentElement;
  const theme = root.getAttribute('data-theme') || 'default';
  
  const themeColors: Record<string, { primary: string; primaryHover: string; rgb: string }> = {
    default: { primary: '#3b82f6', primaryHover: '#2563eb', rgb: '59, 130, 246' },
    ocean: { primary: '#0ea5e9', primaryHover: '#0284c7', rgb: '14, 165, 233' },
    forest: { primary: '#10b981', primaryHover: '#059669', rgb: '16, 185, 129' },
    crimson: { primary: '#dc2626', primaryHover: '#b91c1c', rgb: '220, 38, 38' },
    indigo: { primary: '#4f46e5', primaryHover: '#4338ca', rgb: '79, 70, 229' }
  };
  
  return themeColors[theme] || themeColors.default;
};

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

const MilitarCard: React.FC<{ militar: CadastroMilitar, atestados: AtestadoMedico[], themeColors: any }> = ({ militar, atestados, themeColors }) => {
  const activeAtestado = getMilitarActiveAtestado(militar.matricula, atestados);
  const restricted = isMilitarRestricted(militar, atestados);

  return (
    <div className="absolute top-0 right-full mr-4 w-80 p-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-2xl rounded-[2.5rem] z-[100] hidden group-hover:block animate-in fade-in slide-in-from-right-4 duration-300 pointer-events-none">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-black text-slate-900 dark:text-white text-base leading-tight">{militar.nome_completo}</h4>
          <p className="text-[10px] text-blue-500 font-black uppercase mt-1 tracking-widest">{militar.nome_posto_grad} {militar.nome_guerra} • {militar.nome_forca || 'N/A'}</p>
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
          <div className={`flex items-center gap-2 p-3 rounded-2xl border ${militar.mergulhador ? 'border-blue-100 dark:border-blue-900/30' : 'border-slate-100 dark:border-slate-800'}`} style={{ backgroundColor: militar.mergulhador ? themeColors.primary + '10' : 'rgb(248 250 251)', color: militar.mergulhador ? themeColors.primary : 'rgb(148 163 184)' }}>
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
  const pattern = /^[A-Z]{3}[0-9]{4}$|^[A-Z]{3}[0-9][A-Z][0-9]{2}$/; // ABC1234 ou ABC1D23
  return pattern.test(placa.replace(/[-\s]/g, '').toUpperCase());
};

const Cadastros: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'militar' | 'civil' | 'atestado'>('militar');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [themeColors, setThemeColors] = useState(getThemeColors());
  
  // Estados de dados
  const [loading, setLoading] = useState(true);
  const [militares, setMilitares] = useState<CadastroMilitar[]>([]);
  const [civis, setCivis] = useState<CadastroCivil[]>([]);
  const [atestados, setAtestados] = useState<AtestadoMedico[]>([]);
  const [postos, setPostos] = useState<PostoGrad[]>([]);
  const [forcas, setForcas] = useState<Forca[]>([]);
  const [orgaosOrigem, setOrgaosOrigem] = useState<OrgaoOrigem[]>([]);
  const [ubms, setUbms] = useState<any[]>([]);

  // Função de notificação local
  const onNotify = (msg: string, type: ToastType) => {
    console.log(`${type.toUpperCase()}: ${msg}`);
  };

  // Monitorar mudanças no tema
  useEffect(() => {
    const handleThemeChange = () => {
      setThemeColors(getThemeColors());
    };

    // Observer para mudanças no atributo data-theme
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          handleThemeChange();
        }
      });
    });

    // Observer para mudanças no localStorage (tema salvo)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sci_ui_theme') {
        handleThemeChange();
      }
    };

    // Iniciar observers
    observer.observe(document.documentElement, { attributes: true });
    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      observer.disconnect();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    // Só carregar dados quando autenticação estiver completa e usuário estiver autenticado
    if (!authLoading && isAuthenticated) {
      loadDadosFromAPI();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  const loadDadosFromAPI = async () => {
    try {
      setLoading(true);
      console.log('Carregando dados da API...');

      const [militaresData, civisData, atestadosData, postosData, forcasData, orgaosOrigemData, ubmsData] = await Promise.all([
        apiService.getMilitares(),
        apiService.getCivis(),
        apiService.getAtestados(),
        apiService.getPostosGrad(),
        apiService.getForcas(),
        apiService.getOrgaosOrigem(),
        apiService.getUBMs()
      ]);

      setMilitares(militaresData);
      setCivis(civisData);
      setAtestados(atestadosData);
      setPostos(postosData);
      setForcas(forcasData);
      setOrgaosOrigem(orgaosOrigemData);
      setUbms(ubmsData);

      console.log('Dados carregados com sucesso:', {
        militares: militaresData.length,
        civis: civisData.length,
        atestados: atestadosData.length,
        postos: postosData.length,
        forcas: forcasData.length,
        orgaosOrigem: orgaosOrigemData.length,
        ubms: ubmsData.length
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
    matricula: '', nome_completo: '', id_posto_grad: 0, nome_guerra: '', rg: '', id_forca: 0, cpoe: false, mergulhador: false, restricao_medica: false, desc_rest_med: '', id_ubm: ''
  });
  const [civilForm, setCivilForm] = useState<Partial<CadastroCivil>>({
    nome_completo: '', contato: '', id_orgao_origem: 0, motorista: false, modelo_veiculo: '', placa_veiculo: ''
  });
  const [atestadoForm, setAtestadoForm] = useState<Partial<AtestadoMedico>>({
    matricula: '', data_inicio: todayStr, dias: 1, motivo: ''
  });

  // Estado para busca de militares no atestado
  const [buscaMilitarAtestado, setBuscaMilitarAtestado] = useState('');
  const [showBuscaAtestado, setShowBuscaAtestado] = useState(false);

  // Efeito para fechar busca ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.busca-atestado-container')) {
        setShowBuscaAtestado(false);
      }
    };

    if (showBuscaAtestado) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBuscaAtestado]);

  // Função para filtrar militares na busca do atestado
  const militaresFiltradosAtestado = militares.filter(m => {
    const posto = postos.find(p => p.id_posto_grad === m.id_posto_grad);
    const nomeCompleto = `${posto?.nome_posto_grad || ''} ${m.nome_guerra} (${m.matricula}) - ${m.nome_ubm || 'Sem UBM'}`.toLowerCase();
    const busca = buscaMilitarAtestado.toLowerCase();
    return nomeCompleto.includes(busca) || m.matricula.includes(busca) || m.nome_guerra.toLowerCase().includes(busca);
  });

  // Estados para formulários de cadastro básico
  const [postoForm, setPostoForm] = useState<Partial<any>>({
    nome_posto_grad: '', hierarquia: 0
  });
  const [forcaForm, setForcaForm] = useState<Partial<any>>({
    nome_forca: ''
  });
  const [orgaoForm, setOrgaoForm] = useState<Partial<any>>({
    nome_orgao: ''
  });
  const [ubmForm, setUBMForm] = useState<{ id_ubm: string, nome_ubm: string }>({
    id_ubm: '', nome_ubm: ''
  });

  const handleEditMilitar = (m: CadastroMilitar) => {
    setActiveSubTab('militar');
    setEditingId(m.matricula);
    setMilitarForm({
      matricula: m.matricula,
      nome_completo: m.nome_completo,
      id_posto_grad: m.id_posto_grad,
      nome_posto_grad: m.nome_posto_grad || '',
      hierarquia: m.hierarquia || 0,
      nome_guerra: m.nome_guerra,
      rg: m.rg,
      id_forca: m.id_forca,
      nome_forca: m.nome_forca || '',
      cpoe: m.cpoe,
      mergulhador: m.mergulhador,
      restricao_medica: m.restricao_medica,
      desc_rest_med: m.desc_rest_med,
      id_ubm: m.id_ubm || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditCivil = (c: CadastroCivil) => {
    setActiveSubTab('civil');
    setEditingId(c.id_civil);
    setCivilForm({
      nome_completo: c.nome_completo,
      contato: c.contato,
      id_orgao_origem: c.id_orgao_origem,
      nome_orgao: c.nome_orgao || '',
      motorista: c.motorista,
      modelo_veiculo: c.modelo_veiculo,
      placa_veiculo: c.placa_veiculo
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setMilitarForm({ matricula: '', nome_completo: '', id_posto_grad: 0, nome_guerra: '', rg: '', id_forca: 0, cpoe: false, mergulhador: false, restricao_medica: false, desc_rest_med: '', id_ubm: '' });
    setCivilForm({ nome_completo: '', contato: '', id_orgao_origem: 0, motorista: false, modelo_veiculo: '', placa_veiculo: '' });
    setAtestadoForm({ matricula: '', data_inicio: todayStr, dias: 1, motivo: '' });
    setPostoForm({ nome_posto_grad: '', hierarquia: 0 });
    setForcaForm({ nome_forca: '' });
    setOrgaoForm({ nome_orgao: '' });
    setUBMForm({ id_ubm: '', nome_ubm: '' });
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

      setMilitarForm({ matricula: '', nome_completo: '', id_posto_grad: 0, nome_guerra: '', rg: '', id_forca: 0, cpoe: false, mergulhador: false, restricao_medica: false, desc_rest_med: '', id_ubm: '' });
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

      setCivilForm({ nome_completo: '', contato: '', id_orgao_origem: 0, motorista: false, modelo_veiculo: '', placa_veiculo: '' });
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
      setBuscaMilitarAtestado(''); // Limpar campo de busca
      setShowBuscaAtestado(false); // Fechar resultados
      onNotify?.("Atestado registrado com sucesso!", "success");
      await loadDadosFromAPI();
    } catch (error) {
      console.error('Erro ao salvar atestado:', error);
      onNotify?.('Erro ao salvar atestado no banco de dados', 'error');
    }
  };

  const handleSavePostoGrad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postoForm.nome_posto_grad) {
      onNotify?.("Preencha os campos obrigatórios.", "error");
      return;
    }

    try {
      if (editingId) {
        await apiService.updatePostoGrad(editingId, postoForm);
        onNotify?.("Posto/Grad atualizado com sucesso!", "success");
      } else {
        await apiService.createPostoGrad(postoForm);
        onNotify?.("Posto/Grad cadastrado com sucesso!", "success");
      }

      // Recarregar dados para atualizar os dropdowns
      await loadDadosFromAPI();
      setEditingId(null);
      setPostoForm({ nome_posto_grad: 0, hierarquia: 0 });
    } catch (error) {
      console.error('Erro ao salvar posto/grad:', error);
      onNotify?.('Erro ao salvar posto/grad no banco de dados', 'error');
    }
    cancelEdit();
  };

  const handleSaveForca = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forcaForm.nome_forca) {
      onNotify?.("Preencha os campos obrigatórios.", "error");
      return;
    }

    try {
      if (editingId) {
        await apiService.updateForca(editingId, forcaForm);
        onNotify?.("Força atualizada com sucesso!", "success");
      } else {
        await apiService.createForca(forcaForm);
        onNotify?.("Força cadastrada com sucesso!", "success");
      }

      // Recarregar dados para atualizar os dropdowns
      await loadDadosFromAPI();
      setEditingId(null);
      setForcaForm({ nome_forca: '', id_forca: 0 });
    } catch (error) {
      console.error('Erro ao salvar força:', error);
      onNotify?.('Erro ao salvar força no banco de dados', 'error');
    }
    cancelEdit();
  };

  const handleSaveOrgao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgaoForm.nome_orgao) {
      onNotify?.("Preencha os campos obrigatórios.", "error");
      return;
    }

    try {
      if (editingId) {
        await apiService.updateOrgaoOrigem(editingId, orgaoForm);
        onNotify?.("Órgão atualizado com sucesso!", "success");
      } else {
        await apiService.createOrgaoOrigem(orgaoForm);
        onNotify?.("Órgão cadastrado com sucesso!", "success");
      }

      // Recarregar dados para atualizar os dropdowns
      await loadDadosFromAPI();
      setEditingId(null);
      setOrgaoForm({ nome_orgao: '', id_orgao_origem: 0 });
    } catch (error) {
      console.error('Erro ao salvar órgão:', error);
      onNotify?.('Erro ao salvar órgão no banco de dados', 'error');
    }
    cancelEdit();
  };

  const handleSaveUBM = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ubmForm.id_ubm || !ubmForm.nome_ubm) {
      onNotify?.("Preencha os campos obrigatórios.", "error");
      return;
    }

    try {
      if (editingId) {
        await apiService.updateUBM(editingId, ubmForm);
        onNotify?.("UBM atualizada com sucesso!", "success");
      } else {
        await apiService.createUBM(ubmForm);
        onNotify?.("UBM cadastrada com sucesso!", "success");
      }

      // Recarregar dados para atualizar os dropdowns
      await loadDadosFromAPI();
      setEditingId(null);
      setUBMForm({ id_ubm: '', nome_ubm: '' });
    } catch (error) {
      console.error('Erro ao salvar UBM:', error);
      onNotify?.('Erro ao salvar UBM no banco de dados', 'error');
    }
    cancelEdit();
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
    (c.nome_orgao && c.nome_orgao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredAtestados = atestados.filter(at => {
    const m = militares.find(mil => mil.matricula === at.matricula);
    return m?.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) || at.matricula.includes(searchTerm);
  }).sort((a, b) => b.data_inicio.localeCompare(a.data_inicio));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">Recursos <span style={{ color: themeColors.primary }}>Base</span></h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Gestão e prontuário de pessoal.</p>
        </div>

        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm w-fit self-start">
          <button onClick={() => { setActiveSubTab('militar'); cancelEdit(); }} className={`px-6 py-2.5 rounded-[1.5rem] font-bold text-xs uppercase tracking-widest transition-all ${activeSubTab === 'militar' ? 'text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`} style={{ backgroundColor: activeSubTab === 'militar' ? themeColors.primary : 'transparent' }}>Militares</button>
          <button onClick={() => { setActiveSubTab('civil'); cancelEdit(); }} className={`px-6 py-2.5 rounded-[1.5rem] font-bold text-xs uppercase tracking-widest transition-all ${activeSubTab === 'civil' ? 'text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`} style={{ backgroundColor: activeSubTab === 'civil' ? themeColors.primary : 'transparent' }}>Civis</button>
          <button onClick={() => { setActiveSubTab('atestado'); cancelEdit(); }} className={`px-6 py-2.5 rounded-[1.5rem] font-bold text-xs uppercase tracking-widest transition-all ${activeSubTab === 'atestado' ? 'text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`} style={{ backgroundColor: activeSubTab === 'atestado' ? themeColors.primary : 'transparent' }}>Atestados</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm sticky top-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black uppercase tracking-tighter">
                {activeSubTab === 'atestado' ? 'Lançar' : (editingId ? 'Editar' : 'Novo')} <span style={{ color: themeColors.primary }}>{activeSubTab === 'militar' ? 'Militar' : activeSubTab === 'civil' ? 'Civil' : 'Atestado'}</span>
              </h3>
              {editingId && <button onClick={cancelEdit} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-red-500 transition-colors"><X size={16} /></button>}
            </div>

            {activeSubTab === 'atestado' ? (
              <form onSubmit={handleSaveAtestado} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Militar</label>
                  <div className="relative busca-atestado-container">
                    <input
                      type="text"
                      value={buscaMilitarAtestado}
                      onChange={e => setBuscaMilitarAtestado(e.target.value)}
                      onFocus={() => setShowBuscaAtestado(true)}
                      placeholder="Buscar militar por nome, matrícula ou posto..."
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm outline-none"
                    />
                    {showBuscaAtestado && buscaMilitarAtestado && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[1rem] shadow-lg max-h-60 overflow-y-auto z-50">
                        {militaresFiltradosAtestado.length > 0 ? (
                          militaresFiltradosAtestado.map(m => {
                            const posto = postos.find(p => p.id_posto_grad === m.id_posto_grad);
                            return (
                              <div
                                key={m.matricula}
                                onClick={() => {
                                  setAtestadoForm({ ...atestadoForm, matricula: m.matricula });
                                  setBuscaMilitarAtestado(`${posto?.nome_posto_grad || ''} ${m.nome_guerra} (${m.matricula}) - ${m.nome_ubm || 'Sem UBM'}`);
                                  setShowBuscaAtestado(false);
                                }}
                                className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                              >
                                <div className="font-medium text-sm text-slate-900 dark:text-white">
                                  {posto?.nome_posto_grad || ''} {m.nome_guerra}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  {m.matricula} • {m.nome_ubm || 'Sem UBM'}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                            Nenhum militar encontrado
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {atestadoForm.matricula && (
                    <div className="text-xs text-green-600 dark:text-green-400 ml-4 mt-1">
                      ✓ Militar selecionado: {militares.find(m => m.matricula === atestadoForm.matricula)?.nome_guerra}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Data Início</label>
                    <input type="date" value={atestadoForm.data_inicio} onChange={e => setAtestadoForm({ ...atestadoForm, data_inicio: e.target.value })} required className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Dias</label>
                    <input type="number" min="1" value={atestadoForm.dias} onChange={e => setAtestadoForm({ ...atestadoForm, dias: parseInt(e.target.value) || 1 })} required className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm outline-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Motivo / CID</label>
                  <input value={atestadoForm.motivo} onChange={e => setAtestadoForm({ ...atestadoForm, motivo: e.target.value })} required placeholder="Ex: CID M54.5" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm outline-none" />
                </div>
                <button type="submit" className="w-full text-white py-4 rounded-[1.5rem] flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all font-black text-xs uppercase tracking-[0.2em] shadow-lg" style={{ backgroundColor: themeColors.primary, boxShadow: `0 10px 15px -3px ${themeColors.primary}20` }}><Plus size={18} /> Registrar Atestado</button>
              </form>
            ) : (
              <form onSubmit={activeSubTab === 'militar' ? handleSaveMilitar : handleSaveCivil} className="space-y-5">
                {activeSubTab === 'militar' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Matrícula</label>
                        <input value={militarForm.matricula} onChange={e => setMilitarForm({ ...militarForm, matricula: e.target.value })} disabled={!!editingId} required placeholder="00.000-0" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm outline-none disabled:opacity-50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">RG</label>
                        <input value={militarForm.rg} onChange={e => setMilitarForm({ ...militarForm, rg: e.target.value })} placeholder="Opcional" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm outline-none" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Nome Completo</label>
                      <input value={militarForm.nome_completo} onChange={e => setMilitarForm({ ...militarForm, nome_completo: e.target.value })} required className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Posto/Grad</label>
                        <select value={militarForm.id_posto_grad} onChange={e => {
                          const selectedPosto = postos.find(p => p.id_posto_grad === parseInt(e.target.value));
                          setMilitarForm({
                            ...militarForm,
                            id_posto_grad: parseInt(e.target.value),
                            nome_posto_grad: selectedPosto?.nome_posto_grad || '',
                            hierarquia: selectedPosto?.hierarquia || 0
                          });
                        }} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm outline-none">
                          <option value="0">Selecione...</option>
                          {postos.map(p => (
                            <option key={p.id_posto_grad} value={p.id_posto_grad}>{p.nome_posto_grad}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Força</label>
                        <select value={militarForm.id_forca} onChange={e => {
                          const selectedForca = forcas.find(f => f.id_forca === parseInt(e.target.value));
                          setMilitarForm({
                            ...militarForm,
                            id_forca: parseInt(e.target.value),
                            nome_forca: selectedForca?.nome_forca || ''
                          });
                        }} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm outline-none">
                          <option value="">Selecione...</option>
                          {forcas.map(f => (
                            <option key={f.id_forca} value={f.id_forca}>{f.nome_forca}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">UBM</label>
                        <select value={militarForm.id_ubm || ''} onChange={e => setMilitarForm({ ...militarForm, id_ubm: e.target.value })} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm outline-none">
                          <option value="">Selecione...</option>
                          {ubms.map(u => (
                            <option key={u.id_ubm} value={u.id_ubm}>{u.nome_ubm}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Nome de Guerra</label>
                      <input value={militarForm.nome_guerra} onChange={e => setMilitarForm({ ...militarForm, nome_guerra: e.target.value })} required className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm outline-none" />
                    </div>
                    <div className="flex gap-4 p-4 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={militarForm.cpoe} onChange={e => setMilitarForm({ ...militarForm, cpoe: e.target.checked })} className="w-4 h-4 rounded-lg" style={{ accentColor: '#10b981' }} />
                        <span className="text-[10px] font-bold text-slate-500 group-hover:text-emerald-600">CPOE</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={militarForm.mergulhador} onChange={e => setMilitarForm({ ...militarForm, mergulhador: e.target.checked })} className="w-4 h-4 rounded-lg" style={{ accentColor: themeColors.primary }} />
                        <span className="text-[10px] font-bold text-slate-500" style={{ color: themeColors.primary }}>CMAUT</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={militarForm.restricao_medica} onChange={(e) => { setMilitarForm({ ...militarForm, restricao_medica: e.target.checked }) }} className="w-4 h-4 rounded-lg accent-red-600" />
                        <span className="text-[10px] font-bold text-slate-500 group-hover:text-red-600">Restrição Médica</span>
                      </label>
                    </div>
                    {militarForm.restricao_medica && (
                      <div className="space-y-1.5 animate-in slide-in-from-top-2">
                        <label className="text-[10px] font-black uppercase text-red-500 tracking-widest ml-4 flex items-center gap-2"><ShieldAlert size={12} /> Descrição Obrigatória</label>
                        <input value={militarForm.desc_rest_med} onChange={e => setMilitarForm({ ...militarForm, desc_rest_med: e.target.value })} placeholder="Motivo da restrição..." required className={`w-full px-5 py-3.5 bg-red-50 dark:bg-red-950/20 border rounded-[1.5rem] text-sm outline-none transition-all ${!militarForm.desc_rest_med?.trim() ? 'border-red-400 ring-2 ring-red-100' : 'border-red-100 dark:border-red-900/30'}`} />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Nome Completo</label>
                      <input value={civilForm.nome_completo} onChange={e => setCivilForm({ ...civilForm, nome_completo: e.target.value })} required className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Contato</label>
                      <input value={civilForm.contato} onChange={e => setCivilForm({ ...civilForm, contato: e.target.value })} required placeholder="(00) 00000-0000" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm outline-none" />
                      {civilForm.contato && !validateTelefone(civilForm.contato) && (
                        <p className="text-red-500 text-xs mt-1 ml-4">Telefone inválido</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Órgão</label>
                      <select value={civilForm.id_orgao_origem} onChange={e => {
                        const selectedOrgao = orgaosOrigem.find(o => o.id_orgao_origem === parseInt(e.target.value));
                        setCivilForm({
                          ...civilForm,
                          id_orgao_origem: parseInt(e.target.value),
                          nome_orgao: selectedOrgao?.nome_orgao || ''
                        });
                      }} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm outline-none">
                        <option value="0">Selecione...</option>
                        {orgaosOrigem.map(o => (
                          <option key={o.id_orgao_origem} value={o.id_orgao_origem}>{o.nome_orgao}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Vtr (Modelo)</label>
                        <input value={civilForm.modelo_veiculo} onChange={e => setCivilForm({ ...civilForm, modelo_veiculo: e.target.value })} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Placa</label>
                        <input value={civilForm.placa_veiculo} onChange={e => setCivilForm({ ...civilForm, placa_veiculo: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7) })} placeholder="ABC1234" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm outline-none" />
                        {civilForm.placa_veiculo && !validatePlaca(civilForm.placa_veiculo) && (
                          <p className="text-red-500 text-xs mt-1 ml-4">Placa inválida (ex: ABC1234)</p>
                        )}
                      </div>
                    </div>
                    <div className="p-4 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={civilForm.motorista} onChange={e => setCivilForm({ ...civilForm, motorista: e.target.checked })} className="w-4 h-4 rounded-lg accent-emerald-600" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Motorista Autorizado</span>
                      </label>
                    </div>
                  </>
                )}
                <button type="submit" className="w-full text-white py-4 rounded-[1.5rem] flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all font-black text-xs uppercase tracking-[0.2em] shadow-lg" style={{ backgroundColor: themeColors.primary, boxShadow: `0 10px 15px -3px ${themeColors.primary}20` }}>{editingId ? <Edit2 size={18} /> : <Plus size={18} />} {editingId ? 'Atualizar' : 'Salvar'} Cadastro</button>
              </form>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 group">
            <Search className="text-slate-400 transition-colors ml-4" size={20} style={{ color: themeColors.primary }} />
            <input placeholder="Filtre por nome, matrícula ou unidade..." className="bg-transparent border-none focus:ring-0 w-full outline-none text-sm font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-visible">
            {loading ? (
              <div className="py-20 text-center text-slate-400 font-medium">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: themeColors.primary }}></div>
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
                              <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white cursor-help">
                                <span>{m.nome_posto_grad} {m.nome_guerra}</span>
                                <Info size={12} className="text-slate-300 group-hover:text-blue-500 ml-1" title={`Força: ${m.nome_forca || 'N/A'} • UBM: ${m.nome_ubm || 'Sem UBM'}`} />
                              </div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{m.matricula} • {m.nome_forca || 'N/A'} • {m.nome_ubm || 'Sem UBM'}</div>
                              <MilitarCard militar={m} atestados={atestados} themeColors={themeColors} />
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
                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditMilitar(m); }} className="p-2 text-slate-300 rounded-xl transition-all" style={{ color: themeColors.primary }}><Edit2 size={18} /></button>
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
                            <div className="font-black text-slate-900 dark:text-white">
                              <div>{c.nome_completo}</div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{c.contato} • {c.nome_orgao || 'N/A'}</div>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <div className="flex flex-wrap justify-center gap-2">
                              {c.motorista && <UserCheck size={16} className="text-emerald-500" />}
                              {c.modelo_veiculo && <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter" style={{ backgroundColor: `${themeColors.primary}10`, color: themeColors.primary }}>{c.modelo_veiculo}</span>}
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditCivil(c); }} className="p-2 text-slate-300 rounded-xl transition-all" style={{ color: themeColors.primary }}><Edit2 size={18} /></button>
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
                              <div className="font-black text-slate-900 dark:text-white uppercase leading-tight">
                                {(() => {
                                  const posto = postos.find(p => p.id_posto_grad === m.id_posto_grad);
                                  return posto?.nome_posto_grad || '';
                                })()} {m?.nome_guerra}
                              </div>
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
