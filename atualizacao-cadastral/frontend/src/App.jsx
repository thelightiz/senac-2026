import { useEffect, useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

function TelaLogin() {
  return (
    <>
      <h1 className="text-3xl text-center">Entrar no Sistema</h1>

      <htmlForm>
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12">

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="nome" className="block text-sm/6 font-medium text-gray-900">Nome</label>
                <div className="mt-2">
                  <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                    <input id="nome" type="text" name="nome" className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-4">
                <label htmlFor="nome" className="block text-sm/6 font-medium text-gray-900">Senha</label>
                <div className="mt-2">
                  <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                    <input id="senha" type="password" name="senha" className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button type="button" className="text-sm/6 font-semibold text-gray-900">Voltar</button>
          <button type="submit" className="rounded-md bg-botao-entrar px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-botao-entrar focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-botao-entrar">Entrar</button>
        </div>
      </htmlForm>
    </>
  )
}

function App() {
  return;
}

export default App;