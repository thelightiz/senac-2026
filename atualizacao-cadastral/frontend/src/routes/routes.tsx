import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Login } from '../pages/login/main';
import { Index } from '../pages/index/main';
import { GNMyRequests } from '../pages/gn/main';
import { ProtectedRoute } from '../services/permissions';
import { Error403Page } from '../pages/errors/403/main';
import { Error401Page } from '../pages/errors/401/main';

export const Rotas = () => {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index/>} />
          <Route path="entrar" element={<Login/>} />
          <Route 
            path="gn/*" 
            element={
              <ProtectedRoute>
                <Routes>
                  <Route path="minhas-solicitacoes" element={<GNMyRequests />} />
                </Routes>
              </ProtectedRoute>
            } 
          />
          <Route
            path="erro/*"
            element={
              <Routes>
                <Route path="401" element={<Error401Page />} />
                <Route path="403" element={<Error403Page />} />
              </Routes>
            }
          />
        </Routes>
      </BrowserRouter>
    );
};
