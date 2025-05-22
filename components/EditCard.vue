<template>
    <div class="listing-card">
        <div class="image-container">
            <img :src="firstImage" class="listing-image">
        </div>

        <div class="info-section">
            <h2 class="listing-title">{{ listing.name }}</h2>
            <p class="listing-type">{{ listing.type.toUpperCase() }}</p>
            <p class="listing-type">{{ listing.status.toUpperCase() }}</p>
        </div>

        <div class="action-section">
            <button class="show-more-btn" :style="{ backgroundColor: buttonColor }" @click="goToEditPage">
                Show More
            </button>
        </div>
    </div>
</template>


<script setup>
import { computed } from 'vue';
import { useState } from "#app";
import { useRouter } from "vue-router";

const props = defineProps({
    listing: Object,
});

const selectedListing = useState("selectedListing");
const router = useRouter();

function goToEditPage() {
    selectedListing.value = props.listing;
    router.push(`/edit/${props.listing.listingID}`);
}

// const firstImage = computed(() => {
//     return `https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png?20210521171500`;
// });

// Get the first image from the list or use a placeholder if none exists
const firstImage = computed(() => {
  return props.listing.images.length > 0
    ? props.listing.images[0] 
    : "https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png?20210521171500"; // Placeholder if no image exists
});

const buttonColor = computed(() => {
    return props.listing.type === "auction" ? "#EBA92E" : "#35A45F";
});
</script>

<style scoped>
.listing-card {
    border: 1.5px solid #8e8d8d;
    background-color: white;
    box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.1);
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: hidden;
}

.image-container {
    margin: auto;
    aspect-ratio: 16 / 9;
    width: 100%;
    overflow: hidden;
}

.listing-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.info-section {
    padding: 10px;
    width: 100%;
    text-align: center;
    min-height: 80px;
    max-height: 180px;
    overflow-y: auto;
}

.listing-title {
    font-size: 16px;
    font-weight: bold;
    color: #000;
}

.listing-type {
    font-size: 14px;
    color: #555;
    margin-top: 4px;
}

.action-section {
    width: 100%;
    padding: 10px;
    text-align: center;
}

.show-more-btn {
    width: 100%;
    padding: 8px;
    font-size: 14px;
    font-weight: bold;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.show-more-btn:hover {
    opacity: 0.85;
}
</style>
