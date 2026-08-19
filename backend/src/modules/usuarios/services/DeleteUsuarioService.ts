import { prisma } from '../../../config/prisma';
import { AppError } from '../../../shared/errors/AppError';

export class DeleteUsuarioService {
  async execute(id: string, barbearia_id: string) {
    const usuario = await prisma.usuario.findFirst({
      where: { id, barbearia_id },
    });

    if (!usuario) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    if (usuario.role === 'ADMIN') {
        throw new AppError('Não é possível inativar o usuário administrador principal.', 403);
    }

    await prisma.usuario.update({
      where: { id },
      data: { ativo: false },
    });
  }
}
