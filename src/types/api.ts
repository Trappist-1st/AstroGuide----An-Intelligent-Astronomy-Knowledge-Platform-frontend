export type Difficulty = 'basic' | 'intermediate' | 'advanced'
export type Language = 'zh' | 'en'
export type MessageStatus = 'queued' | 'streaming' | 'done' | 'error' | 'cancelled'
export type StreamPhase = 'idle' | 'streaming' | 'done' | 'error' | 'cancelled'

export interface ApiErrorPayload {
  code: string
  message: string
  requestId?: string
  details?: Record<string, unknown>
}

export interface ConversationListItem {
  id: string
  title: string | null
  createdAt: string
  updatedAt: string
  lastMessagePreview: string | null
}

export interface Conversation {
  id: string
  title: string | null
  createdAt: string
  updatedAt: string
}

export interface Citation {
  id?: string
  title?: string
  url?: string
  source?: string
  snippet?: string
}

export interface ServerMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  status: MessageStatus
  difficulty?: Difficulty | null
  language?: Language | null
  promptTokens?: number | null
  completionTokens?: number | null
  estimatedCostUsd?: number | null
  createdAt: string
}

export interface ConversationListPayload {
  items: ConversationListItem[]
  nextCursor: string | null
}

export interface ConversationDetailPayload {
  conversation: Conversation
  messages: ServerMessage[]
  nextBefore: string | null
}

export interface SubmitMessageRequest {
  content: string
  difficulty: Difficulty
  language: Language
  clientMessageId?: string
}

export interface SubmitMessagePayload {
  messageId: string
  streamUrl: string
  status: MessageStatus
}

export interface ConceptLookupPayload {
  key: string
  title: string
  short?: string
  details?: string
  seeAlso?: string[]
}

export interface SseMetaEvent {
  requestId?: string
  model?: string
  language?: Language
  difficulty?: Difficulty
}

export interface SseDeltaEvent {
  text: string
}

export interface SseDoneEvent {
  status: 'done'
  usage?: {
    promptTokens?: number
    completionTokens?: number
  }
  citations?: Citation[]
}

export interface SseErrorEvent {
  status: 'error'
  code?: string
  message?: string
}

export interface UiMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  status: MessageStatus
  difficulty: Difficulty | null
  language: Language | null
  promptTokens: number | null
  completionTokens: number | null
  estimatedCostUsd: number | null
  createdAt: string
  citations: Citation[]
}
