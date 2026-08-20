import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../contexts/AuthContext';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Scissors, UserCircle, Calendar as CalendarIcon, Clock, ArrowLeft, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Servico {
  id: string;
  nome: string;
  descricao?: string;
  valor: number;
  tempo_duracao_minutos: number;
}

interface Barbeiro {
  id: string;
  nome: string;
  foto_url?: string;
}

interface BarbeariaInfo {
  barbearia: { nome: string };
  servicos: Servico[];
  barbeiros: Barbeiro[];
}

export function Booking() {
  const { barbearia_id } = useParams<{ barbearia_id: string }>();
  const [step, setStep] = useState(1);
  const [info, setInfo] = useState<BarbeariaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Wizard State
  const [servicoId, setServicoId] = useState<string>('');
  const [barbeiroId, setBarbeiroId] = useState<string>('');
  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());
  const [horariosLivres, setHorariosLivres] = useState<string[]>([]);
  const [horarioEscolhido, setHorarioEscolhido] = useState<string>('');
  const [nomeCliente, setNomeCliente] = useState('');
  const [whatsappCliente, setWhatsappCliente] = useState('');
  
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!barbearia_id) return;
    api.get(`/chatbot/${barbearia_id}/info`)
      .then(res => {
        setInfo(res.data);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Erro ao carregar dados da barbearia.');
        setLoading(false);
      });
  }, [barbearia_id]);

  useEffect(() => {
    if (step === 3 && servicoId && barbeiroId) {
      buscarHorarios();
    }
  }, [step, dataSelecionada]);

  const buscarHorarios = async () => {
    if (!barbearia_id || !servicoId || !barbeiroId) return;
    
    setLoadingHorarios(true);
    try {
      const dataStr = format(dataSelecionada, 'yyyy-MM-dd');
      const res = await api.get(`/chatbot/${barbearia_id}/horarios-livres`, {
        params: { data: dataStr, servico_id: servicoId, barbeiro_id: barbeiroId }
      });
      setHorariosLivres(res.data);
    } catch (error) {
      toast.error('Erro ao buscar horários livres.');
    } finally {
      setLoadingHorarios(false);
    }
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);
    if (value.length > 2) value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
    if (value.length > 10) value = `${value.substring(0, 10)}-${value.substring(10)}`;
    setWhatsappCliente(value);
  };

  const handleFinalizar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barbearia_id || !servicoId || !barbeiroId || !horarioEscolhido) return;

    setSubmitting(true);
    try {
      const dataStr = format(dataSelecionada, 'yyyy-MM-dd');

      await api.post(`/chatbot/${barbearia_id}/agendar`, {
        servico_id: servicoId,
        barbeiro_id: barbeiroId,
        nome_cliente: nomeCliente,
        whatsapp_cliente: whatsappCliente.replace(/\D/g, ''),
        data: dataStr,
        horario_inicio: horarioEscolhido
      });
      
      setStep(5);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao agendar.');
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const days = Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i));

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-yellow-500 animate-spin mb-4" />
        <p className="text-gray-400 font-medium">Carregando experiência...</p>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl">
          <Scissors className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white">Barbearia não encontrada</h1>
          <p className="text-gray-400 mt-2">Verifique o link acessado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative bg-black font-sans">
      {/* Background Image fixo com Overlay Escuro */}
      <div 
        className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2940')] bg-cover bg-center bg-no-repeat"
        style={{ zIndex: 0 }}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative z-10 flex flex-col max-w-md mx-auto min-h-screen shadow-2xl">
        {/* Header Fixo */}
        {step < 5 && (
          <header className="p-6 sticky top-0 z-20 backdrop-blur-md bg-black/40 border-b border-white/10">
            {step > 1 && (
              <button onClick={prevStep} className="absolute left-4 top-6 text-gray-400 hover:text-yellow-500 transition-colors cursor-pointer">
                <ArrowLeft size={24} />
              </button>
            )}
            <div className="text-center">
              <h1 className="text-xl font-bold text-white truncate px-8">{info.barbearia.nome}</h1>
              <p className="text-yellow-500/80 text-xs mt-1 uppercase tracking-widest font-semibold">
                Passo {step} de 4
              </p>
            </div>
            
            {/* Barra de Progresso Neon Dourada */}
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-5 overflow-hidden">
              <div 
                className="bg-yellow-500 h-full transition-all duration-500 ease-out shadow-[0_0_15px_rgba(234,179,8,0.8)]"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </header>
        )}

        {/* Conteúdo Steps */}
        <main className="flex-1 p-6 overflow-y-auto pb-32">
          
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Scissors size={20} className="text-yellow-500" />
                O que vamos fazer hoje?
              </h2>
              <div className="space-y-4">
                {info.servicos.map(s => {
                  const isSelected = servicoId === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => { setServicoId(s.id); setTimeout(nextStep, 300); }}
                      className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all duration-300 ease-in-out cursor-pointer border backdrop-blur-md ${
                        isSelected 
                          ? 'bg-yellow-500/10 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="text-left w-full pr-4">
                        <h3 className="font-bold text-white text-base">{s.nome}</h3>
                        {s.descricao && (
                          <p className="text-sm text-gray-400 mt-1 line-clamp-2 leading-snug">{s.descricao}</p>
                        )}
                        <p className="text-xs text-yellow-500/80 mt-2 flex items-center gap-1.5 font-medium">
                          <Clock size={14} /> {s.tempo_duracao_minutos} min
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-white text-lg">{formatCurrency(s.valor)}</span>
                        <ChevronRight size={20} className={isSelected ? "text-yellow-500" : "text-gray-500"} />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <UserCircle size={20} className="text-yellow-500" />
                Com quem você quer cortar?
              </h2>
              <div className="space-y-4">
                {info.barbeiros.map(b => {
                  const isSelected = barbeiroId === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => { setBarbeiroId(b.id); setTimeout(nextStep, 300); }}
                      className={`w-full flex items-center p-5 rounded-2xl transition-all duration-300 ease-in-out cursor-pointer border backdrop-blur-md ${
                        isSelected 
                          ? 'bg-yellow-500/10 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center mr-5 shrink-0 transition-colors overflow-hidden ${isSelected ? 'bg-yellow-500/20' : 'bg-white/5'}`}>
                        {b.foto_url ? (
                          <img src={`http://localhost:3333${b.foto_url}`} alt={b.nome} className="w-full h-full object-cover" />
                        ) : (
                          <UserCircle className={isSelected ? "text-yellow-500" : "text-gray-400"} size={32} />
                        )}
                      </div>
                      <div className="text-left flex-1">
                        <h3 className="font-bold text-white text-lg">{b.nome}</h3>
                        <p className="text-sm text-gray-400 mt-0.5">Profissional Especialista</p>
                      </div>
                      <ChevronRight size={20} className={isSelected ? "text-yellow-500" : "text-gray-500"} />
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CalendarIcon size={20} className="text-yellow-500" />
                  Data e Horário
                </h2>
                {/* Calendário Nativo com look escuro */}
                <input 
                  type="date" 
                  value={format(dataSelecionada, 'yyyy-MM-dd')}
                  onChange={e => {
                    if(e.target.value) setDataSelecionada(parseISO(e.target.value));
                  }}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="text-sm bg-white/10 text-white px-3 py-1.5 rounded-lg border border-white/10 focus:ring-2 focus:ring-yellow-500 cursor-pointer outline-none color-scheme-dark"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              
              <div className="flex gap-3 overflow-x-auto pb-4 snap-x hide-scrollbar -mx-2 px-2">
                {days.map((day, idx) => {
                  const isSelected = isSameDay(day, dataSelecionada);
                  return (
                    <button
                      key={idx}
                      onClick={() => setDataSelecionada(day)}
                      className={`shrink-0 w-16 h-22 rounded-2xl flex flex-col items-center justify-center snap-center transition-all duration-300 cursor-pointer border backdrop-blur-md ${
                        isSelected 
                          ? 'bg-yellow-500 text-black border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)] scale-105' 
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <span className={`text-xs font-medium uppercase mb-1 ${isSelected ? 'text-black/80' : 'text-gray-500'}`}>
                        {format(day, 'EEE', { locale: ptBR })}
                      </span>
                      <span className={`text-2xl font-bold ${isSelected ? 'text-black' : 'text-white'}`}>
                        {format(day, 'dd')}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="mt-8">
                <h3 className="font-bold text-white mb-5 flex items-center gap-2">
                  <Clock size={16} className="text-yellow-500" />
                  Horários Disponíveis
                </h3>
                
                {loadingHorarios ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
                  </div>
                ) : horariosLivres.length === 0 ? (
                  <div className="text-center py-10 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl">
                    <p className="text-gray-400 text-sm">Nenhum horário livre nesta data.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {horariosLivres.map(hr => {
                      const isSelected = horarioEscolhido === hr;
                      return (
                        <button
                          key={hr}
                          onClick={() => { setHorarioEscolhido(hr); setTimeout(nextStep, 300); }}
                          className={`py-3.5 rounded-xl border transition-all duration-300 font-bold cursor-pointer text-center backdrop-blur-md ${
                            isSelected
                              ? 'bg-yellow-500 text-black border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)] scale-105'
                              : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                          }`}
                        >
                          {hr}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-white mb-2">
                Quase lá!
              </h2>
              <p className="text-gray-400 mb-8 text-sm">Preencha seus dados para confirmar a reserva.</p>
              
              <form id="booking-form" onSubmit={handleFinalizar} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Seu Nome Completo</label>
                  <input 
                    type="text" 
                    value={nomeCliente}
                    onChange={e => setNomeCliente(e.target.value)}
                    placeholder="Ex: João Silva"
                    required
                    className="w-full px-5 py-4 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">WhatsApp</label>
                  <input 
                    type="tel" 
                    value={whatsappCliente}
                    onChange={handleWhatsappChange}
                    placeholder="(11) 99999-9999"
                    required
                    className="w-full px-5 py-4 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                  />
                </div>

                <div className="mt-8 bg-white/5 border border-white/10 backdrop-blur-md p-6 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.8)]"></div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-yellow-500 mb-3 ml-2">Resumo da Reserva</h4>
                  <p className="text-lg font-bold text-white mb-1 ml-2">
                    {format(dataSelecionada, "dd 'de' MMMM", { locale: ptBR })} às <span className="text-yellow-500">{horarioEscolhido}</span>
                  </p>
                  <p className="text-sm text-gray-400 ml-2">
                    O profissional estará aguardando você.
                  </p>
                </div>
              </form>
            </div>
          )}

          {step === 5 && (
            <div className="h-full flex flex-col items-center justify-center text-center animate-in zoom-in duration-700 pt-16 pb-8">
              <div className="w-28 h-28 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                <CheckCircle2 size={56} className="drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">Confirmado!</h1>
              <p className="text-gray-400 max-w-xs mx-auto mb-10 text-lg leading-relaxed">
                Tudo certo, <span className="text-white font-medium">{nomeCliente.split(' ')[0]}</span>! Te esperamos no dia <span className="text-white font-medium">{format(dataSelecionada, "dd/MM")}</span> às <span className="text-yellow-500 font-bold">{horarioEscolhido}</span>.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="text-black font-bold bg-yellow-500 px-8 py-4 rounded-xl hover:bg-yellow-400 transition-all shadow-[0_0_20px_rgba(234,179,8,0.4)] cursor-pointer"
              >
                Fazer novo agendamento
              </button>
            </div>
          )}

        </main>

        {/* Footer Fixo com Botão Glow */}
        {step === 4 && (
          <div className="p-6 bg-black/60 backdrop-blur-xl border-t border-white/10 fixed bottom-0 left-0 right-0 md:absolute z-30">
            <button 
              type="submit"
              form="booking-form"
              disabled={submitting}
              className="w-full bg-yellow-500 text-black font-extrabold text-lg py-4 rounded-xl flex items-center justify-center disabled:opacity-70 active:scale-[0.98] transition-all hover:bg-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.5)] cursor-pointer"
            >
              {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Confirmar Presença'}
            </button>
          </div>
        )}
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .color-scheme-dark { color-scheme: dark; }
      `}</style>
    </div>
  );
}
