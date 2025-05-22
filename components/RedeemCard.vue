<template>
    <div class="listing-card relative">
        <div v-if="isDisabled" class="overlay">
            <div class="overlay-message">Not longer available for order</div>
        </div>
        <div class="image-container">
            <img :src="firstImage" class="listing-image">
        </div>

        <div class="info-section">
            <h2 class="listing-title">{{ listing.name }}</h2>
            <p class="listing-type">{{ listing.type.toUpperCase() }}</p>
            <p class="listing-type">{{ listing.status.toUpperCase() }}</p>
        </div>

        <div class="action-section">
            <button v-if="isRedeemed" class="button-style" :style="{ backgroundColor: buttonColor }"
                @click="orderProduct" :disabled="isDisabled">
                Order
            </button>
            <div v-if="isOrdered">
                <div class="info-section">
                    <p class="paragraph-style">AWB {{ order.awb }}</p>
                    <p class="paragraph-style" v-if="timeLeft && !timeLeft.ended">
                        Time until you can review the seller:
                        <span v-if="timeLeft.days > 0">
                            {{ timeLeft.days }} day<span v-if="timeLeft.days !== 1">s</span>,
                            {{ timeLeft.hours }} hour<span v-if="timeLeft.hours !== 1">s</span>
                        </span>
                        <span v-else>
                            {{ timeLeft.hours.toString().padStart(2, '0') }}:
                            {{ timeLeft.minutes.toString().padStart(2, '0') }}:
                            {{ timeLeft.seconds.toString().padStart(2, '0') }}
                        </span>
                    </p>
                    <div v-else-if="timeLeft?.ended">
                        <button v-if="!order.sellerReviewed" class="button-style"
                            :style="{ backgroundColor: buttonColor }" @click="reviewSeller">
                            Review the seller
                        </button>
                        <p v-else>Seller reviewed</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- Confirmation Popup for Deletion -->
    <div v-if="isConfirmationVisible" class="popup">
        <div class="popup-content">
            <p class="attribute-key">Are you sure you want to order this item? This will trigger a generation of AWB
                and
                bouth you and the seller will recive an email with the inforamtions about the shpping details.</p>
            <CustomButton :buttonText="'Yes, Confirm'" class="custom-btn" @activate="confirmOrder" />
            <CustomButton :buttonText="'Cancel'" class="custom-btn cancel-btn" @activate="cancelOrder" />
        </div>
    </div>
    <!-- Review Popup -->
    <div v-if="isDisplayReviewVisible" class="popup">
        <div class="popup-content">
            <div class="form-group">
                <label class="attribute-key" for="description">Message</label>
                <textarea v-model="description" id="description" rows="4" class="attribute-input" />
            </div>

            <div class="form-group">
                <label class="attribute-key">Rating</label>
                <div class="rating-container">
                    <div v-for="num in 5" :key="num" class="rating-circle" :class="{ selected: rating === num }"
                        @click="setRating(num)">
                        {{ num }}
                    </div>
                </div>
            </div>

            <CustomButton :buttonText="'Yes, Confirm'" class="custom-btn" @activate="confirmReview" />
            <CustomButton :buttonText="'Cancel'" class="custom-btn cancel-btn" @activate="cancelReview" />
        </div>
    </div>
</template>


<script setup>
import { computed } from 'vue';
import { fetchUserAttributes, fetchAuthSession } from 'aws-amplify/auth';
import { DateTime } from 'luxon';

const now = ref(DateTime.now());

const props = defineProps({
    listing: Object,
});

const config = useRuntimeConfig().public;
const isConfirmationVisible = ref(false);
const order = ref([]);
const isRedeemed = ref(false);
const isOrdered = ref(false);
const userID = ref('');
const isDisplayReviewVisible = ref(false);
const listingID = ref('');

const description = ref('');
const rating = ref(0);

const setRating = (value) => {
    rating.value = value;
};

