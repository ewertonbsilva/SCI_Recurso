import { Router } from 'express';
import { getConnection } from '../db';
import { authenticateToken } from '../auth';
import { validateBody, turnoSchema, chamadaMilitarSchema, chamadaMilitarUpdateSchema } from '../middleware/validate';
import { LogService } from '../services/logService';

const router = Router();

// Exige autenticação em todas as rotas operacionais
router.use(authenticateToken);

// GET /api/turnos
router.get('/', async (req: any, res: any, next: any) => {
    try {
        const result = await getConnection().query(`
      SELECT t.*, (SELECT COUNT(*) FROM equipes e WHERE e.id_turno = t.id_turno) as total_equipes
      FROM turnos t ORDER BY t.data DESC
    `);
        res.json((result as any)[0]);
    } catch (err) { next(err); }
});

// POST /api/sp/criar-turno
router.post('/sp/criar-turno', validateBody(turnoSchema), async (req: any, res: any, next: any) => {
    try {
        const { data, periodo } = req.body;
        const result = await getConnection().query('CALL sp_criar_turno(?, ?)', [data, periodo]);
        
        // Log detalhado da criação do turno
        const usuario = req.user?.nome || 'Usuário não identificado';
        const dataFormatada = new Date(data).toLocaleDateString('pt-BR');
        const turnoInfo = `Turno do dia ${dataFormatada}: ${periodo}`;
        
        await LogService.logDetalhado({
            usuario: usuario,
            acao: 'CREATE',
            entidade: 'turno',
            registro_id: result[0][0]?.id_turno?.toString(),
            descricao: `Criado turno ${turnoInfo}`,
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            dados_novos: { data, periodo }
        });
        
        res.json(result[0][0]);
    } catch (err) { next(err); }
});

// GET /api/chamada-militar/:idTurno
router.get('/chamada-militar/:idTurno', async (req: any, res: any, next: any) => {
    try {
        const { idTurno } = req.params;
        const result = await getConnection().query(
            'SELECT cm.*, m.nome_completo, pg.nome_posto_grad, m.nome_guerra FROM chamada_militar cm JOIN militares m ON cm.matricula = m.matricula LEFT JOIN posto_grad pg ON m.id_posto_grad = pg.id_posto_grad WHERE cm.id_turno = ?',
            [idTurno]
        );
        res.json((result as any)[0]);
    } catch (err) { next(err); }
});

// POST /api/chamada-militar
router.post('/chamada-militar', validateBody(chamadaMilitarSchema), async (req: any, res: any, next: any) => {
    try {
        const { id_chamada_militar, id_turno, matricula, funcao, presenca, obs } = req.body;

        if (!id_chamada_militar || !id_turno || !matricula) {
            return res.status(400).json({ error: 'Campos obrigatórios: id_chamada_militar, id_turno, matricula' });
        }

        const [turnoCheck] = await getConnection().query('SELECT id_turno FROM turnos WHERE id_turno = ?', [id_turno]);
        if (!Array.isArray(turnoCheck) || turnoCheck.length === 0) {
            return res.status(400).json({ error: 'Turno não encontrado', id_turno });
        }

        const [militarCheck] = await getConnection().query(`
            SELECT m.matricula, m.nome_guerra, m.nome_completo, pg.nome_posto_grad 
            FROM militares m 
            LEFT JOIN posto_grad pg ON m.id_posto_grad = pg.id_posto_grad 
            WHERE m.matricula = ?
        `, [matricula]);
        if (!Array.isArray(militarCheck) || militarCheck.length === 0) {
            return res.status(400).json({ error: 'Militar não encontrado', matricula });
        }

        const [duplicateCheck] = await getConnection().query(
            'SELECT id_chamada_militar FROM chamada_militar WHERE id_turno = ? AND matricula = ?',
            [id_turno, matricula]
        );
        if (Array.isArray(duplicateCheck) && duplicateCheck.length > 0) {
            return res.status(400).json({ error: 'Militar já escalado neste turno' });
        }

        await getConnection().query(
            'INSERT INTO chamada_militar (id_turno, matricula, id_chamada_militar, funcao, presenca, obs) VALUES (?, ?, ?, ?, ?, ?)',
            [id_turno, matricula, id_chamada_militar, funcao || 'Combatente', presenca !== undefined ? (presenca ? 1 : 0) : 1, obs || null]
        );
        
        // Construir descrição detalhada
        const militarInfo = (militarCheck as any)[0];
        const postoGrad = militarInfo?.nome_posto_grad ? `${militarInfo.nome_posto_grad} ` : '';
        const nomeMilitar = militarInfo?.nome_guerra || militarInfo?.nome_completo || matricula;
        const nomeCompleto = postoGrad + nomeMilitar;
        
        await LogService.logDetalhado({
            usuario: req.user?.nome || 'Usuário não identificado',
            acao: 'CREATE',
            entidade: 'chamada_militar',
            registro_id: id_chamada_militar,
            descricao: `Adicionado militar ${nomeCompleto} à chamada`,
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            dados_novos: { id_chamada_militar, id_turno, matricula, funcao, presenca, obs }
        });

        res.json({ id_chamada_militar, ...req.body });
    } catch (err) { next(err); }
});

