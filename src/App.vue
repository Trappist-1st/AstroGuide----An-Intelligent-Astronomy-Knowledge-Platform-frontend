<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import GlobalToast from './components/common/GlobalToast.vue'
import { useAppStore } from './stores/app'

const appStore = useAppStore()

onMounted(() => {
  appStore.initClientId()
  appStore.initPreferences()
})
</script>

<template>
  <RouterView />
  <GlobalToast />
</template>
