import { getSseUrl } from './http'
import type { SseDeltaEvent, SseDoneEvent, SseErrorEvent, SseMetaEvent } from '../types/api'

export type ChatStreamEvent =
  | { type: 'meta'; payload: SseMetaEvent }
  | { type: 'delta'; payload: SseDeltaEvent }
  | { type: 'done'; payload: SseDoneEvent }
  | { type: 'error'; payload: SseErrorEvent }

function parseJson<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

function parseSseBlock(block: string): ChatStreamEvent | null {
  const lines = block.split('\n')
  let eventName = 'message'
  let data = ''

  for (const line of lines) {
    if (line.startsWith('event:')) {
      eventName = line.slice(6).trim()
    } else if (line.startsWith('data:')) {
      data += line.slice(5).trim()
    }
  }

  if (!data) {
    return null
  }

  if (eventName === 'meta') {
    const parsed = parseJson<SseMetaEvent>(data)
    return parsed ? { type: 'meta', payload: parsed } : null
  }
  if (eventName === 'delta') {
    const parsed = parseJson<SseDeltaEvent>(data)
    return parsed ? { type: 'delta', payload: parsed } : { type: 'delta', payload: { text: data } }
  }
  if (eventName === 'done') {
    const parsed = parseJson<SseDoneEvent>(data)
    return parsed ? { type: 'done', payload: parsed } : { type: 'done', payload: { status: 'done' } }
  }
  if (eventName === 'error') {
    const parsed = parseJson<SseErrorEvent>(data)
    return parsed
      ? { type: 'error', payload: parsed }
      : { type: 'error', payload: { status: 'error', message: data } }
  }

  return null
}

export async function startChatStream(params: {
  streamUrl: string
  clientId: string
  signal: AbortSignal
  onEvent: (event: ChatStreamEvent) => void
}): Promise<void> {
  const response = await fetch(getSseUrl(params.streamUrl), {
    method: 'GET',
    headers: {
      Accept: 'text/event-stream',
      'X-Client-Id': params.clientId,
    },
    signal: params.signal,
  })

  if (!response.ok) {
    params.onEvent({
      type: 'error',
      payload: {
        status: 'error',
        code: String(response.status),
        message: `流式请求失败（${response.status}）`,
      },
    })
    return
  }

  if (!response.body) {
    params.onEvent({
      type: 'error',
      payload: { status: 'error', code: 'stream_unavailable', message: '流式通道不可用' },
    })
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  while (!params.signal.aborted) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    buffer += decoder.decode(value, { stream: true })

    const chunks = buffer.split('\n\n')
    buffer = chunks.pop() ?? ''

    for (const chunk of chunks) {
      const event = parseSseBlock(chunk)
      if (event) {
        params.onEvent(event)
      }
    }
  }
}
