
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Shield, UserCircle, Download, UserPlus, Trash2, Check, X, FileText, ListChecks, Eraser, Ship, Waves, ShieldAlert, CheckCircle2, Info } from 'lucide-react';
import { loadData, saveData } from '../store';
import { ChamadaMilitar, ChamadaCivil, FuncaoMilitar, StatusEquipe, CadastroMilitar, AtestadoMedico } from '../types';
import { ToastType } from '../components/Toast';

interface TurnoDetalheProps {
  idTurno: string;
  onBack: () => void;
  onNotify?: (msg: string, type: ToastType) => void;
}

const parseLocalDate = (dateStr: string) => {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const isMilitarRestricted = (militar: CadastroMilitar, atestados: AtestadoMedico[]) => {
    if (militar.restricaoMedica) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return atestados.some(at => {
      if (at.matricula !== militar.matricula) return false;
      const inicio = parseLocalDate(at.dataInicio);
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
        const inicio = parseLocalDate(at.dataInicio);
        inicio.setHours(0, 0, 0, 0);
        const fim = new Date(inicio);
        fim.setDate(inicio.getDate() + (at.dias - 1));
        fim.setHours(23, 59, 59, 999);
        return today >= inicio && today <= fim;
    });
};

const TurnoDetalhe: React.FC<TurnoDetalheProps> = ({ idTurno, onBack, onNotify }) => {
  const [data, setData] = useState(loadData());
  const [activeSubTab, setActiveSubTab] = useState<'militar' | 'civil'>('militar');
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingSelection, setPendingSelection] = useState<string[]>([]);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const turno = data.turnos.find(t => t.idTurno === idTurno);
  if (!turno) return <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-widest">Turno não encontrado.</div>;

  const dataFormatada = new Date(turno.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

  const addMilitar = () => {
    const newEntries: ChamadaMilitar[] = pendingSelection.map(mat => ({
        idChamadaMilitar: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
        idTurno,
        matricula: mat,
        funcao: FuncaoMilitar.COMBATENTE,
        presenca: true,
        obs: ''
      }));

    if (newEntries.length > 0) {
      setData(prev => ({ ...prev, chamadaMilitar: [...prev.chamadaMilitar, ...newEntries] }));
      onNotify?.(`${newEntries.length} militar(es) escalado(s).`, "success");
    }
    setPendingSelection([]);
  };

  const addCivil = () => {
    const newEntries: ChamadaCivil[] = pendingSelection.map(id => ({
        idChamadaCivil: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
        idTurno,
        idCivil: id,
        quantCivil: 1,
        status: StatusEquipe.LIVRE,
        lastStatusUpdate: Date.now(),
        bairro: ''
      }));

    if (newEntries.length > 0) {
      setData(prev => ({ ...prev, chamadaCivil: [...prev.chamadaCivil, ...newEntries] }));
      onNotify?.(`${newEntries.length} civil(is) adicionado(s).`, "success");
    }
    setPendingSelection([]);
  };

  const updateChamadaMil = (id: string, updates: Partial<ChamadaMilitar>) => {
    setData(prev => ({ ...prev, chamadaMilitar: prev.chamadaMilitar.map(m => m.idChamadaMilitar === id ? { ...m, ...updates } : m) }));
  };

  const updateChamadaCiv = (id: string, updates: Partial<ChamadaCivil>) => {
    setData(prev => ({ ...prev, chamadaCivil: prev.chamadaCivil.map(c => c.idChamadaCivil === id ? { ...c, ...updates } : c) }));
  };

  const removeChamadaMil = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Remover militar da escala deste turno?")) return;
    setData(prev => ({ ...prev, chamadaMilitar: prev.chamadaMilitar.filter(x => x.idChamadaMilitar !== id) }));
    onNotify?.("Militar removido da escala.", "warning");
  };

  const removeChamadaCiv = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Remover civil deste turno?")) return;
    setData(prev => ({ ...prev, chamadaCivil: prev.chamadaCivil.filter(x => x.idChamadaCivil !== id) }));
    onNotify?.("Civil removido da escala.", "warning");
  };

  const chamadaMil = data.chamadaMilitar.filter(cm => cm.idTurno === idTurno);
  const militaresDisponiveis = data.militares.filter(m => !chamadaMil.some(cm => cm.matricula === m.matricula));
  const filteredMilitares = militaresDisponiveis.filter(m => m.nomeGuerra.toLowerCase().includes(searchTerm.toLowerCase()) || m.matricula.includes(searchTerm));

  const chamadaCiv = data.chamadaCivil.filter(cc => cc.idTurno === idTurno);
  const civisDisponiveis = data.civis.filter(c => !chamadaCiv.some(cc => cc.idCivil === c.idCivil));
  const filteredCivis = civisDisponiveis.filter(c => c.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSelectAll = () => {
    const allAvailableIds = activeSubTab === 'militar' ? filteredMilitares.map(m => m.matricula) : filteredCivis.map(c => c.idCivil);
    setPendingSelection(allAvailableIds);
  };

  const exportCSV = () => {
    const headers = activeSubTab === 'militar' ? ["Posto/Grad", "Guerra", "Matricula", "Funcao", "Presenca"] : ["Nome", "Orgao", "Qtd Equipe"];
    const rows = activeSubTab === 'militar' ? chamadaMil.map(cm => {
          const m = data.militares.find(mil => mil.matricula === cm.matricula);
          return [m?.postoGrad, m?.nomeGuerra, cm.matricula, cm.funcao, cm.presenca ? 'SIM' : 'NÃO'];
        }) : chamadaCiv.map(cc => {
          const c = data.civis.find(civ => civ.idCivil === cc.idCivil);
          return [c?.nomeCompleto, c?.orgaoOrigem, cc.quantCivil];
        });
    const csvContent = [headers, ...rows].map(e => e.join(";")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `chamada_${activeSubTab}_${idTurno}.csv`;
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2"><UserPlus size={16} /> Escalar {activeSubTab === 'militar' ? 'Militar' : 'Civil'}</h3>
            <input placeholder="Pesquisar disponível..." className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none mb-4" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            <div className="flex gap-2 mb-4">
              <button onClick={handleSelectAll} className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-100 dark:bg-slate-800 text-[9px] font-black text-slate-500 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all uppercase tracking-widest"><ListChecks size={14} /> Tudo</button>
              <button onClick={() => setPendingSelection([])} className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-100 dark:bg-slate-800 text-[9px] font-black text-slate-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all uppercase tracking-widest"><Eraser size={14} /> Limpar</button>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {activeSubTab === 'militar' ? (
                filteredMilitares.map(m => <button key={m.matricula} onClick={() => setPendingSelection(prev => prev.includes(m.matricula) ? prev.filter(x => x !== m.matricula) : [...prev, m.matricula])} className={`w-full p-4 rounded-2xl border text-left transition-all ${pendingSelection.includes(m.matricula) ? 'bg-primary border-primary text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}><p className="font-black text-[11px] uppercase flex justify-between">{m.postoGrad} {m.nomeGuerra}{pendingSelection.includes(m.matricula) && <Check size={14} />}</p><p className={`text-[9px] font-bold ${pendingSelection.includes(m.matricula) ? 'text-blue-100' : 'text-slate-400'}`}>{m.matricula}</p></button>)
              ) : (
                filteredCivis.map(c => <button key={c.idCivil} onClick={() => setPendingSelection(prev => prev.includes(c.idCivil) ? prev.filter(id => id !== c.idCivil) : [...prev, c.idCivil])} className={`w-full p-4 rounded-2xl border text-left transition-all ${pendingSelection.includes(c.idCivil) ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}><p className="font-black text-[11px] uppercase flex justify-between">{c.nomeCompleto}{pendingSelection.includes(c.idCivil) && <Check size={14} />}</p><p className={`text-[9px] font-bold ${pendingSelection.includes(c.idCivil) ? 'text-emerald-100' : 'text-slate-400'}`}>{c.orgaoOrigem}</p></button>)
              )}
              {(activeSubTab === 'militar' ? filteredMilitares : filteredCivis).length === 0 && <p className="text-center py-10 text-[10px] text-slate-400 italic font-bold uppercase tracking-widest">Nenhum disponível.</p>}
            </div>
            <button disabled={pendingSelection.length === 0} onClick={activeSubTab === 'militar' ? addMilitar : addCivil} className="w-full mt-6 bg-slate-900 dark:bg-primary text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-30 shadow-xl transition-all active:scale-95">Confirmar ({pendingSelection.length})</button>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/20"><h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Escala do Turno</h3><button onClick={exportCSV} className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:text-primary transition-colors"><Download size={18} /></button></div>
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-slate-400">Identificação</th>
                  {activeSubTab === 'militar' ? (
                    <><th className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-slate-400 text-center">Perfil</th><th className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-slate-400 text-center">Função</th><th className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-slate-400 text-center">Status</th></>
                  ) : <th className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-slate-400 text-center">Qtd. Efetivo</th>}
                  <th className="px-8 py-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeSubTab === 'militar' ? (
                  chamadaMil.map(cm => {
                    const m = data.militares.find(mil => mil.matricula === cm.matricula);
                    const restricted = m ? isMilitarRestricted(m, data.atestados) : false;
                    const activeAt = m ? getMilitarActiveAtestado(m.matricula, data.atestados) : null;
                    return (
                      <tr key={cm.idChamadaMilitar} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                        <td className="px-8 py-5"><p className="font-black text-slate-900 dark:text-white text-sm uppercase leading-tight">{m?.postoGrad} {m?.nomeGuerra}</p><p className="text-[10px] font-bold text-slate-400 mt-1">{cm.matricula}</p></td>
                        <td className="px-8 py-5"><div className="flex justify-center gap-2">{m?.cpoe && <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-lg" title="CPOE"><Ship size={14} /></div>}{m?.mergulhador && <div className="p-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 rounded-lg" title="CMAUT"><Waves size={14} /></div>}{restricted && <div className="p-1.5 bg-red-50 dark:bg-red-950/30 text-red-600 rounded-lg animate-pulse cursor-help" title={activeAt ? `ATESTADO: ${activeAt.motivo}` : `RESTRIÇÃO: ${m?.descRestMed || 'Não informada'}`}><ShieldAlert size={14} /></div>}</div></td>
                        <td className="px-8 py-5 text-center"><select value={cm.funcao} onChange={e => updateChamadaMil(cm.idChamadaMilitar, { funcao: e.target.value as FuncaoMilitar })} className="bg-slate-100 dark:bg-slate-800 border-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 outline-none cursor-pointer"><option value={FuncaoMilitar.COMBATENTE}>Combatente</option><option value={FuncaoMilitar.SCI}>SCI</option></select></td>
                        <td className="px-8 py-5 text-center"><button onClick={() => updateChamadaMil(cm.idChamadaMilitar, { presenca: !cm.presenca })} className={`px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all shadow-sm ${cm.presenca ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40' : 'bg-red-100 text-red-700 dark:bg-red-900/40'}`}>{cm.presenca ? 'PRESENTE' : 'AUSENTE'}</button></td>
                        <td className="px-8 py-5 text-right"><button onClick={(e) => removeChamadaMil(e, cm.idChamadaMilitar)} className="p-2 text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button></td>
                      </tr>
                    );
                  })
                ) : (
                  chamadaCiv.map(cc => {
                    const c = data.civis.find(civ => civ.idCivil === cc.idCivil);
                    return (
                      <tr key={cc.idChamadaCivil} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                        <td className="px-8 py-5"><p className="font-black text-slate-900 dark:text-white text-sm uppercase">{c?.nomeCompleto}</p><p className="text-[10px] font-bold text-slate-400 mt-1">{c?.orgaoOrigem}</p></td>
                        <td className="px-8 py-5 text-center"><input type="number" min="1" value={cc.quantCivil} onChange={e => updateChamadaCiv(cc.idChamadaCivil, { quantCivil: parseInt(e.target.value) || 1 })} className="w-16 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center font-black text-blue-600 outline-none" /></td>
                        <td className="px-8 py-5 text-right"><button onClick={(e) => removeChamadaCiv(e, cc.idChamadaCivil)} className="p-2 text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button></td>
                      </tr>
                    );
                  })
                )}
                {(activeSubTab === 'militar' ? chamadaMil : chamadaCiv).length === 0 && <tr><td colSpan={6} className="py-24 text-center text-slate-300 dark:text-slate-600 italic font-medium">Nenhum registro para este turno. Adicione pessoal à esquerda.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurnoDetalhe;
