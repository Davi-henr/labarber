import cron from 'node-cron';
import axios from 'axios';
import { prisma } from '../../config/prisma';
import { addHours, addMinutes } from 'date-fns';

export class CronLembreteService {
  public start() {
    // Executa a cada 5 minutos
    cron.schedule('*/5 * * * *', async () => {
      console.log('⏳ [CRON] Verificando agendamentos para enviar lembretes...');
      await this.processarLembretes();
    });
  }

  private async processarLembretes() {
    const webhookUrl = process.env.N8N_WEBHOOK_LEMBRETE_URL;

    if (!webhookUrl) {
      console.warn('⚠️ [CRON] N8N_WEBHOOK_LEMBRETE_URL não está configurada no .env');
      return;
    }

    try {
      const now = new Date();
      
      // Janela de tempo: Agendamentos que começam exatamente entre 2h e 2h 5m no futuro
      const startTime = addHours(now, 2);
      const endTime = addMinutes(startTime, 5);

      const agendamentos = await prisma.agendamento.findMany({
        where: {
          lembrete_enviado: false,
          status: 'PENDENTE',
          data_hora_inicio: {
            gte: startTime,
            lte: endTime,
          },
        },
        include: {
          cliente: true,
          barbeiro: true,
          servico: true,
          barbearia: true,
        },
      });

      if (agendamentos.length === 0) {
        return;
      }

      console.log(`[CRON] ${agendamentos.length} agendamento(s) encontrado(s) para lembrete.`);

      for (const agendamento of agendamentos) {
        try {
          const payload = {
            agendamento_id: agendamento.id,
            barbearia_id: agendamento.barbearia_id,
            cliente_nome: agendamento.cliente.nome,
            cliente_whatsapp: agendamento.cliente.whatsapp,
            barbeiro_nome: agendamento.barbeiro.nome,
            barbeiro_telefone: agendamento.barbeiro.whatsapp || '',
            servico_nome: agendamento.servico.nome,
            data_hora_inicio: agendamento.data_hora_inicio.toISOString(),
            instancia_whatsapp: agendamento.barbearia.instancia_whatsapp,
          };

          await axios.post(webhookUrl, payload, { timeout: 10000 });

          // Marca como enviado
          await prisma.agendamento.update({
            where: { id: agendamento.id },
            data: { lembrete_enviado: true },
          });

          console.log(`✅ [CRON] Lembrete enviado com sucesso para ${agendamento.cliente.nome}`);
        } catch (err: any) {
          console.error(`❌ [CRON] Erro ao enviar lembrete do agendamento ${agendamento.id}:`, err.message);
        }
      }
    } catch (error: any) {
      console.error('❌ [CRON] Erro geral ao processar lembretes:', error.message);
    }
  }
}
