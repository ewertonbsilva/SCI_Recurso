
export enum Periodo {
  MANHA = 'Manhã',
  NOITE = 'Noite'
}

export enum FuncaoMilitar {
  SCI = 'SCI',
  COMBATENTE = 'Combatente'
}

export enum StatusEquipe {
  LIVRE = 'livre',
  EMPENHADA = 'empenhada',
  PAUSA = 'pausa-operacional'
}

export enum UserRole {
  ADMIN = 'Administrador',
  OPERADOR = 'Operador'
}

export interface User {
  id: string;
  username: string;
  nome: string;
  password?: string;
  role: UserRole;
}

export interface CadastroCivil {
  idCivil: string;
  nomeCompleto: string;
  contato: string;
  orgaoOrigem: string;
  motorista: boolean;
  modeloVeiculo: string;
  placaVeiculo: string;
}

export interface CadastroMilitar {
  matricula: string;
  nomeCompleto: string;
  postoGrad: string;
  nomeGuerra: string;
  rg: string;
  forca: string;
  cpoe: boolean;
  mergulhador: boolean;
  restricaoMedica: boolean;
  descRestMed: string;
}

export interface AtestadoMedico {
  id: string;
  matricula: string;
  dataInicio: string;
  dias: number;
  motivo: string;
}

export interface Turno {
  idTurno: string;
  data: string;
  periodo: Periodo;
}

export interface LogOperacional {
  id: string;
  idTurno: string;
  timestamp: number;
  mensagem: string;
  categoria: 'Informativo' | 'Urgente' | 'Equipe';
  usuario: string;
}

export interface ChamadaCivil {
  idChamadaCivil: string;
  idTurno: string;
  idCivil: string;
  nomeEquipe?: string;
  quantCivil: number;
  status: StatusEquipe;
  matriculaChefe?: string;
  bairro?: string;
  lastStatusUpdate: number;
}

export interface ChamadaMilitar {
  idChamadaMilitar: string;
  idTurno: string;
  matricula: string;
  funcao: FuncaoMilitar;
  presenca: boolean;
  obs: string;
}

export const FORCAS = ['CBMERJ', 'PMERJ', 'EB', 'MB', 'FAB', 'Outros'];
export const POSTOS_GRAD = [
  'Cel', 'Ten Cel', 'Maj', 'Cap', '1º Ten', '2º Ten', 'Sub Ten', 
  '1º Sgt', '2º Sgt', '3º Sgt', 'Cb', 'Sd'
];
export const ORGAOS_ORIGEM = ['Defesa Civil', 'Cruz Vermelha', 'Voluntário', 'Empresa Privada', 'Outros'];

export const ALFABETO_FONETICO = [
  'Alfa', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel', 'India', 
  'Juliett', 'Kilo', 'Lima', 'Mike', 'November', 'Oscar', 'Papa', 'Quebec', 
  'Romeo', 'Sierra', 'Tango', 'Uniform', 'Victor', 'Whiskey', 'X-ray', 'Yankee', 'Zulu'
];
