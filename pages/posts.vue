<template>
    <div class="posts-container">
        <h1 class="text-3xl font-bold text-center mb-6">My Listings</h1>

        <div v-if="isLoading" class="loading-container">
            <p>Loading your listings...</p>
        </div>

        <div v-else-if="listings.length === 0" class="empty-message">
            <p>You have not created any listings yet.</p>
            <div class="image-container">
                <img src="../assets/image.png" alt="mascot">
            </div>
            <NuxtLink to="/post" active-class="active-link"><CustomButton :buttonText="'Post'" class="custom-btn"/></NuxtLink>
        </div>

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
            <ListingCard v-for="listing in listings" :key="listing.objectID" :title="listing.objectName"
                :images="listing.images" :type="listing.type" @showMore="goToDetails(listing.objectID)" />
        </div>
    </div>
</template>

<script setup>
definePageMeta({
    colorMode: 'light',
    layout: 'custom'
});

import { ref, onMounted } from 'vue';
import { fetchUserAttributes } from 'aws-amplify/auth';
import ListingCard from '@/components/ListingCard.vue';

const config = useRuntimeConfig().public;
const listings = ref([]);
const isLoading = ref(true);
const userEmail = ref("");

async function fetchListings() {
    isLoading.value = true;

    try {
        const attributes = await fetchUserAttributes();
        userEmail.value = attributes.email || "";
        if (!userEmail.value) {
            console.error("User email not found");
            isLoading.value = false;
            return;
        }

        const response = await fetch(`${config.api_url}/listings?sellerEmail=${userEmail.value}`);
        const data = await response.json();

        if (response.ok && data.body) {
            listings.value = JSON.parse(data.body);
        } else {
            console.error("Failed to fetch listings");
        }
    } catch (error) {
        console.error("Error fetching listings:", error);
    } finally {
        isLoading.value = false;
    }
}

function goToDetails(objectID) {
    console.log("Navigating to details for:", objectID);
}

onMounted(fetchListings);
</script>

<style scoped>
.image-container {
    margin: 0 auto;
    align-self: center;
    width: 50%;
    height: 50%;
}

.posts-container {
    max-width: 100%;
    margin: 0 auto;
    padding: 20px;
    text-align: center;
}

.loading-container,
.empty-message {
    font-size: 18px;
    color: #555;
    margin-top: 20px;
}
</style>