import { Router } from 'express';
import { getConnection } from '../db';
import { hashPassword, comparePassword, generateToken, authenticateToken, AuthRequest } from '../auth';
import { validateBody, authSchema } from '../middleware/validate';

const router = Router();

// POST /api/auth/login
router.post('/login', validateBody(authSchema), async (req: any, res: any, next: any) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
        }

        const result = await getConnection().query('SELECT * FROM usuarios WHERE username = ?', [username]);
        const users = (result as any)[0];
        if (users.length === 0) {
            return res.status(401).json({ error: 'Usuário ou senha inválidos' });
        }

        const user = users[0];
        const isValidPassword = await comparePassword(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Usuário ou senha inválidos' });
        }

        const token = generateToken({ id: user.id, username: user.username, nome: user.nome, role: user.role });
        res.json({ token, user: { id: user.id, username: user.username, nome: user.nome, role: user.role } });
    } catch (err) {
        next(err);
    }
});

// POST /api/auth/register
router.post('/register', async (req: any, res: any, next: any) => {
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

        const token = generateToken({ id: userId, username, nome, role });
        res.status(201).json({ token, user: { id: userId, username, nome, role } });
    } catch (err) {
        next(err);
    }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: AuthRequest, res: any, next: any) => {
    try {
        const result = await getConnection().query(
            'SELECT id, username, nome, role FROM usuarios WHERE id = ?',
            [req.user?.id]
        );
        const users = (result as any)[0];
        if (users.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.json(users[0]);
    } catch (err) {
        next(err);
    }
});

export default router;
