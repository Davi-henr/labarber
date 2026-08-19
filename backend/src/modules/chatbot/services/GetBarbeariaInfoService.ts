import { prisma } from '../../../config/prisma';
import { AppError } from '../../../shared/errors/AppError';

export class GetBarbeariaInfoService {
  async execute(id_ou_slug: string) {
    // Na nossa modelagem inicial, não temos 'slug', usaremos o ID da barbearia diretamente.
    // Futuramente um slug pode ser adicionado.
    const barbearia = await prisma.barbearia.findUnique({
      where: { id: id_ou_slug },
      select: {
        id: true,
        nome: true,
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
