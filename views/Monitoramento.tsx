
import React, { useState, useEffect } from 'react';
import { Clock, User, Phone, MapPin, Users, ChevronDown, ChevronUp, ShieldCheck, ExternalLink, Maximize, Minimize } from 'lucide-react';
import { apiService } from '../apiService';
import { StatusEquipe } from '../types';
import { useFullscreen } from '../contexts/FullscreenContext';

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
    [StatusEquipe.PAUSA_OPERACIONAL]: 'border-l-slate-500',
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
  const [data, setData] = useState<{
    turnos: any[],
    chamadaCivil: any[],
    civis: any[],
    militares: any[]
  }>({
    turnos: [],
    chamadaCivil: [],
    civis: [],
    militares: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTurno, setSelectedTurno] = useState<any>(null);
  const { isFullscreen, setIsFullscreen } = useFullscreen();

  const toggleFullscreen = async () => {
    console.log('Botão fullscreen clicado. Estado atual:', isFullscreen);
    
    try {
      if (!isFullscreen) {
        console.log('Tentando entrar em fullscreen...');
        
        // Tentar entrar em fullscreen
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          console.log('requestFullscreen chamado');
        } else {
          console.log('Fallback: simulando fullscreen com CSS');
          setIsFullscreen(true);
        }
      } else {
        console.log('Tentando sair do fullscreen...');
        
        // Tentar sair do fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          console.log('exitFullscreen chamado');
        } else {
          console.log('Fallback: saindo do fullscreen simulado');
          setIsFullscreen(false);
        }
      }
    } catch (error) {
      console.error('Erro ao alternar fullscreen:', error);
      // Fallback: alternar estado manualmente
      setIsFullscreen(!isFullscreen);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [turnos, civis, militares] = await Promise.all([
          apiService.getTurnos(),
          apiService.getCivis(),
          apiService.getMilitares()
        ]);

        // Selecionar o turno mais recente por padrão
        const latestTurno = [...turnos].sort((a, b) => b.data.localeCompare(a.data))[0];
        if (latestTurno) {
          setSelectedDate(latestTurno.data);
          setSelectedTurno(latestTurno);
        }

        // Buscar chamadaCivil para o turno selecionado
        const chamadaCivil = latestTurno ? await apiService.getChamadaCivil(latestTurno.id_turno) : [];

        setData({
          turnos,
          chamadaCivil,
          civis,
          militares
        });
      } catch (error) {
        console.error('Erro ao buscar dados para monitoramento:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
    const interval = setInterval(fetchAllData, 30000); // Atualiza a cada 30s

    return () => clearInterval(interval);
  }, []);

  // Obter datas únicas dos turnos
  const uniqueDates = [...new Set(data.turnos.map(turno => turno.data))].sort((a, b) => (b as string).localeCompare(a as string));
  
  // Obter turnos da data selecionada
  const turnosDaData = data.turnos.filter(turno => turno.data === selectedDate);

  // Limpar turno selecionado quando mudar a data
  useEffect(() => {
    if (selectedDate) {
      const primeiroTurnoDaData = turnosDaData[0];
      setSelectedTurno(primeiroTurnoDaData || null);
    } else {
      setSelectedTurno(null);
    }
  }, [selectedDate]);

  useEffect(() => {
    const loadChamadaCivil = async () => {
      if (selectedTurno) {
        try {
          const chamadaCivil = await apiService.getChamadaCivil(selectedTurno.id_turno);
          setData(prev => ({ ...prev, chamadaCivil }));
        } catch (error) {
          console.error('Erro ao carregar chamada civil:', error);
        }
      }
    };

    loadChamadaCivil();
  }, [selectedTurno]);

  const currentTurno = selectedTurno;

  const mappedEquipes = data.chamadaCivil
    .filter(cc => cc.id_turno === currentTurno?.id_turno)
    .map(cc => {
      const civil = data.civis.find(c => c.id_civil === cc.id_civil);
      const chefeInfo = data.militares.find(m => m.matricula === cc.matricula_chefe);

      return {
        id: cc.id_chamada_civil,
        nome: cc.nome_equipe || civil?.modelo_veiculo || 'EQUIPE S/ VTR',
        chefe: chefeInfo ? `${chefeInfo.nome_posto_grad} ${chefeInfo.nome_guerra}` : '',
        motorista: civil?.nome_completo || 'N/A',
        tel_mot: civil?.contato || 'N/A',
        bairro: cc.bairro || '',
        pessoas: (cc.quant_civil || 1) + (cc.matricula_chefe ? 1 : 0),
        status: cc.status,
        inicio: cc.last_status_update,
        detalhes: `Orgão: ${civil?.orgao_origem} | Placa: ${civil?.placa_veiculo} | Chefe Matr.: ${cc.matricula_chefe || 'Nenhum'}`
      };
    });

  const categorias = [
    { id: StatusEquipe.LIVRE, label: '🟢 LIVRE', color: 'bg-emerald-500' },
    { id: StatusEquipe.EMPENHADA, label: '🟡 EMPENHADA', color: 'bg-amber-500' },
    { id: StatusEquipe.PAUSA_OPERACIONAL, label: '⚪ PAUSA OPERACIONAL', color: 'bg-slate-500' },
  ];

  return (
    <div className={`space-y-10 transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-50 dark:bg-slate-900 overflow-auto' : ''}`}>
      <div className={`bg-slate-900 dark:bg-black text-white rounded-[3rem] shadow-2xl border border-slate-800 relative overflow-hidden transition-all duration-300 ${isFullscreen ? 'p-6 mx-4 mt-4' : 'p-10'}`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botão clicado diretamente');
            toggleFullscreen();
          }}
          className="absolute top-6 right-6 p-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-2xl transition-all hover:scale-105 border border-blue-600/30 z-50 cursor-pointer"
          title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
          style={{ pointerEvents: 'auto' }}
        >
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
        <div className="relative z-10">
          <h1 className={`font-black text-center uppercase tracking-tighter transition-all duration-300 ${isFullscreen ? 'text-2xl' : 'text-4xl md:text-5xl'}`}>
            Painel de Monitoramento
          </h1>
          <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm font-bold text-slate-400">
            <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-2xl">
              <Clock size={16} />
              {loading ? (
                <span>Carregando...</span>
              ) : (
                <select 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-white outline-none cursor-pointer hover:bg-slate-700 rounded px-2 py-1 transition-colors"
                >
                  {uniqueDates.map(date => {
                    const dateObj = new Date(date as string);
                    const dateStr = dateObj.toLocaleDateString('pt-BR', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric' 
                    });
                    return (
                      <option key={date} value={date} className="bg-slate-800 text-white">
                        {dateStr}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>
            <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-2xl">
              <Users size={16} />
              {selectedDate && turnosDaData.length > 0 ? (
                <select 
                  value={selectedTurno?.id_turno || ''} 
                  onChange={(e) => {
                    const turno = turnosDaData.find(t => t.id_turno === e.target.value);
                    setSelectedTurno(turno);
                  }}
                  className="bg-transparent text-white outline-none cursor-pointer hover:bg-slate-700 rounded px-2 py-1 transition-colors"
                >
                  {turnosDaData.map(turno => (
                    <option key={turno.id_turno} value={turno.id_turno} className="bg-slate-800 text-white">
                      {turno.periodo}
                    </option>
                  ))}
                </select>
              ) : (
                <span>{selectedTurno?.periodo || 'Selecione uma data'}</span>
              )}
            </div>
            <div className="flex items-center gap-2 bg-blue-900/30 text-blue-400 px-4 py-2 rounded-2xl border border-blue-900/50">{mappedEquipes.length} Ativas</div>
          </div>
        </div>
      </div>

      <div className={`space-y-16 transition-all duration-300 ${isFullscreen ? 'px-4 pb-4' : ''}`}>
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

              <div className={`grid gap-6 transition-all duration-300 ${isFullscreen ? 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
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
