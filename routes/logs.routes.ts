import { Router } from 'express';
import { LogService } from '../services/logService';
import { authenticateToken, AuthRequest } from '../auth';
import { getConnection } from '../db';

const router = Router();

// GET /api/logs - Buscar logs com filtros e paginação
router.get('/', authenticateToken, async (req: AuthRequest, res: any, next: any) => {
    try {
        const {
            usuario,
            acao,
            entidade,
            data_inicio,
            data_fim,
            pagina = '1',
            limite = '50'
        } = req.query;

        const offset = (parseInt(pagina as string) - 1) * parseInt(limite as string);

        const filters = {
            usuario: usuario as string,
            acao: acao as string,
            entidade: entidade as string,
            data_inicio: data_inicio as string,
            data_fim: data_fim as string,
            limite: parseInt(limite as string),
            offset
        };

        const [logs, total] = await Promise.all([
            LogService.getLogs(filters),
            LogService.countLogs({
                usuario: usuario as string,
                acao: acao as string,
                entidade: entidade as string,
                data_inicio: data_inicio as string,
                data_fim: data_fim as string
            })
        ]);

        res.json({
            logs,
            total,
            pagina: parseInt(pagina as string),
            limite: parseInt(limite as string),
            total_paginas: Math.ceil(total / parseInt(limite as string))
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/logs/stats - Estatísticas dos logs
router.get('/stats', authenticateToken, async (req: AuthRequest, res: any, next: any) => {
    try {
        const connection = getConnection();
        if (!connection) {
            return res.status(500).json({ error: 'Conexão com banco não disponível' });
        }

        // Estatísticas por ação
        const [acoesStats] = await connection.query(`
            SELECT acao, COUNT(*) as count 
            FROM logs_sistema 
            WHERE data_hora >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY acao
            ORDER BY count DESC
        `);

        // Estatísticas por entidade
        const [entidadesStats] = await connection.query(`
            SELECT entidade, COUNT(*) as count 
            FROM logs_sistema 
            WHERE data_hora >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY entidade
            ORDER BY count DESC
            LIMIT 10
        `);

        // Estatísticas por usuário (top 10)
        const [usuariosStats] = await connection.query(`
            SELECT usuario, COUNT(*) as count 
            FROM logs_sistema 
            WHERE data_hora >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY usuario
            ORDER BY count DESC
            LIMIT 10
        `);

        // Logs das últimas 24 horas
        const [ultimas24h] = await connection.query(`
            SELECT COUNT(*) as count 
            FROM logs_sistema 
            WHERE data_hora >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        `);

        res.json({
            acoes: acoesStats,
            entidades: entidadesStats,
            usuarios: usuariosStats,
            ultimas_24h: (ultimas24h as any)[0].count
        });
    } catch (err) {
        next(err);
    }
});

export default router;
