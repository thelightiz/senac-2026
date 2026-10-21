import { useRequests } from "../../hooks/useRequests";
import { RequestTable } from "../../components/RequestTable";

export const GNIndexPage = () => {
  const { user, requests, error, isLoading } = useRequests("/gn/minhas-solicitacoes");

  if (error) return <p className="text-center text-red-500 mt-4">{error}</p>;
  if (isLoading) return <p className="text-center mt-4">Loading...</p>;

  return (
    <RequestTable
      title="Minhas Solicitações"
      userName={user?.name}
      requests={requests}
      viewLinkPrefix="/gn/minhas-solicitacoes/ver-solicitacao"
      actionButton={
        <a
          href="/gn/criar-solicitacao"
          className="rounded-md bg-botao-1 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-botao-1-700 focus-visible:outline-offset-2 focus-visible:outline-botao-entrar"
        >
          Criar Solicitação
        </a>
      }
    />
  );
};