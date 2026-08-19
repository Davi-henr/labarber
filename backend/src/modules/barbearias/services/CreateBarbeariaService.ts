import { hash } from 'bcryptjs';
import { prisma } from '../../../config/prisma';
import { AppError } from '../../../shared/errors/AppError';

interface IRequest {
  nomeBarbearia: string;
  nomeAdmin: string;
  emailAdmin: string;
  loginAdmin: string;
  senhaAdmin: string;
}

export class CreateBarbeariaService {
  async execute({
    nomeBarbearia,
    nomeAdmin,
    emailAdmin,
    loginAdmin,
    senhaAdmin,
  }: IRequest) {
    if (emailAdmin) {
      const emailExists = await prisma.usuario.findUnique({
        where: { email: emailAdmin },
      });

      if (emailExists) {
        throw new AppError('Endereço de e-mail já utilizado.', 400);
      }
    }

    const senhaHash = await hash(senhaAdmin, 8);

    const barbearia = await prisma.$transaction(async (tx) => {
      const newBarbearia = await tx.barbearia.create({
        data: {
          nome: nomeBarbearia,
          dias_funcionamento: '1,2,3,4,5,6',
        },
      });

      await tx.usuario.create({
        data: {
          barbearia_id: newBarbearia.id,
          nome: nomeAdmin,
          email: emailAdmin,
          login: loginAdmin,
          senha_hash: senhaHash,
          role: 'ADMIN',
          precisa_redefinir_senha: false,
          permissoes: {}, 
        },
      });

      return newBarbearia;
    });

    return barbearia;
  }
}
