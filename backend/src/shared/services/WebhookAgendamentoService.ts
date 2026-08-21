import axios from 'axios';
import { prisma } from '../../config/prisma';
import { renderMessageTemplate } from '../utils/renderMessageTemplate';

interface AgendamentoPayload {
  agendamento_id: string;
  barbearia_id: string;
  cliente_nome: string;
  cliente_whatsapp: string;
  barbeiro_nome: string;
  barbeiro_telefone?: string; // Se existir no db
  servico_nome: string;
  data_hora_inicio: string;
  instancia_whatsapp?: string | null;
  msg_confirmacao_pronta?: string;
  msg_notificacao_barbeiro_pronta?: string;
}

export class WebhookAgendamentoService {
  async execute(agendamento_id: string) {
    const webhookUrl = process.env.N8N_WEBHOOK_AGENDAMENTO_URL;

    if (!webhookUrl) {
      console.log('Webhook URL not configured. Skipping automation.');
      return;
    }

    try {
      const agendamento = await prisma.agendamento.findUnique({
        where: { id: agendamento_id },
        include: {
          cliente: true,
          barbeiro: true,
          servico: true,
          barbearia: true,
        }
      });

      if (!agendamento) return;

      const payload: AgendamentoPayload = {
        agendamento_id: agendamento.id,
        barbearia_id: agendamento.barbearia_id,
        cliente_nome: agendamento.cliente.nome,
        cliente_whatsapp: agendamento.cliente.whatsapp,
        barbeiro_nome: agendamento.barbeiro.nome,
        barbeiro_telefone: agendamento.barbeiro.whatsapp || '', 
        servico_nome: agendamento.servico.nome,
        data_hora_inicio: agendamento.data_hora_inicio.toISOString(),
        instancia_whatsapp: agendamento.barbearia.instancia_whatsapp,
        msg_confirmacao_pronta: renderMessageTemplate(agendamento.barbearia.msg_confirmacao, agendamento, 'confirmacao'),
        msg_notificacao_barbeiro_pronta: renderMessageTemplate(agendamento.barbearia.msg_notificacao_barbeiro, agendamento, 'barbeiro'),
      };

      // Dispara o webhook em background (fire-and-forget logic já vai ser aplicada pela forma como chamamos o serviço)
      await axios.post(webhookUrl, payload, {
        timeout: 5000 // Para não travar a thread por muito tempo caso n8n esteja lento
      });
      console.log(`Webhook disparado para agendamento ${agendamento_id}`);
    } catch (error: any) {
      console.error('Erro ao disparar webhook para n8n:', error?.message);
    }
  }
}
