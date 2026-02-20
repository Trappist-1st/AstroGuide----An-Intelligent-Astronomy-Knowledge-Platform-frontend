<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAppStore } from '../../stores/app'

const appStore = useAppStore()
const { toast, rateLimitSeconds } = storeToRefs(appStore)
</script>

<template>
  <transition name="fade">
    <aside v-if="toast.visible" class="global-toast glass" :class="`is-${toast.type}`" aria-live="polite">
      <p>{{ toast.message }}</p>
      <small v-if="rateLimitSeconds > 0">冷却中：{{ rateLimitSeconds }}s</small>
    </aside>
  </transition>
</template>

<style scoped>
.global-toast {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 120;
  min-width: 220px;
  padding: 12px 14px;
  color: var(--text-primary);
}

.is-success {
  border-color: color-mix(in srgb, var(--success) 55%, transparent);
}

.is-warning {
  border-color: color-mix(in srgb, var(--warning) 55%, transparent);
}

.is-error {
  border-color: color-mix(in srgb, var(--danger) 55%, transparent);
}

p {
  margin: 0;
}

small {
  color: var(--text-secondary);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
