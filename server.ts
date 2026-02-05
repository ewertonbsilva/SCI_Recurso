const express = require('express');
const cors = require('cors');
const Database = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database instance
const db = Database.getInstance();

// Initialize database connection
db.connect().catch(console.error);

// Routes
app.get('/api/turnos', async (req: any, res: any) => {
  try {
    const turnos = await db.query('SELECT * FROM turnos ORDER BY data DESC, periodo DESC');
    res.json(turnos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar turnos' });
  }
});

app.post('/api/turnos', async (req: any, res: any) => {
  try {
    const { data, periodo } = req.body;
    const result = await db.query(
      'INSERT INTO turnos (data, periodo) VALUES (?, ?)',
      [data, periodo]
    );
    res.json({ id: result.insertId, data, periodo });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar turno' });
  }
});

app.delete('/api/turnos/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM turnos WHERE id_turno = ?', [id]);
    res.json({ message: 'Turno removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover turno' });
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
    const { matricula, nome_completo, posto_grad, nome_guerra, rg, forca, cpoe, mergulhador, restricao_medica, desc_rest_med } = req.body;
    const result = await db.query(
      'INSERT INTO militares (matricula, nome_completo, posto_grad, nome_guerra, rg, forca, cpoe, mergulhador, restricao_medica, desc_rest_med) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [matricula, nome_completo, posto_grad, nome_guerra, rg, forca, cpoe, mergulhador, restricao_medica, desc_rest_med]
    );
    res.json({ matricula, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar militar' });
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
    const { id_civil, nome_completo, contato, orgao_origem, motorista, modelo_veiculo, placa_veiculo } = req.body;
    const result = await db.query(
      'INSERT INTO civis (id_civil, nome_completo, contato, orgao_origem, motorista, modelo_veiculo, placa_veiculo) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id_civil, nome_completo, contato, orgao_origem, motorista, modelo_veiculo, placa_veiculo]
    );
    res.json({ id_civil, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar civil' });
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