// PUT /api/chamada-militar/:id
router.put('/chamada-militar/:id', validateBody(chamadaMilitarUpdateSchema), async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;
        const { id_turno, matricula, funcao, presenca, obs } = req.body;
        
        const [dadosAntigosResult] = await getConnection().query(`
            SELECT cm.*, m.nome_guerra, m.nome_completo, pg.nome_posto_grad,
                   t.data as turno_data, t.periodo as turno_periodo 
            FROM chamada_militar cm 
            JOIN militares m ON cm.matricula = m.matricula 
            LEFT JOIN posto_grad pg ON m.id_posto_grad = pg.id_posto_grad
            LEFT JOIN turnos t ON cm.id_turno = t.id_turno 
            WHERE cm.id_chamada_militar = ?
        `, [id]);
        const dadosAntigos = (dadosAntigosResult as any)[0];
        
        await getConnection().query(
            'UPDATE chamada_militar SET id_turno = ?, matricula = ?, funcao = ?, presenca = ?, obs = ? WHERE id_chamada_militar = ?',
            [id_turno, matricula, funcao, presenca, obs, id]
        );
        
        // Construir descrição detalhada
        const postoGrad = dadosAntigos?.nome_posto_grad ? `${dadosAntigos.nome_posto_grad} ` : '';
        const nomeMilitar = dadosAntigos?.nome_guerra || dadosAntigos?.nome_completo || dadosAntigos?.matricula || matricula || id;
        const nomeCompleto = postoGrad + nomeMilitar;
        const dataFormatada = dadosAntigos?.turno_data ? new Date(dadosAntigos.turno_data).toLocaleDateString('pt-BR') : '';
        const periodo = dadosAntigos?.turno_periodo || '';
        const turnoInfo = dataFormatada && periodo ? ` (turno ${dataFormatada} - ${periodo})` : '';
        
        await LogService.logDetalhado({
            usuario: req.user?.nome || 'Usuário não identificado',
            acao: 'UPDATE',
            entidade: 'chamada_militar',
            registro_id: id,
            descricao: `Atualizado militar ${nomeCompleto} na chamada${turnoInfo}`,
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            dados_antigos: dadosAntigos,
            dados_novos: { id_turno, matricula, funcao, presenca, obs }
        });
        
        res.json({ id_chamada_militar: id, ...req.body });
    } catch (err) { next(err); }
});

// DELETE /api/chamada-militar/:id
router.delete('/chamada-militar/:id', async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;
        
        const [dadosAntigosResult] = await getConnection().query(`
            SELECT cm.*, m.nome_guerra, m.nome_completo, pg.nome_posto_grad,
                   t.data as turno_data, t.periodo as turno_periodo 
            FROM chamada_militar cm 
            JOIN militares m ON cm.matricula = m.matricula 
            LEFT JOIN posto_grad pg ON m.id_posto_grad = pg.id_posto_grad
            LEFT JOIN turnos t ON cm.id_turno = t.id_turno 
            WHERE cm.id_chamada_militar = ?
        `, [id]);
        const dadosAntigos = (dadosAntigosResult as any)[0];
        
        await getConnection().query('DELETE FROM chamada_militar WHERE id_chamada_militar = ?', [id]);
        
        // Construir descrição detalhada
        const postoGrad = dadosAntigos?.nome_posto_grad ? `${dadosAntigos.nome_posto_grad} ` : '';
        const nomeMilitar = dadosAntigos?.nome_guerra || dadosAntigos?.nome_completo || dadosAntigos?.matricula || id;
        const nomeCompleto = postoGrad + nomeMilitar;
        const dataFormatada = dadosAntigos?.turno_data ? new Date(dadosAntigos.turno_data).toLocaleDateString('pt-BR') : '';
        const periodo = dadosAntigos?.turno_periodo || '';
        const turnoInfo = dataFormatada && periodo ? ` (turno ${dataFormatada} - ${periodo})` : '';
        
        await LogService.logDetalhado({
            usuario: req.user?.nome || 'Usuário não identificado',
            acao: 'DELETE',
            entidade: 'chamada_militar',
            registro_id: id,
            descricao: `Removido militar ${nomeCompleto} da chamada${turnoInfo}`,
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            dados_antigos: dadosAntigos
        });
        
        res.json({ message: 'Chamada militar removida com sucesso' });
    } catch (err) { next(err); }
});

