import { useEffect, useState, ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { api } from "./api";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        await api.get('/gn/minhas-solicitacoes');
        setHasAccess(true);
      } catch (error: any) {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
          setHasAccess(false);
        } else {
          setHasAccess(false);
        }
      }
    };

    checkAccess();
  }, []);

  if (hasAccess === null) {
    return <div className="flex justify-center items-center h-screen">Verificando acesso...</div>;
  }

  if (!hasAccess) {
    return <Navigate to="/erro/403" replace />;
  }

  return <>{children}</>
}
