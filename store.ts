
import { CadastroCivil, CadastroMilitar, Turno, ChamadaCivil, ChamadaMilitar, Periodo, FuncaoMilitar, StatusEquipe, User, UserRole, LogOperacional, AtestadoMedico, FORCAS, POSTOS_GRAD, ORGAOS_ORIGEM } from './types';

const STORE_KEY = 'sci_recurso_data_v1';
const SESSION_KEY = 'sci_session_v1';

interface AppData {
  users: User[];
  civis: CadastroCivil[];
  militares: CadastroMilitar[];
  atestados: AtestadoMedico[];
  turnos: Turno[];
  chamadaCivil: ChamadaCivil[];
  chamadaMilitar: ChamadaMilitar[];
  logs: LogOperacional[];
}

const defaultData: AppData = {
  users: [
    { id: '1', username: 'admin', nome: 'Administrador do Sistema', password: 'admin123', role: UserRole.ADMIN },
    { id: '2', username: 'operador', nome: 'Operador de Plantão', password: '123', role: UserRole.OPERADOR }
  ],
  civis: [],
  militares: [],
  atestados: [],
  turnos: [],
  chamadaCivil: [],
  chamadaMilitar: [],
  logs: []
};

export const loadData = (): AppData => {
  const saved = localStorage.getItem(STORE_KEY);
  if (!saved) return defaultData;
  try {
    const data = JSON.parse(saved);
    return {
      users: data.users || defaultData.users,
      civis: data.civis || [],
      militares: data.militares || [],
      atestados: data.atestados || [],
      turnos: data.turnos || [],
      chamadaCivil: data.chamadaCivil || [],
      chamadaMilitar: data.chamadaMilitar || [],
      logs: data.logs || []
    };
  } catch (e) {
    return defaultData;
  }
};

export const saveData = (data: AppData) => {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Erro ao salvar no storage", e);
  }
};

export const getCurrentUser = (): User | null => {
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
};

export const login = (user: User) => {
  const { password, ...safeUser } = user;
  localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
};

export const logout = () => {
  localStorage.removeItem(SESSION_KEY);
};

// Fix: Added missing sysLog export to track system activities in console or potential future logging service
export const sysLog = (mensagem: string, level: string = 'info') => {
  console.log(`[SYS-LOG] [${level.toUpperCase()}] ${mensagem}`);
};
