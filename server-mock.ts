import express from 'express';
import cors from 'cors';

// Configuração global de fuso horário (Rio Branco, Acre: -05:00)
process.env.TZ = 'America/Rio_Branco';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock auth endpoints for development
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username && password) {
    const mockUser = {
      id: '1',
      username: username,
      nome: username === 'admin' ? 'Administrador' : 'Operador',
      role: username === 'admin' ? 'ADMIN' : 'OPERADOR'
    };
    
    res.json({
      user: mockUser,
      token: 'mock-jwt-token-' + Date.now()
    });
  } else {
    res.status(401).json({ error: 'Credenciais inválidas' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { username, nome, password, role } = req.body;
  
  if (username && nome && password) {
    const mockUser = {
      id: '1',
      username: username,
      nome: nome,
      role: role
    };
    
    res.json({
      user: mockUser,
      token: 'mock-jwt-token-' + Date.now()
    });
  } else {
    res.status(400).json({ error: 'Dados inválidos' });
  }
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer mock-jwt-token-')) {
    // Return mock user data
    res.json({
      id: '1',
      username: 'admin',
      nome: 'Administrador',
      role: 'ADMIN'
    });
  } else {
    res.status(401).json({ error: 'Token inválido' });
  }
});

// Mock data endpoints for development
app.get('/api/militares', (req, res) => {
  res.json([
    {
      matricula: '123456',
      nome_completo: 'João Silva',
      nome_guerra: 'Silva',
      id_posto_grad: 1,
      nome_posto_grad: 'Capitão',
      hierarquia: 1,
      id_forca: 1,
      nome_forca: 'Exército',
      rg: '123456789',
      cpoe: true,
      mergulhador: false,
      restricao_medica: false,
      id_ubm: 'UBM001',
      nome_ubm: '1ª Batalhão'
    },
    {
      matricula: '789012',
      nome_completo: 'Maria Santos',
      nome_guerra: 'Santos',
      id_posto_grad: 2,
      nome_posto_grad: 'Tenente',
      hierarquia: 2,
      id_forca: 1,
      nome_forca: 'Exército',
      rg: '987654321',
      cpoe: false,
      mergulhador: true,
      restricao_medica: false,
      id_ubm: 'UBM001',
      nome_ubm: '1ª Batalhão'
    }
  ]);
});

app.get('/api/civis', (req, res) => {
  res.json([
    {
      id_civil: 'CIV001',
      nome_completo: 'Carlos Oliveira',
      contato: '11999999999',
      id_orgao_origem: 1,
      nome_orgao: 'Polícia Civil',
      motorista: true,
      modelo_veiculo: 'Toyota Hilux',
      placa_veiculo: 'ABC1234'
    },
    {
      id_civil: 'CIV002',
      nome_completo: 'Ana Costa',
      contato: '11888888888',
      id_orgao_origem: 2,
      nome_orgao: 'Polícia Federal',
      motorista: false,
      modelo_veiculo: null,
      placa_veiculo: null
    }
  ]);
});

app.get('/api/equipes', (req, res) => {
  res.json([
    {
      id_equipe: 'EQUIPE001',
      nome_equipe: 'Equipe Alpha',
      id_turno: 'TURNO001',
      data_criacao: '2024-01-15',
      status: 'ATIVA'
    },
    {
      id_equipe: 'EQUIPE002',
      nome_equipe: 'Equipe Bravo',
      id_turno: 'TURNO002',
      data_criacao: '2024-01-16',
      status: 'ATIVA'
    }
  ]);
});

app.get('/api/', (req, res) => {
  res.json([
    {
      id_turno: 'TURNO001',
      data: '2024-01-15',
      periodo: 'DIURNO',
      status: 'CONCLUIDO',
      qtde_militares: 8,
      qtde_civis: 4
    },
    {
      id_turno: 'TURNO002',
      data: '2024-01-16',
      periodo: 'NOTURNO',
      status: 'EM_ANDAMENTO',
      qtde_militares: 6,
      qtde_civis: 3
    }
  ]);
});

app.get('/api/dashboard', (req, res) => {
  res.json({
    total_militares: 150,
    total_civis: 80,
    turnos_hoje: 2,
    equipes_ativas: 4,
    disponibilidade_diurno: 85,
    disponibilidade_noturno: 70
  });
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Servidor mock rodando na porta ${PORT}`);
  console.log(`📊 API disponível em http://192.168.88.2:${PORT}/api`);
});

export default app;
