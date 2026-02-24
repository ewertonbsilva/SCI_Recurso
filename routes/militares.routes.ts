import { Router } from 'express';
import { getConnection } from '../db';
import { authenticateToken } from '../auth';
import { validateBody, militarSchema } from '../middleware/validate';

const router = Router();

// Aplica autenticação em todas as rotas de militares por padrão
router.use(authenticateToken);

// GET /api/militares
router.get('/', async (req: any, res: any, next: any) => {
    try {
        const result = await getConnection().query(
            'SELECT * FROM vw_militares_completo ORDER BY hierarquia ASC, nome_guerra ASC'
        );
        const militares = (result as any)[0];
        res.json(militares.map((m: any) => ({
            ...m,
            cpoe: m.cpoe === 'Y',
            mergulhador: m.mergulhador === 'Y',
            restricao_medica: m.restricao_medica === 'Y',
        })));
    } catch (err) { next(err); }
});

// POST /api/militares
router.post('/', validateBody(militarSchema), async (req: any, res: any, next: any) => {
    try {
        const { matricula, nome_completo, id_posto_grad, nome_guerra, rg, id_forca, cpoe, mergulhador, restricao_medica, desc_rest_med, id_ubm } = req.body;
        await getConnection().query(
            'INSERT INTO militares (matricula, nome_completo, id_posto_grad, nome_guerra, rg, id_forca, cpoe, mergulhador, restricao_medica, desc_rest_med, id_ubm) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [matricula, nome_completo, id_posto_grad, nome_guerra, rg || null, id_forca, cpoe ? 'Y' : 'N', mergulhador ? 'Y' : 'N', restricao_medica ? 'Y' : 'N', desc_rest_med || null, id_ubm || null]
        );
        res.json({ matricula, ...req.body });
    } catch (err) { next(err); }
});

export default router;
