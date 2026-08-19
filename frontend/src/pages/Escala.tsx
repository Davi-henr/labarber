import { useState, useEffect } from 'react';
import { api } from '../contexts/AuthContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Loader2, Save, Plus, Trash2, CalendarX2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EscalaDia {
  dia_semana: number;
  turno1_inicio: string;
  turno1_fim: string;
  turno2_inicio: string;
  turno2_fim: string;
  ativo: boolean;
}

interface Ausencia {
  id: string;
  data: string;
  descricao: string;
  barbeiro_id: string | null;
  tipo: string;
  barbeiro?: { nome: string };
}

const DIAS_NOME = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

const DEFAULT_ESCALA: EscalaDia[] = DIAS_NOME.map((_, index) => ({
  dia_semana: index,
  turno1_inicio: '09:00',
  turno1_fim: '12:00',
  turno2_inicio: '13:00',
  turno2_fim: '18:00',
  ativo: index !== 0 // Domingo fechado por padrão
}));

export function Escala() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [equipe, setEquipe] = useState<{ id: string; nome: string }[]>([]);
  const [barbeiroSelecionado, setBarbeiroSelecionado] = useState<string>('');

  const [escala, setEscala] = useState<EscalaDia[]>(DEFAULT_ESCALA);
  const [todasEscalas, setTodasEscalas] = useState<any[]>([]);
  const [ausencias, setAusencias] = useState<Ausencia[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form de Feriado/Folga
  const [novaFolgaData, setNovaFolgaData] = useState('');
  const [novaFolgaDescricao, setNovaFolgaDescricao] = useState('');
  const [novaFolgaBarbeiros, setNovaFolgaBarbeiros] = useState<string[]>([]);
  const [novaFolgaTipo, setNovaFolgaTipo] = useState<'FOLGA' | 'TRABALHO'>('FOLGA');
  const [novaFolgaTurno1Inicio, setNovaFolgaTurno1Inicio] = useState('09:00');
  const [novaFolgaTurno1Fim, setNovaFolgaTurno1Fim] = useState('12:00');
  const [novaFolgaTurno2Inicio, setNovaFolgaTurno2Inicio] = useState('13:00');
  const [novaFolgaTurno2Fim, setNovaFolgaTurno2Fim] = useState('18:00');

  useEffect(() => {
    if (isAdmin) carregarEquipe();
    else carregarDados();
  }, []);

  useEffect(() => {
    if (barbeiroSelecionado || !isAdmin) {
      carregarDados(barbeiroSelecionado);
    }
  }, [barbeiroSelecionado]);

  const carregarEquipe = async () => {
    try {
      const res = await api.get('/usuarios');
      setEquipe(res.data);
      if (res.data.length > 0 && !barbeiroSelecionado) {
        setBarbeiroSelecionado(res.data[0].id);
      }
    } catch (err) {
      toast.error('Erro ao carregar equipe');
    }
  };

  const parseTimeStr = (isoString: string) => isoString ? isoString.substring(11, 16) : '';

  const carregarDados = async (barbId?: string) => {
    setLoading(true);
    try {
      const params = barbId ? { barbeiro_id: barbId } : {};
      
      // Carrega Escala Fixa
      const res = await api.get('/escalas', { params });
      if (res.data && res.data.length > 0) {
        const bdEscala = DEFAULT_ESCALA.map(def => {
          const bd = res.data.find((d: any) => d.dia_semana === def.dia_semana);
          if (bd) {
            return {
              dia_semana: bd.dia_semana,
              ativo: bd.ativo,
              turno1_inicio: parseTimeStr(bd.turno1_inicio),
              turno1_fim: parseTimeStr(bd.turno1_fim),
              turno2_inicio: parseTimeStr(bd.turno2_inicio),
              turno2_fim: parseTimeStr(bd.turno2_fim),
            };
          }
          return def;
        });
        setEscala(bdEscala);
      } else {
        setEscala(DEFAULT_ESCALA);
      }

      // Carrega Feriados/Folgas
      const resAus = await api.get('/escalas/ausencias', { params });
      setAusencias(resAus.data);

      if (isAdmin) {
        const resTodas = await api.get('/escalas/todas');
        setTodasEscalas(resTodas.data);
      }


    } catch (error) {
      toast.error('Erro ao carregar configurações de agenda.');
    } finally {
      setLoading(false);
    }
  };

  const salvarEscala = async () => {
    setSaving(true);
    try {
      const payload = { 
        escalas: escala, 
        ...(isAdmin && barbeiroSelecionado ? { barbeiro_id: barbeiroSelecionado } : {})
      };
      await api.post('/escalas', payload);
      toast.success('Escala semanal salva com sucesso!');
      if (isAdmin) {
        const resTodas = await api.get('/escalas/todas');
        setTodasEscalas(resTodas.data);
      }
    } catch (error) {
      toast.error('Erro ao salvar escala.');
    } finally {
      setSaving(false);
    }
  };

  const updateDia = (diaIndex: number, field: keyof EscalaDia, value: any) => {
    const newEscala = [...escala];
    newEscala[diaIndex] = { ...newEscala[diaIndex], [field]: value };
    setEscala(newEscala);
  };

  const adicionarFolga = async () => {
    if (!novaFolgaData || !novaFolgaDescricao) {
      toast.error('Preencha a data e descrição da folga.');
      return;
    }

    try {
      await api.post('/escalas/ausencias', {
        data: novaFolgaData,
        descricao: novaFolgaDescricao,
        barbeiros_ids: novaFolgaBarbeiros,
        tipo: novaFolgaTipo,
        turno1_inicio: novaFolgaTipo === 'TRABALHO' ? novaFolgaTurno1Inicio : undefined,
        turno1_fim: novaFolgaTipo === 'TRABALHO' ? novaFolgaTurno1Fim : undefined,
        turno2_inicio: novaFolgaTipo === 'TRABALHO' ? novaFolgaTurno2Inicio : undefined,
        turno2_fim: novaFolgaTipo === 'TRABALHO' ? novaFolgaTurno2Fim : undefined,
      });
      toast.success('Exceção cadastrada com sucesso!');
      setNovaFolgaData('');
      setNovaFolgaDescricao('');
      setNovaFolgaBarbeiros([]);
      setNovaFolgaTipo('FOLGA');
      carregarDados(barbeiroSelecionado);
    } catch (error) {
      toast.error('Erro ao cadastrar exceção.');
    }
  };

  const deletarFolga = async (id: string) => {
    try {
      await api.delete(`/escalas/ausencias/${id}`);
      toast.success('Folga removida!');
      carregarDados(barbeiroSelecionado);
    } catch (error) {
      toast.error('Erro ao remover folga.');
    }
  };

  if (loading && (!isAdmin || equipe.length === 0)) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-slate-900 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Escala e Feriados</h1>
          <p className="text-slate-500 mt-1">Configure seus dias de trabalho e exceções de calendário.</p>
        </div>
        
        {isAdmin && (
          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-slate-700 mb-1">Selecionar Barbeiro</label>
            <select
              value={barbeiroSelecionado}
              onChange={(e) => setBarbeiroSelecionado(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-slate-900 outline-none"
            >
              {equipe.map(b => (
                <option key={b.id} value={b.id}>{b.nome}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Seção 1: Escala Fixa */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Escala Semanal</h2>
          <button
            onClick={salvarEscala}
            disabled={saving}
            className="bg-slate-900 text-white px-5 py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar Escala
          </button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {escala.map((dia, index) => (
            <div key={index} className="p-4 md:p-6 border-b border-slate-50 last:border-0 flex flex-col md:flex-row md:items-center gap-4 transition-colors hover:bg-slate-50">
              
              <div className="w-48 flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dia.ativo}
                    onChange={(e) => updateDia(index, 'ativo', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
                <span className={`font-semibold ${dia.ativo ? 'text-slate-900' : 'text-slate-400'}`}>
                  {DIAS_NOME[index]}
                </span>
              </div>

              <div className={`flex-1 flex flex-wrap gap-4 items-center ${!dia.ativo && 'opacity-30 pointer-events-none'}`}>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Manhã</span>
                  <input type="time" value={dia.turno1_inicio} onChange={(e) => updateDia(index, 'turno1_inicio', e.target.value)} className="bg-transparent text-sm focus:outline-none" />
                  <span className="text-slate-400">até</span>
                  <input type="time" value={dia.turno1_fim} onChange={(e) => updateDia(index, 'turno1_fim', e.target.value)} className="bg-transparent text-sm focus:outline-none" />
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tarde</span>
                  <input type="time" value={dia.turno2_inicio} onChange={(e) => updateDia(index, 'turno2_inicio', e.target.value)} className="bg-transparent text-sm focus:outline-none" />
                  <span className="text-slate-400">até</span>
                  <input type="time" value={dia.turno2_fim} onChange={(e) => updateDia(index, 'turno2_fim', e.target.value)} className="bg-transparent text-sm focus:outline-none" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Seção Resumo: Escalas Cadastradas */}
      {isAdmin && (
        <section className="pt-4">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Escalas Cadastradas</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {todasEscalas.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                Nenhum barbeiro ativo encontrado.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Barbeiro</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Dias de Trabalho</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {todasEscalas.map(b => {
                      const diasAtivos = b.escalas.filter((e: any) => e.ativo);
                      const resumoDias = diasAtivos.length === 0 
                        ? 'Nenhum dia configurado' 
                        : diasAtivos.map((e: any) => DIAS_NOME[e.dia_semana].substring(0, 3)).join(', ');

                      return (
                        <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900">{b.nome}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-600">{resumoDias}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => {
                                setBarbeiroSelecionado(b.id);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="text-sm font-medium text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors cursor-pointer"
                            >
                              Editar Escala
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Seção 2: Folgas e Feriados */}
      <section className="pt-4">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Folgas e Feriados</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário de Nova Exceção */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CalendarX2 size={18} className="text-slate-500" />
              Adicionar Exceção
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                <input 
                  type="date" 
                  value={novaFolgaData}
                  onChange={e => setNovaFolgaData(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-900" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Motivo / Descrição</label>
                <input 
                  type="text" 
                  placeholder="Ex: Feriado, Trabalhar no Domingo..."
                  value={novaFolgaDescricao}
                  onChange={e => setNovaFolgaDescricao(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-900" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">O que vai acontecer?</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setNovaFolgaTipo('FOLGA')}
                    className={`py-2 rounded-lg text-sm font-medium border-2 transition-colors ${novaFolgaTipo === 'FOLGA' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}
                  >
                    Estarei de Folga
                  </button>
                  <button
                    onClick={() => setNovaFolgaTipo('TRABALHO')}
                    className={`py-2 rounded-lg text-sm font-medium border-2 transition-colors ${novaFolgaTipo === 'TRABALHO' ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}
                  >
                    Vou Trabalhar
                  </button>
                </div>
              </div>

              {novaFolgaTipo === 'TRABALHO' && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-medium">Informe os horários para este dia específico:</p>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold w-12 text-slate-400 uppercase">Manhã</span>
                    <input type="time" value={novaFolgaTurno1Inicio} onChange={e => setNovaFolgaTurno1Inicio(e.target.value)} className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-sm focus:outline-none" />
                    <span className="text-slate-400">até</span>
                    <input type="time" value={novaFolgaTurno1Fim} onChange={e => setNovaFolgaTurno1Fim(e.target.value)} className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-sm focus:outline-none" />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold w-12 text-slate-400 uppercase">Tarde</span>
                    <input type="time" value={novaFolgaTurno2Inicio} onChange={e => setNovaFolgaTurno2Inicio(e.target.value)} className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-sm focus:outline-none" />
                    <span className="text-slate-400">até</span>
                    <input type="time" value={novaFolgaTurno2Fim} onChange={e => setNovaFolgaTurno2Fim(e.target.value)} className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-sm focus:outline-none" />
                  </div>
                </div>
              )}
              
              {isAdmin && novaFolgaTipo === 'TRABALHO' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Selecionar barbeiros que irão trabalhar</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                    {equipe.map(b => (
                      <label key={b.id} className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={novaFolgaBarbeiros.includes(b.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNovaFolgaBarbeiros([...novaFolgaBarbeiros, b.id]);
                            } else {
                              setNovaFolgaBarbeiros(novaFolgaBarbeiros.filter(id => id !== b.id));
                            }
                          }}
                          className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900"
                        />
                        <span className="text-sm font-medium text-slate-700">{b.nome}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <button 
                onClick={adicionarFolga}
                className="w-full bg-slate-900 text-white py-2 rounded-lg font-medium flex justify-center items-center gap-2 hover:bg-slate-800 transition-colors"
              >
                <Plus size={18} />
                Salvar Exceção
              </button>
            </div>
          </div>

          {/* Lista de Folgas */}
          <div className="lg:col-span-2 space-y-3">
            {ausencias.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
                <CalendarX2 size={40} className="text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">Nenhum feriado ou folga cadastrado.</p>
              </div>
            ) : (
              ausencias.map(ausencia => (
                <div key={ausencia.id} className="bg-white border border-slate-100 rounded-xl p-4 flex items-center justify-between shadow-sm">
                  <div>
                    <p className="font-bold text-slate-900">
                      {format(parseISO(ausencia.data.split('T')[0]), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                      {ausencia.descricao}
                      <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-bold tracking-wider ${
                        !ausencia.barbeiro_id ? 'bg-red-100 text-red-700' : 
                        ausencia.tipo === 'TRABALHO' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {!ausencia.barbeiro_id ? 'FERIADO GLOBAL' : `${ausencia.tipo === 'TRABALHO' ? 'TRABALHO' : 'FOLGA'}: ${ausencia.barbeiro?.nome}`}
                      </span>
                    </p>
                  </div>
                  <button 
                    onClick={() => deletarFolga(ausencia.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
