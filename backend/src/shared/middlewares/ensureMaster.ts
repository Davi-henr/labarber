import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { AppError } from '../errors/AppError';

interface IPayload {
  sub: string;
}

export function ensureMaster(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError('Token JWT não fornecido', 401);
  }

  const [, token] = authHeader.split(' ');

  try {
    const { sub } = verify(token, process.env.JWT_SECRET || 'default') as IPayload;

    req.superAdmin = {
      id: sub,
    };

    return next();
  } catch (err) {
    throw new AppError('Token JWT inválido', 401);
  }
}
