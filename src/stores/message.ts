import { defineStore } from 'pinia'
import { fetchConversationDetail, submitMessage } from '../services/api'
import { startChatStream } from '../services/sse'
import { useAppStore } from './app'
import type {
  Citation,
  ConversationDetailPayload,
  Difficulty,
  Language,
  MessageStatus,
  ServerMessage,
  StreamPhase,
  UiMessage,
} from '../types/api'

interface MessageState {
  currentConversationId: string | null
  messages: UiMessage[]
  pendingUserMessageId: string | null
  pendingStreamUrl: string | null
  stream: {
    requestId: string | null
    model: string | null
    phase: StreamPhase
    errorCode: string | null
    errorMessage: string | null
    citations: Citation[]
  }
  nextBefore: string | null
  activeAbortController: AbortController | null
}

function normalizeMessage(message: ServerMessage): UiMessage {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    status: message.status,
    difficulty: message.difficulty ?? null,
    language: message.language ?? null,
    promptTokens: message.promptTokens ?? null,
    completionTokens: message.completionTokens ?? null,
    estimatedCostUsd: message.estimatedCostUsd ?? null,
    createdAt: message.createdAt,
    citations: [],
  }
}

function sortMessagesByTimeAsc(messages: UiMessage[]): UiMessage[] {
  return [...messages].sort((a, b) => {
    const timeA = Date.parse(a.createdAt)
    const timeB = Date.parse(b.createdAt)

    if (!Number.isNaN(timeA) && !Number.isNaN(timeB) && timeA !== timeB) {
      return timeA - timeB
    }

    return a.id.localeCompare(b.id)
  })
}

function mergeMessages(existing: UiMessage[], incoming: UiMessage[]): UiMessage[] {
  const map = new Map<string, UiMessage>()
  for (const item of existing) {
    map.set(item.id, item)
  }
  for (const item of incoming) {
    map.set(item.id, item)
  }
  return sortMessagesByTimeAsc([...map.values()])
}

