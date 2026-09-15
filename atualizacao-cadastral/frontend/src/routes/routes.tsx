import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Login } from '../pages/login/main';
import { Index } from '../pages/index/main';
import { GNMyRequests } from '../pages/gn/main';
import { GARequestQueue } from '../pages/ga/main';
import { ProtectedRoute } from '../services/permissions';
import { Error403Page } from '../pages/errors/403/main';

export const Rotas = () => {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index/>} />
          <Route path="entrar" element={<Login/>} />
          <Route 
            path="gn/*" 
            element={
              <ProtectedRoute requiredRole='GN'>
                <Routes>
                  <Route path="minhas-solicitacoes" element={<GNMyRequests />} />
                </Routes>
              </ProtectedRoute>
            } 
          />
          <Route
          path="ga/*"
          element={
            <ProtectedRoute requiredRole='GA'>
              <Routes>
                <Route path="fila-de-solicitacoes" element={<GARequestQueue />} />
              </Routes>
            </ProtectedRoute>
          }></Route>
          <Route
            path="erro/*"
            element={
              <Routes>
                <Route path="403" element={<Error403Page />} />
              </Routes>
            }
          />
        </Routes>
      </BrowserRouter>
    );
};
