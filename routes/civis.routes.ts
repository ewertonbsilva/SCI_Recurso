import { Router } from 'express';
import { getConnection } from '../db';
import { authenticateToken } from '../auth';

const router = Router();

// Aplica autenticação em todas as rotas de civis
router.use(authenticateToken);

// GET /api/civis
router.get('/', async (req: any, res: any, next: any) => {
    try {
        const result = await getConnection().query('SELECT * FROM vw_civis_completo ORDER BY nome_completo ASC');
        res.json((result as any)[0]);
    } catch (err) { next(err); }
});

export default router;
