import { useEffect, useState, ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { api } from "./api";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
};

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await api.get("/auth");
        if (response.data.role == requiredRole) {
          setHasAccess(true);
        } else {
          setHasAccess(false);
        }
      } catch (error: any) {
        const status = error.response?.status;
        setErrorStatus(status || 500);
        setHasAccess(false);
      }
    };

    checkAccess();
  }, []);

  if (hasAccess === null) {
    return <div className="flex justify-center items-center h-screen">Verificando acesso...</div>;
  }

  if (!hasAccess) {
    if (errorStatus === 401) {
      return <Navigate to="/entrar" replace />;
    }

    return <Navigate to="/erro/403" replace />;
  }

  return <>{children}</>;
};
