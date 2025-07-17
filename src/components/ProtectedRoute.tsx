import { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { getSession } from '../lib/auth';

export function ProtectedRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const session = await getSession(token);
      
      if (!session) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      setIsAuthenticated(true);
    };

    checkAuth();
  }, [navigate]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return <Outlet />;
}
