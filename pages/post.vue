<template>
  <div class="post-root">
    <!-- Add Listing Form -->
    <div v-if="!isAuthenticated" class="unauthenticated-container">
      <p class="unauthenticated-message">You need to be logged in to add a listing.</p>
      <NuxtLink to="/account">
        <CustomButton :buttonText="'Go to Account'" />
      </NuxtLink>
      <div class="image-container">
        <img src="../assets/image.png" alt="mascot">
      </div>
    </div>

    <div v-if="isAuthenticated" class="main-container">
      <div v-if="isAuthFinish" class="unauthenticated-container">
        <p class="unauthenticated-message">One more step. You need to go to account and complete all the informations.
        </p>
        <NuxtLink to="/account">
          <CustomButton :buttonText="'Go to Account'" />
        </NuxtLink>
        <div class="image-container">
          <img src="../assets/image.png" alt="mascot">
        </div>
      </div>

      <div v-if="!isAuthFinish" class="info-container">
        <p class="contact-form-header">Add Listing</p>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label class="attribute-key" for="name">Listing Name</label>
            <input v-model="form.name" type="text" id="name" placeholder="Enter object name" class="attribute-input" />
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
              <div v-for="duration in durations" :key="duration"
                :class="['tab', { active: selectedDuration === duration }]" @click="selectedDuration = duration">
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
        <p class="attribute-key">Are you sure you want to donate this item?</p>
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
import { fetchUserAttributes, fetchAuthSession } from 'aws-amplify/auth';

const config = useRuntimeConfig().public;
const isAuthenticated = ref(false);
const categories = [
  'fashion', 'electronics', 'home appliances', 'culture and art', 'home and garden',
  'leisure', 'entertainment', 'education', 'health', 'construction', 'toys'
];


const form = ref({
  name: '',
  type: '',
  category: '',
  description: '',
  sellerEmail: '',
  images: [],
});

const dropdowns = ref({ type: false, category: false });

const imagePreviews = ref([]);
const isPopupVisible = ref(false);
const isValidationPopupVisible = ref(false);
const isDonationConfirmationVisible = ref(false);
const verifyAttributes = ref({});
const isSubmitting = ref(false);
const selectedDuration = ref(7);
const sub = ref('');
const isAuthFinish = ref(false);
const informations = ref([]);

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
    const session = await fetchAuthSession();
    if (session && session.tokens) {
      isAuthenticated.value = true;
      const token = session.tokens.idToken.toString();
      const attributes = await fetchUserAttributes();
      form.value.sellerEmail = attributes.email || '';
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
    }
  } catch (error) {
    isAuthenticated.value = false;
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
    callback(canvas.toDataURL('image/jpeg', 0.7));
  };
}

function handleSubmit() {
  if (isSubmitting.value) return;

  if (!form.value.name || !form.value.type || !form.value.category || !form.value.description || !form.value.sellerEmail) {
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
  form.value = { name: '', type: '', category: '', description: '', sellerEmail: form.value.sellerEmail, images: [] };
  imagePreviews.value = [];
}

async function submitListing() {
  isSubmitting.value = true;
  try {
    const session = await fetchAuthSession();
    const token = session.tokens.idToken.toString();
    console.log(token);
    const listingData = { ...form.value };
    listingData.sub = sub.value

    if (form.value.type === 'auction') {
      listingData.duration = selectedDuration.value;
    }

    const response = await fetch(`${config.api_url}/user/listings/listing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ body: JSON.stringify(listingData) })
    });

    console.log("Body: ", JSON.stringify(listingData));

    if (!response.ok) throw new Error('Failed to submit listing');

    showPopup();
    form.value = { name: '', type: '', category: '', description: '', sellerEmail: form.value.sellerEmail, images: [] };
    imagePreviews.value = [];
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
.custom-btn {
  width: 100%;
  margin-top: 8px;
}

.unauthenticated-container {
  text-align: center;
  margin-top: 20px;
}

.unauthenticated-message {
  font-size: 18px;
  margin-bottom: 10px;
  color: #555;
}

.image-container {
  margin: 0 auto;
  align-self: center;
  width: 50%;
  height: 50%;
}

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
  height: 90vh;
  padding: 0 15px;
}

.info-container {
  width: 100%;
  border: 1.5px solid #8e8d8d;
  padding: 16px;
  box-sizing: border-box;
  background-color: white;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.1);
  margin-top: 100px;
  margin-bottom: 100px;
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
