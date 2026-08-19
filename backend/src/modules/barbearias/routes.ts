import { Router } from 'express';
import { BarbeariasController } from './controllers/BarbeariasController';

const barbeariasRouter = Router();
const barbeariasController = new BarbeariasController();

import { ensureAuthenticated } from '../../shared/middlewares/ensureAuthenticated';
import multer from 'multer';
import { multerConfig } from '../../config/multer';

const upload = multer(multerConfig);

// Since Express 5 supports async route handlers natively, we can just pass the method directly.
// We bind the method to preserve 'this' context if we use it inside the controller, though here it's static-like.
barbeariasRouter.post('/', barbeariasController.create.bind(barbeariasController));
barbeariasRouter.get('/config', ensureAuthenticated, barbeariasController.getConfig.bind(barbeariasController));
barbeariasRouter.patch('/config', ensureAuthenticated, upload.single('logo'), barbeariasController.updateConfig.bind(barbeariasController));

export { barbeariasRouter };
