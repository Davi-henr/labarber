import { Request, Response } from 'express';
import { z } from 'zod';
import { GetBarbeariaInfoService } from '../services/GetBarbeariaInfoService';
import { GetHorariosLivresService } from '../services/GetHorariosLivresService';
import { CreateAgendamentoService } from '../services/CreateAgendamentoService';

export class ChatbotController {
  async info(request: Request, response: Response) {
    const { id } = request.params;

    const getInfo = new GetBarbeariaInfoService();
    const info = await getInfo.execute(id);

    return response.json(info);
  }

  async horariosLivres(request: Request, response: Response) {
    const { id } = request.params;
    const { data, servico_id, barbeiro_id } = request.query;

    const querySchema = z.object({
      data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve ser YYYY-MM-DD'),
      servico_id: z.string().uuid(),
      barbeiro_id: z.string().uuid(),
    });

    const validatedQuery = querySchema.parse({ data, servico_id, barbeiro_id });

    const getHorarios = new GetHorariosLivresService();
    const horarios = await getHorarios.execute({
      barbearia_id: id,
      ...validatedQuery,
    });

    return response.json(horarios);
  }

  async agendar(request: Request, response: Response) {
    const { id } = request.params;

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
      barbearia_id: id,
      ...validatedData,
    });

    return response.status(201).json(agendamento);
  }
}
