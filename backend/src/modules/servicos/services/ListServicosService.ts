import { prisma } from '../../../config/prisma';

export class ListServicosService {
  async execute(barbearia_id: string) {
    const servicos = await prisma.servico.findMany({
      where: {
        barbearia_id,
        ativo: true, // Por padrão, lista apenas serviços ativos para o chatbot/agenda
      },
      orderBy: {
        nome: 'asc',
      }
    });
    return servicos;
  }
}
