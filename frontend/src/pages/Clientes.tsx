import React, { useState, useEffect } from 'react';
import { api, useAuth } from '../contexts/AuthContext';
import { Users, Search, MessageCircle, Calendar as CalendarIcon, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Cliente {
  id: string;
  nome: string;
  whatsapp: string;
  ultimo_agendamento: string | null;
  ultimo_status: string | null;
  corte_nome: string | null;
  cliente_desde: string;
}

export function Clientes() {
  const { user } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  
  // Para ADMIN: filtro de equipe
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

  useEffect(() => {
    const fetchClientes = async () => {
      if (!barbeiroSelecionado) return;
      try {
        setLoading(true);
        const response = await api.get(`/clientes?barbeiro_id=${barbeiroSelecionado}`);
        setClientes(response.data);
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, [barbeiroSelecionado]);

  const openWhatsApp = (numero: string) => {
    const numLimpo = numero.replace(/\D/g, '');
    window.open(`https://wa.me/55${numLimpo}`, '_blank');
  };

  const clientesFiltrados = clientes.filter(c => 
    c.nome.toLowerCase().includes(busca.toLowerCase()) || 
    c.whatsapp.includes(busca)
  );

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente? Essa ação apagará também o histórico de agendamentos dele.')) {
      try {
        await api.delete(`/clientes/${id}`);
        toast.success('Cliente excluído com sucesso.');
        setClientes(clientes.filter(c => c.id !== id));
      } catch (error) {
        toast.error('Erro ao excluir cliente.');
      }
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meus Clientes</h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie a sua base de clientes</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          {user?.role === 'ADMIN' && equipe.length > 0 && (
            <select 
              value={barbeiroSelecionado}
              onChange={(e) => setBarbeiroSelecionado(e.target.value)}
              className="w-full md:w-auto px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm text-sm font-medium focus:ring-2 focus:ring-slate-900 cursor-pointer"
            >
              <option value={user.id}>Meus Clientes</option>
              {equipe.filter(b => b.id !== user.id).map(b => (
                <option key={b.id} value={b.id}>Clientes de {b.nome}</option>
              ))}
            </select>
          )}

          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-sm"
              placeholder="Buscar por nome ou WhatsApp..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Carregando clientes...</p>
          </div>
        ) : clientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center h-64">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Users className="text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhum cliente</h3>
            <p className="text-slate-500">Sua base de clientes ainda está vazia.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Último Agendamento</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Corte Realizado/Previsto</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente Desde</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clientesFiltrados.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{cliente.nome}</div>
                      <div className="text-sm text-slate-500">{cliente.whatsapp}</div>
                    </td>
                    <td className="px-6 py-4">
                      {cliente.ultimo_agendamento ? (
                        <div>
                          <div className="flex items-center text-sm font-medium text-slate-900 mb-1">
                            <CalendarIcon size={14} className="mr-1.5 text-slate-400" />
                            {format(new Date(cliente.ultimo_agendamento), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </div>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            cliente.ultimo_status === 'CONCLUIDO' ? 'bg-green-100 text-green-700' :
                            cliente.ultimo_status === 'CANCELADO' ? 'bg-red-100 text-red-700' :
                            cliente.ultimo_status === 'FALTOU' ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {cliente.ultimo_status}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400 italic">Nunca agendou</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {cliente.corte_nome ? (
                        <span className="text-sm font-medium text-slate-700">{cliente.corte_nome}</span>
                      ) : (
                        <span className="text-sm text-slate-400 italic">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-slate-700">
                        <CalendarIcon size={14} className="mr-1.5 text-slate-400" />
                        {format(new Date(cliente.cliente_desde), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openWhatsApp(cliente.whatsapp)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 font-medium rounded-lg transition-colors cursor-pointer text-sm"
                          title="Enviar Mensagem"
                        >
                          <MessageCircle size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(cliente.id)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded-lg transition-colors cursor-pointer text-sm"
                          title="Excluir Cliente"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {clientesFiltrados.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                Nenhum cliente encontrado na busca.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
