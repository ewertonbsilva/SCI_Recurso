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
        
        // Converte id_ubm para número se for string
        const id_ubm_number = id_ubm ? (typeof id_ubm === 'string' ? id_ubm : String(id_ubm)) : null;
        
        await getConnection().query(
            'INSERT INTO militares (matricula, nome_completo, id_posto_grad, nome_guerra, rg, id_forca, cpoe, mergulhador, restricao_medica, desc_rest_med, id_ubm) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [matricula, nome_completo, id_posto_grad, nome_guerra, rg || null, id_forca, cpoe ? 'Y' : 'N', mergulhador ? 'Y' : 'N', restricao_medica ? 'Y' : 'N', desc_rest_med || null, id_ubm_number]
        );
        res.json({ matricula, ...req.body });
    } catch (err) { next(err); }
});

// PUT /api/militares/:matricula
router.put('/:matricula', async (req: any, res: any, next: any) => {
    try {
        const { matricula } = req.params;
        const { nome_completo, id_posto_grad, nome_guerra, rg, id_forca, cpoe, mergulhador, restricao_medica, desc_rest_med, id_ubm } = req.body;
        
        // Converte id_ubm para número se for string
        const id_ubm_number = id_ubm ? (typeof id_ubm === 'string' ? id_ubm : String(id_ubm)) : null;
        
        await getConnection().query(
            'UPDATE militares SET nome_completo = ?, id_posto_grad = ?, nome_guerra = ?, rg = ?, id_forca = ?, cpoe = ?, mergulhador = ?, restricao_medica = ?, desc_rest_med = ?, id_ubm = ? WHERE matricula = ?',
            [nome_completo, id_posto_grad, nome_guerra, rg || null, id_forca, cpoe ? 'Y' : 'N', mergulhador ? 'Y' : 'N', restricao_medica ? 'Y' : 'N', desc_rest_med || null, id_ubm_number, matricula]
        );
        
        res.json({ matricula, ...req.body });
    } catch (err) { next(err); }
});

// DELETE /api/militares/:matricula
router.delete('/:matricula', async (req: any, res: any, next: any) => {
    try {
        const { matricula } = req.params;
        await getConnection().query('DELETE FROM militares WHERE matricula = ?', [matricula]);
        res.json({ message: 'Militar deletado com sucesso' });
    } catch (err) { next(err); }
});

export default router;
