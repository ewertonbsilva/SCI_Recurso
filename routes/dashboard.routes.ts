import { Router } from 'express';
import { getConnection } from '../db';
import { authenticateToken } from '../auth';

const router = Router();

// Aplica autenticação em todas as rotas do dashboard e lookups
router.use(authenticateToken);

// ── Lookup tables ──────────────────────────────────────────────────────────

// GET /api/postos-grad
router.get('/postos-grad', async (req: any, res: any, next: any) => {
    try {
        const result = await getConnection().query('SELECT * FROM posto_grad ORDER BY hierarquia ASC');
        res.json((result as any)[0]);
    } catch (err) { next(err); }
});

// GET /api/forcas
router.get('/forcas', async (req: any, res: any, next: any) => {
    try {
        const result = await getConnection().query('SELECT * FROM forcas ORDER BY nome_forca ASC');
        res.json((result as any)[0]);
    } catch (err) { next(err); }
});

// GET /api/ubms
router.get('/ubms', async (req: any, res: any, next: any) => {
    try {
        const result = await getConnection().query('SELECT * FROM ubms ORDER BY nome_ubm ASC');
        res.json((result as any)[0]);
    } catch (err) { next(err); }
});

// POST /api/ubms
router.post('/ubms', async (req: any, res: any, next: any) => {
    try {
        const { nome_ubm } = req.body;
        const idResult = await getConnection().query('CALL sp_gerar_id_ubm()');
        const id = idResult[0][0].id_ubm;
        await getConnection().query('INSERT INTO ubms (id_ubm, nome_ubm) VALUES (?, ?)', [id, nome_ubm]);
        res.json({ id_ubm: id, nome_ubm });
    } catch (err) { next(err); }
});

// GET /api/orgaos-origem
router.get('/orgaos-origem', async (req: any, res: any, next: any) => {
    try {
        const result = await getConnection().query('SELECT * FROM orgaos_origem ORDER BY nome_orgao ASC');
        res.json((result as any)[0]);
    } catch (err) { next(err); }
});

router.get('/dashboard', async (req: any, res: any, next: any) => {
    try {
        const result = await getConnection().query('CALL sp_dashboard_geral()');
        res.json(result[0][0]);
    } catch (err) { next(err); }
});

// GET /api/disponibilidade
router.get('/disponibilidade', async (req: any, res: any, next: any) => {
    try {
        const { data, periodo } = req.query;
        if (!data || !periodo) {
            return res.status(400).json({ error: 'Parâmetros data e periodo são obrigatórios' });
        }
        const result = await getConnection().query('CALL sp_verificar_disponibilidade(?, ?)', [data, periodo]);
        res.json(result[0]);
    } catch (err) { next(err); }
});

// GET /api/sp/gerar-id/:tipo
router.get('/sp/gerar-id/:tipo', async (req: any, res: any, next: any) => {
    try {
        const { tipo } = req.params;
        const spMap: Record<string, string> = {
            turno: 'sp_gerar_id_turno',
            civil: 'sp_gerar_id_civil',
            atestado: 'sp_gerar_id_atestado',
        };
        if (!spMap[tipo]) {
            return res.status(400).json({ error: 'Tipo inválido. Use: turno, civil ou atestado' });
        }
        const result = await getConnection().query(`CALL ${spMap[tipo]}()`);
        res.json({ [`id_${tipo}`]: result[0][0][`id_${tipo}`] });
    } catch (err) { next(err); }
});

// GET /api/sp/efetivo-disponivel
router.get('/sp/efetivo-disponivel', async (req: any, res: any, next: any) => {
    try {
        const { data, periodo } = req.query;
        const result = await getConnection().query('CALL sp_efetivo_disponivel(?, ?)', [data, periodo]);
        res.json(result[0]);
    } catch (err) { next(err); }
});

// GET /api/vw/efetivo-disponivel
router.get('/vw/efetivo-disponivel', async (req: any, res: any, next: any) => {
    try {
        const result = await getConnection().query('SELECT * FROM vw_efetivo_disponivel ORDER BY nome_completo');
        res.json((result as any)[0]);
    } catch (err) { next(err); }
});

// GET /api/vw/resumo-turnos
router.get('/vw/resumo-turnos', async (req: any, res: any, next: any) => {
    try {
        const result = await getConnection().query('SELECT * FROM vw_resumo_turnos ORDER BY data DESC, periodo DESC');
        res.json((result as any)[0]);
    } catch (err) { next(err); }
});

// GET /api/vw/logs-recentes
router.get('/vw/logs-recentes', async (req: any, res: any, next: any) => {
    try {
        const result = await getConnection().query('SELECT * FROM vw_logs_recentes ORDER BY timestamp DESC');
        res.json((result as any)[0]);
    } catch (err) { next(err); }
});

// GET /api/vw/militares-restricoes
router.get('/vw/militares-restricoes', async (req: any, res: any, next: any) => {
    try {
        const result = await getConnection().query('SELECT * FROM vw_militares_restricoes ORDER BY data_inicio DESC');
        res.json((result as any)[0]);
    } catch (err) { next(err); }
});

// GET /api/vw/resumo-civis-turno
router.get('/vw/resumo-civis-turno', async (req: any, res: any, next: any) => {
    try {
        const result = await getConnection().query('SELECT * FROM vw_resumo_civis_turno ORDER BY data DESC, periodo DESC');
        res.json((result as any)[0]);
    } catch (err) { next(err); }
});

// GET /api/vw/resumo-militares-turno
router.get('/vw/resumo-militares-turno', async (req: any, res: any, next: any) => {
    try {
        const result = await getConnection().query('SELECT * FROM vw_resumo_militares_turno ORDER BY data DESC, periodo DESC');
        res.json((result as any)[0]);
    } catch (err) { next(err); }
});

// GET /api/database-objects
router.get('/database-objects', async (req: any, res: any, next: any) => {
    try {
        const [procedures] = await getConnection().query(`SELECT 'PROCEDURES' as object_type, ROUTINE_NAME as name, CREATED, LAST_ALTERED FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_SCHEMA = 'sci_recurso' AND ROUTINE_TYPE = 'PROCEDURE'`);
        const [triggers] = await getConnection().query(`SELECT 'TRIGGERS' as object_type, TRIGGER_NAME as name, CREATED, ACTION_TIMING, EVENT_MANIPULATION FROM INFORMATION_SCHEMA.TRIGGERS WHERE TRIGGER_SCHEMA = 'sci_recurso'`);
        const [views] = await getConnection().query(`SELECT 'VIEWS' as object_type, TABLE_NAME as name, CREATED, LAST_ALTERED FROM INFORMATION_SCHEMA.VIEWS WHERE TABLE_SCHEMA = 'sci_recurso'`);
        const [functions] = await getConnection().query(`SELECT 'FUNCTIONS' as object_type, ROUTINE_NAME as name, CREATED, LAST_ALTERED FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_SCHEMA = 'sci_recurso' AND ROUTINE_TYPE = 'FUNCTION'`);
        const [tables] = await getConnection().query(`SELECT 'TABLES' as object_type, TABLE_NAME as name, CREATE_TIME, UPDATE_TIME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'sci_recurso' AND TABLE_TYPE = 'BASE TABLE'`);
        res.json({ procedures, triggers, views, functions, tables });
    } catch (err) { next(err); }
});

export default router;
