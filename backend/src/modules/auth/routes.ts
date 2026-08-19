import { Router } from 'express';
import { AuthController } from './controllers/AuthController';
import { ensureAuthenticated } from '../../shared/middlewares/ensureAuthenticated';

const authRouter = Router();
const authController = new AuthController();

authRouter.post('/login', authController.login.bind(authController));
authRouter.post('/redefinir-senha', ensureAuthenticated, authController.redefinirSenha.bind(authController));

export { authRouter };
