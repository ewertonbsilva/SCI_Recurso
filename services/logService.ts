import { getConnection } from '../db';
import { Request } from 'express';

export interface LogEntry {
  usuario: string;
  acao: 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE' | 'READ';
  entidade: string;
  registro_id?: string;
  descricao?: string;
  ip_address?: string;
  user_agent?: string;
  // Campos adicionais para detalhamento
  dados_antigos?: any;
  dados_novos?: any;
  turno_info?: string;
  data_hora?: string;
}

export class LogService {
  /**
   * Registra uma ação no sistema
   */
  static async log(entry: LogEntry): Promise<void> {
    try {
      const connection = getConnection();
      await connection.query(
        `INSERT INTO logs_sistema (usuario, acao, entidade, registro_id, descricao, ip_address, user_agent)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          entry.usuario,
          entry.acao,
          entry.entidade,
          entry.registro_id || null,
          entry.descricao || null,
          entry.ip_address || null,
          entry.user_agent || null
        ]
      );
    } catch (error) {
      console.error('Erro ao registrar log:', error);
      // Não lançar erro para não interromper o fluxo principal
    }
  }

  /**
   * Registra uma ação com detalhes específicos
   */
  static async logDetalhado(entry: LogEntry & {
    dados_antigos?: any;
    dados_novos?: any;
    turno_info?: string;
    data_hora?: string;
  }): Promise<void> {
    try {
      const connection = getConnection();
      
      // Construir descrição detalhada
      let descricaoDetalhada = entry.descricao || '';
      
      if (entry.dados_antigos && entry.dados_novos) {
        const alteracoes = [];
        
        // Comparar objetos e identificar mudanças
        for (const key in entry.dados_novos) {
          if (entry.dados_antigos[key] !== entry.dados_novos[key]) {
            alteracoes.push(`${key}: "${entry.dados_antigos[key]}" → "${entry.dados_novos[key]}"`);
          }
        }
        
        if (alteracoes.length > 0) {
          descricaoDetalhada += `Alterações: ${alteracoes.join(', ')}`;
        }
      }
      
      // Adicionar informações do turno se disponível
      if (entry.turno_info) {
        descricaoDetalhada += ` | Turno: ${entry.turno_info}`;
      }
      
      // Adicionar data/hora se disponível
      if (entry.data_hora) {
        descricaoDetalhada += ` | ${entry.data_hora}`;
      }
      
      await connection.query(
        `INSERT INTO logs_sistema (usuario, acao, entidade, registro_id, descricao, ip_address, user_agent)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          entry.usuario,
          entry.acao,
          entry.entidade,
          entry.registro_id || null,
          descricaoDetalhada || null,
          entry.ip_address || null,
          entry.user_agent || null
        ]
      );
    } catch (error) {
      console.error('Erro ao registrar log detalhado:', error);
    }
  }

  /**
   * Extrai informações do request para logging
   */
  static extractRequestInfo(req: Request): { ip: string; userAgent: string } {
    const ip = req.ip || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress ||
               (req.connection as any)?.socket?.remoteAddress || 
               'unknown';
    
    const userAgent = req.get('User-Agent') || 'unknown';
    
    return { 
      ip: typeof ip === 'string' ? ip : ip?.toString() || 'unknown',
      userAgent 
    };
  }

  /**
   * Registra login de usuário
   */
  static async logLogin(usuario: string, req: Request): Promise<void> {
    const { ip, userAgent } = this.extractRequestInfo(req);
    await this.log({
      usuario,
      acao: 'LOGIN',
      entidade: 'AUTH',
      descricao: 'Usuário fez login no sistema',
      ip_address: ip,
      user_agent: userAgent
    });
  }

  /**
   * Registra logout de usuário
   */
  static async logLogout(usuario: string, req: Request): Promise<void> {
    const { ip, userAgent } = this.extractRequestInfo(req);
    await this.log({
      usuario,
      acao: 'LOGOUT',
      entidade: 'AUTH',
      descricao: 'Usuário fez logout do sistema',
      ip_address: ip,
      user_agent: userAgent
    });
  }

  /**
   * Registra criação de registro
   */
  static async logCreate(usuario: string, entidade: string, registroId: string, descricao?: string, req?: Request): Promise<void> {
    const requestInfo = req ? this.extractRequestInfo(req) : { ip: 'system', userAgent: 'system' };
    await this.log({
      usuario,
      acao: 'CREATE',
      entidade,
      registro_id: registroId,
      descricao: descricao || `Criou ${entidade}`,
      ip_address: requestInfo.ip,
      user_agent: requestInfo.userAgent
    });
  }

  /**
   * Registra atualização de registro
   */
  static async logUpdate(usuario: string, entidade: string, registroId: string, descricao?: string, req?: Request): Promise<void> {
    const requestInfo = req ? this.extractRequestInfo(req) : { ip: 'system', userAgent: 'system' };
    await this.log({
      usuario,
      acao: 'UPDATE',
      entidade,
      registro_id: registroId,
      descricao: descricao || `Atualizou ${entidade}`,
      ip_address: requestInfo.ip,
      user_agent: requestInfo.userAgent
    });
  }

  /**
   * Registra exclusão de registro
   */
  static async logDelete(usuario: string, entidade: string, registroId: string, descricao?: string, req?: Request): Promise<void> {
    const requestInfo = req ? this.extractRequestInfo(req) : { ip: 'system', userAgent: 'system' };
    await this.log({
      usuario,
      acao: 'DELETE',
      entidade,
      registro_id: registroId,
      descricao: descricao || `Excluiu ${entidade}`,
      ip_address: requestInfo.ip,
      user_agent: requestInfo.userAgent
    });
  }

  /**
   * Registra acesso/leitura de registro
   */
  static async logRead(usuario: string, entidade: string, registroId?: string, descricao?: string, req?: Request): Promise<void> {
    const requestInfo = req ? this.extractRequestInfo(req) : { ip: 'system', userAgent: 'system' };
    await this.log({
      usuario,
      acao: 'READ',
      entidade,
      registro_id: registroId,
      descricao: descricao || `Acessou ${entidade}`,
      ip_address: requestInfo.ip,
      user_agent: requestInfo.userAgent
    });
  }

  /**
   * Busca logs com filtros
   */
  static async getLogs(filters: {
    usuario?: string;
    acao?: string;
    entidade?: string;
    data_inicio?: string;
    data_fim?: string;
    limite?: number;
    offset?: number;
  } = {}): Promise<any[]> {
    try {
      const connection = getConnection();
      let query = `
        SELECT * FROM logs_sistema 
        WHERE 1=1
      `;
      const params: any[] = [];

      if (filters.usuario) {
        query += ` AND usuario LIKE ?`;
        params.push(`%${filters.usuario}%`);
      }

      if (filters.acao) {
        query += ` AND acao = ?`;
        params.push(filters.acao);
      }

      if (filters.entidade) {
        query += ` AND entidade LIKE ?`;
        params.push(`%${filters.entidade}%`);
      }

      if (filters.data_inicio) {
        query += ` AND data_hora >= ?`;
        params.push(filters.data_inicio);
      }

      if (filters.data_fim) {
        query += ` AND data_hora <= ?`;
        params.push(filters.data_fim);
      }

      query += ` ORDER BY data_hora DESC`;

      if (filters.limite) {
        query += ` LIMIT ?`;
        params.push(filters.limite);
      }

      if (filters.offset) {
        query += ` OFFSET ?`;
        params.push(filters.offset);
      }

      const [rows] = await connection.query(query, params);
      return rows as any[];
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
      return [];
    }
  }

  /**
   * Conta total de logs para paginação
   */
  static async countLogs(filters: {
    usuario?: string;
    acao?: string;
    entidade?: string;
    data_inicio?: string;
    data_fim?: string;
  } = {}): Promise<number> {
    try {
      const connection = getConnection();
      let query = `
        SELECT COUNT(*) as total FROM logs_sistema 
        WHERE 1=1
      `;
      const params: any[] = [];

      if (filters.usuario) {
        query += ` AND usuario LIKE ?`;
        params.push(`%${filters.usuario}%`);
      }

      if (filters.acao) {
        query += ` AND acao = ?`;
        params.push(filters.acao);
      }

      if (filters.entidade) {
        query += ` AND entidade LIKE ?`;
        params.push(`%${filters.entidade}%`);
      }

      if (filters.data_inicio) {
        query += ` AND data_hora >= ?`;
        params.push(filters.data_inicio);
      }

      if (filters.data_fim) {
        query += ` AND data_hora <= ?`;
        params.push(filters.data_fim);
      }

      const [rows] = await connection.query(query, params);
      return (rows as any[])[0].total;
    } catch (error) {
      console.error('Erro ao contar logs:', error);
      return 0;
    }
  }
}
