import { prisma } from '../../../config/prisma';
import AppError from '../../../shared/errors/AppError';

interface IRequest {
  barbearia_id: string;
  nome?: string;
  endereco?: string;
  historia_texto?: string;
  cor_primaria?: string;
  msg_confirmacao?: string;
  msg_lembrete?: string;
  msg_notificacao_barbeiro?: string;
  logo_url?: string;
}

export class UpdateConfigBarbeariaService {
  async execute({ barbearia_id, nome, endereco, historia_texto, cor_primaria, logo_url, msg_confirmacao, msg_lembrete, msg_notificacao_barbeiro }: IRequest) {
    const barbearia = await prisma.barbearia.findUnique({
      where: { id: barbearia_id }
    });

    if (!barbearia) {
      throw new AppError('Barbearia não encontrada', 404);
    }

    const updatedBarbearia = await prisma.barbearia.update({
      where: { id: barbearia_id },
      data: {
        ...(nome !== undefined && { nome }),
        ...(endereco !== undefined && { endereco }),
        ...(historia_texto !== undefined && { historia_texto }),
        ...(cor_primaria !== undefined && { cor_primaria }),
        ...(logo_url !== undefined && { logo_url }),
        ...(msg_confirmacao !== undefined && { msg_confirmacao }),
        ...(msg_lembrete !== undefined && { msg_lembrete }),
        ...(msg_notificacao_barbeiro !== undefined && { msg_notificacao_barbeiro })
      }
    });

    return updatedBarbearia;
  }
}
