import { Router } from 'express';
import { getConnection } from '../db';
import { hashPassword, authenticateToken, requireRole, AuthRequest } from '../auth';
import { LogService } from '../services/logService';

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
        
        await LogService.logDetalhado({
            usuario: req.user?.nome || 'Usuário não identificado',
            acao: 'CREATE',
            entidade: 'usuario',
            registro_id: userId,
            descricao: `Criado usuário ${username}`,
            ip_address: req.ip as string | undefined,
            user_agent: req.get('User-Agent') as string | undefined,
            dados_novos: { id: userId, username, nome, role }
        });

        res.json({ id: userId, username, nome, role });
    } catch (err) { next(err); }
});

// PUT /api/users/:id  (admin only)
router.put('/users/:id', authenticateToken, requireRole(['Administrador']), async (req: AuthRequest, res: any, next: any) => {
    try {
        const { id } = req.params;
        const { username, nome, password, role } = req.body;
        
        const [dadosAntigosResult] = await getConnection().query('SELECT id, username, nome, role FROM usuarios WHERE id = ?', [id]);
        const dadosAntigos = (dadosAntigosResult as any)[0][0];

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
        
        await LogService.logDetalhado({
            usuario: req.user?.nome || 'Usuário não identificado',
            acao: 'UPDATE',
            entidade: 'usuario',
            registro_id: id as string,
            descricao: `Atualizado usuário ${username}`,
            ip_address: req.ip as string | undefined,
            user_agent: req.get('User-Agent') as string | undefined,
            dados_antigos: dadosAntigos,
            dados_novos: (result as any)[0][0]
        });

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
        
        const [dadosAntigosResult] = await getConnection().query('SELECT id, username, nome, role FROM usuarios WHERE id = ?', [id]);
        const dadosAntigos = (dadosAntigosResult as any)[0][0];

        await getConnection().query('DELETE FROM usuarios WHERE id = ?', [id]);
        
        await LogService.logDetalhado({
            usuario: req.user?.nome || 'Usuário não identificado',
            acao: 'DELETE',
            entidade: 'usuario',
            registro_id: id as string,
            descricao: `Excluído usuário ${dadosAntigos?.nome || dadosAntigos?.username || id}`,
            ip_address: req.ip as string | undefined,
            user_agent: req.get('User-Agent') as string | undefined,
            dados_antigos: dadosAntigos
        });

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
        
        await LogService.logDetalhado({
            usuario: req.user?.nome || 'Usuário não identificado',
            acao: 'UPDATE',
            entidade: 'usuario',
            registro_id: id as string,
            descricao: `Senha redefinida para usuário ID ${id}`,
            ip_address: req.ip as string | undefined,
            user_agent: req.get('User-Agent') as string | undefined
        });

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
        
        // Buscar informações do militar para o log
        const [militarInfo] = await getConnection().query(`
            SELECT m.nome_guerra, m.nome_completo, pg.nome_posto_grad 
            FROM militares m 
            LEFT JOIN posto_grad pg ON m.id_posto_grad = pg.id_posto_grad 
            WHERE m.matricula = ?
        `, [matricula]) as any[];
        
        const id = `atest_${Date.now()}`;
        await getConnection().query(
            'INSERT INTO atestados_medicos (id, matricula, data_inicio, dias, motivo) VALUES (?, ?, ?, ?, ?)',
            [id, matricula, data_inicio, dias, motivo]
        );
        
        // Construir descrição detalhada
        const postoGrad = (Array.isArray(militarInfo) && militarInfo.length > 0 && militarInfo[0].nome_posto_grad) ? `${militarInfo[0].nome_posto_grad} ` : '';
        const nomeMilitar = (Array.isArray(militarInfo) && militarInfo.length > 0) ? (militarInfo[0].nome_guerra || militarInfo[0].nome_completo) : matricula;
        const nomeCompleto = postoGrad + nomeMilitar;
        
        await LogService.logDetalhado({
            usuario: req.user?.nome || 'Usuário não identificado',
            acao: 'CREATE',
            entidade: 'atestados_medicos',
            registro_id: id,
            descricao: `Criado atestado para ${nomeCompleto}`,
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            dados_novos: { id, matricula, data_inicio, dias, motivo }
        });

        res.json({ id, ...req.body });
    } catch (err) { next(err); }
});

// DELETE /api/atestados/:id
router.delete('/atestados/:id', async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;
        
        const [dadosAntigosResult] = await getConnection().query(`
            SELECT a.*, m.nome_guerra, m.nome_completo, pg.nome_posto_grad 
            FROM atestados_medicos a 
            LEFT JOIN militares m ON a.matricula = m.matricula 
            LEFT JOIN posto_grad pg ON m.id_posto_grad = pg.id_posto_grad 
            WHERE a.id = ?
        `, [id]);
        const dadosAntigos = (dadosAntigosResult as any)[0];
        
        await getConnection().query('DELETE FROM atestados_medicos WHERE id = ?', [id]);
        
        // Construir descrição detalhada
        const postoGrad = dadosAntigos?.nome_posto_grad ? `${dadosAntigos.nome_posto_grad} ` : '';
        const nomeMilitar = dadosAntigos?.nome_guerra || dadosAntigos?.nome_completo || dadosAntigos?.matricula || 'matrícula não identificada';
        const nomeCompleto = postoGrad + nomeMilitar;
        
        await LogService.logDetalhado({
            usuario: req.user?.nome || 'Usuário não identificado',
            acao: 'DELETE',
            entidade: 'atestados_medicos',
            registro_id: id,
            descricao: `Removido atestado médico ${id} de ${nomeCompleto}`,
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            dados_antigos: dadosAntigos
        });

        res.json({ message: 'Atestado removido com sucesso' });
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