export const useMessageStore = defineStore('message', {
  state: (): MessageState => ({
    currentConversationId: null,
    messages: [],
    pendingUserMessageId: null,
    pendingStreamUrl: null,
    stream: {
      requestId: null,
      model: null,
      phase: 'idle',
      errorCode: null,
      errorMessage: null,
      citations: [],
    },
    nextBefore: null,
    activeAbortController: null,
  }),
  getters: {
    isStreaming(state) {
      return state.stream.phase === 'streaming'
    },
  },
  actions: {
    resetForConversation(conversationId: string) {
      this.cancelStream(false)
      this.currentConversationId = conversationId
      this.messages = []
      this.pendingUserMessageId = null
      this.pendingStreamUrl = null
      this.stream = {
        requestId: null,
        model: null,
        phase: 'idle',
        errorCode: null,
        errorMessage: null,
        citations: [],
      }
      this.nextBefore = null
    },
    hydrateFromDetail(payload: ConversationDetailPayload) {
      this.currentConversationId = payload.conversation.id
      this.messages = sortMessagesByTimeAsc(payload.messages.map(normalizeMessage))
      this.nextBefore = payload.nextBefore
      this.stream.phase = 'idle'
      this.stream.citations = []
    },
    appendDelta(messageId: string, text: string) {
      const target = this.messages.find((item) => item.id === messageId)
      if (!target) {
        return
      }
      target.content += text
      target.status = 'streaming'
    },
    finishStream(messageId: string, payload: { citations?: Citation[]; promptTokens?: number; completionTokens?: number }) {
      const target = this.messages.find((item) => item.id === messageId)
      if (!target) {
        return
      }
      target.status = 'done'
      target.promptTokens = payload.promptTokens ?? target.promptTokens
      target.completionTokens = payload.completionTokens ?? target.completionTokens
      target.citations = payload.citations ?? []
      this.stream.phase = 'done'
      this.stream.citations = target.citations
      this.activeAbortController = null
    },
    failStream(messageId: string, code?: string, message?: string) {
      const target = this.messages.find((item) => item.id === messageId)
      if (target) {
        target.status = 'error'
      }
      this.stream.phase = 'error'
      this.stream.errorCode = code ?? 'stream_error'
      this.stream.errorMessage = message ?? '回答生成异常，请重试。'
      this.activeAbortController = null
    },
    cancelStream(markCancelled = true) {
      if (this.activeAbortController) {
        this.activeAbortController.abort()
      }
      this.activeAbortController = null
      if (markCancelled && this.pendingUserMessageId) {
        const target = this.messages.find((item) => item.id === this.pendingUserMessageId)
        if (target) {
          target.status = 'cancelled'
        }
        this.stream.phase = 'cancelled'
      }
    },
    async startStream(streamUrl: string, assistantMessageId: string) {
      const appStore = useAppStore()
      const controller = new AbortController()
      this.activeAbortController = controller
      this.stream.phase = 'streaming'
      this.stream.errorCode = null
      this.stream.errorMessage = null
      this.stream.citations = []

      try {
        await startChatStream({
          streamUrl,
          clientId: appStore.clientId,
          signal: controller.signal,
          onEvent: (event) => {
            if (event.type === 'meta') {
              this.stream.requestId = event.payload.requestId ?? null
              this.stream.model = event.payload.model ?? null
              this.stream.phase = 'streaming'
              return
            }
            if (event.type === 'delta') {
              this.appendDelta(assistantMessageId, event.payload.text)
              return
            }
            if (event.type === 'done') {
              this.finishStream(assistantMessageId, {
                citations: event.payload.citations,
                promptTokens: event.payload.usage?.promptTokens,
                completionTokens: event.payload.usage?.completionTokens,
              })
              return
            }
            if (event.type === 'error') {
              this.failStream(assistantMessageId, event.payload.code, event.payload.message)
            }
          },
        })
      } catch {
        this.failStream(assistantMessageId, 'stream_interrupted', '连接中断，已保留已生成内容。')
      }
    },
    async submitUserMessage(params: { conversationId: string; content: string; difficulty: Difficulty; language: Language }) {
      const appStore = useAppStore()
      const content = params.content.trim()
      if (!content || this.stream.phase === 'streaming') {
        return
      }

      const userLocalId = `local_user_${crypto.randomUUID()}`
      const now = new Date().toISOString()
      this.messages.push({
        id: userLocalId,
        role: 'user',
        content,
        status: 'done',
        difficulty: params.difficulty,
        language: params.language,
        promptTokens: null,
        completionTokens: null,
        estimatedCostUsd: null,
        createdAt: now,
        citations: [],
      })

      try {
        const submitResult = await submitMessage(appStore.clientId, params.conversationId, {
          content,
          difficulty: params.difficulty,
          language: params.language,
          clientMessageId: crypto.randomUUID(),
        })

        this.pendingUserMessageId = submitResult.messageId
        this.pendingStreamUrl = submitResult.streamUrl

        const assistantMessage: UiMessage = {
          id: submitResult.messageId,
          role: 'assistant',
          content: '',
          status: submitResult.status as MessageStatus,
          difficulty: params.difficulty,
          language: params.language,
          promptTokens: null,
          completionTokens: null,
          estimatedCostUsd: null,
          createdAt: new Date().toISOString(),
          citations: [],
        }
        this.messages.push(assistantMessage)

        await this.startStream(submitResult.streamUrl, submitResult.messageId)
      } catch (error) {
        appStore.notifyApiError(error)
      }
    },
    async retryLastAssistantMessage() {
      const latestUserMessage = [...this.messages].reverse().find((item) => item.role === 'user')
      if (!latestUserMessage || !this.currentConversationId) {
        return
      }
      await this.submitUserMessage({
        conversationId: this.currentConversationId,
        content: latestUserMessage.content,
        difficulty: latestUserMessage.difficulty ?? 'intermediate',
        language: latestUserMessage.language ?? 'zh',
      })
    },
    async loadMoreMessages() {
      const appStore = useAppStore()
      if (!this.currentConversationId || !this.nextBefore) {
        return
      }
      try {
        const payload = await fetchConversationDetail(appStore.clientId, this.currentConversationId, this.nextBefore)
        this.messages = mergeMessages(this.messages, payload.messages.map(normalizeMessage))
        this.nextBefore = payload.nextBefore
      } catch (error) {
        appStore.notifyApiError(error)
      }
    },
  },
})
