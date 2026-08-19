import { hash } from 'bcryptjs';
import { prisma } from '../../../config/prisma';
import { AppError } from '../../../shared/errors/AppError';

interface IRequest {
  barbearia_id: string;
  nome: string;
  login: string;
  whatsapp?: string;
  permissoes?: any;
  comissao_percentual?: number;
}

export class CreateUsuarioService {
  async execute({ barbearia_id, nome, login, whatsapp, permissoes, comissao_percentual }: IRequest) {
    const userExists = await prisma.usuario.findFirst({
      where: { barbearia_id, login },
    });

    if (userExists) {
      throw new AppError('Já existe um usuário com este login na sua barbearia.');
    }

    // Define a senha provisória sendo o próprio login e marca a flag para redefinição obrigatória
    const senha_hash = await hash(login, 8);

    const usuario = await prisma.usuario.create({
      data: {
        barbearia_id,
        nome,
        login,
        whatsapp,
        senha_hash,
        role: 'BARBEIRO',
        precisa_redefinir_senha: true,
        permissoes: permissoes || {},
        comissao_percentual,
      },
      select: {
        id: true,
        nome: true,
        login: true,
        role: true,
        ativo: true,
        permissoes: true,
        precisa_redefinir_senha: true,
        criado_em: true,
        comissao_percentual: true,
      }
    });

    return usuario;
  }
}
