import type { ApiErrorPayload } from '../types/api'

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8093/api/v0'

export class ApiError extends Error {
  status: number
  code: string
  requestId?: string
  details?: Record<string, unknown>

  constructor(status: number, payload?: Partial<ApiErrorPayload>) {
    super(payload?.message ?? '请求失败')
    this.status = status
    this.code = payload?.code ?? 'unknown_error'
    this.requestId = payload?.requestId
    this.details = payload?.details
  }
}

function buildUrl(path: string, query?: Record<string, string | number | null | undefined>) {
  const url = new URL(`${API_BASE}${path}`)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== null && value !== undefined) {
        url.searchParams.set(key, String(value))
      }
    }
  }
  return url.toString()
}

export async function httpRequest<T>(params: {
  path: string
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  clientId: string
  body?: unknown
  query?: Record<string, string | number | null | undefined>
}): Promise<T> {
  const response = await fetch(buildUrl(params.path, params.query), {
    method: params.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Id': params.clientId,
    },
    body: params.body ? JSON.stringify(params.body) : undefined,
  })

  if (!response.ok) {
    let payload: Partial<ApiErrorPayload> | undefined
    try {
      const json = (await response.json()) as { error?: ApiErrorPayload }
      payload = json.error
    } catch {
      payload = {
        code: 'network_error',
        message: response.statusText || '网络请求异常',
      }
    }
    throw new ApiError(response.status, payload)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export function getSseUrl(streamUrl: string): string {
  if (streamUrl.startsWith('http://') || streamUrl.startsWith('https://')) {
    return streamUrl
  }
  return `${API_BASE}${streamUrl.replace('/api/v0', '')}`
}