// GET /api/chamada-civil/:idTurno
router.get('/chamada-civil/:idTurno', async (req: any, res: any, next: any) => {
    try {
        const { idTurno } = req.params;
        const result = await getConnection().query(
            'SELECT cc.*, c.nome_completo, c.contato, o.nome_orgao FROM chamada_civil cc JOIN civis c ON cc.id_civil = c.id_civil LEFT JOIN orgaos_origem o ON c.id_orgao_origem = o.id_orgao_origem WHERE cc.id_turno = ?',
            [idTurno]
        );
        res.json(result[0]);
    } catch (err) { next(err); }
});

// POST /api/chamada-civil
router.post('/chamada-civil', async (req: any, res: any, next: any) => {
    try {
        const { id_chamada_civil, id_turno, id_civil, quant_civil } = req.body;
        
        // Buscar informações do civil para o log
        const [civilInfo] = await getConnection().query(
            'SELECT c.nome_completo FROM civis c WHERE c.id_civil = ?',
            [id_civil]
        ) as any[];
        
        await getConnection().query(
            'INSERT INTO chamada_civil (id_chamada_civil, id_turno, id_civil, quant_civil) VALUES (?, ?, ?, ?)',
            [id_chamada_civil, id_turno, id_civil, quant_civil]
        );
        
        // Construir descrição detalhada
        const nomeCivil = (Array.isArray(civilInfo) && civilInfo.length > 0) ? civilInfo[0].nome_completo : id_civil;
        
        await LogService.logDetalhado({
            usuario: req.user?.nome || 'Usuário não identificado',
            acao: 'CREATE',
            entidade: 'chamada_civil',
            registro_id: id_chamada_civil,
            descricao: `Adicionado civil ${nomeCivil} à chamada`,
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            dados_novos: { id_chamada_civil, id_turno, id_civil, quant_civil }
        });
        
        res.json({ id_chamada_civil, ...req.body });
    } catch (err) { next(err); }
});

// PUT /api/chamada-civil/:id
router.put('/chamada-civil/:id', async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const fields: string[] = [];
        const values: any[] = [];

        if (updates.id_turno !== undefined) { fields.push('id_turno = ?'); values.push(updates.id_turno); }
        if (updates.id_civil !== undefined) { fields.push('id_civil = ?'); values.push(updates.id_civil); }
        if (updates.quant_civil !== undefined) { fields.push('quant_civil = ?'); values.push(updates.quant_civil); }
        if (updates.saida !== undefined) { fields.push('saida = ?'); values.push(updates.saida); }

        if (fields.length === 0) {
            return res.status(400).json({ error: 'Nenhum campo fornecido para atualização' });
        }
        values.push(id);
        
        const [dadosAntigosResult] = await getConnection().query('SELECT * FROM chamada_civil WHERE id_chamada_civil = ?', [id]);
        const dadosAntigos = (dadosAntigosResult as any)[0];

        const result = await getConnection().query(`UPDATE chamada_civil SET ${fields.join(', ')} WHERE id_chamada_civil = ?`, values);
        if ((result[0] as any).affectedRows === 0) {
            return res.status(404).json({ error: 'Chamada civil não encontrada' });
        }

        const [updated] = await getConnection().query(
            'SELECT cc.*, c.nome_completo, c.contato, o.nome_orgao FROM chamada_civil cc JOIN civis c ON cc.id_civil = c.id_civil LEFT JOIN orgaos_origem o ON c.id_orgao_origem = o.id_orgao_origem WHERE cc.id_chamada_civil = ?',
            [id]
        );
        
        await LogService.logDetalhado({
            usuario: req.user?.nome || 'Usuário não identificado',
            acao: 'UPDATE',
            entidade: 'chamada_civil',
            registro_id: id,
            descricao: `Atualizado civil na chamada`,
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            dados_antigos: dadosAntigos,
            dados_novos: (updated as any)[0]
        });
        
        res.json((updated as any)[0]);
    } catch (err) { next(err); }
});

