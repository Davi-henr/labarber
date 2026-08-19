import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../contexts/AuthContext';
import { LogOut, Home, Users, Scissors, Calendar, Clock, Settings, Image as ImageIcon, Smartphone } from 'lucide-react';

interface BarbeariaConfig {
  nome: string;
  logo_url: string | null;
}

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [config, setConfig] = useState<BarbeariaConfig | null>(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const response = await api.get('/barbearias/config');
        setConfig(response.data);
      } catch (error) {
        console.error('Erro ao carregar config da barbearia', error);
      }
    }
    if (user?.role === 'ADMIN') {
      loadConfig();
    }
  }, [user]);

  const isActive = (path: string) => location.pathname === path;
  const linkClass = (path: string) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(path) ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`;

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-slate-900 text-white flex-col hidden md:flex">
        <div className="h-16 flex items-center justify-center border-b border-slate-800">
          <div className="flex items-center gap-2">
            {config?.logo_url ? (
              <img src={`http://localhost:3333${config.logo_url}`} alt="Logo" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <Scissors className="text-white" size={24} />
            )}
            <h1 className="text-xl font-bold tracking-wider truncate max-w-[140px]">{config?.nome || 'LA BARBER'}</h1>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {(user?.role === 'ADMIN' || user?.permissoes?.dashboard) && (
            <Link to="/dashboard" className={linkClass('/dashboard')}>
              <Home size={20} />
              <span>Dashboard</span>
            </Link>
          )}
          {(user?.role === 'ADMIN' || user?.permissoes?.agenda) && (
            <Link to="/dashboard/agenda" className={linkClass('/dashboard/agenda')}>
              <Calendar size={20} />
              <span>Agenda</span>
            </Link>
          )}
          {(user?.role === 'ADMIN' || user?.permissoes?.clientes) && (
            <Link to="/dashboard/clientes" className={linkClass('/dashboard/clientes')}>
              <Users size={20} />
              <span>Clientes</span>
            </Link>
          )}
          {(user?.role === 'ADMIN' || user?.permissoes?.escala) && (
            <Link to="/dashboard/escala" className={linkClass('/dashboard/escala')}>
              <Clock size={20} />
              <span>Minha Escala</span>
            </Link>
          )}
          {(user?.role === 'ADMIN' || user?.permissoes?.servicos) && (
            <Link to="/dashboard/servicos" className={linkClass('/dashboard/servicos')}>
              <Scissors size={20} />
              <span>Serviços</span>
            </Link>
          )}
          
          {user?.role === 'ADMIN' && (
            <>
              <Link to="/dashboard/equipe" className={linkClass('/dashboard/equipe')}>
                <Users size={20} />
                <span>Equipe</span>
              </Link>
              <Link to="/dashboard/portfolio" className={linkClass('/dashboard/portfolio')}>
                <ImageIcon size={20} />
                <span>Portfólio</span>
              </Link>
              <Link to="/dashboard/whatsapp" className={linkClass('/dashboard/whatsapp')}>
                <Smartphone size={20} />
                <span>WhatsApp</span>
              </Link>
              <Link to="/dashboard/configuracoes" className={linkClass('/dashboard/configuracoes')}>
                <Settings size={20} />
                <span>Configurações</span>
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white uppercase">
              {user?.nome.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.nome}</p>
              <p className="text-xs text-slate-400 truncate">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white border-b flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {config?.logo_url ? (
              <img src={`http://localhost:3333${config.logo_url}`} alt="Logo" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <Scissors className="text-slate-900" size={24} />
            )}
            <h1 className="text-xl font-bold text-slate-900 truncate max-w-[150px]">{config?.nome || 'LA BARBER'}</h1>
          </div>
          <button onClick={logout} className="text-slate-600">
            <LogOut size={24} />
          </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-slate-50 p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
