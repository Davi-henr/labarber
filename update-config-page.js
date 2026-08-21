const fs = require('fs');

const path = 'C:\\Users\\davih\\LaBarber\\frontend\\src\\pages\\Configuracoes.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('msg_confirmacao')) {
  // Update interface
  content = content.replace(
    'cor_primaria: string | null;',
    'cor_primaria: string | null;\n  msg_confirmacao: string | null;\n  msg_lembrete: string | null;\n  msg_notificacao_barbeiro: string | null;'
  );

  // Update formData
  content = content.replace(
    "if (data.cor_primaria) formData.append('cor_primaria', data.cor_primaria);",
    "if (data.cor_primaria) formData.append('cor_primaria', data.cor_primaria);\n      if (data.msg_confirmacao) formData.append('msg_confirmacao', data.msg_confirmacao);\n      if (data.msg_lembrete) formData.append('msg_lembrete', data.msg_lembrete);\n      if (data.msg_notificacao_barbeiro) formData.append('msg_notificacao_barbeiro', data.msg_notificacao_barbeiro);"
  );

  // Helper for inserting variables
  const helperFunction = `
  const insertVariable = (field: 'msg_confirmacao' | 'msg_lembrete' | 'msg_notificacao_barbeiro', variable: string) => {
    if (!data) return;
    setData({ ...data, [field]: (data[field] || '') + variable });
  };

  const VarButton = ({ label, val, field }: { label: string, val: string, field: any }) => (
    <button type="button" onClick={() => insertVariable(field, val)} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded transition-colors mr-2 mb-2">
      {label}
    </button>
  );
  `;
  content = content.replace('async function handleSubmit(e: React.FormEvent) {', helperFunction + '\n  async function handleSubmit(e: React.FormEvent) {');

  // Add the message form fields at the end of the form
  const messageFields = `
        <div className="pt-6 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Mensagens do WhatsApp</h2>
          <p className="text-sm text-slate-500 mb-6">Personalize as mensagens que serǜo enviadas automaticamente para os clientes e barbeiros. Use os botes para inserir variǭveis automǭticas.</p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Confirmaǜo de Agendamento (Cliente)</label>
              <div className="mb-2">
                <VarButton field="msg_confirmacao" label="Nome do Cliente" val="{{cliente_nome}}" />
                <VarButton field="msg_confirmacao" label="Barbearia" val="{{barbearia_nome}}" />
                <VarButton field="msg_confirmacao" label="Servio" val="{{servico_nome}}" />
                <VarButton field="msg_confirmacao" label="Profissional" val="{{barbeiro_nome}}" />
                <VarButton field="msg_confirmacao" label="Data" val="{{data}}" />
                <VarButton field="msg_confirmacao" label="Hora" val="{{hora}}" />
              </div>
              <textarea 
                value={data.msg_confirmacao || ''}
                onChange={e => setData({...data, msg_confirmacao: e.target.value})}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 h-28 resize-none"
                placeholder="Ex: Olǭ {{cliente_nome}}! Seu agendamento na {{barbearia_nome}} para {{servico_nome}} estǭ confirmado para {{data}} s {{hora}}."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Lembrete de Agendamento (Cliente)</label>
              <div className="mb-2">
                <VarButton field="msg_lembrete" label="Nome do Cliente" val="{{cliente_nome}}" />
                <VarButton field="msg_lembrete" label="Barbearia" val="{{barbearia_nome}}" />
                <VarButton field="msg_lembrete" label="Servio" val="{{servico_nome}}" />
                <VarButton field="msg_lembrete" label="Data" val="{{data}}" />
                <VarButton field="msg_lembrete" label="Hora" val="{{hora}}" />
              </div>
              <textarea 
                value={data.msg_lembrete || ''}
                onChange={e => setData({...data, msg_lembrete: e.target.value})}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 h-28 resize-none"
                placeholder="Ex: Oi {{cliente_nome}}, passando para lembrar do seu horǭrio de {{servico_nome}} hoje s {{hora}}!"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Notificaǜo de Novo Corte (Barbeiro)</label>
              <div className="mb-2">
                <VarButton field="msg_notificacao_barbeiro" label="Profissional" val="{{barbeiro_nome}}" />
                <VarButton field="msg_notificacao_barbeiro" label="Nome do Cliente" val="{{cliente_nome}}" />
                <VarButton field="msg_notificacao_barbeiro" label="Servio" val="{{servico_nome}}" />
                <VarButton field="msg_notificacao_barbeiro" label="Data" val="{{data}}" />
                <VarButton field="msg_notificacao_barbeiro" label="Hora" val="{{hora}}" />
              </div>
              <textarea 
                value={data.msg_notificacao_barbeiro || ''}
                onChange={e => setData({...data, msg_notificacao_barbeiro: e.target.value})}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 h-28 resize-none"
                placeholder="Ex: Fala {{barbeiro_nome}}! O cliente {{cliente_nome}} acabou de agendar um {{servico_nome}} para o dia {{data}} s {{hora}}."
              />
            </div>
          </div>
        </div>
        
        <div className="pt-6 border-t border-slate-100 flex justify-end">`;

  content = content.replace('<div className="pt-6 border-t border-slate-100 flex justify-end">', messageFields);

  fs.writeFileSync(path, content);
}
