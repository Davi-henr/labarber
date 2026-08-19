import { Request, Response } from 'express';
import { prisma } from '../../../config/prisma';
import { ListAgendamentosService } from '../services/ListAgendamentosService';
import { parseISO, addMinutes } from 'date-fns';
import { AppError } from '../../../shared/errors/AppError';

export class AgendamentosController {
  async index(req: Request, res: Response): Promise<Response> {
    const { barbearia_id, id: user_id, role: user_role } = req.user;
    const { data, barbeiro_id } = req.query;

    const listAgendamentos = new ListAgendamentosService();

    const agendamentos = await listAgendamentos.execute({
      barbearia_id,
      user_id,
      user_role,
      data: data as string,
      barbeiro_id: barbeiro_id as string | undefined
    });

    return res.json(agendamentos);
  }

  async updateStatus(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { barbearia_id } = req.user;
    const { status } = req.body;

    const validStatuses = ['PENDENTE', 'CONFIRMADO', 'CONCLUIDO', 'FALTOU', 'CANCELADO'];
    if (!status || !validStatuses.includes(status)) {
      throw new AppError('Status inválido', 400);
    }

    const agendamento = await prisma.agendamento.findFirst({
      where: { id, barbearia_id }
    });

    if (!agendamento) {
      throw new AppError('Agendamento não encontrado', 404);
    }

    await prisma.agendamento.update({
      where: { id },
      data: { status }
    });

    return res.status(204).send();
  }

  async remarcar(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { barbearia_id } = req.user;
    const { data, horario_inicio, barbeiro_id } = req.body;

    const agendamento = await prisma.agendamento.findFirst({
      where: { id, barbearia_id },
      include: { servico: true }
    });

    if (!agendamento) throw new AppError('Agendamento não encontrado', 404);

    const [hh, mm] = horario_inicio.split(':').map(Number);
    const dataHoraInicio = parseISO(data);
    dataHoraInicio.setHours(hh, mm, 0, 0);

    const dataHoraFim = addMinutes(dataHoraInicio, agendamento.servico.tempo_duracao_minutos);

    // Checar conflito
    const conflito = await prisma.agendamento.findFirst({
      where: {
        barbearia_id,
        barbeiro_id: barbeiro_id || agendamento.barbeiro_id,
        id: { not: id }, // ignorar o proprio
        status: { notIn: ['CANCELADO', 'FALTOU'] },
        AND: [
          { data_hora_inicio: { lt: dataHoraFim } },
          { data_hora_fim: { gt: dataHoraInicio } }
        ]
      }
    });

    if (conflito) throw new AppError('Horário indisponível.', 409);

    const agendamentoAtualizado = await prisma.agendamento.update({
      where: { id },
      data: {
        data_hora_inicio: dataHoraInicio,
        data_hora_fim: dataHoraFim,
        barbeiro_id: barbeiro_id || agendamento.barbeiro_id
      }
    });

    return res.json(agendamentoAtualizado);
  }

  async delete(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { barbearia_id } = req.user;

    const agendamento = await prisma.agendamento.findFirst({
      where: { id, barbearia_id }
    });

    if (!agendamento) throw new AppError('Agendamento não encontrado', 404);

    const clienteId = agendamento.cliente_id;

    // Primeiro exclui o agendamento
    await prisma.agendamento.delete({
      where: { id }
    });

    // Depois verifica se o cliente ficou órfão de agendamentos
    const countRestantes = await prisma.agendamento.count({
      where: { cliente_id: clienteId }
    });

    if (countRestantes === 0) {
      await prisma.cliente.delete({
        where: { id: clienteId }
      });
    }

    return res.status(204).send();
  }
}
