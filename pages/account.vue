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

            <!-- Custom modifiable attributes section -->
            <div class="info-container">
              <p class="title-paragraph">Your Address</p>
              <div v-for="(value, key) in filteredModifiableCustomAttributes()" :key="key">
                <p class="attribute-key">{{ formatKey(key) }}</p>
                <input v-model="customEditableAttributes[key]" type="text" class="attribute-input"
                  :placeholder="getPlaceholderForCustomAttribute(key)" />
              </div>
              <CustomButton :buttonText="'Change'" class="custom-btn change-all-btn"
                @activate="handleChangeAllCustomAttributes()" />
            </div>

            <!-- Custom non-modifiable attributes section -->
            <div class="info-container">
              <p class="title-paragraph">Your Stats</p>
              <div class="custom-non-modifiable-columns">
                <div v-for="(value, key) in filteredNonModifiableCustomAttributes()" :key="key"
                  class="custom-attribute-column">
                  <p class="custom-attribute-key">{{ formatKey(key) }}</p>
                  <div class="custom-attribute-box">
                    <NuxtLink to="/posts">{{ value || '0' }}</NuxtLink>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div class="right-column">

            <!-- Default modifiable attributes section -->
            <div class="info-container">
              <p class="title-paragraph">Your Displayable Informations</p>
              <div v-for="(value, key) in filteredModifiableAttributes()" :key="key">
                <p class="attribute-key">{{ formatKey(key) }}</p>
                <input v-model="editableAttributes[key]" type="text" class="attribute-input" />
              </div>
              <CustomButton :buttonText="'Change'" class="custom-btn change-all-btn"
                @activate="handleChangeAllAttributes()" />
            </div>

            <!-- Default non-modifiable attributes section -->
            <div class="info-container">
              <p class="title-paragraph">Your Account Informations</p>
              <div v-for="(value, key) in filteredNonModifiableAttributes()" :key="key">
                <p class="attribute-key">{{ formatKey(key) }}</p>
                <input v-model="nonEditableAttributes[key]" type="text" class="attribute-input" disabled />
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
import { ref, watchEffect } from 'vue';
import { fetchUserAttributes, updateUserAttributes, deleteUser, fetchAuthSession } from 'aws-amplify/auth';
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

const redirectTo = (page) => {
  router.push(page);
};

const defaultModifiableAttributes = ['phone_number', 'name'];
const defaultNonModifiableAttributes = ['email', 'birthdate'];
const customModifiableAttributes = ['custom:country', 'custom:region', 'custom:city', 'custom:address', 'custom:postal-code'];
const customNonModifiableAttributes = ['custom:listings_number'];

const editableAttributes = ref({});
const nonEditableAttributes = ref({});
const customEditableAttributes = ref({});
const customNonEditableAttributes = ref({});

const isDeletePopupVisible = ref(false);
const isChangePopupVisible = ref(false);
const isDeleteSuccessPopupVisible = ref(false);

const showError = ref(false);
// Default modifiable attributes
async function fetchAndSetModifiableAttributes() {
  try {
    const session = await fetchAuthSession();
    if (session && session.tokens) {
      const attributes = await fetchUserAttributes();
      const filtered = Object.fromEntries(
        Object.entries(attributes).filter(([key]) => defaultModifiableAttributes.includes(key))
      );
      editableAttributes.value = { ...filtered };
    }
  } catch (error) {
    console.error('Error fetching user attributes:', error);
  }
}

async function handleChangeAllAttributes() {
  try {
    const userAttributes = Object.keys(editableAttributes.value).reduce((acc, key) => {
      acc[key] = editableAttributes.value[key];
      return acc;
    }, {});

    await updateUserAttributes({
      userAttributes,
    });

    showChangePopup();
  } catch (error) {
    console.error('Error updating all default attributes:', error);
  }
}

