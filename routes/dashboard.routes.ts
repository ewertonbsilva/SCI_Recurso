import { Router } from 'express';
import { getConnection } from '../db';
import { authenticateToken } from '../auth';
import { LogService } from '../services/logService';

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

// POST /api/postos-grad
router.post('/postos-grad', async (req: any, res: any, next: any) => {
    try {
        const { nome_posto_grad, hierarquia } = req.body;
        const nomeUppercase = nome_posto_grad.toUpperCase();
        
        const [result] = await getConnection().query(
            'INSERT INTO posto_grad (nome_posto_grad, hierarquia) VALUES (?, ?)',
            [nomeUppercase, hierarquia]
        );
        const [newPosto] = await getConnection().query(
            'SELECT * FROM posto_grad ORDER BY id_posto_grad DESC LIMIT 1'
        );
        
        await LogService.logDetalhado({
            usuario: req.user?.nome || 'Usuário não identificado',
            acao: 'CREATE',
            entidade: 'posto_grad',
            registro_id: (newPosto as any)[0]?.id_posto_grad?.toString(),
            descricao: `Criado posto/graduação ${nomeUppercase}`,
            ip_address: req.ip as string | undefined,
            user_agent: req.get('User-Agent') as string | undefined,
            dados_novos: (newPosto as any)[0]
        });

        res.status(201).json(newPosto[0]);
    } catch (err) { next(err); }
});

// PUT /api/postos-grad/:id
router.put('/postos-grad/:id', async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;
        const { nome_posto_grad, hierarquia } = req.body;
        const nomeUppercase = nome_posto_grad.toUpperCase();
        
        const [dadosAntigosResult] = await getConnection().query('SELECT * FROM posto_grad WHERE id_posto_grad = ?', [id]);
        const dadosAntigos = (dadosAntigosResult as any)[0];
        
        const [result] = await getConnection().query(
            'UPDATE posto_grad SET nome_posto_grad = ?, hierarquia = ? WHERE id_posto_grad = ?',
            [nomeUppercase, hierarquia, id]
        );
        
        if ((result as any).affectedRows === 0) {
            return res.status(404).json({ error: 'Posto/Grad not found' });
        }
        
        const [updatedPosto] = await getConnection().query(
            'SELECT * FROM posto_grad WHERE id_posto_grad = ?',
            [id]
        );
        
        // Construir descrição detalhada apenas para campos relevantes
        let descricao = `Atualizado posto/graduação ${nomeUppercase}`;
        const alteracoes = [];
        
        if (dadosAntigos && dadosAntigos.nome_posto_grad !== nomeUppercase) {
            alteracoes.push(`nome_posto_grad: "${dadosAntigos.nome_posto_grad}" → "${nomeUppercase}"`);
        }
        
        if (dadosAntigos && dadosAntigos.hierarquia !== hierarquia) {
            alteracoes.push(`hierarquia: "${dadosAntigos.hierarquia}" → "${hierarquia}"`);
        }
        
        if (alteracoes.length > 0) {
            descricao += ` | Alterações: ${alteracoes.join(', ')}`;
        }
        
        await LogService.log({
            usuario: req.user?.nome || 'Usuário não identificado',
            acao: 'UPDATE',
            entidade: 'posto_grad',
            registro_id: id,
            descricao: descricao,
            ip_address: req.ip as string | undefined,
            user_agent: req.get('User-Agent') as string | undefined
        });

        res.json(updatedPosto[0]);
    } catch (err) { next(err); }
});

// DELETE /api/postos-grad/:id
router.delete('/postos-grad/:id', async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;
        
        const [dadosAntigosResult] = await getConnection().query('SELECT * FROM posto_grad WHERE id_posto_grad = ?', [id]);
        const dadosAntigos = (dadosAntigosResult as any)[0];
        
        const [result] = await getConnection().query(
            'DELETE FROM posto_grad WHERE id_posto_grad = ?',
            [id]
        );
        
        if ((result as any).affectedRows === 0) {
            return res.status(404).json({ error: 'Posto/Grad not found' });
        }
        
        await LogService.logDetalhado({
            usuario: req.user?.nome || 'Usuário não identificado',
            acao: 'DELETE',
            entidade: 'posto_grad',
            registro_id: id,
            descricao: `Excluído posto/graduação ${dadosAntigos?.nome_posto_grad || id}`,
            ip_address: req.ip as string | undefined,
            user_agent: req.get('User-Agent') as string | undefined,
            dados_antigos: dadosAntigos
        });

        res.json({ message: 'Posto/Grad deleted successfully' });
    } catch (err) { next(err); }
});

