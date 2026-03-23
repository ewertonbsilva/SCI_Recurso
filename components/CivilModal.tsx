import React, { useState, useEffect } from 'react';
import { X, Plus, Car, UserCheck } from 'lucide-react';
import { CadastroCivil, OrgaoOrigem } from '../types';
import { apiService } from '../apiService';

interface CivilModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (civil: CadastroCivil) => void;
  editingCivil?: CadastroCivil | null;
}

const validateTelefone = (telefone: string): boolean => {
  const cleaned = telefone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 11;
};

const validatePlaca = (placa: string): boolean => {
  if (!placa) return true;
  const pattern = /^[A-Z]{3}[0-9]{4}$|^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
  return pattern.test(placa.replace(/[-\s]/g, '').toUpperCase());
};

const CivilModal: React.FC<CivilModalProps> = ({ isOpen, onClose, onSave, editingCivil }) => {
  const [civilForm, setCivilForm] = useState<Partial<CadastroCivil & { id_civil: string }>>({
    id_civil: '',
    nome_completo: '',
    contato: '',
    id_orgao_origem: 0,
    motorista: false,
    modelo_veiculo: '',
    placa_veiculo: ''
  });
  
  const [orgaosOrigem, setOrgaosOrigem] = useState<OrgaoOrigem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadOrgaosOrigem();
      if (editingCivil) {
        setCivilForm({
          id_civil: editingCivil.id_civil,
          nome_completo: editingCivil.nome_completo,
          contato: editingCivil.contato,
          id_orgao_origem: editingCivil.id_orgao_origem,
          motorista: editingCivil.motorista,
          modelo_veiculo: editingCivil.modelo_veiculo,
          placa_veiculo: editingCivil.placa_veiculo
        });
      } else {
        setCivilForm({
          id_civil: '',
          nome_completo: '',
          contato: '',
          id_orgao_origem: 0,
          motorista: false,
          modelo_veiculo: '',
          placa_veiculo: ''
        });
      }
    }
  }, [isOpen, editingCivil]);

  const loadOrgaosOrigem = async () => {
    try {
      const data = await apiService.getOrgaosOrigem();
      setOrgaosOrigem(data);
    } catch (error) {
      console.error('Erro ao carregar órgãos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!civilForm.nome_completo || !civilForm.contato || !civilForm.id_orgao_origem) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    if (!validateTelefone(civilForm.contato)) {
      alert('Telefone inválido. Use o formato (00) 00000-0000.');
      return;
    }

    if (civilForm.placa_veiculo && !validatePlaca(civilForm.placa_veiculo)) {
      alert('Placa inválida. Use o formato ABC1234 ou ABC1D23.');
      return;
    }

    setLoading(true);
    try {
      let civilToSave: CadastroCivil;
      
      if (editingCivil) {
        civilToSave = {
          ...editingCivil,
          ...civilForm
        } as CadastroCivil;
      } else {
        civilToSave = {
          ...civilForm,
          id_civil: `CIV_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        } as CadastroCivil;
      }

      await onSave(civilToSave);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar civil:', error);
      alert('Erro ao salvar civil.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {editingCivil ? 'Editar Civil' : 'Novo Civil'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X size={20} className="text-slate-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                value={civilForm.nome_completo}
                onChange={e => setCivilForm({ ...civilForm, nome_completo: e.target.value })}
                required
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Contato *
              </label>
              <input
                type="text"
                value={civilForm.contato}
                onChange={e => setCivilForm({ ...civilForm, contato: e.target.value })}
                required
                placeholder="(00) 00000-0000"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              {civilForm.contato && !validateTelefone(civilForm.contato) && (
                <p className="text-red-500 text-xs mt-1">Telefone inválido</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Órgão *
              </label>
              <select
                value={civilForm.id_orgao_origem}
                onChange={e => setCivilForm({ ...civilForm, id_orgao_origem: parseInt(e.target.value) })}
                required
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="0">Selecione...</option>
                {orgaosOrigem.map(o => (
                  <option key={o.id_orgao_origem} value={o.id_orgao_origem}>
                    {o.nome_orgao}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <Car size={16} className="inline mr-1" />
                  Modelo Vtr
                </label>
                <input
                  type="text"
                  value={civilForm.modelo_veiculo}
                  onChange={e => setCivilForm({ ...civilForm, modelo_veiculo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Placa
                </label>
                <input
                  type="text"
                  value={civilForm.placa_veiculo}
                  onChange={e => setCivilForm({ ...civilForm, placa_veiculo: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7) })}
                  placeholder="ABC1234"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {civilForm.placa_veiculo && !validatePlaca(civilForm.placa_veiculo) && (
                  <p className="text-red-500 text-xs mt-1">Placa inválida (ex: ABC1234)</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <input
                type="checkbox"
                id="motorista"
                checked={civilForm.motorista}
                onChange={e => setCivilForm({ ...civilForm, motorista: e.target.checked })}
                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
              />
              <label htmlFor="motorista" className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
                <UserCheck size={16} className="text-emerald-600" />
                Motorista Autorizado
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Plus size={16} />
                    {editingCivil ? 'Atualizar' : 'Cadastrar'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CivilModal;
