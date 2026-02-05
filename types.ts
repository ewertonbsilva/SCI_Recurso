export enum UserRole {
  ADMIN = 'Administrador',
  OPERADOR = 'Operador'
}

export enum Periodo {
  MANHA = 'Manhã',
  TARDE = 'Tarde',
  NOITE = 'Noite'
}

export enum FuncaoMilitar {
  SCI = 'SCI',
  COMBATENTE = 'Combatente'
}

export enum StatusEquipe {
  LIVRE = 'livre',
  EMPENHADA = 'empenhada',
  PAUSA_OPERACIONAL = 'pausa-operacional'
}

export enum FORCAS {
  CBMERJ = 'CBMERJ',
  PMERJ = 'PMERJ',
  EB = 'EB',
  MB = 'MB',
  FAB = 'FAB',
  OUTROS = 'Outros'
}

export enum POSTOS_GRAD {
  SOLDADO = 'Soldado',
  CABO = 'Cabo',
  SARGENTO = 'Sargento',
  SUBTENENTE = 'Subtenente',
  ASPIRANTE = 'Aspirante',
  TENENTE = 'Tenente',
  CAPITAO = 'Capitão',
  MAJOR = 'Major',
  TENENTE_CORONEL = 'Tenente-Coronel',
  CORONEL = 'Coronel'
}

export enum ORGAOS_ORIGEM {
  DEFESA_CIVIL = 'Defesa Civil',
  CRUZ_VERMELHA = 'Cruz Vermelha',
  VOLUNTARIO = 'Voluntário',
  EMPRESA_PRIVADA = 'Empresa Privada',
  OUTROS = 'Outros'
}

export enum ALFABETO_FONETICO {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G',
  H = 'H',
  I = 'I',
  J = 'J',
  K = 'K',
  L = 'L',
  M = 'M',
  N = 'N',
  O = 'O',
  P = 'P',
  Q = 'Q',
  R = 'R',
  S = 'S',
  T = 'T',
  U = 'U',
  V = 'V',
  W = 'W',
  X = 'X',
  Y = 'Y',
  Z = 'Z'
}

export interface User {
  id: string;
  username: string;
  nome: string;
  password: string;
  role: UserRole;
}

export interface CadastroCivil {
  id_civil: string;
  nome_completo: string;
  contato: string;
  orgao_origem: string;
  motorista: boolean;
  modelo_veiculo?: string;
  placa_veiculo?: string;
}

export interface CadastroMilitar {
  matricula: string;
  nome_completo: string;
  posto_grad: string;
  nome_guerra: string;
  rg: string;
  forca: string;
  cpoe: boolean;
  mergulhador: boolean;
  restricao_medica: boolean;
  desc_rest_med?: string;
}

export interface Turno {
  id_turno: string;
  data: string;
  periodo: Periodo;
  created_at?: string;
  updated_at?: string;
}

export interface ChamadaMilitar {
  id_chamada_militar: string;
  id_turno: string;
  matricula: string;
  funcao: FuncaoMilitar;
  presenca: boolean;
  obs?: string;
}

export interface ChamadaCivil {
  id_chamada_civil: string;
  id_turno: string;
  id_civil: string;
  nome_equipe?: string;
  quant_civil: number;
  status: StatusEquipe;
  matricula_chefe?: string;
  bairro?: string;
  last_status_update: number;
}

export interface LogOperacional {
  id: string;
  id_turno: string;
  timestamp: number;
  mensagem: string;
  categoria: string;
  usuario: string;
}

export interface AtestadoMedico {
  id: string;
  matricula: string;
  data_inicio: string;
  dias: number;
  motivo: string;
}
