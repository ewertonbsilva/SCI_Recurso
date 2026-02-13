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

        console.log('✅ Conectado ao banco de dados MySQL');
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
