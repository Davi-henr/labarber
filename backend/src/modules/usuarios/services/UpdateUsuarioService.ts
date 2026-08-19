import { prisma } from '../../../config/prisma';
import { AppError } from '../../../shared/errors/AppError';

interface IRequest {
  id: string;
  barbearia_id: string;
  nome?: string;
  whatsapp?: string;
  permissoes?: any;
  comissao_percentual?: number;
}

export class UpdateUsuarioService {
  async execute({ id, barbearia_id, nome, whatsapp, permissoes, comissao_percentual }: IRequest) {
    const usuario = await prisma.usuario.findFirst({
      where: { id, barbearia_id },
    });

    if (!usuario) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id },
      data: {
        nome,
        whatsapp,
        permissoes,
        comissao_percentual,
      },
      select: {
        id: true,
        nome: true,
        login: true,
        role: true,
        permissoes: true,
        comissao_percentual: true,
      }
    });

    return usuarioAtualizado;
  }
}