// DELETE /api/chamada-civil/:id
router.delete('/chamada-civil/:id', async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;
        
        const [dadosAntigosResult] = await getConnection().query(`
            SELECT cc.*, c.nome_completo, 
                   t.data as turno_data, t.periodo as turno_periodo 
            FROM chamada_civil cc 
            JOIN civis c ON cc.id_civil = c.id_civil 
            LEFT JOIN turnos t ON cc.id_turno = t.id_turno 
            WHERE cc.id_chamada_civil = ?
        `, [id]);
        const dadosAntigos = (dadosAntigosResult as any)[0];
        
        const result = await getConnection().query('DELETE FROM chamada_civil WHERE id_chamada_civil = ?', [id]);
        if ((result[0] as any).affectedRows === 0) {
            return res.status(404).json({ error: 'Chamada civil não encontrada' });
        }
        
        // Construir descrição detalhada
        const nomeCivil = dadosAntigos?.nome_completo || dadosAntigos?.id_civil || id;
        const dataFormatada = dadosAntigos?.turno_data ? new Date(dadosAntigos.turno_data).toLocaleDateString('pt-BR') : '';
        const periodo = dadosAntigos?.turno_periodo || '';
        const turnoInfo = dataFormatada && periodo ? ` (turno ${dataFormatada} - ${periodo})` : '';
        
        await LogService.logDetalhado({
            usuario: req.user?.nome || 'Usuário não identificado',
            acao: 'DELETE',
            entidade: 'chamada_civil',
            registro_id: id,
            descricao: `Removido civil ${nomeCivil} da chamada${turnoInfo}`,
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            dados_antigos: dadosAntigos
        });
        
        res.json({ message: 'Chamada civil removida com sucesso' });
    } catch (err) { next(err); }
});

// GET /api/equipes
router.get('/equipes', async (req: any, res: any, next: any) => {
    try {
        const result = await getConnection().query(`
            SELECT e.*, t.data as turno_data, t.periodo as turno_periodo,
              cm.matricula as matricula_militar, m.nome_guerra as nome_militar, pg.nome_posto_grad,
              cc.quant_civil, cc.id_civil, c.nome_completo as nome_motorista, c.modelo_veiculo as vtr_modelo, c.contato as tel_mot,
              (SELECT COUNT(*) FROM componentes_equipe ce WHERE ce.id_equipe = e.id_equipe) as total_componentes
       FROM equipes e
       LEFT JOIN turnos t ON e.id_turno = t.id_turno
       LEFT JOIN chamada_militar cm ON e.id_chamada_militar = cm.id_chamada_militar
       LEFT JOIN militares m ON cm.matricula = m.matricula
       LEFT JOIN posto_grad pg ON m.id_posto_grad = pg.id_posto_grad
       LEFT JOIN chamada_civil cc ON e.id_chamada_civil = cc.id_chamada_civil
       LEFT JOIN civis c ON cc.id_civil = c.id_civil
       ORDER BY t.data DESC, e.nome_equipe ASC
        `);
        res.json(result[0]);
    } catch (err) { next(err); }
});

// GET /api/equipes/:idTurno
router.get('/equipes/:idTurno', async (req: any, res: any, next: any) => {
    try {
        const { idTurno } = req.params;
        const result = await getConnection().query(
            `SELECT e.*, t.data as turno_data, t.periodo as turno_periodo,
              cm.matricula as matricula_militar, m.nome_guerra as nome_militar, pg.nome_posto_grad,
              cc.quant_civil, cc.id_civil, c.nome_completo as nome_motorista, c.modelo_veiculo as vtr_modelo, c.contato as tel_mot,
              (SELECT COUNT(*) FROM componentes_equipe ce WHERE ce.id_equipe = e.id_equipe) as total_componentes
       FROM equipes e
       LEFT JOIN turnos t ON e.id_turno = t.id_turno
       LEFT JOIN chamada_militar cm ON e.id_chamada_militar = cm.id_chamada_militar
       LEFT JOIN militares m ON cm.matricula = m.matricula
       LEFT JOIN posto_grad pg ON m.id_posto_grad = pg.id_posto_grad
       LEFT JOIN chamada_civil cc ON e.id_chamada_civil = cc.id_chamada_civil
       LEFT JOIN civis c ON cc.id_civil = c.id_civil
       WHERE e.id_turno = ?`,
            [idTurno]
        ) as any[];
        res.json(result[0]);
    } catch (err) { next(err); }
});

