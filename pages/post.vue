<template>
  <div class="post-root">
    <!-- Add Listing Form -->
    <div class="main-container">
      <div class="content-container">
        <div class="info-container">
          <p class="contact-form-header">Add Listing</p>
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label class="attribute-key" for="objectName">Object Name</label>
              <input v-model="form.objectName" type="text" id="objectName" placeholder="Enter object name"
                class="attribute-input" />
            </div>

            <div class="form-group">
              <label class="attribute-key">Type</label>
              <div class="custom-dropdown" @click="toggleDropdown('type')">
                <div class="dropdown-selected">{{ form.type || '>' }}</div>
                <ul v-if="dropdowns.type" class="dropdown-options">
                  <li @click.stop="selectOption('type', 'donation')">donation</li>
                  <li @click.stop="selectOption('type', 'auction')">auction</li>
                </ul>
              </div>
            </div>

            <div v-if="form.type === 'auction'" class="auction-duration">
              <label class="attribute-key">Auction Duration</label>
              <div class="tabs-container">
                <div
                  v-for="duration in durations"
                  :key="duration"
                  :class="['tab', { active: selectedDuration === duration }]"
                  @click="selectedDuration = duration"
                >
                  {{ duration }} days
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="attribute-key">Category</label>
              <div class="custom-dropdown" @click="toggleDropdown('category')">
                <div class="dropdown-selected">{{ form.category || '>' }}</div>
                <ul v-if="dropdowns.category" class="dropdown-options">
                  <li v-for="category in categories" :key="category" @click.stop="selectOption('category', category)">
                    {{ category }}
                  </li>
                </ul>
              </div>
            </div>

            <div class="form-group">
              <label class="attribute-key" for="description">Description</label>
              <textarea v-model="form.description" id="description" placeholder="Enter a description" rows="6"
                class="attribute-input"></textarea>
            </div>

            <div class="form-group">
              <label class="attribute-key" for="sellerEmail">Seller Email</label>
              <input v-model="form.sellerEmail" type="sellerEmail" id="sellerEmail" class="attribute-input" disabled />
            </div>

            <div class="form-group">
              <label class="attribute-key">Upload Images (Max 3)</label>
              <input type="file" accept="image/jpeg, image/png" multiple @change="handleImageUpload"
                class="attribute-input" />
              <div v-if="imagePreviews.length" class="image-preview-container">
                <img v-for="(image, index) in imagePreviews" :key="index" :src="image" class="image-preview" />
              </div>
            </div>

            <div class="form-group">
              <CustomButton :buttonText="'Submit'" class="custom-btn" @activate="handleSubmit" />
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Validation Popup -->
    <div v-if="isValidationPopupVisible" class="popup">
      <div class="popup-content">
        <p class="attribute-key">Please fill out all fields before submitting.</p>
        <CustomButton :buttonText="'Close'" class="custom-btn" @activate="closeValidationPopup" />
      </div>
    </div>

    <!-- Confirmation Popup for Donations -->
    <div v-if="isDonationConfirmationVisible" class="popup">
      <div class="popup-content">
        <p class="attribute-key">Are you sure you want to donate this item? This action cannot be undone.</p>
        <CustomButton :buttonText="'Yes, Confirm'" class="custom-btn" @activate="confirmDonation" />
        <CustomButton :buttonText="'Cancel'" class="custom-btn cancel-btn" @activate="cancelDonation" />
      </div>
    </div>

    <!-- Confirmation Popup -->
    <div v-if="isPopupVisible" class="popup">
      <div class="popup-content">
        <p class="attribute-key">Your listing has been added successfully!</p>
        <CustomButton :buttonText="'Close'" class="custom-btn" @activate="closePopup" />
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  colorMode: 'light',
});

import { ref, onMounted } from 'vue';
import { fetchUserAttributes, updateUserAttributes } from 'aws-amplify/auth';

const config = useRuntimeConfig().public;
const categories = [
  'fashion', 'electronics', 'home appliances', 'culture and art', 'home and garden',
  'leisure', 'entertainment', 'education', 'health', 'construction', 'toys'
];

const form = ref({
  objectName: '',
  type: '',
  category: '',
  description: '',
  sellerEmail: '',
  images: []
});

const dropdowns = ref({ type: false, category: false });

const imagePreviews = ref([]);
const isPopupVisible = ref(false);
const isValidationPopupVisible = ref(false);
const isDonationConfirmationVisible = ref(false);
const isSubmitting = ref(false);
const userPosts = ref(0);
const selectedDuration = ref(7);

const durations = [2, 7, 14, 21];

function toggleDropdown(field) {
  dropdowns.value[field] = !dropdowns.value[field];
}

function selectOption(field, value) {
  form.value[field] = value;
  dropdowns.value[field] = false;
}

async function fetchAndSetUserAttributes() {
  try {
    const attributes = await fetchUserAttributes();
    form.value.sellerEmail = attributes.email || '';
    userPosts.value = attributes["custom:posts"] ? parseInt(attributes["custom:posts"], 10) : 0;
  } catch (error) {
    console.error('Error fetching user attributes:', error);
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
    callback(canvas.toDataURL('image/jpeg', 0.7)); // Adjust quality as needed
  };
}

function handleSubmit() {
  if (isSubmitting.value) return;

  if (!form.value.objectName || !form.value.type || !form.value.category || !form.value.description || !form.value.sellerEmail) {
    showValidationPopup();
    return;
  }

  if (form.value.type === 'donation') {
    isDonationConfirmationVisible.value = true;
  } else {
    submitListing();
  }
}

function confirmDonation() {
  isDonationConfirmationVisible.value = false;
  submitListing();
}

function cancelDonation() {
  isDonationConfirmationVisible.value = false;
  form.value = { objectName: '', type: '', category: '', description: '', sellerEmail: form.value.sellerEmail, images: [] };
  imagePreviews.value = [];
}

async function submitListing() {
  isSubmitting.value = true;
  try {
    const listingData = { ...form.value };

    if (form.value.type === 'auction') {
      listingData.duration = selectedDuration.value;
    }

    const response = await fetch(`${config.api_url}/object`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: JSON.stringify(listingData) })
    });

    if (!response.ok) throw new Error('Failed to submit listing');

    const newPostCount = userPosts.value ? parseInt(userPosts.value, 10) + 1 : 1;
    await updateUserAttributes({ userAttributes: { "custom:posts": newPostCount.toString() }});

    showPopup();
    form.value = { objectName: '', type: '', category: '', description: '', sellerEmail: form.value.sellerEmail, images: [] };
    imagePreviews.value = [];
    userPosts.value = newPostCount;
    selectedDuration.value = 7;

  } catch (error) {
    console.error('Error submitting listing:', error);
  } finally {
    isSubmitting.value = false;
  }
}

function showPopup() {
  isPopupVisible.value = true;
}

function closePopup() {
  isPopupVisible.value = false;
}

function showValidationPopup() {
  isValidationPopupVisible.value = true;
}

function closeValidationPopup() {
  isValidationPopupVisible.value = false;
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