// GET /api/forcas
router.get('/forcas', async (req: any, res: any, next: any) => {
    try {
        const result = await getConnection().query('SELECT * FROM forcas ORDER BY nome_forca ASC');
        res.json((result as any)[0]);
    } catch (err) { next(err); }
});

// POST /api/forcas
router.post('/forcas', async (req: any, res: any, next: any) => {
    try {
        const { nome_forca } = req.body;
        const nomeUppercase = nome_forca.toUpperCase();
        
        const [result] = await getConnection().query(
            'INSERT INTO forcas (nome_forca) VALUES (?)',
            [nomeUppercase]
        );
        const [newForca] = await getConnection().query(
            'SELECT * FROM forcas ORDER BY id_forca DESC LIMIT 1'
        );
        
        await LogService.logDetalhado({
            usuario: req.user?.nome || 'Usuário não identificado',
            acao: 'CREATE',
            entidade: 'forcas',
            registro_id: (newForca as any)[0]?.id_forca?.toString(),
            descricao: `Criada força ${nomeUppercase}`,
            ip_address: req.ip as string | undefined,
            user_agent: req.get('User-Agent') as string | undefined,
            dados_novos: (newForca as any)[0]
        });

        res.status(201).json(newForca[0]);
    } catch (err) { next(err); }
});

// PUT /api/forcas/:id
router.put('/forcas/:id', async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;
        const { nome_forca } = req.body;
        const nomeUppercase = nome_forca.toUpperCase();
        
        const [dadosAntigosResult] = await getConnection().query('SELECT * FROM forcas WHERE id_forca = ?', [id]);
        const dadosAntigos = (dadosAntigosResult as any)[0];
        
        const [result] = await getConnection().query(
            'UPDATE forcas SET nome_forca = ? WHERE id_forca = ?',
            [nomeUppercase, id]
        );
        
        if ((result as any).affectedRows === 0) {
            return res.status(404).json({ error: 'Força not found' });
        }
        
        const [updatedForca] = await getConnection().query(
            'SELECT * FROM forcas WHERE id_forca = ?',
            [id]
        );
        
        // Construir descrição detalhada apenas para campos relevantes
        let descricao = `Atualizada força ${nomeUppercase}`;
        if (dadosAntigos && dadosAntigos.nome_forca !== nomeUppercase) {
            descricao += ` | Alterações: nome_forca: "${dadosAntigos.nome_forca}" → "${nomeUppercase}"`;
        }
        
        await LogService.log({
            usuario: req.user?.nome || 'Usuário não identificado',
            acao: 'UPDATE',
            entidade: 'forcas',
            registro_id: id,
            descricao: descricao,
            ip_address: req.ip as string | undefined,
            user_agent: req.get('User-Agent') as string | undefined
        });

        res.json(updatedForca[0]);
    } catch (err) { next(err); }
});

