import { Request, Response, NextFunction } from 'express';
import { LogService } from '../services/logService';

/**
 * Middleware para logging automático de requisições HTTP
 */
export function loggingMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Capturar o usuário do token JWT se existir
  const getUsuarioFromRequest = (req: Request): string => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        // Aqui você poderia decodificar o JWT para obter o usuário
        // Por ora, vamos extrair de forma simplificada
        const token = authHeader.substring(7);
        const base64Payload = token.split('.')[1];
        const payload = Buffer.from(base64Payload, 'base64').toString();
        const parsed = JSON.parse(payload);
        return parsed.usuario || parsed.username || 'unknown';
      } catch (error) {
        return 'unknown';
      }
    }
    return 'anonymous';
  };

  // Mapear método HTTP para ação de log
  const getActionFromMethod = (method: string): 'CREATE' | 'UPDATE' | 'DELETE' | 'READ' => {
    switch (method.toUpperCase()) {
      case 'POST':
        return 'CREATE';
      case 'PUT':
      case 'PATCH':
        return 'UPDATE';
      case 'DELETE':
        return 'DELETE';
      case 'GET':
      default:
        return 'READ';
    }
  };

  // Extrair entidade da URL
  const getEntityFromPath = (path: string): string => {
    const segments = path.split('/').filter(segment => segment);
    if (segments.length > 0) {
      // Remove parâmetros e retorna a primeira entidade
      return segments[0].toUpperCase();
    }
    return 'UNKNOWN';
  };

  // Extrair ID do registro da URL
  const getRecordIdFromPath = (path: string): string | undefined => {
    const segments = path.split('/').filter(segment => segment);
    // Geralmente o ID está na terceira posição: /api/entidade/id
    if (segments.length >= 3) {
      return segments[2];
    }
    return undefined;
  };

  // Intercepta o método res.json para registrar after response
  const originalJson = res.json;
  let responseData: any;

  res.json = function(data: any) {
    responseData = data;
    return originalJson.call(this, data);
  };

  // Intercepta o final da response
  res.on('finish', async () => {
    try {
      const usuario = getUsuarioFromRequest(req);
      const acao = getActionFromMethod(req.method);
      const entidade = getEntityFromPath(req.path);
      const registroId = getRecordIdFromPath(req.path);

      // Montar descrição baseada na resposta
      let descricao = '';
      if (responseData) {
        if (responseData.message) {
          descricao = responseData.message;
        } else if (responseData.error) {
          descricao = `Erro: ${responseData.error}`;
        } else {
          descricao = `${req.method} ${req.path} - Status: ${res.statusCode}`;
        }
      }

      // Registrar log apenas para operações que modificam dados ou para erros
      if (acao !== 'READ' || res.statusCode >= 400) {
        await LogService.log({
          usuario,
          acao,
          entidade,
          registro_id: registroId,
          descricao,
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        });
      }
    } catch (error) {
      console.error('Erro no middleware de logging:', error);
      // Não interromper o fluxo principal
    }
  });

  next();
}
