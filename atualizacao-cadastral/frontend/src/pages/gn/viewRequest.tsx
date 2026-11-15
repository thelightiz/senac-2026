import { useParams } from "react-router-dom";
import { RequestDetailsLayout } from "../../components/RequestDetailsLayout";
import { useRequestDetails } from "../../hooks/useRequestDetails";

export const GNViewRequest = () => {
  const { id } = useParams<{ id: string }>();
  
  const {
    requestUpdate,
    pdfUrl,
    selectedDoc,
    setSelectedDoc,
    loading,
    showHistory,
    historicLogs,
    handleToggleHistory,
    formatCurrency,
    oldData,
    newData,
  } = useRequestDetails(id);
  
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center text-slate-500 font-medium">
        Carregando solicitação...
      </div>
    );
  }

  return (
    <>
      <RequestDetailsLayout
        updateRequestData={requestUpdate}
        oldData={oldData}
        newData={newData}
        historicLogs={historicLogs}
        showHistory={showHistory}
        onToggleHistory={handleToggleHistory}
        selectedDocument={selectedDoc}
        onSelectDocument={setSelectedDoc}
        pdfUrl={pdfUrl}
        formatCurrency={formatCurrency}
        actions={
          <>
            {requestUpdate.status === "Necessita Ajuste do GN" &&
              <a
                href={`/gn/minhas-solicitacoes/editar-solicitacao/${requestUpdate?.id}`}
                id="botao"
                className="rounded-md bg-botao-1 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-botao-1-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-botao-entrar"
              >
                Editar Solicitação
              </a>
            }
          </>
        }
      />
    </>
  );
};