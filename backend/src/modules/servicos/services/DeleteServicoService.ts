import { prisma } from '../../../config/prisma';
import { AppError } from '../../../shared/errors/AppError';

export class DeleteServicoService {
  async execute(id: string, barbearia_id: string) {
    const servico = await prisma.servico.findFirst({
      where: { id, barbearia_id },
    });

    if (!servico) {
      throw new AppError('Serviço não encontrado.', 404);
    }

    // Exclusão Lógica: apenas inativa o serviço para não quebrar 
    // a integridade de relatórios e agendamentos antigos.
    await prisma.servico.update({
      where: { id },
      data: { ativo: false },
    });

    return;
  }
}
