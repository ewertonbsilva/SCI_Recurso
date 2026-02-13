
import React, { useState, useRef, useEffect } from 'react';
import { UserPlus, Trash2, Calendar, Check, Users, UserCircle, X, Download } from 'lucide-react';
import { apiService } from '../apiService';
import { ChamadaCivil, StatusEquipe } from '../types';
import { ToastType } from '../components/Toast';

interface ChamadaCivilProps {
  onNotify?: (msg: string, type: ToastType) => void;
}

const ChamadaCivilView: React.FC<ChamadaCivilProps> = ({ onNotify }) => {
  const [turnos, setTurnos] = useState<any[]>([]);
  const [civis, setCivis] = useState<any[]>([]);
  const [chamadaCivil, setChamadaCivil] = useState<ChamadaCivil[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTurnoId, setSelectedTurnoId] = useState('');
  const [civilSearchTerm, setCivilSearchTerm] = useState('');
  const [pendingCivis, setPendingCivis] = useState<string[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedTurnoId) {
      loadChamadaCivil(selectedTurnoId);
    } else {
      setChamadaCivil([]);
    }
  }, [selectedTurnoId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [turnosData, civisData] = await Promise.all([
        apiService.getTurnos(),
        apiService.getCivis()
      ]);
      setTurnos(turnosData);
      setCivis(civisData);
    } catch (error) {
      onNotify?.("Erro ao carregar dados iniciais.", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadChamadaCivil = async (idTurno: string) => {
    try {
      const data = await apiService.getChamadaCivil(idTurno);
      setChamadaCivil(data);
    } catch (error) {
      onNotify?.("Erro ao carregar chamada civil.", "error");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addSelectedCivis = async () => {
    if (!selectedTurnoId || pendingCivis.length === 0) return;

    try {
      const currentIds = chamadaCivil.map(c => c.id_civil);
      const newEntries = pendingCivis
        .filter(id => !currentIds.includes(id))
        .map(id_civil => ({
          id_chamada_civil: crypto.randomUUID(),
          id_turno: selectedTurnoId,
          id_civil,
          quant_civil: 1,
          status: StatusEquipe.LIVRE,
          last_status_update: Date.now(),
          bairro: ''
        }));

      if (newEntries.length > 0) {
        // Sequentially or via Promise.all? API only supports single POST usually.
        // Let's assume we need to call multiple times or fix API.
        // In server.ts, POST /api/chamada-civil only takes one object.
        await Promise.all(newEntries.map(entry => apiService.createChamadaCivil(entry)));
        loadChamadaCivil(selectedTurnoId);
        onNotify?.(`${newEntries.length} civil(is) adicionado(s) ao turno.`, "success");
      }

      setPendingCivis([]);
      setCivilSearchTerm('');
      setIsMenuOpen(false);
    } catch (error) {
      onNotify?.("Erro ao adicionar civis ao turno.", "error");
    }
  };

  const updateCivilChamada = async (id: string, updates: Partial<ChamadaCivil>) => {
    try {
      await apiService.updateChamadaCivil(id, updates);
      setChamadaCivil(prev => prev.map(c => c.id_chamada_civil === id ? { ...c, ...updates } : c));
    } catch (error) {
      onNotify?.("Erro ao atualizar registro.", "error");
    }
  };

  const removeCivilChamada = async (id: string) => {
    if (!confirm("Remover este civil da escala?")) return;
    try {
      await apiService.deleteChamadaCivil(id);
      setChamadaCivil(prev => prev.filter(c => c.id_chamada_civil !== id));
      onNotify?.("Registro removido.", "warning");
    } catch (error) {
      onNotify?.("Erro ao remover registro.", "error");
    }
  };

  const sortedTurnos = [...turnos].sort((a, b) => b.data.localeCompare(a.data));

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCircle className="text-emerald-600" /> Chamada Civil
          </h2>
          <p className="text-xs text-slate-500">Registre os civis presentes no turno.</p>
        </div>
        <select
          value={selectedTurnoId}
          onChange={(e) => setSelectedTurnoId(e.target.value)}
          className="px-4 py-2 border dark:border-slate-800 rounded-xl outline-none font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-200"
        >
          <option value="">-- Selecione o Turno --</option>
          {sortedTurnos.map(t => (
            <option key={t.id_turno} value={t.id_turno}>{new Date(t.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} | {t.periodo}</option>
          ))}
        </select>
      </div>

      {selectedTurnoId ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20 rounded-t-2xl relative">
            <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wider flex items-center gap-2">
              <Users size={16} /> Civis no Turno
            </h3>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-sm"
              >
                {isMenuOpen ? <X size={14} /> : <UserPlus size={14} />}
                ADICIONAR CIVIL
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-xl z-[999] p-4 animate-in fade-in zoom-in duration-200">
                  <input
                    placeholder="Pesquisar civil..."
                    className="w-full mb-3 px-3 py-2 border dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-100 dark:bg-slate-800 dark:text-white"
                    value={civilSearchTerm}
                    onChange={e => setCivilSearchTerm(e.target.value)}
                  />
                  <div className="space-y-1 max-h-64 overflow-y-auto mb-4 border-b dark:border-slate-800 pb-2 custom-scrollbar">
                    {civis
                      .filter(c => !chamadaCivil.some(cc => cc.id_civil === c.id_civil))
                      .filter(c => c.nome_completo.toLowerCase().includes(civilSearchTerm.toLowerCase()) || (c.nome_orgao || c.orgao_origem || '').toLowerCase().includes(civilSearchTerm.toLowerCase()))
                      .map(c => (
                        <button
                          key={c.id_civil}
                          onClick={() => setPendingCivis(prev => prev.includes(c.id_civil) ? prev.filter(id => id !== c.id_civil) : [...prev, c.id_civil])}
                          className={`w-full text-left p-2.5 rounded-lg text-[11px] flex items-center justify-between transition-colors ${pendingCivis.includes(c.id_civil) ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${pendingCivis.includes(c.id_civil) ? 'bg-emerald-600 dark:bg-emerald-500 border-emerald-600 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                              {pendingCivis.includes(c.id_civil) && <Check size={10} />}
                            </div>
                            <div>
                              <span className="font-bold block text-slate-900 dark:text-white">{c.nome_completo}</span>
                              <span className="text-[9px] text-slate-400">{c.orgao_origem}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>
                  <button
                    onClick={addSelectedCivis}
                    disabled={pendingCivis.length === 0}
                    className="w-full bg-emerald-600 text-white py-2.5 rounded-lg text-xs font-bold disabled:opacity-50 transition-all active:scale-95 shadow-sm"
                  >
                    Confirmar Seleção ({pendingCivis.length})
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-4 text-left font-bold text-slate-500 uppercase text-[10px]">Nome Completo</th>
                  <th className="p-4 text-left font-bold text-slate-500 uppercase text-[10px]">Órgão</th>
                  <th className="p-4 text-center font-bold text-slate-500 uppercase text-[10px]">Qtd. Efetivo</th>
                  <th className="p-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {chamadaCivil.map(cc => {
                  const c = civis.find(civ => civ.id_civil === cc.id_civil);
                  return c ? (
                    <tr key={cc.id_chamada_civil} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{c.nome_completo}</td>
                      <td className="p-4 text-slate-500 dark:text-slate-400">{c.nome_orgao || c.orgao_origem || 'N/A'}</td>
                      <td className="p-4 text-center">
                        <input
                          type="number"
                          min="1"
                          value={cc.quant_civil}
                          onChange={e => updateCivilChamada(cc.id_chamada_civil, { quant_civil: parseInt(e.target.value) || 1 })}
                          className="w-16 px-2 py-1 border dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded text-center font-bold text-blue-600 outline-none focus:ring-2 focus:ring-blue-100"
                        />
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => removeCivilChamada(cc.id_chamada_civil)} className="text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
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
          Selecione um turno para realizar a chamada civil.
        </div>
      )}
    </div>
  );
};

export default ChamadaCivilView;
