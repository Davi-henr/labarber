import { Router } from 'express';
import { WhatsAppController } from '../controllers/WhatsAppController';

const whatsappRouter = Router();
const whatsappController = new WhatsAppController();

whatsappRouter.get('/:barbearia_id/status', whatsappController.getStatus);
whatsappRouter.post('/:barbearia_id/create', whatsappController.createInstance);
whatsappRouter.delete('/:barbearia_id/delete', whatsappController.deleteInstance);

export default whatsappRouter;
