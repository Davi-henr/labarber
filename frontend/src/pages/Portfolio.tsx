import { useState, useEffect } from 'react';
import { api } from '../contexts/AuthContext';
import { Plus, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface PortfolioCorte {
  id: string;
  imagem_url: string;
  legenda: string | null;
}

export function Portfolio() {
  const [fotos, setFotos] = useState<PortfolioCorte[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form
  const [file, setFile] = useState<File | null>(null);
  const [legenda, setLegenda] = useState('');

  useEffect(() => {
    loadFotos();
  }, []);

  async function loadFotos() {
    try {
      const response = await api.get('/portfolio');
      setFotos(response.data);
    } catch (error) {
      toast.error('Erro ao carregar portfólio');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Tem certeza que deseja remover esta foto?')) return;

    try {
      await api.delete(`/portfolio/${id}`);
      setFotos(prev => prev.filter(f => f.id !== id));
      toast.success('Foto removida');
    } catch (error) {
      toast.error('Erro ao remover foto');
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      toast.error('Selecione uma imagem primeiro');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('imagem', file);
      if (legenda) formData.append('legenda', legenda);

      await api.post('/portfolio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Foto enviada!');
      setIsModalOpen(false);
      setFile(null);
      setLegenda('');
      loadFotos();
    } catch (error) {
      toast.error('Erro ao enviar foto');
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Portfólio de Cortes</h1>
          <p className="text-slate-500 mt-1">Gerencie as fotos que aparecem na Landing Page da barbearia</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors font-medium"
        >
          <Plus size={20} />
          Nova Foto
        </button>
      </div>

      {fotos.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">Nenhuma foto no portfólio</h3>
          <p className="text-slate-500">Comece a adicionar fotos dos melhores cortes para atrair mais clientes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {fotos.map(foto => (
            <div key={foto.id} className="bg-white rounded-xl overflow-hidden shadow-sm border group">
              <div className="aspect-[4/5] relative bg-slate-100">
                <img 
                  src={`http://localhost:3333${foto.imagem_url}`} 
                  alt={foto.legenda || 'Corte'} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => handleDelete(foto.id)}
                    className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              {foto.legenda && (
                <div className="p-3 border-t">
                  <p className="text-sm text-slate-600 truncate" title={foto.legenda}>{foto.legenda}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-lg font-bold text-slate-900">Adicionar Foto</h2>
            </div>

            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Imagem do Corte</label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 transition-colors">
                  <input
                    type="file"
                    id="foto-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setFile(e.target.files[0]);
                    }}
                  />
                  <label htmlFor="foto-upload" className="cursor-pointer block">
                    {file ? (
                      <div className="relative aspect-[4/5] w-32 mx-auto rounded-lg overflow-hidden">
                        <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="py-8">
                        <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600 font-medium">Clique para selecionar</p>
                        <p className="text-xs text-slate-400 mt-1">PNG, JPG ou WEBP</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Legenda / Estilo (Opcional)</label>
                <input
                  type="text"
                  value={legenda}
                  onChange={e => setLegenda(e.target.value)}
                  placeholder="Ex: Degradê navalhado com pigmentação"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900"
                  maxLength={50}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setFile(null);
                    setLegenda('');
                  }}
                  className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading || !file}
                  className="flex-1 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  {uploading ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
