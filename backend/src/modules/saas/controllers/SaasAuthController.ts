import { Request, Response } from 'express';
import { prisma } from '../../../config/prisma';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { AppError } from '../../../shared/errors/AppError';

export class SaasAuthController {
  async login(req: Request, res: Response): Promise<Response> {
    const { email, senha } = req.body;

    const superAdmin = await prisma.superAdmin.findUnique({
      where: { email },
    });

    if (!superAdmin) {
      throw new AppError('Credenciais inválidas.', 401);
    }

    const passwordMatch = await compare(senha, superAdmin.senha_hash);

    if (!passwordMatch) {
      throw new AppError('Credenciais inválidas.', 401);
    }

    const token = sign({}, process.env.JWT_SECRET || 'default', {
      subject: superAdmin.id,
      expiresIn: '1d',
    });

    return res.json({
      admin: {
        id: superAdmin.id,
        email: superAdmin.email,
      },
      token,
    });
  }
}
