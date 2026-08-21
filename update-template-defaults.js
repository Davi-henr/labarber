const fs = require('fs');

const renderContent = `import { format } from 'date-fns';

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
    const regex = new RegExp(\`\\\\{\\\\{$\{key\}\\\\}\\\\}\`, 'g');
    result = result.replace(regex, String(value || ''));
  }
  return result;
}
`;
fs.writeFileSync('C:\\Users\\davih\\LaBarber\\backend\\src\\shared\\utils\\renderMessageTemplate.ts', renderContent);

const webhookFile = 'C:\\Users\\davih\\LaBarber\\backend\\src\\shared\\services\\WebhookAgendamentoService.ts';
let webhookContent = fs.readFileSync(webhookFile, 'utf8');
webhookContent = webhookContent.replace(
  "renderMessageTemplate(agendamento.barbearia.msg_confirmacao, agendamento)",
  "renderMessageTemplate(agendamento.barbearia.msg_confirmacao, agendamento, 'confirmacao')"
);
webhookContent = webhookContent.replace(
  "renderMessageTemplate(agendamento.barbearia.msg_notificacao_barbeiro, agendamento)",
  "renderMessageTemplate(agendamento.barbearia.msg_notificacao_barbeiro, agendamento, 'barbeiro')"
);
fs.writeFileSync(webhookFile, webhookContent);

const cronFile = 'C:\\Users\\davih\\LaBarber\\backend\\src\\shared\\services\\CronLembreteService.ts';
let cronContent = fs.readFileSync(cronFile, 'utf8');
cronContent = cronContent.replace(
  "renderMessageTemplate(agendamento.barbearia.msg_lembrete, agendamento)",
  "renderMessageTemplate(agendamento.barbearia.msg_lembrete, agendamento, 'lembrete')"
);
fs.writeFileSync(cronFile, cronContent);
