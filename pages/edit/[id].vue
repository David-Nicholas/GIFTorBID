<template>
    <div class="post-root">
        <!-- Add Listing Form -->
        <div class="main-container">
            <div class="content-container">
                <div class="info-container">
                    <p class="contact-form-header">View and Edit Listing</p>
                    <form @submit.prevent="handleSubmit">
                        <div class="form-group">
                            <label class="attribute-key" for="objectName">Object Name</label>
                            <input v-model="form.objectName" type="text" id="objectName" class="attribute-input" />
                        </div>

                        <div class="form-group">
                            <label class="attribute-key" for="description">Description</label>
                            <textarea v-model="form.description" id="description" rows="4"
                                class="attribute-input"></textarea>
                        </div>

                        <div class="form-group">
                            <label class="attribute-key" for="winnerEmail">Winner Email</label>
                            <input v-model="listing.winnerEmail" type="text" id="winnerEmail" class="attribute-input"
                                disabled :placeholder="winnerPlaceholder" />
                        </div>

                        <!-- Auction-specific fields -->
                        <div v-if="listing.type === 'auction'" class="auction-fields">
                            <div class="form-group">
                                <label class="attribute-key">Start Date</label>
                                <input v-model="listing.startDate" type="text" class="attribute-input" disabled />
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

                                <UTable v-if="bids.length > 0" :rows="bids"
                                    :columns="[{ key: 'bidder', label: 'Bidder' }, { key: 'amount', label: 'Amount' }, { key: 'date', label: 'Date' }]" />

                                <p v-else class="text-gray-500">No bids have been placed yet for this acution.</p>
                            </div>

                        </div>

                        <div class="form-group">
                            <CustomButton :buttonText="'Save Changes'" class="custom-btn" @activate="updateListing" />
                            <CustomButton :buttonText="'Delete Listing'" class="custom-btnDelete"
                                @activate="deleteListing" />
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Validation Popup -->
        <div v-if="isValidationPopupVisible" class="popup">
            <div class="popup-content">
                <p class="attribute-key">Please fill out Object Name and Description before submitting.</p>
                <CustomButton :buttonText="'Close'" class="custom-btn" @activate="closeValidationPopup" />
            </div>
        </div>

        <!-- Confirmation Popup for Deletion -->
        <div v-if="isDeletionConfirmationVisible" class="popup">
            <div class="popup-content">
                <p class="attribute-key">Are you sure you want to delete this item? This action cannot be undone.</p>
                <CustomButton :buttonText="'Yes, Confirm'" class="custom-btn" @activate="confirmDeletion" />
                <CustomButton :buttonText="'Cancel'" class="custom-btn cancel-btn" @activate="cancelDeletion" />
            </div>
        </div>

        <!-- Confirmation Popup for Change -->
        <div v-if="isChangeConfirmationVisible" class="popup">
            <div class="popup-content">
                <p class="attribute-key">Are you sure you want to change this item?</p>
                <CustomButton :buttonText="'Yes, Confirm'" class="custom-btn" @activate="confirmChange" />
                <CustomButton :buttonText="'Cancel'" class="custom-btn cancel-btn" @activate="cancelChange" />
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
import { fetchUserAttributes, updateUserAttributes } from 'aws-amplify/auth';

const router = useRouter();
const selectedListing = useState("selectedListing");
const config = useRuntimeConfig().public;
const userPosts = ref(0);

if (!selectedListing.value) {
    console.error("No listing found in state. Redirecting...");
    router.push("/posts");
}


const listing = ref(selectedListing.value);

const form = ref({
    objectName: listing.value.objectName,
    description: listing.value.description,
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


async function fetchAndSetUserAttributes() {
  try {
    const attributes = await fetchUserAttributes();
    userPosts.value = attributes["custom:posts"] ? parseInt(attributes["custom:posts"], 10) : 0;
  } catch (error) {
    console.error('Error fetching user attributes:', error);
  }
}

async function deleteListingTrigger() {
    try {
        const response = await fetch(`${config.api_url}/object`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                objectID: listing.value.objectID,
                sellerEmail: listing.value.sellerEmail,
            }),
        });


        if (!response.ok) {
            throw new Error("Failed to delete listing");
        }

        console.log("Listing deleted successfully");
        const newPostCount = userPosts.value ? parseInt(userPosts.value, 10) - 1 : 1;
        await updateUserAttributes({ userAttributes: { "custom:posts": newPostCount.toString() }});
        router.push("/posts");
    } catch (error) {
        console.error("Error deleting listing:", error);
    }
}

async function changeListingTrigger() {
    try {
        const endpoint = listing.value.type === "auction" ? "auction" : "donation";
        const response = await fetch(`${config.api_url}/${endpoint}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                objectID: listing.value.objectID,
                sellerEmail: listing.value.sellerEmail,
                updates: {
                    description: form.value.description, 
                    objectName: form.value.objectName,
                }
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

function updateListing(){
    if (!form.objectName || !form.description) {
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
onMounted(fetchAndSetUserAttributes);
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
    height: 100vh;
    padding: 0 15px;
}

.content-container {
    display: flex;
    justify-content: center;
    width: 100%;
    max-width: 600px;
}

.info-container {
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
}

.custom-btnDelete {
    width: 100%;
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

.contact-form-header {
    font-size: 24px;
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


@media (max-width: 768px) {
    .content-container {
        width: 100%;
    }
}
</style>