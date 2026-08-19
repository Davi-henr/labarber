import React, { useState, useEffect } from 'react';
import { api } from '../contexts/AuthContext';
import { Plus, Scissors, Clock, DollarSign, X, Loader2, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Servico {
  id: string;
  nome: string;
  descricao?: string;
  valor: number;
  tempo_duracao_minutos: number;
}

export function Servicos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form State
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tempo, setTempo] = useState('');

  const fetchServicos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/servicos');
      setServicos(response.data);
    } catch (error) {
      toast.error('Erro ao carregar serviços.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicos();
  }, []);

  const handleCreateServico = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editId) {
        await api.put(`/servicos/${editId}`, {
          nome,
          descricao,
          valor: Number(valor),
          tempo_duracao_minutos: Number(tempo),
        });
        toast.success('Serviço atualizado com sucesso!');
      } else {
        await api.post('/servicos', {
          nome,
          descricao,
          valor: Number(valor),
          tempo_duracao_minutos: Number(tempo),
        });
        toast.success('Serviço criado com sucesso!');
      }
      
      closeModal();
      fetchServicos();
    } catch (error) {
      toast.error('Erro ao salvar serviço. Verifique os dados.');
    } finally {
      setSubmitting(false);
    }
  };

  const openModalForCreate = () => {
    setEditId(null);
    setNome('');
    setDescricao('');
    setValor('');
    setTempo('');
    setIsModalOpen(true);
  };

  const openModalForEdit = (servico: Servico) => {
    setEditId(servico.id);
    setNome(servico.nome);
    setDescricao(servico.descricao || '');
    setValor(String(servico.valor));
    setTempo(String(servico.tempo_duracao_minutos));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditId(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      try {
        await api.delete(`/servicos/${id}`);
        toast.success('Serviço excluído com sucesso.');
        setServicos(servicos.filter(s => s.id !== id));
      } catch (error) {
        toast.error('Erro ao excluir serviço.');
      }
    }
  };

  // Funções de formatação
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meus Serviços</h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie o catálogo de serviços da barbearia</p>
        </div>
        <button 
          onClick={openModalForCreate}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm shadow-sm cursor-pointer"
        >
          <Plus size={18} />
          Novo Serviço
        </button>
      </div>

      {/* Content */}
      <div className="flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Carregando serviços...</p>
          </div>
        ) : servicos.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 border-dashed p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Scissors className="text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhum serviço cadastrado</h3>
            <p className="text-slate-500 max-w-sm mb-6">Você ainda não possui serviços cadastrados. Adicione o seu primeiro serviço para que os clientes possam agendar.</p>
            <button 
              onClick={openModalForCreate}
              className="text-sm font-medium text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Adicionar Serviço
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicos.map((servico) => (
              <div key={servico.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative group">
                {/* Botões de Ação Ocultos (Aparecem no Hover) */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModalForEdit(servico)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer" title="Editar Serviço">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(servico.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer" title="Excluir Serviço">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                      <Scissors className="text-slate-700" size={20} />
                    </div>
                    <h3 className="font-bold text-slate-900">{servico.nome}</h3>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-slate-600">
                    <DollarSign size={16} className="mr-2 text-slate-400" />
                    <span>Valor: </span>
                    <span className="font-semibold text-slate-900 ml-1">{formatCurrency(servico.valor)}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-slate-600">
                    <Clock size={16} className="mr-2 text-slate-400" />
                    <span>Duração: </span>
                    <span className="font-semibold text-slate-900 ml-1">{servico.tempo_duracao_minutos} min</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Novo Serviço */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">{editId ? 'Editar Serviço' : 'Novo Serviço'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateServico} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Serviço</label>
                <input 
                  type="text" 
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="Ex: Corte Degradê"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição (Opcional)</label>
                <textarea 
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none h-20"
                  placeholder="Ex: Corte de cabelo com máquina zero nas laterais e tesoura no topo."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    placeholder="35.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Duração (min)</label>
                  <input 
                    type="number" 
                    min="1"
                    value={tempo}
                    onChange={(e) => setTempo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    placeholder="45"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-70 flex justify-center cursor-pointer"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
