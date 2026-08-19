import { Request, Response } from 'express';
import { ManageWhatsAppInstanceService } from '../services/ManageWhatsAppInstanceService';

export class WhatsAppController {
  async getStatus(req: Request, res: Response): Promise<Response> {
    const { barbearia_id } = req.params;
    try {
      const service = new ManageWhatsAppInstanceService();
      const status = await service.getStatus(barbearia_id);
      return res.json(status);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async createInstance(req: Request, res: Response): Promise<Response> {
    const { barbearia_id } = req.params;
    try {
      const service = new ManageWhatsAppInstanceService();
      const result = await service.createInstance(barbearia_id);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async deleteInstance(req: Request, res: Response): Promise<Response> {
    const { barbearia_id } = req.params;
    try {
      const service = new ManageWhatsAppInstanceService();
      await service.deleteInstance(barbearia_id);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
