import { Router } from 'express';
import { UsuariosController } from './controllers/UsuariosController';
import { ensureAuthenticated } from '../../shared/middlewares/ensureAuthenticated';
import { ensureAdmin } from '../../shared/middlewares/ensureAdmin';

const usuariosRouter = Router();
const usuariosController = new UsuariosController();

// Todas as rotas de usuários exigem autenticação e privilégio de ADMIN
usuariosRouter.use(ensureAuthenticated);
usuariosRouter.use(ensureAdmin);

import multer from 'multer';
import { multerConfig } from '../../config/multer';

const upload = multer(multerConfig);

usuariosRouter.post('/', usuariosController.create.bind(usuariosController));
usuariosRouter.get('/', usuariosController.index.bind(usuariosController));
usuariosRouter.put('/:id', usuariosController.update.bind(usuariosController));
usuariosRouter.delete('/:id', usuariosController.delete.bind(usuariosController));
usuariosRouter.patch('/:id/foto', upload.single('foto'), usuariosController.updateFoto.bind(usuariosController));

export { usuariosRouter };
