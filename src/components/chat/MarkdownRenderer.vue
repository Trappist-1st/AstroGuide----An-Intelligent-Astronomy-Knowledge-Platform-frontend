<script setup lang="ts">
import { computed } from 'vue'
import DOMPurify from 'dompurify'
import MarkdownIt from 'markdown-it'
import texmath from 'markdown-it-texmath'
import katex from 'katex'

const props = defineProps<{
  source: string
}>()

const emit = defineEmits<{
  term: [value: string]
}>()

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const markdown = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
})

markdown.use(texmath, {
  engine: katex,
  delimiters: 'dollars',
})

const html = computed(() => {
  const transformed = props.source.replace(/\[\[term:([^\]]+)\]\]/g, (_, rawTerm: string) => {
    const term = escapeHtml(rawTerm.trim())
    return `<button type="button" class="ag-term" data-term="${term}">${term}</button>`
  })

  return DOMPurify.sanitize(markdown.render(transformed), {
    ADD_ATTR: ['data-term', 'class', 'style'],
  })
})

function onClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  const button = target?.closest('button[data-term]') as HTMLButtonElement | null
  if (!button) {
    return
  }
  emit('term', button.dataset.term ?? '')
}
</script>

<template>
  <div class="markdown" v-html="html" @click="onClick" />
</template>

<style scoped>
.markdown {
  color: var(--text-primary);
  word-break: break-word;
}

.markdown :deep(p) {
  margin: 0.4rem 0;
}

.markdown :deep(pre) {
  overflow-x: auto;
  padding: 10px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.75);
}

.markdown :deep(.ag-term) {
  border: 1px solid color-mix(in srgb, var(--accent-2) 55%, transparent);
  background: rgba(139, 124, 255, 0.12);
  color: #cbc4ff;
  border-radius: 999px;
  padding: 2px 8px;
  margin: 0 2px;
}
</style>
