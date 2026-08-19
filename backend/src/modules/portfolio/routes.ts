import { Router } from 'express';
import { PortfolioController } from './controllers/PortfolioController';
import { ensureAuthenticated } from '../../shared/middlewares/ensureAuthenticated';
import { ensureAdmin } from '../../shared/middlewares/ensureAdmin';
import multer from 'multer';
import { multerConfig } from '../../config/multer';

const portfolioRouter = Router();
const portfolioController = new PortfolioController();
const upload = multer(multerConfig);

portfolioRouter.use(ensureAuthenticated);
portfolioRouter.use(ensureAdmin);

portfolioRouter.post('/', upload.single('imagem'), portfolioController.create.bind(portfolioController));
portfolioRouter.get('/', portfolioController.index.bind(portfolioController));
portfolioRouter.delete('/:id', portfolioController.delete.bind(portfolioController));

export { portfolioRouter };
