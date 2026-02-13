
import React from 'react';
import { Users, Shield, Clock, BrainCircuit, Loader2, Sparkles } from 'lucide-react';
import { analyzeResources } from '../geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiService } from '../apiService';

const Dashboard: React.FC = () => {
  const [aiAnalysis, setAiAnalysis] = React.useState<string | null>(null);
  const [loadingAi, setLoadingAi] = React.useState(false);
  const [militares, setMilitares] = React.useState<any[]>([]);
  const [civis, setCivis] = React.useState<any[]>([]);
  const [turnos, setTurnos] = React.useState<any[]>([]);
  const [chamadaCivil, setChamadaCivil] = React.useState<any[]>([]);
  const [chamadaMilitar, setChamadaMilitar] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadDadosFromAPI();
  }, []);

  const loadDadosFromAPI = async () => {
    try {
      setLoading(true);
      const [militaresData, civisData, turnosData] = await Promise.all([
        apiService.getMilitares(),
        apiService.getCivis(),
        apiService.getTurnos()
      ]);
      setMilitares(militaresData);
      setCivis(civisData);
      setTurnos(turnosData);

      // Carregar chamadas do turno mais recente
      const latestTurno = [...turnosData].sort((a, b) => b.data.localeCompare(a.data))[0];
      if (latestTurno) {
        const [ccData, cmData] = await Promise.all([
          apiService.getChamadaCivil(latestTurno.id_turno),
          apiService.getChamadaMilitar(latestTurno.id_turno)
        ]);
        setChamadaCivil(ccData);
        setChamadaMilitar(cmData);
      }
      console.log('Dados do dashboard carregados:', { militares: militaresData, civis: civisData, turnos: turnosData });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Efetivo Militar', value: militares.length, icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Recursos Civis', value: civis.length, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Histórico Turnos', value: turnos.length, icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  ];

  const chartData = [
    { name: 'Militares', count: militares.length },
    { name: 'Civis', count: civis.length },
    { name: 'Turnos', count: turnos.length },
  ];

  const handleAiAnalysis = async () => {
    setLoadingAi(true);
    const analysis = await analyzeResources({
      militares: militares,
      civis: civis,
      chamadas: {
        civil: chamadaCivil,
        militar: chamadaMilitar
      }
    });
    setAiAnalysis(analysis || "Erro na análise.");
    setLoadingAi(false);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">Visão <span className="text-blue-600">Geral</span></h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Controle de prontidão e efetivo operacional.</p>
        </div>
        <button
          onClick={handleAiAnalysis}
          disabled={loadingAi}
          className="group flex items-center justify-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-6 py-4 rounded-[2rem] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-xl shadow-slate-200 dark:shadow-none font-bold text-sm"
        >
          {loadingAi ? <Loader2 className="animate-spin" size={18} /> : <Sparkles className="group-hover:rotate-12 transition-transform" size={18} />}
          ANÁLISE ESTRATÉGICA AI
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
                <stat.icon size={28} />
              </div>
              <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-black mb-8 uppercase tracking-tight flex items-center gap-2">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
            Distribuição de Recursos
          </h3>
          <div className="min-h-[300px] w-full" style={{ width: '100%', minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 700 }}
                  cursor={{ fill: '#f1f5f9', opacity: 0.4 }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[12, 12, 12, 12]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 dark:bg-slate-800 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-white uppercase tracking-tight">
            <BrainCircuit size={20} className="text-blue-400" /> Inteligência Operacional
          </h3>
          <div className="text-slate-300 space-y-4 relative z-10">
            {aiAnalysis ? (
              <div className="prose prose-invert prose-sm max-w-none font-medium leading-relaxed">
                {aiAnalysis.split('\n').map((para, i) => (
                  <p key={i} className="mb-4">{para}</p>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <Shield size={64} className="mb-4 opacity-10 group-hover:scale-110 transition-transform" />
                <p className="text-center text-sm font-bold max-w-[200px] leading-tight">Gere uma análise automática baseada no efetivo real de hoje.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
