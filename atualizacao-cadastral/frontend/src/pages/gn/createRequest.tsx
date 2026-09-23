import { ChangeEvent, SyntheticEvent, useState } from "react";
import { api } from "../../services/api";

interface NewDataState {
  salario: string;
  residencia_endereco: string;
  residencia_cep: string;
  imovel_endereco: string;
  imovel_bairro: string;
  imovel_cidade: string;
  imovel_cep: string;
  veiculo_renavam: string;
  veiculo_placa: string;
  veiculo_marca_modelo: string;
  veiculo_ano: string;
}

export const GNCreateRequest = () => {
  const [customerName, setCustomerName] = useState("");
  const [requestType, setRequestType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newData, setNewData] = useState<NewDataState>({
    salario: "",
    residencia_endereco: "",
    residencia_cep: "",
    imovel_endereco: "",
    imovel_bairro: "",
    imovel_cidade: "",
    imovel_cep: "",
    veiculo_renavam: "",
    veiculo_placa: "",
    veiculo_marca_modelo: "",
    veiculo_ano: "",
  });

  const handleNewDataChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    
    if (!selectedFile) {
      alert("Por favor, selecione um arquivo antes de enviar.");
      return;
    }

    const formData = new FormData();
    
    formData.append("cliente", customerName);
    formData.append("atualizacao", requestType);
    formData.append("documento", selectedFile);

    const cleanNewData = {
      ...newData,
      residencia_cep: newData.residencia_cep.replace(/\D/g, ''),
      imovel_cep: newData.imovel_cep.replace(/\D/g, ''),
    };

    formData.append("dados_novos", JSON.stringify(cleanNewData));

    console.log("Enviando payload...");
    console.log("Dados Novos JSON:", JSON.stringify(cleanNewData));

    try {
      const response = await api.post("gn/criar-solicitacao", formData);
      console.log("Sucesso:", response.data);
      alert("Solicitação criada com sucesso!");
      
      setCustomerName("");
      setRequestType("");
      setNewData({
        salario: "", residencia_endereco: "", residencia_cep: "", 
        imovel_endereco: "", imovel_bairro: "", imovel_cidade: "", imovel_cep: "",
        veiculo_renavam: "", veiculo_placa: "", veiculo_marca_modelo: "", veiculo_ano: "",
      });
      setSelectedFile(null);
      
    } catch (error: any) {
      console.error("Erro ao criar solicitação:", error);
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

  return (
    <>
      <div className="mx-auto p-4">
        <h1 className="text-3xl text-center font-bold my-6">Criação de Solicitação para Atualização de Cadastro</h1>
      </div>
      <div>
        <form onSubmit={handleSubmit}>
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="customerName" className="block text-sm/6 font-medium text-gray-900">Nome do Cliente</label>
                <div className="mt-2">
                  <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                    <input id="customerName" type="text" name="customerName" value={customerName} className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6" onChange={(e) => setCustomerName(e.target.value)} required/>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="requestType" className="block text-sm/6 font-medium text-gray-900">Tipo de Atualização</label>
                <div className="mt-2">
                  <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                    <select id="requestType" name="requestType" value={requestType} className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6" onChange={(e) => setRequestType(e.target.value)} required>
                      <option value="" disabled>Selecione uma opção</option>
                      <option value="Renda">Renda</option>
                      <option value="Endereço">Endereço</option>
                      <option value="Patrimônio">Patrimônio</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

             <div className="mt-10 border-t pt-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Dados Novos</h2>
          
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
            
           
            <div>
              <label htmlFor="salario" className="block text-sm font-medium text-gray-900">Salário Atual (R$)</label>
              <input id="salario" name="salario" type="number" step="0.01" value={newData.salario} 
                className="mt-1 block w-full border rounded-md py-1.5 px-3 text-gray-400 focus:outline-none sm:text-sm" 
                onChange={handleNewDataChange}
              />
            </div>

           
            <div className="sm:col-span-2">
              <label htmlFor="residencia_endereco" className="block text-sm font-medium text-gray-900">Endereço Residencial</label>
              <input id="residencia_endereco" name="residencia_endereco" type="text" value={newData.residencia_endereco} 
                className="mt-1 block w-full border rounded-md py-1.5 px-3 text-gray-400 focus:outline-none sm:text-sm" 
                onChange={handleNewDataChange}
              />
            </div>

            
            <div>
              <label htmlFor="residencia_cep" className="block text-sm font-medium text-gray-900">CEP Residencial</label>
              <input id="residencia_cep" name="residencia_cep" type="text" maxLength={8} value={newData.residencia_cep} 
                className="mt-1 block w-full border rounded-md py-1.5 px-3 text-gray-400 focus:outline-none sm:text-sm" 
                onChange={handleNewDataChange} placeholder="00000000"
              />
            </div>

            
            <div className="sm:col-span-2 mt-4 border-t pt-2">
              <h3 className="text-md font-medium text-gray-600">Dados do Imóvel (Se houver)</h3>
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="imovel_endereco" className="block text-sm font-medium text-gray-900">Endereço do Imóvel</label>
              <input id="imovel_endereco" name="imovel_endereco" type="text" value={newData.imovel_endereco} 
                className="mt-1 block w-full border rounded-md py-1.5 px-3 text-gray-400 focus:outline-none sm:text-sm" 
                onChange={handleNewDataChange}
              />
            </div>
            <div>
              <label htmlFor="imovel_bairro" className="block text-sm font-medium text-gray-900">Bairro</label>
              <input id="imovel_bairro" name="imovel_bairro" type="text" value={newData.imovel_bairro} 
                className="mt-1 block w-full border rounded-md py-1.5 px-3 text-gray-400 focus:outline-none sm:text-sm" 
                onChange={handleNewDataChange}
              />
            </div>
            <div>
              <label htmlFor="imovel_cidade" className="block text-sm font-medium text-gray-900">Cidade</label>
              <input id="imovel_cidade" name="imovel_cidade" type="text" value={newData.imovel_cidade} 
                className="mt-1 block w-full border rounded-md py-1.5 px-3 text-gray-400 focus:outline-none sm:text-sm" 
                onChange={handleNewDataChange}
              />
            </div>
            <div>
              <label htmlFor="imovel_cep" className="block text-sm font-medium text-gray-900">CEP Imóvel</label>
              <input id="imovel_cep" name="imovel_cep" type="text" maxLength={8} value={newData.imovel_cep} 
                className="mt-1 block w-full border rounded-md py-1.5 px-3 text-gray-400 focus:outline-none sm:text-sm" 
                onChange={handleNewDataChange} placeholder="00000000"
              />
            </div>

            
            <div className="sm:col-span-2 mt-4 border-t pt-2">
              <h3 className="text-md font-medium text-gray-600">Dados do Veículo (Se houver)</h3>
            </div>

            <div>
              <label htmlFor="veiculo_renavam" className="block text-sm font-medium text-gray-900">RENAVAM</label>
              <input id="veiculo_renavam" name="veiculo_renavam" type="text" maxLength={11} value={newData.veiculo_renavam} 
                className="mt-1 block w-full border rounded-md py-1.5 px-3 text-gray-400 focus:outline-none sm:text-sm" 
                onChange={handleNewDataChange}
              />
            </div>
            <div>
              <label htmlFor="veiculo_placa" className="block text-sm font-medium text-gray-900">Placa</label>
              <input id="veiculo_placa" name="veiculo_placa" type="text" maxLength={7} value={newData.veiculo_placa} 
                className="mt-1 block w-full border rounded-md py-1.5 px-3 text-gray-400 focus:outline-none sm:text-sm" 
                onChange={handleNewDataChange}
              />
            </div>
            <div>
              <label htmlFor="veiculo_marca_modelo" className="block text-sm font-medium text-gray-900">Marca/Modelo</label>
              <input id="veiculo_marca_modelo" name="veiculo_marca_modelo" type="text" value={newData.veiculo_marca_modelo} 
                className="mt-1 block w-full border rounded-md py-1.5 px-3 text-gray-400 focus:outline-none sm:text-sm" 
                onChange={handleNewDataChange}
              />
            </div>
            <div>
              <label htmlFor="veiculo_ano" className="block text-sm font-medium text-gray-900">Ano</label>
              <input id="veiculo_ano" name="veiculo_ano" type="text" maxLength={9} value={newData.veiculo_ano} 
                className="mt-1 block w-full border rounded-md py-1.5 px-3 text-gray-400 focus:outline-none sm:text-sm" 
                onChange={handleNewDataChange}
              />
            </div>
          </div>
        </div>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="selectedFile" className="block text-sm/6 font-medium text-gray-900">Documento</label>
                <div className="mt-2">
                  <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                    <input id="selectedFile" type="file" name="selectedFile" className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6" onChange={handleFileChange} accept=".pdf,.jpg,.png,.jpeg" required/>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-x-6">
              <button type="submit" id="botao" className="rounded-md bg-botao-1 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-botao-1-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-botao-entrar">Criar Solicitação</button>
            </div>
        </form>
      </div>
    </>
  );
};