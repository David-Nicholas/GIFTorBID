<template>
    <div class="post-root">
        <!-- Add Listing Form -->
        <div class="main-container">
            <div class="content-container">
                <div class="info-container">
                    <p class="title-style">View</p>
                    <p class="paragraph-style">STATUS: {{ listing.status.toUpperCase() }}</p>
                    <form @submit.prevent="handleSubmit">
                        <div class="form-group">
                            <label class="attribute-key" for="name">Listing Name</label>
                            <input v-model="form.name" type="text" id="name" class="attribute-input" />
                        </div>

                        <div class="form-group">
                            <label class="attribute-key" for="description">Description</label>
                            <textarea v-model="form.description" id="description" rows="4"
                                class="attribute-input"></textarea>
                        </div>

                        <div class="form-group">
                            <label class="attribute-key">Category</label>
                            <input v-model="listing.category" type="text" class="attribute-input" disabled />
                        </div>

                        <div class="form-group">
                            <label class="attribute-key" for="winnerEmail">Winner Email</label>
                            <input v-model="listing.redeemerEmail" type="text" id="winnerEmail" class="attribute-input"
                                disabled :placeholder="winnerPlaceholder" />
                        </div>

                        <!-- Auction-specific fields -->
                        <div v-if="listing.type === 'auction'" class="auction-fields">
                            <div class="form-group">
                                <label class="attribute-key">Listing Date</label>
                                <input v-model="listing.listingDate" type="text" class="attribute-input" disabled />
                            </div>

                            <div class="form-group">
                                <label class="attribute-key">End Date</label>
                                <input v-model="listing.endDate" type="text" class="attribute-input" disabled />
                            </div>

                            <div class="form-group">
                                <label class="attribute-key">Duration (days)</label>
                                <input v-model="listing.duration" type="text" class="attribute-input" disabled />
                            </div>


                            <!-- Auction Bids Table -->
                            <div v-if="listing.type === 'auction'" class="bids-table">
                                <h2 class="text-xl font-semibold mt-4 mb-2">Bids</h2>

                                <UTable v-if="bids.length > 0" :rows="listing.bids" sticky class="max-h-[200px]"
                                    :columns="[{ key: 'bidderEmail', label: 'Bidder' }, { key: 'amount', label: 'Amount' }, { key: 'time', label: 'Date' }]"
                                    @select="goToReviewerPage" />

                                <p v-else class="text-gray-500">No bids have been placed yet for this acution.</p>
                            </div>

                        </div>

                        <div class="form-group">
                            <label class="attribute-key">Upload Images (Max 3) / Current: {{ listing.images.length
                            }}</label>
                            <input type="file" accept="image/jpeg, image/png" multiple @change="handleImageUpload"
                                class="attribute-input" />
                            <div v-if="imagePreviews.length" class="image-preview-container">
                                <img v-for="(image, index) in imagePreviews" :key="index" :src="image"
                                    class="image-preview" />
                            </div>
                        </div>

                        <div v-if="!isRedeemed" class="form-group">
                            <CustomButton :buttonText="'Save Changes'" class="custom-btn" @activate="updateListing" />
                            <CustomButton :buttonText="'Delete Listing'" class="custom-btn custom-btnDelete"
                                @activate="deleteListing" />
                        </div>
                    </form>
                </div>
                <div v-if="listing.redeemerEmail" class="info-container">
                    <div v-if="!order.redeemerReviewed" class="large-info-container">
                        <p class="title-paragraph">Winner: {{ listing.redeemerEmail }}</p>
                        <p class="title-paragraph"><a :href="'tel:' + statistincs.phoneNumber">Phone Number: {{
                            statistincs.phoneNumber }}</a></p>
                        <p class="title-paragraph">Rating: {{ statistincs.averageRating }}</p>
                        <UTable v-if="statistincs.reviews?.length > 0" :rows="statistincs.reviews" sticky
                            class="max-h-[200px] mt-4" :columns="[
                                { key: 'message', label: 'Review' },
                                { key: 'writerEmail', label: 'Reviewer' },
                                { key: 'rating', label: 'Rating' }
                            ]" @select="goToReviewerPage" />
                        <p v-else class="text-gray-500 mt-4">No reviews for this seller yet.</p>
                    </div>
                    <div v-if="!isComplete">
                        <br>
                        <br>
                        <div v-if="isLowRating">
                            <div v-if="!order.redeemerReviewed">
                                <p>The redeemer rating is considered to be low you have the right to refuse him/her if
                                    you
                                    want.</p>
                                <CustomButton :buttonText="'Refuse Redeemer'" class="custom-btn"
                                    @activate="refuseRedeemer" />
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="isOrdered" class="info-container">
                    <p class="title-style">Order info</p>
                    <p class="paragraph-style">AWB {{ order.awb }}</p>
                    <p class="paragraph-style" v-if="timeLeft && !timeLeft.ended">
                        Time until you can review the redeemer:
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
                        <button v-if="!order.redeemerReviewed" class="button-style"
                            :style="{ backgroundColor: buttonColor }" @click="reviewSeller">
                            Review the redeemer
                        </button>
                        <p v-else class="paragraph-style">Redeemer reviewed</p>
                    </div>
                </div>

                <div v-if="isNotOrdered" class="info-container">
                    <div v-if="!order.redeemerReviewed">
                        <p>Looks like the 2 days time for the redeemer to order the item have passed</p>
                        <button class="button-style" :style="{ backgroundColor: buttonColor }" @click="reviewSeller">
                            Review the redeemer
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Validation Popup -->
        <PopupDialog :visible="isValidationPopupVisible"
            message="Please fill out Object Name and Description before submitting." @cancel="closeValidationPopup" />

        <!-- Confirmation Popup for Deletion -->
        <PopupDialog :visible="isDeletionConfirmationVisible"
            message="Are you sure you want to delete this item? This action cannot be undone."
            confirmText="Yes, Confirm" cancelText="Cancel" @confirm="confirmDeletion" @cancel="cancelDeletion" />

        <!-- Confirmation Popup for Change -->
        <PopupDialog :visible="isChangeConfirmationVisible" message="Are you sure you want to change this item?"
            confirmText="Yes, Confirm" cancelText="Cancel" @confirm="confirmChange" @cancel="cancelChange" />

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
    </div>
