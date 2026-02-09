import express from 'express';
import cors from 'cors';
import Database from './database.ts';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database instance
const db = Database.getInstance();

// Initialize database connection
db.connect().catch(console.error);

// Endpoint para criar turno usando procedure definitiva
app.post('/api/turnos-com-sp', async (req: any, res: any) => {
  try {
    const { data, periodo } = req.body;
    
    // Usar procedure definitiva que sempre funciona (sem depender de DEFAULT)
    const result = await db.query('CALL sp_criar_turno_definitivo(?, ?)', [data, periodo]);
    res.json(result[0][0]); // Retorna o turno criado com ID gerado
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
    
    switch(tipo) {
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
    
    const result = await db.query(`CALL ${procedureName}()`);
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
    const result = await db.query('CALL sp_dashboard_geral()');
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
    
    const result = await db.query('CALL sp_verificar_disponibilidade(?, ?)', [data, periodo]);
    res.json(result[0]);
  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error);
    res.status(500).json({ error: 'Erro ao verificar disponibilidade' });
  }
});

// Endpoint para views otimizadas
app.get('/api/vw/efetivo-disponivel', async (req: any, res: any) => {
  try {
    const result = await db.query('SELECT * FROM vw_efetivo_disponivel ORDER BY nome_completo');
    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar efetivo disponível:', error);
    res.status(500).json({ error: 'Erro ao buscar efetivo disponível' });
  }
});

app.get('/api/vw/resumo-turnos', async (req: any, res: any) => {
  try {
    const result = await db.query('SELECT * FROM vw_resumo_turnos ORDER BY data DESC, periodo DESC');
    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar resumo de turnos:', error);
    res.status(500).json({ error: 'Erro ao buscar resumo de turnos' });
  }
});

app.get('/api/vw/logs-recentes', async (req: any, res: any) => {
  try {
    const result = await db.query('SELECT * FROM vw_logs_recentes ORDER BY timestamp DESC');
    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar logs recentes:', error);
    res.status(500).json({ error: 'Erro ao buscar logs recentes' });
  }
});


