import { Turno, Periodo, User, AtestadoMedico } from './types';

const API_BASE_URL = 'http://localhost:3001';

class ApiService {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const authHeaders = this.getAuthHeaders();
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        // Se for erro de autenticação, limpar dados e redirecionar
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          window.location.href = '/login';
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Turnos
  async getTurnos(): Promise<Turno[]> {
    return this.request<Turno[]>('/api/');
  }

  async createTurno(data: string, periodo: Periodo): Promise<Turno> {
    return this.request<Turno>('/api/sp/criar-turno', {
      method: 'POST',
      body: JSON.stringify({ data, periodo }),
    });
  }

  async deleteTurno(id: string): Promise<void> {
    return this.request<void>(`/api/turnos/${id}`, {
      method: 'DELETE'
    });
  }

  // Militares
  async getMilitares(): Promise<any[]> {
    return this.request<any[]>('/api/militares');
  }

  async createMilitar(militar: any): Promise<any> {
    return this.request<any>('/api/militares', {
      method: 'POST',
      body: JSON.stringify(militar),
    });
  }

  async updateMilitar(matricula: string, militar: any): Promise<any> {
    return this.request<any>(`/api/militares/${matricula}`, {
      method: 'PUT',
      body: JSON.stringify(militar),
    });
  }

  async deleteMilitar(matricula: string): Promise<void> {
    return this.request<void>(`/api/militares/${matricula}`, {
      method: 'DELETE',
    });
  }

  // Civis
  async getCivis(): Promise<any[]> {
    return this.request<any[]>('/api/civis');
  }

  async createCivil(civil: any): Promise<any> {
    return this.request<any>('/api/civis', {
      method: 'POST',
      body: JSON.stringify(civil),
    });
  }

  async updateCivil(id: string, civil: any): Promise<any> {
    return this.request<any>(`/api/civis/${id}`, {
      method: 'PUT',
      body: JSON.stringify(civil),
    });
  }

  async deleteCivil(id: string): Promise<void> {
    return this.request<void>(`/api/civis/${id}`, {
      method: 'DELETE',
    });
  }

  // Chamada
  async getChamadaMilitar(idTurno: string): Promise<any[]> {
    return this.request<any[]>(`/api/chamada-militar/${idTurno}`);
  }

  async createChamadaMilitar(chamada: any): Promise<any> {
    return this.request<any>('/api/chamada-militar', {
      method: 'POST',
      body: JSON.stringify(chamada),
    });
  }

  async updateChamadaMilitar(id: string, chamada: any): Promise<any> {
    return this.request<any>(`/api/chamada-militar/${id}`, {
      method: 'PUT',
      body: JSON.stringify(chamada),
    });
  }

  async deleteChamadaMilitar(id: string): Promise<void> {
    return this.request<void>(`/api/chamada-militar/${id}`, {
      method: 'DELETE',
    });
  }

  async getChamadaCivil(idTurno: string): Promise<any[]> {
    return this.request<any[]>(`/api/chamada-civil/${idTurno}`);
  }

  async createChamadaCivil(chamada: any): Promise<any> {
    return this.request<any>('/api/chamada-civil', {
      method: 'POST',
      body: JSON.stringify(chamada),
    });
  }

  async updateChamadaCivil(id: string, chamada: any): Promise<any> {
    return this.request<any>(`/api/chamada-civil/${id}`, {
      method: 'PUT',
      body: JSON.stringify(chamada),
    });
  }

  async deleteChamadaCivil(id: string): Promise<void> {
    return this.request<void>(`/api/chamada-civil/${id}`, {
      method: 'DELETE',
    });
  }

  // Equipes
  async getEquipes(idTurno: string): Promise<any[]> {
    return this.request<any[]>(`/api/equipes/${idTurno}`);
  }

  async createEquipe(equipe: any): Promise<any> {
    return this.request<any>('/api/equipes', {
      method: 'POST',
      body: JSON.stringify(equipe),
    });
  }