</template>

<script setup>
definePageMeta({
    colorMode: 'light',
    layout: "custom"
});

import { useState } from "#app";
import { useRouter } from "vue-router";
import { ref, computed } from 'vue';
import PopupDialog from '~/components/PopupDialog.vue'
import { DateTime } from 'luxon';
import { useAuth } from '~/utils/useAuth'

const now = ref(DateTime.now());

const router = useRouter();
const selectedListing = useState("selectedListing");
const config = useRuntimeConfig().public;
const userPosts = ref(0);
const imagePreviews = ref([]);
const isRedeemed = ref(false);
const isOrdered = ref(false);
const isComplete = ref(false);
const isDisplayReviewVisible = ref(false);
const listingID = ref('');
const statistincs = ref([]);
const isLowRating = ref(false);

const description = ref('');
const rating = ref(0);

const auth = ref({ isAuthenticated: false, userID: '', userEmail: '', token: '' })

function goToReviewerPage(row) {
    if (row?.bidderEmail) {
        router.push(`/reviews/${row.bidderEmail}`);
    }
}

const setRating = (value) => {
    rating.value = value;
};

if (!selectedListing.value) {
    console.error("No listing found in state. Redirecting...");
    router.push("/posts");
}

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

const isNotOrdered = computed(() => {
    if (listing.value.status !== 'redeemed') return false;
    const endDatePlusTwoDays = DateTime.fromISO(listing.value.endDate).plus({ days: 2 });
    return endDatePlusTwoDays < now.value;
});

onUnmounted(() => {
    clearInterval(interval);
});

const listing = ref(selectedListing.value);
const order = ref([]);

const form = ref({
    name: listing.value.name,
    description: listing.value.description,
    images: [],
});

const isValidationPopupVisible = ref(false);
const isDeletionConfirmationVisible = ref(false);
const isChangeConfirmationVisible = ref(false);

