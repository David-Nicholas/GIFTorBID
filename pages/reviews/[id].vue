<template>
    <div class="notifications-root">
        <div v-if="statistincs.reviews?.length === 0" class="text-center text-gray-500">
            <p class="name-paragraph"> {{ userEmail }} received reviews</p>
            <p class="info-message">No reviews yet.</p>
        </div>

        <div v-else class="notification-list">
            <p class="name-paragraph"> {{ userEmail }} received reviews</p>
            <p class="name-paragraph">User rating: {{ statistincs.averageRating }}</p>
            <div v-for="(review, index) in statistincs.reviews" :key="index" class="notification-item">
                <p class="message">{{ review.writerEmail }}: <br> {{ review.message }}</p>
                <span class="rating">
                    <UIcon name="fontisto:star" class="size-5" /> {{ review.rating }}/5
                </span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '~/utils/useAuth'

definePageMeta({ colorMode: 'light' })

const route = useRoute()
const config = useRuntimeConfig().public

const auth = ref({ isAuthenticated: false, userID: '', userEmail: '', token: '' })
const targetEmail = ref('')
const statistincs = ref([])

const displayName = computed(() => {
  return targetEmail.value === auth.value.userEmail ? 'Your' : targetEmail.value
})

async function getUserReviews() {
  try {
    targetEmail.value = route.params.id

    const response = await fetch(`${config.api_url}/user/review?userEmail=${targetEmail.value}`, {
      method: 'GET'
    })

    const data = await response.json()
    statistincs.value = JSON.parse(data.body)
  } catch (error) {
    console.error('Error fetching reviews:', error)
  }
}

onMounted(async () => {
  auth.value = await useAuth()
  await getUserReviews()
})
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

.name-paragraph {
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 40px;
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