import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../contexts/AuthContext';
import { DollarSign, Scissors, Target, Users, TrendingUp, Calendar as CalendarIcon, Clock, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'operacao' | 'visao_geral'>('operacao');

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  
  const [equipe, setEquipe] = useState<{id: string, nome: string}[]>([]);
  const [barbeiroSelecionado, setBarbeiroSelecionado] = useState<string>('');

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      api.get('/usuarios').then(res => {
        setEquipe(res.data);
        if (res.data.length > 0 && !barbeiroSelecionado) {
          setBarbeiroSelecionado(user.id);
        }
      }).catch(() => {});
    } else {
      setBarbeiroSelecionado(user?.id || '');
    }
  }, [user]);

  const fetchDashboard = async () => {
    if (!barbeiroSelecionado) return;
    try {
      setLoading(true);
      const response = await api.get(`/dashboard?barbeiro_id=${barbeiroSelecionado}`);
      setData(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [barbeiroSelecionado]);

  if (loading || !data) {
    return <div className="flex h-full items-center justify-center text-slate-500">Carregando dashboard...</div>;
  }

  const { proximoCliente, metricasBarbeiro, metricasGlobais, ranking } = data;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const renderMinhaOperacao = () => (
    <div className="space-y-6 mt-6">
      {proximoCliente ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-16 -mt-16 z-0"></div>
          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-2 text-blue-600 font-semibold mb-2">
              <Clock size={18} />
              <span className="uppercase tracking-wider text-xs">Próximo Cliente</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{proximoCliente.nome}</h2>
            <div className="text-slate-500 mt-1 flex items-center gap-3">
              <span className="flex items-center gap-1"><Scissors size={16}/> {proximoCliente.servico}</span>
              <span className="flex items-center gap-1 text-slate-900 font-medium bg-slate-100 px-2 py-0.5 rounded-lg">Às {format(new Date(proximoCliente.hora), 'HH:mm')}</span>
            </div>
          </div>
          <button 
            onClick={() => window.open(`https://wa.me/55${proximoCliente.whatsapp}`, '_blank')}
            className="relative z-10 bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-xl font-medium transition-colors shadow-sm shadow-green-200 flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center"
          >
            <MessageCircle size={20} />
            Chamar no WhatsApp
          </button>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 h-32">
          Não há próximos clientes agendados para hoje.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
            <Scissors className="text-indigo-600" size={24} />
          </div>
          <p className="text-slate-500 font-medium mb-1">Cortes Hoje</p>
          <h3 className="text-3xl font-bold text-slate-900">{metricasBarbeiro.cortesHoje}</h3>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
            <DollarSign className="text-emerald-600" size={24} />
          </div>
          <p className="text-slate-500 font-medium mb-1">
            {user?.role === 'ADMIN' ? 'Faturamento Líquido' : 'Comissão Hoje'}
          </p>
          <h3 className="text-3xl font-bold text-slate-900">{formatCurrency(metricasBarbeiro.comissaoHoje)}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
            <Target className="text-orange-600" size={24} />
          </div>
          <p className="text-slate-500 font-medium mb-1">Cortes no Mês</p>
          <h3 className="text-3xl font-bold text-slate-900">{metricasBarbeiro.cortesMes}</h3>
        </div>
      </div>
    </div>
  );

  const renderVisaoGeral = () => (
    <div className="space-y-6 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-slate-800 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <p className="text-slate-400 font-medium mb-1 flex items-center gap-2">
              <TrendingUp size={18} /> Faturamento de Hoje
            </p>
            <h3 className="text-3xl font-bold">{formatCurrency(metricasGlobais?.faturamentoHoje || 0)}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 font-medium mb-1 flex items-center gap-2">
            <Users size={18} /> Total de Cortes da Loja
          </p>
          <h3 className="text-3xl font-bold text-slate-900">{metricasGlobais?.cortesLoja || 0}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 font-medium mb-1 flex items-center gap-2">
            <DollarSign size={18} /> Ticket Médio
          </p>
          <h3 className="text-3xl font-bold text-slate-900">{formatCurrency(metricasGlobais?.ticketMedio || 0)}</h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-900">Ranking da Equipe (Hoje)</h3>
        </div>
        <div className="p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Posição</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Profissional</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Cortes</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Gerado</th>
              </tr>
            </thead>
            <tbody>
              {(ranking || []).map((b: any, idx: number) => (
                <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-slate-200 text-slate-700' : idx === 2 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-500'}`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">{b.nome}</td>
                  <td className="px-6 py-4 text-slate-600">{b.cortes}</td>
                  <td className="px-6 py-4 text-slate-900 font-semibold">{formatCurrency(b.faturamento)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Olá, {user?.nome?.split(' ')[0]}!</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <CalendarIcon size={18} /> {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </p>
        </div>

        {user?.role === 'ADMIN' && activeTab === 'operacao' && equipe.length > 0 && (
          <select 
            value={barbeiroSelecionado}
            onChange={(e) => setBarbeiroSelecionado(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm text-sm font-medium focus:ring-2 focus:ring-slate-900 cursor-pointer"
          >
            <option value={user.id}>Minha Operação</option>
            {equipe.filter(b => b.id !== user.id).map(b => (
              <option key={b.id} value={b.id}>Operação de {b.nome}</option>
            ))}
          </select>
        )}
      </div>

      {user?.role === 'ADMIN' ? (
        <>
          <div className="flex bg-slate-100 p-1 rounded-xl w-full max-w-sm">
            <button
              onClick={() => setActiveTab('operacao')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${activeTab === 'operacao' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Minha Operação
            </button>
            <button
              onClick={() => setActiveTab('visao_geral')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${activeTab === 'visao_geral' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Visão da Barbearia
            </button>
          </div>
          
          {activeTab === 'operacao' ? renderMinhaOperacao() : renderVisaoGeral()}
        </>
      ) : (
        renderMinhaOperacao()
      )}
    </div>
  );
}
