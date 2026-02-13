import express from 'express';
import cors from 'cors';
import { getConnection, initializeDatabase } from './db';
import { apiService } from './apiService';
import { hashPassword, comparePassword, generateToken, authenticateToken, requireRole, AuthRequest } from './auth';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Endpoints de Autenticação
app.post('/api/auth/login', async (req: any, res: any) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    const result = await getConnection().query(
      'SELECT * FROM usuarios WHERE username = ?',
      [username]
    );

    const users = (result as any)[0];
    if (users.length === 0) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    const user = users[0];
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      nome: user.nome,
      role: user.role
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        nome: user.nome,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao realizar login' });
  }
});

app.post('/api/auth/register', async (req: any, res: any) => {
  try {
    const { username, nome, password, role } = req.body;

    if (!username || !nome || !password || !role) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // Verificar se usuário já existe
    const existingUser = await getConnection().query(
      'SELECT id FROM usuarios WHERE username = ?',
      [username]
    );

    if ((existingUser as any)[0].length > 0) {
      return res.status(400).json({ error: 'Nome de usuário já existe' });
    }

    // Criptografar senha
    const hashedPassword = await hashPassword(password);
    const userId = `user_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

    await getConnection().query(
      'INSERT INTO usuarios (id, username, nome, password, role) VALUES (?, ?, ?, ?, ?)',
      [userId, username, nome, hashedPassword, role]
    );

    const token = generateToken({
      id: userId,
      username,
      nome,
      role
    });

    res.status(201).json({
      token,
      user: {
        id: userId,
        username,
        nome,
        role
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req: AuthRequest, res: any) => {
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
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar informações do usuário' });
  }
});

// Endpoint para criar turno usando procedure definitiva
app.post('/api/turnos-com-sp', async (req: any, res: any) => {
  try {
    const { data, periodo } = req.body;

    // Usar procedure definitiva que sempre funciona (sem depender de DEFAULT)
    const result = await apiService.createTurno(data, periodo);
    res.json(result); // Retorna o turno criado com ID gerado
  } catch (error) {
    console.error('Erro ao criar turno com SP:', error);
    res.status(500).json({ error: 'Erro ao criar turno', details: error.message });
  }
});

// Endpoint para gerar IDs
app.get('/api/sp/gerar-id/:tipo', async (req: any, res: any) => {
  try {
    const { tipo } = req.params;
    let procedureName = '';

    switch (tipo) {
      case 'turno':
        procedureName = 'sp_gerar_id_turno';
        break;
      case 'civil':
        procedureName = 'sp_gerar_id_civil';
        break;
      case 'atestado':
        procedureName = 'sp_gerar_id_atestado';
        break;
      default:
        return res.status(400).json({ error: 'Tipo inválido. Use: turno, civil ou atestado' });
    }

    const result = await getConnection().query(`CALL ${procedureName}()`);
    const idField = `id_${tipo}`;
    res.json({ [idField]: result[0][0][idField] });
  } catch (error) {
    console.error('Erro ao gerar ID:', error);
    res.status(500).json({ error: 'Erro ao gerar ID', details: error.message });
  }
});

// Endpoint para dashboard completo
app.get('/api/dashboard', async (req: any, res: any) => {
  try {
    const result = await getConnection().query('CALL sp_dashboard_geral()');
    res.json(result[0][0]);
  } catch (error) {
    console.error('Erro ao buscar dashboard:', error);
    res.status(500).json({ error: 'Erro ao buscar dashboard' });
  }
});

// Endpoint para verificar disponibilidade
app.get('/api/disponibilidade', async (req: any, res: any) => {
  try {
    const { data, periodo } = req.query;
    if (!data || !periodo) {
      return res.status(400).json({ error: 'Parâmetros data e periodo são obrigatórios' });
    }

    const result = await getConnection().query('CALL sp_verificar_disponibilidade(?, ?)', [data, periodo]);
    res.json(result[0]);
  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error);
    res.status(500).json({ error: 'Erro ao verificar disponibilidade' });
  }
});

// Endpoint para views otimizadas
app.get('/api/vw/efetivo-disponivel', async (req: any, res: any) => {
  try {
    const result = await getConnection().query('SELECT * FROM vw_efetivo_disponivel ORDER BY nome_completo');
    res.json((result as any)[0]);
  } catch (error) {
    console.error('Erro ao buscar efetivo disponível:', error);
    res.status(500).json({ error: 'Erro ao buscar efetivo disponível' });
  }
});

app.get('/api/vw/resumo-turnos', async (req: any, res: any) => {
  try {
    const result = await getConnection().query('SELECT * FROM vw_resumo_turnos ORDER BY data DESC, periodo DESC');
    res.json((result as any)[0]);
  } catch (error) {
    console.error('Erro ao buscar resumo de turnos:', error);
    res.status(500).json({ error: 'Erro ao buscar resumo de turnos' });
  }
});

app.get('/api/vw/logs-recentes', async (req: any, res: any) => {
  try {
    const result = await getConnection().query('SELECT * FROM vw_logs_recentes ORDER BY timestamp DESC');
    res.json((result as any)[0]);
  } catch (error) {
    console.error('Erro ao buscar logs recentes:', error);
    res.status(500).json({ error: 'Erro ao buscar logs recentes' });
  }
});


// Endpoint para listar turnos
app.get('/api/turnos', async (req: any, res: any) => {
  try {
    const result = await getConnection().query('SELECT * FROM turnos ORDER BY data DESC, periodo DESC');
    const turnos = (result as any)[0];
    res.json(turnos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar turnos' });
  }
});

app.delete('/api/turnos/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;

    // Remover dependências primeiro para evitar erro de FK
    await getConnection().query('DELETE FROM chamada_militar WHERE id_turno = ?', [id]);
    await getConnection().query('DELETE FROM chamada_civil WHERE id_turno = ?', [id]);
    await getConnection().query('DELETE FROM logs_operacionais WHERE id_turno = ?', [id]);

    // Remover o turno
    await getConnection().query('DELETE FROM turnos WHERE id_turno = ?', [id]);

    res.json({ message: 'Turno removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover turno:', error);
    res.status(500).json({ error: 'Erro ao remover turno do banco de dados' });
  }
});

// Endpoint tradicional para criar turno (funciona sempre)
app.post('/api/turnos', async (req: any, res: any) => {
  try {
    const { data, periodo } = req.body;

    // Gerar ID manualmente (solução que sempre funciona)
    const id_turno = `turno_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

    const result = await getConnection().query(
      'INSERT INTO turnos (id_turno, data, periodo) VALUES (?, ?, ?)',
      [id_turno, data, periodo]
    );

    res.json({ id_turno, data, periodo });
  } catch (error) {
    console.error('Erro ao criar turno:', error);
    res.status(500).json({ error: 'Erro ao criar turno', details: error.message });
  }
});

