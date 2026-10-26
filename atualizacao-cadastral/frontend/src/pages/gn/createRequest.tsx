import { ChangeEvent, SyntheticEvent, useState } from "react";
import { api } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { Property, Vehicle, NewDataState } from "../../interfaces/updateRequest";

export const GNCreateRequest = () => {
  const navigate = useNavigate();
  
  const [customerName, setCustomerName] = useState("");
  const [customerCPF, setCustomerCPF] = useState("");
  const [requestType, setRequestType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [newData, setNewData] = useState<NewDataState>({
    salary: "",
    residence_adress: "",
    residence_zip_code: "",
    property: [],
    vehicle: []
  });

  
  // Estados para formulário
  const [currentProperty, setCurrentProperty] = useState<Property>({
    adress: "",
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
      currentProperty.adress || currentProperty.neighborhood || currentProperty.city || currentProperty.zip_code
    );

    const hasVehicle = Boolean(
      currentVehicle.renavam || currentVehicle.plate || currentVehicle.brand_model || currentVehicle.year
    );

    const cleanNewData = {
      ...newData,
      residence_cep: newData.residence_zip_code.replace(/\D/g, ''),

      property: hasProperty ? [{
        ...currentProperty,
        zip_code: currentProperty.zip_code ? currentProperty.zip_code.replace(/\D/g, '') : null
      }] : [],

      vehicle: hasVehicle ? [currentVehicle]: []
    };

    formData.append("new_data", JSON.stringify(cleanNewData));

    console.log("Sending payload...");
    console.log("New Data JSON:", JSON.stringify(cleanNewData));

    try {
      const response = await api.post("gn/criar-solicitacao", formData);
      console.log("Success:", response.data);
      alert("Solicitação criada com sucesso!");
      
      setCustomerName("");
      setRequestType("");
      setNewData({
        salary: "",
        residence_adress: "",
        residence_zip_code: "",
        property: [],
        vehicle: []
      });
      setCurrentProperty({
        adress: "",
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
      console.error("Error creating update request:", error);
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
        console.error("Por favor, selecione um arquivo PDF.");
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
                  maxLength={11}
                  value={customerCPF}
                  className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:outline-none"
                  onChange={(e) => setCustomerCPF(e.target.value)}
                  placeholder="00000000000"
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
                      <label htmlFor="imovel_endereco" className="block text-sm font-medium text-gray-900">
                        Endereço do Imóvel
                      </label>
                      <input
                        id="imovel_endereco"
                        name="adress"
                        type="text"
                        value={currentProperty.adress ?? ""}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none"
                        onChange={handlecurrentPropertyChange}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="imovel_bairro" className="block text-sm font-medium text-gray-900">
                        Bairro
                      </label>
                      <input
                        id="imovel_bairro"
                        name="neighborhood"
                        type="text"
                        value={currentProperty.neighborhood ?? ""}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none"
                        onChange={handlecurrentPropertyChange}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="imovel_cidade" className="block text-sm font-medium text-gray-900">
                        Cidade
                      </label>
                      <input
                        id="imovel_cidade"
                        name="city"
                        type="text"
                        value={currentProperty.city ?? ""}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none"
                        onChange={handlecurrentPropertyChange}
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="imovel_cep" className="block text-sm font-medium text-gray-900">
                        CEP Imóvel
                      </label>
                      <input
                        id="imovel_cep"
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
                      <label htmlFor="veiculo_renavam" className="block text-sm font-medium text-gray-900">
                        RENAVAM
                      </label>
                      <input
                        id="veiculo_renavam"
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
                      <label htmlFor="veiculo_placa" className="block text-sm font-medium text-gray-900">
                        Placa
                      </label>
                      <input
                        id="veiculo_placa"
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
                      <label htmlFor="veiculo_marca_modelo" className="block text-sm font-medium text-gray-900">
                        Marca/Modelo
                      </label>
                      <input
                        id="veiculo_marca_modelo"
                        name="brand_model"
                        type="text"
                        value={currentVehicle.brand_model ?? ""}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none"
                        onChange={handlecurrentVehicleChange}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="veiculo_ano" className="block text-sm font-medium text-gray-900">
                        Ano
                      </label>
                      <input
                        id="veiculo_ano"
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
                        name="residence_adress"
                        type="text"
                        value={newData.residence_adress}
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
                        name="residence_zip_code"
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

          <div className="mt-8 flex items-center justify-end gap-x-6">
            <button
              type="submit"
              id="botao"
              className="rounded-md bg-botao-1 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-botao-1-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-botao-entrar"
            >
              Criar Solicitação
            </button>
          </div>
        </form>
      </div>
    </>
  );
};