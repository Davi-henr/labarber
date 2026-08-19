import { Router } from 'express';
import { ensureAuthenticated } from '../../shared/middlewares/ensureAuthenticated';
import { ClientesController } from './controllers/ClientesController';

const clientesRouter = Router();
const clientesController = new ClientesController();

clientesRouter.use(ensureAuthenticated);
clientesRouter.get('/', clientesController.index);
clientesRouter.delete('/:id', clientesController.delete.bind(clientesController));

export { clientesRouter };
