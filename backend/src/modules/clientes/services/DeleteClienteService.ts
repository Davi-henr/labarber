import { prisma } from '../../../config/prisma';
import { AppError } from '../../../shared/errors/AppError';

export class DeleteClienteService {
  async execute(id: string, barbearia_id: string) {
    const cliente = await prisma.cliente.findFirst({
      where: { id, barbearia_id },
    });

    if (!cliente) {
      throw new AppError('Cliente não encontrado.', 404);
    }

    await prisma.agendamento.deleteMany({
      where: { cliente_id: id },
    });

    await prisma.cliente.delete({
      where: { id },
    });
  }
}
