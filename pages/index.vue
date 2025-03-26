<template>
  <div class="index-root">

    <div v-if="isLoading" class="loading-container">
      <p>Loading listings...</p>
    </div>

    <div v-else>
      <!-- New Listings Section -->
      <h1 class="text-3xl font-bold text-center mb-6">NEW LISTINGS</h1>
      <div v-if="listingsToday.length === 0" class="empty-message">
        <p>No new listings available.</p>
      </div>
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
        <Card v-for="listing in listingsToday" :key="listing.listingID" :listing="listing" />
      </div>

      <!-- Ends Today Auctions Section -->
      <h1 class="text-3xl font-bold text-center mt-10 mb-6">ENDS TODAY</h1>
      <div v-if="auctionsEndingToday.length === 0" class="empty-message">
        <p>No auctions ending today.</p>
      </div>
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
          <Card v-for="listing in auctionsEndingToday" :key="listing.listingID" :listing="listing" />
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  colorMode: 'light',
});

import { ref, onMounted } from 'vue';
import Card from '~/components/Card.vue';

const config = useRuntimeConfig().public;
const listingsToday = ref([]);
const auctionsEndingToday = ref([]);
const isLoading = ref(true);

async function fetchListings() {
  isLoading.value = true;

  try {

    const response = await fetch(`${config.api_url}/listings`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    console.log("API Response:", data);

    if (response.ok && data) {
      const parsedBody = JSON.parse(data.body);
      listingsToday.value = parsedBody.listingsToday || [];
      auctionsEndingToday.value = parsedBody.auctionsEndingToday || [];
      console.log("Listings Today:", listingsToday.value);
      console.log("Auctions Ending Today:", auctionsEndingToday.value);
    } else {
      console.error("Failed to fetch listings");
      listingsToday.value = [];
      auctionsEndingToday.value = [];
    }
  } catch (error) {
    console.error("Error fetching listings:", error);
    listingsToday.value = [];
    auctionsEndingToday.value = [];
  } finally {
    isLoading.value = false;
  }
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

.post-btn-container {
  margin-bottom: 40px;
}

.index-root {
  max-width: 100%;
  margin: 0 auto;
  text-align: center;
  margin-top: 40px;
  padding-left: 20px;
  padding-right: 20px;
}

.loading-container,
.empty-message {
  font-size: 18px;
  color: #555;
  margin-top: 20px;
}

.grid {
  display: grid;
  gap: 16px;
}
</style>
