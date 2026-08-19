import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { AppError } from '../errors/AppError';

interface IPayload {
  sub: string;
  role: string;
  barbearia_id: string;
}

export function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction
): any {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new AppError('Token JWT está faltando', 401);
  }

  const [, token] = authHeader.split(' ');

  try {
    const secret = process.env.JWT_SECRET || 'default_secret';
    const decoded = verify(token, secret);

    const { sub, role, barbearia_id } = decoded as IPayload;

    request.user = {
      id: sub,
      role,
      barbearia_id,
    };

    return next();
  } catch (err) {
    throw new AppError('Token JWT inválido', 401);
  }
}
