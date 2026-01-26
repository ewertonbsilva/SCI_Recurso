
import React, { useState, useRef, useEffect } from 'react';
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
  Type
} from 'lucide-react';
import { loadData, saveData } from '../store';
import { ChamadaCivil, StatusEquipe, FuncaoMilitar, Turno, Periodo, ALFABETO_FONETICO } from '../types';
import { ToastType } from '../components/Toast';

interface GestaoEquipesProps {
  onNotify?: (msg: string, type: ToastType) => void;
}

const GestaoEquipes: React.FC<GestaoEquipesProps> = ({ onNotify }) => {
  const [data, setData] = useState(loadData());
  const [selectedTurnoId, setSelectedTurnoId] = useState('');
  const [isVtrMenuOpen, setIsVtrMenuOpen] = useState(false);
  const [isMilitarModalOpen, setIsMilitarModalOpen] = useState<{ open: boolean, idEquipe: string | null }>({ open: false, idEquipe: null });
  const [militarSearch, setMilitarSearch] = useState('');
  const [vtrSearch, setVtrSearch] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsMilitarModalOpen({ open: false, idEquipe: null });
        setIsVtrMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const turno = data.turnos.find(t => t.idTurno === selectedTurnoId);
  const equipesNoTurno = data.chamadaCivil.filter(cc => cc.idTurno === selectedTurnoId);
  
  const militaresDisponiveis = data.chamadaMilitar
    .filter(cm => cm.idTurno === selectedTurnoId && cm.presenca && cm.funcao === FuncaoMilitar.COMBATENTE)
    .filter(cm => !data.chamadaCivil.some(cc => cc.idTurno === selectedTurnoId && cc.matriculaChefe === cm.matricula));

  const updateEquipe = (id: string, updates: Partial<ChamadaCivil>) => {
    if (updates.status) updates.lastStatusUpdate = Date.now();
    const newData = { ...data, chamadaCivil: data.chamadaCivil.map(cc => cc.idChamadaCivil === id ? { ...cc, ...updates } : cc) };
    setData(newData);
    saveData(newData);
  };

  const removeEquipe = (id: string) => {
    if (!confirm("Remover esta configuração de equipe?")) return;
    const newData = { ...data, chamadaCivil: data.chamadaCivil.filter(cc => cc.idChamadaCivil !== id) };
    setData(newData);
    saveData(newData);
  };

  const getNextPhoneticName = () => {
    const nomesEmUso = equipesNoTurno.map(e => e.nomeEquipe);
    const proximo = ALFABETO_FONETICO.find(nome => !nomesEmUso.includes(nome));
    return proximo || `Equipe ${equipesNoTurno.length + 1}`;
  };

  const handleAddVtr = (idCivil: string) => {
    const nextName = getNextPhoneticName();
    const newEntry: ChamadaCivil = {
      idChamadaCivil: crypto.randomUUID(),
      idTurno: selectedTurnoId,
      idCivil,
      nomeEquipe: nextName,
      quantCivil: 1,
      status: StatusEquipe.LIVRE,
      lastStatusUpdate: Date.now(),
      bairro: ''
    };
    const newData = { ...data, chamadaCivil: [...data.chamadaCivil, newEntry] };
    setData(newData);
    saveData(newData);
    setIsVtrMenuOpen(false);
    onNotify?.(`Equipe ${nextName} adicionada!`, "success");
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
          {data.turnos.sort((a,b) => b.data.localeCompare(a.data)).map((t) => {
            const count = data.chamadaCivil.filter(cc => cc.idTurno === t.idTurno).length;
            return (
              <button 
                key={t.idTurno}
                onClick={() => setSelectedTurnoId(t.idTurno)}
                className="group relative bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:scale-[1.03] transition-all text-left overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-primary opacity-20 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl ${t.periodo === Periodo.MANHA ? 'bg-orange-50 text-orange-500 dark:bg-orange-900/20' : 'bg-indigo-50 text-indigo-500 dark:bg-indigo-900/20'}`}>
                    <Clock size={24} />
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Equipes</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white text-center leading-none mt-1">{count}</p>
                  </div>
                </div>

                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-1">
                  {new Date(t.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                </p>
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{t.periodo}</p>

                <div className="mt-8 flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                  Configurar Dispositivo <ChevronRight size={14} />
                </div>
              </button>
            );
          })}
          
          {data.turnos.length === 0 && (
            <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
              <Calendar className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-slate-400 font-black uppercase tracking-widest">Nenhum turno cadastrado.</p>
              <p className="text-slate-300 text-xs mt-1 italic">Crie um turno na aba "Gestão de Turnos" primeiro.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 page-transition">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setSelectedTurnoId('')}
            className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-primary transition-all"
            title="Mudar Turno"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-3xl font-black tracking-tighter uppercase text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-3 bg-primary rounded-2xl text-white shadow-lg shadow-blue-500/20">
                <Truck size={24} />
              </div>
              Dispositivo <span className="text-primary">{turno?.periodo}</span>
            </h2>
            <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-2 ml-14">
              {new Date(turno!.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} • Operação Ativa
            </p>
          </div>
        </div>

        <div className="relative w-full lg:w-auto">
          <button 
            onClick={() => setIsVtrMenuOpen(!isVtrMenuOpen)}
            className="w-full bg-slate-900 dark:bg-primary text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.15em] hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Adicionar VTR
          </button>

          {isVtrMenuOpen && (
            <div ref={modalRef} className="absolute right-0 mt-4 w-80 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl rounded-[2rem] z-[100] p-4 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl mb-3">
                <Search size={14} className="text-slate-400" />
                <input 
                  placeholder="Filtrar veículos..." 
                  className="bg-transparent border-none text-[11px] font-bold outline-none w-full dark:text-white"
                  value={vtrSearch}
                  onChange={e => setVtrSearch(e.target.value)}
                />
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar">
                {data.civis
                  .filter(c => c.motorista && !equipesNoTurno.some(cc => cc.idCivil === c.idCivil))
                  .filter(c => c.modeloVeiculo.toLowerCase().includes(vtrSearch.toLowerCase()) || c.placaVeiculo.toLowerCase().includes(vtrSearch.toLowerCase()))
                  .map(c => (
                    <button 
                      key={c.idCivil}
                      onClick={() => handleAddVtr(c.idCivil)}
                      className="w-full p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-all group"
                    >
                      <p className="font-black text-xs text-slate-800 dark:text-white uppercase truncate">{c.modeloVeiculo || 'Sem Modelo'}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{c.placaVeiculo} • {c.nomeCompleto}</p>
                    </button>
                  ))}
                {data.civis.filter(c => c.motorista && !equipesNoTurno.some(cc => cc.idCivil === c.idCivil)).length === 0 && (
                  <p className="text-center py-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">Nenhuma VTR disponível</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {equipesNoTurno.map(cc => {
          const civil = data.civis.find(c => c.idCivil === cc.idCivil);
          const chefe = data.militares.find(m => m.matricula === cc.matriculaChefe);
          
          const statusColors = {
            [StatusEquipe.LIVRE]: 'bg-emerald-500',
            [StatusEquipe.EMPENHADA]: 'bg-amber-500',
            [StatusEquipe.PAUSA]: 'bg-slate-500',
          };

          return (
            <div key={cc.idChamadaCivil} className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all flex flex-col overflow-hidden relative">
              <div className={`absolute top-0 left-0 w-2 h-full ${statusColors[cc.status]}`}></div>
              
              <div className="p-6 pb-0 flex justify-between items-start ml-2">
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 group-hover:text-primary transition-colors shrink-0">
                    <Type size={20} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <input 
                      value={cc.nomeEquipe || ''}
                      onChange={e => updateEquipe(cc.idChamadaCivil, { nomeEquipe: e.target.value })}
                      placeholder="Nome da Equipe"
                      className="w-full bg-transparent border-none p-0 font-black text-lg text-slate-900 dark:text-white uppercase tracking-tighter leading-none outline-none focus:ring-0 placeholder:text-slate-300"
                    />
                    <p className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-widest truncate">
                      {civil?.modeloVeiculo} • {civil?.placaVeiculo}
                    </p>
                  </div>
                </div>
                <button onClick={() => removeEquipe(cc.idChamadaCivil)} className="p-2 text-slate-200 hover:text-red-500 transition-colors shrink-0">
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5 ml-2 flex-1">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Chefe de Equipe</label>
                  {chefe ? (
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl group/slot">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white text-xs font-black shadow-lg">
                          {chefe.nomeGuerra.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-xs text-slate-900 dark:text-white uppercase">{chefe.postoGrad} {chefe.nomeGuerra}</p>
                          <p className="text-[9px] text-primary font-bold">{chefe.matricula}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => updateEquipe(cc.idChamadaCivil, { matriculaChefe: undefined })}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover/slot:opacity-100"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsMilitarModalOpen({ open: true, idEquipe: cc.idChamadaCivil })}
                      className="w-full p-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:text-primary hover:border-primary/30 transition-all font-bold text-xs uppercase tracking-widest"
                    >
                      <UserPlus size={16} /> Atribuir Chefe
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <User size={10} /> Motorista
                    </p>
                    <p className="font-bold text-[10px] text-slate-700 dark:text-slate-300 truncate">{civil?.nomeCompleto || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <MapPin size={10} /> Setor
                    </p>
                    <input 
                      value={cc.bairro || ''}
                      onChange={e => updateEquipe(cc.idChamadaCivil, { bairro: e.target.value })}
                      placeholder="Não definido"
                      className="bg-transparent border-none p-0 w-full font-black text-[10px] text-primary outline-none placeholder:text-slate-300"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 ml-2">
                <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl">
                  {[
                    { id: StatusEquipe.LIVRE, icon: <Check size={16} />, color: 'bg-emerald-500', hover: 'hover:text-emerald-500', label: 'Livre' },
                    { id: StatusEquipe.EMPENHADA, icon: <Activity size={16} />, color: 'bg-amber-500', hover: 'hover:text-amber-500', label: 'Empenhada' },
                    { id: StatusEquipe.PAUSA, icon: <Clock size={16} />, color: 'bg-slate-500', hover: 'hover:text-slate-500', label: 'Pausa' }
                  ].map(st => (
                    <button 
                      key={st.id}
                      onClick={() => updateEquipe(cc.idChamadaCivil, { status: st.id })}
                      className={`
                        flex-1 flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl transition-all
                        ${cc.status === st.id 
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

        {equipesNoTurno.length === 0 && (
          <div className="col-span-full py-32 text-center text-slate-400 font-black uppercase tracking-widest border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem]">
            Nenhuma equipe configurada para este turno.
          </div>
        )}
      </div>

      {isMilitarModalOpen.open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div ref={modalRef} className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col max-h-[80vh] overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Escolher <span className="text-primary">Chefe</span></h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Combatentes Presentes no Turno</p>
              </div>
              <button onClick={() => setIsMilitarModalOpen({ open: false, idEquipe: null })} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-red-500 transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <Search size={18} className="text-slate-400" />
                <input 
                  placeholder="Pesquisar disponível..." 
                  className="bg-transparent border-none text-sm font-bold outline-none w-full dark:text-white"
                  value={militarSearch}
                  onChange={e => setMilitarSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="p-8 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4 custom-scrollbar">
              {militaresDisponiveis
                .filter(cm => {
                   const m = data.militares.find(mil => mil.matricula === cm.matricula);
                   return m?.nomeGuerra.toLowerCase().includes(militarSearch.toLowerCase()) || cm.matricula.includes(militarSearch);
                })
                .map(cm => {
                  const m = data.militares.find(mil => mil.matricula === cm.matricula);
                  return m ? (
                    <button 
                      key={m.matricula}
                      onClick={() => {
                        if (isMilitarModalOpen.idEquipe) {
                          updateEquipe(isMilitarModalOpen.idEquipe, { matriculaChefe: m.matricula });
                        }
                        setIsMilitarModalOpen({ open: false, idEquipe: null });
                      }}
                      className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 hover:border-primary hover:shadow-lg transition-all text-left group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-primary font-black text-sm border border-slate-100 dark:border-slate-800 shadow-sm group-hover:scale-110 transition-transform">
                        {m.nomeGuerra.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-xs text-slate-900 dark:text-white uppercase leading-tight">{m.postoGrad} {m.nomeGuerra}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1">{m.matricula}</p>
                      </div>
                      <ChevronRight className="ml-auto text-slate-200 group-hover:text-primary transition-colors" size={16} />
                    </button>
                  ) : null;
                })
              }
              {militaresDisponiveis.length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-400 font-black uppercase tracking-widest text-xs">
                  Nenhum combatente disponível
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
