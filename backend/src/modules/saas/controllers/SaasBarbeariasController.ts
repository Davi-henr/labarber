import { Request, Response } from 'express';
import { prisma } from '../../../config/prisma';
import { hash } from 'bcryptjs';

export class SaasBarbeariasController {
  async index(req: Request, res: Response) {
    const barbearias = await prisma.barbearia.findMany({
      include: {
        _count: {
          select: { usuarios: true, clientes: true, agendamentos: true },
        },
        usuarios: {
          where: { role: 'ADMIN' },
          select: { nome: true, email: true, login: true },
        },
      },
      orderBy: { criado_em: 'desc' },
    });

    return res.json(barbearias);
  }

  async create(req: Request, res: Response) {
    const { nome, admin_nome, admin_email, admin_login, admin_senha } = req.body;

    // Verificar se o login ou email já existem
    const usuarioExists = await prisma.usuario.findFirst({
      where: {
        OR: [
          { login: admin_login },
          { email: admin_email },
        ]
      }
    });

    if (usuarioExists) {
      return res.status(400).json({ error: 'Login ou E-mail já utilizado por outro usuário no sistema.' });
    }

    const senha_hash = await hash(admin_senha, 8);

    const barbearia = await prisma.barbearia.create({
      data: {
        nome,
        usuarios: {
          create: {
            nome: admin_nome,
            email: admin_email,
            login: admin_login,
            senha_hash,
            role: 'ADMIN',
            precisa_redefinir_senha: true,
          }
        }
      },
      include: {
        usuarios: true
      }
    });

    return res.json(barbearia);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    const barbearia = await prisma.barbearia.findUnique({
      where: { id }
    });

    if (!barbearia) {
      return res.status(404).json({ error: 'Barbearia não encontrada' });
    }

    await prisma.barbearia.delete({
      where: { id }
    });

    return res.status(204).send();
  }
}
