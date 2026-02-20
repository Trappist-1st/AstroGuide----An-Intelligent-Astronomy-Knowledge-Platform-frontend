<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ConversationListItem } from '../../types/api'

const props = defineProps<{
  items: ConversationListItem[]
  currentId: string | null
  loading: boolean
  hasMore: boolean
}>()

const emit = defineEmits<{
  select: [id: string]
  create: []
  loadMore: []
  rename: [id: string]
  remove: [id: string]
}>()

const keyword = ref('')

const filteredItems = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  if (!q) {
    return props.items
  }
  return props.items.filter((item) => (item.title ?? '未命名会话').toLowerCase().includes(q))
})
</script>

<template>
  <aside class="sidebar glass">
    <div class="sidebar-top">
      <h2>会话</h2>
      <button @click="emit('create')">新建</button>
    </div>

    <input v-model="keyword" placeholder="搜索会话" />

    <ul>
      <li v-for="item in filteredItems" :key="item.id">
        <div class="item-row" :class="{ active: item.id === currentId }">
          <button class="item-btn" @click="emit('select', item.id)">
            <strong>{{ item.title || '未命名会话' }}</strong>
            <small>{{ item.lastMessagePreview || '暂无摘要' }}</small>
          </button>
          <div class="row-actions">
            <button class="icon" title="重命名" @click="emit('rename', item.id)">✎</button>
            <button class="icon" title="删除" @click="emit('remove', item.id)">🗑</button>
          </div>
        </div>
      </li>
    </ul>

    <button v-if="hasMore" class="load-more" :disabled="loading" @click="emit('loadMore')">
      {{ loading ? '加载中...' : '加载更多' }}
    </button>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  padding: 12px;
  min-height: 0;
  gap: 10px;
}

.sidebar-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h2 {
  margin: 0;
  font-size: 1rem;
}

input {
  width: 100%;
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.8);
  color: var(--text-primary);
  padding: 8px 10px;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
  overflow-y: auto;
}

.item-row {
  border-radius: 10px;
  border: 1px solid transparent;
  background: rgba(15, 23, 42, 0.72);
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
}

.item-btn {
  width: 100%;
  text-align: left;
  border-radius: 10px;
  border: 0;
  background: transparent;
  color: var(--text-primary);
  padding: 10px;
  display: grid;
  gap: 2px;
}

.item-btn small {
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-row.active {
  border-color: color-mix(in srgb, var(--accent) 60%, transparent);
}

.row-actions {
  display: flex;
  gap: 4px;
  padding-right: 8px;
}

.icon {
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  padding: 4px;
}

.load-more {
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  background: transparent;
  color: var(--text-primary);
  padding: 8px;
}
</style>
