<script setup lang="ts">
import type { Citation, MessageStatus } from '../../types/api'
import CitationPanel from './CitationPanel.vue'
import MarkdownRenderer from './MarkdownRenderer.vue'

defineProps<{
  content: string
  status: MessageStatus
  createdAt: string
  citations: Citation[]
}>()

const emit = defineEmits<{
  term: [value: string]
}>()
</script>

<template>
  <article class="message assistant">
    <div class="bubble glass">
      <MarkdownRenderer :source="content || '...'" @term="emit('term', $event)" />
      <footer>
        <span class="status" :class="status">{{ status }}</span>
        <time>{{ new Date(createdAt).toLocaleTimeString() }}</time>
      </footer>
      <CitationPanel :citations="citations" />
    </div>
  </article>
</template>

<style scoped>
.message {
  display: flex;
  justify-content: flex-start;
}

.bubble {
  max-width: min(86%, 760px);
  padding: 12px;
}

footer {
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.status {
  text-transform: capitalize;
}

.status.streaming {
  color: var(--accent);
}

.status.done {
  color: var(--success);
}

.status.error {
  color: var(--danger);
}

.status.cancelled {
  color: var(--warning);
}
</style>
