import { useState, useEffect } from 'react';
import { useAuth, api } from '../contexts/AuthContext';
import { Trash2, CheckCircle, RefreshCw, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

interface WhatsAppStatus {
  isConnected: boolean;
  instanceName: string | null;
  state: string;
}

export function WhatsAppConfig() {
  const { user } = useAuth();
  const barbeariaId = user?.barbearia_id;
  
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchStatus = async () => {
    try {
      const response = await api.get(`/whatsapp/${barbeariaId}/status`);
      setStatus(response.data);
      if (response.data.isConnected) {
        setQrCode(null);
        setPairingCode(null);
      }
    } catch (error) {
      console.error('Erro ao buscar status do WhatsApp', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    let interval: number;
    if (qrCode || pairingCode) {
      interval = setInterval(fetchStatus, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [barbeariaId, qrCode, pairingCode]);

  
  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 0) return '';
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleGenerateQR = async () => {
    setGenerating(true);
    try {
      const numLimpo = phoneNumber.replace(/\\D/g, '');
      if (!numLimpo) {
        alert('Por favor, insira o nmero do WhatsApp (ex: 11999999999)');
        setGenerating(false);
        return;
      }
      const response = await api.post(`/whatsapp/${barbeariaId}/create`, { number: '55' + numLimpo });
      if (response.data.pairingCode) {
        setPairingCode(response.data.pairingCode);
      } else if (response.data.qrcode) {
        setQrCode(response.data.qrcode);
      } else {
        fetchStatus();
      }
    } catch (error) {
      console.error('Erro ao gerar QR code', error);
      alert('Falha ao gerar QR Code da Evolution API. Verifique os logs.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteInstance = async () => {
    if (!window.confirm('Tem certeza que deseja desconectar e deletar o WhatsApp da sua barbearia?')) return;
    
    setLoading(true);
    try {
      await api.delete(`/whatsapp/${barbeariaId}/delete`);
      setQrCode(null);
      setPairingCode(null);
      await fetchStatus();
    } catch (error) {
      console.error('Erro ao deletar instncia', error);
      alert('Falha ao desconectar.');
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Carregando status do WhatsApp...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-4xl mx-auto"
    >
      <h1 className="text-3xl font-bold text-white mb-2">WhatsApp do SaaS</h1>
      <p className="text-gray-400 mb-8">Conecte o nmero da sua barbearia para ativar notificaes automticas de agendamento.</p>

      <div className="bg-[#1C1C1C] border border-gray-800 rounded-xl p-8 shadow-2xl flex flex-col items-center">
        
        {/* Status Section */}
        <div className="flex items-center space-x-4 mb-8 w-full justify-center">
          <div className={`p-4 rounded-full ${status?.isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            <Smartphone size={32} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              Status da Conexo
            </h2>
            <div className="flex items-center mt-1">
              {status?.isConnected ? (
                <>
                  <CheckCircle size={16} className="text-green-500 mr-2" />
                  <span className="text-green-400 font-medium">Conectado ({status.instanceName})</span>
                </>
              ) : (
                <>
                  <span className="w-3 h-3 rounded-full bg-red-500 mr-2 inline-block"></span>
                  <span className="text-red-400 font-medium">Desconectado</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="w-full max-w-md bg-black/40 p-6 rounded-lg border border-gray-800 flex flex-col items-center text-center">
          
          {status?.isConnected ? (
            <>
              <p className="text-gray-300 mb-6">
                Sua barbearia j est disparando mensagens automaticamente para seus clientes atravs do n8n.
              </p>
              
              <button
                onClick={handleDeleteInstance}
                className="flex items-center justify-center w-full px-6 py-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors font-medium border border-red-500/20"
              >
                <Trash2 size={18} className="mr-2" />
                Desconectar e Deletar
              </button>
            </>
          ) : (
            <>
              {!qrCode && !pairingCode ? (
                <div className="w-full">
                  <p className="text-gray-400 mb-6 text-sm">
                    Clique abaixo para gerar o cdigo. O sistema criar uma instncia isolada apenas para a sua barbearia.
                  </p>
                  
                  <div className="mb-4 text-left">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nmero do WhatsApp (com DDD)</label>
                    <input
                      type="text"
                      placeholder="Ex: (11) 99999-9999"
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(formatWhatsApp(e.target.value))}
                      className="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  
                  <button 
                    onClick={handleGenerateQR}
                    disabled={generating}
                    className="flex items-center justify-center w-full px-6 py-3 bg-amber-500 text-black rounded-xl hover:bg-amber-400 disabled:opacity-50 transition-colors font-semibold shadow-lg shadow-amber-500/20"
                  >
                    {generating ? <RefreshCw size={18} className="animate-spin mr-2" /> : <Smartphone size={18} className="mr-2" />}
                    {generating ? 'Conectando...' : 'Conectar via Nmero'}
                  </button>
                </div>
              ) : pairingCode ? (
                <div className="flex flex-col items-center w-full animate-in fade-in zoom-in duration-300">
                  <p className="text-amber-400 font-medium mb-4">Cdigo de Pareamento Gerado!</p>
                  <p className="text-gray-400 text-sm mb-6">No WhatsApp, v em "Aparelhos Conectados" &gt; "Conectar com nmero de telefone" e digite:</p>
                  
                  <div className="bg-white px-8 py-6 rounded-2xl shadow-xl w-full flex items-center justify-center mb-6">
                    <span className="text-4xl font-black text-black tracking-widest">{pairingCode}</span>
                  </div>
                  
                  <p className="text-sm text-gray-500 mt-2 animate-pulse">Aguardando pareamento...</p>
                  
                  <button
                    onClick={() => setPairingCode(null)}
                    className="mt-6 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                  <p className="text-amber-400 font-medium mb-4">Abra o WhatsApp e escaneie o cdigo:</p>
                  <div className="bg-white p-4 rounded-xl shadow-lg">
                    {qrCode!.startsWith('http') ? (
                      <img src={qrCode || ''} alt="WhatsApp QR Code" className="w-64 h-64 object-contain" />
                    ) : qrCode!.startsWith('data:image') ? (
                       <img src={qrCode || ''} alt="WhatsApp QR Code" className="w-64 h-64 object-contain" />
                    ) : (
                       <img src={`data:image/png;base64,${qrCode || ''}`} alt="WhatsApp QR Code" className="w-64 h-64 object-contain" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-6 animate-pulse">Aguardando leitura do cdigo...</p>
                  
                  <button
                    onClick={() => setQrCode(null)}
                    className="mt-4 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
