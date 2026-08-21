import { format } from 'date-fns';

export function renderMessageTemplate(template: string | null | undefined, agendamento: any, type: 'confirmacao' | 'lembrete' | 'barbeiro'): string {
  const dataFormatada = format(agendamento.data_hora_inicio, 'dd/MM/yyyy');
  const horaFormatada = format(agendamento.data_hora_inicio, 'HH:mm');

  const data = {
    cliente_nome: agendamento.cliente.nome,
    barbeiro_nome: agendamento.barbeiro.nome,
    servico_nome: agendamento.servico.nome,
    data: dataFormatada,
    hora: horaFormatada,
    barbearia_nome: agendamento.barbearia.nome
  };

  let finalTemplate = template;

  if (!finalTemplate) {
    if (type === 'confirmacao') {
      finalTemplate = 'Olǭ {{cliente_nome}}! Seu agendamento na {{barbearia_nome}} para {{servico_nome}} estǭ confirmado para {{data}} s {{hora}}.';
    } else if (type === 'lembrete') {
      finalTemplate = 'Oi {{cliente_nome}}, passando para lembrar do seu horǭrio de {{servico_nome}} hoje s {{hora}}!';
    } else {
      finalTemplate = 'Novo agendamento! O cliente {{cliente_nome}} agendou {{servico_nome}} para {{data}} s {{hora}}.';
    }
  }

  let result = finalTemplate;
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, String(value || ''));
  }
  return result;
}
