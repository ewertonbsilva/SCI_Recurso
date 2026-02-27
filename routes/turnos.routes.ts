import { Router } from 'express';
import { getConnection } from '../db';
import { authenticateToken } from '../auth';
import { validateBody, turnoSchema, chamadaMilitarSchema, chamadaMilitarUpdateSchema } from '../middleware/validate';

const router = Router();

// Exige autenticação em todas as rotas operacionais
router.use(authenticateToken);

// GET /api/turnos
router.get('/', async (req: any, res: any, next: any) => {
    try {
        const result = await getConnection().query(`
      SELECT t.*, (SELECT COUNT(*) FROM equipes e WHERE e.id_turno = t.id_turno) as total_equipes
      FROM turnos t ORDER BY t.data DESC
    `);
        res.json((result as any)[0]);
    } catch (err) { next(err); }
});

// POST /api/sp/criar-turno
router.post('/sp/criar-turno', validateBody(turnoSchema), async (req: any, res: any, next: any) => {
    try {
        const { data, periodo } = req.body;
        const result = await getConnection().query('CALL sp_criar_turno(?, ?)', [data, periodo]);
        res.json(result[0][0]);
    } catch (err) { next(err); }
});

// GET /api/chamada-militar/:idTurno
router.get('/chamada-militar/:idTurno', async (req: any, res: any, next: any) => {
    try {
        const { idTurno } = req.params;
        const result = await getConnection().query(
            'SELECT cm.*, m.nome_completo, pg.nome_posto_grad, m.nome_guerra FROM chamada_militar cm JOIN militares m ON cm.matricula = m.matricula LEFT JOIN posto_grad pg ON m.id_posto_grad = pg.id_posto_grad WHERE cm.id_turno = ?',
            [idTurno]
        );
        res.json((result as any)[0]);
    } catch (err) { next(err); }
});

// POST /api/chamada-militar
router.post('/chamada-militar', validateBody(chamadaMilitarSchema), async (req: any, res: any, next: any) => {
    try {
        const { id_chamada_militar, id_turno, matricula, funcao, presenca, obs } = req.body;

        if (!id_chamada_militar || !id_turno || !matricula) {
            return res.status(400).json({ error: 'Campos obrigatórios: id_chamada_militar, id_turno, matricula' });
        }

        const [turnoCheck] = await getConnection().query('SELECT id_turno FROM turnos WHERE id_turno = ?', [id_turno]);
        if (!Array.isArray(turnoCheck) || turnoCheck.length === 0) {
            return res.status(400).json({ error: 'Turno não encontrado', id_turno });
        }

        const [militarCheck] = await getConnection().query('SELECT matricula FROM militares WHERE matricula = ?', [matricula]);
        if (!Array.isArray(militarCheck) || militarCheck.length === 0) {
            return res.status(400).json({ error: 'Militar não encontrado', matricula });
        }

        const [duplicateCheck] = await getConnection().query(
            'SELECT id_chamada_militar FROM chamada_militar WHERE id_turno = ? AND matricula = ?',
            [id_turno, matricula]
        );
        if (Array.isArray(duplicateCheck) && duplicateCheck.length > 0) {
            return res.status(400).json({ error: 'Militar já escalado neste turno' });
        }

        await getConnection().query(
            'INSERT INTO chamada_militar (id_turno, matricula, id_chamada_militar, funcao, presenca, obs) VALUES (?, ?, ?, ?, ?, ?)',
            [id_turno, matricula, id_chamada_militar, funcao || 'Combatente', presenca !== undefined ? (presenca ? 1 : 0) : 1, obs || null]
        );
        res.json({ id_chamada_militar, ...req.body });
    } catch (err) { next(err); }
});

// PUT /api/chamada-militar/:id
router.put('/chamada-militar/:id', validateBody(chamadaMilitarUpdateSchema), async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;
        const { id_turno, matricula, funcao, presenca, obs } = req.body;
        await getConnection().query(
            'UPDATE chamada_militar SET id_turno = ?, matricula = ?, funcao = ?, presenca = ?, obs = ? WHERE id_chamada_militar = ?',
            [id_turno, matricula, funcao, presenca, obs, id]
        );
        res.json({ id_chamada_militar: id, ...req.body });
    } catch (err) { next(err); }
});

