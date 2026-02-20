import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database connection variable
let connection: mysql.Connection | null = null;

/**
 * Initialize database connection
 */
export async function initializeDatabase(): Promise<mysql.Connection> {
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            database: process.env.DB_NAME || 'sci_recurso',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        // Tabela de Componentes da Equipe (Guearnição)
        await connection.query(`
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

        console.log('✅ Banco de dados inicializado com sucesso');
        return connection;
    } catch (error) {
        console.error('❌ Erro ao conectar ao banco de dados:', error);
        throw error;
    }
}

/**
 * Get database connection
 * @throws Error if database is not initialized
 */
export function getConnection(): mysql.Connection {
    if (!connection) {
        throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return connection;
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
    if (connection) {
        await connection.end();
        connection = null;
        console.log('🔌 Conexão com banco de dados fechada');
    }
}
