import { Router } from 'express';
import { ChatbotController } from './controllers/ChatbotController';

const chatbotRouter = Router();
const chatbotController = new ChatbotController();

// Rotas públicas (sem middleware de autenticação)
chatbotRouter.get('/:id/info', chatbotController.info.bind(chatbotController));
chatbotRouter.get('/:id/horarios-livres', chatbotController.horariosLivres.bind(chatbotController));
chatbotRouter.post('/:id/agendar', chatbotController.agendar.bind(chatbotController));

export { chatbotRouter };
