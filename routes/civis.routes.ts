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
        const civis = (result as any)[0];
        res.json(civis.map((c: any) => ({
            ...c,
            motorista: c.motorista === 'Y'
        })));
    } catch (err) { next(err); }
});

// POST /api/civis
router.post('/', async (req: any, res: any, next: any) => {
    try {
        const { id_civil, nome_completo, contato, id_orgao_origem, motorista, modelo_veiculo, placa_veiculo } = req.body;
        await getConnection().query(
            'INSERT INTO civis (id_civil, nome_completo, contato, id_orgao_origem, motorista, modelo_veiculo, placa_veiculo) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id_civil, nome_completo, contato, id_orgao_origem, motorista ? 'Y' : 'N', modelo_veiculo || null, placa_veiculo || null]
        );
        res.json({ id_civil, ...req.body });
    } catch (err) { next(err); }
});

// PUT /api/civis/:id
router.put('/:id', async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;
        const { nome_completo, contato, id_orgao_origem, motorista, modelo_veiculo, placa_veiculo } = req.body;
        
        await getConnection().query(
            'UPDATE civis SET nome_completo = ?, contato = ?, id_orgao_origem = ?, motorista = ?, modelo_veiculo = ?, placa_veiculo = ? WHERE id_civil = ?',
            [nome_completo, contato, id_orgao_origem, motorista ? 'Y' : 'N', modelo_veiculo || null, placa_veiculo || null, id]
        );
        
        res.json({ id_civil: id, ...req.body });
    } catch (err) { next(err); }
});

// DELETE /api/civis/:id
router.delete('/:id', async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;
        await getConnection().query('DELETE FROM civis WHERE id_civil = ?', [id]);
        res.json({ message: 'Civil deletado com sucesso' });
    } catch (err) { next(err); }
});

export default router;
