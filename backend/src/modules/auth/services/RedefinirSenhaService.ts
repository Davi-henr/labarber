import { hash } from 'bcryptjs';
import { prisma } from '../../../config/prisma';
import { AppError } from '../../../shared/errors/AppError';

interface IRequest {
  user_id: string;
  nova_senha: string;
}

export class RedefinirSenhaService {
  async execute({ user_id, nova_senha }: IRequest) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: user_id },
    });

    if (!usuario) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    if (!usuario.precisa_redefinir_senha) {
      throw new AppError('Usuário não precisa redefinir a senha.', 400);
    }

    const senha_hash = await hash(nova_senha, 8);

    await prisma.usuario.update({
      where: { id: user_id },
      data: {
        senha_hash,
        precisa_redefinir_senha: false,
      },
    });
  }
}
