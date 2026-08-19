import axios from 'axios';
import { prisma } from '../../../config/prisma';

interface CreateInstanceResponse {
  instance: {
    instanceName: string;
    status: string;
  };
  hash: {
    apikey: string;
  };
}

interface ConnectionStateResponse {
  instance: {
    instanceName: string;
    state: string; // "open", "connecting", "close"
  };
}

interface QRCodeResponse {
  qrcode: string; // base64
  urlcode: string;
}

export class ManageWhatsAppInstanceService {
  private get baseUrl() {
    return process.env.EVOLUTION_API_URL || 'http://localhost:8080';
  }

  private get globalApiKey() {
    return process.env.EVOLUTION_API_KEY || '';
  }

  private get headers() {
    return {
      apikey: this.globalApiKey,
      'Content-Type': 'application/json',
    };
  }

  async getStatus(barbearia_id: string): Promise<{ isConnected: boolean; instanceName: string | null; state: string }> {
    const barbearia = await prisma.barbearia.findUnique({ where: { id: barbearia_id } });
    if (!barbearia || !barbearia.instancia_whatsapp) {
      return { isConnected: false, instanceName: null, state: 'not_created' };
    }

    try {
      const response = await axios.get<ConnectionStateResponse>(
        `${this.baseUrl}/instance/connectionState/${barbearia.instancia_whatsapp}`,
        { headers: this.headers }
      );

      const state = response.data?.instance?.state || 'close';
      const isConnected = state === 'open';

      // Update DB if state changed
      if (barbearia.whatsapp_conectado !== isConnected) {
        await prisma.barbearia.update({
          where: { id: barbearia_id },
          data: { whatsapp_conectado: isConnected },
        });
      }

      return { isConnected, instanceName: barbearia.instancia_whatsapp, state };
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Instance doesn't exist on Evolution API
        return { isConnected: false, instanceName: barbearia.instancia_whatsapp, state: 'not_found' };
      }
      console.error('Error fetching WhatsApp status:', error.message);
      return { isConnected: false, instanceName: barbearia.instancia_whatsapp, state: 'error' };
    }
  }

  async createInstance(barbearia_id: string): Promise<{ qrcode: string }> {
    let barbearia = await prisma.barbearia.findUnique({ where: { id: barbearia_id } });
    if (!barbearia) throw new Error('Barbearia não encontrada');

    let instanceName = barbearia.instancia_whatsapp;
    if (!instanceName) {
      instanceName = `barbearia_${barbearia_id}`;
      // Update DB first
      barbearia = await prisma.barbearia.update({
        where: { id: barbearia_id },
        data: { instancia_whatsapp: instanceName },
      });
    }

    try {
      // 1. Try to fetch the instance first to see if it exists
      await axios.get(`${this.baseUrl}/instance/fetchInstances?instanceName=${instanceName}`, { headers: this.headers });
      // If it exists, we just need to connect/get qrcode
    } catch (error: any) {
      // 2. If it doesn't exist, create it
      try {
        const createRes = await axios.post(
          `${this.baseUrl}/instance/create`,
          {
            instanceName,
            qrcode: true,
            integration: "WHATSAPP-BAILEYS",
            reject_call: false
          },
          { headers: this.headers }
        );
        
        // Evolution V2 usually returns the QR code directly upon creation if requested
        const data = createRes.data;
        const qrcodeData = data?.qrcode?.base64 || data?.base64 || data?.qrcode || data?.urlcode;
        if (qrcodeData) {
          return { qrcode: typeof qrcodeData === 'string' ? qrcodeData : qrcodeData.base64 || '' };
        }
      } catch (createError: any) {
        console.error('Error creating instance:', createError.response?.data || createError.message);
        throw new Error('Falha ao criar instância no WhatsApp');
      }
    }

    // 3. Request connection to get QR code
    try {
      const connectResponse = await axios.get(
        `${this.baseUrl}/instance/connect/${instanceName}`,
        { headers: this.headers }
      );
      
      const data = connectResponse.data;
      let qrcodeData = data?.qrcode?.base64 || data?.base64 || data?.qrcode || data?.urlcode;

      if (qrcodeData) {
         if (typeof qrcodeData !== 'string' && qrcodeData.base64) {
             qrcodeData = qrcodeData.base64;
         }
         return { qrcode: qrcodeData };
      }
      
      return { qrcode: '' }; // Already connected or no QR returned
    } catch (connectError: any) {
       console.error('Error getting QR Code:', connectError.response?.data || connectError.message);
       throw new Error('Falha ao gerar QR Code');
    }
  }

  async deleteInstance(barbearia_id: string): Promise<void> {
    const barbearia = await prisma.barbearia.findUnique({ where: { id: barbearia_id } });
    if (!barbearia || !barbearia.instancia_whatsapp) return;

    try {
      // Try to logout first
      await axios.delete(`${this.baseUrl}/instance/logout/${barbearia.instancia_whatsapp}`, { headers: this.headers }).catch(() => {});
      // Then delete
      await axios.delete(`${this.baseUrl}/instance/delete/${barbearia.instancia_whatsapp}`, { headers: this.headers });
    } catch (error: any) {
      console.error('Error deleting instance:', error.response?.data || error.message);
    }

    await prisma.barbearia.update({
      where: { id: barbearia_id },
      data: { whatsapp_conectado: false },
    });
  }
}