// POST /api/equipes
router.post('/equipes', async (req: any, res: any, next: any) => {
    try {
        const { id_turno, id_chamada_militar, id_chamada_civil, nome_equipe, status, total_efetivo, bairro } = req.body;
        let efetivo = total_efetivo || 0;
        if (!efetivo && id_chamada_civil) {
            const [civilData] = await getConnection().query('SELECT quant_civil FROM chamada_civil WHERE id_chamada_civil = ?', [id_chamada_civil]) as any[];
            if (Array.isArray(civilData) && civilData.length > 0) efetivo = civilData[0].quant_civil || 0;
        }
        if (!efetivo && id_chamada_militar) efetivo = 1;

        // Buscar informações do turno para o log
        const [turnoInfo] = await getConnection().query(
            'SELECT t.data, t.periodo FROM turnos t WHERE t.id_turno = ?',
            [id_turno]
        ) as any[];

        const result = await getConnection().query(
            'INSERT INTO equipes (id_turno, id_chamada_militar, id_chamada_civil, nome_equipe, status, total_efetivo, bairro) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id_turno, id_chamada_militar, id_chamada_civil, nome_equipe || 'Equipe', status || 'livre', efetivo, bairro || null]
        ) as any;
        const insertId = (result as any).insertId || result[0]?.insertId;
        
        // Construir descrição detalhada
        const dataFormatada = (Array.isArray(turnoInfo) && turnoInfo.length > 0 && turnoInfo[0].data) ? 
            new Date(turnoInfo[0].data).toLocaleDateString('pt-BR') : '';
        const periodo = (Array.isArray(turnoInfo) && turnoInfo.length > 0) ? turnoInfo[0].periodo : '';
        const turnoInfoStr = dataFormatada && periodo ? ` (turno ${dataFormatada} - ${periodo})` : '';
        
        await LogService.logDetalhado({
            usuario: req.user?.nome || 'Usuário não identificado',
            acao: 'CREATE',
            entidade: 'equipe',
            registro_id: insertId,
            descricao: `Criada equipe ${nome_equipe || 'Equipe'}${turnoInfoStr}`,
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            dados_novos: { id_equipe: insertId, id_turno, id_chamada_militar, id_chamada_civil, nome_equipe, status: status || 'livre', total_efetivo: efetivo, bairro }
        });
        
        res.json({ id_equipe: insertId, id_turno, id_chamada_militar, id_chamada_civil, nome_equipe, status: status || 'livre', total_efetivo: efetivo, bairro });
    } catch (err) { next(err); }
});

