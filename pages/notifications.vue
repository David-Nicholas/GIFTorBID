<template>
    <div class="notifications-root">
      <div v-if="messages.value?.notifications?.length === 0" class="text-center text-gray-500">
        No notifications found.
      </div>
  
      <div v-else class="notification-list">
        <div
          v-for="(notif, index) in reversedNotifications"
          :key="index"
          class="notification-item"
          @click="goTo(notif.redirect)"
        >
          <p class="message">{{ notif.message }}</p>
          <span class="redirect">&rarr;</span>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth'
  
  definePageMeta({ colorMode: 'light' })
  
  const config = useRuntimeConfig().public
  const userID = ref('')
  const messages = ref({ notifications: [] })
  const router = useRouter()
  
  const reversedNotifications = computed(() => {
    return [...(messages.value.notifications || [])].reverse()
  })
  
  async function getUserMessages() {
    try {
      const session = await fetchAuthSession()
      if (session?.tokens) {
        const token = session.tokens.idToken.toString()
        const attributes = await fetchUserAttributes()
        userID.value = attributes.sub
  
        const response = await fetch(`${config.api_url}/user/messages?userID=${userID.value}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`
          }
        })
  
        const data = await response.json()
        messages.value = JSON.parse(data.body)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }
  
  function goTo(path) {
    router.push(path)
  }
  
  onMounted(getUserMessages)
  </script>
  
  <style scoped>
  .notifications-root {
    max-width: 800px;
    margin: 40px auto;
    padding: 0 20px;
  }
  
  .notification-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .notification-item {
    padding: 16px;
    border: 1.5px solid #8e8d8d;
    cursor: pointer;
    transition: background-color 0.2s;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .notification-item:hover {
    background-color: #f9f9f9;
  }
  
  .message {
    font-size: 16px;
    font-weight: 500;
    color: #000000;
  }
  
  .redirect {
    font-size: 20px;
    color: #000000;
  }
  </style>
  