const winnerPlaceholder = computed(() => {
    if (listing.value.type === "donation") return "No user redeemed this item";
    return "The auction is not yet finished";
});

const bids = computed(() => {
    if (listing.value.bids && listing.value.bids.length > 0) {
        return listing.value.bids.map(bid => ({
            bidder: bid.bidder || "Unknown",
            amount: `${bid.amount || "0.00"} RON`,
            date: bid.date || "Unknown date"
        }));
    }
    return [];
});

const buttonColor = computed(() => {
    return listing.type === "auction" ? "#EBA92E" : "#35A45F";
});

async function verifyStauts() {
    if (listing.value.status === "available") {
        isRedeemed.value = false;
    } else {
        isRedeemed.value = true;
        try {
            const response = await fetch(`${config.api_url}/user/review?userEmail=${listing.value.redeemerEmail}`, {
                method: 'GET'
            })

            const data = await response.json()
            statistincs.value = JSON.parse(data.body)
            console.log(statistincs.value);
            if (statistincs.value.averageRating < 4.0 && statistincs.value.averageRating != 0) {
                isLowRating.value = true;
            }
        } catch (error) {
            console.error('Error fetching seller reviews:', error)
        }
        if (listing.value.status === "ordered") {
            isOrdered.value = true;
            try {
                const response = await fetch(`${config.api_url}/user/orders?orderID=${listing.value.listingID}&userID=${auth.value.userID}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `${auth.value.token}` },
                });
                const data = await response.json();
                console.log("Reponse found: ", data);
                order.value = JSON.parse(data.body);
                console.log("Order found: ", order.value);
            } catch (error) {
                console.error("Error fetching order: ", error);
            }
        } else {
            isOrdered.value = false;
            if (listing.value.status === "complete") {
                isComplete.value = true;
            } else {
                isComplete.value = false;
            }
        }
    }
}

async function createReview() {
    try {
        listingID.value = `${listing.value.listingID}`;
        const response = await fetch(`${config.api_url}/user/review`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json', 'Authorization': `${auth.value.token}` },
            body: JSON.stringify({
                body: JSON.stringify({
                    writerEmail: userEmail.value,
                    listingID: listingID.value,
                    message: description.value,
                    rating: rating.value,
                    sub: auth.value.userID,
                })
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to create review");
        }

        console.log("Review made successfully");
        order.value.redeemerReviewed = true;
        listing.value.status = "available";
        listing.value.redeemerEmail = "";
    } catch (error) {
        console.error("Error creating review:", error);
    }
}



async function refuseRedeemer() {
    try {
        listingID.value = `${listing.value.listingID}`;
        const response = await fetch(`${config.api_url}/user/listings/listing/refuse`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json', 'Authorization': `${auth.value.token}` },
            body: JSON.stringify({
                body: JSON.stringify({
                    listingID: listingID.value,
                    sellerEmail: listing.value.sellerEmail,
                    redeemerEmail: listing.value.redeemerEmail,
                    sub: auth.value.userID,
                })
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to refuse redeemer");
        }

        console.log("Refusal made successfully");
        order.value.redeemerReviewed = true;
        listing.value.status = "available";
        listing.value.redeemerEmail = "";
    } catch (error) {
        console.error("Error creating refusal:", error);
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

async function deleteListingTrigger() {
    try {
        const response = await fetch(`${config.api_url}/user/listings/listing`, {
            method: "DELETE",
            headers: { 'Content-Type': 'application/json', 'Authorization': `${auth.value.token}` },
            body: JSON.stringify({
                body: JSON.stringify({
                    listingID: listing.value.listingID,
                    sellerEmail: listing.value.sellerEmail,
                    sub: auth.value.userID
                })
            })
        });

        if (!response.ok) {
            throw new Error("Failed to delete listing");
        }

        console.log("Listing deleted successfully");
        const newPostCount = userPosts.value ? parseInt(userPosts.value, 10) - 1 : 1;
        router.push("/posts");
    } catch (error) {
        console.error("Error deleting listing:", error);
    }
}

function handleImageUpload(event) {
    const files = event.target.files;
    if (files.length > 3) {
        alert('You can upload up to 3 images only.');
        return;
    }

    form.value.images = [];
    imagePreviews.value = [];

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            compressImage(reader.result, (compressedBase64) => {
                form.value.images.push(compressedBase64);
                imagePreviews.value.push(compressedBase64);
            });
        };
    });
}

function compressImage(base64Str, callback) {
    const img = new Image();
    img.src = base64Str;
    img.onload = function () {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxWidth = 800;
        const scaleSize = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scaleSize;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        callback(canvas.toDataURL('image/jpeg', 0.7));
    };
}

async function changeListingTrigger() {
    try {
        const response = await fetch(`${config.api_url}/user/listings/listing`, {
            method: "PUT",
            headers: { 'Content-Type': 'application/json', 'Authorization': `${auth.value.token}` },
            body: JSON.stringify({
                body: JSON.stringify({
                    listingID: listing.value.listingID,
                    sellerEmail: listing.value.sellerEmail,
                    sub: auth.value.userID,
                    description: form.value.description,
                    name: form.value.name,
                    images: form.value.images,
                })
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to change listing");
        }

        console.log("Listing changed successfully");
        router.push("/posts");
    } catch (error) {
        console.error("Error changing listing:", error);
    }
}

function updateListing() {
    if (!form.name || !form.description) {
        isChangeConfirmationVisible.value = true;
    }
}

function confirmChange() {
    isChangeConfirmationVisible.value = false;
    changeListingTrigger();
}

function cancelChange() {
    isChangeConfirmationVisible.value = false;
}

function deleteListing() {
    isDeletionConfirmationVisible.value = true;
}

function confirmDeletion() {
    isDeletionConfirmationVisible.value = false;
    deleteListingTrigger();
}

function cancelDeletion() {
    isDeletionConfirmationVisible.value = false;
}

function closeValidationPopup() {
  isValidationPopupVisible.value = false;
}

onMounted(async () => {
    auth.value = await useAuth()
    verifyStauts()
});

</script>

<style scoped>
.custom-dropdown {
    width: 100%;
    padding: 8px;
    border: 1.5px solid #8e8d8d;
    font-size: 16px;
    box-sizing: border-box;
    cursor: pointer;
    background-color: white;
    text-align: left;
    margin-bottom: 8px;
}

.dropdown-options {
    position: absolute;
    width: 100%;
    background: white;
    border: 1px solid #8e8d8d;
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 150px;
    max-width: 549px;
    overflow-y: auto;
    z-index: 10;
}

.dropdown-options li {
    padding: 8px;
    cursor: pointer;
    border-bottom: 1px solid #ddd;
}

.dropdown-options li:hover {
    background: #f2f2f2;
}

.main-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 15px;
}

.content-container {
    justify-content: center;
    width: 98%;
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

.info-container {
    margin-top: 40px;
    margin-bottom: 40px;
    width: 100%;
    border: 1.5px solid #8e8d8d;
    padding: 16px;
    box-sizing: border-box;
    background-color: white;
    box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.1);
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

.image-preview-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;
}

.image-preview {
    width: 160px;
    height: 160px;
    object-fit: cover;
    border-radius: 4px;
}

.custom-btn {
    width: 100%;
    margin-top: 8px;
}

.custom-btnDelete {
    background-color: #EBA92E;
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

.title-style {
    font-size: 24px;
    margin-bottom: 16px;
    text-align: center;
}

.paragraph-style {
    font-size: 20px;
    margin-bottom: 16px;
    text-align: center;
}

.contact-form-status {
    font-size: 14px;
    margin-bottom: 16px;
    text-align: center;
}

.tabs-container {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
}

.tab {
    flex: 1;
    padding: 8px;
    text-align: center;
    border: 1.5px solid #8e8d8d;
    cursor: pointer;
    background-color: white;
}

.tab.active {
    background-color: #2596be;
    font-weight: bold;
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


@media (max-width: 768px) {
    .content-container {
        width: 100%;
    }
}
</style>