
import React, { useState, useRef, useEffect } from 'react';
import { UserPlus, Trash2, Calendar, Check, Users, ClipboardCheck, X, Download } from 'lucide-react';
import { loadData, saveData } from '../store';
import { ChamadaMilitar, FuncaoMilitar } from '../types';
import { ToastType } from '../components/Toast';

interface ChamadasProps {
  onNotify?: (msg: string, type: ToastType) => void;
}

const Chamadas: React.FC<ChamadasProps> = ({ onNotify }) => {
  const [data, setData] = useState(loadData());
  const [selectedTurnoId, setSelectedTurnoId] = useState('');
  const [militarSearchTerm, setMilitarSearchTerm] = useState('');
  const [pendingMilitares, setPendingMilitares] = useState<string[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    saveData(data);
  }, [data]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addSelectedMilitares = () => {
    if (!selectedTurnoId || pendingMilitares.length === 0) return;
    const currentTurnoMilitares = data.chamadaMilitar.filter(m => m.idTurno === selectedTurnoId).map(m => m.matricula.toLowerCase());
    const newEntries: ChamadaMilitar[] = [];
    
    pendingMilitares.forEach(matricula => {
      if (!currentTurnoMilitares.includes(matricula.toLowerCase())) {
        newEntries.push({
          idChamadaMilitar: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
          idTurno: selectedTurnoId,
          matricula,
          funcao: FuncaoMilitar.COMBATENTE,
          presenca: true,
          obs: ''
        });
      }
    });

    if (newEntries.length > 0) {
      setData(prev => ({ 
        ...prev, 
        chamadaMilitar: [...prev.chamadaMilitar, ...newEntries] 
      }));
      onNotify?.(`${newEntries.length} militar(es) escalado(s).`, "success");
    }
    setPendingMilitares([]);
    setMilitarSearchTerm('');
    setIsMenuOpen(false);
  };

  const updateMilitarChamada = (id: string, updates: Partial<ChamadaMilitar>) => {
    setData(prev => ({ 
      ...prev, 
      chamadaMilitar: prev.chamadaMilitar.map(m => m.idChamadaMilitar === id ? { ...m, ...updates } : m) 
    }));
  };

  const removeMilitarChamada = (id: string) => {
    setData(prev => ({ 
      ...prev, 
      chamadaMilitar: prev.chamadaMilitar.filter(m => m.idChamadaMilitar !== id) 
    }));
  };

  const sortedTurnos = [...data.turnos].sort((a, b) => b.data.localeCompare(a.data));

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardCheck className="text-blue-600" /> Chamada Militar
          </h2>
          <p className="text-xs text-slate-500">Registre a presença e a função dos militares.</p>
        </div>
        <select 
          value={selectedTurnoId} 
          onChange={(e) => setSelectedTurnoId(e.target.value)} 
          className="px-4 py-2 border dark:border-slate-800 rounded-xl outline-none font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-200"
        >
          <option value="">-- Selecione o Turno --</option>
          {sortedTurnos.map(t => (
            <option key={t.idTurno} value={t.idTurno}>{new Date(t.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} | {t.periodo}</option>
          ))}
        </select>
      </div>

      {selectedTurnoId ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20 rounded-t-2xl relative">
            <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wider flex items-center gap-2">
              <Users size={16} /> Lista de Presença
            </h3>
            
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="bg-slate-900 dark:bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors"
              >
                {isMenuOpen ? <X size={14} /> : <UserPlus size={14} />}
                ADICIONAR MILITAR
              </button>
              
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-xl z-[999] p-4 animate-in fade-in zoom-in duration-200">
                  <input 
                    placeholder="Pesquisar militar..." 
                    className="w-full mb-3 px-3 py-2 border dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-100 dark:bg-slate-800 dark:text-white" 
                    value={militarSearchTerm} 
                    onChange={e => setMilitarSearchTerm(e.target.value)} 
                  />
                  <div className="space-y-1 max-h-64 overflow-y-auto mb-4 border-b dark:border-slate-800 pb-2 custom-scrollbar">
                    {data.militares
                      .filter(m => !data.chamadaMilitar.some(cm => cm.idTurno === selectedTurnoId && cm.matricula === m.matricula))
                      .filter(m => m.nomeCompleto.toLowerCase().includes(militarSearchTerm.toLowerCase()) || m.nomeGuerra.toLowerCase().includes(militarSearchTerm.toLowerCase()))
                      .map(m => (
                        <button 
                          key={m.matricula} 
                          onClick={() => setPendingMilitares(prev => prev.includes(m.matricula) ? prev.filter(id => id !== m.matricula) : [...prev, m.matricula])} 
                          className={`w-full text-left p-2 rounded-lg text-[11px] flex items-center justify-between transition-colors ${pendingMilitares.includes(m.matricula) ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                          <div className="flex items-center gap-2">
                             <div className={`w-4 h-4 rounded border flex items-center justify-center ${pendingMilitares.includes(m.matricula) ? 'bg-slate-900 dark:bg-white dark:text-slate-900 border-slate-900 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                                {pendingMilitares.includes(m.matricula) && <Check size={10} />}
                             </div>
                             <div>
                               <span className="font-bold block text-slate-900 dark:text-white">{m.postoGrad} {m.nomeGuerra}</span>
                               <span className="text-[9px] text-slate-400">{m.matricula}</span>
                             </div>
                          </div>
                        </button>
                      ))}
                  </div>
                  <button 
                    onClick={addSelectedMilitares} 
                    disabled={pendingMilitares.length === 0}
                    className="w-full bg-slate-900 dark:bg-primary text-white py-2.5 rounded-lg text-xs font-bold disabled:opacity-50 transition-all active:scale-95"
                  >
                    Confirmar Seleção ({pendingMilitares.length})
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-4 text-left font-bold text-slate-500 uppercase text-[10px]">Militar</th>
                  <th className="p-4 text-center font-bold text-slate-500 uppercase text-[10px]">Função</th>
                  <th className="p-4 text-center font-bold text-slate-500 uppercase text-[10px]">Presença</th>
                  <th className="p-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.chamadaMilitar.filter(cm => cm.idTurno === selectedTurnoId).map(cm => {
                  const m = data.militares.find(mil => mil.matricula === cm.matricula);
                  return m ? (
                    <tr key={cm.idChamadaMilitar} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white">{m.postoGrad} {m.nomeGuerra}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{m.matricula}</div>
                      </td>
                      <td className="p-4 text-center">
                        <select 
                          value={cm.funcao}
                          onChange={e => updateMilitarChamada(cm.idChamadaMilitar, { funcao: e.target.value as FuncaoMilitar })}
                          className="px-3 py-1 bg-slate-100 dark:bg-slate-800 border-none rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-300 outline-none hover:bg-slate-200 cursor-pointer"
                        >
                          <option value={FuncaoMilitar.COMBATENTE}>Combatente</option>
                          <option value={FuncaoMilitar.SCI}>SCI</option>
                        </select>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => updateMilitarChamada(cm.idChamadaMilitar, { presenca: !cm.presenca })}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all shadow-sm ${cm.presenca ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40' : 'bg-red-100 text-red-700 dark:bg-red-900/40'}`}
                        >
                          {cm.presenca ? 'PRESENTE' : 'AUSENTE'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => removeMilitarChamada(cm.idChamadaMilitar)} className="text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 size={16}/>
                        </button>
                      </td>
                    </tr>
                  ) : null;
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="py-32 text-center text-slate-400 font-medium bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <Calendar size={48} className="mx-auto mb-4 opacity-10" />
          Selecione um turno para realizar a chamada militar.
        </div>
      )}
    </div>
  );
};

export default Chamadas;
