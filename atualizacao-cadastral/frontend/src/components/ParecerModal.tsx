import React, { useState } from "react";

type ActionType = "REJECT" | "REQUEST_ADJUSTMENT_GN";

interface ParecerModalProps {
  modalAction: ActionType;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.SubmitEvent, parecer: File | null) => void;
}

export const ParecerModal: React.FC<ParecerModalProps> = ({
  modalAction,
  submitting,
  onClose,
  onSubmit,
}) => {
  const [parecer, setParecer] = useState<File | null>(null);

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!parecer) {
      alert("O documento é obrigatório");
      return;
    }
    onSubmit(e, parecer);
  };

  const isReprovar = modalAction === "REJECT";

  return (
    <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm space-y-6 max-w-7xl mx-auto w-full transition-all">
      <div className="flex justify-between items-start border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {isReprovar ? 'Rejeitar Solicitação' : 'Devolver para Ajuste'}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Preencha a justificativa e anexe o documento comprobatório para concluir a ação.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer bg-transparent border-none"
        >
          Cancelar e fechar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
            onClick={onClose}
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-sm font-medium border border-slate-300 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl bg-botao-1 hover:bg-botao-1-700 text-white text-sm font-medium transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Enviando...' : 'Confirmar e Enviar'}
          </button>
        </div>
      </form>
    </div>
  );
};