// Endpoint para listar turnos
app.get('/api/turnos', async (req: any, res: any) => {
  try {
    const turnos = await db.query('SELECT * FROM turnos ORDER BY data DESC, periodo DESC');
    res.json(turnos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar turnos' });
  }
});

// Endpoint tradicional para criar turno (funciona sempre)
app.post('/api/turnos', async (req: any, res: any) => {
  try {
    const { data, periodo } = req.body;
    
    // Gerar ID manualmente (solução que sempre funciona)
    const id_turno = `turno_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
    
    const result = await db.query(
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
    const militares = await db.query('SELECT * FROM militares ORDER BY posto_grad, nome_guerra');
    res.json(militares);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar militares' });
  }
});

app.post('/api/militares', async (req: any, res: any) => {
  try {
    console.log('Dados recebidos para criar militar:', req.body);
    const { matricula, nome_completo, posto_grad, nome_guerra, rg, forca, cpoe, mergulhador, restricao_medica, desc_rest_med } = req.body;
    
    // Converter undefined para null
    const rgValue = rg || null;
    const descRestMedValue = desc_rest_med || null;
    
    const result = await db.query(
      'INSERT INTO militares (matricula, nome_completo, posto_grad, nome_guerra, rg, forca, cpoe, mergulhador, restricao_medica, desc_rest_med) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [matricula, nome_completo, posto_grad, nome_guerra, rgValue, forca, cpoe, mergulhador, restricao_medica, descRestMedValue]
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
    const { nome_completo, posto_grad, nome_guerra, rg, forca, cpoe, mergulhador, restricao_medica, desc_rest_med } = req.body;
    await db.query(
      'UPDATE militares SET nome_completo = ?, posto_grad = ?, nome_guerra = ?, rg = ?, forca = ?, cpoe = ?, mergulhador = ?, restricao_medica = ?, desc_rest_med = ? WHERE matricula = ?',
      [nome_completo, posto_grad, nome_guerra, rg, forca, cpoe, mergulhador, restricao_medica, desc_rest_med, matricula]
    );
    res.json({ matricula, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar militar' });
  }
});

app.delete('/api/militares/:matricula', async (req: any, res: any) => {
  try {
    const { matricula } = req.params;
    await db.query('DELETE FROM militares WHERE matricula = ?', [matricula]);
    res.json({ message: 'Militar removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover militar' });
  }
});

app.get('/api/civis', async (req: any, res: any) => {
  try {
    const civis = await db.query('SELECT * FROM civis ORDER BY nome_completo');
    res.json(civis);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar civis' });
  }
});

app.post('/api/civis', async (req: any, res: any) => {
  try {
    console.log('Dados recebidos para criar civil:', req.body);
    const { nome_completo, contato, orgao_origem, motorista, modelo_veiculo, placa_veiculo } = req.body;
    
    // Gerar ID usando procedure
    const idResult = await db.query('CALL sp_gerar_id_civil()');
    const id_civil = idResult[0][0].id_civil;
    
    // Converter undefined para null
    const modeloVeiculoValue = modelo_veiculo || null;
    const placaVeiculoValue = placa_veiculo || null;
    
    const result = await db.query(
      'INSERT INTO civis (id_civil, nome_completo, contato, orgao_origem, motorista, modelo_veiculo, placa_veiculo) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id_civil, nome_completo, contato, orgao_origem, motorista, modeloVeiculoValue, placaVeiculoValue]
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
    const { nome_completo, contato, orgao_origem, motorista, modelo_veiculo, placa_veiculo } = req.body;
    await db.query(
      'UPDATE civis SET nome_completo = ?, contato = ?, orgao_origem = ?, motorista = ?, modelo_veiculo = ?, placa_veiculo = ? WHERE id_civil = ?',
      [nome_completo, contato, orgao_origem, motorista, modelo_veiculo, placa_veiculo, id]
    );
    res.json({ id_civil: id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar civil' });
  }
});

app.delete('/api/civis/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM civis WHERE id_civil = ?', [id]);
    res.json({ message: 'Civil removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover civil' });
  }
});

app.get('/api/chamada-militar/:idTurno', async (req: any, res: any) => {
  try {
    const { idTurno } = req.params;
    const chamada = await db.query(
      'SELECT cm.*, m.nome_completo, m.posto_grad, m.nome_guerra FROM chamada_militar cm JOIN militares m ON cm.matricula = m.matricula WHERE cm.id_turno = ?',
      [idTurno]
    );
    res.json(chamada);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar chamada militar' });
  }
});

app.post('/api/chamada-militar', async (req: any, res: any) => {
  try {
    const { id_chamada_militar, id_turno, matricula, funcao, presenca, obs } = req.body;
    const result = await db.query(
      'INSERT INTO chamada_militar (id_chamada_militar, id_turno, matricula, funcao, presenca, obs) VALUES (?, ?, ?, ?, ?, ?)',
      [id_chamada_militar, id_turno, matricula, funcao, presenca, obs]
    );
    res.json({ id_chamada_militar, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar chamada militar' });
  }
});

app.put('/api/chamada-militar/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { id_turno, matricula, funcao, presenca, obs } = req.body;
    await db.query(
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
    await db.query('DELETE FROM chamada_militar WHERE id_chamada_militar = ?', [id]);
    res.json({ message: 'Chamada militar removida com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover chamada militar' });
  }
});

app.get('/api/chamada-civil/:idTurno', async (req: any, res: any) => {
  try {
    const { idTurno } = req.params;
    const chamada = await db.query(
      'SELECT cc.*, c.nome_completo, c.orgao_origem FROM chamada_civil cc JOIN civis c ON cc.id_civil = c.id_civil WHERE cc.id_turno = ?',
      [idTurno]
    );
    res.json(chamada);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar chamada civil' });
  }
});

app.post('/api/chamada-civil', async (req: any, res: any) => {
  try {
    const { id_chamada_civil, id_turno, id_civil, nome_equipe, quant_civil, status, matricula_chefe, bairro, last_status_update } = req.body;
    const result = await db.query(
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
    const { id_turno, id_civil, nome_equipe, quant_civil, status, matricula_chefe, bairro, last_status_update } = req.body;
    await db.query(
      'UPDATE chamada_civil SET id_turno = ?, id_civil = ?, nome_equipe = ?, quant_civil = ?, status = ?, matricula_chefe = ?, bairro = ?, last_status_update = ? WHERE id_chamada_civil = ?',
      [id_turno, id_civil, nome_equipe, quant_civil, status, matricula_chefe, bairro, last_status_update, id]
    );
    res.json({ id_chamada_civil: id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar chamada civil' });
  }
});

app.delete('/api/chamada-civil/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM chamada_civil WHERE id_chamada_civil = ?', [id]);
    res.json({ message: 'Chamada civil removida com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover chamada civil' });
  }
});

// Atestados Médicos
app.get('/api/atestados', async (req: any, res: any) => {
  try {
    const atestados = await db.query('SELECT * FROM atestados_medicos ORDER BY data_inicio DESC');
    res.json(atestados);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar atestados' });
  }
});

app.post('/api/atestados', async (req: any, res: any) => {
  try {
    const { matricula, data_inicio, dias, motivo } = req.body;
    
    // Gerar ID usando procedure
    const idResult = await db.query('CALL sp_gerar_id_atestado()');
    const id = idResult[0][0].id_atestado;
    
    const result = await db.query(
      'INSERT INTO atestados_medicos (id, matricula, data_inicio, dias, motivo) VALUES (?, ?, ?, ?, ?)',
      [id, matricula, data_inicio, dias, motivo]
    );
    console.log('Atestado criado com sucesso:', { id, ...req.body });
    res.json({ id, ...req.body });
  } catch (error) {
    console.error('Erro ao criar atestado:', error);
    res.status(500).json({ error: 'Erro ao criar atestado', details: error.message });
  }
});

app.delete('/api/atestados/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM atestados_medicos WHERE id = ?', [id]);
    res.json({ message: 'Atestado removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover atestado' });
  }
});

// Views Otimizadas (Reais do Banco)
app.get('/api/vw/militares-restricoes', async (req: any, res: any) => {
  try {
    const result = await db.query('SELECT * FROM vw_militares_restricoes ORDER BY data_inicio DESC');
    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar vw_militares_restricoes:', error);
    res.status(500).json({ error: 'Erro ao buscar militares com restrições' });
  }
});

app.get('/api/vw/resumo-civis-turno', async (req: any, res: any) => {
  try {
    const result = await db.query('SELECT * FROM vw_resumo_civis_turno ORDER BY data DESC, periodo DESC');
    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar vw_resumo_civis_turno:', error);
    res.status(500).json({ error: 'Erro ao buscar resumo de civis' });
  }
});

app.get('/api/vw/resumo-militares-turno', async (req: any, res: any) => {
  try {
    const result = await db.query('SELECT * FROM vw_resumo_militares_turno ORDER BY data DESC, periodo DESC');
    res.json(result);
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
    const tableStructure = await db.query(`
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
    const checkProc = await db.query(`
      SELECT ROUTINE_NAME 
      FROM INFORMATION_SCHEMA.ROUTINES 
      WHERE ROUTINE_SCHEMA = 'sci_recurso' AND ROUTINE_NAME = 'sp_criar_turno'
    `);
    console.log('Procedure existe:', checkProc.length > 0);
    
    if (checkProc.length === 0) {
      return res.status(500).json({ error: 'Procedure sp_criar_turno não encontrada' });
    }
    
    // Tentar executar a procedure
    console.log('Executando CALL sp_criar_turno com periodo:', periodoTeste);
    const result = await db.query('CALL sp_criar_turno(?, ?)', [data, periodoTeste]);
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
      await db.query('INSERT INTO turnos (id_turno, data, periodo) VALUES (?, ?, ?)', [v_id_turno, data, periodoTeste]);
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
    
    const result = await db.query('CALL sp_criar_turno(?, ?)', [data, periodo]);
    console.log('Resultado sp_criar_turno:', result);
    
    // MySQL procedures retornam multiple result sets
    const turnoResult = result[0] && result[0][0] ? result[0][0] : null;
    
    if (turnoResult) {
      res.json(turnoResult);
    } else {
      // Fallback: criar turno manualmente se a procedure falhar
      const v_id_turno = 'turno_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      await db.query('INSERT INTO turnos (id_turno, data, periodo) VALUES (?, ?, ?)', [v_id_turno, data, periodo]);
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
    const result = await db.query('CALL sp_efetivo_disponivel(?, ?)', [data, periodo]);
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
    const procedures = await db.query(`
      SELECT 'PROCEDURES' as object_type, ROUTINE_NAME as name, CREATED, LAST_ALTERED 
      FROM INFORMATION_SCHEMA.ROUTINES 
      WHERE ROUTINE_SCHEMA = 'sci_recurso' AND ROUTINE_TYPE = 'PROCEDURE'
    `);
    
    // Triggers
    const triggers = await db.query(`
      SELECT 'TRIGGERS' as object_type, TRIGGER_NAME as name, CREATED, ACTION_TIMING, EVENT_MANIPULATION
      FROM INFORMATION_SCHEMA.TRIGGERS 
      WHERE TRIGGER_SCHEMA = 'sci_recurso'
    `);
    
    // Views
    const views = await db.query(`
      SELECT 'VIEWS' as object_type, TABLE_NAME as name, CREATED, LAST_ALTERED
      FROM INFORMATION_SCHEMA.VIEWS 
      WHERE TABLE_SCHEMA = 'sci_recurso'
    `);
    
    // Functions
    const functions = await db.query(`
      SELECT 'FUNCTIONS' as object_type, ROUTINE_NAME as name, CREATED, LAST_ALTERED
      FROM INFORMATION_SCHEMA.ROUTINES 
      WHERE ROUTINE_SCHEMA = 'sci_recurso' AND ROUTINE_TYPE = 'FUNCTION'
    `);
    
    // Tabelas
    const tables = await db.query(`
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
    const logs = await db.query('SELECT * FROM logs_operacionais ORDER BY timestamp DESC');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar logs operacionais' });
  }
});

app.post('/api/logs', async (req: any, res: any) => {
  try {
    const { id, id_turno, timestamp, mensagem, categoria, usuario } = req.body;
    const result = await db.query(
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
    await db.query('DELETE FROM logs_operacionais WHERE id = ?', [id]);
    res.json({ message: 'Log operacional removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover log operacional' });
  }
});

// Usuários
app.get('/api/users', async (req: any, res: any) => {
  try {
    const users = await db.query('SELECT * FROM usuarios ORDER BY username');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

app.post('/api/users', async (req: any, res: any) => {
  try {
    const { id, username, nome, password, role } = req.body;
    const result = await db.query(
      'INSERT INTO usuarios (id, username, nome, password, role) VALUES (?, ?, ?, ?, ?)',
      [id, username, nome, password, role]
    );
    res.json({ id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

app.delete('/api/users/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM usuarios WHERE id = ?', [id]);
    res.json({ message: 'Usuário removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover usuário' });
  }
});

// Health check
app.get('/api/health', (req: any, res: any) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 API disponível em http://localhost:${PORT}/api`);
});

export default app;
