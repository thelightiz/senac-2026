import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Link } from "react-router-dom";

interface UserData {
  nome: string;
  role: string;
}

interface Request {
  id: number;
  criado_por: string;
  cliente: string;
  atualizacao: string;
  status: string;
  documento: string | null;
}

export const GNIndexPage = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get("/gn/minhas-solicitacoes");
        setUser(response.data.usuario);

        setRequests(response.data.solicitacoes)
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

        <div className="overflow-x-auto shadow-md sm:rounded-lg">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="uppercase tracking-wider border-b-2 border-gray-200 bg-gray-50 text-botao-1">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Ação</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{r.id}</td>
                  <td className="px-6 py-4">{r.cliente}</td>
                  <td className="px-6 py-4">{r.atualizacao}</td>
                  <td className="px-6 py-4">{r.status}</td>
                  <td className="px-6 py-4">
                    {r.documento
                      ? <a href={r.documento} className="hover:text-botao-1-700 hover:underline flex items-center gap-1" target="_blank" rel="noreferrer">Ver</a>
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};