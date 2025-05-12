import { useState } from "react";

interface ApiResponse<TResponse> {
  data: TResponse | null;
  error: Error | null;
  status: number;
}

interface ApiState {
  isLoading: boolean;
  error: Error | null;
}

interface ApiClient {
  get: <TResponse>(endpoint: string, headers?: HeadersInit) => Promise<ApiResponse<TResponse>>;
  post: <TRequest, TResponse>(
    endpoint: string,
    body: TRequest,
    headers?: HeadersInit
  ) => Promise<ApiResponse<TResponse>>;
  put: <TRequest, TResponse>(
    endpoint: string,
    body: TRequest,
    headers?: HeadersInit
  ) => Promise<ApiResponse<TResponse>>;
  patch: <TRequest, TResponse>(
    endpoint: string,
    body: TRequest,
    headers?: HeadersInit
  ) => Promise<ApiResponse<TResponse>>;
  delete: <TResponse>(endpoint: string, headers?: HeadersInit) => Promise<ApiResponse<TResponse>>;
}

export function useFetch(): ApiClient & ApiState {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const baseUrl = "/api/";
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  const request = async <TResponse>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<TResponse>> => {
    setIsLoading(true);
    setError(null);

    try {
      const url = `${baseUrl}${endpoint}`;
      const headers = { ...defaultHeaders, ...options.headers };
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "API Error");
      }

      return {
        data,
        error: null,
        status: response.status,
      };
    } catch (err) {
      const error = err as Error;
      setError(error);
      return {
        data: null,
        error,
        status: 500,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const api: ApiClient = {
    get: <TResponse>(endpoint: string, headers?: HeadersInit) =>
      request<TResponse>(endpoint, { method: "GET", headers }),

    post: <TRequest, TResponse>(endpoint: string, body: TRequest, headers?: HeadersInit) =>
      request<TResponse>(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      }),

    put: <TRequest, TResponse>(endpoint: string, body: TRequest, headers?: HeadersInit) =>
      request<TResponse>(endpoint, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
      }),

    patch: <TRequest, TResponse>(endpoint: string, body: TRequest, headers?: HeadersInit) =>
      request<TResponse>(endpoint, {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
      }),

    delete: <TResponse>(endpoint: string, headers?: HeadersInit) =>
      request<TResponse>(endpoint, { method: "DELETE", headers }),
  };

  return {
    ...api,
    isLoading,
    error,
  };
}
