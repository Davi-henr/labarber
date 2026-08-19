import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { prisma } from '../../../config/prisma';
import { AppError } from '../../../shared/errors/AppError';

interface IRequest {
  login: string;
  senhaInput: string;
}

export class AuthenticateUserService {
  async execute({ login, senhaInput }: IRequest) {
    // Como o login é único apenas por barbearia (UNIQUE barbearia_id, login),
    // podemos ter o mesmo login em barbearias diferentes. 
    // Em um cenário real multi-tenant completo, o login idealmente seria acompanhado do barbearia_id
    // vindo do subdomínio/URL, ou o login seria único globalmente.
    const users = await prisma.usuario.findMany({
      where: { login },
    });

    if (users.length === 0) {
      throw new AppError('Login ou senha incorretos.', 401);
    }

    if (users.length > 1) {
      throw new AppError('Múltiplos usuários encontrados com este login. O sistema requer a especificação da barbearia.', 401);
    }

    const user = users[0];

    const passwordMatch = await compare(senhaInput, user.senha_hash);

    if (!passwordMatch) {
      throw new AppError('Login ou senha incorretos.', 401);
    }

    if (!user.ativo) {
      throw new AppError('Usuário inativo.', 401);
    }

    const secret = process.env.JWT_SECRET || 'default_secret';

    const token = sign(
      {
        role: user.role,
        barbearia_id: user.barbearia_id,
      },
      secret,
      {
        subject: user.id,
        expiresIn: '1d',
      }
    );

    return {
      user: {
        id: user.id,
        nome: user.nome,
        login: user.login,
        role: user.role,
        barbearia_id: user.barbearia_id,
        precisa_redefinir_senha: user.precisa_redefinir_senha,
        permissoes: user.permissoes
      },
      token,
    };
  }
}
