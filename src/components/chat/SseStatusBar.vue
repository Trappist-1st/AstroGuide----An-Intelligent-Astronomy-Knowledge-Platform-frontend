<script setup lang="ts">
import type { StreamPhase } from '../../types/api'

defineProps<{
  phase: StreamPhase
  model?: string | null
  errorMessage?: string | null
}>()
</script>

<template>
  <div class="status-bar glass" role="status" aria-live="polite">
    <span v-if="phase === 'streaming'" class="dot streaming" />
    <span v-else-if="phase === 'done'" class="dot done" />
    <span v-else-if="phase === 'error'" class="dot error" />
    <span v-else-if="phase === 'cancelled'" class="dot warning" />
    <span v-else class="dot" />

    <p v-if="phase === 'streaming'">正在生成回答{{ model ? ` · ${model}` : '' }}</p>
    <p v-else-if="phase === 'error'">{{ errorMessage || '连接异常，可重试本轮' }}</p>
    <p v-else-if="phase === 'cancelled'">已停止生成，保留已生成内容</p>
    <p v-else-if="phase === 'done'">回答已完成</p>
    <p v-else>等待提问</p>
  </div>
</template>

<style scoped>
.status-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
}

.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
}

.streaming {
  background: var(--accent);
  box-shadow: 0 0 10px rgba(77, 163, 255, 0.6);
}

.done {
  background: var(--success);
}

.error {
  background: var(--danger);
}

.warning {
  background: var(--warning);
}

p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}
</style>
