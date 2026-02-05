import { Turno, Periodo, User } from './types';

const API_BASE_URL = 'http://localhost:3001';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('Fazendo requisição para:', url);
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      console.log('Resposta status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Dados recebidos:', data);
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Turnos
  async getTurnos(): Promise<Turno[]> {
    return this.request<Turno[]>('/api/turnos');
  }

  async createTurno(data: string, periodo: Periodo): Promise<Turno> {
    return this.request<Turno>('/api/turnos', {
      method: 'POST',
      body: JSON.stringify({ data, periodo }),
    });
  }

  async deleteTurno(id: string): Promise<void> {
    return this.request<void>(`/api/turnos/${id}`, {
      method: 'DELETE',
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

  // Logs Operacionais
  async getLogs(): Promise<any[]> {
    return this.request<any[]>('/api/logs');
  }

  async createLog(log: any): Promise<any> {
    return this.request<any>('/api/logs', {
      method: 'POST',
      body: JSON.stringify(log),
    });
  }

  async deleteLog(id: string): Promise<void> {
    return this.request<void>(`/api/logs/${id}`, {
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

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/api/health');
  }
}

export const apiService = new ApiService();
