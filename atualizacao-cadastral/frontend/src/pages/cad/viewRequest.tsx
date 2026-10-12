import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "../../services/api";

interface Documento {
  id: number;
  nome?: string;
}

interface DadosAntigos {
  id: number;
  salario_snapshot: number;
  endereco_snapshot: string;
  cep_snapshot: string;
  tem_imoveis_snapshot: boolean;
  tem_veiculos_snapshot: boolean;
  imoveis_snapshot: Imovel[];
  veiculos_snapshot: Veiculo[];
}

interface DadosNovos {
  id: number;
  salario: number;
  residencia_endereco: string;
  residencia_cep: string;
  imovel?: Imovel[];
  veiculo?: Veiculo[];
}

interface Imovel {
  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  cep: string | null;
}

interface Veiculo {
  renavam: string | null;
  placa: string | null;
  marca_modelo: string | null;
  ano: string | null;
}

interface UpdateRequest {
  id: number;
  criado_por: string;
  cliente: string;
  atualizacao: string;
  status: string;
  dados_antigos: DadosAntigos[] | null;
  dados_novos: DadosNovos[] | null;
  documentos: Documento[] | null;
}

type ActionType = "REPROVAR" | "SOLICITAR_AJUSTE_GN" | "SOLICITAR_AJUSTE_GA" | "EFETIVAR";

