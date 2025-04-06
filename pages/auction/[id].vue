<template>
  <div class="listing-root">
    <div class="container">
      <div v-if="isLoading" class="loading-container">
        <p>Loading donation listings...</p>
      </div>
      <p class="name-paragraph">{{ listing.name }}</p>
      <UCarousel v-slot="{ item }" :items="listingImages" :ui="{ item: 'basis-full' }"
        class="overflow-hidden max-w-full mb-[40px]" arrows>
        <img :src="item" class="w-full m-h-[500px] object-center" draggable="false">
      </UCarousel>
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
    </div>
    <div class="content-container">
      <div class="left-column">
        <div class="info-container">
          <p class="title-paragraph">Description:</p>
          <p class="text-paragraph">{{ listing.description }}</p>
          <p class="title-paragraph">Status:</p>
          <p class="text-paragraph">{{ listing.status }}</p>
          <p class="title-paragraph">Type:</p>
          <p class="text-paragraph">{{ listing.type }}</p>
          <p class="title-paragraph">Category:</p>
          <p class="last-text-paragraph">{{ listing.category }}</p>
        </div>
      </div>
      <div class="right-column">
        <div class="info-container">
          <div v-if="listing.type === 'auction'" class="bids-table">
            <h2 class="text-xl font-semibold mt-4 mb-2">Bids</h2>
            <UTable v-if="listing.bids.length > 0" :rows="listing.bids" sticky class="max-h-[200px]"
              :columns="[{ key: 'bidderEmail', label: 'Bidder' }, { key: 'amount', label: 'Amount' }, { key: 'time', label: 'Date' }]" />
            <p v-else class="text-gray-500">No bids have been placed yet for this acution.</p>
          </div>
          <div v-if="isAuthenticated">
            <div v-if="isOwner">
              <p>You seem to be the owner.</p>
              <CustomButton :buttonText="'Go to Edit'" class="custom-btn" @activate="goToEditPage()" />
            </div>
            <div v-else>
              <div v-if="isRedeemed">
                <div v-if="isRedeemer">
                  <p>You are the redeemer.</p>
                </div>
                <div v-else>
                  <p>You are late, the listing seems to be redeemed already.</p>
                </div>
              </div>
              <div v-else>
                <div v-if="isHighestBidder">
                  <p>You are the highest bidder.</p>
                </div>
                <div v-else class="content-container">
                  <div v-if="isAuthFinish">
                    <NuxtLink to="/account">
                      <CustomButton :buttonText="'Go to Account'" class="custom-btn" />
                    </NuxtLink>
                    <p class="unauthenticated-message">One more step. You need to go to account and complete all the
                      informations.</p>
                  </div>
                  <div v-if="!isAuthFinish" class="left-column">
                    <input v-model="bidAmount" type="text" placeholder="Input amount" class="attribute-input">
                  </div>
                  <div v-if="!isAuthFinish" class="right-column">
                    <CustomButton :buttonText="'Bid'" class="custom-btn" @activate="bidOnItem()" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else>
            <p>You need to be logged to bid.</p>
            <NuxtLink to="/account">
              <CustomButton :buttonText="'Go to Account'" class="custom-btn" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
    <div class="content-container">
      <div class="large-info-container">
        <p class="title-paragraph">Seller: {{ listing.sellerEmail }}</p>
        <p class="title-paragraph">Rating: {{ statistincs.averageRating }}</p>
        <UTable v-if="statistincs.reviews?.length > 0" :rows="statistincs.reviews" sticky class="max-h-[200px] mt-4" :columns="[
          { key: 'message', label: 'Message' },
          { key: 'writerEmail', label: 'Reviewer' },
          { key: 'rating', label: 'Rating' }
        ]" />
        <p v-else class="text-gray-500 mt-4">No reviews for this seller yet.</p>

      </div>
    </div>
    <!-- Validation Popup -->
    <div v-if="isValidationPopupVisible" class="popup">
      <div class="popup-content">
        <p class="attribute-key">Congrats you are the higher bidder!</p>
        <CustomButton :buttonText="'Close'" class="custom-btn" @activate="closeValidationPopup" />
      </div>
    </div>
    <!-- Small bid Popup -->
    <div v-if="isBidTooSmall" class="popup">
      <div class="popup-content">
        <p class="attribute-key">The bid is lower then the higher existing one!</p>
        <CustomButton :buttonText="'Close'" class="custom-btn" @activate="closeBidTooSmallPopup" />
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  colorMode: 'light',
});
import { useRoute } from 'vue-router';
import { fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth';
import { useState } from "#app";
import { DateTime } from 'luxon';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { watch } from 'vue'
import { useWebSocket } from '~/utils/useWebSocket'

const { lastMessage } = useWebSocket()

watch(lastMessage, (msg) => {
  if (msg && msg.type === 'auction') {
    if (msg.listing == listing.value.listingID) {
      fetchListings();
    }
  }
})

const route = useRoute();
const isLoading = ref(true);
const config = useRuntimeConfig().public;
const listing = ref([]);
const listingID = ref("");
const isAuthenticated = ref(false);
const sub = ref('');
const userEmail = ref('');
const isOwner = ref(false);
const isRedeemed = ref(false);
const isRedeemer = ref(false);
const isHighestBidder = ref(false);
const bidAmount = ref('');
const isValidationPopupVisible = ref(false);
const isBidTooSmall = ref(false);
const informations = ref([]);
const isAuthFinish = ref(false);
const verifyAttributes = ref({});


const now = ref(DateTime.now());

const selectedListing = useState("selectedListing");
const router = useRouter();

function goToEditPage() {
  selectedListing.value = listing.value;
  router.push(`/edit/${listing.value.listingID}`);
}

const items = [
  'https://picsum.photos/1920/1080?random=1',
  'https://picsum.photos/1920/1080?random=2',
  'https://picsum.photos/1920/1080?random=3'
]

const listingImages = computed(() => {
  return items;
});

// Get the first image from the list or use a placeholder if none exists
// const listingImages = computed(() => {
//   return Array.isArray(listing.value.images)
//     ? listing.value.images
//     : "https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png?20210521171500"; // Placeholder if no image exists
// });

const timeLeft = computed(() => {
  if (listing.value.endDate) {
    const end = DateTime.fromISO(listing.value.endDate);
    const diff = end.diff(now.value, ['days', 'hours', 'minutes', 'seconds']).toObject();

    if (end <= now.value) {
      return { ended: true };
    }

    return {
      days: Math.floor(diff.days || 0),
      hours: Math.floor(diff.hours || 0),
      minutes: Math.floor(diff.minutes || 0),
      seconds: Math.floor(diff.seconds || 0),
      ended: false,
    };
  }
  return null;
});

const statistincs = ref([]);

async function getSellerReviews(email) {
  try {
    const session = await fetchAuthSession()
    const token = session.tokens.idToken.toString()

    const response = await fetch(`${config.api_url}/user/review?userEmail=${email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`
      }
    })

    const data = await response.json()
    statistincs.value = JSON.parse(data.body)
    console.log(statistincs.value);
  } catch (error) {
    console.error('Error fetching seller reviews:', error)
  }
}

