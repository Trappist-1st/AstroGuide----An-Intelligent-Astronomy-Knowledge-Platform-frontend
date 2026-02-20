<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import type { UiMessage } from '../../types/api'
import MessageItemUser from './MessageItemUser.vue'
import MessageItemAssistant from './MessageItemAssistant.vue'

const props = defineProps<{
  messages: UiMessage[]
}>()

const emit = defineEmits<{
  loadMore: []
  term: [value: string]
}>()

const containerRef = ref<HTMLElement | null>(null)

watch(
  () => props.messages.length,
  async () => {
    await nextTick()
    const el = containerRef.value
    if (!el) {
      return
    }
    el.scrollTop = el.scrollHeight
  },
)

onMounted(() => {
  const el = containerRef.value
  if (!el) {
    return
  }
  el.addEventListener('scroll', () => {
    if (el.scrollTop < 20) {
      emit('loadMore')
    }
  })
})
</script>

<template>
  <section ref="containerRef" class="message-list glass" aria-live="polite">
    <template v-if="messages.length === 0">
      <p class="empty">开始你的第一个天文问题吧，例如：什么是引力透镜？</p>
    </template>

    <template v-else>
      <div v-for="item in messages" :key="item.id" class="item-row">
        <MessageItemUser v-if="item.role === 'user'" :content="item.content" :created-at="item.createdAt" />
        <MessageItemAssistant
          v-else
          :content="item.content"
          :status="item.status"
          :citations="item.citations"
          :created-at="item.createdAt"
          @term="emit('term', $event)"
        />
      </div>
    </template>
  </section>
</template>

<style scoped>
.message-list {
  min-height: 0;
  height: 100%;
  overflow-y: auto;
  padding: 14px;
  display: grid;
  gap: 12px;
}

.empty {
  color: var(--text-secondary);
}

.item-row {
  display: grid;
}
</style>
