<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ChatHeader from '../components/chat/ChatHeader.vue'
import ConversationSidebar from '../components/chat/ConversationSidebar.vue'
import MessageList from '../components/chat/MessageList.vue'
import MessageComposer from '../components/chat/MessageComposer.vue'
import SseStatusBar from '../components/chat/SseStatusBar.vue'
import ConceptPopover from '../components/chat/ConceptPopover.vue'
import { useConversationStore } from '../stores/conversation'
import { useMessageStore } from '../stores/message'
import { useAppStore } from '../stores/app'

const route = useRoute()
const router = useRouter()

const conversationStore = useConversationStore()
const messageStore = useMessageStore()
const appStore = useAppStore()

const { items, currentConversationId, loadingList, nextCursor } = storeToRefs(conversationStore)
const { messages, stream } = storeToRefs(messageStore)
const { difficulty, language } = storeToRefs(appStore)

const conceptOpen = ref(false)
const currentTerm = ref('')

const hasMoreConversation = computed(() => Boolean(nextCursor.value))
const canSend = computed(() => stream.value.phase !== 'streaming')

async function ensureConversationLoaded(conversationId: string) {
  if (messageStore.currentConversationId !== conversationId) {
    messageStore.resetForConversation(conversationId)
  }
  const detail = await conversationStore.fetchConversationDetail(conversationId)
  if (detail) {
    messageStore.hydrateFromDetail(detail)
  }
}

async function createAndSwitchConversation() {
  const conversation = await conversationStore.createConversation('新会话')
  await router.push({ name: 'chat', params: { conversationId: conversation.id } })
}

async function onSelectConversation(id: string) {
  await router.push({ name: 'chat', params: { conversationId: id } })
}

function onRenameConversation(id: string) {
  const target = items.value.find((item) => item.id === id)
  const nextTitle = window.prompt('请输入新的会话名称', target?.title ?? '未命名会话')
  if (!nextTitle) {
    return
  }
  conversationStore.renameConversationLocal(id, nextTitle.trim())
}

async function onDeleteConversation(id: string) {
  const confirmed = window.confirm('确认删除该会话？此操作仅影响前端本地列表。')
  if (!confirmed) {
    return
  }
  conversationStore.deleteConversationLocal(id)
  if (currentConversationId.value === null) {
    await createAndSwitchConversation()
  }
}

async function submitQuestion(content: string) {
  const conversationId = currentConversationId.value
  if (!conversationId) {
    return
  }
  await messageStore.submitUserMessage({
    conversationId,
    content,
    difficulty: difficulty.value,
    language: language.value,
  })
}

function openTerm(term: string) {
  currentTerm.value = term
  conceptOpen.value = true
}

watch(
  () => route.params.conversationId,
  async (value) => {
    if (typeof value === 'string' && value) {
      await ensureConversationLoaded(value)
      return
    }
    const conversation = await conversationStore.createConversation('新会话')
    await router.replace({ name: 'chat', params: { conversationId: conversation.id } })
  },
  { immediate: true },
)

watch(
  () => route.query.q,
  async (value) => {
    if (typeof value !== 'string' || !value.trim() || !currentConversationId.value) {
      return
    }
    await submitQuestion(value)
    await router.replace({ query: {} })
  },
)

onMounted(async () => {
  await conversationStore.fetchConversationList(true)
})
</script>

<template>
  <main class="chat-page">
    <ChatHeader />

    <div class="layout">
      <ConversationSidebar
        :items="items"
        :current-id="currentConversationId"
        :loading="loadingList"
        :has-more="hasMoreConversation"
        @create="createAndSwitchConversation"
        @select="onSelectConversation"
        @rename="onRenameConversation"
        @remove="onDeleteConversation"
        @load-more="conversationStore.fetchConversationList()"
      />

      <section class="chat-main">
        <SseStatusBar :phase="stream.phase" :model="stream.model" :error-message="stream.errorMessage" />

        <MessageList :messages="messages" @load-more="messageStore.loadMoreMessages()" @term="openTerm" />

        <div class="toolbar">
          <button v-if="stream.phase === 'error'" @click="messageStore.retryLastAssistantMessage()">重试本轮</button>
          <button v-if="stream.phase === 'error'" @click="createAndSwitchConversation">发起新问题</button>
        </div>

        <MessageComposer
          :disabled="!canSend"
          :streaming="stream.phase === 'streaming'"
          @submit="submitQuestion"
          @stop="messageStore.cancelStream()"
        />
      </section>
    </div>

    <ConceptPopover
      :open="conceptOpen"
      :term="currentTerm"
      :language="language"
      @close="conceptOpen = false"
    />
  </main>
</template>

<style scoped>
.chat-page {
  height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 10px;
  padding: 10px;
}

.layout {
  min-height: 0;
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 10px;
}

.chat-main {
  min-height: 0;
  display: grid;
  grid-template-rows: auto 1fr auto auto;
  gap: 10px;
}

.toolbar {
  display: flex;
  gap: 8px;
}

.toolbar button {
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  background: transparent;
  color: var(--text-primary);
  padding: 6px 10px;
}

@media (max-width: 1024px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
