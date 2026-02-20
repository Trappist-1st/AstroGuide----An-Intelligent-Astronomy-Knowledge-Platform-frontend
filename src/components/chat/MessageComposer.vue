<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  disabled?: boolean
  streaming?: boolean
}>()

const emit = defineEmits<{
  submit: [value: string]
  stop: []
}>()

const draft = ref('')

watch(
  () => props.streaming,
  (value) => {
    if (!value) {
      draft.value = ''
    }
  },
)

function onSubmit() {
  const value = draft.value.trim()
  if (!value) {
    return
  }
  emit('submit', value)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    onSubmit()
  }
}
</script>

<template>
  <section class="composer glass">
    <textarea
      v-model="draft"
      rows="3"
      :disabled="disabled"
      placeholder="输入你的天文问题，Enter 发送，Shift+Enter 换行"
      @keydown="onKeydown"
    />
    <div class="actions">
      <button v-if="streaming" class="stop" @click="emit('stop')">停止</button>
      <button v-else class="send" :disabled="disabled" @click="onSubmit">发送</button>
    </div>
  </section>
</template>

<style scoped>
.composer {
  padding: 10px;
}

textarea {
  width: 100%;
  resize: vertical;
  min-height: 74px;
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.8);
  color: var(--text-primary);
  padding: 10px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.send,
.stop {
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  color: var(--text-primary);
  padding: 7px 14px;
}

.send {
  background: color-mix(in srgb, var(--accent) 45%, #0f172a);
}

.stop {
  background: color-mix(in srgb, var(--warning) 35%, #0f172a);
}
</style>
