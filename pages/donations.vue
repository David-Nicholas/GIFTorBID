<template>
  <div class="posts-container">
    <h1 class="text-3xl font-bold text-center mb-6">Donations</h1>

    <div class="filter-container">
      <h2 class="filter-title">Filter by Category:</h2>
      <div class="filter-buttons">
        <button v-for="category in categories" :key="category" @click="toggleCategory(category)"
          :class="{ 'active-filter': selectedCategories.includes(category) }">
          {{ category }}
        </button>
        <button @click="resetCategoryFilter" :class="{ 'active-filter': selectedCategories.length === 0 }">
          All
        </button>
      </div>
    </div>

    <div class="filter-container">
      <h2 class="filter-title">Filter by Status:</h2>
      <div class="filter-buttons">
        <button @click="setStatusFilter('not_redeemed')"
          :class="{ 'active-filter': selectedStatus === 'not_redeemed' }">
          Not Redeemed
        </button>
        <button @click="setStatusFilter('redeemed')" :class="{ 'active-filter': selectedStatus === 'redeemed' }">
          Redeemed
        </button>
        <button @click="setStatusFilter('all')" :class="{ 'active-filter': selectedStatus === 'all' }">
          All
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="loading-container">
      <p>Loading donation listings...</p>
    </div>

    <div v-else-if="filteredListings.length === 0" class="empty-message">
      <p>No listings match the selected filters.</p>
      <div class="image-container">
        <img src="../assets/image.png" alt="mascot">
      </div>
    </div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
      <Card v-for="listing in filteredListings" :key="listing.objectID" :listing="listing" />
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  colorMode: 'light',
});

import { ref, onMounted, computed } from 'vue';
import { fetchUserAttributes } from 'aws-amplify/auth';
import Card from '~/components/Card.vue';

const config = useRuntimeConfig().public;
const listings = ref([]);
const isLoading = ref(true);
const userEmail = ref("");

const categories = ref([
  'fashion', 'electronics', 'home appliances', 'culture and art', 'home and garden',
  'leisure', 'entertainment', 'education', 'health', 'construction', 'toys'
]);
const selectedCategories = ref([]);
const selectedStatus = ref("all");

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

    const response = await fetch(`${config.api_url}/listings/donations`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    console.log(data.body);

    if (response.ok && data.body) {
      const parsedBody = JSON.parse(data.body);
      listings.value = parsedBody.listings;
      console.log("Listings Data:", listings.value);
    } else {
      console.error("Failed to fetch listings");
      listings.value = [];
    }
  } catch (error) {
    console.error("Error fetching listings:", error);
    listings.value = [];
  } finally {
    isLoading.value = false;
  }
}

function toggleCategory(category) {
  if (selectedCategories.value.includes(category)) {
    selectedCategories.value = selectedCategories.value.filter(c => c !== category);
  } else {
    selectedCategories.value.push(category);
  }
}

function resetCategoryFilter() {
  selectedCategories.value = [];
}

function setStatusFilter(status) {
  selectedStatus.value = status;
}

const filteredListings = computed(() => {
  return listings.value.filter(listing => {
    const categoryMatch = selectedCategories.value.length === 0 || selectedCategories.value.includes(listing.category);

    const isRedeemed = listing.winnerEmail && listing.winnerEmail.trim() !== "";
    const statusMatch =
      selectedStatus.value === "all" ||
      (selectedStatus.value === "redeemed" && isRedeemed) ||
      (selectedStatus.value === "not_redeemed" && !isRedeemed);

    return categoryMatch && statusMatch;
  });
});

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

.filter-container {
  margin-bottom: 20px;
}

.filter-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.filter-buttons button {
  padding: 8px 12px;
  border: 1.5px solid #8e8d8d;
  background-color: white;
  cursor: pointer;
  font-size: 14px;
  border-radius: 4px;
}

.filter-buttons button.active-filter {
  background-color: #35A45F;
  color: white;
  font-weight: bold;
}

.grid {
  display: grid;
  gap: 16px;
}
</style>
