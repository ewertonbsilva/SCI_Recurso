import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database connection pool variable
let pool: mysql.Pool | null = null;

/**
 * Initialize database connection pool
 */
export async function initializeDatabase(): Promise<mysql.Pool> {
    try {
        pool = mysql.createPool({
            host: process.env.DB_HOST || '192.168.88.2',
            port: parseInt(process.env.DB_PORT || '3306'),
            database: process.env.DB_NAME || 'sci_recurso',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            timezone: '-05:00',
            waitForConnections: true,
            connectionLimit: 10,
            maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
            idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0
        });

        // Tabela de Componentes da Equipe (Guearnição)
        await pool.query(`
      CREATE TABLE IF NOT EXISTS componentes_equipe (
        id_componente VARCHAR(36) PRIMARY KEY,
        id_equipe VARCHAR(36) NOT NULL,
        id_chamada_militar VARCHAR(36) NOT NULL,
        id_turno VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_equipe) REFERENCES equipes(id_equipe) ON DELETE CASCADE,
        FOREIGN KEY (id_chamada_militar) REFERENCES chamada_militar(id_chamada_militar) ON DELETE CASCADE,
        FOREIGN KEY (id_turno) REFERENCES turnos(id_turno) ON DELETE CASCADE
      )
    `);

        // Tabela de Logs do Sistema
        await pool.query(`
      CREATE TABLE IF NOT EXISTS logs_sistema (
        id_log VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        usuario VARCHAR(100) NOT NULL,
        acao VARCHAR(50) NOT NULL,
        entidade VARCHAR(50) NOT NULL,
        registro_id VARCHAR(36),
        descricao TEXT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Índices para performance (versão compatível com MySQL)
        try {
            await pool.query(`
        CREATE INDEX idx_logs_data_hora ON logs_sistema(data_hora DESC)
      `);
        } catch (error: any) {
            // Ignorar erro se índice já existir
            if (error.code !== 'ER_DUP_KEYNAME') {
                console.warn('Aviso ao criar índice idx_logs_data_hora:', error.message);
            }
        }
        
        try {
            await pool.query(`
        CREATE INDEX idx_logs_usuario ON logs_sistema(usuario)
      `);
        } catch (error: any) {
            if (error.code !== 'ER_DUP_KEYNAME') {
                console.warn('Aviso ao criar índice idx_logs_usuario:', error.message);
            }
        }
        
        try {
            await pool.query(`
        CREATE INDEX idx_logs_acao ON logs_sistema(acao)
      `);
        } catch (error: any) {
            if (error.code !== 'ER_DUP_KEYNAME') {
                console.warn('Aviso ao criar índice idx_logs_acao:', error.message);
            }
        }

        console.log('✅ Banco de dados inicializado com sucesso (Connection Pool)');
        return pool;
    } catch (error) {
        console.error('❌ Erro ao conectar ao banco de dados:', error);
        throw error;
    }
}

/**
 * Get database pool instance.
 * It provides the same query() interface as a single connection.
 * @throws Error if database is not initialized
 */
export function getConnection(): mysql.Pool {
    if (!pool) {
        throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return pool;
}

/**
 * Close database pool
 */
export async function closeDatabase(): Promise<void> {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('🔌 Conexão com banco de dados (pool) fechada');
    }
}
