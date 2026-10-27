import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { api } from "../../utils/api";
import { useRequestDetails } from "../../hooks/useRequestDetails";
import { RequestDetailsLayout } from "../../components/RequestDetailsLayout";

type ActionType = "REJECT" | "REQUEST_ADJUSTMENT_GN" | "REQUEST_ADJUSTMENT_GA" | "FORMALIZE";

export const CADViewRequestInfo = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

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

  const [modalAction, setModalAction] = useState<ActionType | null>(null);
  const [parecer, setParecer] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleAccept = async (requestData: FormData) => {
    try {
      const response = await api.post(`cad/efetivar-solicitacao/${requestUpdate?.id}`, requestData)
      console.log("Aceitado, resposta:", response.data)
      
      return navigate("/cad/fila-de-solicitacoes/");
    } catch (error) {
      console.error("Erro ao aceitar a solicitação:", error);
    }
  };

  const handleOpenModal = (action: ActionType) => {
    setModalAction(action);
    setParecer(null);
  };

  const ACTION_LABELS: Record<ActionType, string> = {
    REJECT: 'Rejeitar Solicitação',
    REQUEST_ADJUSTMENT_GN: 'Devolver para Ajuste ao GN',
    REQUEST_ADJUSTMENT_GA: 'Devolver para Ajuste ao GA',
    FORMALIZE: 'Efetivar Solicitação'
  };

  const handleCloseModal = () => {
    setModalAction(null);
    setParecer(null);
  };

  const handleSubmitParecer = async (e: React.SubmitEvent) => {
    e.preventDefault();

    if (!parecer) {
      alert("O documento é obrigatório")
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("action", modalAction || "");
      formData.append("parecer", parecer);

      if (modalAction === 'FORMALIZE') {
        await handleAccept(formData);
      } else {
        await api.post(`retornar-solicitacao/${requestUpdate?.id}`, formData);
        handleCloseModal();
        navigate("/cad/fila-de-solicitacoes/");
      }
    } catch (error) {
      console.error("Erro ao enviar decisão:", error);
      alert("Ocorreu um erro ao processar a ação. Tente novamente.");
    } finally {
      setSubmitting(false);
    }

  };

  if (loading) return <p>Carregando...</p>;

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
            <button
              onClick={() => handleOpenModal("REJECT")}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-medium text-sm border border-slate-300 transition-colors"
            >
              Rejeitar
            </button>
            <button
              onClick={() => handleOpenModal("REQUEST_ADJUSTMENT_GN")}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-medium text-sm border border-slate-300 transition-colors"
            >
              Devolver GN
            </button>
            <button
              onClick={() => handleOpenModal("REQUEST_ADJUSTMENT_GA")}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-medium text-sm border border-slate-300 transition-colors"
            >
              Devolver GA
            </button>
            <button
              onClick={() => handleOpenModal("FORMALIZE")}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-botao-1 hover:bg-botao-1-700 text-white font-medium text-sm shadow-md transition-colors"
            >
              Efetivar
            </button>
          </>
        }
      />

      {modalAction && (
        <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm space-y-6 max-w-7xl mx-auto w-full transition-all">
          <div className="flex justify-between items-start border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {ACTION_LABELS[modalAction] || "Ação desconhecida"}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Preencha a justificativa e anexe o documento comprobatório para concluir a ação.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCloseModal}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
            >
              Cancelar e fechar
            </button>
          </div>

          <form onSubmit={handleSubmitParecer} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Parecer Obrigatório
              </label>
              <input
                type="file"
                required
                onChange={(e) => setParecer(e.target.files ? e.target.files[0] : null)}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-sm font-medium border border-slate-300 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-botao-1 hover:bg-botao-1-700 text-white text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                {submitting ? 'Enviando...' : 'Confirmar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};