export const CADViewRequestInfo = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [requestUpdate, setRequestUpdate] = useState<UpdateRequest | null>(null);
  const [pdfUrl, SetPdfUrl] = useState<string | undefined>(undefined);
  const [selectedDoc, setSelectedDoc] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [historicLogs, setHistoricLogs] = useState<any[]>([]);
  

  const [modalAction, setModalAction] = useState<ActionType | null>(null);
  const [parecer, setParecer] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const formatCurrency = (val: any) => {
    if (val === null || val === undefined) return '-';
    return `R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  let dadosAntigos = null;
  let dadosNovos = null;

  const handleToggleHistory = async () => {
    if (!showHistory && historicLogs.length === 0) {
      try {
        const response = await api.get(`ver-solicitacao/${id}/historico`);
        console.log(response.data)
        setHistoricLogs(response.data);
      } catch (error) {
        console.log("Erro ao buscar histórico:", error);
      }
    }
    setShowHistory(!showHistory);
  };

  useEffect(() => {
    const fetchSolicitacao = async () => {
      try {
        const response = await api.get(`ver-solicitacao/${id}`);
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
      return;
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
    REPROVAR: 'Rejeitar Solicitação',
    SOLICITAR_AJUSTE_GN: 'Devolver para Ajuste ao GN',
    SOLICITAR_AJUSTE_GA: 'Devolver para Ajuste ao GA',
    EFETIVAR: 'Efetivar Solicitação'
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

      if (modalAction === 'EFETIVAR') {
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

  dadosAntigos = requestUpdate?.dados_antigos?.[0];
  dadosNovos = requestUpdate?.dados_novos?.[0];

  if (loading) return <p>Carregando...</p>;

  console.log(requestUpdate)

  return (
    <>
      <div className="w-full min-h-screen text-slate-900 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto space-y-6">

          <div className="bg-white p-6 rounded-2xl space-y-6">
            <h1 className="text-2xl sm:text-3xl text-center text-slate-900 font-bold">
              Solicitação de Atualização Cadastral #{id}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 py-2">
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Criado por
                </span>
                <p className="text-base font-semibold text-slate-900">
                  {requestUpdate?.criado_por}
                </p>
              </div>

              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Cliente
                </span>
                <p className="text-base font-semibold text-slate-900">
                  {requestUpdate?.cliente}
                </p>
              </div>

              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Tipo de Atualização
                </span>
                <p className="text-base font-semibold text-slate-900">
                  {requestUpdate?.atualizacao || '-'}
                </p>
              </div>

              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Status
                </span>
                <p className="text-base font-semibold text-slate-900">
                  {requestUpdate?.status || 'Em Análise'}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-center h-full">
                  <button
                    onClick={handleToggleHistory}
                    className="text-sm font-semibold text-slate-900 hover:underline cursor-pointer bg-transparent border-none p-0"
                  >
                    {showHistory ? "Ocultar histórico" : "Ver histórico"}
                  </button>
                </div>
              </div>

            </div>
          </div>

          {showHistory && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Histórico de Movimentações ({historicLogs.length})
                </h2>
              </div>

              {historicLogs.length > 0 ? (
                <div className="relative border-l border-slate-200 ml-4 space-y-8 py-2">
                  {historicLogs.map((log, index) => (
                    <div key={log.id || index} className="relative pl-6">

                      <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#33820d] ring-4 ring-[#33820d]/10" />
                      
                      <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs">
                          <span className="font-semibold text-slate-500">
                            {new Date(log.created_at).toLocaleString('pt-BR', {
                              dateStyle: 'short',
                              timeStyle: 'medium'
                            })}
                          </span>
                          <span className="font-medium bg-slate-200/60 px-2 py-0.5 rounded text-slate-700 w-fit">
                            Responsável: <strong className="text-slate-900">{log.usuario_username || 'Sistema'}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm pt-1">
                          <span className="px-2.5 py-1 rounded-md bg-slate-200 text-slate-700 text-xs font-semibold">
                            {log.status_anterior || 'Início'}
                          </span>
                          <span className="text-slate-400 font-bold">➔</span>
                          <span className="px-2.5 py-1 rounded-md bg-[#33820d]/10 text-[#33820d] text-xs font-semibold border border-[#33820d]/20">
                            {log.status_atual}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-6 italic">
                  Nenhum registro de histórico encontrado.
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
              <div className="bg-slate-100 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Dados Antigos (Atual)
                </h2>
              </div>

              <div className="p-5 space-y-6 flex-1 text-sm">
                {dadosAntigos ? (
                  <>
                    <div className="space-y-2 bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500 font-medium">
                          Salário
                        </span>
                        <span className="font-semibold text-slate-800">
                          {formatCurrency(dadosAntigos.salario_snapshot)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500 font-medium">
                          Endereço
                        </span>
                        <span className="font-semibold text-slate-800 text-right">
                          {dadosAntigos.endereco_snapshot || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500 font-medium">
                          CEP
                        </span>
                        <span className="font-semibold text-slate-800">
                          {dadosAntigos.cep_snapshot || '-'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">
                        Imóveis Cadastrados ({dadosAntigos.imoveis_snapshot?.length || 0})
                      </h3>
                      {dadosAntigos.imoveis_snapshot && dadosAntigos.imoveis_snapshot.length > 0 ? (
                        <div className="space-y-2">
                          {dadosAntigos.imoveis_snapshot.map((imovel: any, index: number) => (
                            <div
                              key={index}
                              className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1"
                            >
                              <p>
                                <span className="font-medium text-slate-500">
                                  Endereço:
                                </span> {imovel.endereco || '-'}
                              </p>
                              <p>
                                <span className="font-medium text-slate-500">
                                  Bairro/Cidade:
                                </span> {imovel.bairro || '-'} - {imovel.cidade || '-'}
                              </p>
                              <p>
                                <span className="font-medium text-slate-500">
                                  CEP:
                                </span> {imovel.cep || '-'}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          Nenhum imóvel registrado.
                        </p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">
                        Veículos Cadastrados ({dadosAntigos.veiculos_snapshot?.length || 0})
                      </h3>
                      {dadosAntigos.veiculos_snapshot && dadosAntigos.veiculos_snapshot.length > 0 ? (
                        <div className="space-y-2">
                          {dadosAntigos.veiculos_snapshot.map((veiculo: any, index: number) => (
                            <div
                              key={index}
                              className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1"
                            >
                              <p className="font-semibold text-slate-800">
                                {veiculo.marca_modelo || '-'} ({veiculo.ano || '-'})
                              </p>
                              <p>
                                <span className="font-medium text-slate-500">
                                  Placa:
                                </span> {veiculo.placa || '-'} | 
                                <span className="font-medium text-slate-500">
                                  RENAVAM:
                                </span> {veiculo.renavam || '-'}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          Nenhum veículo registrado.
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6">
                    Nenhum dado antigo encontrado.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
              <div className="bg-slate-100 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Dados Novos Solicitados
                </h2>
              </div>

              <div className="p-5 space-y-6 flex-1 text-sm">
                {dadosNovos ? (
                  <>
                    <div className="space-y-2 bg-blue-50/40 p-4 rounded-xl border border-blue-100">
                      <div className="flex justify-between py-1 border-b border-blue-100">
                        <span className="text-slate-500 font-medium">
                          Salário
                        </span>
                        <span className="font-semibold text-slate-900">
                          {formatCurrency(dadosNovos.salario)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-blue-100">
                        <span className="text-slate-500 font-medium">
                          Endereço
                        </span>
                        <span className="font-semibold text-slate-900 text-right">
                          {dadosNovos.residencia_endereco || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500 font-medium">
                          CEP
                        </span>
                        <span className="font-semibold text-slate-900">
                          {dadosNovos.residencia_cep || '-'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">
                        Imóveis Solicitados ({dadosNovos.imovel?.length || 0})
                      </h3>
                      {dadosNovos.imovel && dadosNovos.imovel.length > 0 ? (
                        <div className="space-y-2">
                          {dadosNovos.imovel.map((imovel: any, index: number) => (
                            <div
                              key={index}
                              className="bg-blue-50/30 p-3 rounded-lg border border-blue-100 text-xs space-y-1">
                              <p>
                                <span className="font-medium text-slate-500">
                                  Endereço:
                                </span> {imovel.endereco || '-'}
                              </p>
                              <p>
                                <span className="font-medium text-slate-500">
                                  Bairro/Cidade:
                                </span> {imovel.bairro || '-'} - {imovel.cidade || '-'}
                              </p>
                              <p>
                                <span className="font-medium text-slate-500">
                                  CEP:
                                </span> {imovel.cep || '-'}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          Nenhum imóvel informado.
                        </p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">
                        Veículos Solicitados ({dadosNovos.veiculo?.length || 0})
                      </h3>
                      {dadosNovos.veiculo && dadosNovos.veiculo.length > 0 ? (
                        <div className="space-y-2">
                          {dadosNovos.veiculo.map((veiculo: any, index: number) => (
                            <div
                              key={index}
                              className="bg-blue-50/30 p-3 rounded-lg border border-blue-100 text-xs space-y-1"
                            >
                              <p className="font-semibold text-slate-800">
                                {veiculo.marca_modelo || '-'} ({veiculo.ano || '-'})
                              </p>
                              <p>
                                <span className="font-medium text-slate-500">
                                  Placa:
                                </span> {veiculo.placa || '-'} | 
                                <span className="font-medium text-slate-500">
                                  RENAVAM:</span> {veiculo.renavam || '-'}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          Nenhum veículo informado.
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6">
                    Nenhum dado novo encontrado.
                  </p>
                )}
              </div>
            </div>

          </div>

          <div className="bg-white p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Documentos Anexados
              </h2>
            </div>

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
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {doc.nome || `Documento ${index + 1}`}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
              {pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  width="100%"
                  height="650px"
                  title="Visualizador de PDF"
                  className="w-full border-none"
                />
              ) : (
                <div className="w-full h-[400px] flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
                  <p>
                    Selecione um documento acima para visualizar o PDF
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

        <div className="pt-6 mt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-end items-center gap-4 max-w-7xl mx-auto w-full">
          <button
            onClick={() => handleOpenModal('REPROVAR')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-medium text-sm border border-slate-300 transition-colors'"
          >
            Rejeitar Solicitação
          </button>
          
          <button
            onClick={() => handleOpenModal('SOLICITAR_AJUSTE_GN')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-medium text-sm border border-slate-300 transition-colors"
          >
            Devolver para o GN ajustar
          </button>

          <button
            onClick={() => handleOpenModal('SOLICITAR_AJUSTE_GA')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-medium text-sm border border-slate-300 transition-colors"
          >
            Devolver para o GA ajustar
          </button>
          
          <button
            onClick={() => handleOpenModal('EFETIVAR')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-botao-1 hover:bg-botao-1-700 text-white font-medium text-sm shadow-md transition-colors"
          >
            Efetivar Mudanças
          </button>
        </div>

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