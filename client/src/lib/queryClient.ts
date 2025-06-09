import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
})

export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  data?: any
): Promise<Response> {
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  }

  if (data && method !== 'GET') {
    config.body = JSON.stringify(data)
  }

  const response = await fetch(url, config)
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return response
}