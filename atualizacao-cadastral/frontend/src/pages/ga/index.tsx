import { useRequests } from "../../hooks/useRequests";
import { RequestTable } from "../../components/RequestTable";

export const GARequestQueue = () => {
  const { user, requests, error, isLoading } = useRequests("/ga/fila-de-solicitacoes");

  if (error) {
    return <p className="text-center text-red-500 mt-4">{error}</p>
  };

  if (isLoading) {
    return <p className="text-center mt-4">Carregando...</p>
  };

  return (
    <RequestTable
      title="Lista de Solicitações"
      userName={user?.name}
      requests={requests}
      viewLinkPrefix="/ga/fila-de-solicitacoes/solicitacao"
    />
  );
};