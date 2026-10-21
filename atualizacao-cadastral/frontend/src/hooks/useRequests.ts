import { useEffect, useState } from "react";
import { api } from "../utils/api";
import { UpdateRequest } from "../interfaces/updateRequest";

interface UserData {
  name: string;
  role?: string;
}

interface ApiResponse {
  user: UserData;
  requests?: UpdateRequest[];
}

export const useRequests = (endpoint: string) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [requests, setRequests] = useState<UpdateRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRequestsData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get<ApiResponse>(endpoint);
        
        setUser(response.data.user);
        
        const requestList = response.data.requests || [];
        setRequests(requestList);
      } catch (err: any) {
        console.error("Status:", err.response?.status);
        console.error("API Error data:", err.response?.data);
        setError("An error occurred while loading the page.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequestsData();
  }, [endpoint]);

  return { user, requests, error, isLoading };
};