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

export interface Equipe {
  id_equipe: string;
  id_turno: string;
  id_chamada_militar?: string;
  id_chamada_civil?: string;
  nome_equipe: string;
  status: StatusEquipe;
  total_efetivo: number;
  bairro?: string;
  created_at: string;
  updated_at: string;
  turno_data?: string;
  turno_periodo?: string;
  matricula_militar?: string;
  nome_militar?: string;
  quant_civil?: number;
  nome_motorista?: string;
  vtr_modelo?: string;
}

export enum FORCAS {
  CBMAC = 'CBMAC',
  PMAC = 'PMAC',
  EB = 'EB',
  MB = 'MB',
  FAB = 'FAB',
  PC = 'PC',
  OUTROS = 'Outros'
}

export enum POSTOS_GRAD {
  AL_SD = 'AL SD',
  SD = 'SD',
  AL_CB = 'AL CB',
  CB = 'CB',
  AL_SGT = 'AL SGT',
  SARGENTO_3 = '3º SGT',
  SARGENTO_2 = '2º SGT',
  SARGENTO_1 = '1º SGT',
  AL_OF = 'AL OF',
  ST = 'ST',
  TENENTE_2 = '2º TEN',
  TENENTE_1 = '1º TEN',
  CAP = 'CAP',
  MAJ = 'MAJ',
  TC = 'TC',
  CEL = 'CEL'
}

export enum ORGAOS_ORIGEM {
  DEFESA_CIVIL = 'Defesa Civil',
  CRUZ_VERMELHA = 'Cruz Vermelha',
  VOLUNTARIO = 'Voluntário',
  EMPRESA_PRIVADA = 'Empresa Privada',
  OUTROS = 'Outros'
}

export enum UBMS {
  QCG = 'QCG',
  DATOP = 'DATOP',
  DEIP = 'DEIP',
  DS = 'DS',
  CICC_COBOM = 'CICC - COBOM',
  CIA1_CIAER = '1ª CIA CIAER',
  COL_MIL_CMDP = 'CMDP II RBO',
  BEPCIF_1 = '1º BEPCIF',
  BEPCIF_2 = '2º BEPCIF',
  BEPCIF_3 = '3º BEPCIF',
  BEPCIF_4 = '4º BEPCIF',
  BEPCIF_5 = '5º BEPCIF',
  BEPCIF_6 = '6º BEPCIF',
  BEPCIF_7 = '7º BEPCIF',
  BEPCIF_8 = '8º BEPCIF',
  BEPCIF_9 = '9º BEPCIF',
  A_DISPOSICAO = 'A DISPOSIÇÃO'
}

export enum ALFABETO_FONETICO {
  ALPHA = 'Alpha',
  BRAVO = 'Bravo',
  CHARLIE = 'Charlie',
  DELTA = 'Delta',
  ECHO = 'Echo',
  FOXTROT = 'Foxtrot',
  GOLF = 'Golf',
  HOTEL = 'Hotel',
  INDIA = 'India',
  JULIET = 'Juliet',
  KILO = 'Kilo',
  LIMA = 'Lima',
  MIKE = 'Mike',
  NOVEMBER = 'November',
  OSCAR = 'Oscar',
  PAPA = 'Papa',
  QUEBEC = 'Quebec',
  ROMEO = 'Romeo',
  SIERRA = 'Sierra',
  TANGO = 'Tango',
  UNIFORM = 'Uniform',
  VICTOR = 'Victor',
  WHISKEY = 'Whiskey',
  XRAY = 'X-Ray',
  YANKEE = 'Yankee',
  ZULU = 'Zulu'
}

export interface User {
  id: string;
  username: string;
  nome: string;
  password: string;
  role: UserRole;
}

export interface Forca {
  id_forca: number;
  nome_forca: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrgaoOrigem {
  id_orgao_origem: number;
  nome_orgao: string;
  created_at?: string;
  updated_at?: string;
}

export interface CadastroCivil {
  id_civil: string;
  nome_completo: string;
  contato: string;
  id_orgao_origem: number;
  nome_orgao?: string;  // Vem do JOIN com orgaos_origem
  motorista: boolean;
  modelo_veiculo?: string;
  placa_veiculo?: string;
}

export interface PostoGrad {
  id_posto_grad: number;
  nome_posto_grad: string;
  hierarquia: number;
  created_at?: string;
  updated_at?: string;
}

export interface CadastroMilitar {
  matricula: string;
  nome_completo: string;
  id_posto_grad: number;
  nome_posto_grad?: string;  // Vem do JOIN com posto_grad
  hierarquia?: number;        // Vem do JOIN com posto_grad
  nome_guerra: string;
  rg: string;
  id_forca: number;
  nome_forca?: string;      // Vem do JOIN com forcas
  cpoe: boolean;
  mergulhador: boolean;
  restricao_medica: boolean;
  desc_rest_med?: string;
  id_ubm?: string;
  nome_ubm?: string;        // Vem do JOIN com ubms
}

export interface Turno {
  id_turno: string;
  data: string;
  periodo: Periodo;
  total_equipes?: number;
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
  quant_civil: number;
  created_at?: string;
  updated_at?: string;
}

export interface LogOperacional {
  id: string;
  id_turno: string;
  timestamp: number;
  mensagem: string;
  categoria: 'Informativo' | 'Equipe' | 'Urgente';
  usuario: string;
}

export interface LogAuditoria {
  id: string;
  timestamp: number;
  usuario: string;
  acao: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  modulo: string;
  entidade: string;
  id_entidade: string;
  dados_antigos?: any;
  dados_novos?: any;
  ip_address?: string;
  user_agent?: string;
}

export interface AtestadoMedico {
  id: string;
  matricula: string;
  data_inicio: string;
  dias: number;
  motivo: string;
}
