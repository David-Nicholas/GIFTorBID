<template>
  <div class="notifications-root">
    <div v-if="reviews.value?.reviews?.length === 0" class="text-center text-gray-500">
      No reviews found.
    </div>

    <div v-else class="notification-list">
      <div
        v-for="(review, index) in reversedReviews"
        :key="index"
        class="notification-item"
      >
        <p class="message">{{ review.message }}</p>
        <span class="rating"> <UIcon name="fontisto:star" class="size-5" /> {{ review.rating }}/5</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth'

definePageMeta({ colorMode: 'light' })

const config = useRuntimeConfig().public
const userEmail = ref('')
const reviews = ref({ reviews: [] })

const reversedReviews = computed(() => {
    return [...(reviews.value.reviews || [])].reverse()
  })

async function getUserReviews() {
  try {
    const session = await fetchAuthSession()
    if (session?.tokens) {
      const token = session.tokens.idToken.toString()
      const attributes = await fetchUserAttributes()
      userEmail.value = attributes.email || ''

      const response = await fetch(`${config.api_url}/user/review?userEmail=${userEmail.value}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`
        }
      })

      const data = await response.json()
      reviews.value = JSON.parse(data.body)
      console.log(reviews.value);
    }
  } catch (error) {
    console.error('Error fetching reviews:', error)
  }
}

onMounted(getUserReviews)
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
  cursor: default;
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
  max-width: 70%;
}

.rating {
  font-size: 24px;
  font-weight: bold;
  color: #000000;
}
</style>
