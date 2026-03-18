import { Request, Response, NextFunction } from 'express';
import { LogService } from '../services/logService';

// Cache para capturar dados antigos
const dadosAntigosCache = new Map<string, any>();

/**
 * Middleware para capturar dados antigos antes das alteracoes
 */
export const captureDadosAntigos = (req: Request, res: Response, next: NextFunction) => {
  // Capturar body da requisição
  const originalSend = res.send;
  let bodyData: any = null;
  
  res.send = function(data: any) {
    bodyData = data;
    return originalSend.call(this, data);
  };
  
  res.on('finish', () => {
    // Armazenar dados antigos no cache para PUT e DELETE
    if (req.method === 'PUT' || req.method === 'DELETE') {
      const urlParts = req.url.split('/');
      const entidade = urlParts[2] || 'unknown';
      const registroId = urlParts[3] || 'unknown';
      const cacheKey = `${entidade}_${registroId}`;
      
      if (!dadosAntigosCache.has(cacheKey)) {
        dadosAntigosCache.set(cacheKey, bodyData);
      }
    }
    
    next();
  });
};

/**
 * Middleware para capturar dados novos após as alterações
 */
export const captureDadosNovos = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  let newBodyData: any = null;
  
  res.send = function(data: any) {
    newBodyData = data;
    return originalSend.call(this, data);
  };
  
  res.on('finish', () => {
    // Capturar dados novos após alterações bem-sucedidas
    if (req.method === 'POST' || req.method === 'PUT') {
      const urlParts = req.url.split('/');
      const entidade = urlParts[2] || 'unknown';
      const registroId = urlParts[3] || 'unknown';
      const cacheKey = `${entidade}_${registroId}`;
      
      if (dadosAntigosCache.has(cacheKey)) {
        const dadosAntigos = dadosAntigosCache.get(cacheKey);
        dadosAntigosCache.delete(cacheKey); // Limpar cache após uso
        
        // Armazenar no cache para logs futuros
        const novoCacheKey = `${cacheKey}_novo`;
        dadosAntigosCache.set(novoCacheKey, newBodyData);
      }
    }
    
    next();
  });
};

/**
 * Obter informações do turno atual
 */
export const getTurnoInfo = async (): Promise<string> => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('http://192.168.88.2:3001/api/turnos?hoje=true', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const turnos = await response.json();
      if (turnos.length > 0) {
        const hoje = new Date().toLocaleDateString('pt-BR');
        const turnoHoje = turnos.find((t: any) => {
          const dataTurno = new Date(t.data).toLocaleDateString('pt-BR');
          return dataTurno === hoje;
        });
        
        if (turnoHoje) {
          const turno = turnos.find((t: any) => {
            const dataTurno = new Date(t.data).toLocaleDateString('pt-BR');
            return dataTurno === hoje;
          });
          
          return `Turno do dia ${hoje}: ${turno?.periodo || 'Não identificado'}`;
        }
      }
    }
  } catch (error) {
    console.error('Erro ao obter informações do turno:', error);
    return 'Turno não identificado';
  }
};
