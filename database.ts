import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

// Tipos básicos para mysql2
interface Connection {
  execute: (sql: string, params?: any[]) => Promise<[any, any]>;
  query: (sql: string, params?: any[]) => Promise<any>;
  end: () => Promise<void>;
}

interface Pool {
  execute: (sql: string, params?: any[]) => Promise<[any, any]>;
  query: (sql: string, params?: any[]) => Promise<any>;
  getConnection: () => Promise<Connection>;
  end: () => Promise<void>;
}

const config: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sci_recurso'
};

class Database {
  private static instance: Database;
  private connection: Connection | null = null;
  private pool: Pool | null = null;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    try {
      if (!this.pool) {
        this.pool = mysql.createPool({
          ...config,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0
        });
        console.log('✅ Conectado ao banco de dados MySQL');
      }
    } catch (error) {
      console.error('❌ Erro ao conectar ao banco de dados:', error);
      throw error;
    }
  }

  public async getConnection(): Promise<Connection> {
    if (!this.pool) {
      await this.connect();
    }
    return this.pool!.getConnection();
  }

  public async query(sql: string, params?: any[]): Promise<any> {
    if (!this.pool) {
      await this.connect();
    }
    
    try {
      const [rows] = await this.pool!.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('❌ Erro na consulta SQL:', error);
      throw error;
    }
  }

  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log('🔌 Conexão com o banco de dados encerrada');
    }
  }
}

export default Database;
