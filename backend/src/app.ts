import express from 'express';
import cors from 'cors';
import path from 'path';
import { errorHandler } from './shared/middlewares/errorHandler';

import { authRouter } from './modules/auth/routes';
import { barbeariasRouter } from './modules/barbearias/routes';
import { servicosRouter } from './modules/servicos/routes';
import { usuariosRouter } from './modules/usuarios/routes';
import { chatbotRouter } from './modules/chatbot/routes';
import { agendamentosRouter } from './modules/agendamentos/routes';
import { escalasRouter } from './modules/escalas/routes';
import { clientesRouter } from './modules/clientes/routes';
import { dashboardRouter } from './modules/dashboard/routes';
import { portfolioRouter } from './modules/portfolio/routes';
import { saasRouter } from './modules/saas/routes';
import { whatsappRouter } from './modules/whatsapp/routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

// Routes
app.use('/auth', authRouter);
app.use('/barbearias', barbeariasRouter);
app.use('/servicos', servicosRouter);
app.use('/usuarios', usuariosRouter);
app.use('/chatbot', chatbotRouter);
app.use('/agendamentos', agendamentosRouter);
app.use('/escalas', escalasRouter);
app.use('/clientes', clientesRouter);
app.use('/dashboard', dashboardRouter);
app.use('/portfolio', portfolioRouter);
app.use('/saas', saasRouter);
app.use('/whatsapp', whatsappRouter);

// Global Error Handler (deve ser o último middleware)
app.use(errorHandler);

export { app };
