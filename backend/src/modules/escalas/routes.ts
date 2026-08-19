import { Router } from 'express';
import { ensureAuthenticated } from '../../shared/middlewares/ensureAuthenticated';
import { EscalasController } from './controllers/EscalasController';

import { AusenciasController } from './controllers/AusenciasController';

const escalasRouter = Router();
const escalasController = new EscalasController();
const ausenciasController = new AusenciasController();

escalasRouter.use(ensureAuthenticated);

escalasRouter.get('/', escalasController.getEscala);
escalasRouter.get('/todas', escalasController.getAll);
escalasRouter.post('/', escalasController.saveEscala);
escalasRouter.put('/', escalasController.saveEscala);

escalasRouter.get('/ausencias', ausenciasController.list);
escalasRouter.post('/ausencias', ausenciasController.create);
escalasRouter.delete('/ausencias/:id', ausenciasController.delete);

export { escalasRouter };
