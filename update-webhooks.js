const fs = require('fs');

const renderContent = `import { format } from 'date-fns';

export function renderMessageTemplate(template: string | null | undefined, agendamento: any): string | undefined {
  if (!template) return undefined;

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

  let result = template;
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
if (!webhookContent.includes('renderMessageTemplate')) {
  webhookContent = webhookContent.replace("import { prisma } from '../../config/prisma';", "import { prisma } from '../../config/prisma';\nimport { renderMessageTemplate } from '../utils/renderMessageTemplate';");
  webhookContent = webhookContent.replace(
    "instancia_whatsapp: agendamento.barbearia.instancia_whatsapp,",
    "instancia_whatsapp: agendamento.barbearia.instancia_whatsapp,\n        msg_confirmacao_pronta: renderMessageTemplate(agendamento.barbearia.msg_confirmacao, agendamento),\n        msg_notificacao_barbeiro_pronta: renderMessageTemplate(agendamento.barbearia.msg_notificacao_barbeiro, agendamento),"
  );
  webhookContent = webhookContent.replace(
    "instancia_whatsapp?: string | null;",
    "instancia_whatsapp?: string | null;\n  msg_confirmacao_pronta?: string;\n  msg_notificacao_barbeiro_pronta?: string;"
  );
  fs.writeFileSync(webhookFile, webhookContent);
}

const cronFile = 'C:\\Users\\davih\\LaBarber\\backend\\src\\shared\\services\\CronLembreteService.ts';
let cronContent = fs.readFileSync(cronFile, 'utf8');
if (!cronContent.includes('renderMessageTemplate')) {
  cronContent = cronContent.replace("import { addHours, addMinutes } from 'date-fns';", "import { addHours, addMinutes } from 'date-fns';\nimport { renderMessageTemplate } from '../utils/renderMessageTemplate';");
  cronContent = cronContent.replace(
    "instancia_whatsapp: agendamento.barbearia.instancia_whatsapp,",
    "instancia_whatsapp: agendamento.barbearia.instancia_whatsapp,\n            msg_lembrete_pronta: renderMessageTemplate(agendamento.barbearia.msg_lembrete, agendamento),"
  );
  fs.writeFileSync(cronFile, cronContent);
}
