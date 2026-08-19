import { Request, Response } from 'express';
import { CreatePortfolioService } from '../services/CreatePortfolioService';
import { ListPortfolioService } from '../services/ListPortfolioService';
import { DeletePortfolioService } from '../services/DeletePortfolioService';
import { z } from 'zod';

export class PortfolioController {
  async create(request: Request, response: Response) {
    const barbearia_id = request.user.barbearia_id;
    const createSchema = z.object({
      legenda: z.string().optional()
    });

    const validatedData = createSchema.parse(request.body);

    if (!request.file) {
      return response.status(400).json({ message: 'Arquivo de imagem não enviado' });
    }

    const imagem_url = `/uploads/${request.file.filename}`;

    const createPortfolio = new CreatePortfolioService();
    const portfolio = await createPortfolio.execute({
      barbearia_id,
      imagem_url,
      legenda: validatedData.legenda
    });

    return response.status(201).json(portfolio);
  }

  async index(request: Request, response: Response) {
    const barbearia_id = request.user.barbearia_id;
    const listPortfolio = new ListPortfolioService();
    const portfolio = await listPortfolio.execute(barbearia_id);
    return response.json(portfolio);
  }

  async delete(request: Request, response: Response) {
    const { id } = request.params;
    const barbearia_id = request.user.barbearia_id;

    const deletePortfolio = new DeletePortfolioService();
    await deletePortfolio.execute(id, barbearia_id);

    return response.status(204).send();
  }
}
