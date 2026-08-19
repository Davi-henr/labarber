import { prisma } from '../../../config/prisma';
import { AppError } from '../../../shared/errors/AppError';
import { parseISO, addMinutes } from 'date-fns';
import { WebhookAgendamentoService } from '../../../shared/services/WebhookAgendamentoService';

interface IRequest {
  barbearia_id: string;
  nome_cliente: string;
  whatsapp_cliente: string;
  servico_id: string;
  barbeiro_id: string;
  data: string; // YYYY-MM-DD
  horario_inicio: string; // HH:mm
}

export class CreateAgendamentoService {
  async execute({
    barbearia_id,
    nome_cliente,
    whatsapp_cliente,
    servico_id,
    barbeiro_id,
    data,
    horario_inicio
  }: IRequest) {
    // 1. Cria ou atualiza o cliente (WhatsApp como chave na barbearia)
    let cliente = await prisma.cliente.findFirst({
      where: { barbearia_id, whatsapp: whatsapp_cliente }
    });

    if (!cliente) {
      cliente = await prisma.cliente.create({
        data: {
          barbearia_id,
          nome: nome_cliente,
          whatsapp: whatsapp_cliente
        }
      });
    } else if (cliente.nome !== nome_cliente) {
      cliente = await prisma.cliente.update({
        where: { id: cliente.id },
        data: { nome: nome_cliente }
      });
    }

    const servico = await prisma.servico.findFirst({
      where: { id: servico_id, barbearia_id }
    });

    if (!servico) throw new AppError('Serviço não encontrado', 404);

    const barbeiro = await prisma.usuario.findFirst({
      where: { id: barbeiro_id, barbearia_id }
    });

    if (!barbeiro) throw new AppError('Barbeiro não encontrado', 404);

    const [hh, mm] = horario_inicio.split(':').map(Number);
    const dataHoraInicio = parseISO(data);
    dataHoraInicio.setHours(hh, mm, 0, 0);

    const dataHoraFim = addMinutes(dataHoraInicio, servico.tempo_duracao_minutos);

    // 2. Trava de concorrência dupla
    const conflito = await prisma.agendamento.findFirst({
      where: {
        barbearia_id,
        barbeiro_id,
        status: { notIn: ['CANCELADO', 'FALTOU'] },
        AND: [
          { data_hora_inicio: { lt: dataHoraFim } },
          { data_hora_fim: { gt: dataHoraInicio } }
        ]
      }
    });

    if (conflito) {
      throw new AppError('Horário indisponível. Alguém acabou de agendar neste horário.', 409);
    }

    const valor_cobrado = servico.valor;
    
    // Se for ADMIN, lucro total para a barbearia (comissão 0 ou não repassada)
    const comissaoPercentual = barbeiro.role === 'ADMIN' ? 0 : Number(barbeiro.comissao_percentual);
    const valor_comissao = (Number(servico.valor) * comissaoPercentual) / 100;

    const agendamento = await prisma.agendamento.create({
      data: {
        barbearia_id,
        cliente_id: cliente.id,
        barbeiro_id,
        servico_id,
        data_hora_inicio: dataHoraInicio,
        data_hora_fim: dataHoraFim,
        status: 'PENDENTE',
        valor_cobrado,
        valor_comissao,
      }
    });
    
    // Dispara o webhook de forma assíncrona (fire-and-forget)
    const webhookService = new WebhookAgendamentoService();
    webhookService.execute(agendamento.id).catch(err => {
      console.error('Falha silenciosa no envio do webhook:', err.message);
    });

    return agendamento;
  }
}
