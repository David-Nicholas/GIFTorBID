<template>
    <div class="notifications-root">
        <div v-if="statistincs.reviews?.length === 0" class="text-center text-gray-500">
            <p class="info-message">No reviews yet.</p>
            <div class="image-container">
                <img src="../assets/image.png" alt="mascot">
            </div>
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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router';
import { fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth'

definePageMeta({ colorMode: 'light' })

const route = useRoute();

const config = useRuntimeConfig().public
const userEmail = ref('')
const statistincs = ref([]);

async function getUserReviews() {
    try {
        userEmail.value = route.params.id;
        const response = await fetch(`${config.api_url}/user/review?userEmail=${userEmail.value}`, {
            method: 'GET',
        })

        const data = await response.json()
        statistincs.value = JSON.parse(data.body)
        console.log(statistincs.value);
        const session = await fetchAuthSession()
        if (session?.tokens) {
            const attributes = await fetchUserAttributes()
            if(userEmail.value == attributes.email){
                userEmail.value = 'Your'
            }
        }
    } catch (error) {
        console.error('Error fetching reviews:', error)
    }
}

onMounted(getUserReviews)
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

.image-container {
    margin: 0 auto;
    align-self: center;
    width: 50%;
    height: 50%;
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