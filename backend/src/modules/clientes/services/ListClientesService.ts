import { prisma } from '../../../config/prisma';

export class ListClientesService {
  async execute(barbearia_id: string, targetBarbeiroId: string) {
    const clientes = await prisma.cliente.findMany({
      where: { 
        barbearia_id,
        agendamentos: {
          some: {
            barbeiro_id: targetBarbeiroId
          }
        }
      },
      include: {
        agendamentos: {
          where: { barbeiro_id: targetBarbeiroId },
          orderBy: { data_hora_inicio: 'desc' },
          take: 1,
          select: { data_hora_inicio: true, status: true, servico: { select: { nome: true } } }
        }
      },
      orderBy: { nome: 'asc' }
    });

    return clientes.map(cliente => {
      const ultimoAgendamento = cliente.agendamentos.length > 0 ? cliente.agendamentos[0] : null;
      return {
        id: cliente.id,
        nome: cliente.nome,
        whatsapp: cliente.whatsapp,
        ultimo_agendamento: ultimoAgendamento?.data_hora_inicio || null,
        ultimo_status: ultimoAgendamento?.status || null,
        corte_nome: ultimoAgendamento?.servico.nome || null,
        cliente_desde: cliente.criado_em
      };
    });
  }
}
