import { Request, Response } from 'express';
import { z } from 'zod';
import { CreateServicoService } from '../services/CreateServicoService';
import { ListServicosService } from '../services/ListServicosService';
import { UpdateServicoService } from '../services/UpdateServicoService';
import { DeleteServicoService } from '../services/DeleteServicoService';

export class ServicosController {
  async create(request: Request, response: Response) {
    const createSchema = z.object({
      nome: z.string().min(1, 'Nome é obrigatório'),
      descricao: z.string().optional(),
      valor: z.number().positive('Valor deve ser maior que zero'),
      tempo_duracao_minutos: z.number().int().positive('Tempo de duração deve ser maior que zero'),
    });

    const validatedData = createSchema.parse(request.body);
    const { barbearia_id } = request.user; 

    const createServico = new CreateServicoService();
    const servico = await createServico.execute({
      barbearia_id,
      ...validatedData,
    });

    return response.status(201).json(servico);
  }

  async index(request: Request, response: Response) {
    const { barbearia_id } = request.user;

    const listServicos = new ListServicosService();
    const servicos = await listServicos.execute(barbearia_id);

    return response.json(servicos);
  }

  async update(request: Request, response: Response) {
    const updateSchema = z.object({
      nome: z.string().min(1).optional(),
      descricao: z.string().optional(),
      valor: z.number().positive().optional(),
      tempo_duracao_minutos: z.number().int().positive().optional(),
      ativo: z.boolean().optional(),
    });

    const { id } = request.params;
    const validatedData = updateSchema.parse(request.body);
    const { barbearia_id } = request.user;

    const updateServico = new UpdateServicoService();
    const servico = await updateServico.execute({
      id,
      barbearia_id,
      ...validatedData,
    });

    return response.json(servico);
  }

  async delete(request: Request, response: Response) {
    const { id } = request.params;
    const { barbearia_id } = request.user;

    const deleteServico = new DeleteServicoService();
    await deleteServico.execute(id, barbearia_id);

    return response.status(204).send();
  }
}
