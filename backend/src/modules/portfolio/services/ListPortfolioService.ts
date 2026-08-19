import { prisma } from '../../../config/prisma';

export class ListPortfolioService {
  async execute(barbearia_id: string) {
    const portfolio = await prisma.portfolioCorte.findMany({
      where: { barbearia_id },
      orderBy: { criado_em: 'desc' }
    });

    return portfolio;
  }
}
