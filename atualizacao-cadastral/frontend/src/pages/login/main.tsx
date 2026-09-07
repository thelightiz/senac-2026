import { useState, SyntheticEvent } from "react";
import axios from 'axios';

export const TelaLogin = () => {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login', {usuario, senha});
      console.log('Sucesso', response.data);
    } catch (error: any) {
      if (error.response) {
        console.error('Erro retornado pelo backend:', error.response.data);
      } else {
        console.error('Sem resposta do servidor:', error.message);
      }
    }

  };

  return (
     <>
      <h1 className="text-3xl text-center">Entrar no Sistema</h1>

      <form onSubmit={handleSubmit}>
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12">

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="usuario" className="block text-sm/6 font-medium text-gray-900">Usuário</label>
                <div className="mt-2">
                  <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                    <input id="usuario" type="text" name="usuario" value={usuario} className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6" onChange={(e) => setUsuario(e.target.value)} required/>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-4">
                <label htmlFor="senha" className="block text-sm/6 font-medium text-gray-900">Senha</label>
                <div className="mt-2">
                  <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                    <input id="senha" type="password" name="senha" value={senha} className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6" onChange={(e) => setSenha(e.target.value)} required/>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button type="button" className="text-sm/6 font-semibold text-gray-900">Voltar</button>
          <button type="submit" id="botao" className="rounded-md bg-botao-entrar px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-botao-entrar focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-botao-entrar">Entrar</button>
        </div>
      </form>
    </>
  );
};