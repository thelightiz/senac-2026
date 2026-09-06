import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TelaLogin } from '../pages/login/main';
import { Index } from '../pages/index/main';

export const Rotas = () => {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index/>} />
          <Route path="/entrar" element={<TelaLogin/>} />
        </Routes>
      </BrowserRouter>
    );
}