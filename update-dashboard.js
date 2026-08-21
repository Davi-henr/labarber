const fs = require('fs');

let content = fs.readFileSync('C:\\Users\\davih\\LaBarber\\frontend\\src\\pages\\Dashboard.tsx', 'utf8');

// 1. Add recharts and lucide-react icons
if (!content.includes('BarChart')) {
  content = content.replace("import { format }", "import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';\nimport { format }");
}
if (!content.includes('CalendarX')) {
  content = content.replace("import { DollarSign, Scissors, Target, Users, TrendingUp, Calendar as CalendarIcon, Clock, MessageCircle }", "import { DollarSign, Scissors, Target, Users, TrendingUp, Calendar as CalendarIcon, Clock, MessageCircle, CalendarCheck, CalendarX }");
}

// 2. Add graficoAno state
if (!content.includes('graficoAno')) {
  content = content.replace("const [barbeiroSelecionado, setBarbeiroSelecionado] = useState<string>('');", "const [barbeiroSelecionado, setBarbeiroSelecionado] = useState<string>('');\n  const [graficoAno, setGraficoAno] = useState<number>(new Date().getFullYear());");
}

// 3. Update fetch to include ano
content = content.replace(/api\.get\(\`\/dashboard\?barbeiro_id=\$\{barbeiroSelecionado\}\`\)/, "api.get(`/dashboard?barbeiro_id=${barbeiroSelecionado}&ano=${graficoAno}`)");
content = content.replace(/\[barbeiroSelecionado\]/, "[barbeiroSelecionado, graficoAno]");

// 4. Update renderMinhaOperacao to md:grid-cols-5 and add cards
content = content.replace(/const \{ proximoCliente, metricasBarbeiro, metricasGlobais, ranking \} = data;/, "const { proximoCliente, metricasBarbeiro, metricasGlobais, ranking, graficoAnual } = data;");

const gridOperacaoOriginal = `<div className="grid grid-cols-1 md:grid-cols-3 gap-6">`;
const newCardsOperacao = `
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center mb-4">
            <CalendarCheck className="text-sky-600" size={24} />
          </div>
          <p className="text-slate-500 font-medium mb-1">Agendados Hoje</p>
          <h3 className="text-3xl font-bold text-slate-900">{metricasBarbeiro.agendadosHoje}</h3>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4">
            <CalendarX className="text-red-500" size={24} />
          </div>
          <p className="text-slate-500 font-medium mb-1">Cancelados Hoje</p>
          <h3 className="text-3xl font-bold text-slate-900">{metricasBarbeiro.canceladosHoje}</h3>
        </div>
`;
content = content.replace(gridOperacaoOriginal, `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">\n${newCardsOperacao}`);

// 5. Update renderVisaoGeral to add cards
const gridVisaoOriginal = `<div className="grid grid-cols-1 md:grid-cols-3 gap-6">`;
const newCardsVisao = `
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 font-medium mb-1 flex items-center gap-2">
            <CalendarCheck size={18} /> Agendados Hoje
          </p>
          <h3 className="text-3xl font-bold text-slate-900">{metricasGlobais?.agendadosHoje || 0}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 font-medium mb-1 flex items-center gap-2 text-red-500">
            <CalendarX size={18} /> Cancelados Hoje
          </p>
          <h3 className="text-3xl font-bold text-slate-900">{metricasGlobais?.canceladosHoje || 0}</h3>
        </div>
`;
content = content.replace(gridVisaoOriginal, `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">\n${newCardsVisao}`);


// 6. Add Chart to renderVisaoGeral
const chartCode = `

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mt-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-900">Desempenho Financeiro e Cortes ({graficoAno})</h3>
          <select 
            value={graficoAno} 
            onChange={e => setGraficoAno(Number(e.target.value))}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none"
          >
            <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
            <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
          </select>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={graficoAnual} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
              <Tooltip 
                cursor={{fill: '#f1f5f9'}}
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                formatter={(value: any, name: string) => [name === 'faturamento' ? formatCurrency(value) : value, name === 'faturamento' ? 'Faturamento' : 'Cortes']}
              />
              <Legend iconType="circle" wrapperStyle={{fontSize: '14px', paddingTop: '10px'}} />
              <Bar dataKey="faturamento" name="Faturamento" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={32} />
              <Bar dataKey="cortes" name="Cortes" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
`;

content = content.replace('</div>\n      </div>\n    </div>\n  );', `</div>\n      </div>\n${chartCode}\n    </div>\n  );`);

fs.writeFileSync('C:\\Users\\davih\\LaBarber\\frontend\\src\\pages\\Dashboard.tsx', content);
