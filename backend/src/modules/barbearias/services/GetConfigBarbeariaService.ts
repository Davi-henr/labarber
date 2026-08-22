import { prisma } from '../../../config/prisma';

export class GetConfigBarbeariaService {
  async execute(barbearia_id: string) {
    const barbearia = await prisma.barbearia.findUnique({
      where: { id: barbearia_id },
      select: {
        nome: true,
        logo_url: true,
        endereco: true,
        historia_texto: true,
        cor_primaria: true,
        msg_confirmacao: true,
        msg_lembrete: true,
        msg_notificacao_barbeiro: true,
      }
    });

    return barbearia;
  }
}