const timeLeft = computed(() => {
    if (order.value.expirationDate) {
        const end = DateTime.fromISO(order.value.expirationDate);
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

const isDisabled = computed(() => {
    console.log("Disable running");
    if (!props.listing.endDate) return true;
    if (props.listing.status !== 'redeemed') return false;
    const endDatePlusTwoDays = DateTime.fromISO(props.listing.endDate).plus({ days: 2 });
    return endDatePlusTwoDays < now.value;
});

let interval;
onMounted(() => {
    interval = setInterval(() => {
        now.value = DateTime.now();
    }, 1000);
});

onUnmounted(() => {
    clearInterval(interval);
});

async function verifyStauts() {
    if (props.listing.status === "redeemed") {
        isRedeemed.value = true;
    } else {
        isRedeemed.value = false;
        if (props.listing.status === "ordered") {
            isOrdered.value = true;
            try {
                const attributes = await fetchUserAttributes();
                const session = await fetchAuthSession();
                const token = session.tokens.idToken.toString();
                console.log(props.listing.listingID);
                userID.value = attributes.sub;
                const response = await fetch(`${config.api_url}/user/orders?orderID=${props.listing.listingID}&userID=${userID.value}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `${token}` },
                });

                const data = await response.json();
                order.value = JSON.parse(data.body);
                console.log("Order found: ", order.value);
            } catch (error) {
                console.error("Error fetching order: ", error);
            }
        } else {
            isOrdered.value = false;
        }

    }
}

async function createOrder() {
    try {
        const attributes = await fetchUserAttributes();
        const session = await fetchAuthSession();
        const token = session.tokens.idToken.toString();
        userID.value = attributes.sub;
        const response = await fetch(`${config.api_url}/user/orders`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json', 'Authorization': `${token}` },
            body: JSON.stringify({
                body: JSON.stringify({
                    listingID: props.listing.listingID,
                    sellerEmail: props.listing.sellerEmail,
                    redeemerEmail: props.listing.redeemerEmail,
                    sub: userID.value,
                })
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to create order");
        }

        console.log("Order made successfully");
        location.reload();
    } catch (error) {
        console.error("Error creating order:", error);
    }
}

async function createReview() {
    try {
        const attributes = await fetchUserAttributes();
        const session = await fetchAuthSession();
        const token = session.tokens.idToken.toString();
        userID.value = attributes.sub;
        listingID.value = `${props.listing.listingID}`;
        const response = await fetch(`${config.api_url}/user/review`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json', 'Authorization': `${token}` },
            body: JSON.stringify({
                body: JSON.stringify({
                    writerEmail: props.listing.redeemerEmail,
                    listingID: listingID.value,
                    message: description.value,
                    rating: rating.value,
                    sub: userID.value,
                })
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to create review");
        }

        console.log("Review made successfully");
        location.reload();
    } catch (error) {
        console.error("Error creating review:", error);
    }
}

function reviewSeller() {
    isDisplayReviewVisible.value = true;
}

function confirmReview() {
    isDisplayReviewVisible.value = false;
    createReview();
}

function cancelReview() {
    isDisplayReviewVisible.value = false;
}


function orderProduct() {
    isConfirmationVisible.value = true;
}

function confirmOrder() {
    isConfirmationVisible.value = false;
    createOrder();
}

function cancelOrder() {
    isConfirmationVisible.value = false;
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

onMounted(verifyStauts);
</script>

<style scoped>
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(180, 180, 180, 0.5);
  backdrop-filter: blur(2px);
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: all;
}

.overlay-message {
  color: white;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  padding: 12px 20px;
  border-radius: 8px;
}

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

.paragraph-style {
    font-size: 12px;
    text-align: center;
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

.button-style {
    width: 100%;
    margin-top: 8px;
    padding: 8px;
    font-size: 14px;
    font-weight: bold;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.button-style:hover {
    opacity: 0.85;
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

.attribute-input {
    width: 100%;
    padding: 8px;
    border: 1.5px solid #8e8d8d;
    font-size: 16px;
    box-sizing: border-box;
    margin-bottom: 8px;
}

.rating-container {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 12px;
}

.rating-circle {
    width: 40px;
    height: 40px;
    background-color: #e0e0e0;
    border-radius: 50%;
    text-align: center;
    line-height: 40px;
    font-weight: bold;
    cursor: pointer;
    transition: 0.2s;
    user-select: none;
}

.rating-circle.selected {
    background-color: #2596be;
    color: white;
}
</style>
