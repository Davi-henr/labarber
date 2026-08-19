import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export function ensureAdmin(request: Request, response: Response, next: NextFunction): any {
  const { role } = request.user;

  if (role !== 'ADMIN') {
    throw new AppError('Acesso negado. Apenas administradores podem realizar esta ação.', 403);
  }

  return next();
}
