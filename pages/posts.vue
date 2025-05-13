<template>
    <div class="posts-root">
        <div v-if="!isAuthenticated" class="unauthenticated-container">
            <p class="info-message">You need to be logged to see you listings.</p>
            <NuxtLink to="/account">
                <CustomButton :buttonText="'Go to Account'" />
            </NuxtLink>
            <div class="image-container">
                <img src="../assets/image.png" alt="mascot">
            </div>
        </div>
        <div v-if="isAuthenticated" class="posts-container">
            <h1 class="text-3xl font-bold text-center mb-6">My Listings</h1>
            <div class="post-btn-container">
                <NuxtLink to="/post" active-class="active-link">
                    <CustomButton :buttonText="'Post'" class="custom-btn" />
                </NuxtLink>
            </div>
            <div v-if="isLoading" class="loading-container">
                <p class="info-message">Loading your listings...</p>
            </div>

            <div v-else-if="listings.length === 0" class="empty-message">
                <p class="info-message">You have not created any listings yet.</p>
                <div class="image-container">
                    <img src="../assets/image.png" alt="mascot">
                </div>
            </div>

            <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
                <Card v-for="listing in listings" :key="listing.objectID" :listing="listing" mode="edit"/>
            </div>
        </div>
    </div>
</template>

<script setup>
definePageMeta({
    colorMode: 'light',
    layout: 'custom'
});

import { ref, onMounted } from 'vue';
import { useAuth } from '~/utils/useAuth'
import Card from '~/components/Card.vue';

const config = useRuntimeConfig().public;
const listings = ref([]);
const isLoading = ref(true);
const isAuthenticated = ref(false);

const auth = ref({ isAuthenticated: false, userID: '', userEmail: '', token: '' })

async function fetchListings() {
    isLoading.value = true;

    try {
        const response = await fetch(`${config.api_url}/user/listings?email=${auth.value.userEmail}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `${auth.value.token}` },
        });

        const data = await response.json();
        listings.value = JSON.parse(data.body);
        console.log("Listings post: ", listings.value);
    } catch (error) {
        console.error("Error fetching listings:", error);
        isAuthenticated.value = false;
    } finally {
        isLoading.value = false;
    }
}

onMounted(async () => {
    auth.value = await useAuth()
    if (!auth.value.isAuthenticated) {
        isAuthenticated.value = false
        isLoading.value = false
        return
    }

    isAuthenticated.value = true
    await fetchListings()
})
</script>

<style scoped>
.unauthenticated-container {
    text-align: center;
    margin-top: 20px;
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

.post-btn-container {
    margin-bottom: 40px;
}

.posts-container {
    max-width: 100%;
    margin: 0 auto;
    padding-left: 20px;
    padding-right: 20px;
    text-align: center;
    margin-top: 40px;
    margin-bottom: 40px;
}

.loading-container,
.empty-message {
    font-size: 18px;
    color: #555;
    margin-top: 20px;
}
</style>