app.get('/api/militares', async (req: any, res: any) => {
  try {
    const result = await getConnection().query(`
      SELECT 
        m.*,
        pg.nome_posto_grad,
        pg.hierarquia,
        f.nome_forca,
        u.nome_ubm
      FROM militares m
      LEFT JOIN posto_grad pg ON m.id_posto_grad = pg.id_posto_grad
      LEFT JOIN forcas f ON m.id_forca = f.id_forca
      LEFT JOIN ubms u ON m.id_ubm = u.id_ubm
      ORDER BY pg.hierarquia ASC, m.nome_guerra
    `);
    const militares = (result as any)[0];
    
    // Converter campos enum Y/N para booleanos
    const militaresFormatados = militares.map((m: any) => ({
      ...m,
      cpoe: m.cpoe === 'Y',
      mergulhador: m.mergulhador === 'Y',
      restricao_medica: m.restricao_medica === 'Y'
    }));
    
    res.json(militaresFormatados);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar militares' });
  }
});

app.post('/api/militares', async (req: any, res: any) => {
  try {
    console.log('Dados recebidos para criar militar:', req.body);
    const { matricula, nome_completo, id_posto_grad, nome_guerra, rg, id_forca, cpoe, mergulhador, restricao_medica, desc_rest_med, id_ubm } = req.body;

    // Converter valores para garantir tipos corretos
    const rgValue = rg || null;
    const descRestMedValue = desc_rest_med || null;
    const idUbmValue = id_ubm || null;
    const cpoeValue = cpoe ? 'Y' : 'N';
    const mergulhadorValue = mergulhador ? 'Y' : 'N';
    const restricaoMedicaValue = restricao_medica ? 'Y' : 'N';

    const result = await getConnection().query(
      'INSERT INTO militares (matricula, nome_completo, id_posto_grad, nome_guerra, rg, id_forca, cpoe, mergulhador, restricao_medica, desc_rest_med, id_ubm) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [matricula, nome_completo, id_posto_grad, nome_guerra, rgValue, id_forca, cpoeValue, mergulhadorValue, restricaoMedicaValue, descRestMedValue, idUbmValue]
    );
    console.log('Militar criado com sucesso:', { matricula, ...req.body });
    res.json({ matricula, ...req.body });
  } catch (error) {
    console.error('Erro detalhado ao criar militar:', error);
    res.status(500).json({ error: 'Erro ao criar militar', details: error.message });
  }
});

app.put('/api/militares/:matricula', async (req: any, res: any) => {
  try {
    const { matricula } = req.params;
    const { nome_completo, id_posto_grad, nome_guerra, rg, id_forca, cpoe, mergulhador, restricao_medica, desc_rest_med, id_ubm } = req.body;
    
    // Converter valores para garantir tipos corretos
    const idPostoGradValue = id_posto_grad ? parseInt(id_posto_grad) : null;
    const idForcaValue = id_forca ? parseInt(id_forca) : null;
    const cpoeValue = cpoe ? 'Y' : 'N';
    const mergulhadorValue = mergulhador ? 'Y' : 'N';
    const restricaoMedicaValue = restricao_medica ? 'Y' : 'N';
    const descRestMedValue = desc_rest_med || null;
    const idUbmValue = id_ubm || null;
    
    await getConnection().query(
      'UPDATE militares SET nome_completo = ?, id_posto_grad = ?, nome_guerra = ?, rg = ?, id_forca = ?, cpoe = ?, mergulhador = ?, restricao_medica = ?, desc_rest_med = ?, id_ubm = ? WHERE matricula = ?',
      [nome_completo, idPostoGradValue, nome_guerra, rg, idForcaValue, cpoeValue, mergulhadorValue, restricaoMedicaValue, descRestMedValue, idUbmValue, matricula]
    );
    res.json({ matricula, ...req.body });
  } catch (error) {
    console.error('Erro ao atualizar militar:', error);
    res.status(500).json({ error: 'Erro ao atualizar militar' });
  }
});

