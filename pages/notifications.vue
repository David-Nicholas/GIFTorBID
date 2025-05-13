<template>
  <div class="notifications-root">
    <div v-if="reversedNotifications.length === 0" class="text-center text-gray-500">
      <p class="info-message">No notifications yet.</p>
      <div class="image-container">
        <img src="../assets/image.png" alt="mascot" />
      </div>
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
import { useAuth } from '~/utils/useAuth'

definePageMeta({ colorMode: 'light' })

const config = useRuntimeConfig().public
const notifications = ref([])
const router = useRouter()
const auth = ref({ isAuthenticated: false, userID: '', userEmail: '', token: '' })

const reversedNotifications = computed(() => {
  return [...notifications.value].reverse()
})

function goTo(path) {
  router.push(path)
}

async function getUserMessages() {
  try {
    auth.value = await useAuth()
    if (!auth.isAuthenticated) return

      const response = await fetch(`${config.api_url}/user/messages?userID=${auth.value.userID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${auth.value.token}`
        }
      })

      const data = await response.json()
      const parsed = JSON.parse(data.body)

      notifications.value = Array.isArray(parsed.notifications) ? parsed.notifications : []
      console.log('Fetched notifications:', notifications.value)
  } catch (error) {
    console.error('Error fetching notifications:', error)
  }
}

onMounted(getUserMessages)
</script>

<style scoped>
.notifications-root {
  width: 98%;
  margin: 40px auto;
  padding: 0 20px;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-message {
  font-size: 18px;
  margin-bottom: 10px;
  color: #555;
}

.image-container {
  margin: 0 auto;
  align-self: center;
  width: 50%;
  height: 50%;
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
