import { Request, Response } from 'express';
import { prisma } from '../../../config/prisma';
import { TipoAusencia } from '@prisma/client';

export class AusenciasController {
  async list(req: Request, res: Response): Promise<Response> {
    const { id: user_id, barbearia_id, role: user_role } = req.user;
    const { barbeiro_id } = req.query;

    const finalBarbeiroId = user_role === 'BARBEIRO' ? user_id : (barbeiro_id || null);

    const where: any = { barbearia_id };
    
    if (finalBarbeiroId) {
       where.OR = [
         { barbeiro_id: null },
         { barbeiro_id: finalBarbeiroId }
       ];
    }

    const ausencias = await prisma.ausencia.findMany({
      where,
      orderBy: { data: 'asc' },
      include: {
        barbeiro: {
          select: { nome: true }
        }
      }
    });

    return res.json(ausencias);
  }

  async create(req: Request, res: Response): Promise<Response> {
    const { barbearia_id, id: user_id, role } = req.user;
    const { data, descricao, barbeiros_ids, tipo, turno1_inicio, turno1_fim, turno2_inicio, turno2_fim } = req.body;

    const parsedTipo = tipo === 'TRABALHO' ? TipoAusencia.TRABALHO : TipoAusencia.FOLGA;

    let targets: (string | null)[] = [];

    if (parsedTipo === TipoAusencia.FOLGA) {
      // Folga é sempre global
      targets = [null];
    } else {
      if (role === 'BARBEIRO') {
        targets = [user_id];
      } else {
        targets = Array.isArray(barbeiros_ids) && barbeiros_ids.length > 0 ? barbeiros_ids : [null]; // fallback para null caso vazio? não, melhor manter a lista
        if (targets.length === 0) {
           return res.status(400).json({ message: 'Selecione pelo menos um barbeiro para a exceção de trabalho.' });
        }
      }
    }

    const t1Inicio = turno1_inicio && parsedTipo === 'TRABALHO' ? new Date(`1970-01-01T${turno1_inicio}:00Z`) : null;
    const t1Fim = turno1_fim && parsedTipo === 'TRABALHO' ? new Date(`1970-01-01T${turno1_fim}:00Z`) : null;
    const t2Inicio = turno2_inicio && parsedTipo === 'TRABALHO' ? new Date(`1970-01-01T${turno2_inicio}:00Z`) : null;
    const t2Fim = turno2_fim && parsedTipo === 'TRABALHO' ? new Date(`1970-01-01T${turno2_fim}:00Z`) : null;

    const createdRecords = [];

    for (const targetId of targets) {
      const ausencia = await prisma.ausencia.create({
        data: {
          barbearia_id,
          barbeiro_id: targetId,
          data: new Date(data),
          descricao,
          tipo: parsedTipo,
          turno1_inicio: t1Inicio,
          turno1_fim: t1Fim,
          turno2_inicio: t2Inicio,
          turno2_fim: t2Fim,
        }
      });
      createdRecords.push(ausencia);
    }

    return res.status(201).json(createdRecords.length === 1 ? createdRecords[0] : createdRecords);
  }

  async delete(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { id: user_id, role } = req.user;

    const ausencia = await prisma.ausencia.findUnique({ where: { id } });
    if (!ausencia) return res.status(404).json({ message: 'Exceção não encontrada' }).end();

    if (role === 'BARBEIRO' && ausencia.barbeiro_id !== user_id) {
       return res.status(403).json({ message: 'Sem permissão' }).end();
    }

    await prisma.ausencia.delete({ where: { id } });
    return res.status(204).send();
  }
}
