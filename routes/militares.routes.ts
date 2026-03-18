import { Router } from 'express';
import { getConnection } from '../db';
import { authenticateToken } from '../auth';
import { validateBody, militarSchema } from '../middleware/validate';
import { LogService } from '../services/logService';

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
        
        // Log detalhado da criação do militar
        const usuario = req.user?.nome || 'Usuário não identificado';
        
        await LogService.logDetalhado({
            usuario: usuario,
            acao: 'CREATE',
            entidade: 'militar',
            registro_id: matricula,
            descricao: `Criado militar ${nome_guerra || matricula} - ${nome_completo}`,
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            dados_novos: { matricula, nome_completo, nome_guerra, id_posto_grad, id_ubm }
        });
        
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
        
        // Buscar dados antigos para comparação
        const [dadosAntigosResult] = await getConnection().query(
            'SELECT nome_completo, id_posto_grad, nome_guerra, rg, id_forca, cpoe, mergulhador, restricao_medica, desc_rest_med, id_ubm FROM militares WHERE matricula = ?',
            [matricula]
        );
        const dadosAntigos = (dadosAntigosResult as any)[0];
        
        await getConnection().query(
            'UPDATE militares SET nome_completo = ?, id_posto_grad = ?, nome_guerra = ?, rg = ?, id_forca = ?, cpoe = ?, mergulhador = ?, restricao_medica = ?, desc_rest_med = ?, id_ubm = ? WHERE matricula = ?',
            [nome_completo, id_posto_grad, nome_guerra, rg || null, id_forca, cpoe ? 'Y' : 'N', mergulhador ? 'Y' : 'N', restricao_medica ? 'Y' : 'N', desc_rest_med || null, id_ubm_number, matricula]
        );
        
        // Log detalhado da atualização
        const usuario = req.user?.nome || 'Usuário não identificado';
        const dadosNovos = { nome_completo, id_posto_grad, nome_guerra, rg, id_forca, cpoe, mergulhador, restricao_medica, desc_rest_med, id_ubm };
        
        await LogService.logDetalhado({
            usuario: usuario,
            acao: 'UPDATE',
            entidade: 'militar',
            registro_id: matricula,
            descricao: `Atualizado militar ${nome_guerra || matricula} - ${nome_completo}`,
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            dados_antigos: dadosAntigos,
            dados_novos: dadosNovos
        });
        
        res.json({ matricula, ...req.body });
    } catch (err) { next(err); }
});

// DELETE /api/militares/:matricula
router.delete('/:matricula', async (req: any, res: any, next: any) => {
    try {
        const { matricula } = req.params;
        
        // Buscar informações do militar antes de excluir para o log
        const [militarInfo] = await getConnection().query(
            'SELECT * FROM militares WHERE matricula = ?',
            [matricula]
        );
        const militar = (militarInfo as any)[0];
        
        await getConnection().query('DELETE FROM militares WHERE matricula = ?', [matricula]);
        
        // Log detalhado da exclusão
        const usuario = req.user?.nome || 'Usuário não identificado';
        
        await LogService.logDetalhado({
            usuario: usuario,
            acao: 'DELETE',
            entidade: 'militar',
            registro_id: matricula,
            descricao: `Excluído militar ${militar?.nome_guerra || matricula} - ${militar?.nome_completo || ''}`,
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            dados_antigos: militar
        });
        
        res.json({ message: 'Militar deletado com sucesso' });
    } catch (err) { next(err); }
});

export default router;
