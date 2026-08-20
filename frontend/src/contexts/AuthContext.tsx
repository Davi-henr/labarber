import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  nome: string;
  login: string;
  role: string;
  barbearia_id: string;
  precisa_redefinir_senha?: boolean;
  permissoes?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const api = axios.create({
  baseURL: import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:3333')
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('@LaBarber:token');
    const storedUser = localStorage.getItem('@LaBarber:user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      api.defaults.headers.authorization = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, loggedUser: User) => {
    localStorage.setItem('@LaBarber:token', newToken);
    localStorage.setItem('@LaBarber:user', JSON.stringify(loggedUser));
    
    setToken(newToken);
    setUser(loggedUser);
    api.defaults.headers.authorization = `Bearer ${newToken}`;
  };

  const logout = () => {
    localStorage.removeItem('@LaBarber:token');
    localStorage.removeItem('@LaBarber:user');
    
    setToken(null);
    setUser(null);
    api.defaults.headers.authorization = '';
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-slate-50">Carregando...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
