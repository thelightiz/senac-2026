import { Navigate } from "react-router-dom";

const roleRoutes: Record<string, string> = {
    GN: "/gn/minhas-solicitacoes/",
    GA: "/ga/fila-de-solicitacoes/"
};

export const RoleRedirect = ({role}: {role: string}) =>{
    const targetPath = roleRoutes[role] || "/entrar/";
    return <Navigate to={targetPath} replace />;
};
