import { app } from './app';
import { CronLembreteService } from './shared/services/CronLembreteService';

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}! 🚀`);

  // Iniciar os crons em background
  const cronLembrete = new CronLembreteService();
  cronLembrete.start();
  console.log('⏰ Serviços de Cron (Lembretes) iniciados com sucesso.');
});
