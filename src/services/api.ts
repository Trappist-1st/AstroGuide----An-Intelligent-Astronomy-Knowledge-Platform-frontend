import type {
  ConceptLookupPayload,
  Conversation,
  ConversationDetailPayload,
  ConversationListPayload,
  SubmitMessagePayload,
  SubmitMessageRequest,
} from '../types/api'
import { httpRequest } from './http'

export function createConversation(clientId: string, title?: string) {
  return httpRequest<Conversation>({
    path: '/conversations',
    method: 'POST',
    clientId,
    body: title ? { title } : {},
  })
}

export function fetchConversations(clientId: string, cursor: string | null, limit = 20) {
  return httpRequest<ConversationListPayload>({
    path: '/conversations',
    clientId,
    query: {
      limit,
      cursor,
    },
  })
}

export function fetchConversationDetail(clientId: string, conversationId: string, before?: string | null, limit = 50) {
  return httpRequest<ConversationDetailPayload>({
    path: `/conversations/${conversationId}`,
    clientId,
    query: {
      limit,
      before,
    },
  })
}

export function submitMessage(clientId: string, conversationId: string, body: SubmitMessageRequest) {
  return httpRequest<SubmitMessagePayload>({
    path: `/conversations/${conversationId}/messages`,
    method: 'POST',
    clientId,
    body,
  })
}

export function lookupConcept(clientId: string, params: { type: 'term' | 'sym'; lang: 'zh' | 'en'; key: string }) {
  return httpRequest<ConceptLookupPayload>({
    path: '/concepts/lookup',
    clientId,
    query: {
      type: params.type,
      lang: params.lang,
      key: params.key,
    },
  })
}
