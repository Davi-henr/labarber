import { prisma } from '../../../config/prisma';

interface Request {
  user_id: string;
  user_role: string;
  barbeiro_id?: string;
}

export class GetEscalaService {
  async execute({ user_id, user_role, barbeiro_id }: Request) {
    const finalBarbeiroId = user_role === 'BARBEIRO' ? user_id : (barbeiro_id || user_id);

    const escalas = await prisma.barbeiroEscala.findMany({
      where: { barbeiro_id: finalBarbeiroId },
      orderBy: { dia_semana: 'asc' }
    });

    return escalas;
  }
}
