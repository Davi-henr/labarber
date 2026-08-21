const fs = require('fs');

let controllerPath = 'C:\\Users\\davih\\LaBarber\\backend\\src\\modules\\barbearias\\controllers\\BarbeariasController.ts';
let servicePath = 'C:\\Users\\davih\\LaBarber\\backend\\src\\modules\\barbearias\\services\\UpdateConfigBarbeariaService.ts';

let controllerContent = fs.readFileSync(controllerPath, 'utf8');
controllerContent = controllerContent.replace(
  "cor_primaria: z.string().optional()",
  "cor_primaria: z.string().optional(),\n      msg_confirmacao: z.string().optional(),\n      msg_lembrete: z.string().optional(),\n      msg_notificacao_barbeiro: z.string().optional()"
);
fs.writeFileSync(controllerPath, controllerContent);

let serviceContent = fs.readFileSync(servicePath, 'utf8');
serviceContent = serviceContent.replace(
  "cor_primaria?: string;",
  "cor_primaria?: string;\n  msg_confirmacao?: string;\n  msg_lembrete?: string;\n  msg_notificacao_barbeiro?: string;"
);
serviceContent = serviceContent.replace(
  "execute({ barbearia_id, nome, endereco, historia_texto, cor_primaria, logo_url }: IRequest) {",
  "execute({ barbearia_id, nome, endereco, historia_texto, cor_primaria, logo_url, msg_confirmacao, msg_lembrete, msg_notificacao_barbeiro }: IRequest) {"
);
serviceContent = serviceContent.replace(
  "...(logo_url !== undefined && { logo_url })",
  "...(logo_url !== undefined && { logo_url }),\n        ...(msg_confirmacao !== undefined && { msg_confirmacao }),\n        ...(msg_lembrete !== undefined && { msg_lembrete }),\n        ...(msg_notificacao_barbeiro !== undefined && { msg_notificacao_barbeiro })"
);
fs.writeFileSync(servicePath, serviceContent);
