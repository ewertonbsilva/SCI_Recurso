import { Router } from 'express';
import { getConnection } from '../db';
import { authenticateToken } from '../auth';
import { LogService } from '../services/logService';

const router = Router();

router.use(authenticateToken);

// GET /api/ubms
router.get('/', async (req: any, res: any, next: any) => {
    try {
        const [ubms] = await getConnection().query('SELECT * FROM ubms ORDER BY nome_ubm');
        res.json(ubms);
    } catch (err) { next(err); }
});

// POST /api/ubms
router.post('/', async (req: any, res: any, next: any) => {
    try {
        const { id_ubm, nome_ubm } = req.body;
        const nomeUppercase = nome_ubm.toUpperCase();
        
        // Try to insert without ID first (for AUTO_INCREMENT table)
        try {
            const [result] = await getConnection().query(
                'INSERT INTO ubms (nome_ubm) VALUES (?)',
                [nomeUppercase]
            );
            const [newUBM] = await getConnection().query(
                'SELECT * FROM ubms ORDER BY id_ubm DESC LIMIT 1'
            );
            
            await LogService.logDetalhado({
                usuario: req.user?.nome || 'Usuário não identificado',
                acao: 'CREATE',
                entidade: 'ubm',
                registro_id: (newUBM as any)[0]?.id_ubm?.toString(),
                descricao: `Criada UBM ${(newUBM as any)[0]?.nome_ubm}`,
                ip_address: req.ip,
                user_agent: req.get('User-Agent'),
                dados_novos: (newUBM as any)[0]
            });

            res.status(201).json((newUBM as any)[0]);
        } catch (insertError: any) {
            // If that fails, try the old way (for non-AUTO_INCREMENT table)
            if (insertError.code === 'ER_FIELD_SPECIFIED_TWICE' || insertError.message.includes('id_ubm')) {
                const [result] = await getConnection().query(
                    'INSERT INTO ubms (id_ubm, nome_ubm) VALUES (?, ?)',
                    [id_ubm, nomeUppercase]
                );
                const [newUBM] = await getConnection().query(
                    'SELECT * FROM ubms WHERE id_ubm = ?',
                    [id_ubm]
                );
                
                await LogService.logDetalhado({
                    usuario: req.user?.nome || 'Usuário não identificado',
                    acao: 'CREATE',
                    entidade: 'ubm',
                    registro_id: id_ubm?.toString(),
                    descricao: `Criada UBM ${(newUBM as any)[0]?.nome_ubm}`,
                    ip_address: req.ip,
                    user_agent: req.get('User-Agent'),
                    dados_novos: (newUBM as any)[0]
                });

                res.status(201).json((newUBM as any)[0]);
            } else {
                throw insertError;
            }
        }
    } catch (err) { next(err); }
});

// PUT /api/ubms/:id
router.put('/:id', async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;
        const { nome_ubm } = req.body;
        
        const [dadosAntigosResult] = await getConnection().query('SELECT * FROM ubms WHERE id_ubm = ?', [id]);
        const dadosAntigos = (dadosAntigosResult as any)[0];
        
        const [result] = await getConnection().query(
            'UPDATE ubms SET nome_ubm = ? WHERE id_ubm = ?',
            [nome_ubm, id]
        );
        
        if ((result as any).affectedRows === 0) {
            return res.status(404).json({ error: 'UBM not found' });
        }
        
        const [updatedUBM] = await getConnection().query(
            'SELECT * FROM ubms WHERE id_ubm = ?',
            [id]
        );
        
        // Construir descrição detalhada apenas para campos relevantes
        let descricao = `Atualizada UBM ${nome_ubm}`;
        if (dadosAntigos && dadosAntigos.nome_ubm !== nome_ubm) {
            descricao += ` | Alterações: nome_ubm: "${dadosAntigos.nome_ubm}" → "${nome_ubm}"`;
        }
        
        await LogService.log({
            usuario: req.user?.nome || 'Usuário não identificado',
            acao: 'UPDATE',
            entidade: 'ubm',
            registro_id: id?.toString(),
            descricao: descricao,
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
        });
        
        res.json((updatedUBM as any)[0]);
    } catch (err) { next(err); }
});

// DELETE /api/ubms/:id
router.delete('/:id', async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;
        
        const [dadosAntigosResult] = await getConnection().query('SELECT * FROM ubms WHERE id_ubm = ?', [id]);
        const dadosAntigos = (dadosAntigosResult as any)[0];
        
        const [result] = await getConnection().query(
            'DELETE FROM ubms WHERE id_ubm = ?',
            [id]
        );
        
        if ((result as any).affectedRows === 0) {
            return res.status(404).json({ error: 'UBM not found' });
        }
        
        await LogService.logDetalhado({
            usuario: req.user?.nome || 'Usuário não identificado',
            acao: 'DELETE',
            entidade: 'ubm',
            registro_id: id?.toString(),
            descricao: `Excluída UBM ${dadosAntigos?.nome_ubm || id}`,
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            dados_antigos: dadosAntigos
        });
        
        res.json({ message: 'UBM deleted successfully' });
    } catch (err) { next(err); }
});

export default router;
