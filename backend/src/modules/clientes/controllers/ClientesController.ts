import { Request, Response } from 'express';
import { ListClientesService } from '../services/ListClientesService';
import { DeleteClienteService } from '../services/DeleteClienteService';

export class ClientesController {
  async index(req: Request, res: Response): Promise<Response> {
    const { barbearia_id, id: user_id, role } = req.user;
    const { barbeiro_id } = req.query;

    let targetBarbeiroId = barbeiro_id ? String(barbeiro_id) : user_id;
    if (role === 'BARBEIRO') {
      targetBarbeiroId = user_id;
    }

    const listClientes = new ListClientesService();
    const clientes = await listClientes.execute(barbearia_id, targetBarbeiroId);

    return res.json(clientes);
  }

  async delete(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { barbearia_id } = req.user;

    const deleteCliente = new DeleteClienteService();
    await deleteCliente.execute(id, barbearia_id);

    return res.status(204).send();
  }
}