// DELETE /api/forcas/:id
router.delete('/forcas/:id', async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;
        
        const [dadosAntigosResult] = await getConnection().query('SELECT * FROM forcas WHERE id_forca = ?', [id]);
        const dadosAntigos = (dadosAntigosResult as any)[0];
        
        const [result] = await getConnection().query(
            'DELETE FROM forcas WHERE id_forca = ?',
            [id]
        );
        
        if ((result as any).affectedRows === 0) {
            return res.status(404).json({ error: 'Força not found' });
        }
        
        await LogService.logDetalhado({
            usuario: req.user?.nome || 'Usuário não identificado',
            acao: 'DELETE',
            entidade: 'forcas',
            registro_id: id,
            descricao: `Excluída força ${dadosAntigos?.nome_forca || id}`,
            ip_address: req.ip as string | undefined,
            user_agent: req.get('User-Agent') as string | undefined,
            dados_antigos: dadosAntigos
        });

        res.json({ message: 'Força deleted successfully' });
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
        const id = (idResult as any)[0][0].id_ubm;
        await getConnection().query('INSERT INTO ubms (id_ubm, nome_ubm) VALUES (?, ?)', [id, nome_ubm]);
        
        await LogService.logDetalhado({
            usuario: req.user?.nome || 'Usuário não identificado',
            acao: 'CREATE',
            entidade: 'ubms',
            registro_id: id?.toString(),
            descricao: `Criada UBM ${nome_ubm}`,
            ip_address: req.ip as string | undefined,
            user_agent: req.get('User-Agent') as string | undefined,
            dados_novos: { id_ubm: id, nome_ubm }
        });

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

// POST /api/orgaos-origem
router.post('/orgaos-origem', async (req: any, res: any, next: any) => {
    try {
        const { nome_orgao } = req.body;
        const nomeUppercase = nome_orgao.toUpperCase();
        
        const [result] = await getConnection().query(
            'INSERT INTO orgaos_origem (nome_orgao) VALUES (?)',
            [nomeUppercase]
        );
        const [newOrgao] = await getConnection().query(
            'SELECT * FROM orgaos_origem ORDER BY id_orgao_origem DESC LIMIT 1'
        );
        
        await LogService.logDetalhado({
            usuario: req.user?.nome || 'Usuário não identificado',
            acao: 'CREATE',
            entidade: 'orgaos_origem',
            registro_id: (newOrgao as any)[0]?.id_orgao_origem?.toString(),
            descricao: `Criado órgão de origem ${nomeUppercase}`,
            ip_address: req.ip as string | undefined,
            user_agent: req.get('User-Agent') as string | undefined,
            dados_novos: (newOrgao as any)[0]
        });

        res.status(201).json((newOrgao as any)[0]);
    } catch (err) { next(err); }
});

// PUT /api/orgaos-origem/:id
router.put('/orgaos-origem/:id', async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;
        const { nome_orgao } = req.body;
        const nomeUppercase = nome_orgao.toUpperCase();
        
        const [dadosAntigosResult] = await getConnection().query('SELECT * FROM orgaos_origem WHERE id_orgao_origem = ?', [id]);
        const dadosAntigos = (dadosAntigosResult as any)[0];
        
        const [result] = await getConnection().query(
            'UPDATE orgaos_origem SET nome_orgao = ? WHERE id_orgao_origem = ?',
            [nomeUppercase, id]
        );
        
        if ((result as any).affectedRows === 0) {
            return res.status(404).json({ error: 'Orgão not found' });
        }
        
        const [updatedOrgao] = await getConnection().query(
            'SELECT * FROM orgaos_origem WHERE id_orgao_origem = ?',
            [id]
        );
        
        // Construir descrição detalhada apenas para campos relevantes
        let descricao = `Atualizado órgão de origem ${nomeUppercase}`;
        if (dadosAntigos && dadosAntigos.nome_orgao !== nomeUppercase) {
            descricao += ` | Alterações: nome_orgao: "${dadosAntigos.nome_orgao}" → "${nomeUppercase}"`;
        }
        
        await LogService.log({
            usuario: req.user?.nome || 'Usuário não identificado',
            acao: 'UPDATE',
            entidade: 'orgaos_origem',
            registro_id: id?.toString(),
            descricao: descricao,
            ip_address: req.ip as string | undefined,
            user_agent: req.get('User-Agent') as string | undefined
        });

        res.json((updatedOrgao as any)[0]);
    } catch (err) { next(err); }
});

// DELETE /api/orgaos-origem/:id
router.delete('/orgaos-origem/:id', async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;
        
        const [dadosAntigosResult] = await getConnection().query('SELECT * FROM orgaos_origem WHERE id_orgao_origem = ?', [id]);
        const dadosAntigos = (dadosAntigosResult as any)[0];
        
        const [result] = await getConnection().query(
            'DELETE FROM orgaos_origem WHERE id_orgao_origem = ?',
            [id]
        );
        
        if ((result as any).affectedRows === 0) {
            return res.status(404).json({ error: 'Orgão not found' });
        }
        
        await LogService.logDetalhado({
            usuario: req.user?.nome || 'Usuário não identificado',
            acao: 'DELETE',
            entidade: 'orgaos_origem',
            registro_id: id?.toString(),
            descricao: `Excluído órgão de origem ${dadosAntigos?.nome_orgao || id}`,
            ip_address: req.ip as string | undefined,
            user_agent: req.get('User-Agent') as string | undefined,
            dados_antigos: dadosAntigos
        });

        res.json({ message: 'Orgão deleted successfully' });
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
