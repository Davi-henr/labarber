import { Request, Response } from 'express';
import { prisma } from '../../../config/prisma';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, format } from 'date-fns';

export class DashboardController {
  async index(req: Request, res: Response) {
    const { barbearia_id, id: user_id, role } = req.user;
    const { barbeiro_id, ano } = req.query;

    const targetBarbeiroId = barbeiro_id ? String(barbeiro_id) : user_id;

    const hoje = new Date();
    const inicioHoje = startOfDay(hoje);
    const fimHoje = endOfDay(hoje);
    
    const inicioMes = startOfMonth(hoje);
    const fimMes = endOfMonth(hoje);

    // Ano para o grfico
    const targetAno = ano ? Number(ano) : hoje.getFullYear();
    const inicioAno = startOfYear(new Date(targetAno, 0, 1));
    const fimAno = endOfYear(new Date(targetAno, 0, 1));

    // Mtricas do Barbeiro alvo
    const agendamentosHojeBarbeiro = await prisma.agendamento.findMany({
      where: {
        barbearia_id,
        barbeiro_id: targetBarbeiroId,
        data_hora_inicio: { gte: inicioHoje, lte: fimHoje }
      }
    });

    const cortesHojeBarbeiro = agendamentosHojeBarbeiro.filter(a => a.status === 'CONCLUIDO').length;
    const canceladosHojeBarbeiro = agendamentosHojeBarbeiro.filter(a => a.status === 'CANCELADO' || a.status === 'FALTOU').length;
    const totalAgendadosHojeBarbeiro = agendamentosHojeBarbeiro.length; // Quantos tem na agenda hoje (qualquer status)

    const comissaoHoje = agendamentosHojeBarbeiro.filter(a => a.status === 'CONCLUIDO').reduce((acc, curr) => {
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

    // Se for admin, carrega mtricas globais
    let metricasGlobais = null;
    let ranking = null;
    let graficoAnual = null;

    if (role === 'ADMIN') {
      const todosHoje = await prisma.agendamento.findMany({
        where: {
          barbearia_id,
          data_hora_inicio: { gte: inicioHoje, lte: fimHoje }
        },
        include: {
          barbeiro: true
        }
      });

      const concluidosHoje = todosHoje.filter(a => a.status === 'CONCLUIDO');
      const faturamentoHoje = concluidosHoje.reduce((acc, curr) => acc + Number(curr.valor_cobrado), 0);
      const cortesLoja = concluidosHoje.length;
      const ticketMedio = cortesLoja > 0 ? faturamentoHoje / cortesLoja : 0;
      
      const canceladosHojeLoja = todosHoje.filter(a => a.status === 'CANCELADO' || a.status === 'FALTOU').length;
      const totalAgendadosHojeLoja = todosHoje.length;

      metricasGlobais = { 
        faturamentoHoje, 
        cortesLoja, 
        ticketMedio,
        canceladosHoje: canceladosHojeLoja,
        agendadosHoje: totalAgendadosHojeLoja
      };

      // Ranking do dia
      const rankingMap = new Map<string, { nome: string, cortes: number, faturamento: number }>();
      
      for (const ag of concluidosHoje) {
        const bId = ag.barbeiro_id;
        if (!rankingMap.has(bId)) {
          rankingMap.set(bId, { nome: ag.barbeiro.nome, cortes: 0, faturamento: 0 });
        }
        const data = rankingMap.get(bId)!;
        data.cortes += 1;
        data.faturamento += Number(ag.valor_cobrado);
      }
      
      ranking = Array.from(rankingMap.values()).sort((a, b) => b.faturamento - a.faturamento);

      // Dados para o grfico anual (ms a ms)
      const agendamentosAno = await prisma.agendamento.findMany({
        where: {
          barbearia_id,
          status: 'CONCLUIDO',
          data_hora_inicio: { gte: inicioAno, lte: fimAno }
        },
        select: {
          data_hora_inicio: true,
          valor_cobrado: true
        }
      });

      const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const mesesMap = new Map<number, { mes: string; cortes: number; faturamento: number }>();
      
      for (let i = 0; i < 12; i++) {
        mesesMap.set(i, { mes: mesesNomes[i], cortes: 0, faturamento: 0 });
      }

      for (const ag of agendamentosAno) {
        const mesIndex = ag.data_hora_inicio.getMonth();
        const data = mesesMap.get(mesIndex)!;
        data.cortes += 1;
        data.faturamento += Number(ag.valor_cobrado);
      }

      graficoAnual = Array.from(mesesMap.values());
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
        canceladosHoje: canceladosHojeBarbeiro,
        agendadosHoje: totalAgendadosHojeBarbeiro,
        comissaoHoje,
        cortesMes: cortesMesBarbeiro
      },
      metricasGlobais,
      ranking,
      graficoAnual
    });
  }
}
