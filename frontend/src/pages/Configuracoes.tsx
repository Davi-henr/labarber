import { useState, useEffect } from 'react';
import { api } from '../contexts/AuthContext';
import { Save, Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ConfiguracoesData {
  nome: string;
  logo_url: string | null;
  endereco: string | null;
  historia_texto: string | null;
  cor_primaria: string | null;
}

export function Configuracoes() {
  const [data, setData] = useState<ConfiguracoesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    try {
      const response = await api.get('/barbearias/config');
      setData(response.data);
    } catch (error) {
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;

    try {
      setSaving(true);
      const formData = new FormData();
      if (data.nome) formData.append('nome', data.nome);
      if (data.endereco) formData.append('endereco', data.endereco);
      if (data.historia_texto) formData.append('historia_texto', data.historia_texto);
      if (data.cor_primaria) formData.append('cor_primaria', data.cor_primaria);
      if (logoFile) formData.append('logo', logoFile);

      await api.patch('/barbearias/config', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Configurações salvas com sucesso!');
      loadConfig();
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
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
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Configurações da Barbearia</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Logo da Barbearia</label>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50">
              {logoFile ? (
                <img src={URL.createObjectURL(logoFile)} alt="Logo Preview" className="w-full h-full object-cover" />
              ) : data?.logo_url ? (
                <img src={`http://localhost:3333${data.logo_url}`} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Upload className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <div>
              <input
                type="file"
                id="logo-upload"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) setLogoFile(e.target.files[0]);
                }}
              />
              <label 
                htmlFor="logo-upload"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors text-sm font-medium"
              >
                Escolher Imagem
              </label>
              <p className="text-xs text-slate-500 mt-2">Recomendado: 500x500px, PNG ou JPG.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Barbearia</label>
            <input 
              type="text" 
              value={data?.nome || ''} 
              onChange={e => setData(prev => prev ? {...prev, nome: e.target.value} : null)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900"
            />
            <p className="text-xs text-slate-500 mt-1">Este é o nome que os clientes verão.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cor Primária (Tema)</label>
            <div className="flex gap-3">
              <input 
                type="color" 
                value={data?.cor_primaria || '#000000'}
                onChange={e => setData(prev => prev ? {...prev, cor_primaria: e.target.value} : null)}
                className="w-10 h-10 p-1 border rounded-lg cursor-pointer"
              />
              <input 
                type="text" 
                value={data?.cor_primaria || '#000000'}
                onChange={e => setData(prev => prev ? {...prev, cor_primaria: e.target.value} : null)}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900"
                placeholder="#000000"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Endereço Completo</label>
          <input 
            type="text" 
            value={data?.endereco || ''}
            onChange={e => setData(prev => prev ? {...prev, endereco: e.target.value} : null)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900"
            placeholder="Rua Exemplo, 123 - Bairro, Cidade - Estado"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Sobre Nós / História</label>
          <textarea 
            rows={5}
            value={data?.historia_texto || ''}
            onChange={e => setData(prev => prev ? {...prev, historia_texto: e.target.value} : null)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900 resize-none"
            placeholder="Conte a história da barbearia e os seus diferenciais para os clientes..."
          />
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button 
            type="submit" 
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors font-medium"
          >
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            Salvar Configurações
          </button>
        </div>
      </form>
    </div>
  );
}