// PUT /api/equipes/:id
router.put('/equipes/:id', async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const fields: string[] = [];
        const values: any[] = [];

        const allowed = ['id_turno', 'id_chamada_militar', 'id_chamada_civil', 'nome_equipe', 'status', 'total_efetivo', 'bairro'];
        for (const key of allowed) {
            if (updates[key] !== undefined) { fields.push(`${key} = ?`); values.push(updates[key]); }
        }

        if (fields.length === 0) return res.status(400).json({ error: 'Nenhum campo para atualizar' });
        values.push(id);
        
        // Buscar dados antigos com informações detalhadas
        const [dadosAntigosResult] = await getConnection().query(`
            SELECT e.*, t.data as turno_data, t.periodo as turno_periodo,
                   m.nome_guerra, m.nome_completo, pg.nome_posto_grad,
                   c.nome_completo as nome_civil
            FROM equipes e 
            LEFT JOIN turnos t ON e.id_turno = t.id_turno
            LEFT JOIN chamada_militar cm ON e.id_chamada_militar = cm.id_chamada_militar
            LEFT JOIN militares m ON cm.matricula = m.matricula
            LEFT JOIN posto_grad pg ON m.id_posto_grad = pg.id_posto_grad
            LEFT JOIN chamada_civil cc ON e.id_chamada_civil = cc.id_chamada_civil
            LEFT JOIN civis c ON cc.id_civil = c.id_civil
            WHERE e.id_equipe = ?
        `, [id]);
        const dadosAntigos = (dadosAntigosResult as any)[0];
        
        await getConnection().query(`UPDATE equipes SET ${fields.join(', ')} WHERE id_equipe = ?`, values);
        
        // Buscar informações atualizadas para detalhar as alterações
        let detalhesAlteracoes = [];
        
        for (const key of allowed) {
            if (updates[key] !== undefined && dadosAntigos[key] !== updates[key]) {
                let nomeCampo = key;
                let valorAntigo = dadosAntigos[key];
                let valorNovo = updates[key];
                
                // Mapear nomes amigáveis dos campos
                switch (key) {
                    case 'id_chamada_militar': 
                        nomeCampo = 'Chefe de Equipe'; 
                        break;
                    case 'id_chamada_civil': 
                        nomeCampo = 'Motorista'; 
                        break;
                    case 'nome_equipe': 
                        nomeCampo = 'Nome da Equipe'; 
                        break;
                    case 'status': 
                        nomeCampo = 'Status'; 
                        break;
                    case 'total_efetivo': 
                        nomeCampo = 'Efetivo'; 
                        break;
                    case 'bairro': 
                        nomeCampo = 'Setor de Atuação'; 
                        break;
                    case 'id_turno': 
                        nomeCampo = 'Turno'; 
                        break;
                }
                
                // Obter nomes para militares
                if (key === 'id_chamada_militar') {
                    if (valorNovo) {
                        const [novoMilitar] = await getConnection().query(`
                            SELECT m.nome_guerra, m.nome_completo, pg.nome_posto_grad 
                            FROM chamada_militar cm 
                            JOIN militares m ON cm.matricula = m.matricula 
                            LEFT JOIN posto_grad pg ON m.id_posto_grad = pg.id_posto_grad 
                            WHERE cm.id_chamada_militar = ?
                        `, [valorNovo]) as any[];
                        
                        if (Array.isArray(novoMilitar) && novoMilitar.length > 0) {
                            const postoGrad = novoMilitar[0].nome_posto_grad ? `${novoMilitar[0].nome_posto_grad} ` : '';
                            const nomeMilitar = novoMilitar[0].nome_guerra || novoMilitar[0].nome_completo;
                            valorNovo = `${postoGrad}${nomeMilitar}`;
                        }
                    }
                    
                    if (valorAntigo) {
                        const postoGrad = dadosAntigos.nome_posto_grad ? `${dadosAntigos.nome_posto_grad} ` : '';
                        const nomeMilitar = dadosAntigos.nome_guerra || dadosAntigos.nome_completo;
                        valorAntigo = `${postoGrad}${nomeMilitar}`;
                    }
                }
                
                // Obter nomes para civis
                if (key === 'id_chamada_civil') {
                    if (valorNovo) {
                        const [novoCivil] = await getConnection().query(`
                            SELECT c.nome_completo 
                            FROM chamada_civil cc 
                            JOIN civis c ON cc.id_civil = c.id_civil 
                            WHERE cc.id_chamada_civil = ?
                        `, [valorNovo]) as any[];
                        
                        if (Array.isArray(novoCivil) && novoCivil.length > 0) {
                            valorNovo = novoCivil[0].nome_completo;
                        }
                    }
                    
                    if (valorAntigo && dadosAntigos.nome_civil) {
                        valorAntigo = dadosAntigos.nome_civil;
                    }
                }
                
                // Formatar turno
                if (key === 'id_turno') {
                    if (valorNovo) {
                        const [novoTurno] = await getConnection().query(
                            'SELECT data, periodo FROM turnos WHERE id_turno = ?',
                            [valorNovo]
                        ) as any[];
                        
                        if (Array.isArray(novoTurno) && novoTurno.length > 0) {
                            const dataFormatada = new Date(novoTurno[0].data).toLocaleDateString('pt-BR');
                            valorNovo = `${dataFormatada} - ${novoTurno[0].periodo}`;
                        }
                    }
                    
                    if (valorAntigo && dadosAntigos.turno_data) {
                        const dataFormatada = new Date(dadosAntigos.turno_data).toLocaleDateString('pt-BR');
                        valorAntigo = `${dataFormatada} - ${dadosAntigos.turno_periodo}`;
                    }
                }
                
                // Adicionar alteração apenas se houver mudança real
                if (valorAntigo !== valorNovo) {
                    detalhesAlteracoes.push(`${nomeCampo}: "${valorAntigo || 'vazio'}" → "${valorNovo || 'vazio'}"`);
                }
            }
        }
        
        // Construir descrição detalhada
        const nomeEquipe = dadosAntigos?.nome_equipe || 'Equipe';
        const dataFormatada = dadosAntigos?.turno_data ? new Date(dadosAntigos.turno_data).toLocaleDateString('pt-BR') : '';
        const periodo = dadosAntigos?.turno_periodo || '';
        const turnoInfo = dataFormatada && periodo ? ` (turno ${dataFormatada} - ${periodo})` : '';
        const alteracoesStr = detalhesAlteracoes.length > 0 ? `Alterações: ${detalhesAlteracoes.join(', ')}` : '';
        
        await LogService.log({
            usuario: req.user?.nome || 'Usuário não identificado',
            acao: 'UPDATE',
            entidade: 'equipe',
            registro_id: id,
            descricao: `Atualizada equipe ${nomeEquipe}${turnoInfo}${alteracoesStr ? ` | ${alteracoesStr}` : ''}`,
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
        });
        
        res.json({ id_equipe: id, ...updates });
    } catch (err) { next(err); }
});

