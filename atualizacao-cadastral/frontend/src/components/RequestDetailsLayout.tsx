import React from "react";

interface RequestDetailsLayoutProps {
  updateRequestData: any;
  oldData: any;
  newData: any;
  historicLogs: any[];
  showHistory: boolean;
  onToggleHistory: () => void;
  selectedDocument: number | null;
  onSelectDocument: (id: number) => void;
  pdfUrl?: string;
  formatCurrency: (val: any) => string;
  actions?: React.ReactNode;
}

export const RequestDetailsLayout: React.FC<RequestDetailsLayoutProps> = ({
  updateRequestData,
  oldData,
  newData,
  historicLogs,
  showHistory,
  onToggleHistory,
  selectedDocument,
  onSelectDocument,
  pdfUrl,
  formatCurrency,
  actions,
}) => {
  return (
    <div className="w-full min-h-screen text-slate-900 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="bg-white p-6 rounded-2xl space-y-6">
          <h1 className="text-2xl sm:text-3xl text-center text-slate-900 font-bold">
            Solicitação de Atualização Cadastral #{updateRequestData?.id}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 py-2">
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Criado por
              </span>
              <p className="text-base font-semibold text-slate-900">
                {updateRequestData?.created_by}
              </p>
            </div>

            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Cliente
              </span>
              <p className="text-base font-semibold text-slate-900">
                {updateRequestData?.customer}
              </p>
            </div>

            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Tipo de Atualização
              </span>
              <p className="text-base font-semibold text-slate-900">
                {updateRequestData?.update_type || '-'}
              </p>
            </div>

            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Status
              </span>
              <p className="text-base font-semibold text-slate-900">
                {updateRequestData?.status || 'Em Análise'}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-center h-full">
                <button
                  onClick={onToggleHistory}
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
                            Responsável: <strong className="text-slate-900">{log.user_username || 'Sistema'}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm pt-1">
                          <span className="px-2.5 py-1 rounded-md bg-slate-200 text-slate-700 text-xs font-semibold">
                            {log.previous_status || 'Início'}
                          </span>
                          <span className="text-slate-400 font-bold">➔</span>
                          <span className="px-2.5 py-1 rounded-md bg-[#33820d]/10 text-[#33820d] text-xs font-semibold border border-[#33820d]/20">
                            {log.current_status}
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
              {oldData ? (
                <>
                  <div className="space-y-2 bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">
                        Salário
                      </span>
                      <span className="font-semibold text-slate-800">
                        {formatCurrency(oldData.salary_snapshot)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">
                        Endereço
                      </span>
                      <span className="font-semibold text-slate-800 text-right">
                        {oldData.address_snapshot || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500 font-medium">
                        CEP
                      </span>
                      <span className="font-semibold text-slate-800">
                        {oldData.zip_code_snapshot || '-'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">
                      Imóveis Cadastrados ({oldData.properties_snapshot?.length || 0})
                    </h3>
                    {oldData.properties_snapshot && oldData.properties_snapshot.length > 0 ? (
                      <div className="space-y-2">
                        {oldData.properties_snapshot.map((property: any, index: number) => (
                          <div
                            key={index}
                            className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1"
                          >
                            <p>
                              <span className="font-medium text-slate-500">
                                Endereço:
                              </span> {property.address || '-'}
                            </p>
                            <p>
                              <span className="font-medium text-slate-500">
                                Bairro/Cidade:
                              </span> {property.neighborhood || '-'} / {property.city || '-'}
                            </p>
                            <p>
                              <span className="font-medium text-slate-500">
                                CEP:
                              </span> {property.zip_code || '-'}
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
                      Veículos Cadastrados ({oldData.vehicles_snapshot?.length || 0})
                    </h3>
                    {oldData.vehicles_snapshot && oldData.vehicles_snapshot.length > 0 ? (
                      <div className="space-y-2">
                        {oldData.vehicles_snapshot.map((vehicle: any, index: number) => (
                          <div
                            key={index}
                            className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1"
                          >
                            <p className="font-semibold text-slate-800">
                              {vehicle.brand_model || '-'} ({vehicle.year || '-'})
                            </p>
                            <p>
                              <span className="font-medium text-slate-500">
                                Placa:
                              </span> {vehicle.plate || '-'} | 
                              <span className="font-medium text-slate-500">
                                RENAVAM:
                              </span> {vehicle.renavam || '-'}
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
              {newData ? (
                <>
                  <div className="space-y-2 bg-blue-50/40 p-4 rounded-xl border border-blue-100">
                    <div className="flex justify-between py-1 border-b border-blue-100">
                      <span className="text-slate-500 font-medium">
                        Salário
                      </span>
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(newData.salary)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-blue-100">
                      <span className="text-slate-500 font-medium">
                        Endereço
                      </span>
                      <span className="font-semibold text-slate-900 text-right">
                        {newData.residence_address || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500 font-medium">
                        CEP
                      </span>
                      <span className="font-semibold text-slate-900">
                        {newData.residence_zip_code || '-'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">
                      Imóveis Solicitados ({newData.properties?.length || 0})
                    </h3>
                    {newData.properties && newData.properties.length > 0 ? (
                      <div className="space-y-2">
                        {newData.properties.map((property: any, index: number) => (
                          <div
                            key={index}
                            className="bg-blue-50/30 p-3 rounded-lg border border-blue-100 text-xs space-y-1">
                            <p>
                              <span className="font-medium text-slate-500">
                                Endereço:
                              </span> {property.address || '-'}
                            </p>
                            <p>
                              <span className="font-medium text-slate-500">
                                Bairro/Cidade:
                              </span> {property.neighborhood || '-'} / {property.city || '-'}
                            </p>
                            <p>
                              <span className="font-medium text-slate-500">
                                CEP:
                              </span> {property.zip_code || '-'}
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
                      Veículos Solicitados ({newData.vehicles?.length || 0})
                    </h3>
                    {newData.vehicles && newData.vehicles.length > 0 ? (
                      <div className="space-y-2">
                        {newData.vehicles.map((vehicle: any, index: number) => (
                          <div
                            key={index}
                            className="bg-blue-50/30 p-3 rounded-lg border border-blue-100 text-xs space-y-1"
                          >
                            <p className="font-semibold text-slate-800">
                              {vehicle.marca_modelo || '-'} ({vehicle.ano || '-'})
                            </p>
                            <p>
                              <span className="font-medium text-slate-500">
                                Placa:
                              </span> {vehicle.placa || '-'} | 
                              <span className="font-medium text-slate-500">
                                RENAVAM:</span> {vehicle.renavam || '-'}
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
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Documentos Anexados
          </h2>
          <div className="flex flex-wrap gap-2">
            {updateRequestData?.documents?.map((document: any, index: number) => {
              const isSelected = selectedDocument === document.id;
              return (
                <button
                  key={document.id}
                  onClick={() => onSelectDocument(document.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-botao-1 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {document.name || `Documento ${index + 1}`}
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

        {/* 5. Área onde os botões de ação específicos da página serão injetados */}
        {actions && (
          <div className="pt-6 mt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-end items-center gap-4 w-full">
            {actions}
          </div>
        )}

      </div>
    </div>
  );
};