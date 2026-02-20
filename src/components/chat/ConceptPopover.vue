<script setup lang="ts">
import { ref, watch } from 'vue'
import { lookupConcept } from '../../services/api'
import { useAppStore } from '../../stores/app'
import type { ConceptLookupPayload, Language } from '../../types/api'

const props = defineProps<{
  term: string
  open: boolean
  language: Language
}>()

const emit = defineEmits<{
  close: []
}>()

const appStore = useAppStore()
const loading = ref(false)
const concept = ref<ConceptLookupPayload | null>(null)
const error = ref('')

watch(
  () => [props.open, props.term, props.language] as const,
  async ([open, term, language]) => {
    if (!open || !term) {
      return
    }
    loading.value = true
    error.value = ''
    concept.value = null
    try {
      concept.value = await lookupConcept(appStore.clientId, {
        type: 'term',
        lang: language,
        key: term,
      })
    } catch {
      error.value = '术语解释暂不可用'
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)
</script>

<template>
  <aside v-if="open" class="popover glass">
    <button class="close" @click="emit('close')">×</button>
    <h3>{{ term }}</h3>
    <p v-if="loading">解析中...</p>
    <p v-else-if="error">{{ error }}</p>
    <template v-else-if="concept">
      <p class="summary">{{ concept.short || concept.title }}</p>
      <p>{{ concept.details }}</p>
      <small v-if="concept.seeAlso?.length">相关：{{ concept.seeAlso.join('、') }}</small>
    </template>
  </aside>
</template>

<style scoped>
.popover {
  position: fixed;
  right: 20px;
  bottom: 86px;
  width: min(380px, calc(100vw - 40px));
  padding: 14px;
  z-index: 99;
}

.close {
  position: absolute;
  right: 8px;
  top: 8px;
  background: transparent;
  border: 0;
  color: var(--text-secondary);
  font-size: 20px;
}

h3 {
  margin: 0 18px 8px 0;
}

.summary {
  color: var(--accent);
}

small {
  color: var(--text-secondary);
}
</style>
