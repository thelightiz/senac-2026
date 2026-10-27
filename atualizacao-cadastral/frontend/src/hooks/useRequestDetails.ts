import { useEffect, useState } from "react";
import { api } from "../utils/api";

export const useRequestDetails = (id: string | undefined) => {
  const [requestUpdate, setRequestUpdate] = useState<any | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined);
  const [selectedDoc, setSelectedDoc] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [historicLogs, setHistoricLogs] = useState<any[]>([]);

  const formatCurrency = (val: any) => {
    if (val === null || val === undefined) return '-';
    return `R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const handleToggleHistory = async () => {
    if (!showHistory && historicLogs.length === 0) {
      try {
        const response = await api.get(`ver-solicitacao/${id}/historico`);
        setHistoricLogs(response.data);
      } catch (error) {
        console.log("Error when searching history:", error);
      }
    }
    setShowHistory(!showHistory);
  };

  useEffect(() => {
    const fetchUpdateRequest = async () => {
      try {
        const response = await api.get(`ver-solicitacao/${id}`);
        const data = response.data.request;
        setRequestUpdate(data);

        if (data?.documents?.length > 0) {
          setSelectedDoc(data.documents[0].id);
        }
      } catch (error) {
        console.error("Error loading details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUpdateRequest();
    }
  }, [id]);

  useEffect(() => {
    if (!selectedDoc) return;

    let isCancelled = false;
    let activeBlobUrl: string | undefined = undefined;

    const fetchPdf = async () => {
      try {
        setPdfUrl(undefined);
        const response = await api.get(`ver-documento/${selectedDoc}`, { responseType: "blob" });

        if (isCancelled) return;

        activeBlobUrl = URL.createObjectURL(response.data);
        setPdfUrl(activeBlobUrl);
      } catch (error) {
        console.error("Error loading PDF:", error);
      }
    };

    fetchPdf();
    
    return () => {
      if (activeBlobUrl) {
        URL.revokeObjectURL(activeBlobUrl);
      }
    };
  }, [selectedDoc]);

  return {
    requestUpdate,
    pdfUrl,
    selectedDoc,
    setSelectedDoc,
    loading,
    showHistory,
    historicLogs,
    handleToggleHistory,
    formatCurrency,
    oldData: requestUpdate?.old_data?.[0],
    newData: requestUpdate?.new_data?.[0],
  };
};