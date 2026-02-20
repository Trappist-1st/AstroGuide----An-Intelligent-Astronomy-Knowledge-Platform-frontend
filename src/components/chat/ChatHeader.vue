<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAppStore } from '../../stores/app'
import type { Difficulty, Language } from '../../types/api'

const appStore = useAppStore()
const { difficulty, language, theme } = storeToRefs(appStore)

function onDifficultyChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value as Difficulty
  appStore.setDifficulty(value)
}

function onLanguageChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value as Language
  appStore.setLanguage(value)
}
</script>

<template>
  <header class="chat-header glass">
    <div class="title">
      <h1>AstroGuide</h1>
      <p>AI 天文问答</p>
    </div>

    <div class="controls">
      <label>
        难度
        <select :value="difficulty" @change="onDifficultyChange">
          <option value="basic">基础</option>
          <option value="intermediate">进阶</option>
          <option value="advanced">高级</option>
        </select>
      </label>

      <label>
        语言
        <select :value="language" @change="onLanguageChange">
          <option value="zh">中文</option>
          <option value="en">English</option>
        </select>
      </label>

      <button class="theme-btn" @click="appStore.setTheme(theme === 'dark' ? 'light' : 'dark')">
        {{ theme === 'dark' ? '亮色' : '暗色' }}
      </button>
    </div>
  </header>
</template>

<style scoped>
.chat-header {
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.title h1 {
  margin: 0;
  font-size: 1.1rem;
}

.title p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 0.86rem;
}

select,
.theme-btn {
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.85);
  color: var(--text-primary);
  padding: 6px 10px;
}
</style>
