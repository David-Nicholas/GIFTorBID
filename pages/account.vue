<template>
  <div class="account-root">
    <div class="warn-container">
      <WarnMessage v-if="showError"
        description="Some data is missing to complete the sign-up. Please provide information in the empty fields below." />
    </div>
    <div class="main-container">
      <Authenticator :login-mechanisms="['email']" :sign-up-attributes="['phone_number', 'name', 'birthdate']">
        <template v-slot="{ signOut, user }">
          <div class="content-container">
            <div class="left-column">

              <!-- Sign Out button -->
              <div class="info-container">
                <CustomButton :buttonText="'Sign out'" class="custom-btn" @activate="signOut" />
              </div>

              <!-- Table modifiable attributes section -->
              <div class="info-container">
                <p class="title-paragraph">Your Address</p>
                <div v-for="(value, key) in filteredModifiableCustomAttributes()" :key="key">
                  <p class="attribute-key">{{ formatKey(key) }}</p>
                  <input v-model="tableEditableAttributes[key]" type="text" class="attribute-input"
                    :placeholder="getPlaceholderForCustomAttribute(key)" />
                </div>
                <CustomButton :buttonText="'Change'" class="custom-btn change-all-btn"
                  @activate="updateUserInformations()" />
              </div>

              <!-- Table non-modifiable attributes section -->
              <div class="info-container">
                <p class="title-paragraph">Your Stats</p>
                <div class="custom-non-modifiable-columns">
                  <div v-for="(value, key) in filteredNonModifiableCustomAttributes()" :key="key"
                    class="custom-attribute-column">
                    <NuxtLink :to="routeForAttribute(key)"><p class="custom-attribute-key">{{ formatKey(key) }}</p></NuxtLink>
                    <div class="custom-attribute-box">
                      <NuxtLink :to="routeForAttribute(key)">{{ value || '0' }}</NuxtLink>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div class="right-column">

              <!-- Default non-modifiable attributes section -->
              <div class="info-container">
                <p class="title-paragraph">Your Account Informations</p>
                <div v-for="(value, key) in filteredNonModifiableAttributes()" :key="key">
                  <p class="attribute-key">{{ formatKey(key) }}</p>
                  <input v-model="cognitoNonEditableAttributes[key]" type="text" class="attribute-input" disabled />
                </div>
                <p class="info-message">
                  Note: These details can only be updated by contacting our support team. Please reach out to support if
                  you need to make any changes.
                </p>
              </div>

              <div class="info-container">
                <p class="attribute-key">
                  Deleting the GIFTorBID account is an irreversible action by which your data will be removed. Keep in
                  mind that for legal reasons, some data can be kept.
                </p>
                <CustomButton :buttonText="'Delete account'" class="custom-btn" @activate="showDeletePopup()" />
              </div>

            </div>
          </div>
        </template>
      </Authenticator>

      <!-- Delete popup -->
      <div v-if="isDeletePopupVisible" class="popup">
        <div class="popup-content">
          <p class="attribute-key">Are you sure you want to delete your account?</p>
          <CustomButton :buttonText="'Delete'" class="custom-btn" @activate="handleDeleteUser()" />
          <CustomButton :buttonText="'Cancel'" class="custom-btn" @activate="closeDeletePopup()" />
        </div>
      </div>

      <!-- Delete successful popup -->
      <div v-if="isDeleteSuccessPopupVisible" class="popup">
        <div class="popup-content">
          <p class="attribute-key">The account was deleted</p>
          <CustomButton :buttonText="'Close'" class="custom-btn" @activate="closeDeleteSuccessPopup()" />
        </div>
      </div>

      <!-- Attribute changed popup -->
      <div v-if="isChangePopupVisible" class="popup">
        <div class="popup-content">
          <p class="attribute-key">The information was changed</p>
          <CustomButton :buttonText="'Close'" class="custom-btn" @activate="closeChangePopup()" />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
definePageMeta({
  colorMode: 'light',
});

import { Authenticator } from "@aws-amplify/ui-vue";
import "@aws-amplify/ui-vue/styles.css";
import { ref } from 'vue';
import { fetchUserAttributes, deleteUser, fetchAuthSession } from 'aws-amplify/auth';
import { useRouter } from 'vue-router';
import { Hub } from 'aws-amplify/utils';
import WarnMessage from "~/components/WarnMessage.vue";

Hub.listen('auth', ({ payload }) => {
  switch (payload.event) {
    case 'signedIn':
      redirectTo("/");
      break;
  }
});

const router = useRouter();
const config = useRuntimeConfig().public;

const redirectTo = (page) => {
  router.push(page);
};

const cognitoNonModifiableAttributes = ['email', 'birthdate', 'phone_number', 'name'];
const tableModifiableAttributes = ['country', 'county', 'city', 'address', 'postalCode'];
const tableNonModifiableAttributes = ['averageRating', 'listingsIDs', 'redeemedIDs'];

const cognitoNonEditableAttributes = ref({});
const tableEditableAttributes = ref({});
const tableNonEditableAttributes = ref({});

const isDeletePopupVisible = ref(false);
const isChangePopupVisible = ref(false);
const isDeleteSuccessPopupVisible = ref(false);

const showError = ref(false);

const informations = ref([]);

const userID = ref('');
const userEmail = ref('');

