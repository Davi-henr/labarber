import { Request, Response } from 'express';
import { CreateBarbeariaService } from '../services/CreateBarbeariaService';
import { UpdateConfigBarbeariaService } from '../services/UpdateConfigBarbeariaService';
import { GetConfigBarbeariaService } from '../services/GetConfigBarbeariaService';
import { z } from 'zod';

export class BarbeariasController {
  async getConfig(request: Request, response: Response) {
    const barbearia_id = request.user.barbearia_id;
    const getConfigBarbearia = new GetConfigBarbeariaService();
    const config = await getConfigBarbearia.execute(barbearia_id);
    return response.json(config);
  }

  async create(request: Request, response: Response) {
    const createSchema = z.object({
      nomeBarbearia: z.string().min(1, 'Nome da barbearia é obrigatório'),
      nomeAdmin: z.string().min(1, 'Nome do admin é obrigatório'),
      emailAdmin: z.string().email('Email inválido'),
      loginAdmin: z.string().min(1, 'Login é obrigatório'),
      senhaAdmin: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    });

    const validatedData = createSchema.parse(request.body);

    const createBarbearia = new CreateBarbeariaService();

    const barbearia = await createBarbearia.execute(validatedData);

    return response.status(201).json(barbearia);
  }
  async updateConfig(request: Request, response: Response) {
    const updateSchema = z.object({
      nome: z.string().min(1).optional(),
      endereco: z.string().optional(),
      historia_texto: z.string().optional(),
      cor_primaria: z.string().optional()
    });

    const validatedData = updateSchema.parse(request.body);
    const barbearia_id = request.user.barbearia_id;

    // Se houver arquivo de logo enviado
    let logo_url;
    if (request.file) {
      logo_url = `/uploads/${request.file.filename}`;
    }

    const updateConfigBarbearia = new UpdateConfigBarbeariaService();

    const barbearia = await updateConfigBarbearia.execute({
      barbearia_id,
      ...validatedData,
      logo_url
    });

    return response.json(barbearia);
  }
}
