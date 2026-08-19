import { Router } from 'express';
import { SaasAuthController } from './controllers/SaasAuthController';
import { SaasBarbeariasController } from './controllers/SaasBarbeariasController';
import { ensureMaster } from '../../shared/middlewares/ensureMaster';

const saasRouter = Router();

const saasAuthController = new SaasAuthController();
const saasBarbeariasController = new SaasBarbeariasController();

// Login do Master
saasRouter.post('/login', saasAuthController.login);

// Rotas Protegidas do Master
saasRouter.use(ensureMaster);

saasRouter.get('/barbearias', saasBarbeariasController.index);
saasRouter.post('/barbearias', saasBarbeariasController.create);
saasRouter.delete('/barbearias/:id', saasBarbeariasController.delete);

export { saasRouter };
