import { prisma } from '../../../config/prisma';
import { AppError } from '../../../shared/errors/AppError';
import { startOfDay, endOfDay, parseISO, isValid } from 'date-fns';

interface Request {
  barbearia_id: string;
  user_id: string;
  user_role: string;
  data: string;
  barbeiro_id?: string;
}

export class ListAgendamentosService {
  async execute({ barbearia_id, user_id, user_role, data, barbeiro_id }: Request) {
    if (!data) {
      throw new AppError('A data é obrigatória');
    }

    const parsedDate = parseISO(data);
    if (!isValid(parsedDate)) {
      throw new AppError('Data formato inválido. Use YYYY-MM-DD');
    }

    // Regra de Trava de Permissão (Role)
    // Se o frontend não enviar barbeiro_id, por padrão visualiza a própria agenda
    let finalBarbeiroId = barbeiro_id || user_id;

    if (user_role === 'BARBEIRO') {
      // Ignora qualquer id passado e força o ID do usuário autenticado
      finalBarbeiroId = user_id;
    }

    // Filtros de segurança e isolamento multi-tenant
    const where: any = {
      barbearia_id, // Isolamento obrigatório
      data_hora_inicio: {
        gte: startOfDay(parsedDate),
        lte: endOfDay(parsedDate)
      }
    };

    if (finalBarbeiroId) {
      where.barbeiro_id = finalBarbeiroId;
    }

    const agendamentos = await prisma.agendamento.findMany({
      where,
      orderBy: {
        data_hora_inicio: 'asc'
      },
      include: {
        cliente: {
          select: {
            nome: true,
            whatsapp: true
          }
        },
        servico: {
          select: {
            id: true,
            nome: true,
            tempo_duracao_minutos: true,
            valor: true
          }
        },
        barbeiro: {
          select: {
            nome: true
          }
        }
      }
    });

    return agendamentos;
  }
}
