import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '../pages/LandingPage.vue'
import ChatPage from '../pages/ChatPage.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingPage,
    },
    {
      path: '/chat/:conversationId?',
      name: 'chat',
      component: ChatPage,
      props: true,
    },
  ],
})