app.delete('/api/militares/:matricula', async (req: any, res: any) => {
  try {
    const { matricula } = req.params;
    await getConnection().query('DELETE FROM militares WHERE matricula = ?', [matricula]);
    res.json({ message: 'Militar removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover militar' });
  }
});

// Postos e Graduações
app.get('/api/postos-grad', async (req: any, res: any) => {
  try {
    const result = await getConnection().query(
      'SELECT * FROM posto_grad ORDER BY hierarquia ASC'
    ) as any[];
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar postos/graduações' });
  }
});

app.post('/api/postos-grad', async (req: any, res: any) => {
  try {
    const { nome_posto_grad, hierarquia } = req.body;
    await getConnection().query(
      'INSERT INTO posto_grad (nome_posto_grad, hierarquia) VALUES (?, ?)',
      [nome_posto_grad, hierarquia]
    );
    res.json({ nome_posto_grad, hierarquia });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar posto/graduação', details: error.message });
  }
});

app.put('/api/postos-grad/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { nome_posto_grad, hierarquia } = req.body;
    await getConnection().query(
      'UPDATE posto_grad SET nome_posto_grad = ?, hierarquia = ? WHERE id_posto_grad = ?',
      [nome_posto_grad, hierarquia, id]
    );
    res.json({ id_posto_grad: id, nome_posto_grad, hierarquia });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar posto/graduação' });
  }
});

app.delete('/api/postos-grad/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await getConnection().query('DELETE FROM posto_grad WHERE id_posto_grad = ?', [id]);
    res.json({ message: 'Posto/graduação removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover posto/graduação' });
  }
});

// Endpoint para buscar forças
app.get('/api/forcas', async (req: any, res: any) => {
  try {
    const result = await getConnection().query(
      'SELECT * FROM forcas ORDER BY nome_forca ASC'
    ) as any[];
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar forças' });
  }
});

app.post('/api/forcas', async (req: any, res: any) => {
  try {
    const { nome_forca } = req.body;
    await getConnection().query(
      'INSERT INTO forcas (nome_forca) VALUES (?)',
      [nome_forca]
    );
    res.json({ nome_forca });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar força', details: error.message });
  }
});

app.put('/api/forcas/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { nome_forca } = req.body;
    await getConnection().query(
      'UPDATE forcas SET nome_forca = ? WHERE id_forca = ?',
      [nome_forca, id]
    );
    res.json({ id_forca: id, nome_forca });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar força' });
  }
});

app.delete('/api/forcas/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await getConnection().query('DELETE FROM forcas WHERE id_forca = ?', [id]);
    res.json({ message: 'Força removida com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover força' });
  }
});

// Endpoint para buscar órgãos de origem
app.get('/api/orgaos-origem', async (req: any, res: any) => {
  try {
    const result = await getConnection().query(
      'SELECT * FROM orgaos_origem ORDER BY nome_orgao ASC'
    ) as any[];
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar órgãos de origem' });
  }
});

app.post('/api/orgaos-origem', async (req: any, res: any) => {
  try {
    const { nome_orgao } = req.body;
    await getConnection().query(
      'INSERT INTO orgaos_origem (nome_orgao) VALUES (?)',
      [nome_orgao]
    );
    res.json({ nome_orgao });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar órgão de origem', details: error.message });
  }
});

app.put('/api/orgaos-origem/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { nome_orgao } = req.body;
    await getConnection().query(
      'UPDATE orgaos_origem SET nome_orgao = ? WHERE id_orgao_origem = ?',
      [nome_orgao, id]
    );
    res.json({ id_orgao_origem: id, nome_orgao });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar órgão de origem' });
  }
});

app.delete('/api/orgaos-origem/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await getConnection().query('DELETE FROM orgaos_origem WHERE id_orgao_origem = ?', [id]);
    res.json({ message: 'Órgão de origem removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover órgão de origem' });
  }
});

app.get('/api/civis', async (req: any, res: any) => {
  try {
    const result = await getConnection().query(`
      SELECT 
        c.*,
        o.nome_orgao
      FROM civis c
      LEFT JOIN orgaos_origem o ON c.id_orgao_origem = o.id_orgao_origem
      ORDER BY c.nome_completo
    `);
    res.json((result as any)[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar civis' });
  }
});

app.post('/api/civis', async (req: any, res: any) => {
  try {
    console.log('Dados recebidos para criar civil:', req.body);
    const { nome_completo, contato, id_orgao_origem, motorista, modelo_veiculo, placa_veiculo } = req.body;

    // Gerar ID usando procedure
    const idResult = await getConnection().query('CALL sp_gerar_id_civil()');
    const id_civil = idResult[0][0].id_civil;

    // Converter undefined para null
    const modeloVeiculoValue = modelo_veiculo || null;
    const placaVeiculoValue = placa_veiculo || null;

    const result = await getConnection().query(
      'INSERT INTO civis (id_civil, nome_completo, contato, id_orgao_origem, motorista, modelo_veiculo, placa_veiculo) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id_civil, nome_completo, contato, id_orgao_origem, motorista, modeloVeiculoValue, placaVeiculoValue]
    );
    console.log('Civil criado com sucesso:', { id_civil, ...req.body });
    res.json({ id_civil, ...req.body });
  } catch (error) {
    console.error('Erro detalhado ao criar civil:', error);
    res.status(500).json({ error: 'Erro ao criar civil', details: error.message });
  }
});

app.put('/api/civis/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { nome_completo, contato, id_orgao_origem, motorista, modelo_veiculo, placa_veiculo } = req.body;
    await getConnection().query(
      'UPDATE civis SET nome_completo = ?, contato = ?, id_orgao_origem = ?, motorista = ?, modelo_veiculo = ?, placa_veiculo = ? WHERE id_civil = ?',
      [nome_completo, contato, id_orgao_origem, motorista, modelo_veiculo, placa_veiculo, id]
    );
    res.json({ id_civil: id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar civil' });
  }
});

app.delete('/api/civis/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await getConnection().query('DELETE FROM civis WHERE id_civil = ?', [id]);
    res.json({ message: 'Civil removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover civil' });
  }
});

