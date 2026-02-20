<script setup lang="ts">
import type { Citation } from '../../types/api'

defineProps<{
  citations: Citation[]
}>()
</script>

<template>
  <section v-if="citations.length > 0" class="citation-panel glass">
    <h4>引用来源</h4>
    <ul>
      <li v-for="(item, index) in citations" :key="item.id || `${item.url || ''}_${index}`">
        <a v-if="item.url" :href="item.url" target="_blank" rel="noreferrer">
          {{ item.title || item.source || `来源 ${index + 1}` }}
        </a>
        <span v-else>{{ item.title || item.source || `来源 ${index + 1}` }}</span>
        <small v-if="item.snippet">{{ item.snippet }}</small>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.citation-panel {
  margin-top: 8px;
  padding: 10px;
}

h4 {
  margin: 0 0 6px;
  font-size: 0.86rem;
  color: var(--text-secondary);
}

ul {
  margin: 0;
  padding-left: 16px;
  display: grid;
  gap: 4px;
}

small {
  display: block;
  color: var(--text-secondary);
}
</style>
