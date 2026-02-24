import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { createError } from './errorHandler';

/**
 * Middleware para validação de payload (req.body) utilizando Zod schemas.
 * Se a validação falhar, retorna erro 400 com os detalhes formatados.
 */
export const validateBody = (schema: z.ZodSchema) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            // Faz o parse do body com o schema providenciado. Usa parseAsync por segurança caso haja transformações async.
            // A tipagem de req.body é atualizada para refletir o tipo validado pelo schema.
            req.body = await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                // Mapeia os erros do Zod para uma string legível.
                const errorMessages = (error as any).errors.map((issue) => {
                    // issue.path pode ser um array de strings ou numbers, join('.') é seguro.
                    const path = issue.path.length > 0 ? issue.path.join('.') : 'body';
                    return `${path}: ${issue.message}`;
                }).join(', ');
                next(createError(`Dados inválidos: ${errorMessages}`, 400));
            } else {
                // Para outros tipos de erro que não sejam ZodError.
                next(createError('Erro na validação de dados', 500));
            }
        }
    };
};

// ── SCHEMAS GLOBAIS MAIS COMUNS ─────────────────────────────────────────────

export const authSchema = z.object({
    username: z.string().min(1, 'Usuário é obrigatório'),
    password: z.string().min(1, 'Senha é obrigatória'),
});

export const turnoSchema = z.object({
    data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
    // Corrigido: 'message' é usado para customizar a mensagem de erro para valores de enum inválidos.
    periodo: z.enum(['Manhã', 'Tarde', 'Noite'], { message: 'Período inválido (deve ser Manhã, Tarde ou Noite)' }),
});

export const chamadaMilitarSchema = z.object({
    id_chamada_militar: z.string().min(1, 'ID da chamada militar é obrigatório'),
    id_turno: z.string().min(1, 'ID do turno é obrigatório'),
    matricula: z.string().min(1, 'Matrícula é obrigatória'),
    funcao: z.string().optional(),
    presenca: z.boolean().optional(),
    obs: z.string().optional().nullable(),
});

export const militarSchema = z.object({
    matricula: z.string().min(1, 'Matrícula é obrigatória'),
    nome_completo: z.string().min(1, 'Nome e obrigatório'),
    // Usando .min(1) para garantir que o número seja positivo e, implicitamente, que o campo não seja nulo/indefinido.
    id_posto_grad: z.number().min(1, 'Posto/Graduação é obrigatório'),
    nome_guerra: z.string().min(1, 'Nome de guerra é obrigatório'),
    rg: z.string().optional().nullable(),
    // Usando .min(1) para garantir que o número seja positivo e, implicitamente, que o campo não seja nulo/indefinido.
    id_forca: z.number().min(1, 'Força é obrigatória'),
    cpoe: z.boolean().optional(),
    mergulhador: z.boolean().optional(),
    restricao_medica: z.boolean().optional(),
    desc_rest_med: z.string().optional().nullable(),
    id_ubm: z.number().optional().nullable(),
});
