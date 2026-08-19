import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../contexts/AuthContext';
import { Plus, Users, Scissors, LogOut, CheckCircle, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Barbearia {
  id: string;
  nome: string;
  criado_em: string;
  _count: {
    usuarios: number;
    clientes: number;
    agendamentos: number;
  };
  usuarios: {
    nome: string;
    email: string;
    login: string;
  }[];
}

export function MasterDashboard() {
  const [barbearias, setBarbearias] = useState<Barbearia[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Form State
  const [nomeBarbearia, setNomeBarbearia] = useState('');
  const [adminNome, setAdminNome] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminLogin, setAdminLogin] = useState('');
  const [adminSenha, setAdminSenha] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('@LaBarber:masterToken');
    if (!token) {
      navigate('/master');
      return;
    }
    
    // Set headers for this isolated dashboard
    api.defaults.headers.authorization = `Bearer ${token}`;
    
    fetchBarbearias();
  }, [navigate]);

  const fetchBarbearias = async () => {
    try {
      const response = await api.get('/saas/barbearias');
      setBarbearias(response.data);
    } catch (error) {
      toast.error('Erro ao carregar barbearias');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('@LaBarber:masterToken');
    localStorage.removeItem('@LaBarber:masterAdmin');
    navigate('/master');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post('/saas/barbearias', {
        nome: nomeBarbearia,
        admin_nome: adminNome,
        admin_email: adminEmail,
        admin_login: adminLogin,
        admin_senha: adminSenha,
      });

      toast.success('Barbearia e Mensalista criados com sucesso!');
      setIsModalOpen(false);
      
      // Reset form
      setNomeBarbearia('');
      setAdminNome('');
      setAdminEmail('');
      setAdminLogin('');
      setAdminSenha('');
      
      fetchBarbearias();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao criar barbearia');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (window.confirm(`Tem certeza absoluta que deseja excluir a barbearia "${nome}"? ISSO APAGARÁ TODOS OS DADOS DELA E DE TODOS OS SEUS USUÁRIOS/CLIENTES (Ação irreversível)!`)) {
      try {
        await api.delete(`/saas/barbearias/${id}`);
        toast.success(`Barbearia "${nome}" excluída com sucesso.`);
        fetchBarbearias();
      } catch (error) {
        toast.error('Erro ao excluir barbearia.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header Premium */}
      <header className="bg-black text-white border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center transform rotate-3">
                <Scissors className="text-black w-6 h-6 transform -rotate-3" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">LaBarber <span className="text-yellow-500">SaaS</span></h1>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Master Control</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Barbearias Ativas</h2>
            <p className="text-gray-500 text-sm mt-1">Gerencie os clientes do seu SaaS</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-medium hover:bg-zinc-800 transition-colors shadow-lg shadow-black/10"
          >
            <Plus className="w-5 h-5" />
            Nova Barbearia
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Mensalistas</p>
              <h3 className="text-2xl font-bold text-gray-900">{barbearias.length}</h3>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Usuários Totais</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {barbearias.reduce((acc, curr) => acc + curr._count.usuarios, 0)}
              </h3>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <Scissors className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Agendamentos Globais</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {barbearias.reduce((acc, curr) => acc + curr._count.agendamentos, 0)}
              </h3>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : barbearias.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Nenhum mensalista</h3>
              <p className="text-gray-500 mt-1">Cadastre a primeira barbearia para começar a lucrar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Barbearia</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin Principal</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estatísticas</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data de Criação</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {barbearias.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{b.nome}</div>
                        <div className="text-sm text-gray-500 font-mono text-xs mt-1">{b.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        {b.usuarios[0] ? (
                          <>
                            <div className="font-medium text-gray-900">{b.usuarios[0].nome}</div>
                            <div className="text-sm text-gray-500">{b.usuarios[0].email} • Login: {b.usuarios[0].login}</div>
                          </>
                        ) : (
                          <span className="text-gray-400 italic">Sem Admin</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-4 text-sm">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Users className="w-4 h-4 text-gray-400" /> {b._count.clientes} Clientes
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Scissors className="w-4 h-4 text-gray-400" /> {b._count.agendamentos} Agend.
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(b.criado_em).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(b.id, b.nome)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Excluir Barbearia"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal Nova Barbearia */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white rounded-3xl w-full max-w-lg relative z-10 overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Novo Mensalista</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nome da Barbearia</label>
                  <input
                    type="text"
                    required
                    value={nomeBarbearia}
                    onChange={e => setNomeBarbearia(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    placeholder="Ex: Barbearia Vintage"
                  />
                </div>
                
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-4 mt-6">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Conta do Admin</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Proprietário</label>
                    <input
                      type="text"
                      required
                      value={adminNome}
                      onChange={e => setAdminNome(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none bg-white"
                      placeholder="Ex: João Silva"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                      <input
                        type="email"
                        required
                        value={adminEmail}
                        onChange={e => setAdminEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none bg-white"
                        placeholder="joao@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Login (User)</label>
                      <input
                        type="text"
                        required
                        value={adminLogin}
                        onChange={e => setAdminLogin(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none bg-white"
                        placeholder="joaobarber"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Senha Provisória</label>
                    <input
                      type="text"
                      required
                      value={adminSenha}
                      onChange={e => setAdminSenha(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none bg-white"
                      placeholder="Será exigida a troca no 1º acesso"
                    />
                    <p className="text-xs text-gray-500 mt-1">O usuário será forçado a trocar essa senha ao fazer login.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-black text-white font-medium rounded-xl hover:bg-zinc-800 transition-colors disabled:opacity-50 flex justify-center items-center"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Criar Mensalista'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
