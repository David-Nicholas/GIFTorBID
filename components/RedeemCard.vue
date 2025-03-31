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
            <button v-if="isRedeemed" class="show-more-btn" :style="{ backgroundColor: buttonColor }"
                @click="orderProduct">
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

                    <p v-else-if="timeLeft?.ended">Review the seller</p>
                </div>
            </div>
        </div>
    </div>
    <!-- Confirmation Popup for Deletion -->
    <div v-if="isConfirmationVisible" class="popup">
        <div class="popup-content">
            <p class="attribute-key">Are you sure you want to order this item? This will trigger a generation of AWB and
                bouth you and the seller will recive an email with the inforamtions about the shpping details.</p>
            <CustomButton :buttonText="'Yes, Confirm'" class="custom-btn" @activate="confirmOrder" />
            <CustomButton :buttonText="'Cancel'" class="custom-btn cancel-btn" @activate="cancelOrder" />
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
        sub.value = attributes.sub;
        const response = await fetch(`${config.api_url}/user/orders`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json', 'Authorization': `${token}` },
            body: JSON.stringify({
                body: JSON.stringify({
                    listingID: props.listing.listingID,
                    sellerEmail: props.listing.sellerEmail,
                    redeemerEmail: props.listing.redeemerEmail,
                    sub: sub.value,
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

const firstImage = computed(() => {
    return `https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png?20210521171500`;
});

// Get the first image from the list or use a placeholder if none exists
// const firstImage = computed(() => {
//   return props.listing.images.length > 0
//     ? props.listing.images[0] 
//     : "https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png?20210521171500"; // Placeholder if no image exists
// });

const buttonColor = computed(() => {
    return props.listing.type === "auction" ? "#EBA92E" : "#35A45F";
});

onMounted(verifyStauts);
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
</style>
