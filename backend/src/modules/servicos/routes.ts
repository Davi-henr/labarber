import { Router } from 'express';
import { ServicosController } from './controllers/ServicosController';
import { ensureAuthenticated } from '../../shared/middlewares/ensureAuthenticated';

const servicosRouter = Router();
const servicosController = new ServicosController();

// O middleware ensureAuthenticated garante que as rotas abaixo só sejam
// acessadas se um JWT válido for fornecido, e injeta request.user
servicosRouter.use(ensureAuthenticated);

servicosRouter.post('/', servicosController.create.bind(servicosController));
servicosRouter.get('/', servicosController.index.bind(servicosController));
servicosRouter.put('/:id', servicosController.update.bind(servicosController));
servicosRouter.delete('/:id', servicosController.delete.bind(servicosController));

export { servicosRouter };
