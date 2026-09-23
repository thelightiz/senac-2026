import { ChangeEvent, SyntheticEvent, useState } from "react";
import { api } from "../../services/api";

export const GNCreateRequest = () => {
  const [customerName, setCustomerName] = useState("");
  const [requestType, setRequestType] = useState("");
  const [newData, setNewData] = useState("");
  const [oldData, setOldData] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    
    if (!selectedFile) {
      console.error("Por favor, selecione um arquivo antes de enviar.");
      return;
    }

    const formData = new FormData();
    formData.append("cliente", customerName);
    formData.append("atualizacao", requestType);
    formData.append("dados_antigos", oldData);
    formData.append("dados_novos", newData);
    formData.append("documento", selectedFile);

    console.log("É FormData?", formData instanceof FormData);

   try {
    // 2. Envie a variável formData, sem definir headers
      const response = await api.post("gn/criar-solicitacao", formData);
      console.log(response.data);
    } catch (error) {
      console.error(error);
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

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="oldData" className="block text-sm/6 font-medium text-gray-900">Dados Antigos</label>
                <div className="mt-2">
                  <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                    <input id="oldData" type="text" name="oldData" value={oldData} className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6" onChange={(e) => setOldData(e.target.value)} required/>
                  </div>
                </div>
              </div>
            </div>


            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="newData" className="block text-sm/6 font-medium text-gray-900">Dados Novos</label>
                <div className="mt-2">
                  <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                    <input id="newData" type="text" name="newData" value={newData} className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6" onChange={(e) => setNewData(e.target.value)} required/>
                  </div>
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