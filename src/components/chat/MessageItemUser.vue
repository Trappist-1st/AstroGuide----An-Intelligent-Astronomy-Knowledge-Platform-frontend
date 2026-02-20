<script setup lang="ts">
defineProps<{
  content: string
  createdAt: string
}>()
</script>

<template>
  <article class="message user">
    <div class="bubble">
      <p>{{ content }}</p>
      <time>{{ new Date(createdAt).toLocaleTimeString() }}</time>
    </div>
  </article>
</template>

<style scoped>
.message {
  display: flex;
  justify-content: flex-end;
}

.bubble {
  max-width: min(80%, 700px);
  border-radius: 14px 14px 4px 14px;
  background: color-mix(in srgb, var(--accent) 26%, #111827);
  border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
  padding: 10px 12px;
}

p {
  margin: 0;
  white-space: pre-wrap;
}

time {
  display: block;
  margin-top: 6px;
  font-size: 0.76rem;
  color: var(--text-secondary);
  text-align: right;
}
</style>
