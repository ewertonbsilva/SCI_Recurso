import { LogAuditoria } from '../types';

class AuditoriaService {
  private static logs: LogAuditoria[] = [];

  static registrar(
    acao: LogAuditoria['acao'],
    modulo: string,
    entidade: string,
    id_entidade: string,
    dados_antigos?: any,
    dados_novos?: any,
    usuario?: string
  ) {
    const log: LogAuditoria = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      usuario: usuario || this.getUsuarioAtual(),
      acao,
      modulo,
      entidade,
      id_entidade,
      dados_antigos,
      dados_novos,
      ip_address: this.getIPAddress(),
      user_agent: navigator.userAgent
    };

    this.logs.unshift(log);
    console.log('[AUDITORIA]', log);
    
    // Na implementação real, enviar para API
    this.enviarParaAPI(log);
  }

  static registrarLogin(usuario: string) {
    this.registrar('LOGIN', 'Autenticação', 'Usuario', usuario, undefined, undefined, usuario);
  }

  static registrarLogout(usuario: string) {
    this.registrar('LOGOUT', 'Autenticação', 'Usuario', usuario, undefined, undefined, usuario);
  }

  static registrarCreate(modulo: string, entidade: string, dados: any, usuario?: string) {
    this.registrar('CREATE', modulo, entidade, dados.id || crypto.randomUUID(), undefined, dados, usuario);
  }

  static registrarUpdate(modulo: string, entidade: string, id_entidade: string, dados_antigos: any, dados_novos: any, usuario?: string) {
    this.registrar('UPDATE', modulo, entidade, id_entidade, dados_antigos, dados_novos, usuario);
  }

  static registrarDelete(modulo: string, entidade: string, dados: any, usuario?: string) {
    this.registrar('DELETE', modulo, entidade, dados.id || crypto.randomUUID(), dados, undefined, usuario);
  }

  private static getUsuarioAtual(): string {
    // Tentar obter do contexto de autenticação
    try {
      const userData = localStorage.getItem('sci_user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.nome || 'Sistema';
      }
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
    }
    return 'Sistema';
  }

  private static getIPAddress(): string {
    // Em produção, isso viria do servidor
    return '192.168.1.100'; // Simulação
  }

  private static async enviarParaAPI(log: LogAuditoria) {
    try {
      // Implementação real - enviar para API
      const response = await fetch('/api/auditoria', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(log)
      });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      console.log('✅ Log de auditoria salvo no banco:', log);
    } catch (error) {
      console.error('❌ Erro ao salvar log de auditoria:', error);
      
      // Fallback: salvar em localStorage se falhar API
      this.salvarEmLocalStorage(log);
    }
  }

  private static salvarEmLocalStorage(log: LogAuditoria) {
    try {
      const logsSalvos = localStorage.getItem('sci_auditoria_logs');
      const logs = logsSalvos ? JSON.parse(logsSalvos) : [];
      logs.unshift(log);
      
      // Manter apenas últimos 1000 logs no localStorage
      if (logs.length > 1000) {
        logs.splice(1000);
      }
      
      localStorage.setItem('sci_auditoria_logs', JSON.stringify(logs));
      console.log('📁 Log salvo em localStorage (fallback):', log);
    } catch (error) {
      console.error('❌ Erro ao salvar em localStorage:', error);
    }
  }

  static getLogs(): LogAuditoria[] {
    return this.logs;
  }

  static limparLogs() {
    this.logs = [];
  }
}

export default AuditoriaService;
