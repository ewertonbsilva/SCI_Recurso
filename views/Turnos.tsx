
import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Trash2, ChevronRight, Clock } from 'lucide-react';
import { apiService } from '../apiService';
import { Turno, Periodo } from '../types';
import { ToastType } from '../components/Toast';

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

interface TurnosProps {
  onNotify?: (msg: string, type: ToastType) => void;
  onSelectTurno: (id: string) => void;
}

const Turnos: React.FC<TurnosProps> = ({ onNotify, onSelectTurno }) => {
  const [apiTurnos, setApiTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);
  const [themeColors, setThemeColors] = useState(getThemeColors());

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
    loadTurnosFromAPI();
  }, []);

  const loadTurnosFromAPI = async () => {
    try {
      setLoading(true);
      const turnos = await apiService.getTurnos();
      setApiTurnos(turnos);
      console.log('Turnos carregados da API:', turnos);
    } catch (error) {
      console.error('Erro ao carregar turnos da API:', error);
      onNotify?.('Erro ao carregar turnos do banco de dados', 'error');
    } finally {
      setLoading(false);
    }
  };


  const handleAddTurno = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dateStr = formData.get('data') as string;
    const period = formData.get('periodo') as Periodo;

    if (!dateStr || !period) return;

    // Verificar se já existe na API
    if (apiTurnos.find(t => t.data === dateStr && t.periodo === period)) {
      const df = new Date(dateStr).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
      onNotify?.(`ERRO: Já existe um turno para o dia ${df} na ${period}.`, 'error');
      return;
    }

    try {
      await apiService.createTurno(dateStr, period);
      onNotify?.("Turno criado com sucesso no banco de dados!", "success");
      if (e.currentTarget) {
        e.currentTarget.reset();
      }
      await loadTurnosFromAPI(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao criar turno:', error);
      onNotify?.('Erro ao criar turno no banco de dados', 'error');
    }
  };

  const removeTurno = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await apiService.deleteTurno(id);
      onNotify?.("Turno removido com sucesso do banco de dados.", "warning");
      await loadTurnosFromAPI(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao remover turno:', error);
      onNotify?.('Erro ao remover turno do banco de dados', 'error');
    }
  };

  // Função para garantir que os dados não venham aninhados (evitar [[...]])
  const flattenData = (items: any[]): any[] => {
    if (!items || !Array.isArray(items)) return [];
    // Se o primeiro item for um array, assume que os dados estão no primeiro elemento (rows)
    if (items.length > 0 && Array.isArray(items[0])) {
      return items[0];
    }
    return items;
  };

  const sortedTurnos = flattenData([...apiTurnos]).sort((a, b) => {
    const dateA = a?.data || '';
    const dateB = b?.data || '';
    return dateB.localeCompare(dateA);
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">Gestão de <span style={{ color: themeColors.primary }}>Turnos</span></h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Crie e gerencie os períodos operacionais.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm sticky top-8">
            <h3 className="text-xl font-black mb-8 uppercase tracking-tighter flex items-center gap-2">
              <Calendar style={{ color: themeColors.primary }} size={24} /> Novo Período
            </h3>
            <form onSubmit={handleAddTurno} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Data do Plantão</label>
                <input type="date" name="data" required className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Período</label>
                <select name="periodo" required className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm font-bold outline-none cursor-pointer">
                  <option value={Periodo.MANHA}>Manhã</option>
                  <option value={Periodo.TARDE}>Tarde</option>
                  <option value={Periodo.NOITE}>Noite</option>
                </select>
              </div>
              <button type="submit" className="w-full text-white py-4 rounded-[1.5rem] flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all font-black text-xs uppercase tracking-[0.2em] shadow-lg" style={{ backgroundColor: themeColors.primary, boxShadow: `0 10px 15px -3px ${themeColors.primary}20` }}><Plus size={18} /> Iniciar Turno</button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4 mb-2">Turnos Recentes</h3>
            {loading && <span className="text-xs" style={{ color: themeColors.primary }}>Carregando...</span>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedTurnos.map((t) => (
              <div
                key={t.id_turno}
                onClick={() => {
                  if (t.id_turno) {
                    onSelectTurno(t.id_turno);
                  } else {
                    console.error('Tentativa de navegar para turno sem ID:', t);
                    onNotify?.("Erro: Turno sem identificador válido.", "error");
                  }
                }}
                className="group bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all border-l-8" style={{ borderLeftColor: themeColors.primary }}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.periodo === Periodo.MANHA ? 'bg-orange-50 text-orange-500 dark:bg-orange-900/20' : 'bg-indigo-50 text-indigo-500 dark:bg-indigo-900/20'}`}><Clock size={20} /></div>
                  <div>
                    <p className="font-black text-slate-900 dark:text-white text-base tracking-tighter"> {t.data ? new Date(t.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'Data inválida'}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.periodo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={(e) => removeTurno(e, t.id_turno)} className="p-2 text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                  <ChevronRight size={20} className="text-slate-300 group-hover:translate-x-1 transition-all" style={{ color: themeColors.primary }} />
                </div>
              </div>
            ))}
            {!loading && sortedTurnos.length === 0 && <div className="col-span-full py-20 text-center text-slate-400 italic bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">Nenhum turno encontrado no banco de dados. Comece criando um novo período.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Turnos;