// DELETE /api/chamada-militar/:id
router.delete('/chamada-militar/:id', async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;
        await getConnection().query('DELETE FROM chamada_militar WHERE id_chamada_militar = ?', [id]);
        res.json({ message: 'Chamada militar removida com sucesso' });
    } catch (err) { next(err); }
});

// GET /api/chamada-civil/:idTurno
router.get('/chamada-civil/:idTurno', async (req: any, res: any, next: any) => {
    try {
        const { idTurno } = req.params;
        const result = await getConnection().query(
            'SELECT cc.*, c.nome_completo, c.contato, o.nome_orgao FROM chamada_civil cc JOIN civis c ON cc.id_civil = c.id_civil LEFT JOIN orgaos_origem o ON c.id_orgao_origem = o.id_orgao_origem WHERE cc.id_turno = ?',
            [idTurno]
        );
        res.json(result[0]);
    } catch (err) { next(err); }
});

// POST /api/chamada-civil
router.post('/chamada-civil', async (req: any, res: any, next: any) => {
    try {
        const { id_chamada_civil, id_turno, id_civil, quant_civil } = req.body;
        await getConnection().query(
            'INSERT INTO chamada_civil (id_chamada_civil, id_turno, id_civil, quant_civil) VALUES (?, ?, ?, ?)',
            [id_chamada_civil, id_turno, id_civil, quant_civil]
        );
        res.json({ id_chamada_civil, ...req.body });
    } catch (err) { next(err); }
});

// PUT /api/chamada-civil/:id
router.put('/chamada-civil/:id', async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const fields: string[] = [];
        const values: any[] = [];

        if (updates.id_turno !== undefined) { fields.push('id_turno = ?'); values.push(updates.id_turno); }
        if (updates.id_civil !== undefined) { fields.push('id_civil = ?'); values.push(updates.id_civil); }
        if (updates.quant_civil !== undefined) { fields.push('quant_civil = ?'); values.push(updates.quant_civil); }

        if (fields.length === 0) {
            return res.status(400).json({ error: 'Nenhum campo fornecido para atualização' });
        }
        values.push(id);

        const result = await getConnection().query(`UPDATE chamada_civil SET ${fields.join(', ')} WHERE id_chamada_civil = ?`, values);
        if ((result[0] as any).affectedRows === 0) {
            return res.status(404).json({ error: 'Chamada civil não encontrada' });
        }

        const [updated] = await getConnection().query(
            'SELECT cc.*, c.nome_completo, c.contato, o.nome_orgao FROM chamada_civil cc JOIN civis c ON cc.id_civil = c.id_civil LEFT JOIN orgaos_origem o ON c.id_orgao_origem = o.id_orgao_origem WHERE cc.id_chamada_civil = ?',
            [id]
        );
        res.json(updated[0]);
    } catch (err) { next(err); }
});

// DELETE /api/chamada-civil/:id
router.delete('/chamada-civil/:id', async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;
        const result = await getConnection().query('DELETE FROM chamada_civil WHERE id_chamada_civil = ?', [id]);
        if ((result[0] as any).affectedRows === 0) {
            return res.status(404).json({ error: 'Chamada civil não encontrada' });
        }
        res.json({ message: 'Chamada civil removida com sucesso' });
    } catch (err) { next(err); }
});

// GET /api/equipes/:idTurno
router.get('/equipes/:idTurno', async (req: any, res: any, next: any) => {
    try {
        const { idTurno } = req.params;
        const result = await getConnection().query(
            `SELECT e.*, t.data as turno_data, t.periodo as turno_periodo,
              cm.matricula as matricula_militar, m.nome_guerra as nome_militar, pg.nome_posto_grad,
              cc.quant_civil, cc.id_civil, c.nome_completo as nome_motorista, c.modelo_veiculo as vtr_modelo, c.contato as tel_mot,
              (SELECT COUNT(*) FROM componentes_equipe ce WHERE ce.id_equipe = e.id_equipe) as total_componentes
       FROM equipes e
       LEFT JOIN turnos t ON e.id_turno = t.id_turno
       LEFT JOIN chamada_militar cm ON e.id_chamada_militar = cm.id_chamada_militar
       LEFT JOIN militares m ON cm.matricula = m.matricula
       LEFT JOIN posto_grad pg ON m.id_posto_grad = pg.id_posto_grad
       LEFT JOIN chamada_civil cc ON e.id_chamada_civil = cc.id_chamada_civil
       LEFT JOIN civis c ON cc.id_civil = c.id_civil
       WHERE e.id_turno = ?`,
            [idTurno]
        ) as any[];
        res.json(result[0]);
    } catch (err) { next(err); }
});

