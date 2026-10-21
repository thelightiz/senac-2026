import { ReactNode } from "react";
import { UpdateRequest } from "../interfaces/updateRequest";

interface RequestTableProps {
  title: string;
  userName?: string;
  requests: UpdateRequest[];
  viewLinkPrefix: string;
  actionButton?: ReactNode;
}

export const RequestTable = ({
  title,
  userName,
  requests,
  viewLinkPrefix,
  actionButton,
}: RequestTableProps) => {
  return (
    <div className="mx-auto p-4">
      <div className="flex items-center justify-between mt-6">
        <p className="text-xl mt-3 text-gray-750">Bem-Vindo(a), {userName}!</p>
        {actionButton}
      </div>

      <h1 className="text-3xl text-center font-bold my-6">{title}</h1>

      <div className="overflow-x-auto shadow-md sm:rounded-lg">
        <table className="min-w-full text-left text-sm whitespace-nowrap">
          <thead className="uppercase tracking-wider border-b-2 border-gray-200 bg-gray-50 text-botao-1">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Nome do Cliente</th>
              <th className="px-6 py-4">Tipo de Atualização</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Ação</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr
                key={request.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-gray-900">{request.id}</td>
                <td className="px-6 py-4">{request.customer}</td>
                <td className="px-6 py-4">{request.update_type}</td>
                <td className="px-6 py-4">{request.status}</td>
                <td className="px-6 py-4">
                  <a
                    href={`${viewLinkPrefix}/${request.id}`}
                    className="inline-flex items-center justify-center gap-1 hover:text-botao-1-700 hover:underline"
                  >
                    Ver
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};