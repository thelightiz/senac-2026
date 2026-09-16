import { useEffect } from "react";
import { api } from "../../services/api";

export const GNMyRequests = () => {
  const test = async () => {
    try {
      await api.get ("/gn/minhas-solicitacoes");
      console.log("Tem permissão");
    } catch (error: any) {
        console.log("Status:", error.response?.status);
        console.log("Dados do erro (Django):", error.response?.data);
        console.log("Full error:", error);
      }
  };

  useEffect(() => {
    test();
  }, []);

  return (
    <h1 className="text-3xl text-center">Minhas solicitações</h1>
  );
};