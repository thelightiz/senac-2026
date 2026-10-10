import { ChangeEvent, SyntheticEvent, useEffect, useState } from "react";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

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

interface NewDataState {
  salario: string;
  residencia_endereco: string;
  residencia_cep: string;
  imovel: Imovel[];
  veiculo: Veiculo[];
}

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

export const GNAdjustRequest = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [customerName, setCustomerName] = useState("");
  const [customerCPF, setCustomerCPF] = useState("");
  const [requestType, setRequestType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [requestUpdate, setRequestUpdate] = useState<UpdateRequest | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<number | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined);

  const [newData, setNewData] = useState<NewDataState>({
    salario: "",
    residencia_endereco: "",
    residencia_cep: "",
    imovel: [],
    veiculo: []
  });

  
  // Estados para formulário
  const [currentImovel, setCurrentImovel] = useState<Imovel>({
    endereco: "",
    bairro: "",
    cidade: "",
    cep: ""
  });

  const [currentVeiculo, setCurrentVeiculo] = useState<Veiculo>({
    renavam: "",
    placa: "",
    marca_modelo: "",
    ano: ""
  });


  // Handlers
  const handleNewDataChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCurrentImovelChange = (e:ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentImovel((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCurrentVeiculoChange = (e:ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentVeiculo((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    
    if (!selectedFile) {
      alert("Por favor, selecione um arquivo antes de enviar.");
      return;
    }

    const formData = new FormData();
    
    const cleanCPF = customerCPF.replace(/\D/g, '');

    formData.append("nome", customerName);
    formData.append("cliente", cleanCPF);
    formData.append("atualizacao", requestType);
    formData.append("documentos", selectedFile);

    const temImovel = Boolean(
      currentImovel.endereco || currentImovel.bairro || currentImovel.cidade || currentImovel.cep
    );

    const temVeiculo = Boolean(
      currentVeiculo.renavam || currentVeiculo.placa || currentVeiculo.marca_modelo || currentVeiculo.ano
    );

    const cleanNewData = {
      ...newData,
      residencia_cep: newData.residencia_cep ? newData.residencia_cep.replace(/\D/g, ""): "",

      imovel: temImovel ? [{
        ...currentImovel,
        cep: currentImovel.cep ? currentImovel.cep.replace(/\D/g, "") : null
      }] : [],

      veiculo: temVeiculo ? [currentVeiculo]: []
    };

    formData.append("dados_novos", JSON.stringify(cleanNewData));

    console.log("Enviando payload...");
    console.log("Dados Novos JSON:", JSON.stringify(cleanNewData));

    try {
      const response = await api.patch(`gn/editar-solicitacao/${id}`, formData);
      console.log("Sucesso:", response.data);
      alert("Solicitação editada com sucesso!");
      
      setCustomerName("");
      setRequestType("");
      setNewData({
        salario: "",
        residencia_endereco: "",
        residencia_cep: "",
        imovel: [],
        veiculo: []
      });
      setCurrentImovel({
        endereco: "",
        bairro: "",
        cidade: "",
        cep: ""
      });
      setCurrentVeiculo({
        renavam: "",
        placa: "",
        marca_modelo: "",
        ano: ""
      });
      setSelectedFile(null);
      
      return navigate("/gn/minhas-solicitacoes");

    } catch (error: any) {
      console.error("Erro ao editar solicitação:", error);
      if (error.response?.data) {
        alert(`Erro: ${JSON.stringify(error.response.data)}`);
      } else {
        alert("Erro desconhecido.");
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg"
      ];
      if (!allowedTypes.includes(file.type)) {
        console.error("Por favor, selecione um arquivo PDF ou imagem (JPG/PNG).");
        setSelectedFile(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        console.error("O arquivo deve ter no máximo 5MB.");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      console.log("GG pro max");
    }
  };

  useEffect(() => {
    const fetchSolicitacao = async () => {
      try {
        const response = await api.get(`ver-solicitacao/${id}`);
        console.log(response);
        const solicitacao = response.data.solicitacao;
        const dadosNovos = response.data.solicitacao.dados_novos[0];

        setRequestUpdate(solicitacao);
        setCustomerName(solicitacao.cliente);
        setCustomerCPF(solicitacao.cpf);
        setRequestType(solicitacao.atualizacao);
        setNewData({
            salario: dadosNovos.salario,
            residencia_endereco: dadosNovos.residencia_endereco,
            residencia_cep: dadosNovos.residencia_cep,
            imovel: [],
            veiculo: []
        });

        if (dadosNovos?.veiculo?.length > 0) {
            setCurrentVeiculo(dadosNovos.veiculo[0]);
        } else {
            console.log("Nenhum veículo encontrado para esta solicitação.");
        }

        if (dadosNovos?.imovel?.length > 0) {
            setCurrentImovel(dadosNovos.imovel[0]);
        } else {
            console.log("Nenhum imóvel encontrado para esta solicitação.");
        }

        if (response.data.solicitacao.documentos?.length > 0) {
          setSelectedDoc(response.data.solicitacao.documentos[0].id);
        }

      } catch (error) {
        console.log("Erro:", error);
      } finally {
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

  return (
    <>
      <div className="mx-auto p-4">
        <h1 className="text-center text-3xl font-bold my-6 text-gray-900">
          Ajustar Solicitação para Atualização de Cadastro #{id}
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
                  disabled
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
                  disabled
                  required
                />
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="requestType" className="block text-sm font-medium text-gray-900">
                Tipo de Atualização
              </label>
              <div className="mt-2">
                <select
                  id="requestType"
                  name="requestType"
                  value={requestType}
                  className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none"
                  onChange={(e) => setRequestType(e.target.value)}
                  disabled
                  required
                >
                  <option value="" disabled>Selecione uma opção</option>
                  <option value="Renda">Renda</option>
                  <option value="Endereço">Endereço</option>
                  <option value="Imóvel">Patrimônio (Imóvel)</option>
                  <option value="Veículo">Patrimônio (Veículo)</option>
                </select>
              </div>
            </div>
          </div>

          {requestType && (
            <div className="mt-10 border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Dados Novos</h2>

              <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                {requestType === "Renda" && (
                  <div className="sm:col-span-2">
                    <label htmlFor="salario" className="block text-sm font-medium text-gray-900">
                      Salário Atual (R$)
                    </label>
                    <input
                      id="salario"
                      name="salario"
                      type="number"
                      step="0.01"
                      value={newData.salario}
                      className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none"
                      onChange={handleNewDataChange}
                      required
                    />
                  </div>
                )}

                {requestType === "Imóvel" && (
                  <>
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
                        onChange={handleCurrentImovelChange}
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
                        onChange={handleCurrentImovelChange}
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
                        onChange={handleCurrentImovelChange}
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
                        onChange={handleCurrentImovelChange}
                        placeholder="00000000"
                        required
                      />
                    </div>
                    </>
                )}

                {requestType === "Veículo" && (
                  <>
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
                        onChange={handleCurrentVeiculoChange}
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
                        onChange={handleCurrentVeiculoChange}
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
                        onChange={handleCurrentVeiculoChange}
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
                        onChange={handleCurrentVeiculoChange}
                        required
                      />
                    </div>
                  </>
                )}

                {requestType === "Endereço" && (
                  <>
                    <div className="sm:col-span-2">
                      <label htmlFor="residencia_endereco" className="block text-sm font-medium text-gray-900">
                        Endereço Residencial
                      </label>
                      <input
                        id="residencia_endereco"
                        name="residencia_endereco"
                        type="text"
                        value={newData.residencia_endereco}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none"
                        onChange={handleNewDataChange}
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
                        value={newData.residencia_cep}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none"
                        onChange={handleNewDataChange}
                        placeholder="00000000"
                        required
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="selectedFile" className="block text-sm font-medium text-gray-900">
                Documento Comprobatório
              </label>
              <div className="mt-2">
                <input
                  id="selectedFile"
                  type="file"
                  name="selectedFile"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-black file:hover:bg-gray-200 cursor-pointer"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.png,.jpeg"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-white mt-8 border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Documentos Anexados
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {requestUpdate?.documentos?.map((doc, index) => {
                const isSelected = selectedDoc === doc.id;
                return (
                  <button
                    type="button"
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

          <div className="mt-8 flex items-center justify-end gap-x-6">
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="submit"
                  id="botao"
                  className="px-5 py-2.5 rounded-xl bg-botao-1 hover:bg-botao-1-700 text-white text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
                >
                  Salvar Solicitação
                </button>
              </div>
            </div>
        </form>
      </div>
    </>
  );
};