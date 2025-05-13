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
          <p class="title-paragraph">Listing Date:</p>
          <p class="last-text-paragraph">{{ listing.listingDate }}</p>
        </div>
      </div>
      <div class="right-column">
        <div class="info-container">
          <div v-if="isAuthenticated">
            <div v-if="isOwner">
              <p class="unauthenticated-message">You seem to be the owner.</p>
              <CustomButton :buttonText="'Go to Edit'" class="custom-btn" @activate="goToEditPage()" />
            </div>
            <div v-else>
              <div v-if="isRedeemed">
                <div v-if="isRedeemer">
                  <p class="unauthenticated-message">You are the redeemer.</p>
                  <NuxtLink to="/aquisitions">
                    <CustomButton :buttonText="'Go to Redeemed'" class="custom-btn" />
                  </NuxtLink>
                </div>
                <div v-else>
                  <p class="unauthenticated-message">You are late, the listing seems to be redeemed already.</p>
                </div>
              </div>
              <div v-else>
                <div v-if="isAuthFinish">
                  <NuxtLink to="/account">
                    <CustomButton :buttonText="'Go to Account'" class="custom-btn" />
                  </NuxtLink>
                  <p class="unauthenticated-message">One more step. You need to go to account and complete all the
                    informations.</p>
                </div>
                <div v-else>
                  <CustomButton :buttonText="'Redeem Listing'" class="custom-btn" @activate="redeemItem()" />
                  <p class="info-message">
                    Note: This will assign you as the redeemer of the listing for 2 days in which you have time to order
                    it trough postal office.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div v-else>
            <p class="unauthenticated-message">You need to be logged to redeem.</p>
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
        <p class="title-paragraph"><a :href="'tel:' + statistincs.phoneNumber">Phone Number: {{ statistincs.phoneNumber
            }}</a></p>
        <p class="title-paragraph">Rating: {{ statistincs.averageRating }}</p>
        <UTable v-if="statistincs.reviews?.length > 0" :rows="statistincs.reviews" sticky class="max-h-[200px] mt-4"
          :columns="[
            { key: 'message', label: 'Review' },
            { key: 'writerEmail', label: 'Reviewer' },
            { key: 'rating', label: 'Rating' }
          ]" @select="goToReviewerPage" />
        <p v-else class="text-gray-500 mt-4">No reviews for this seller yet.</p>

      </div>
    </div>
    <!-- Validation Popup -->
    <PopupDialog :visible="isValidationPopupVisible" message="Congrats you redeemed the item!"
      @cancel="closeValidationPopup" />
  </div>
</template>

<script setup>
definePageMeta({
  colorMode: 'light',
});
import { useRoute } from 'vue-router';
import { useAuth } from '~/utils/useAuth';
import { useState } from "#app";
import PopupDialog from '~/components/PopupDialog.vue'
import { watch } from 'vue'
import { useWebSocket } from '~/utils/useWebSocket'

const { lastMessage } = useWebSocket()

watch(lastMessage, (msg) => {
  if (msg && msg.type === 'dontion') {
    if (msg.listing == listing.value.listingID) {
      fetchListings();
    }
  }
})

const route = useRoute();
const isLoading = ref(true);
const config = useRuntimeConfig().public;
const listing = ref([]);
const isAuthenticated = ref(false);
const isOwner = ref(false);
const isValidationPopupVisible = ref(false);
const isRedeemed = ref(false);
const isRedeemer = ref(false);
const informations = ref([]);
const isAuthFinish = ref(false);
const verifyAttributes = ref({});

const selectedListing = useState("selectedListing");
const router = useRouter();

const auth = ref({ isAuthenticated: false, userID: '', userEmail: '', token: '' })

function goToEditPage() {
  selectedListing.value = listing.value;
  router.push(`/edit/${listing.value.listingID}`);
}

const statistincs = ref([]);

async function redeemItem() {
  try {
    const response = await fetch(`${config.api_url}/listings/listing/donation`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json', 'Authorization': `${auth.value.token}` },
      body: JSON.stringify({
        body: JSON.stringify({
          listingID: listing.value.listingID,
          sellerEmail: listing.value.sellerEmail,
          sub: auth.value.userID,
          redeemerEmail: auth.value.userEmail,
          name: listing.value.name
        })
      })
    });

    if (!response.ok) {
      throw new Error("Failed to redeem listing");
    }

    console.log("Listing redeemed successfully");
    isValidationPopupVisible.value = true;
  } catch (error) {
    console.error("Error redeeming listing:", error);
  }
}

const items = [
  'https://picsum.photos/1920/1080?random=1',
  'https://picsum.photos/1920/1080?random=2',
  'https://picsum.photos/1920/1080?random=3'
]

function goToReviewerPage(row) {
  if (row?.writerEmail) {
    router.push(`/reviews/${row.writerEmail}`);
  }
}

const listingImages = computed(() => {
  return items;
});

// Get the first image from the list or use a placeholder if none exists
// const listingImages = computed(() => {
//   return Array.isArray(listing.value.images)
//     ? listing.value.images
//     : "https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png?20210521171500"; // Placeholder if no image exists
// });

async function fetchListings() {
  isLoading.value = true;

  if (!auth.value.isAuthenticated) {
    isAuthenticated.value = false;
    return;
  }

  isAuthenticated.value = true;

  try {
    // Fetch user address-related attributes
    const response = await fetch(`${config.api_url}/user/informations?userID=${auth.value.userID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${auth.value.token}`
      }
    });

    const data = await response.json();
    informations.value = JSON.parse(data.body);

    verifyAttributes.value = {
      country: informations.value.country || '',
      county: informations.value.county || '',
      city: informations.value.city || '',
      address: informations.value.address || '',
      postalCode: informations.value.postalCode || ''
    };

    isAuthFinish.value = Object.values(verifyAttributes.value).some(attr => attr.trim() === '');

    const listingResponse = await fetch(`${config.api_url}/listings/listing?listingID=${route.params.id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    listing.value = JSON.parse((await listingResponse.json()).body);

    try {
      const reviewsResponse = await fetch(`${config.api_url}/user/review?userEmail=${listing.value.sellerEmail}`, {
        method: 'GET'
      });

      const reviewsData = await reviewsResponse.json();
      statistincs.value = JSON.parse(reviewsData.body);
    } catch (error) {
      console.error('Error fetching seller reviews:', error);
    }

  } catch (error) {
    console.error("Error fetching listing or user info:", error);
    listing.value = [];
  } finally {
    isLoading.value = false;

    console.log("This is current user email ", auth.value.userEmail);
    console.log("This is seller email ", listing.value.sellerEmail);

    isOwner.value = auth.value.userEmail === listing.value.sellerEmail;

    if (listing.value.redeemerEmail) {
      isRedeemed.value = true;
      isRedeemer.value = auth.value.userEmail === listing.value.redeemerEmail;
    } else {
      isRedeemed.value = false;
    }
  }
}

function closeValidationPopup() {
  isValidationPopupVisible.value = false;
  location.reload();
}

onMounted(async () => {
  auth.value = await useAuth();
  fetchListings();
});
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

.text-paragraph {
  text-align: left;
  font-size: 16px;
  margin-bottom: 25px;
}

.last-text-paragraph {
  text-align: left;
  font-size: 16px;
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
