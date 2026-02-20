import { defineStore } from 'pinia'
import { createConversation, fetchConversationDetail, fetchConversations } from '../services/api'
import { useAppStore } from './app'
import type { Conversation, ConversationListItem } from '../types/api'

interface ConversationState {
  items: ConversationListItem[]
  nextCursor: string | null
  currentConversationId: string | null
  currentConversation: Conversation | null
  loadingList: boolean
  loadingDetail: boolean
}

export const useConversationStore = defineStore('conversation', {
  state: (): ConversationState => ({
    items: [],
    nextCursor: null,
    currentConversationId: null,
    currentConversation: null,
    loadingList: false,
    loadingDetail: false,
  }),
  actions: {
    async fetchConversationList(reset = false) {
      const appStore = useAppStore()
      if (this.loadingList || !appStore.clientId) {
        return
      }
      this.loadingList = true
      try {
        const payload = await fetchConversations(appStore.clientId, reset ? null : this.nextCursor)
        this.items = reset ? payload.items : [...this.items, ...payload.items]
        this.nextCursor = payload.nextCursor
      } catch (error) {
        appStore.notifyApiError(error)
      } finally {
        this.loadingList = false
      }
    },
    setCurrentConversation(conversationId: string | null) {
      this.currentConversationId = conversationId
    },
    async createConversation(title?: string) {
      const appStore = useAppStore()
      const conversation = await createConversation(appStore.clientId, title)
      this.currentConversationId = conversation.id
      this.currentConversation = conversation
      this.items = [
        {
          id: conversation.id,
          title: conversation.title,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
          lastMessagePreview: null,
        },
        ...this.items,
      ]
      return conversation
    },
    async fetchConversationDetail(conversationId: string) {
      const appStore = useAppStore()
      this.loadingDetail = true
      try {
        const payload = await fetchConversationDetail(appStore.clientId, conversationId)
        this.currentConversation = payload.conversation
        this.currentConversationId = conversationId
        return payload
      } catch (error) {
        appStore.notifyApiError(error)
        return null
      } finally {
        this.loadingDetail = false
      }
    },
    renameConversationLocal(conversationId: string, title: string) {
      this.items = this.items.map((item) => (item.id === conversationId ? { ...item, title } : item))
      if (this.currentConversation?.id === conversationId) {
        this.currentConversation = { ...this.currentConversation, title }
      }
    },
    deleteConversationLocal(conversationId: string) {
      this.items = this.items.filter((item) => item.id !== conversationId)
      if (this.currentConversationId === conversationId) {
        this.currentConversationId = null
        this.currentConversation = null
      }
    },
  },
})
