import { Router } from 'express';
import { getConnection } from '../db';

const router = Router();

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
            res.status(201).json(newUBM[0]);
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
                res.status(201).json(newUBM[0]);
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
        res.json(updatedUBM[0]);
    } catch (err) { next(err); }
});

// DELETE /api/ubms/:id
router.delete('/:id', async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;
        const [result] = await getConnection().query(
            'DELETE FROM ubms WHERE id_ubm = ?',
            [id]
        );
        
        if ((result as any).affectedRows === 0) {
            return res.status(404).json({ error: 'UBM not found' });
        }
        
        res.json({ message: 'UBM deleted successfully' });
    } catch (err) { next(err); }
});

export default router;