app.get('/api/chamada-militar/:idTurno', async (req: any, res: any) => {
  try {
    const { idTurno } = req.params;
    const result = await getConnection().query(
      'SELECT cm.*, m.nome_completo, pg.nome_posto_grad, m.nome_guerra FROM chamada_militar cm JOIN militares m ON cm.matricula = m.matricula LEFT JOIN posto_grad pg ON m.id_posto_grad = pg.id_posto_grad WHERE cm.id_turno = ?',
      [idTurno]
    );
    res.json((result as any)[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar chamada militar' });
  }
});

// Endpoint para verificar estrutura da tabela
app.get('/api/table-structure/:tableName', async (req: any, res: any) => {
  try {
    const { tableName } = req.params;
    const [structure] = await getConnection().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'sci_recurso' AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `, [tableName]);

    res.json({ table: tableName, structure });
  } catch (error) {
    console.error('Erro ao verificar estrutura da tabela:', error);
    res.status(500).json({ error: 'Erro ao verificar estrutura da tabela' });
  }
});

// Endpoint para adicionar foreign key faltante
app.post('/api/fix-chamada-militar-fk', async (req: any, res: any) => {
  try {
    console.log('Adicionando foreign key para turnos na tabela chamada_militar...');

    // Verificar se a foreign key já existe
    const [fkCheck] = await getConnection().query(`
      SELECT CONSTRAINT_NAME 
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = 'sci_recurso' 
      AND TABLE_NAME = 'chamada_militar' 
      AND COLUMN_NAME = 'id_turno' 
      AND REFERENCED_TABLE_NAME = 'turnos'
    `);

    if (Array.isArray(fkCheck) && fkCheck.length > 0) {
      const constraintName = (fkCheck[0] as any).CONSTRAINT_NAME;
      console.log('Foreign key já existe:', constraintName);
      return res.json({ message: 'Foreign key já existe', constraint: constraintName });
    }

    // Adicionar foreign key para turnos
    await getConnection().query(`
      ALTER TABLE chamada_militar 
      ADD CONSTRAINT fk_chamada_militar_turno 
      FOREIGN KEY (id_turno) REFERENCES turnos(id_turno) 
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    console.log('Foreign key adicionada com sucesso');
    res.json({ message: 'Foreign key adicionada com sucesso' });
  } catch (error) {
    console.error('Erro ao adicionar foreign key:', error);
    res.status(500).json({ error: 'Erro ao adicionar foreign key', details: error.message });
  }
});

app.post('/api/chamada-militar', async (req: any, res: any) => {
  try {
    console.log('=== DEBUG POST /api/chamada-militar ===');
    console.log('Corpo da requisição:', JSON.stringify(req.body, null, 2));

    const { id_chamada_militar, id_turno, matricula, funcao, presenca, obs } = req.body;

    // Validar campos obrigatórios
    if (!id_chamada_militar || !id_turno || !matricula) {
      console.error('Campos obrigatórios faltando:', { id_chamada_militar, id_turno, matricula });
      return res.status(400).json({ error: 'Campos obrigatórios: id_chamada_militar, id_turno, matricula' });
    }

    // Verificar se o turno existe
    const [turnoCheck] = await getConnection().query('SELECT id_turno FROM turnos WHERE id_turno = ?', [id_turno]);
    if (!Array.isArray(turnoCheck) || turnoCheck.length === 0) {
      console.error('Turno não encontrado:', id_turno);
      return res.status(400).json({ error: 'Turno não encontrado', id_turno });
    }

    // Verificar se o militar existe
    const [militarCheck] = await getConnection().query('SELECT matricula FROM militares WHERE matricula = ?', [matricula]);
    if (!Array.isArray(militarCheck) || militarCheck.length === 0) {
      console.error('Militar não encontrado:', matricula);
      return res.status(400).json({ error: 'Militar não encontrado', matricula });
    }

    // Verificar se já não existe esta combinação
    const [duplicateCheck] = await getConnection().query(
      'SELECT id_chamada_militar FROM chamada_militar WHERE id_turno = ? AND matricula = ?',
      [id_turno, matricula]
    );
    if (Array.isArray(duplicateCheck) && duplicateCheck.length > 0) {
      console.error('Militar já escalado neste turno:', { id_turno, matricula });
      return res.status(400).json({ error: 'Militar já escalado neste turno' });
    }

    // Tentar INSERT com valores explícitos - sem created_at/updated_at pois são automáticos
    const sql = `
      INSERT INTO chamada_militar 
      (id_chamada_militar, id_turno, matricula, funcao, presenca, obs) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
      id_chamada_militar,
      id_turno,
      matricula,
      funcao || 'Combatente',
      presenca !== undefined ? (presenca ? 1 : 0) : 1, // Converter boolean para TINYINT
      obs || null
    ];

    console.log('SQL final:', sql);
    console.log('Valores finais:', values);

    const result = await getConnection().query(sql, values);

    console.log('INSERT executado com sucesso. Resultado:', result);
    res.json({ id_chamada_militar, ...req.body });
  } catch (error) {
    console.error('=== ERRO DETALHADO POST /api/chamada-militar ===');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
    console.error('Error sql:', error.sql);
    console.error('Error sqlMessage:', error.sqlMessage);
    console.error('Stack:', error.stack);

    res.status(500).json({
      error: 'Erro ao criar chamada militar',
      details: error.message,
      sqlMessage: error.sqlMessage,
      code: error.code
    });
  }
});

app.put('/api/chamada-militar/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { id_turno, matricula, funcao, presenca, obs } = req.body;
    await getConnection().query(
      'UPDATE chamada_militar SET id_turno = ?, matricula = ?, funcao = ?, presenca = ?, obs = ? WHERE id_chamada_militar = ?',
      [id_turno, matricula, funcao, presenca, obs, id]
    );
    res.json({ id_chamada_militar: id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar chamada militar' });
  }
});

app.delete('/api/chamada-militar/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await getConnection().query('DELETE FROM chamada_militar WHERE id_chamada_militar = ?', [id]);
    res.json({ message: 'Chamada militar removida com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover chamada militar' });
  }
});

app.get('/api/chamada-civil/:idTurno', async (req: any, res: any) => {
  try {
    const { idTurno } = req.params;
    const result = await getConnection().query(
      'SELECT cc.*, c.nome_completo, c.contato, o.nome_orgao FROM chamada_civil cc JOIN civis c ON cc.id_civil = c.id_civil LEFT JOIN orgaos_origem o ON c.id_orgao_origem = o.id_orgao_origem WHERE cc.id_turno = ?',
      [idTurno]
    );

    // mysql2 returns results differently - the first element contains the actual data
    const data = result[0];
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar chamada civil:', error.message);
    res.status(500).json({
      error: 'Erro ao buscar chamada civil',
      details: error.message
    });
  }
});

app.post('/api/chamada-civil', async (req: any, res: any) => {
  try {
    const { id_chamada_civil, id_turno, id_civil, nome_equipe, quant_civil, status, matricula_chefe, bairro, last_status_update } = req.body;
    const result = await getConnection().query(
      'INSERT INTO chamada_civil (id_chamada_civil, id_turno, id_civil, nome_equipe, quant_civil, status, matricula_chefe, bairro, last_status_update) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id_chamada_civil, id_turno, id_civil, nome_equipe, quant_civil, status, matricula_chefe, bairro, last_status_update]
    );
    res.json({ id_chamada_civil, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar chamada civil' });
  }
});

app.put('/api/chamada-civil/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Build dynamic UPDATE query based on provided fields
    const updateFields = [];
    const updateValues = [];

    if (updates.id_turno !== undefined) {
      updateFields.push('id_turno = ?');
      updateValues.push(updates.id_turno);
    }
    if (updates.id_civil !== undefined) {
      updateFields.push('id_civil = ?');
      updateValues.push(updates.id_civil);
    }
    if (updates.nome_equipe !== undefined) {
      updateFields.push('nome_equipe = ?');
      updateValues.push(updates.nome_equipe);
    }
    if (updates.quant_civil !== undefined) {
      updateFields.push('quant_civil = ?');
      updateValues.push(updates.quant_civil);
    }
    if (updates.status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(updates.status);
    }
    if (updates.matricula_chefe !== undefined) {
      updateFields.push('matricula_chefe = ?');
      updateValues.push(updates.matricula_chefe);
    }
    if (updates.bairro !== undefined) {
      updateFields.push('bairro = ?');
      updateValues.push(updates.bairro);
    }
    if (updates.last_status_update !== undefined) {
      updateFields.push('last_status_update = ?');
      updateValues.push(updates.last_status_update);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        error: 'Nenhum campo fornecido para atualização',
        id: id
      });
    }

    // Add the ID to the values array for the WHERE clause
    updateValues.push(id);

    const query = `UPDATE chamada_civil SET ${updateFields.join(', ')} WHERE id_chamada_civil = ?`;

    const result = await getConnection().query(query, updateValues);

    // Check if any rows were actually updated
    const updateResult = result[0] as any;
    if (updateResult.affectedRows === 0) {
      return res.status(404).json({
        error: 'Chamada civil não encontrada',
        id: id,
        details: 'Nenhum registro encontrado com o ID fornecido'
      });
    }

    // Get the updated record to return complete data
    const [updatedRecord] = await getConnection().query(
      'SELECT cc.*, c.nome_completo, c.contato, o.nome_orgao FROM chamada_civil cc JOIN civis c ON cc.id_civil = c.id_civil LEFT JOIN orgaos_origem o ON c.id_orgao_origem = o.id_orgao_origem WHERE cc.id_chamada_civil = ?',
      [id]
    );

    res.json(updatedRecord[0]);
  } catch (error) {
    console.error('Erro ao atualizar chamada civil:', error.message);
    res.status(500).json({
      error: 'Erro ao atualizar chamada civil',
      details: error.message
    });
  }
});

app.delete('/api/chamada-civil/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const result = await getConnection().query('DELETE FROM chamada_civil WHERE id_chamada_civil = ?', [id]);

    // Check if any rows were actually deleted
    const deleteResult = result[0] as any;
    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({
        error: 'Chamada civil não encontrada',
        id: id,
        details: 'Nenhum registro encontrado com o ID fornecido'
      });
    }

    res.json({ message: 'Chamada civil removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover chamada civil:', error.message);
    res.status(500).json({ error: 'Erro ao remover chamada civil', details: error.message });
  }
});

// UBMs
app.get('/api/ubms', async (req: any, res: any) => {
  try {
    const result = await getConnection().query('SELECT * FROM ubms ORDER BY nome_ubm ASC');
    res.json((result as any)[0]);
  } catch (error) {
    console.error('Erro ao buscar UBMs:', error);
    res.status(500).json({ error: 'Erro ao buscar UBMs' });
  }
});

app.post('/api/ubms', async (req: any, res: any) => {
  try {
    const { id_ubm, nome_ubm } = req.body;

    // Gerar ID automaticamente
    const idResult = await getConnection().query('CALL sp_gerar_id_ubm()');
    const id = idResult[0][0].id_ubm;

    const result = await getConnection().query(
      'INSERT INTO ubms (id_ubm, nome_ubm) VALUES (?, ?)',
      [id, nome_ubm]
    );

    res.json({ id_ubm: id, nome_ubm });
  } catch (error) {
    console.error('Erro ao criar UBM:', error);
    res.status(500).json({ error: 'Erro ao criar UBM', details: error.message });
  }
});

app.put('/api/ubms/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { nome_ubm } = req.body;

    const result = await getConnection().query(
      'UPDATE ubms SET nome_ubm = ? WHERE id_ubm = ?',
      [nome_ubm, id]
    );

    res.json({ id_ubm: id, nome_ubm });
  } catch (error) {
    console.error('Erro ao atualizar UBM:', error);
    res.status(500).json({ error: 'Erro ao atualizar UBM', details: error.message });
  }
});

app.delete('/api/ubms/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;

    // Verificar se existe em militares antes de excluir
    const [militaresUBM] = await getConnection().query(
      'SELECT COUNT(*) as count FROM militares WHERE id_ubm = ?',
      [id]
    );

    const militarCount = militaresUBM[0][0].count;

    if (militarCount > 0) {
      return res.status(400).json({
        error: 'UBM não pode ser excluída',
        details: `Existem ${militarCount} militares vinculados a esta UBM`
      });
    }

    await getConnection().query('DELETE FROM ubms WHERE id_ubm = ?', [id]);

    res.json({ message: 'UBM excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir UBM:', error);
    res.status(500).json({ error: 'Erro ao excluir UBM', details: error.message });
  }
});
app.get('/api/atestados', async (req: any, res: any) => {
  try {
    const result = await getConnection().query('SELECT * FROM atestados_medicos ORDER BY data_inicio DESC');
    res.json((result as any)[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar atestados' });
  }
});

app.post('/api/atestados', async (req: any, res: any) => {
  try {
    const { matricula, data_inicio, dias, motivo } = req.body;

    // Inserir sem especificar ID (deixa o MySQL gerar automaticamente com UUID())
    const result = await getConnection().query(
      'INSERT INTO atestados_medicos (matricula, data_inicio, dias, motivo) VALUES (?, ?, ?, ?)',
      [matricula, data_inicio, dias, motivo]
    );
    
    const insertedId = (result as any)[0].insertId;
    console.log('Atestado criado com sucesso:', { insertedId, ...req.body });
    res.json({ id: insertedId, ...req.body });
  } catch (error) {
    console.error('Erro ao criar atestado:', error);
    console.error('Detalhes do erro:', error.message);
    console.error('Stack:', error.stack);
    console.error('Dados recebidos:', req.body);
    res.status(500).json({ error: 'Erro ao criar atestado', details: error.message });
  }
});

app.delete('/api/atestados/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await getConnection().query('DELETE FROM atestados_medicos WHERE id = ?', [id]);
    res.json({ message: 'Atestado removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover atestado' });
  }
});

// Views Otimizadas (Reais do Banco)
app.get('/api/vw/militares-restricoes', async (req: any, res: any) => {
  try {
    const result = await getConnection().query('SELECT * FROM vw_militares_restricoes ORDER BY data_inicio DESC');
    res.json((result as any)[0]);
  } catch (error) {
    console.error('Erro ao buscar vw_militares_restricoes:', error);
    res.status(500).json({ error: 'Erro ao buscar militares com restrições' });
  }
});

app.get('/api/vw/resumo-civis-turno', async (req: any, res: any) => {
  try {
    const result = await getConnection().query('SELECT * FROM vw_resumo_civis_turno ORDER BY data DESC, periodo DESC');
    res.json((result as any)[0]);
  } catch (error) {
    console.error('Erro ao buscar vw_resumo_civis_turno:', error);
    res.status(500).json({ error: 'Erro ao buscar resumo de civis' });
  }
});

app.get('/api/vw/resumo-militares-turno', async (req: any, res: any) => {
  try {
    const result = await getConnection().query('SELECT * FROM vw_resumo_militares_turno ORDER BY data DESC, periodo DESC');
    res.json((result as any)[0]);
  } catch (error) {
    console.error('Erro ao buscar vw_resumo_militares_turno:', error);
    res.status(500).json({ error: 'Erro ao buscar resumo de militares' });
  }
});

// Endpoint de teste para debug da procedure
app.post('/api/test-sp-criar-turno', async (req: any, res: any) => {
  try {
    const { data, periodo } = req.body;
    console.log('=== DEBUG sp_criar_turno ===');
    console.log('Parâmetros recebidos:', { data, periodo });

    // Verificar estrutura da tabela turnos
    const tableStructure = await getConnection().query(`
      SELECT COLUMN_TYPE, CHARACTER_MAXIMUM_LENGTH 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'sci_recurso' 
      AND TABLE_NAME = 'turnos' 
      AND COLUMN_NAME = 'periodo'
    `);
    console.log('Estrutura da coluna periodo:', tableStructure);

    // Tentar valores válidos comuns para periodo (baseado no ENUM real)
    const periodosValidos = ['Manhã', 'Tarde', 'Noite'];
    let periodoTeste = periodo;

    // Se o periodo não for válido, usar um valor padrão
    if (!periodosValidos.includes(periodo)) {
      periodoTeste = 'Manhã'; // Valor válido do ENUM
      console.log('Período inválido, usando:', periodoTeste);
    }

    // Testar se a procedure existe
    const [checkProc] = await getConnection().query(`
      SELECT ROUTINE_NAME 
      FROM INFORMATION_SCHEMA.ROUTINES 
      WHERE ROUTINE_SCHEMA = 'sci_recurso' AND ROUTINE_NAME = 'sp_criar_turno'
    `) as any[];
    console.log('Procedure existe:', Array.isArray(checkProc) && checkProc.length > 0);

    if (!Array.isArray(checkProc) || checkProc.length === 0) {
      return res.status(500).json({ error: 'Procedure sp_criar_turno não encontrada' });
    }

    // Tentar executar a procedure
    console.log('Executando CALL sp_criar_turno com periodo:', periodoTeste);
    const result = await getConnection().query('CALL sp_criar_turno(?, ?)', [data, periodoTeste]);
    console.log('Resultado bruto:', JSON.stringify(result, null, 2));

    // Tentar diferentes formas de extrair o resultado
    let turnoResult = null;

    if (result && result[0] && result[0][0]) {
      turnoResult = result[0][0];
      console.log('Resultado extraído (forma 1):', turnoResult);
    } else if (result && result[0]) {
      turnoResult = result[0];
      console.log('Resultado extraído (forma 2):', turnoResult);
    }

    if (turnoResult) {
      res.json({
        success: true,
        result: turnoResult,
        debug: {
          procedure_exists: true,
          table_structure: tableStructure,
          periodo_usado: periodoTeste,
          raw_result: result
        }
      });
    } else {
      // Fallback manual
      console.log('Usando fallback manual...');
      const v_id_turno = 'turno_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      await getConnection().query('INSERT INTO turnos (id_turno, data, periodo) VALUES (?, ?, ?)', [v_id_turno, data, periodoTeste]);
      res.json({
        success: true,
        result: { id_turno: v_id_turno },
        debug: {
          procedure_exists: true,
          table_structure: tableStructure,
          periodo_usado: periodoTeste,
          used_fallback: true
        }
      });
    }
  } catch (error) {
    console.error('ERRO DETALHADO:', error);
    res.status(500).json({
      error: 'Erro ao criar turno',
      details: error.message,
      stack: error.stack
    });
  }
});

// Stored Procedures (Reais do Banco)
app.post('/api/sp/criar-turno', async (req: any, res: any) => {
  try {
    const { data, periodo } = req.body;
    console.log('Criando turno com sp_criar_turno:', { data, periodo });

    const result = await getConnection().query('CALL sp_criar_turno(?, ?)', [data, periodo]);
    console.log('Resultado sp_criar_turno:', result);

    // MySQL procedures retornam multiple result sets
    const turnoResult = result[0] && result[0][0] ? result[0][0] : null;

    if (turnoResult) {
      res.json(turnoResult);
    } else {
      // Fallback: criar turno manualmente se a procedure falhar
      const v_id_turno = 'turno_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      await getConnection().query('INSERT INTO turnos (id_turno, data, periodo) VALUES (?, ?, ?)', [v_id_turno, data, periodo]);
      res.json({ id_turno: v_id_turno });
    }
  } catch (error) {
    console.error('Erro detalhado ao criar turno:', error);
    res.status(500).json({ error: 'Erro ao criar turno', details: error.message });
  }
});

app.get('/api/sp/efetivo-disponivel', async (req: any, res: any) => {
  try {
    const { data, periodo } = req.query;
    const result = await getConnection().query('CALL sp_efetivo_disponivel(?, ?)', [data, periodo]);
    res.json(result[0]); // Retorna lista de efetivo disponível
  } catch (error) {
    console.error('Erro ao buscar efetivo disponível:', error);
    res.status(500).json({ error: 'Erro ao buscar efetivo disponível' });
  }
});

// Trigger de Auditoria (tr_chamada_civil_audit) - já funciona automaticamente

// Verificar objetos do banco (SP, TR, VW, Functions)
app.get('/api/database-objects', async (req: any, res: any) => {
  try {
    // Stored Procedures
    const [procedures] = await getConnection().query(`
      SELECT 'PROCEDURES' as object_type, ROUTINE_NAME as name, CREATED, LAST_ALTERED 
      FROM INFORMATION_SCHEMA.ROUTINES 
      WHERE ROUTINE_SCHEMA = 'sci_recurso' AND ROUTINE_TYPE = 'PROCEDURE'
    `);

    // Triggers
    const [triggers] = await getConnection().query(`
      SELECT 'TRIGGERS' as object_type, TRIGGER_NAME as name, CREATED, ACTION_TIMING, EVENT_MANIPULATION
      FROM INFORMATION_SCHEMA.TRIGGERS 
      WHERE TRIGGER_SCHEMA = 'sci_recurso'
    `);

    // Views
    const [views] = await getConnection().query(`
      SELECT 'VIEWS' as object_type, TABLE_NAME as name, CREATED, LAST_ALTERED
      FROM INFORMATION_SCHEMA.VIEWS 
      WHERE TABLE_SCHEMA = 'sci_recurso'
    `);

    // Functions
    const [functions] = await getConnection().query(`
      SELECT 'FUNCTIONS' as object_type, ROUTINE_NAME as name, CREATED, LAST_ALTERED
      FROM INFORMATION_SCHEMA.ROUTINES 
      WHERE ROUTINE_SCHEMA = 'sci_recurso' AND ROUTINE_TYPE = 'FUNCTION'
    `);

    // Tabelas
    const [tables] = await getConnection().query(`
      SELECT 'TABLES' as object_type, TABLE_NAME as name, CREATE_TIME, UPDATE_TIME
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'sci_recurso' AND TABLE_TYPE = 'BASE TABLE'
    `);

    res.json({
      procedures,
      triggers,
      views,
      functions,
      tables
    });
  } catch (error) {
    console.error('Erro ao buscar objetos do banco:', error);
    res.status(500).json({ error: 'Erro ao buscar objetos do banco' });
  }
});

// Logs Operacionais
app.get('/api/logs', async (req: any, res: any) => {
  try {
    const result = await getConnection().query('SELECT * FROM logs_operacionais ORDER BY timestamp DESC');
    res.json((result as any)[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar logs operacionais' });
  }
});

app.post('/api/logs', async (req: any, res: any) => {
  try {
    const { id, id_turno, timestamp, mensagem, categoria, usuario } = req.body;
    const result = await getConnection().query(
      'INSERT INTO logs_operacionais (id, id_turno, timestamp, mensagem, categoria, usuario) VALUES (?, ?, ?, ?, ?, ?)',
      [id, id_turno, timestamp, mensagem, categoria, usuario]
    );
    res.json({ id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar log operacional' });
  }
});

app.delete('/api/logs/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await getConnection().query('DELETE FROM logs_operacionais WHERE id = ?', [id]);
    res.json({ message: 'Log operacional removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover log operacional' });
  }
});

// Endpoint para redefinir senha (requer autenticação de admin)
app.post('/api/users/:id/reset-password', authenticateToken, requireRole(['Administrador']), async (req: AuthRequest, res: any) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.trim() === '') {
      return res.status(400).json({ error: 'Nova senha é obrigatória' });
    }

    const { hashPassword } = await import('./auth');
    const hashedPassword = await hashPassword(newPassword);

    await getConnection().query(
      'UPDATE usuarios SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );

    res.json({ message: 'Senha redefinida com sucesso' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ error: 'Erro ao redefinir senha' });
  }
});

// Usuários
app.get('/api/users', authenticateToken, requireRole(['Administrador']), async (req: AuthRequest, res: any) => {
  try {
    const result = await getConnection().query('SELECT id, username, nome, role FROM usuarios ORDER BY username');
    res.json((result as any)[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

app.post('/api/users', authenticateToken, requireRole(['Administrador']), async (req: AuthRequest, res: any) => {
  try {
    const { username, nome, password, role } = req.body;

    if (!username || !nome || !password || !role) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // Verificar se usuário já existe
    const existingUser = await getConnection().query(
      'SELECT id FROM usuarios WHERE username = ?',
      [username]
    );

    if ((existingUser as any)[0].length > 0) {
      return res.status(400).json({ error: 'Nome de usuário já existe' });
    }

    // Criptografar senha
    const hashedPassword = await hashPassword(password);
    const userId = `user_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

    const result = await getConnection().query(
      'INSERT INTO usuarios (id, username, nome, password, role) VALUES (?, ?, ?, ?, ?)',
      [userId, username, nome, hashedPassword, role]
    );
    
    res.json({ id: userId, username, nome, role });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

app.put('/api/users/:id', authenticateToken, requireRole(['Administrador']), async (req: AuthRequest, res: any) => {
  try {
    const { id } = req.params;
    const { username, nome, password, role } = req.body;

    // Construir query dinamicamente
    let query = 'UPDATE usuarios SET username = ?, nome = ?, role = ?';
    const params = [username, nome, role];

    if (password && password.trim() !== '') {
      query += ', password = ?';
      const hashedPassword = await hashPassword(password);
      params.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await getConnection().query(query, params);
    
    // Retornar usuário atualizado sem senha
    const result = await getConnection().query(
      'SELECT id, username, nome, role FROM usuarios WHERE id = ?',
      [id]
    );
    
    res.json((result as any)[0][0]);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

app.delete('/api/users/:id', authenticateToken, requireRole(['Administrador']), async (req: AuthRequest, res: any) => {
  try {
    const { id } = req.params;
    
    // Impedir que o usuário se exclua
    if (id === req.user?.id) {
      return res.status(400).json({ error: 'Não é possível excluir seu próprio usuário' });
    }
    
    await getConnection().query('DELETE FROM usuarios WHERE id = ?', [id]);
    res.json({ message: 'Usuário removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover usuário' });
  }
});

// Health check
app.get('/api/health', (req: any, res: any) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Initialize database and start server
async function startServer() {
  try {
    // Connect to database
    await initializeDatabase();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 API disponível em http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;
