import { prisma } from '../../../config/prisma';

interface IRequest {
  barbearia_id: string;
  imagem_url: string;
  legenda?: string;
}

export class CreatePortfolioService {
  async execute({ barbearia_id, imagem_url, legenda }: IRequest) {
    const portfolio = await prisma.portfolioCorte.create({
      data: {
        barbearia_id,
        imagem_url,
        legenda
      }
    });

    return portfolio;
  }
}
