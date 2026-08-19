import { prisma } from '../../../config/prisma';

interface EscalaItem {
  dia_semana: number;
  turno1_inicio: string;
  turno1_fim: string;
  turno2_inicio?: string;
  turno2_fim?: string;
  ativo: boolean;
}

interface Request {
  user_id: string;
  user_role: string;
  barbeiro_id?: string;
  escalas: EscalaItem[];
}

export class SaveEscalaService {
  async execute({ user_id, user_role, barbeiro_id, escalas }: Request) {
    const finalBarbeiroId = user_role === 'BARBEIRO' ? user_id : (barbeiro_id || user_id);

    await prisma.barbeiroEscala.deleteMany({
      where: { barbeiro_id: finalBarbeiroId }
    });

    const toInsert = escalas.map(e => ({
      barbeiro_id: finalBarbeiroId,
      dia_semana: e.dia_semana,
      turno1_inicio: new Date(`1970-01-01T${e.turno1_inicio}:00Z`),
      turno1_fim: new Date(`1970-01-01T${e.turno1_fim}:00Z`),
      turno2_inicio: e.turno2_inicio ? new Date(`1970-01-01T${e.turno2_inicio}:00Z`) : null,
      turno2_fim: e.turno2_fim ? new Date(`1970-01-01T${e.turno2_fim}:00Z`) : null,
      ativo: e.ativo
    }));

    await prisma.barbeiroEscala.createMany({
      data: toInsert
    });
    
    return { message: 'Escala salva com sucesso' };
  }
}
