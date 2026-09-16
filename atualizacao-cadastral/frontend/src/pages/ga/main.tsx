import { useEffect } from "react";
import { api } from "../../services/api"

export const GARequestQueue = () => {
    const test = async () => {
        try {
            await api.get("/ga/fila-de-solicitacoes");
            console.log("Tem permissão")
        } catch (error: any) {
            console.log("Sem permissão")
        }
    };

    useEffect(() => {
        test();
    }, []);

    return (
        <h1 className="text-3xl text-center">Fila de Solicitações</h1>
    );
};
