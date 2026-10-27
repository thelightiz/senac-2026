import { useRequests } from "../../hooks/useRequests";
import { RequestTable } from "../../components/RequestTable";

export const CADRequestQueue = () => {
  const { user, requests, error, isLoading } = useRequests("/cad/fila-de-solicitacoes");

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
      viewLinkPrefix="/cad/fila-de-solicitacoes/solicitacao"
    />
  );
};