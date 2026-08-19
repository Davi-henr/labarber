import { prisma } from '../../../config/prisma';
import AppError from '../../../shared/errors/AppError';

interface IRequest {
  usuario_id: string;
  barbearia_id: string;
  foto_url: string;
}

export class UpdateFotoUsuarioService {
  async execute({ usuario_id, barbearia_id, foto_url }: IRequest) {
    const usuario = await prisma.usuario.findFirst({
      where: { id: usuario_id, barbearia_id }
    });

    if (!usuario) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const updatedUsuario = await prisma.usuario.update({
      where: { id: usuario_id },
      data: { foto_url }
    });

    return updatedUsuario;
  }
}
