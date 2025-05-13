<template>
    <div class="listing-card">
      <div class="image-container">
        <img :src="firstImage" class="listing-image" />
      </div>
  
      <div class="info-section">
        <h2 class="listing-title">{{ listing.name }}</h2>
        <p class="listing-type">{{ listing.status.toUpperCase() }}</p>
  
        <div v-if="showAuctionDetails">
          <p v-if="timeLeft && !timeLeft.ended">
            <span v-if="timeLeft.days > 0">
              Time left: {{ timeLeft.days }} day<span v-if="timeLeft.days !== 1">s</span>,
              {{ timeLeft.hours }} hour<span v-if="timeLeft.hours !== 1">s</span>
            </span>
            <span v-else>
              Time left: {{ timeLeft.hours.toString().padStart(2, '0') }}:
              {{ timeLeft.minutes.toString().padStart(2, '0') }}:
              {{ timeLeft.seconds.toString().padStart(2, '0') }}
            </span>
          </p>
          <p v-else-if="timeLeft?.ended">Auction Ended</p>
          <p v-if="listing.bids?.length" class="listing-type">
            Highest bid: {{ listing.bids[0].amount }} RON
          </p>
        </div>
      </div>
  
      <div class="action-section">
        <button class="show-more-btn" :style="{ backgroundColor: buttonColor }" @click="handleClick">
          {{ mode === 'edit' ? 'Edit Listing' : 'Show More' }}
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed, ref, onMounted, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useState } from '#app';
  import { DateTime } from 'luxon';
  
  const props = defineProps({
    listing: Object,
    mode: {
      type: String,
      default: 'view' // or 'edit'
    }
  });
  
  const now = ref(DateTime.now());
  const router = useRouter();
  const selectedListing = useState("selectedListing");
  
  const firstImage = computed(() => {
    return `https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png?20210521171500`;
  });
  
  const timeLeft = computed(() => {
    if (props.listing.type === 'auction' && props.listing.endDate) {
      const end = DateTime.fromISO(props.listing.endDate);
      const diff = end.diff(now.value, ['days', 'hours', 'minutes', 'seconds']).toObject();
  
      if (end <= now.value) return { ended: true };
  
      return {
        days: Math.floor(diff.days || 0),
        hours: Math.floor(diff.hours || 0),
        minutes: Math.floor(diff.minutes || 0),
        seconds: Math.floor(diff.seconds || 0),
        ended: false
      };
    }
    return null;
  });
  
  const buttonColor = computed(() => {
    return props.listing.type === 'auction' ? '#EBA92E' : '#35A45F';
  });
  
  const showAuctionDetails = computed(() => props.listing.type === 'auction');
  
  function handleClick() {
    selectedListing.value = props.listing;
    if (props.mode === 'edit') {
      router.push(`/edit/${props.listing.listingID}`);
    } else {
      router.push(`/${props.listing.type}/${props.listing.listingID}`);
    }
  }
  
  if (props.listing.type === 'auction') {
    let interval;
    onMounted(() => {
      interval = setInterval(() => {
        now.value = DateTime.now();
      }, 1000);
    });
    onUnmounted(() => {
      clearInterval(interval);
    });
  }
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
  