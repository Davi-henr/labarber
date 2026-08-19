import { prisma } from '../../../config/prisma';

interface IRequest {
  barbearia_id: string;
  nome: string;
  descricao?: string;
  valor: number;
  tempo_duracao_minutos: number;
}

export class CreateServicoService {
  async execute({ barbearia_id, nome, descricao, valor, tempo_duracao_minutos }: IRequest) {
    const servico = await prisma.servico.create({
      data: {
        barbearia_id,
        nome,
        descricao,
        valor,
        tempo_duracao_minutos,
      },
    });
    return servico;
  }
}