  async updateEquipe(id: string, equipe: any): Promise<any> {
    return this.request<any>(`/api/equipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(equipe),
    });
  }

  async deleteEquipe(id: string): Promise<void> {
    return this.request<void>(`/api/equipes/${id}`, {
      method: 'DELETE',
    });
  }

  // Views Otimizadas (Reais do Banco)
  async getMilitaresRestricoes(): Promise<any[]> {
    return this.request<any[]>('/api/vw/militares-restricoes');
  }

  async getResumoCivisTurno(): Promise<any[]> {
    return this.request<any[]>('/api/vw/resumo-civis-turno');
  }

  async getResumoMilitaresTurno(): Promise<any[]> {
    return this.request<any[]>('/api/vw/resumo-militares-turno');
  }

  // Stored Procedures (Reais do Banco)
  async criarTurno(data: string, periodo: string): Promise<any> {
    return this.request<any>('/api/sp/criar-turno', {
      method: 'POST',
      body: JSON.stringify({ data, periodo }),
    });
  }

  // Métodos para usar Stored Procedures
  async gerarId(tipo: 'turno' | 'civil' | 'atestado'): Promise<any> {
    return this.request<any>(`/api/sp/gerar-id/${tipo}`);
  }

  async criarTurnoComSP(data: string, periodo: string): Promise<any> {
    // Este endpoint não existe no backend - implementar se necessário
    throw new Error('Endpoint criarTurnoComSP não implementado no backend');
  }

  async getDashboard(): Promise<any> {
    return this.request<any>('/api/dashboard');
  }

  async getDisponibilidade(data: string, periodo: string): Promise<any[]> {
    return this.request<any[]>(`/api/disponibilidade?data=${data}&periodo=${periodo}`);
  }

  // Métodos para usar Views Otimizadas
  async getEfetivoDisponivelView(): Promise<any[]> {
    return this.request<any[]>('/api/vw/efetivo-disponivel');
  }

  async getResumoTurnos(): Promise<any[]> {
    return this.request<any[]>('/api/vw/resumo-turnos');
  }

  async getLogsRecentes(): Promise<any[]> {
    return this.request<any[]>('/api/vw/logs-recentes');
  }

  // Componentes da Equipe (Guarnição)
  async getComponentesEquipe(idEquipe: string | number): Promise<any[]> {
    return this.request<any[]>(`/api/equipes/componentes/${idEquipe}`);
  }

  async addComponenteEquipe(data: { id_equipe: string | number, id_chamada_militar: string, id_turno: string }): Promise<any> {
    return this.request<any>('/api/equipes/componentes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteComponenteEquipe(idComponente: string): Promise<void> {
    return this.request<void>(`/api/equipes/componentes/${idComponente}`, {
      method: 'DELETE',
    });
  }

  // Atestados Médicos
  async getAtestados(): Promise<AtestadoMedico[]> {
    return this.request<AtestadoMedico[]>('/api/atestados');
  }

  async createAtestado(atestado: Partial<AtestadoMedico>): Promise<AtestadoMedico> {
    return this.request<AtestadoMedico>('/api/atestados', {
      method: 'POST',
      body: JSON.stringify(atestado),
    });
  }

  async deleteAtestado(id: string): Promise<void> {
    return this.request<void>(`/api/atestados/${id}`, {
      method: 'DELETE',
    });
  }

  // Usuários
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/api/users');
  }

  async createUser(user: any): Promise<any> {
    return this.request<any>('/api/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  async deleteUser(id: string): Promise<void> {
    return this.request<void>(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }

  async updateUser(id: string, user: Partial<User>): Promise<any> {
    return this.request<any>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  }

  // Redefinir senha de usuário
  async resetUserPassword(id: string, newPassword: string): Promise<any> {
    return this.request<any>(`/api/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  }

  // Postos e Graduações
  async getPostosGrad(): Promise<any[]> {
    return this.request<any[]>('/api/postos-grad');
  }

  async createPostoGrad(posto: Partial<any>): Promise<any> {
    return this.request<any>('/api/postos-grad', {
      method: 'POST',
      body: JSON.stringify(posto),
    });
  }

  async updatePostoGrad(id: number, posto: Partial<any>): Promise<any> {
    return this.request<any>(`/api/postos-grad/${id}`, {
      method: 'PUT',
      body: JSON.stringify(posto),
    });
  }

  async deletePostoGrad(id: number): Promise<void> {
    return this.request<void>(`/api/postos-grad/${id}`, {
      method: 'DELETE',
    });
  }

  // Forças
  async getForcas(): Promise<any[]> {
    return this.request<any[]>('/api/forcas');
  }

  async createForca(forca: Partial<any>): Promise<any> {
    return this.request<any>('/api/forcas', {
      method: 'POST',
      body: JSON.stringify(forca),
    });
  }

  async updateForca(id: number, forca: Partial<any>): Promise<any> {
    return this.request<any>(`/api/forcas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(forca),
    });
  }

  async deleteForca(id: number): Promise<void> {
    return this.request<void>(`/api/forcas/${id}`, {
      method: 'DELETE',
    });
  }

  // Órgãos de Origem
  async getOrgaosOrigem(): Promise<any[]> {
    return this.request<any[]>('/api/orgaos-origem');
  }

  async createOrgaoOrigem(orgao: Partial<any>): Promise<any> {
    return this.request<any>('/api/orgaos-origem', {
      method: 'POST',
      body: JSON.stringify(orgao),
    });
  }

  async updateOrgaoOrigem(id: number, orgao: Partial<any>): Promise<any> {
    return this.request<any>(`/api/orgaos-origem/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orgao),
    });
  }

  async deleteOrgaoOrigem(id: number): Promise<void> {
    return this.request<void>(`/api/orgaos-origem/${id}`, {
      method: 'DELETE',
    });
  }

  // UBMs
  async getUBMs(): Promise<any[]> {
    return this.request<any[]>('/api/ubms');
  }

  async createUBM(ubm: { id_ubm: string, nome_ubm: string }): Promise<any> {
    return this.request<any>('/api/ubms', {
      method: 'POST',
      body: JSON.stringify(ubm),
    });
  }

  async updateUBM(id: string | number, ubm: Partial<any>): Promise<any> {
    return this.request<any>(`/api/ubms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ubm),
    });
  }

  async deleteUBM(id: number): Promise<void> {
    return this.request<void>(`/api/ubms/${id}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/api/health');
  }
}

export interface PostoGrad {
  id_posto_grad: number;
  nome_posto_grad: string;
  hierarquia: number;
  created_at?: string;
  updated_at?: string;
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

export const apiService = new ApiService();
