import { use, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  dados_solicitacao_antigos: DadosAntigos[] | null;
  dados_solicitacoes_novos: DadosNovos[] | null;
  documentos: Documento[] | null;
}

export const GNViewRequest = () => {
  const { id } = useParams<{ id: string }>();
  const [requestUpdate, setRequestUpdate] = useState<UpdateRequest | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined);
  const [selectedDoc, setSelectedDoc] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const navigate = useNavigate();

  const formatCurrency = (val: any) => {
    if (val === null || val === undefined) return '-';
    return `R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  let dadosAntigos = null;
  let dadosNovos = null;

  useEffect(() => {
    const fetchSolicitacao = async () => {
      try {
        const response = await api.get(`ver-solicitacao/${id}`);
        console.log(response);
        setRequestUpdate(response.data.solicitacao);

        if (response.data.solicitacao.documentos?.length > 0) {
          setSelectedDoc(response.data.solicitacao.documentos[0].id);
        }
      } catch (error) {
        console.log("Erro:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSolicitacao()
      console.log(requestUpdate)
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
        setPdfUrl(undefined);
        const response = await api.get(`ver-documento/${selectedDoc}`, {responseType: "blob"});

        if (isCancelled) {
          return;
        }

        activeBlobUrl = URL.createObjectURL(response.data);
        setPdfUrl(activeBlobUrl);

      } catch (error) {
        console.log("Erro:", error)
      }
    };

    
    fetchPdf();
    
    return () => {
      if (activeBlobUrl) {
        URL.revokeObjectURL(activeBlobUrl);
      }
    };
  }, [selectedDoc]);
  
  dadosAntigos = requestUpdate?.dados_solicitacao_antigos?.[0];
  dadosNovos = requestUpdate?.dados_solicitacoes_novos?.[0];
  
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center text-slate-500 font-medium">
        Carregando solicitação...
      </div>
    );
  }

  return (
    <>
      <div className="w-full min-h-screen text-slate-900 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto space-y-6">

          <div className="bg-white p-6 rounded-2xl space-y-6">
            <h1 className="text-2xl sm:text-3xl text-center text-slate-900 font-bold">
              Solicitação de Atualização Cadastral #{id}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-2">
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Criado por
                </span>
                <p className="text-base font-semibold text-slate-900">{requestUpdate?.criado_por}</p>
              </div>

              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Cliente
                </span>
                <p className="text-base font-semibold text-slate-900">{requestUpdate?.cliente}</p>
              </div>

              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Tipo de Atualização</span>
                <p className="text-base font-semibold text-slate-900">{requestUpdate?.atualizacao || '-'}</p>
              </div>

              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Status</span>
                <p className="text-base font-semibold text-slate-900">{requestUpdate?.status || 'Em Análise'}</p>
              </div>

            </div>
          </div>

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
                        <span className="text-slate-500 font-medium">Salário</span>
                        <span className="font-semibold text-slate-800">{formatCurrency(dadosAntigos.salario_snapshot)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500 font-medium">Endereço</span>
                        <span className="font-semibold text-slate-800 text-right">{dadosAntigos.endereco_snapshot || '-'}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500 font-medium">CEP</span>
                        <span className="font-semibold text-slate-800">{dadosAntigos.cep_snapshot || '-'}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">
                        Imóveis Cadastrados ({dadosAntigos.imoveis_snapshot?.length || 0})
                      </h3>
                      {dadosAntigos.imoveis_snapshot && dadosAntigos.imoveis_snapshot.length > 0 ? (
                        <div className="space-y-2">
                          {dadosAntigos.imoveis_snapshot.map((imovel: any, index: number) => (
                            <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                              <p><span className="font-medium text-slate-500">Endereço:</span> {imovel.endereco || '-'}</p>
                              <p><span className="font-medium text-slate-500">Bairro/Cidade:</span> {imovel.bairro || '-'} - {imovel.cidade || '-'}</p>
                              <p><span className="font-medium text-slate-500">CEP:</span> {imovel.cep || '-'}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Nenhum imóvel registrado.</p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">
                        Veículos Cadastrados ({dadosAntigos.veiculos_snapshot?.length || 0})
                      </h3>
                      {dadosAntigos.veiculos_snapshot && dadosAntigos.veiculos_snapshot.length > 0 ? (
                        <div className="space-y-2">
                          {dadosAntigos.veiculos_snapshot.map((veiculo: any, index: number) => (
                            <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                              <p className="font-semibold text-slate-800">{veiculo.marca_modelo || '-'} ({veiculo.ano || '-'})</p>
                              <p><span className="font-medium text-slate-500">Placa:</span> {veiculo.placa || '-'} | <span className="font-medium text-slate-500">RENAVAM:</span> {veiculo.renavam || '-'}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Nenhum veículo registrado.</p>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6">Nenhum dado antigo encontrado.</p>
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
                        <span className="text-slate-500 font-medium">Salário</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(dadosNovos.salario)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-blue-100">
                        <span className="text-slate-500 font-medium">Endereço</span>
                        <span className="font-semibold text-slate-900 text-right">{dadosNovos.residencia_endereco || '-'}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500 font-medium">CEP</span>
                        <span className="font-semibold text-slate-900">{dadosNovos.residencia_cep || '-'}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">
                        Imóveis Solicitados ({dadosNovos.imovel?.length || 0})
                      </h3>
                      {dadosNovos.imovel && dadosNovos.imovel.length > 0 ? (
                        <div className="space-y-2">
                          {dadosNovos.imovel.map((imovel: any, index: number) => (
                            <div key={index} className="bg-blue-50/30 p-3 rounded-lg border border-blue-100 text-xs space-y-1">
                              <p><span className="font-medium text-slate-500">Endereço:</span> {imovel.endereco || '-'}</p>
                              <p><span className="font-medium text-slate-500">Bairro/Cidade:</span> {imovel.bairro || '-'} - {imovel.cidade || '-'}</p>
                              <p><span className="font-medium text-slate-500">CEP:</span> {imovel.cep || '-'}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Nenhum imóvel informado.</p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">
                        Veículos Solicitados ({dadosNovos.veiculo?.length || 0})
                      </h3>
                      {dadosNovos.veiculo && dadosNovos.veiculo.length > 0 ? (
                        <div className="space-y-2">
                          {dadosNovos.veiculo.map((veiculo: any, index: number) => (
                            <div key={index} className="bg-blue-50/30 p-3 rounded-lg border border-blue-100 text-xs space-y-1">
                              <p className="font-semibold text-slate-800">{veiculo.marca_modelo || '-'} ({veiculo.ano || '-'})</p>
                              <p><span className="font-medium text-slate-500">Placa:</span> {veiculo.placa || '-'} | <span className="font-medium text-slate-500">RENAVAM:</span> {veiculo.renavam || '-'}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Nenhum veículo informado.</p>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6">Nenhum dado novo encontrado.</p>
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
                  <p>Selecione um documento acima para visualizar o PDF</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};