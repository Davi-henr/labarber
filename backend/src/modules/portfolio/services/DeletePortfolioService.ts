import { prisma } from '../../../config/prisma';
import AppError from '../../../shared/errors/AppError';

export class DeletePortfolioService {
  async execute(id: string, barbearia_id: string) {
    const portfolio = await prisma.portfolioCorte.findFirst({
      where: { id, barbearia_id }
    });

    if (!portfolio) {
      throw new AppError('Foto não encontrada', 404);
    }

    await prisma.portfolioCorte.delete({
      where: { id }
    });
  }
}
