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
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            database: process.env.DB_NAME || 'sci_recurso',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
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
