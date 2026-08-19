import { Request, Response } from 'express';
import { prisma } from '../../../config/prisma';
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';
export class DashboardController {
  async index(req: Request, res: Response) {
    const { barbearia_id, id: user_id, role } = req.user;
    const { barbeiro_id } = req.query;

    const targetBarbeiroId = barbeiro_id ? String(barbeiro_id) : user_id;

    const hoje = new Date();
    const inicioHoje = startOfDay(hoje);
    const fimHoje = endOfDay(hoje);
    
    const inicioMes = startOfMonth(hoje);
    const fimMes = endOfMonth(hoje);

    // Métricas do Barbeiro alvo
    const cortesHojeBarbeiro = await prisma.agendamento.count({
      where: {
        barbearia_id,
        barbeiro_id: targetBarbeiroId,
        status: 'CONCLUIDO',
        data_hora_inicio: { gte: inicioHoje, lte: fimHoje }
      }
    });

    const agendamentosHojeBarbeiro = await prisma.agendamento.findMany({
      where: {
        barbearia_id,
        barbeiro_id: targetBarbeiroId,
        status: 'CONCLUIDO',
        data_hora_inicio: { gte: inicioHoje, lte: fimHoje }
      }
    });
    const comissaoHoje = agendamentosHojeBarbeiro.reduce((acc, curr) => {
      if (role === 'ADMIN') {
        return acc + (Number(curr.valor_cobrado) - Number(curr.valor_comissao));
      }
      return acc + Number(curr.valor_comissao);
    }, 0);

    const cortesMesBarbeiro = await prisma.agendamento.count({
      where: {
        barbearia_id,
        barbeiro_id: targetBarbeiroId,
        status: 'CONCLUIDO',
        data_hora_inicio: { gte: inicioMes, lte: fimMes }
      }
    });

    const proximoClienteResult = await prisma.agendamento.findFirst({
      where: {
        barbearia_id,
        barbeiro_id: targetBarbeiroId,
        status: { in: ['PENDENTE', 'CONFIRMADO'] },
        data_hora_inicio: { gte: hoje }
      },
      orderBy: { data_hora_inicio: 'asc' },
      include: { cliente: true, servico: true }
    });

    // Se for admin, carrega métricas globais
    let metricasGlobais = null;
    let ranking = null;

    if (role === 'ADMIN') {
      const todosHoje = await prisma.agendamento.findMany({
        where: {
          barbearia_id,
          status: 'CONCLUIDO',
          data_hora_inicio: { gte: inicioHoje, lte: fimHoje }
        },
        include: {
          barbeiro: true
        }
      });

      const faturamentoHoje = todosHoje.reduce((acc, curr) => acc + Number(curr.valor_cobrado), 0);
      const cortesLoja = todosHoje.length;
      const ticketMedio = cortesLoja > 0 ? faturamentoHoje / cortesLoja : 0;

      metricasGlobais = { faturamentoHoje, cortesLoja, ticketMedio };

      // Ranking do dia
      const rankingMap = new Map<string, { nome: string, cortes: number, faturamento: number }>();
      
      for (const ag of todosHoje) {
        const bId = ag.barbeiro_id;
        if (!rankingMap.has(bId)) {
          rankingMap.set(bId, { nome: ag.barbeiro.nome, cortes: 0, faturamento: 0 });
        }
        const data = rankingMap.get(bId)!;
        data.cortes += 1;
        data.faturamento += Number(ag.valor_cobrado);
      }
      
      ranking = Array.from(rankingMap.values()).sort((a, b) => b.faturamento - a.faturamento);
    }

    return res.json({
      proximoCliente: proximoClienteResult ? {
        nome: proximoClienteResult.cliente.nome,
        whatsapp: proximoClienteResult.cliente.whatsapp,
        servico: proximoClienteResult.servico.nome,
        hora: proximoClienteResult.data_hora_inicio
      } : null,
      metricasBarbeiro: {
        cortesHoje: cortesHojeBarbeiro,
        comissaoHoje,
        cortesMes: cortesMesBarbeiro
      },
      metricasGlobais,
      ranking
    });
  }
}
