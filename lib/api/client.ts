const API_BASE_URL = "https://localhost:7224"

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    try {
      console.log("Attempting request to:", url)
      const response = await fetch(url, {
        ...options,
        headers,
        mode: "cors",
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.text().catch(() => `HTTP ${response.status}`)
        console.error("API Error response:", errorData)
        throw new Error(`API Error: ${response.status} - ${errorData}`)
      }

      const contentType = response.headers.get("content-type")
      if (contentType?.includes("application/json")) {
        const data = await response.json()
        console.log("Response data:", data)
        return data
      }
      return null as T
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error("Request failed:", errorMessage)
      console.error("Endpoint:", endpoint)
      console.error("Full URL:", url)
      throw error
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" })
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    })
  }

  async put<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }
}

export function useApi() {
  return new ApiClient(API_BASE_URL)
}
