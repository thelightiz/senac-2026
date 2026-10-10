import { SyntheticEvent, useState } from "react";
import { api } from "../../services/api";

type RequestType = "Renda" | "Endereço" | "Imóvel" | "Veículo";

interface Imovel {
  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  cep: string | null;
  documento: File | null;
}

interface Veiculo {
  renavam: string | null;
  placa: string | null;
  marca_modelo: string | null;
  ano: string | null;
  documento: File | null;
}

interface NewDataState {
  salario: string;
  salario_documento: File | null;
  
  residencia_endereco: string;
  residencia_cep: string;
  residencia_documento: File | null;

  imovel: Imovel[];
  veiculo: Veiculo[];
}

export const GNCreateRequest = () => {
  const [customerName, setCustomerName] = useState("");
  const [customerCPF, setCustomerCPF] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRequestType, setModalRequestType] = useState<RequestType | null>(null);
  const [newData, setNewData] = useState<NewDataState>({
    salario: "",
    salario_documento: null,
    residencia_endereco: "",
    residencia_cep: "",
    residencia_documento: null,
    imovel: [],
    veiculo: []
  });

  const [currentSalario, setCurrentSalario] = useState("");
  const [currentSalarioDocumento, setCurrentSalarioDocumento] = useState<File | null>(null);
  const [currentResidenciaCEP, setCurrentResidenciaCEP] = useState("");
  const [currentResidenciaEndereco, setCurrentResidenciaEndereco] = useState("");
  const [currentResidenciaDocumento, setCurrentResidenciaDocumento] = useState<File | null>(null);
  const [currentImovel, setCurrentImovel] = useState<Imovel>({
    endereco: "",
    bairro: "",
    cidade: "",
    cep: "",
    documento: null
  });
  const [currentVeiculo, setCurrentVeiculo] = useState<Veiculo>({
    renavam: "",
    placa: "",
    marca_modelo: "",
    ano: "",
    documento: null
  });

  const handleSaveModal = () => {
    const isFormValid: Record<RequestType, boolean> = {
      Renda: Boolean(currentSalario),
      Endereço: Boolean(currentResidenciaCEP && currentResidenciaEndereco),
      Imóvel: Boolean(currentImovel.endereco && currentImovel.cidade && currentImovel.cep && currentImovel.bairro),
      Veículo: Boolean(currentVeiculo.ano && currentVeiculo.marca_modelo && currentVeiculo.placa && currentVeiculo.renavam),
    };

    if (!modalRequestType || !isFormValid[modalRequestType]) {
      alert("Preencha todos os campos antes de adicionar a atualização.");
      return;
    }

    setNewData((prev) => {
      const updated = { ...prev };

      if (modalRequestType === "Renda") updated.salario = currentSalario;
      if (modalRequestType === "Imóvel") updated.imovel = [...updated.imovel, currentImovel];
      if (modalRequestType === "Veículo") updated.veiculo = [...updated.veiculo, currentVeiculo];
      if (modalRequestType === "Endereço") {
        updated.residencia_cep = currentResidenciaCEP;
        updated.residencia_endereco = currentResidenciaEndereco;
      }

      return updated;
    });

    setCurrentSalario("");
    setCurrentSalarioDocumento(null);
    setCurrentResidenciaCEP("");
    setCurrentResidenciaEndereco("");
    setCurrentResidenciaDocumento(null);
    setCurrentImovel({
      endereco: "",
      bairro: "",
      cidade: "",
      cep: "",
      documento: null
    });
    setCurrentVeiculo({
      renavam: "",
      placa: "",
      marca_modelo: "",
      ano: "",
      documento: null
    });
    setModalRequestType(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();

    const formData = new FormData();

    formData.append("nome", customerName);
    formData.append("cliente", customerCPF);

    const atualizacoesPayload = [];

    if (newData.salario) {
      if (newData.salario_documento) {
        formData.append("salario_documento", newData.salario_documento);
      }
      atualizacoesPayload.push({
        atualizacao: "Renda",
        dados_novos: [
          {
            salario: newData.salario,
            residencia_endereco: "",
            residencia_cep: "",
            imoveis: [],
            veiculos: []
          }
        ]
      });
    }

    if (newData.residencia_cep || newData.residencia_endereco) {
      if (newData.residencia_documento) {
        formData.append("residencia_documento", newData.residencia_documento);
      }
      atualizacoesPayload.push({
        atualizacao: "Endereço",
        dados_novos: [
          {
            salario: "",
            residencia_endereco: newData.residencia_endereco,
            residencia_cep: newData.residencia_cep,
            imoveis: [],
            veiculos: []
          }
        ]
      });
    }

    if (newData.imovel.length > 0) {
      const imoveisTratados = newData.imovel.map((im, index) => {
        if (im.documento) {
          formData.append(`imovel_documento_${index}`, im.documento);
        }
        const { documento, ...rest } = im;
        return rest;
      });

      atualizacoesPayload.push({
        atualizacao: "Imóvel",
        dados_novos: imoveisTratados
      });
    }

    if (newData.veiculo.length > 0) {
      const veiculosTratados = newData.veiculo.map((v, index) => {
        if (v.documento) {
          formData.append(`veiculo_documento_${index}`, v.documento);
        }
        const { documento, ...rest } = v;
        return rest;
      });

      atualizacoesPayload.push({
        atualizacao: "Veículo",
        dados_novos: veiculosTratados
      });
    }

    formData.append("atualizacoes", JSON.stringify(atualizacoesPayload));

    try {
      await api.post("gn/criar-solicitacao", formData);
      console.log("Payload enviado com sucesso para o Django!");
      alert("Solicitação criada com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
      alert("Erro ao enviar dados.");
    }
  };

  return (
    <>
      <div className="mx-auto p-4">
        <h1 className="text-center text-3xl font-bold my-6 text-gray-900">
          Criação de Solicitação para Atualização de Cadastro
        </h1>
      </div>

      <div>
        <form onSubmit={handleSubmit}>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-900">
                Nome do Cliente
              </label>
              <div className="mt-2">
                <input
                  id="customerName"
                  type="text"
                  name="customerName"
                  value={customerName}
                  className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:outline-none"
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="customerCPF" className="block text-sm font-medium text-gray-900">
                CPF do Cliente
              </label>
              <div className="mt-2">
                <input
                  id="customerCPF"
                  type="text"
                  name="customerCPF"
                  value={customerCPF}
                  className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:outline-none"
                  onChange={(e) => setCustomerCPF(e.target.value)}
                  required
                />
              </div>
            </div>

            {isModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative animate-in fade-in zoom-in duration-200">
                  <div className="mt-6 space-y-6">
                    <div>
                      <label htmlFor="modalRequestType" className="block text-sm font-medium text-gray-900">
                        Tipo de Atualização
                      </label>
                      <div className="mt-2">
                        <select
                          id="modalRequestType"
                          value={modalRequestType || ""}
                          onChange={(e) => setModalRequestType(e.target.value as RequestType)}
                          className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none"
                        >
                          <option value="" disabled>Selecione uma opção</option>
                          <option value="Renda">Renda</option>
                          <option value="Endereço">Endereço</option>
                          <option value="Imóvel">Patrimônio (Imóvel)</option>
                          <option value="Veículo">Patrimônio (Veículo)</option>
                        </select>
                      </div>
                    </div>

                    {modalRequestType === "Renda" && (
                      <div className="space-y-4 sm:col-span-2">
                        <div>
                          <label htmlFor="salario" className="block text-sm font-medium text-gray-900">
                            Salário (R$)
                          </label>
                          <input
                            id="salario"
                            type="number"
                            step="0.01"
                            value={currentSalario}
                            onChange={(e) => setCurrentSalario(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="salario_doc" className="block text-sm font-medium text-gray-900">
                            Documento Comprobatório
                          </label>
                          <input
                            id="salario_doc"
                            type="file"
                            accept=".pdf,.jpg,.png,.jpeg"
                            onChange={(e) => setCurrentSalarioDocumento(e.target.files?.[0] || null)}
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-black file:hover:bg-gray-200 cursor-pointer"
                            required
                          />
                        </div>
                      </div>
                    )}

                    {modalRequestType === "Endereço" && (
                      <>
                        <div className="sm:col-span-2">
                          <label htmlFor="residencia_endereco" className="block text-sm font-medium text-gray-900">
                            Endereço Residencial
                          </label>
                          <input
                            id="residencia_endereco"
                            name="residencia_endereco"
                            type="text"
                            value={currentResidenciaEndereco}
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none"
                            onChange={(e) => setCurrentResidenciaEndereco(e.target.value)}
                            required
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label htmlFor="residencia_cep" className="block text-sm font-medium text-gray-900">
                            CEP Residencial
                          </label>
                          <input
                            id="residencia_cep"
                            name="residencia_cep"
                            type="text"
                            maxLength={8}
                            value={currentResidenciaCEP}
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none"
                            onChange={(e) => setCurrentResidenciaCEP(e.target.value)}
                            placeholder="00000000"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="endereco_doc" className="block text-sm font-medium text-gray-900">
                            Documento Comprobatório
                          </label>
                          <input
                            id="endereco_doc"
                            type="file"
                            accept=".pdf,.jpg,.png,.jpeg"
                            onChange={(e) => setCurrentResidenciaDocumento(e.target.files?.[0] || null)}
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-black file:hover:bg-gray-200 cursor-pointer"
                            required
                          />
                        </div>
                      </>
                    )}

                    {modalRequestType === "Imóvel" && (
                      <div className="space-y-3">
                        <div className="sm:col-span-2">
                          <label htmlFor="imovel_endereco" className="block text-sm font-medium text-gray-900">
                            Endereço do Imóvel
                          </label>
                          <input
                            id="imovel_endereco"
                            name="endereco"
                            type="text"
                            value={currentImovel.endereco ?? ""}
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none"
                            onChange={(e) => setCurrentImovel({ ...currentImovel, endereco: e.target.value })}
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="imovel_bairro" className="block text-sm font-medium text-gray-900">
                            Bairro
                          </label>
                          <input
                            id="imovel_bairro"
                            name="bairro"
                            type="text"
                            value={currentImovel.bairro ?? ""}
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none"
                            onChange={(e) => setCurrentImovel({ ...currentImovel, bairro: e.target.value })}
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="imovel_cidade" className="block text-sm font-medium text-gray-900">
                            Cidade
                          </label>
                          <input
                            id="imovel_cidade"
                            name="cidade"
                            type="text"
                            value={currentImovel.cidade ?? ""}
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none"
                            onChange={(e) => setCurrentImovel({ ...currentImovel, cidade: e.target.value })}
                            required
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label htmlFor="imovel_cep" className="block text-sm font-medium text-gray-900">
                            CEP Imóvel
                          </label>
                          <input
                            id="imovel_cep"
                            name="cep"
                            type="text"
                            maxLength={8}
                            value={currentImovel.cep ?? ""}
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none"
                            onChange={(e) => setCurrentImovel({ ...currentImovel, cep: e.target.value })}
                            placeholder="00000000"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="imovel_doc" className="block text-sm font-medium text-gray-900">
                            Documento Comprobatório
                          </label>
                          <input
                            id="imovel_doc"
                            type="file"
                            accept=".pdf,.jpg,.png,.jpeg"
                            onChange={(e) => setCurrentImovel({ ...currentImovel, documento: e.target.files?.[0] || null })}
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-black file:hover:bg-gray-200 cursor-pointer"
                            required
                          />
                        </div>
                      </div>
                    )}

                    {modalRequestType === "Veículo" && (
                      <div className="space-y-3">
                        <div>
                          <label htmlFor="veiculo_renavam" className="block text-sm font-medium text-gray-900">
                            RENAVAM
                          </label>
                          <input
                            id="veiculo_renavam"
                            name="renavam"
                            type="text"
                            maxLength={11}
                            value={currentVeiculo.renavam ?? ""}
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none"
                            onChange={(e) => setCurrentVeiculo({ ...currentVeiculo, renavam: e.target.value })}
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="veiculo_placa" className="block text-sm font-medium text-gray-900">
                            Placa
                          </label>
                          <input
                            id="veiculo_placa"
                            name="placa"
                            type="text"
                            maxLength={7}
                            value={currentVeiculo.placa ?? ""}
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none"
                            onChange={(e) => setCurrentVeiculo({ ...currentVeiculo, placa: e.target.value })}
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="veiculo_marca_modelo" className="block text-sm font-medium text-gray-900">
                            Marca/Modelo
                          </label>
                          <input
                            id="veiculo_marca_modelo"
                            name="marca_modelo"
                            type="text"
                            value={currentVeiculo.marca_modelo ?? ""}
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none"
                            onChange={(e) => setCurrentVeiculo({ ...currentVeiculo, marca_modelo: e.target.value })}
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="veiculo_ano" className="block text-sm font-medium text-gray-900">
                            Ano
                          </label>
                          <input
                            id="veiculo_ano"
                            name="ano"
                            type="text"
                            maxLength={9}
                            value={currentVeiculo.ano ?? ""}
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none"
                            onChange={(e) => setCurrentVeiculo({ ...currentVeiculo, ano: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="veiculo_doc" className="block text-sm font-medium text-gray-900">
                            Documento Comprobatório
                          </label>
                          <input
                            id="veiculo_doc"
                            type="file"
                            accept=".pdf,.jpg,.png,.jpeg"
                            onChange={(e) => setCurrentVeiculo({ ...currentVeiculo, documento: e.target.files?.[0] || null })}
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-black file:hover:bg-gray-200 cursor-pointer"
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div className="mt-8 flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveModal}
                        className="px-5 py-2.5 rounded-xl bg-botao-1 hover:bg-botao-1-700 text-white text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
                      >
                        Confirmar Atualização
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {newData.salario && (
              <div className="bg-white p-4 rounded-xl border border-gray-200 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-700 mb-2">
                    Salário Adicionado: R$ {newData.salario}
                  </h4>
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700 font-bold px-2 text-lg"
                    onClick={() => {
                      setNewData(prev => ({ ...prev, salario: "" }));
                    }}
                  >
                    &times;
                  </button>
                </div>
              </div>
            )}

            {newData.residencia_cep && newData.residencia_endereco && (
              <div className="bg-white p-4 rounded-xl border border-gray-200 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-700 mb-2">
                    CEP da Residência Adicionado: {newData.residencia_cep} <br />
                    Endereço da Residência Adicionado: {newData.residencia_endereco}
                  </h4>
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700 font-bold px-2 text-lg"
                    onClick={() => {
                      setNewData(prev => ({
                        ...prev,
                        residencia_cep: "",
                        residencia_endereco: ""
                      }));
                    }}
                  >
                    &times;
                  </button>
                </div>
              </div>
            )}

            {newData.imovel.length > 0 && (
              <div className="bg-white p-4 rounded-xl border border-gray-200 sm:col-span-2">
                <h4 className="font-semibold text-gray-700 mb-2">Imóveis Adicionados ({newData.imovel.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {newData.imovel.map((imovel, index) => (
                    <div key={index} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                      <span>Imóvel {index + 1}: {imovel.cidade} - {imovel.bairro}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setNewData(prev => ({
                            ...prev,
                            imovel: prev.imovel.filter((_, i) => i !== index)
                          }));
                        }}
                        className="text-red-500 hover:text-red-700 font-bold"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {newData.veiculo.length > 0 && (
              <div className="bg-white p-4 rounded-xl border border-gray-200 sm:col-span-2">
                <h4 className="font-semibold text-gray-700 mb-2">Veículos Adicionados ({newData.veiculo.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {newData.veiculo.map((veiculo, index) => (
                    <div key={index} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                      <span>Veículo {index + 1}: {veiculo.marca_modelo} ({veiculo.placa})</span>
                      <button
                        type="button"
                        onClick={() => {
                          setNewData(prev => ({
                            ...prev,
                            veiculo: prev.veiculo.filter((_, i) => i !== index)
                          }));
                        }}
                        className="text-red-500 hover:text-red-700 font-bold"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-3 sm:col-span-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-botao-1 hover:bg-botao-1-700 text-white text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
              >
                Adicionar Solicitação
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-botao-1 hover:bg-botao-1-700 text-white text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
              >
                Criar Solicitação
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};