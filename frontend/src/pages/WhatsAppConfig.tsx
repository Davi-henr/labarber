import { useState, useEffect } from 'react';
import { useAuth, api } from '../contexts/AuthContext';
import { QrCode, Trash2, CheckCircle, RefreshCw, Smartphone } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchStatus = async () => {
    try {
      const response = await api.get(`/whatsapp/${barbeariaId}/status`);
      setStatus(response.data);
      if (response.data.isConnected) {
        setQrCode(null); // Clear QR code if already connected
      }
    } catch (error) {
      console.error('Erro ao buscar status do WhatsApp', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Poll status every 5 seconds if we have a QR code generated to detect scan
    let interval: number;
    if (qrCode) {
      interval = setInterval(fetchStatus, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [barbeariaId, qrCode]);

  const handleGenerateQR = async () => {
    setGenerating(true);
    try {
      const response = await api.post(`/whatsapp/${barbeariaId}/create`);
      if (response.data.qrcode) {
        setQrCode(response.data.qrcode);
      } else {
        fetchStatus(); // Might already be connected
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
      await fetchStatus();
    } catch (error) {
      console.error('Erro ao deletar instância', error);
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
      <p className="text-gray-400 mb-8">Conecte o número da sua barbearia para ativar notificações automáticas de agendamento.</p>

      <div className="bg-[#1C1C1C] border border-gray-800 rounded-xl p-8 shadow-2xl flex flex-col items-center">
        
        {/* Status Section */}
        <div className="flex items-center space-x-4 mb-8 w-full justify-center">
          <div className={`p-4 rounded-full ${status?.isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            <Smartphone size={32} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              Status da Conexão
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
                Sua barbearia já está disparando mensagens automaticamente para seus clientes através do n8n.
              </p>
              <button
                onClick={handleDeleteInstance}
                className="w-full py-3 bg-red-600/20 text-red-500 hover:bg-red-600/30 border border-red-900/50 rounded-lg flex items-center justify-center font-semibold transition"
              >
                <Trash2 size={18} className="mr-2" /> Desconectar Número
              </button>
            </>
          ) : (
            <>
              {!qrCode ? (
                <>
                  <p className="text-gray-300 mb-6">
                    Clique abaixo para gerar o QR Code. O sistema criará uma instância isolada apenas para a sua barbearia.
                  </p>
                  <button
                    onClick={handleGenerateQR}
                    disabled={generating}
                    className="w-full py-3 bg-amber-500 text-black hover:bg-amber-400 rounded-lg flex items-center justify-center font-bold transition disabled:opacity-50"
                  >
                    {generating ? <RefreshCw size={18} className="animate-spin mr-2" /> : <QrCode size={18} className="mr-2" />}
                    {generating ? 'Gerando Instância...' : 'Conectar WhatsApp'}
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                  <p className="text-amber-400 font-medium mb-4">Abra o WhatsApp e escaneie o código:</p>
                  <div className="bg-white p-4 rounded-xl shadow-lg">
                    {qrCode.startsWith('http') ? (
                      <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64 object-contain" />
                    ) : qrCode.startsWith('data:image') ? (
                       <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64 object-contain" />
                    ) : (
                       <img src={`data:image/png;base64,${qrCode}`} alt="WhatsApp QR Code" className="w-64 h-64 object-contain" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-6 animate-pulse">Aguardando leitura do código...</p>
                  
                  <button
                    onClick={() => setQrCode(null)}
                    className="mt-4 text-sm text-gray-400 hover:text-white"
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
