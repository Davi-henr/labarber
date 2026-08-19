import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './routes/PrivateRoute';
import { Login } from './pages/Login';
import { RedefinirSenha } from './pages/RedefinirSenha';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Servicos } from './pages/Servicos';
import { Equipe } from './pages/Equipe';
import { Agenda } from './pages/Agenda';
import { Booking } from './pages/Booking';
import { LandingPage } from './pages/LandingPage';
import { Escala } from './pages/Escala';
import { Clientes } from './pages/Clientes';
import { Configuracoes } from './pages/Configuracoes';
import { Portfolio } from './pages/Portfolio';
import { MasterLogin } from './pages/MasterLogin';
import { MasterDashboard } from './pages/MasterDashboard';
import { WhatsAppConfig } from './pages/WhatsAppConfig';

import { Dashboard } from './pages/Dashboard';

export function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/b/:barbearia_id" element={<LandingPage />} />
          <Route path="/b/:barbearia_id/agendar" element={<Booking />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          
          {/* Rotas Master (SaaS) */}
          <Route path="/master" element={<MasterLogin />} />
          <Route path="/master/dashboard" element={<MasterDashboard />} />
          
          {/* Rotas Privadas */}
          <Route element={<PrivateRoute />}>
            <Route path="/redefinir-senha" element={<RedefinirSenha />} />
            
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="agenda" element={<Agenda />} />
              <Route path="clientes" element={<Clientes />} />
              <Route path="servicos" element={<Servicos />} />
              <Route path="equipe" element={<Equipe />} />
              <Route path="escala" element={<Escala />} />
              <Route path="configuracoes" element={<Configuracoes />} />
              <Route path="portfolio" element={<Portfolio />} />
              <Route path="whatsapp" element={<WhatsAppConfig />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