// DELETE /api/equipes/:id
router.delete('/equipes/:id', async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;
        
        const [dadosAntigosResult] = await getConnection().query(`
            SELECT e.*, t.data as turno_data, t.periodo as turno_periodo 
            FROM equipes e 
            LEFT JOIN turnos t ON e.id_turno = t.id_turno 
            WHERE e.id_equipe = ?
        `, [id]);
        const dadosAntigos = (dadosAntigosResult as any)[0];
        
        await getConnection().query('DELETE FROM equipes WHERE id_equipe = ?', [id]);
        
        // Construir descrição detalhada
        const nomeEquipe = dadosAntigos?.nome_equipe || 'Equipe';
        const dataFormatada = dadosAntigos?.turno_data ? new Date(dadosAntigos.turno_data).toLocaleDateString('pt-BR') : '';
        const periodo = dadosAntigos?.turno_periodo || '';
        const turnoInfo = dataFormatada && periodo ? ` (turno ${dataFormatada} - ${periodo})` : '';
        
        await LogService.logDetalhado({
            usuario: req.user?.nome || 'Usuário não identificado',
            acao: 'DELETE',
            entidade: 'equipe',
            registro_id: id,
            descricao: `Excluída equipe ${nomeEquipe}${turnoInfo}`,
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            dados_antigos: dadosAntigos
        });
        
        res.json({ message: 'Equipe removida com sucesso' });
    } catch (err) { next(err); }
});

// GET /api/equipes/componentes/:idEquipe
router.get('/equipes/componentes/:idEquipe', async (req: any, res: any, next: any) => {
    try {
        const { idEquipe } = req.params;
        const result = await getConnection().query(`
      SELECT ce.*, m.nome_guerra, pg.nome_posto_grad, m.matricula
      FROM componentes_equipe ce
      JOIN chamada_militar cm ON ce.id_chamada_militar = cm.id_chamada_militar
      JOIN militares m ON cm.matricula = m.matricula
      LEFT JOIN posto_grad pg ON m.id_posto_grad = pg.id_posto_grad
      WHERE ce.id_equipe = ?
    `, [idEquipe]);
        res.json((result as any)[0]);
    } catch (err) { next(err); }
});

