import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Login } from "../pages/login/main";
import { Index } from "../pages/index/main";
import { GNIndexPage} from "../pages/gn/index";
import { GNCreateRequest } from "../pages/gn/createRequest";
import { GARequestQueue } from "../pages/ga/index";
import { GAViewRequestInfo } from "../pages/ga/viewRequest";
import { ProtectedRoute } from "../services/permissions";
import { Error403Page } from "../pages/errors/403/main";
import { GNViewRequest } from "../pages/gn/viewRequest";
import { CADRequestQueue } from "../pages/cad";

export const Rotas = () => {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index/>} />
          <Route path="entrar/" element={<Login/>} />

          <Route 
            path="gn/*" 
            element={
              <ProtectedRoute requiredRole="GN">
                <Routes>
                  <Route path="minhas-solicitacoes/" element={<GNIndexPage/>} />
                  <Route path="minhas-solicitacoes/ver-solicitacao/:id" element={<GNViewRequest />} />
                  <Route path="criar-solicitacao/" element={<GNCreateRequest/>} />
                </Routes>
              </ProtectedRoute>
            } 
          />

          <Route
            path="ga/*"
            element={
              <ProtectedRoute requiredRole="GA">
                <Routes>
                  <Route path="fila-de-solicitacoes/" element={<GARequestQueue />} />
                  <Route path="fila-de-solicitacoes/solicitacao/:id" element={<GAViewRequestInfo />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          <Route
            path="cad/*"
            element={
              <ProtectedRoute requiredRole="CADASTRO">
                <Routes>
                  <Route path="fila-de-solicitacoes/" element={<CADRequestQueue />} />
                </Routes>
              </ProtectedRoute>
            }
          />
          
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
