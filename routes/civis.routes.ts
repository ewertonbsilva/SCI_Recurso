import { Router } from 'express';
import { getConnection } from '../db';
import { authenticateToken } from '../auth';
import { LogService } from '../services/logService';

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
        
        await LogService.logDetalhado({
            usuario: req.user?.nome || 'Usuário não identificado',
            acao: 'CREATE',
            entidade: 'civil',
            registro_id: id_civil,
            descricao: `Criado civil ${nome_completo}`,
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            dados_novos: { id_civil, nome_completo, contato, id_orgao_origem, motorista, modelo_veiculo, placa_veiculo }
        });

        res.json({ id_civil, ...req.body });
    } catch (err) { next(err); }
});

// PUT /api/civis/:id
router.put('/:id', async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;
        const { nome_completo, contato, id_orgao_origem, motorista, modelo_veiculo, placa_veiculo } = req.body;
        
        const [dadosAntigosResult] = await getConnection().query('SELECT * FROM civis WHERE id_civil = ?', [id]);
        const dadosAntigos = (dadosAntigosResult as any)[0];
        
        await getConnection().query(
            'UPDATE civis SET nome_completo = ?, contato = ?, id_orgao_origem = ?, motorista = ?, modelo_veiculo = ?, placa_veiculo = ? WHERE id_civil = ?',
            [nome_completo, contato, id_orgao_origem, motorista ? 'Y' : 'N', modelo_veiculo || null, placa_veiculo || null, id]
        );
        
        await LogService.logDetalhado({
            usuario: req.user?.nome || 'Usuário não identificado',
            acao: 'UPDATE',
            entidade: 'civil',
            registro_id: id,
            descricao: `Atualizado civil ${nome_completo}`,
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            dados_antigos: dadosAntigos,
            dados_novos: { nome_completo, contato, id_orgao_origem, motorista, modelo_veiculo, placa_veiculo }
        });
        
        res.json({ id_civil: id, ...req.body });
    } catch (err) { next(err); }
});

// DELETE /api/civis/:id
router.delete('/:id', async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;

        const [dadosAntigosResult] = await getConnection().query('SELECT * FROM civis WHERE id_civil = ?', [id]);
        const dadosAntigos = (dadosAntigosResult as any)[0];

        await getConnection().query('DELETE FROM civis WHERE id_civil = ?', [id]);

        await LogService.logDetalhado({
            usuario: req.user?.nome || 'Usuário não identificado',
            acao: 'DELETE',
            entidade: 'civil',
            registro_id: id,
            descricao: `Excluído civil ${dadosAntigos?.nome_completo || id}`,
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            dados_antigos: dadosAntigos
        });

        res.json({ message: 'Civil deletado com sucesso' });
    } catch (err) { next(err); }
});

export default router;