// Default non-modifiable attributes
async function fetchAndSetNonModifiableAttributes() {
  try {
    const session = await fetchAuthSession();
    if (session && session.tokens) {
      const attributes = await fetchUserAttributes();
      const filtered = Object.fromEntries(
        Object.entries(attributes).filter(([key]) => defaultNonModifiableAttributes.includes(key))
      );
      nonEditableAttributes.value = { ...filtered };
    }
  } catch (error) {
    console.error('Error fetching user attributes:', error);
  }
}

// Custom modifiable attributes
async function fetchAndSetModifiableCustomAttributes() {
  try {
    const session = await fetchAuthSession();
    if (session && session.tokens) {
      const attributes = await fetchUserAttributes();
      const filtered = Object.fromEntries(
        Object.entries(attributes).filter(([key]) => customModifiableAttributes.includes(key))
      );

      customEditableAttributes.value = {
        ...customModifiableAttributes.reduce((acc, key) => {
          acc[key] = filtered[key] || '';
          return acc;
        }, {})
      };
      const hasEmptyAttributes = Object.values(customEditableAttributes.value).some(value => !value);
      showError.value = hasEmptyAttributes;
    }
  } catch (error) {
    console.error('Error fetching custom user attributes:', error);
  }
}

async function handleChangeAllCustomAttributes() {
  try {
    const userAttributes = customModifiableAttributes.reduce((acc, key) => {
      acc[key] = customEditableAttributes.value[key];
      return acc;
    }, {});

    await updateUserAttributes({
      userAttributes,
    });

    showChangePopup();
  } catch (error) {
    console.error('Error updating all custom attributes:', error);
  }
}

// Custom non-modifiable attributes
async function fetchAndSetNonModifiableCustomAttributes() {
  try {
    const session = await fetchAuthSession();
    if (session && session.tokens) {
      const attributes = await fetchUserAttributes();
      const filtered = Object.fromEntries(
        Object.entries(attributes).filter(([key]) => customNonModifiableAttributes.includes(key))
      );

      customNonEditableAttributes.value = {
        ...customNonModifiableAttributes.reduce((acc, key) => {
          acc[key] = filtered[key] || '';
          return acc;
        }, {})
      };
    }
  } catch (error) {
    console.error('Error fetching custom user attributes:', error);
  }
}

function getPlaceholderForCustomAttribute(key) {
  switch (key) {
    case 'custom:country':
      return 'Enter your country';
    case 'custom:region':
      return 'Enter your region/state';
    case 'custom:city':
      return 'Enter your city';
    case 'custom:address':
      return 'Street, number, floor, apartment';
    case 'custom:postal-code':
      return 'Enter your postal code';
    case 'custom:listings_number':
      return '0';
    default:
      return 'Enter value';
  }
}

watchEffect(() => {
  fetchAndSetModifiableAttributes();
  fetchAndSetNonModifiableAttributes();
  fetchAndSetModifiableCustomAttributes();
  fetchAndSetNonModifiableCustomAttributes();
});

// Helpers
function filteredModifiableAttributes() {
  return editableAttributes.value || {};
}

function filteredNonModifiableAttributes() {
  return nonEditableAttributes.value || {};
}

function filteredModifiableCustomAttributes() {
  return {
    ...customModifiableAttributes.reduce((acc, key) => {
      acc[key] = customEditableAttributes.value[key] || '';
      return acc;
    }, {})
  };
}

function filteredNonModifiableCustomAttributes() {
  return {
    ...customNonModifiableAttributes.reduce((acc, key) => {
      acc[key] = customNonEditableAttributes.value[key] || '';
      return acc;
    }, {})
  };
}

function formatKey(key) {
  return key
    .replace(/custom:/g, '')
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
  fetchAndSetModifiableAttributes();
  fetchAndSetNonModifiableAttributes();
  fetchAndSetModifiableCustomAttributes();
  fetchAndSetNonModifiableCustomAttributes();
}
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

.custom-attribute-box {
  display: flex;
  justify-content: center; 
  align-items: center; 
  width: 80px;
  height: 80px;
  border: 1.5px solid #000; 
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