async function getUserInformations() {
  try {
    const session = await fetchAuthSession();
    if (session && session.tokens) {
    const token = session.tokens.idToken.toString();
    const attributes = await fetchUserAttributes();
    userID.value = attributes.sub;
    userEmail.value = attributes.email || "";
    const response = await fetch(`${config.api_url}/user/informations?userID=${userID.value}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `${token}` },
    });

    const data = await response.json();
    informations.value = JSON.parse(data.body);

    console.log(informations.value);

    tableEditableAttributes.value = {
      country: informations.value.country || '',
      county: informations.value.county || '',
      city: informations.value.city || '',
      address: informations.value.address || '',
      postalCode: informations.value.postalCode || ''
    };

    showError.value = Object.values(tableEditableAttributes.value).some(attr => attr.trim() === '');

    tableNonEditableAttributes.value = {
      listingsIDs: informations.value.listingsIDs?.length || 0,
      redeemedIDs: informations.value.redeemedIDs?.length || 0,
      averageRating: informations.value.averageRating || '0'
    };
  }
  } catch (error) {
    console.error("Error fetching user:", error);
  }
}


async function updateUserInformations() {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens.idToken.toString();
    showError.value = Object.values(tableEditableAttributes.value).some(attr => attr.trim() === '');
    if(showError.value) {
      return;
    }
    const response = await fetch(`${config.api_url}/user/informations`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`,
      },
      body: JSON.stringify({
        body: JSON.stringify({
          country: tableEditableAttributes.value.country,
          county: tableEditableAttributes.value.county,
          city: tableEditableAttributes.value.city,
          address: tableEditableAttributes.value.address,
          postalCode: tableEditableAttributes.value.postalCode,
          userID: userID.value
        })
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to change informations");
    }

    console.log("Informations changed successfully: ", response);
    showChangePopup();
    router.push("/account");
  } catch (error) {
    console.error("Error updating user informations:", error);
  }
}

// Default non-modifiable attributes
async function fetchAndSetNonModifiableAttributes() {
  try {
    const session = await fetchAuthSession();
    if (session && session.tokens) {
      const attributes = await fetchUserAttributes();
      const filtered = Object.fromEntries(
        Object.entries(attributes).filter(([key]) => cognitoNonModifiableAttributes.includes(key))
      );
      cognitoNonEditableAttributes.value = { ...filtered };
    }
  } catch (error) {
    console.error('Error fetching user attributes:', error);
  }
}

function getPlaceholderForCustomAttribute(key) {
  switch (key) {
    case 'country':
      return 'Enter your country';
    case 'county':
      return 'Enter your region/state';
    case 'city':
      return 'Enter your city';
    case 'address':
      return 'Street, number, floor, apartment';
    case 'postalCode':
      return 'Enter your postal code';
    case 'listingsIDs':
      return informations.value.listingsIDs.length;
    case 'redeemedIDs':
      return informations.value.listingsIDs.length;
    case 'averageRating':
      return informations.value.averageRating;
    default:
      return 'Enter value';
  }
}

function routeForAttribute(key) {
  if (!userEmail.value && key === 'averageRating') return '/reviews/missing';

  switch (key) {
    case 'averageRating':
      return `/reviews/${userEmail.value}`;
    case 'listingsIDs':
      return '/posts';
    case 'redeemedIDs':
      return '/aquisitions';
  }
}


function filteredNonModifiableAttributes() {
  return cognitoNonEditableAttributes.value || {};
}

function filteredModifiableCustomAttributes() {
  return {
    ...tableModifiableAttributes.reduce((acc, key) => {
      acc[key] = tableEditableAttributes.value[key] || '';
      return acc;
    }, {})
  };
}

function filteredNonModifiableCustomAttributes() {
  return {
    ...tableNonModifiableAttributes.reduce((acc, key) => {
      acc[key] = tableNonEditableAttributes.value[key] || '';
      return acc;
    }, {})
  };
}

function formatKey(key) {
  return key
    .replace(/IDs$/, '')
    .replace(/([A-Z])/g, ' $1')
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

// Delete account
async function handleDeleteUser() {
  try {
    await deleteUser();
    showDeleteSuccessPopup();
    closeDeletePopup();
  } catch (error) {
    console.error('Error deleting user:', error);
  }
}

// Popups helpers
function showDeleteSuccessPopup() {
  isDeleteSuccessPopupVisible.value = true;
}

function closeDeleteSuccessPopup() {
  isDeleteSuccessPopupVisible.value = false;
}

function showDeletePopup() {
  isDeletePopupVisible.value = true;
}

function closeDeletePopup() {
  isDeletePopupVisible.value = false;
}

function showChangePopup() {
  isChangePopupVisible.value = true;
}

function closeChangePopup() {
  isChangePopupVisible.value = false;
  fetchAndSetNonModifiableAttributes();
}
onMounted(fetchAndSetNonModifiableAttributes);
onMounted(getUserInformations);
</script>

<style scoped>
.warn-container {
  display: flex;
  justify-content: center;
}

.main-container {
  display: flex;
  justify-content: center;
  align-items: top;
  margin-top: 40px;
}

.content-container {
  display: flex;
  width: 100%;
  justify-content: space-between;
  width: calc(100% - 20px);
}

.left-column,
.right-column {
  flex: 1;
  padding: 0 7.5px;
}

.custom-btn {
  width: 100%;
}

.info-container {
  border: 1.5px solid #8e8d8d;
  padding: 16px;
  margin-bottom: 16px;
}

.attribute-key {
  margin-bottom: 4px;
  font-size: 16px;
}

.title-paragraph {
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 25px;
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
  padding: 0 7.5px;
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

.custom-non-modifiable-columns {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 100px
}

.custom-attribute-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.custom-attribute-key {
  margin-bottom: 4px;
  font-size: 16px;
}

.custom-attribute-key:hover {
  color: #2596be;
  border-color: #2596be;
}

.custom-attribute-box {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 80px;
  font-size: 60px;
  text-align: center;
  line-height: normal;
  margin-bottom: 8px;
}

.custom-attribute-box:hover {
  color: #2596be;
  border-color: #2596be;
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