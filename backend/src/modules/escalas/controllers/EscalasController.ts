import { Request, Response } from 'express';
import { GetEscalaService } from '../services/GetEscalaService';
import { SaveEscalaService } from '../services/SaveEscalaService';

export class EscalasController {
  async getEscala(req: Request, res: Response): Promise<Response> {
    const { id: user_id, role: user_role } = req.user;
    const { barbeiro_id } = req.query;

    const getEscalaService = new GetEscalaService();

    const escala = await getEscalaService.execute({
      user_id,
      user_role,
      barbeiro_id: barbeiro_id as string | undefined
    });

    return res.json(escala);
  }

  async saveEscala(req: Request, res: Response): Promise<Response> {
    const { id: user_id, role: user_role } = req.user;
    const { barbeiro_id, escalas } = req.body;

    const saveEscalaService = new SaveEscalaService();

    const result = await saveEscalaService.execute({
      user_id,
      user_role,
      barbeiro_id,
      escalas
    });

    return res.json(result);
  }

  async getAll(req: Request, res: Response): Promise<Response> {
    const { barbearia_id } = req.user;
    
    const { prisma } = require('../../../config/prisma');

    const barbeiros = await prisma.usuario.findMany({
      where: { barbearia_id, ativo: true },
      select: {
        id: true,
        nome: true,
        escalas: {
          orderBy: { dia_semana: 'asc' }
        }
      }
    });

    return res.json(barbeiros);
  }
}
