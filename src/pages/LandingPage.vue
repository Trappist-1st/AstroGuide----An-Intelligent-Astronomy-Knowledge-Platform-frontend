<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useConversationStore } from '../stores/conversation'
import { useMessageStore } from '../stores/message'
import { useAppStore } from '../stores/app'

const router = useRouter()
const conversationStore = useConversationStore()
const messageStore = useMessageStore()
const appStore = useAppStore()

const question = ref('')
const creating = ref(false)

async function startChat() {
  if (creating.value || !question.value.trim()) {
    return
  }
  creating.value = true
  try {
    const conversation = await conversationStore.createConversation('新会话')
    messageStore.resetForConversation(conversation.id)
    await router.push({
      name: 'chat',
      params: { conversationId: conversation.id },
      query: { q: question.value.trim() },
    })
  } catch (error) {
    appStore.notifyApiError(error)
  } finally {
    creating.value = false
  }
}
</script>

<template>
  <main class="landing">
    <section class="hero glass">
      <h1>AstroGuide</h1>
      <p>面向天文学习者的 AI 问答与知识探索助手。</p>

      <div class="quick-ask">
        <textarea
          v-model="question"
          rows="3"
          placeholder="例如：用通俗方式解释黑洞蒸发，并给出关键公式"
          @keydown.enter.exact.prevent="startChat"
        />
        <button :disabled="creating" @click="startChat">
          {{ creating ? '创建中...' : '开始提问' }}
        </button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.landing {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.hero {
  width: min(840px, 100%);
  padding: 28px;
}

h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3rem);
}

p {
  color: var(--text-secondary);
}

.quick-ask {
  display: grid;
  gap: 10px;
}

textarea {
  width: 100%;
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.8);
  color: var(--text-primary);
  padding: 10px;
}

button {
  justify-self: start;
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  color: var(--text-primary);
  background: color-mix(in srgb, var(--accent) 45%, #0f172a);
  padding: 9px 15px;
}
</style>
