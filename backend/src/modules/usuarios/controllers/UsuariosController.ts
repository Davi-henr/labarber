import { Request, Response } from 'express';
import { z } from 'zod';
import { CreateUsuarioService } from '../services/CreateUsuarioService';
import { ListUsuariosService } from '../services/ListUsuariosService';
import { UpdateUsuarioService } from '../services/UpdateUsuarioService';
import { DeleteUsuarioService } from '../services/DeleteUsuarioService';
import { UpdateFotoUsuarioService } from '../services/UpdateFotoUsuarioService';

export class UsuariosController {
  async create(request: Request, response: Response) {
    const createSchema = z.object({
      nome: z.string().min(1, 'Nome obrigatório'),
      login: z.string().min(1, 'Login obrigatório'),
      whatsapp: z.string().optional(),
      permissoes: z.any().optional(),
      comissao_percentual: z.number().min(0).max(100).optional(),
    });

    const validatedData = createSchema.parse(request.body);
    const { barbearia_id } = request.user; 

    const createUsuario = new CreateUsuarioService();
    const usuario = await createUsuario.execute({
      barbearia_id,
      ...validatedData,
    });

    return response.status(201).json(usuario);
  }

  async index(request: Request, response: Response) {
    const { barbearia_id } = request.user;

    const listUsuarios = new ListUsuariosService();
    const usuarios = await listUsuarios.execute(barbearia_id);

    return response.json(usuarios);
  }

  async update(request: Request, response: Response) {
    const updateSchema = z.object({
      nome: z.string().min(1).optional(),
      whatsapp: z.string().optional(),
      permissoes: z.any().optional(),
      comissao_percentual: z.number().min(0).max(100).optional(),
    });

    const { id } = request.params;
    const validatedData = updateSchema.parse(request.body);
    const { barbearia_id } = request.user;

    const updateUsuario = new UpdateUsuarioService();
    const usuario = await updateUsuario.execute({
      id,
      barbearia_id,
      ...validatedData,
    });

    return response.json(usuario);
  }

  async delete(request: Request, response: Response) {
    const { id } = request.params;
    const { barbearia_id } = request.user;

    const deleteUsuario = new DeleteUsuarioService();
    await deleteUsuario.execute(id, barbearia_id);

    return response.status(204).send();
  }
  async updateFoto(request: Request, response: Response) {
    const barbearia_id = request.user.barbearia_id;
    const { id } = request.params;

    if (!request.file) {
      return response.status(400).json({ message: 'Arquivo de foto não enviado' });
    }

    const foto_url = `/uploads/${request.file.filename}`;

    const updateFotoUsuario = new UpdateFotoUsuarioService();
    const usuario = await updateFotoUsuario.execute({
      usuario_id: id,
      barbearia_id,
      foto_url
    });

    return response.json(usuario);
  }
}
