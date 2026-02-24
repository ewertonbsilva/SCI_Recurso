import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
    status?: number;
    details?: string;
    code?: string;
    sqlMessage?: string;
}

/**
 * Middleware global de tratamento de erros.
 * Captura todos os erros passados via next(error) nas rotas.
 */
export function errorHandler(
    err: AppError,
    req: Request,
    res: Response,
    _next: NextFunction
): void {
    const status = err.status || 500;

    // Log centralizado
    console.error(`[ERROR] ${req.method} ${req.path} →`, {
        message: err.message,
        status,
        ...(err.sqlMessage && { sqlMessage: err.sqlMessage }),
        ...(err.code && { code: err.code }),
    });

    res.status(status).json({
        error: err.message || 'Erro interno do servidor',
        ...(err.details && { details: err.details }),
        ...(process.env.NODE_ENV !== 'production' && err.stack && { stack: err.stack }),
    });
}

/**
 * Helper para criar erros com status HTTP.
 */
export function createError(message: string, status = 500, details?: string): AppError {
    const err: AppError = new Error(message);
    err.status = status;
    if (details) err.details = details;
    return err;
}
