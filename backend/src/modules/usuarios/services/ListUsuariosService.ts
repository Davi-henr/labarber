import { prisma } from '../../../config/prisma';

export class ListUsuariosService {
  async execute(barbearia_id: string) {
    const usuarios = await prisma.usuario.findMany({
      where: {
        barbearia_id,
        ativo: true,
      },
      select: {
        id: true,
        nome: true,
        login: true,
        whatsapp: true,
        role: true,
        ativo: true,
        permissoes: true,
        comissao_percentual: true,
        precisa_redefinir_senha: true,
      },
      orderBy: {
        nome: 'asc'
      }
    });
    return usuarios;
  }
}
