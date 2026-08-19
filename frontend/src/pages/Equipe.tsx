import React, { useState, useEffect } from 'react';
import { api } from '../contexts/AuthContext';
import { Plus, Users, UserCircle, Key, Info, X, Loader2, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Usuario {
  id: string;
  nome: string;
  login: string;
  whatsapp?: string;
  role: string;
  ativo: boolean;
  foto_url?: string;
}

export function Equipe() {
  const [equipe, setEquipe] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);

  const [nome, setNome] = useState('');
  const [loginForm, setLoginForm] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [comissao_percentual, setComissaoPercentual] = useState('');
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [currentFotoUrl, setCurrentFotoUrl] = useState<string | null>(null);
  // Checkboxes para permissões
  const [permissoes, setPermissoes] = useState({
    dashboard: true,
    agenda: true,
    clientes: true,
    escala: true,
    servicos: false,
  });

  const fetchEquipe = async () => {
    try {
      setLoading(true);
      const response = await api.get('/usuarios');
      setEquipe(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao carregar equipe.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipe();
  }, []);

  const handleCreateBarbeiro = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let userIdToUpdate = editId;

      const comissaoNumber = comissao_percentual !== '' && !isNaN(Number(comissao_percentual)) 
        ? Number(comissao_percentual) 
        : undefined;

      const whatsappLimpo = whatsapp.replace(/\D/g, '');

      if (editId) {
        await api.put(`/usuarios/${editId}`, {
          nome,
          whatsapp: whatsappLimpo,
          permissoes,
          comissao_percentual: comissaoNumber,
        });
        toast.success('Barbeiro atualizado com sucesso!');
      } else {
        const resp = await api.post('/usuarios', {
          nome,
          login: loginForm,
          whatsapp: whatsappLimpo,
          permissoes,
          comissao_percentual: comissaoNumber,
        });
        userIdToUpdate = resp.data.id;
        toast.success('Barbeiro cadastrado com sucesso!');
      }

      if (fotoFile && userIdToUpdate) {
        const formData = new FormData();
        formData.append('foto', fotoFile);
        await api.patch(`/usuarios/${userIdToUpdate}/foto`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      closeModal();
      fetchEquipe();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao cadastrar barbeiro.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePermissao = (key: keyof typeof permissoes) => {
    setPermissoes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const openModalForCreate = () => {
    setEditId(null);
    setNome('');
    setLoginForm('');
    setWhatsapp('');
    setComissaoPercentual('');
    setFotoFile(null);
    setCurrentFotoUrl(null);
    setPermissoes({ dashboard: true, agenda: true, clientes: true, escala: true, servicos: false });
    setIsModalOpen(true);
  };

  const openModalForEdit = (membro: any) => {
    setEditId(membro.id);
    setNome(membro.nome);
    setLoginForm(membro.login);
    setWhatsapp(membro.whatsapp ? formatWhatsApp(membro.whatsapp) : '');
    setComissaoPercentual(membro.comissao_percentual != null ? String(membro.comissao_percentual) : '');
    setFotoFile(null);
    setCurrentFotoUrl(membro.foto_url || null);
    
    // Garantir que todos os campos existem para evitar uncontrolled input
    const p = membro.permissoes || {};
    setPermissoes({
      dashboard: !!p.dashboard,
      agenda: !!p.agenda,
      clientes: !!p.clientes,
      escala: !!p.escala,
      servicos: !!p.servicos,
    });
    
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditId(null);
  };

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 0) return '';
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este barbeiro?')) {
      try {
        await api.delete(`/usuarios/${id}`);
        toast.success('Barbeiro excluído com sucesso.');
        setEquipe(equipe.filter(m => m.id !== id));
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Erro ao excluir barbeiro.');
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Minha Equipe</h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie os barbeiros e acessos do painel</p>
        </div>
        <button 
          onClick={openModalForCreate}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm shadow-sm cursor-pointer"
        >
          <Plus size={18} />
          Novo Barbeiro
        </button>
      </div>

      {/* Content */}
      <div className="flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Carregando equipe...</p>
          </div>
        ) : equipe.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 border-dashed p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Users className="text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhum barbeiro na equipe</h3>
            <p className="text-slate-500 max-w-sm mb-6">Adicione membros à sua equipe para que eles possam receber agendamentos.</p>
            <button 
              onClick={openModalForCreate}
              className="text-sm font-medium text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Adicionar Barbeiro
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipe.map((membro) => (
              <div key={membro.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative group">
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModalForEdit(membro)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer" title="Editar">
                    <Edit2 size={16} />
                  </button>
                  {membro.role !== 'ADMIN' && (
                    <button onClick={() => handleDelete(membro.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer" title="Excluir">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                    {membro.foto_url ? (
                      <img src={`http://localhost:3333${membro.foto_url}`} alt={membro.nome} className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle className="text-slate-500" size={28} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight">{membro.nome}</h3>
                    <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                      {membro.role === 'ADMIN' ? 'Dono (Admin)' : 'Barbeiro'}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mt-4 pt-4 border-t border-slate-50">

                  <div className="flex items-center text-sm text-slate-600">
                    <div className={`w-2 h-2 rounded-full mr-2.5 ${membro.ativo ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>Status: </span>
                    <span className="font-medium text-slate-900 ml-1">{membro.ativo ? 'Ativo na agenda' : 'Inativo'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Novo Barbeiro */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">{editId ? 'Editar Barbeiro' : 'Novo Barbeiro'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateBarbeiro} className="p-6 space-y-5">
              
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-800">
                <Info size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm">A senha inicial do barbeiro será igual ao <strong>login</strong> escolhido. Ele será forçado a trocar a senha no primeiro acesso.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Foto de Perfil</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50">
                    {fotoFile ? (
                      <img src={URL.createObjectURL(fotoFile)} alt="Preview" className="w-full h-full object-cover" />
                    ) : currentFotoUrl ? (
                      <img src={`http://localhost:3333${currentFotoUrl}`} alt="Foto Atual" className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle className="text-slate-400 w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <input 
                      type="file" 
                      id="foto-upload-modal" 
                      className="hidden" 
                      accept="image/*"
                      onChange={e => {
                        if (e.target.files?.[0]) setFotoFile(e.target.files[0]);
                      }}
                    />
                    <label 
                      htmlFor="foto-upload-modal"
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors text-sm font-medium"
                    >
                      Escolher Foto
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="Ex: Carlos Silva"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Login de Acesso</label>
                  <input 
                    type="text" 
                    value={loginForm}
                    onChange={(e) => setLoginForm(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:opacity-50 disabled:bg-slate-50"
                    placeholder="Ex: carlos.barbeiro"
                    required
                    disabled={!!editId}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp</label>
                  <input 
                    type="text" 
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(formatWhatsApp(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    placeholder="Ex: (11) 99999-9999"
                    maxLength={15}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Comissão (%)</label>
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  step="0.1"
                  value={comissao_percentual}
                  onChange={(e) => setComissaoPercentual(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="Ex: 50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Permissões de Acesso</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={permissoes.dashboard}
                      onChange={() => handleTogglePermissao('dashboard')}
                      className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900"
                    />
                    <span className="text-sm text-slate-700">Acesso ao Dashboard</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={permissoes.agenda}
                      onChange={() => handleTogglePermissao('agenda')}
                      className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900"
                    />
                    <span className="text-sm text-slate-700">Acesso à Agenda</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={permissoes.clientes}
                      onChange={() => handleTogglePermissao('clientes')}
                      className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900"
                    />
                    <span className="text-sm text-slate-700">Acesso aos Clientes</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={permissoes.escala}
                      onChange={() => handleTogglePermissao('escala')}
                      className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900"
                    />
                    <span className="text-sm text-slate-700">Acesso à Minha Escala</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={permissoes.servicos}
                      onChange={() => handleTogglePermissao('servicos')}
                      className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900"
                    />
                    <span className="text-sm text-slate-700">Gerenciar Serviços</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
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
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editId ? 'Salvar' : 'Cadastrar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