onMounted(() => {
  if (listing?.sellerEmail) {
    getSellerReviews(listing.sellerEmail)
  }
})

async function bidOnItem() {
  try {
    if (listing.value.bids.length > 0) {
      const highestBid = parseFloat(listing.value.bids[0].amount);
      const userBid = parseFloat(bidAmount.value);

      if (userBid <= highestBid) {
        isBidTooSmall.value = true;
        bidAmount.value = '';
        return;
      }
    }

    const session = await fetchAuthSession();
    const token = session.tokens.idToken.toString();
    const response = await fetch(`${config.api_url}/listings/listing/auction`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json', 'Authorization': `${token}` },
      body: JSON.stringify({
        body: JSON.stringify({
          listingID: listing.value.listingID,
          bidAmount: bidAmount.value,
          sub: sub.value,
          bidderEmail: userEmail.value,
          name: listing.value.name
        })
      })
    });

    if (!response.ok) {
      throw new Error("Failed to bid on listing");
    }

    console.log("Bid made successfully");
    isValidationPopupVisible.value = true;
  } catch (error) {
    console.error("Error bidding on listing:", error);
  }
}

async function fetchListings() {
  const session = await fetchAuthSession();
  if (session && session.tokens) {
    isAuthenticated.value = true;
    const token = session.tokens.idToken.toString();
    const attributes = await fetchUserAttributes();
    userEmail.value = attributes.email || '';
    sub.value = attributes.sub;
    const response = await fetch(`${config.api_url}/user/informations?userID=${sub.value}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `${token}` },
    });

    const data = await response.json();
    informations.value = JSON.parse(data.body);

    console.log(informations.value);

    verifyAttributes.value = {
      country: informations.value.country || '',
      county: informations.value.county || '',
      city: informations.value.city || '',
      address: informations.value.address || '',
      postalCode: informations.value.postalCode || ''
    };

    isAuthFinish.value = Object.values(verifyAttributes.value).some(attr => attr.trim() === '');
  } else {
    isAuthenticated.value = false;
  }
  isLoading.value = true;
  listingID.value = route.params.id;
  try {

    const response = await fetch(`${config.api_url}/listings/listing?listingID=${listingID.value}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    listing.value = JSON.parse(data.body);

    console.log(data);
    try {
      const response = await fetch(`${config.api_url}/user/review?userEmail=${listing.value.sellerEmail}`, {
        method: 'GET'
      })

      const data = await response.json()
      statistincs.value = JSON.parse(data.body)
      console.log(statistincs.value);
    } catch (error) {
      console.error('Error fetching seller reviews:', error)
    }
  } catch (error) {
    console.error("Error fetching listings:", error);
    lising.value = [];
  } finally {
    isLoading.value = false;
    console.log("This is current user email ", userEmail.value);
    console.log("This is seller email ", listing.value.sellerEmail);
    if (userEmail.value !== '') {
      if (userEmail.value === listing.value.sellerEmail) {
        isOwner.value = true;
      } else {
        isOwner.value = false;
      }
    } else {
      isOwner.value = false;
    }
    if (listing.value.redeemerEmail !== '') {
      if (userEmail.value === listing.value.redeemerEmail) {
        isRedeemer.value = true;
      } else {
        isRedeemer.value = false;
      }
      isRedeemed.value = true;
    } else {
      isRedeemed.value = false;
      if (listing.value.bids.length > 0)
        if (userEmail.value === listing.value.bids[0].bidderEmail) {
          isHighestBidder.value = true;
        } else {
          isHighestBidder.value = false;
        }
    }
  }
}

function closeValidationPopup() {
  isValidationPopupVisible.value = false;
  location.reload();
}

function closeBidTooSmallPopup() {
  isBidTooSmall.value = false;
}


let interval;
onMounted(() => {
  interval = setInterval(() => {
    now.value = DateTime.now();
  }, 1000);
});

onUnmounted(() => {
  clearInterval(interval);
});
onMounted(fetchListings);
</script>

<style scoped>
.container {
  max-width: 100%;
  padding-left: 20px;
  padding-right: 20px;
  text-align: center;
  margin-top: 40px;
  margin-bottom: 40px;
}

.content-container {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding-left: 20px;
  padding-right: 20px;
}

.title-paragraph {
  text-align: left;
  font-size: 16px;
  font-weight: bold;
}

.name-paragraph {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 40px;
}

.attribute-input {
  width: 100%;
  padding: 8px;
  border: 1.5px solid #8e8d8d;
  font-size: 16px;
  box-sizing: border-box;
  margin-bottom: 8px;
}

.popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
}

.popup-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  border: 1.5px solid #8e8d8d;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
}

.popup .custom-btn {
  margin-top: 16px;
  width: 100%;
}

.attribute-key {
  margin-bottom: 4px;
  font-size: 16px;
}

.text-paragraph {
  text-align: left;
  font-size: 16px;
  margin-bottom: 25px;
}

.last-text-paragraph {
  text-align: left;
  font-size: 16px;
}

.custom-btn {
  width: 100%;
}

.left-column,
.right-column {
  flex: 1;
  padding: 0 7.5px;
}

.info-container {
  border: 1.5px solid #8e8d8d;
  padding: 16px;
  margin-bottom: 16px;
}

.large-info-container {
  border: 1.5px solid #8e8d8d;
  margin-bottom: 16px;
  padding: 16px;
  margin: 0 7.5px;
  margin-bottom: 40px;
  width: 100%;
}

.info-message {
  text-align: left;
}

.custom-btn {
  width: 100%;
}

@media (max-width: 768px) {
  .content-container {
    flex-direction: column;
    align-items: center;
  }

  .left-column,
  .right-column {
    width: 100%;
  }

  .info-container {
    width: 100%;
  }
}
</style>