// POST /api/equipes
router.post('/equipes', async (req: any, res: any, next: any) => {
    try {
        const { id_turno, id_chamada_militar, id_chamada_civil, nome_equipe, status, total_efetivo, bairro } = req.body;
        let efetivo = total_efetivo || 0;
        if (!efetivo && id_chamada_civil) {
            const [civilData] = await getConnection().query('SELECT quant_civil FROM chamada_civil WHERE id_chamada_civil = ?', [id_chamada_civil]) as any[];
            if (Array.isArray(civilData) && civilData.length > 0) efetivo = civilData[0].quant_civil || 0;
        }
        if (!efetivo && id_chamada_militar) efetivo = 1;

        const result = await getConnection().query(
            'INSERT INTO equipes (id_turno, id_chamada_militar, id_chamada_civil, nome_equipe, status, total_efetivo, bairro) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id_turno, id_chamada_militar, id_chamada_civil, nome_equipe || 'Equipe', status || 'livre', efetivo, bairro || null]
        ) as any;
        const insertId = (result as any).insertId || result[0]?.insertId;
        res.json({ id_equipe: insertId, id_turno, id_chamada_militar, id_chamada_civil, nome_equipe, status: status || 'livre', total_efetivo: efetivo, bairro });
    } catch (err) { next(err); }
});

// PUT /api/equipes/:id
router.put('/equipes/:id', async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const fields: string[] = [];
        const values: any[] = [];

        const allowed = ['id_turno', 'id_chamada_militar', 'id_chamada_civil', 'nome_equipe', 'status', 'total_efetivo', 'bairro'];
        for (const key of allowed) {
            if (updates[key] !== undefined) { fields.push(`${key} = ?`); values.push(updates[key]); }
        }

        if (fields.length === 0) return res.status(400).json({ error: 'Nenhum campo para atualizar' });
        values.push(id);
        await getConnection().query(`UPDATE equipes SET ${fields.join(', ')} WHERE id_equipe = ?`, values);
        res.json({ id_equipe: id, ...updates });
    } catch (err) { next(err); }
});

// DELETE /api/equipes/:id
router.delete('/equipes/:id', async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;
        await getConnection().query('DELETE FROM equipes WHERE id_equipe = ?', [id]);
        res.json({ message: 'Equipe removida com sucesso' });
    } catch (err) { next(err); }
});

// GET /api/equipes/componentes/:idEquipe
router.get('/equipes/componentes/:idEquipe', async (req: any, res: any, next: any) => {
    try {
        const { idEquipe } = req.params;
        const result = await getConnection().query(`
      SELECT ce.*, m.nome_guerra, pg.nome_posto_grad, m.matricula
      FROM componentes_equipe ce
      JOIN chamada_militar cm ON ce.id_chamada_militar = cm.id_chamada_militar
      JOIN militares m ON cm.matricula = m.matricula
      LEFT JOIN posto_grad pg ON m.id_posto_grad = pg.id_posto_grad
      WHERE ce.id_equipe = ?
    `, [idEquipe]);
        res.json((result as any)[0]);
    } catch (err) { next(err); }
});

// POST /api/equipes/componentes
router.post('/equipes/componentes', async (req: any, res: any, next: any) => {
    try {
        const { id_equipe, id_chamada_militar, id_turno } = req.body;
        const id = `comp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await getConnection().query(
            'INSERT INTO componentes_equipe (id_componente, id_equipe, id_chamada_militar, id_turno) VALUES (?, ?, ?, ?)',
            [id, id_equipe, id_chamada_militar, id_turno]
        );
        res.json({ id_componente: id, ...req.body });
    } catch (err) { next(err); }
});

// DELETE /api/turnos/:id
router.delete('/turnos/:id', async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;
        await getConnection().query('DELETE FROM turnos WHERE id_turno = ?', [id]);
        res.json({ message: 'Turno removido com sucesso' });
    } catch (err) { next(err); }
});

// DELETE /api/equipes/componentes/:id
router.delete('/equipes/componentes/:id', async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;
        await getConnection().query('DELETE FROM componentes_equipe WHERE id_componente = ?', [id]);
        res.json({ message: 'Componente removido com sucesso' });
    } catch (err) { next(err); }
});

export default router;
