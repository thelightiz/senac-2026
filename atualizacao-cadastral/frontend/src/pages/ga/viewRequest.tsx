import { use, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api';

interface Documento {
  id: number;
  nome?: string;
  criado_em?: string;
}

interface UpdateRequest {
  id: number;
  criado_por: string;
  cliente: string;
  atualizacao: string;
  status: string;
  documentos: Documento[] | null;
}

export const GAViewRequestInfo = () => {
  const { id } = useParams<{ id: string }>();
  const [requestUpdate, setRequestUpdate] = useState<UpdateRequest | null>(null);
  const [pdfUrl, SetPdfUrl] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDoc, setSelectedDoc] = useState<number | null>(null);

  useEffect(() => {
    const fetchSolicitacao = async () => {
      try {
        const response = await api.get(`ver-solicitacao/${id}`);
        console.log("Resposta da API:", response.data);
        setRequestUpdate(response.data.solicitacao);

        if (response.data.solicitacao.documentos?.length > 0) {
          setSelectedDoc(response.data.solicitacao.documentos[0].id);
        }
      } catch (error) {
        console.error("Erro ao carregar os detalhes:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSolicitacao();
    }

  }, [id]);

  useEffect(() => {
    if (!selectedDoc) {
      return
    }

    let isCancelled = false;
    let activeBlobUrl: string | undefined = undefined;

    const fetchPdf = async () => {
        try {
          SetPdfUrl(undefined);
          const response = await api.get(`ver-documento/${selectedDoc}`, { responseType: "blob" });

          if (isCancelled) {
            return;
          }

          activeBlobUrl = URL.createObjectURL(response.data);
          SetPdfUrl(activeBlobUrl);
        } catch (error) {
        console.error("Erro ao carregar o PDF:", error);
        }
      };

      fetchPdf();
      
      return () => {
        if (activeBlobUrl) {
          URL.revokeObjectURL(activeBlobUrl);
        }
      };
    }, [selectedDoc]);

  if (loading) return <p>Carregando...</p>;

  return (
    <>
      <div className="w-full min-h-screen bg-white text-slate-900 flex flex-col justify-between p-6 sm:p-10">

        <div className="space-y-8 max-w-7xl mx-auto w-full">

          <div className="pb-6 border-b border-slate-200">
            <h1 className="text-2xl sm:text-3xl text-center text-slate-900 font-bold">Solicitação de Atualização Cadastral #{id}</h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-2">
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Criado por</span>
              <p className="text-base font-semibold text-slate-900">{requestUpdate?.criado_por}</p>
            </div>

            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Cliente</span>
              <p className="text-base font-semibold text-slate-900">{requestUpdate?.cliente}</p>
            </div>

            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Tipo de Atualização</span>
              <p className="text-base font-semibold text-slate-900">{requestUpdate?.atualizacao}</p>
            </div>

            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Status
              </span>
              <p className="text-base font-semibold text-slate-900">{requestUpdate?.status}</p>
            </div>
          </div>

          <div className="space-y-4">
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Documentos Anexados
            </span>

            <div className="flex flex-wrap gap-2">
              {requestUpdate?.documentos?.map((doc, index) => {
                const isSelected = selectedDoc === doc.id;
                return (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-botao-1 text-white shadow-sm'
                        : 'bg-botao-1-700 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {doc.nome || `Documento ${index + 1}`}
                  </button>
                );
              })}
            </div>

            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                width="100%"
                height="600px"
                title="Visualizador de PDF"
                className="rounded-xl border border-slate-200 shadow-sm w-full"
              />
            ) : (
              <div className="w-full h-[600px] flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-sm font-medium">
                Carregando visualização do documento...
              </div>
            )}
          </div>

        </div>

        <div className="pt-6 mt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-end items-center gap-4 max-w-7xl mx-auto w-full">
          <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-medium text-sm border border-slate-300 transition-colors">Rejeitar Solicitação</button>
          <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-medium text-sm border border-slate-300 transition-colors">Devolver para Ajuste</button>
          <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-botao-1 hover:bg-botao-1-700 text-white font-medium text-sm shadow-md transition-colors">Aprovar Solicitação</button>
        </div>

      </div>
    </>
  );
};