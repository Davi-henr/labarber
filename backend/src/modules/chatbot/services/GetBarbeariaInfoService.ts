import { prisma } from '../../../config/prisma';
import { AppError } from '../../../shared/errors/AppError';

export class GetBarbeariaInfoService {
  async execute(id_ou_slug: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id_ou_slug);
    
    const barbearia = await prisma.barbearia.findFirst({
      where: isUuid ? { id: id_ou_slug } : { slug: id_ou_slug },
      select: {
        id: true,
        nome: true,
        slug: true,
        logo_url: true,
        cor_primaria: true,
        cor_secundaria: true,
        endereco: true,
        historia_texto: true,
        dias_funcionamento: true,
        horario_abertura: true,
        horario_fechamento: true,
      }
    });

    if (!barbearia) {
      throw new AppError('Barbearia não encontrada', 404);
    }

    const servicos = await prisma.servico.findMany({
      where: { barbearia_id: barbearia.id, ativo: true },
      select: { id: true, nome: true, descricao: true, valor: true, tempo_duracao_minutos: true },
      orderBy: { nome: 'asc' }
    });

    const barbeiros = await prisma.usuario.findMany({
      where: { barbearia_id: barbearia.id, ativo: true },
      select: { id: true, nome: true, foto_url: true },
      orderBy: { nome: 'asc' }
    });

    const portfolio = await prisma.portfolioCorte.findMany({
      where: { barbearia_id: barbearia.id },
      select: { id: true, imagem_url: true, legenda: true },
      orderBy: { criado_em: 'desc' }
    });

    return {
      barbearia,
      servicos,
      barbeiros,
      portfolio
    };
  }
}
