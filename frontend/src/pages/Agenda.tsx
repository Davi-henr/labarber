import { useState, useEffect } from 'react';
import { api, useAuth } from '../contexts/AuthContext';
import { Loader2, ChevronLeft, ChevronRight, Calendar as CalendarIcon, MessageCircle, Clock, Scissors, X, RefreshCw, Check, AlertTriangle, Trash2 } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Agendamento {
  id: string;
  barbeiro_id: string;
  cliente: {
    nome: string;
    whatsapp: string;
  };
  servico: {
    id: string;
    nome: string;
    tempo_duracao_minutos: number;
  };
  data_hora_inicio: string;
  data_hora_fim: string;
  status: string;
}

export function Agenda() {
  const { user } = useAuth();
  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  
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

  const fetchAgenda = async () => {
    if (!barbeiroSelecionado) return;
    try {
      setLoading(true);
      const dataFormatada = format(dataSelecionada, 'yyyy-MM-dd');
      const response = await api.get(`/agendamentos?data=${dataFormatada}&barbeiro_id=${barbeiroSelecionado}`);
      setAgendamentos(response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const [remarcando, setRemarcando] = useState<Agendamento | null>(null);
  const [novaData, setNovaData] = useState('');
  const [novoHorario, setNovoHorario] = useState('');
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [buscandoHorarios, setBuscandoHorarios] = useState(false);

  useEffect(() => {
    if (remarcando && novaData && user?.barbearia_id) {
      buscarHorariosLivres();
    } else {
      setHorariosDisponiveis([]);
      setNovoHorario('');
    }
  }, [novaData]);

  const buscarHorariosLivres = async () => {
    try {
      setBuscandoHorarios(true);
      const response = await api.get(`/chatbot/${user?.barbearia_id}/horarios-livres`, {
        params: {
          data: novaData,
          servico_id: remarcando?.servico.id,
          barbeiro_id: remarcando?.barbeiro_id || barbeiroSelecionado
        }
      });
      setHorariosDisponiveis(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setBuscandoHorarios(false);
    }
  };

  const handleAtualizarStatus = async (id: string, status: string) => {
    let msg = 'Deseja confirmar esta ação?';
    if (status === 'CANCELADO') msg = 'Deseja realmente cancelar este agendamento?';
    if (status === 'CONCLUIDO') msg = 'Confirmar finalização do serviço?';
    if (status === 'FALTOU') msg = 'Confirmar que o cliente não compareceu?';

    if (!confirm(msg)) return;
    
    try {
      await api.patch(`/agendamentos/${id}/status`, { status });
      fetchAgenda();
    } catch (error) {
      console.error(error);
    }
  };

  const handleExcluir = async (id: string) => {
    if (!confirm('Deseja excluir permanentemente este agendamento do histórico?')) return;
    try {
      await api.delete(`/agendamentos/${id}`);
      fetchAgenda();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemarcar = async () => {
    if (!remarcando || !novaData || !novoHorario) return;
    try {
      await api.put(`/agendamentos/${remarcando.id}/remarcar`, {
        data: novaData,
        horario_inicio: novoHorario,
        barbeiro_id: remarcando.barbeiro_id || barbeiroSelecionado
      });
      setRemarcando(null);
      setNovaData('');
      setNovoHorario('');
      fetchAgenda();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Horário indisponível ou erro ao remarcar.');
    }
  };

  useEffect(() => {
    fetchAgenda();
  }, [dataSelecionada, barbeiroSelecionado]);

  const handlePrevDay = () => setDataSelecionada(prev => subDays(prev, 1));
  const handleNextDay = () => setDataSelecionada(prev => addDays(prev, 1));
  const handleToday = () => setDataSelecionada(new Date());

  const formatarHora = (dataString: string) => {
    return format(new Date(dataString), 'HH:mm');
  };

  const openWhatsApp = (numero: string) => {
    const numLimpo = numero.replace(/\D/g, '');
    window.open(`https://wa.me/55${numLimpo}`, '_blank');
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      {/* Header & Navegação */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agenda Diária</h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie os horários e clientes de hoje</p>
        </div>

        {user?.role === 'ADMIN' && equipe.length > 0 && (
          <select 
            value={barbeiroSelecionado}
            onChange={(e) => setBarbeiroSelecionado(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm text-sm font-medium focus:ring-2 focus:ring-slate-900 cursor-pointer"
          >
            <option value={user.id}>Minha Agenda</option>
            {equipe.filter(b => b.id !== user.id).map(b => (
              <option key={b.id} value={b.id}>Agenda de {b.nome}</option>
            ))}
          </select>
        )}
      </div>

      {/* Date Picker Simples */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between mb-8">
        <button onClick={handlePrevDay} className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
          <ChevronLeft className="text-slate-600" />
        </button>
        
        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            {format(dataSelecionada, 'EEEE', { locale: ptBR })}
          </span>
          <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <CalendarIcon size={20} className="text-slate-700" />
            {format(dataSelecionada, "dd 'de' MMMM", { locale: ptBR })}
          </div>
          {format(dataSelecionada, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd') && (
            <button onClick={handleToday} className="text-xs text-blue-600 font-medium mt-1 hover:underline cursor-pointer">
              Voltar para hoje
            </button>
          )}
        </div>

        <button onClick={handleNextDay} className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
          <ChevronRight className="text-slate-600" />
        </button>
      </div>

      {/* Timeline de Agendamentos (Single Column) */}
      <div className="flex-1 pb-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Buscando agenda...</p>
          </div>
        ) : agendamentos.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 border-dashed p-12 text-center h-64">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <CalendarIcon className="text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Agenda Livre</h3>
            <p className="text-slate-500">Nenhum cliente agendado para este dia ainda.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {agendamentos.map((ag) => (
              <div key={ag.id} className="flex items-stretch gap-4 relative group">
                
                {/* Indicador de Horário Esquerdo */}
                <div className="w-16 flex flex-col items-center shrink-0 pt-3 relative">
                  <span className="text-sm font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md mb-2 z-10">{formatarHora(ag.data_hora_inicio)}</span>
                  <div className="w-px h-full bg-slate-200 absolute top-8 bottom-[-16px] -z-0"></div>
                </div>
                
                {/* Card Principal */}
                <div className="flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    
                    {/* Info Cliente & Serviço */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between md:justify-start gap-3 mb-1">
                        <h3 className="font-bold text-slate-900 text-lg">{ag.cliente.nome}</h3>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${ag.status === 'CANCELADO' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {ag.status}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 mt-2">
                        <span className="flex items-center font-medium bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                          <Scissors size={14} className="mr-1.5 text-slate-400" />
                          {ag.servico.nome}
                        </span>
                        <span className="flex items-center">
                          <Clock size={14} className="mr-1.5 text-slate-400" />
                          {ag.servico.tempo_duracao_minutos} min
                        </span>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-2 pt-3 md:pt-0 border-t border-slate-100 md:border-0 mt-2 md:mt-0">
                      <button 
                        onClick={() => openWhatsApp(ag.cliente.whatsapp)}
                        className="flex-1 md:flex-none flex justify-center text-green-600 bg-green-50 hover:bg-green-100 p-2 rounded-lg transition-colors cursor-pointer"
                        title="Chamar no WhatsApp"
                      >
                        <MessageCircle size={18} />
                      </button>

                      {ag.status === 'AGENDADO' || ag.status === 'CONFIRMADO' || ag.status === 'PENDENTE' ? (
                        <>
                          {new Date() > new Date(ag.data_hora_inicio) && (
                            <button 
                              onClick={() => handleAtualizarStatus(ag.id, 'CONCLUIDO')}
                              className="flex-1 md:flex-none flex justify-center text-emerald-600 bg-emerald-50 hover:bg-emerald-100 p-2 rounded-lg transition-colors cursor-pointer"
                              title="Finalizar/Concluído"
                            >
                              <Check size={18} />
                            </button>
                          )}
                          
                          {new Date() > new Date(ag.data_hora_inicio) && (
                            <button 
                              onClick={() => handleAtualizarStatus(ag.id, 'FALTOU')}
                              className="flex-1 md:flex-none flex justify-center text-orange-600 bg-orange-50 hover:bg-orange-100 p-2 rounded-lg transition-colors cursor-pointer"
                              title="Não Compareceu"
                            >
                              <AlertTriangle size={18} />
                            </button>
                          )}
                          
                          <button 
                            onClick={() => { setRemarcando(ag); setNovaData(''); setHorariosDisponiveis([]); }}
                            className="flex-1 md:flex-none flex justify-center text-blue-600 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors cursor-pointer"
                            title="Remarcar"
                          >
                            <RefreshCw size={18} />
                          </button>
                          <button 
                            onClick={() => handleAtualizarStatus(ag.id, 'CANCELADO')}
                            className="flex-1 md:flex-none flex justify-center text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors cursor-pointer"
                            title="Cancelar Agendamento"
                          >
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => handleExcluir(ag.id)}
                          className="flex-1 md:flex-none flex justify-center text-slate-400 bg-slate-50 hover:bg-slate-100 hover:text-red-600 p-2 rounded-lg transition-colors cursor-pointer"
                          title="Excluir Definitivamente"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Remarcação Inteligente */}
      {remarcando && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Remarcar Horário</h2>
            <p className="text-sm text-slate-500 mb-6">Você está remarcando o corte de <strong>{remarcando.cliente.nome}</strong>. Selecione uma data para ver a disponibilidade.</p>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Escolha a Nova Data</label>
                <input 
                  type="date" 
                  value={novaData}
                  onChange={(e) => setNovaData(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {novaData && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Horários Disponíveis</label>
                  {buscandoHorarios ? (
                    <div className="flex items-center text-sm text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin mr-2"/> Buscando disponibilidade...
                    </div>
                  ) : horariosDisponiveis.length === 0 ? (
                    <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">Não há horários livres para este dia.</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {horariosDisponiveis.map((hr, idx) => (
                        <button
                          key={idx}
                          onClick={() => setNovoHorario(hr)}
                          className={`py-2 rounded-lg text-sm font-medium transition-colors border ${novoHorario === hr ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'}`}
                        >
                          {hr}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8 pt-4 border-t border-slate-100">
              <button 
                onClick={() => { setRemarcando(null); setNovaData(''); setNovoHorario(''); setHorariosDisponiveis([]); }}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                Voltar
              </button>
              <button 
                onClick={handleRemarcar}
                disabled={!novoHorario}
                className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 flex justify-center cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
