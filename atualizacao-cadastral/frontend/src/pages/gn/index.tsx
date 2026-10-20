import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { UpdateRequest } from "../../interfaces/updateRequest";

interface UserData {
  name: string;
  role: string;
}

export const GNIndexPage = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<UpdateRequest[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get("/gn/minhas-solicitacoes");
        setUser(response.data.user);
        setRequests(response.data.requests)
      } catch (error: any) {
        console.error("Status:", error.response?.status);
        console.error("Error data (API):", error.response?.data);
        setError("An error occurred while loading the page.");
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
          <p className="text-xl mt-3 text-gray-750">Bem-vindo, {user?.name}!</p>
          <a
            href="/gn/criar-solicitacao"
            className="rounded-md bg-botao-1 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-botao-1-700 focus-visible:outline-offset-2 focus-visible:outline-botao-entrar"
          >
            Criar Solicitação
          </a>
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
              {requests.map((update_request) => (
                <tr key={update_request.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{update_request.id}</td>
                  <td className="px-6 py-4">{update_request.customer}</td>
                  <td className="px-6 py-4">{update_request.update_type}</td>
                  <td className="px-6 py-4">{update_request.status}</td>
                  <td className="px-6 py-4">
                    <a
                      href={`/gn/minhas-solicitacoes/ver-solicitacao/${update_request.id}`}
                      className="inline-flex items-center justify-center gap-1 hover:text-botao-1-700 hover:underline"
                    >
                      Ver
                    </a>
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