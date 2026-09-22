import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Link } from "react-router-dom";

interface UserData {
  nome: string;
  role: string;
}

export const GNIndexPage = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async() => {
      try {
        const response = await api.get("/gn/minhas-solicitacoes");
        setUser(response.data.usuario);
      } catch (error: any) {
        console.error("Status:", error.response?.status);
        console.error("Dados do erro (Django):", error.response?.data);
        setError("Ocorreu um erro ao carregar a página.");
      }
    };

    fetchUserData();
  }, []);

  if (error) {
    return <p className="text-center text-red-500 mt-4">{error}</p>;
  }

  return (
    <>
      <div className="mx-auto p-4">
        <div className="flex items-center justify-between mt-6">
          <p className="text-xl mt-3 text-gray-750">Bem-vindo, {user?.nome}!</p>
          <Link to="/gn/criar-solicitacao" className="rounded-md bg-botao-1 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-botao-1-700 focus-visible:outline-offset-2 focus-visible:outline-botao-entrar">Criar Solicitação</Link>
        </div>
        <h1 className="text-3xl text-center font-bold my-6">Minhas solicitações</h1>
      </div>
    </>
  );
};