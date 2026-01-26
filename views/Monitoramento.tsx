
import React, { useState, useEffect } from 'react';
import { Clock, User, Phone, MapPin, Users, ChevronDown, ChevronUp, ShieldCheck, ExternalLink } from 'lucide-react';
import { loadData } from '../store';
import { StatusEquipe } from '../types';

interface EquipeCardProps {
  equipe: {
    id: string;
    nome: string;
    chefe: string;
    motorista: string;
    tel_mot: string;
    bairro: string;
    pessoas: number;
    status: StatusEquipe;
    inicio: number;
    detalhes: string;
  };
}

const EquipeCard: React.FC<EquipeCardProps> = ({ equipe }) => {
  const [timer, setTimer] = useState('00:00:00');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (equipe.status === StatusEquipe.EMPENHADA) {
       setTimer('EMPENHADA');
       return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.floor((now - equipe.inicio) / 1000);
      const h = Math.floor(diff / 3600).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
      const s = (diff % 60).toString().padStart(2, '0');
      setTimer(`${h}:${m}:${s}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [equipe.inicio, equipe.status]);

  const borderColors = {
    [StatusEquipe.LIVRE]: 'border-l-emerald-500',
    [StatusEquipe.EMPENHADA]: 'border-l-amber-500',
    [StatusEquipe.PAUSA]: 'border-l-slate-500',
  };

  const openMap = () => {
    if (equipe.bairro) {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(equipe.bairro)}`, '_blank');
    }
  };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 border-l-8 ${borderColors[equipe.status]} p-6 transition-all hover:shadow-xl relative overflow-hidden group`}>
      {equipe.status !== StatusEquipe.EMPENHADA && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 text-red-600 dark:text-red-400 font-mono font-bold text-xs bg-red-50 dark:bg-red-950/30 px-3 py-1.5 rounded-xl border border-red-100 dark:border-red-900/30 animate-pulse">
          <Clock size={12} />
          {timer}
        </div>
      )}

      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-black text-blue-600 dark:text-blue-400 uppercase truncate pr-20 tracking-tighter">{equipe.nome}</h3>
      </div>
      
      <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-blue-500 shrink-0" />
          <p className="truncate"><strong>Chefe:</strong> {equipe.chefe || <span className="text-red-400 italic">Não vinculado</span>}</p>
        </div>
        <div className="flex items-center gap-2">
          <User size={16} className="text-slate-400 shrink-0" />
          <p className="truncate"><strong>Mot.:</strong> {equipe.motorista}</p>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={16} className="text-slate-400 shrink-0" />
          <p className="truncate"><strong>Contato:</strong> {equipe.tel_mot}</p>
        </div>
        <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <div className="flex items-center gap-2 overflow-hidden">
            <MapPin size={16} className="text-red-500 shrink-0" />
            <p className="truncate text-xs font-bold uppercase">{equipe.bairro || 'BASE'}</p>
          </div>
          {equipe.bairro && (
            <button onClick={openMap} className="p-1 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors" title="Ver no Mapa">
              <ExternalLink size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Users size={16} className="text-slate-400 shrink-0" />
          <p><strong>Efetivo:</strong> {equipe.pessoas} pessoas</p>
        </div>
      </div>

      <button 
        onClick={() => setExpanded(!expanded)}
        className="mt-6 w-full text-slate-400 dark:text-slate-500 font-bold text-[9px] tracking-widest flex items-center justify-center gap-1 hover:text-blue-500 transition-colors uppercase"
      >
        {expanded ? <><ChevronUp size={14} /> Detalhes</> : <><ChevronDown size={14} /> Detalhes</>}
      </button>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 italic animate-in fade-in slide-in-from-top-2 duration-300">
          {equipe.detalhes}
        </div>
      )}
    </div>
  );
};

const Monitoramento: React.FC = () => {
  const [data, setData] = useState(loadData());
  
  const currentTurno = [...data.turnos].sort((a,b) => b.data.localeCompare(a.data))[0];
  
  const mappedEquipes = data.chamadaCivil
    .filter(cc => cc.idTurno === currentTurno?.idTurno)
    .map(cc => {
      const civil = data.civis.find(c => c.idCivil === cc.idCivil);
      const chefeInfo = data.militares.find(m => m.matricula === cc.matriculaChefe);

      return {
        id: cc.idChamadaCivil,
        nome: cc.nomeEquipe || civil?.modeloVeiculo || 'EQUIPE S/ VTR',
        chefe: chefeInfo ? `${chefeInfo.postoGrad} ${chefeInfo.nomeGuerra}` : '',
        motorista: civil?.nomeCompleto || 'N/A',
        tel_mot: civil?.contato || 'N/A',
        bairro: cc.bairro || '',
        pessoas: (cc.quantCivil || 1) + (cc.matriculaChefe ? 1 : 0),
        status: cc.status,
        inicio: cc.lastStatusUpdate,
        detalhes: `Orgão: ${civil?.orgaoOrigem} | Placa: ${civil?.placaVeiculo} | Chefe Matr.: ${cc.matriculaChefe || 'Nenhum'}`
      };
    });

  const categorias = [
    { id: StatusEquipe.LIVRE, label: '🟢 LIVRE', color: 'bg-emerald-500' },
    { id: StatusEquipe.EMPENHADA, label: '🟡 EMPENHADA', color: 'bg-amber-500' },
    { id: StatusEquipe.PAUSA, label: '⚪ PAUSA OPERACIONAL', color: 'bg-slate-500' },
  ];

  return (
    <div className="space-y-10">
      <div className="bg-slate-900 dark:bg-black text-white p-10 rounded-[3rem] shadow-2xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-black text-center uppercase tracking-tighter">
            Painel de Monitoramento
          </h1>
          <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm font-bold text-slate-400">
            <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-2xl"><Clock size={16} /> {currentTurno?.data}</div>
            <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-2xl"><Users size={16} /> Turno: {currentTurno?.periodo}</div>
            <div className="flex items-center gap-2 bg-blue-900/30 text-blue-400 px-4 py-2 rounded-2xl border border-blue-900/50">{mappedEquipes.length} Ativas</div>
          </div>
        </div>
      </div>

      <div className="space-y-16">
        {categorias.map(cat => {
          const equipesNaCat = mappedEquipes.filter(e => e.status === cat.id);
          return (
            <section key={cat.id} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className={`h-8 w-2 rounded-full ${cat.color}`}></div>
                <h2 className="font-black text-2xl uppercase tracking-tighter text-slate-800 dark:text-slate-100">
                  {cat.label} <span className="text-slate-400 ml-2 font-medium">{equipesNaCat.length}</span>
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {equipesNaCat.map(e => (
                  <EquipeCard key={e.id} equipe={e} />
                ))}
                {equipesNaCat.length === 0 && (
                  <div className="col-span-full py-16 text-center text-slate-400 dark:text-slate-600 italic bg-white dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                    Sem unidades operacionais neste status.
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default Monitoramento;
