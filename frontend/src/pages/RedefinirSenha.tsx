import React, { useState } from 'react';

import { api, useAuth } from '../contexts/AuthContext';
import { Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function RedefinirSenha() {
  const [senhaNova, setSenhaNova] = useState('');
  const [senhaConfirmacao, setSenhaConfirmacao] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user, logout } = useAuth();

  const handleRedefinir = async (e: React.FormEvent) => {
    e.preventDefault();

    if (senhaNova !== senhaConfirmacao) {
      toast.error('As senhas não conferem.');
      return;
    }

    if (senhaNova.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/redefinir-senha', { nova_senha: senhaNova });
      toast.success('Senha atualizada com sucesso! Por favor, faça login novamente.');
      logout();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao redefinir senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="text-blue-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Redefinir Senha</h1>
          <p className="text-slate-500 text-sm mt-2">
            Olá, {user?.nome?.split(' ')[0]}! Como este é o seu primeiro acesso, você precisa criar uma senha segura para sua conta.
          </p>
        </div>

        <form onSubmit={handleRedefinir} className="space-y-6">
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-slate-700">Nova Senha</label>
            <input 
              type="password" 
              value={senhaNova}
              onChange={(e) => setSenhaNova(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
              placeholder="Digite sua nova senha"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-slate-700">Confirmar Nova Senha</label>
            <input 
              type="password" 
              value={senhaConfirmacao}
              onChange={(e) => setSenhaConfirmacao(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
              placeholder="Digite a senha novamente"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-70 flex justify-center mt-4 cursor-pointer"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Atualizar Senha'}
          </button>
        </form>
      </div>
    </div>
  );
}
