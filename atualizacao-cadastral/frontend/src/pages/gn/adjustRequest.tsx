import { ChangeEvent, SyntheticEvent, useEffect, useState } from "react";
import { api } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { UpdateRequest, NewDataState, Property, Vehicle } from "../../interfaces/updateRequest";

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
    salary: "",
    residence_address: "",
    residence_zip_code: "",
    properties: [],
    vehicles: []
  });

  // Estados para formulário
  const [currentProperty, setCurrentProperty] = useState<Property>({
    address: "",
    neighborhood: "",
    city: "",
    zip_code: ""
  });

  const [currentVehicle, setCurrentVehicle] = useState<Vehicle>({
    renavam: "",
    plate: "",
    brand_model: "",
    year: ""
  });


  // Handlers
  const handleNewDataChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handlecurrentPropertyChange = (e:ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentProperty((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handlecurrentVehicleChange = (e:ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentVehicle((prev) => ({
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

    formData.append("name", customerName);
    formData.append("customer", cleanCPF);
    formData.append("update_type", requestType);
    formData.append("documents", selectedFile);

    const hasProperty = Boolean(
      currentProperty.address || currentProperty.neighborhood || currentProperty.city || currentProperty.zip_code
    );

    const hasVehicle = Boolean(
      currentVehicle.renavam || currentVehicle.plate || currentVehicle.brand_model || currentVehicle.year
    );

    const cleanNewData = {
      ...newData,
      residence_cep: newData.residence_zip_code ? newData.residence_zip_code.replace(/\D/g, ""): "",

      properties: hasProperty ? [{
        ...currentProperty,
        zip_code: currentProperty.zip_code ? currentProperty.zip_code.replace(/\D/g, "") : null
      }] : [],

      vehicles: hasVehicle ? [currentVehicle]: []
    };

    formData.append("new_data", JSON.stringify(cleanNewData));

    try {
      const response = await api.patch(`gn/editar-solicitacao/${id}`, formData);
      console.log("Sucess:", response.data);
      alert("Solicitação editada com sucesso!");
      
      setCustomerName("");
      setRequestType("");
      setNewData({
        salary: "",
        residence_address: "",
        residence_zip_code: "",
        properties: [],
        vehicles: []
      });
      setCurrentProperty({
        address: "",
        neighborhood: "",
        city: "",
        zip_code: ""
      });
      setCurrentVehicle({
        renavam: "",
        plate: "",
        brand_model: "",
        year: ""
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
        "application/pdf"
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
    }
  };

  useEffect(() => {
    const fetchSolicitacao = async () => {
      try {
        const response = await api.get(`ver-solicitacao/${id}`);
        console.log(response);
        const request = response.data.solicitacao;
        const newData = response.data.request.new_data[0];

        setRequestUpdate(request);
        setCustomerName(request.customer);
        setCustomerCPF(request.cpf);
        setRequestType(request.request_type);
        setNewData({
            salary: newData.salario,
            residence_address: newData.residencia_endereco,
            residence_zip_code: newData.residencia_cep,
            properties: [],
            vehicles: []
        });

        if (newData?.vehicle?.length > 0) {
            setCurrentVehicle(newData.vehicle[0]);
        } else {
            console.log("Nenhum veículo encontrado para esta solicitação.");
        }

        if (newData?.property?.length > 0) {
            setCurrentProperty(newData.property[0]);
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
                  <option value="INCOME">Renda</option>
                  <option value="ADDRESS">Endereço</option>
                  <option value="PROPERTY">Patrimônio (Imóvel)</option>
                  <option value="VEHICLE">Patrimônio (Veículo)</option>
                </select>
              </div>
            </div>
          </div>

          {requestType && (
            <div className="mt-10 border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Dados Novos</h2>

              <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                {requestType === "INCOME" && (
                  <div className="sm:col-span-2">
                    <label htmlFor="salario" className="block text-sm font-medium text-gray-900">
                      Salário Atual (R$)
                    </label>
                    <input
                      id="salario"
                      name="salary"
                      type="number"
                      step="0.01"
                      value={newData.salary}
                      className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none"
                      onChange={handleNewDataChange}
                      required
                    />
                  </div>
                )}

                {requestType === "PROPERTY" && (
                  <>
                    <div className="sm:col-span-2">
                      <label htmlFor="property_endereco" className="block text-sm font-medium text-gray-900">
                        Endereço do Imóvel
                      </label>
                      <input
                        id="property_endereco"
                        name="address"
                        type="text"
                        value={currentProperty.address ?? ""}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none"
                        onChange={handlecurrentPropertyChange}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="property_bairro" className="block text-sm font-medium text-gray-900">
                        Bairro
                      </label>
                      <input
                        id="property_bairro"
                        name="neighborhood"
                        type="text"
                        value={currentProperty.neighborhood ?? ""}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none"
                        onChange={handlecurrentPropertyChange}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="property_cidade" className="block text-sm font-medium text-gray-900">
                        Cidade
                      </label>
                      <input
                        id="property_cidade"
                        name="city"
                        type="text"
                        value={currentProperty.city ?? ""}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none"
                        onChange={handlecurrentPropertyChange}
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="property_cep" className="block text-sm font-medium text-gray-900">
                        CEP Imóvel
                      </label>
                      <input
                        id="property_cep"
                        name="zip_code"
                        type="text"
                        maxLength={8}
                        value={currentProperty.zip_code ?? ""}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none"
                        onChange={handlecurrentPropertyChange}
                        placeholder="00000000"
                        required
                      />
                    </div>
                    </>
                )}

                {requestType === "VEHICLE" && (
                  <>
                    <div>
                      <label htmlFor="vehicle_renavam" className="block text-sm font-medium text-gray-900">
                        RENAVAM
                      </label>
                      <input
                        id="vehicle_renavam"
                        name="renavam"
                        type="text"
                        maxLength={11}
                        value={currentVehicle.renavam ?? ""}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none"
                        onChange={handlecurrentVehicleChange}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="vehicle_placa" className="block text-sm font-medium text-gray-900">
                        Placa
                      </label>
                      <input
                        id="vehicle_placa"
                        name="plate"
                        type="text"
                        maxLength={7}
                        value={currentVehicle.plate ?? ""}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none"
                        onChange={handlecurrentVehicleChange}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="vehicle_marca_modelo" className="block text-sm font-medium text-gray-900">
                        Marca/Modelo
                      </label>
                      <input
                        id="vehicle_marca_modelo"
                        name="brand_model"
                        type="text"
                        value={currentVehicle.brand_model ?? ""}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none"
                        onChange={handlecurrentVehicleChange}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="vehicle_ano" className="block text-sm font-medium text-gray-900">
                        Ano
                      </label>
                      <input
                        id="vehicle_ano"
                        name="year"
                        type="text"
                        maxLength={9}
                        value={currentVehicle.year ?? ""}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none"
                        onChange={handlecurrentVehicleChange}
                        required
                      />
                    </div>
                  </>
                )}

                {requestType === "ADDRESS" && (
                  <>
                    <div className="sm:col-span-2">
                      <label htmlFor="residencia_endereco" className="block text-sm font-medium text-gray-900">
                        Endereço Residencial
                      </label>
                      <input
                        id="residencia_endereco"
                        name="residence_address"
                        type="text"
                        value={newData.residence_address}
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
                        name="residence_zip"
                        type="text"
                        maxLength={8}
                        value={newData.residence_zip_code}
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

          <div className="bg-white p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Documentos Anexados
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {requestUpdate?.documents?.map((document, index) => {
                const isSelected = selectedDoc === document.id;
                return (
                  <button
                    type="button"
                    key={document.id}
                    onClick={() => setSelectedDoc(document.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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
                  <p>
                    Selecione um documento acima para visualizar o PDF
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-x-6">
            <button
              type="submit"
              id="botao"
              className="rounded-md bg-botao-1 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-botao-1-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-botao-entrar"
            >
              Salvar Solicitação
            </button>
          </div>
        </form>
      </div>
    </>
  );
};