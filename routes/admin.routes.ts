import { Router } from 'express';
import { getConnection } from '../db';
import { hashPassword, authenticateToken, requireRole, AuthRequest } from '../auth';

const router = Router();

// GET /api/users  (admin only)
router.get('/users', authenticateToken, requireRole(['Administrador']), async (req: AuthRequest, res: any, next: any) => {
    try {
        const result = await getConnection().query('SELECT id, username, nome, role FROM usuarios ORDER BY username');
        res.json((result as any)[0]);
    } catch (err) { next(err); }
});

// POST /api/users  (admin only)
router.post('/users', authenticateToken, requireRole(['Administrador']), async (req: AuthRequest, res: any, next: any) => {
    try {
        const { username, nome, password, role } = req.body;
        if (!username || !nome || !password || !role) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }
        const existing = await getConnection().query('SELECT id FROM usuarios WHERE username = ?', [username]);
        if ((existing as any)[0].length > 0) {
            return res.status(400).json({ error: 'Nome de usuário já existe' });
        }
        const hashedPassword = await hashPassword(password);
        const userId = `user_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
        await getConnection().query(
            'INSERT INTO usuarios (id, username, nome, password, role) VALUES (?, ?, ?, ?, ?)',
            [userId, username, nome, hashedPassword, role]
        );
        res.json({ id: userId, username, nome, role });
    } catch (err) { next(err); }
});

// PUT /api/users/:id  (admin only)
router.put('/users/:id', authenticateToken, requireRole(['Administrador']), async (req: AuthRequest, res: any, next: any) => {
    try {
        const { id } = req.params;
        const { username, nome, password, role } = req.body;
        let query = 'UPDATE usuarios SET username = ?, nome = ?, role = ?';
        const params: any[] = [username, nome, role];
        if (password && password.trim() !== '') {
            query += ', password = ?';
            params.push(await hashPassword(password));
        }
        query += ' WHERE id = ?';
        params.push(id);
        await getConnection().query(query, params);
        const result = await getConnection().query('SELECT id, username, nome, role FROM usuarios WHERE id = ?', [id]);
        res.json((result as any)[0][0]);
    } catch (err) { next(err); }
});

// DELETE /api/users/:id  (admin only)
router.delete('/users/:id', authenticateToken, requireRole(['Administrador']), async (req: AuthRequest, res: any, next: any) => {
    try {
        const { id } = req.params;
        if (id === req.user?.id) {
            return res.status(400).json({ error: 'Não é possível excluir seu próprio usuário' });
        }
        await getConnection().query('DELETE FROM usuarios WHERE id = ?', [id]);
        res.json({ message: 'Usuário removido com sucesso' });
    } catch (err) { next(err); }
});

// POST /api/users/:id/reset-password  (admin only)
router.post('/users/:id/reset-password', authenticateToken, requireRole(['Administrador']), async (req: AuthRequest, res: any, next: any) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;
        if (!newPassword || newPassword.trim() === '') {
            return res.status(400).json({ error: 'Nova senha é obrigatória' });
        }
        await getConnection().query('UPDATE usuarios SET password = ? WHERE id = ?', [await hashPassword(newPassword), id]);
        res.json({ message: 'Senha redefinida com sucesso' });
    } catch (err) { next(err); }
});

// GET /api/atestados
router.get('/atestados', async (req: any, res: any, next: any) => {
    try {
        const result = await getConnection().query('SELECT * FROM atestados_medicos ORDER BY data_inicio DESC');
        res.json((result as any)[0]);
    } catch (err) { next(err); }
});

// POST /api/atestados
router.post('/atestados', async (req: any, res: any, next: any) => {
    try {
        const { matricula, data_inicio, dias, motivo } = req.body;
        const id = `atest_${Date.now()}`;
        await getConnection().query(
            'INSERT INTO atestados_medicos (id, matricula, data_inicio, dias, motivo) VALUES (?, ?, ?, ?, ?)',
            [id, matricula, data_inicio, dias, motivo]
        );
        res.json({ id, ...req.body });
    } catch (err) { next(err); }
});

// DELETE /api/atestados/:id
router.delete('/atestados/:id', async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;
        await getConnection().query('DELETE FROM atestados_medicos WHERE id = ?', [id]);
        res.json({ message: 'Atestado removido com sucesso' });
    } catch (err) { next(err); }
});

// GET /api/logs
router.get('/logs', async (req: any, res: any, next: any) => {
    try {
        const result = await getConnection().query('SELECT * FROM logs_operacionais ORDER BY timestamp DESC');
        res.json((result as any)[0]);
    } catch (err) { next(err); }
});

// POST /api/logs
router.post('/logs', async (req: any, res: any, next: any) => {
    try {
        const { id, id_turno, timestamp, mensagem, categoria, usuario } = req.body;
        await getConnection().query(
            'INSERT INTO logs_operacionais (id, id_turno, timestamp, mensagem, categoria, usuario) VALUES (?, ?, ?, ?, ?, ?)',
            [id, id_turno, timestamp, mensagem, categoria, usuario]
        );
        res.json({ id, ...req.body });
    } catch (err) { next(err); }
});

// DELETE /api/logs/:id
router.delete('/logs/:id', async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;
        await getConnection().query('DELETE FROM logs_operacionais WHERE id = ?', [id]);
        res.json({ message: 'Log operacional removido com sucesso' });
    } catch (err) { next(err); }
});

// GET /api/debug/militares-structure
router.get('/debug/militares-structure', async (req: any, res: any, next: any) => {
    try {
        const [structure] = await getConnection().query('DESCRIBE militares');
        res.json({ structure });
    } catch (err) { next(err); }
});

// GET /api/debug/chamada-civil-structure
router.get('/debug/chamada-civil-structure', async (req: any, res: any, next: any) => {
    try {
        const [structure] = await getConnection().query('DESCRIBE chamada_civil');
        res.json({ structure });
    } catch (err) { next(err); }
});

// GET /api/debug/chamada-civil-triggers
router.get('/debug/chamada-civil-triggers', async (req: any, res: any, next: any) => {
    try {
        const [triggers] = await getConnection().query("SHOW TRIGGERS LIKE 'chamada_civil%'");
        res.json({ triggers });
    } catch (err) { next(err); }
});

export default router;
