import { Router } from 'express';
import { ensureAuthenticated } from '../../shared/middlewares/ensureAuthenticated';
import { AgendamentosController } from './controllers/AgendamentosController';

const agendamentosRouter = Router();
const agendamentosController = new AgendamentosController();

agendamentosRouter.use(ensureAuthenticated);

agendamentosRouter.get('/', agendamentosController.index);
agendamentosRouter.patch('/:id/status', agendamentosController.updateStatus);
agendamentosRouter.put('/:id/remarcar', agendamentosController.remarcar);
agendamentosRouter.delete('/:id', agendamentosController.delete);

export { agendamentosRouter };
