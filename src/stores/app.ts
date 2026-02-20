import { defineStore } from 'pinia'
import type { ApiError } from '../services/http'
import type { Difficulty, Language } from '../types/api'

interface ToastState {
  visible: boolean
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
}

interface AppState {
  clientId: string
  theme: 'dark' | 'light'
  language: Language
  difficulty: Difficulty
  networkHealthy: boolean
  toast: ToastState
  rateLimitUntil: number | null
}

const CLIENT_ID_KEY = 'astroguide.clientId'
const PREF_KEY = 'astroguide.preferences'

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    clientId: '',
    theme: 'dark',
    language: 'zh',
    difficulty: 'intermediate',
    networkHealthy: true,
    toast: {
      visible: false,
      type: 'info',
      message: '',
    },
    rateLimitUntil: null,
  }),
  getters: {
    rateLimitSeconds(state): number {
      if (!state.rateLimitUntil) {
        return 0
      }
      const seconds = Math.ceil((state.rateLimitUntil - Date.now()) / 1000)
      return seconds > 0 ? seconds : 0
    },
  },
  actions: {
    initClientId() {
      const cached = localStorage.getItem(CLIENT_ID_KEY)
      if (cached) {
        this.clientId = cached
        return
      }
      this.clientId = crypto.randomUUID()
      localStorage.setItem(CLIENT_ID_KEY, this.clientId)
    },
    initPreferences() {
      const raw = localStorage.getItem(PREF_KEY)
      if (!raw) {
        return
      }
      try {
        const parsed = JSON.parse(raw) as Partial<AppState>
        this.theme = parsed.theme === 'light' ? 'light' : 'dark'
        this.language = parsed.language === 'en' ? 'en' : 'zh'
        this.difficulty =
          parsed.difficulty === 'basic' || parsed.difficulty === 'advanced' ? parsed.difficulty : 'intermediate'
      } catch {
        localStorage.removeItem(PREF_KEY)
      }
    },
    persistPreferences() {
      localStorage.setItem(
        PREF_KEY,
        JSON.stringify({
          theme: this.theme,
          language: this.language,
          difficulty: this.difficulty,
        }),
      )
    },
    setTheme(theme: 'dark' | 'light') {
      this.theme = theme
      this.persistPreferences()
    },
    setLanguage(language: Language) {
      this.language = language
      this.persistPreferences()
    },
    setDifficulty(difficulty: Difficulty) {
      this.difficulty = difficulty
      this.persistPreferences()
    },
    showToast(payload: { type?: ToastState['type']; message: string; timeoutMs?: number }) {
      this.toast.type = payload.type ?? 'info'
      this.toast.message = payload.message
      this.toast.visible = true
      const timeoutMs = payload.timeoutMs ?? 2800
      window.setTimeout(() => {
        this.toast.visible = false
      }, timeoutMs)
    },
    notifyApiError(error: unknown) {
      const apiError = error as ApiError & { status?: number }
      if (apiError?.status === 429) {
        this.rateLimitUntil = Date.now() + 30_000
        this.showToast({
          type: 'warning',
          message: '请求过于频繁，请稍后再试。',
          timeoutMs: 3500,
        })
        return
      }
      this.showToast({
        type: 'error',
        message: apiError?.message ?? '请求失败，请稍后重试。',
      })
    },
  },
})
