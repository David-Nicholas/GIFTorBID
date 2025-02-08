<template>
    <div class="listing-card">
        <div class="image-container">
            <img :src="firstImage" class="listing-image">
        </div>

        <div class="info-section">
            <h2 class="listing-title">{{ title }}</h2>
            <p class="listing-type">{{ type.toUpperCase() }}</p>
        </div>

        <div class="action-section">
            <button class="show-more-btn" :style="{ backgroundColor: buttonColor }" @click="$emit('showMore')">
                Show More
            </button>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    title: String,
    images: Array,
    type: String,
});

// Replace all images with dummy placeholders
const firstImage = computed(() => {
    return `https://picsum.photos/300/200?random=${Math.floor(Math.random() * 1000)}`;
});

// Get the first image from the list or use a placeholder if none exists
// const firstImage = computed(() => {
//   return props.images.length > 0 
//     ? props.images[0] 
//     : "https://picsum.photos/400/200?random=1"; // Placeholder if no image exists
// });

// Determine button color based on listing type
const buttonColor = computed(() => {
    return props.type === "auction" ? "#EBA92E" : "#35A45F";
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
    height: 80px;
    text-align: center;
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
