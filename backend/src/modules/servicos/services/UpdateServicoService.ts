import { prisma } from '../../../config/prisma';
import { AppError } from '../../../shared/errors/AppError';

interface IRequest {
  id: string;
  barbearia_id: string;
  nome?: string;
  descricao?: string;
  valor?: number;
  tempo_duracao_minutos?: number;
  ativo?: boolean;
}

export class UpdateServicoService {
  async execute({ id, barbearia_id, ...data }: IRequest) {
    const servico = await prisma.servico.findFirst({
      where: { id, barbearia_id },
    });

    if (!servico) {
      throw new AppError('Serviço não encontrado.', 404);
    }

    const servicoAtualizado = await prisma.servico.update({
      where: { id },
      data,
    });

    return servicoAtualizado;
  }
}
