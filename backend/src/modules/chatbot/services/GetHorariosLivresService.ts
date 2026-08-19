import { prisma } from '../../../config/prisma';
import { AppError } from '../../../shared/errors/AppError';
import { parseISO, addMinutes, isBefore, isAfter, format, startOfDay, endOfDay } from 'date-fns';
import { TipoAusencia } from '@prisma/client';

interface IRequest {
  barbearia_id: string;
  data: string; // YYYY-MM-DD
  servico_id: string;
  barbeiro_id: string;
}

export class GetHorariosLivresService {
  async execute({ barbearia_id, data, servico_id, barbeiro_id }: IRequest) {
    const servico = await prisma.servico.findFirst({
      where: { id: servico_id, barbearia_id }
    });

    if (!servico) throw new AppError('Serviço não encontrado', 404);

    const dataAlvo = parseISO(data); 
    const diaDaSemana = dataAlvo.getDay(); 

    // 1. Checa Ausências/Exceções (Feriados globais ou Folgas do barbeiro)
    // Usamos findFirst com orderBy para pegar a exceção mais específica (ex: individual > global, se houver conflito)
    // Mas simplificaremos buscando todas que se aplicam e olhando a prioridade: Individual do Barbeiro > Global
    const ausencias = await prisma.ausencia.findMany({
      where: {
        barbearia_id,
        data: {
          gte: startOfDay(dataAlvo),
          lte: endOfDay(dataAlvo)
        },
        OR: [
          { barbeiro_id: null },
          { barbeiro_id }
        ]
      }
    });

    let configDiaTrabalho = null; // Armazenará os turnos a usar

    if (ausencias.length > 0) {
      // Pega a mais específica: Se tem uma individual, ganha. Senão a global.
      const excecaoAplicada = ausencias.find(a => a.barbeiro_id === barbeiro_id) || ausencias[0];

      if (excecaoAplicada.tipo === TipoAusencia.FOLGA) {
        return []; // Dia bloqueado
      } else {
        // É TRABALHO, usaremos essa configuração especial e ignoramos a escala padrão
        configDiaTrabalho = {
          turno1_inicio: excecaoAplicada.turno1_inicio,
          turno1_fim: excecaoAplicada.turno1_fim,
          turno2_inicio: excecaoAplicada.turno2_inicio,
          turno2_fim: excecaoAplicada.turno2_fim,
        };
      }
    }

    // 2. Checa a Escala Padrão do Barbeiro se não tiver Exceção de TRABALHO
    if (!configDiaTrabalho) {
      const escala = await prisma.barbeiroEscala.findFirst({
        where: {
          barbeiro_id,
          dia_semana: diaDaSemana,
          ativo: true
        }
      });

      if (!escala) return []; // Não trabalha nesse dia da semana

      configDiaTrabalho = {
        turno1_inicio: escala.turno1_inicio,
        turno1_fim: escala.turno1_fim,
        turno2_inicio: escala.turno2_inicio,
        turno2_fim: escala.turno2_fim,
      };
    }

    if (!configDiaTrabalho.turno1_inicio || !configDiaTrabalho.turno1_fim) {
      return []; // Proteção contra dados corrompidos
    }

    // 3. Busca agendamentos ocupados no dia
    const agendamentos = await prisma.agendamento.findMany({
      where: {
        barbearia_id,
        barbeiro_id,
        status: { notIn: ['CANCELADO', 'FALTOU'] },
        data_hora_inicio: {
          gte: startOfDay(dataAlvo),
          lte: endOfDay(dataAlvo)
        }
      }
    });

    const duracao = servico.tempo_duracao_minutos;
    const horariosLivres: string[] = [];

    const gerarSlotsDoTurno = (inicioTime: Date, fimTime: Date) => {
      let currentSlot = new Date(dataAlvo);
      currentSlot.setHours(inicioTime.getUTCHours(), inicioTime.getUTCMinutes(), 0, 0); 

      const limitSlot = new Date(dataAlvo);
      limitSlot.setHours(fimTime.getUTCHours(), fimTime.getUTCMinutes(), 0, 0);

      while (isBefore(currentSlot, limitSlot)) {
        const slotFim = addMinutes(currentSlot, duracao);
        if (isAfter(slotFim, limitSlot)) break; 

        const temConflito = agendamentos.some(ag => {
          const agInicio = new Date(ag.data_hora_inicio);
          const agFim = new Date(ag.data_hora_fim);
          return isBefore(currentSlot, agFim) && isAfter(slotFim, agInicio);
        });

        if (!temConflito && isAfter(currentSlot, new Date())) {
            horariosLivres.push(format(currentSlot, 'HH:mm'));
        }
        currentSlot = addMinutes(currentSlot, 30);
      }
    };

    gerarSlotsDoTurno(configDiaTrabalho.turno1_inicio, configDiaTrabalho.turno1_fim);

    if (configDiaTrabalho.turno2_inicio && configDiaTrabalho.turno2_fim) {
      gerarSlotsDoTurno(configDiaTrabalho.turno2_inicio, configDiaTrabalho.turno2_fim);
    }

    return horariosLivres;
  }
}