// POST /api/equipes/componentes
router.post('/equipes/componentes', async (req: any, res: any, next: any) => {
    try {
        const { id_equipe, id_chamada_militar, id_turno } = req.body;
        const id = `comp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        
        // Buscar informações detalhadas para o log
        const [equipeInfo] = await getConnection().query(
            'SELECT e.nome_equipe, t.data as turno_data, t.periodo as turno_periodo FROM equipes e LEFT JOIN turnos t ON e.id_turno = t.id_turno WHERE e.id_equipe = ?',
            [id_equipe]
        ) as any[];
        
        const [militarInfo] = await getConnection().query(`
            SELECT m.nome_guerra, m.nome_completo, pg.nome_posto_grad 
            FROM chamada_militar cm 
            JOIN militares m ON cm.matricula = m.matricula 
            LEFT JOIN posto_grad pg ON m.id_posto_grad = pg.id_posto_grad 
            WHERE cm.id_chamada_militar = ?
        `, [id_chamada_militar]) as any[];
        
        await getConnection().query(
            'INSERT INTO componentes_equipe (id_componente, id_equipe, id_chamada_militar, id_turno) VALUES (?, ?, ?, ?)',
            [id, id_equipe, id_chamada_militar, id_turno]
        );
        
        // Construir descrição detalhada
        const nomeEquipe = (Array.isArray(equipeInfo) && equipeInfo.length > 0) ? equipeInfo[0].nome_equipe : 'Equipe';
        const dataFormatada = (Array.isArray(equipeInfo) && equipeInfo.length > 0 && equipeInfo[0].turno_data) ? 
            new Date(equipeInfo[0].turno_data).toLocaleDateString('pt-BR') : '';
        const periodo = (Array.isArray(equipeInfo) && equipeInfo.length > 0) ? equipeInfo[0].turno_periodo : '';
        const turnoInfo = dataFormatada && periodo ? ` (turno ${dataFormatada} - ${periodo})` : '';
        
        const postoGrad = (Array.isArray(militarInfo) && militarInfo.length > 0 && militarInfo[0].nome_posto_grad) ? 
            `${militarInfo[0].nome_posto_grad} ` : '';
        const nomeMilitar = (Array.isArray(militarInfo) && militarInfo.length > 0) ? 
            (militarInfo[0].nome_guerra || militarInfo[0].nome_completo) : 'Militar não identificado';
        const nomeCompleto = postoGrad + nomeMilitar;
        
        await LogService.logDetalhado({
            usuario: req.user?.nome || 'Usuário não identificado',
            acao: 'CREATE',
            entidade: 'componentes_equipe',
            registro_id: id,
            descricao: `Adicionado componente ${nomeCompleto} à equipe ${nomeEquipe}${turnoInfo}`,
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            dados_novos: { id_componente: id, id_equipe, id_chamada_militar, id_turno }
        });
        
        res.json({ id_componente: id, ...req.body });
    } catch (err) { next(err); }
});

// DELETE /api/turnos/:id
router.delete('/turnos/:id', async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;
        
        const [dadosAntigosResult] = await getConnection().query('SELECT * FROM turnos WHERE id_turno = ?', [id]);
        const dadosAntigos = (dadosAntigosResult as any)[0];
        
        await getConnection().query('DELETE FROM turnos WHERE id_turno = ?', [id]);
        
        // Construir descrição detalhada
        const dataFormatada = dadosAntigos?.data ? new Date(dadosAntigos.data).toLocaleDateString('pt-BR') : '';
        const periodo = dadosAntigos?.periodo || '';
        const turnoInfo = dataFormatada && periodo ? `${dataFormatada} - ${periodo}` : (dataFormatada || periodo || id);
        
        await LogService.logDetalhado({
            usuario: req.user?.nome || 'Usuário não identificado',
            acao: 'DELETE',
            entidade: 'turno',
            registro_id: id,
            descricao: `Removido turno ${turnoInfo}`,
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            dados_antigos: dadosAntigos
        });
        
        res.json({ message: 'Turno removido com sucesso' });
    } catch (err) { next(err); }
});

// DELETE /api/equipes/componentes/:id
router.delete('/equipes/componentes/:id', async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;
        
        const [dadosAntigosResult] = await getConnection().query(`
            SELECT ce.*, e.nome_equipe, t.data as turno_data, t.periodo as turno_periodo,
                   m.nome_guerra, m.nome_completo, pg.nome_posto_grad
            FROM componentes_equipe ce 
            JOIN equipes e ON ce.id_equipe = e.id_equipe
            LEFT JOIN turnos t ON e.id_turno = t.id_turno
            LEFT JOIN chamada_militar cm ON ce.id_chamada_militar = cm.id_chamada_militar
            LEFT JOIN militares m ON cm.matricula = m.matricula
            LEFT JOIN posto_grad pg ON m.id_posto_grad = pg.id_posto_grad
            WHERE ce.id_componente = ?
        `, [id]);
        const dadosAntigos = (dadosAntigosResult as any)[0];
        
        await getConnection().query('DELETE FROM componentes_equipe WHERE id_componente = ?', [id]);
        
        // Construir descrição detalhada
        const nomeEquipe = dadosAntigos?.nome_equipe || 'Equipe';
        const dataFormatada = dadosAntigos?.turno_data ? new Date(dadosAntigos.turno_data).toLocaleDateString('pt-BR') : '';
        const periodo = dadosAntigos?.turno_periodo || '';
        const turnoInfo = dataFormatada && periodo ? ` (turno ${dataFormatada} - ${periodo})` : '';
        
        const postoGrad = dadosAntigos?.nome_posto_grad ? `${dadosAntigos.nome_posto_grad} ` : '';
        const nomeMilitar = dadosAntigos?.nome_guerra || dadosAntigos?.nome_completo || 'Militar não identificado';
        const nomeCompleto = postoGrad + nomeMilitar;
        
        await LogService.log({
            usuario: req.user?.nome || 'Usuário não identificado',
            acao: 'DELETE',
            entidade: 'componentes_equipe',
            registro_id: id,
            descricao: `Removido componente ${nomeCompleto} da equipe ${nomeEquipe}${turnoInfo}`,
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
        });
        
        res.json({ message: 'Componente removido com sucesso' });
    } catch (err) { next(err); }
});

export default router;
