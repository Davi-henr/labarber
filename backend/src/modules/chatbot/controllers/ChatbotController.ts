import { Request, Response } from 'express';
import { z } from 'zod';
import { GetBarbeariaInfoService } from '../services/GetBarbeariaInfoService';
import { GetHorariosLivresService } from '../services/GetHorariosLivresService';
import { CreateAgendamentoService } from '../services/CreateAgendamentoService';

import { prisma } from '../../../config/prisma';
import { AppError } from '../../../shared/errors/AppError';

export class ChatbotController {
  private async resolveId(id_ou_slug: string): Promise<string> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id_ou_slug);
    if (isUuid) return id_ou_slug;

    const barbearia = await prisma.barbearia.findUnique({
      where: { slug: id_ou_slug },
      select: { id: true }
    });

    if (!barbearia) throw new AppError('Barbearia não encontrada', 404);
    return barbearia.id;
  }

  async info(request: Request, response: Response) {
    const { id } = request.params;
    const realId = await this.resolveId(id);

    const getInfo = new GetBarbeariaInfoService();
    const info = await getInfo.execute(realId);

    return response.json(info);
  }

  async horariosLivres(request: Request, response: Response) {
    const { id } = request.params;
    const realId = await this.resolveId(id);
    const { data, servico_id, barbeiro_id } = request.query;

    const querySchema = z.object({
      data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve ser YYYY-MM-DD'),
      servico_id: z.string().uuid(),
      barbeiro_id: z.string().uuid(),
    });

    const validatedQuery = querySchema.parse({ data, servico_id, barbeiro_id });

    const getHorarios = new GetHorariosLivresService();
    const horarios = await getHorarios.execute({
      barbearia_id: realId,
      ...validatedQuery,
    });

    return response.json(horarios);
  }

  async agendar(request: Request, response: Response) {
    const { id } = request.params;
    const realId = await this.resolveId(id);

    const agendarSchema = z.object({
      nome_cliente: z.string().min(1, 'Nome obrigatório'),
      whatsapp_cliente: z.string().min(10, 'WhatsApp obrigatório'),
      servico_id: z.string().uuid('ID de serviço inválido'),
      barbeiro_id: z.string().uuid('ID de barbeiro inválido'),
      data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve ser YYYY-MM-DD'),
      horario_inicio: z.string().regex(/^\d{2}:\d{2}$/, 'Horário deve ser HH:mm'),
    });

    const validatedData = agendarSchema.parse(request.body);

    const createAgendamento = new CreateAgendamentoService();
    const agendamento = await createAgendamento.execute({
      barbearia_id: realId,
      ...validatedData,
    });

    return response.status(201).json(agendamento);
  }
}
