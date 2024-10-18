<template>
  <div class="main-container">
    <Authenticator :login-mechanisms="['email']"
      :sign-up-attributes="['phone_number', 'name', 'nickname', 'birthdate']">
      <template v-slot="{ signOut, user }">
        <div class="content-container">
          <div class="left-column">

            <!-- Sign Out button -->
            <div class="info-container">
              <CustomButton :buttonText="'Sign out'" class="custom-btn" @activate="signOut" />
            </div>

            <!-- Custom attributes section -->
            <div class="info-container">
              <p class="title-paragraph">Your Address</p>
              <div v-for="(value, key) in filteredCustomAttributes()" :key="key">
                <p class="attribute-key">{{ formatKey(key) }}</p>
                <input v-model="customEditableAttributes[key]" type="text" class="attribute-input" 
                :placeholder="getPlaceholderForCustomAttribute(key)"/>
                <CustomButton :buttonText="'Change'" class="custom-btn"
                  @activate="handleChangeCustomAttributes(key, customEditableAttributes[key])" />
              </div>
              <CustomButton :buttonText="'Change All'" class="custom-btn change-all-btn"
                @activate="handleChangeAllCustomAttributes()" />
            </div>

          </div>

          <div class="right-column">

            <!-- Default attributes section -->
            <div class="info-container">
              <p class="title-paragraph">Your Informations</p>
              <div v-for="(value, key) in filteredAttributes()" :key="key">
                <p class="attribute-key">{{ formatKey(key) }}</p>
                <input v-model="editableAttributes[key]" type="text" class="attribute-input" />
                <CustomButton :buttonText="'Change'" class="custom-btn"
                  @activate="handleChangeAttributes(key, editableAttributes[key])" />
              </div>
            </div>

            <!-- Delete account and support -->
            <div class="info-container">
              <p class="attribute-key">
                Visiting the GIFTorBID support page will help you with any questions or problems you have. Some
                issues may take longer to resolve because of legal or technical reasons.
              </p>
              <CustomButton :buttonText="'Support'" class="custom-btn" @activate="redirectTo('/support')" />
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
</template>


<script setup>
import { Authenticator } from "@aws-amplify/ui-vue";
import "@aws-amplify/ui-vue/styles.css";
import { ref, watchEffect } from 'vue';
import { fetchUserAttributes, updateUserAttributes, deleteUser } from 'aws-amplify/auth';
import { useRouter } from 'vue-router';
import { Hub } from 'aws-amplify/utils';

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

const allowedAttributes = ['phone_number', 'nickname', 'name'];
const customAttributes = ['custom:country', 'custom:region', 'custom:city', 'custom:street-address', 'custom:postal-code'];

const editableAttributes = ref({});
const customEditableAttributes = ref({});

const isDeletePopupVisible = ref(false);
const isChangePopupVisible = ref(false);
const isDeleteSuccessPopupVisible = ref(false);

// Default attributes
async function fetchAndSetAttributes() {
  try {
    const attributes = await fetchUserAttributes();
    const filtered = Object.fromEntries(
      Object.entries(attributes).filter(([key]) => allowedAttributes.includes(key))
    );
    editableAttributes.value = { ...filtered };
  } catch (error) {
    console.error('Error fetching user attributes:', error);
  }
}

async function handleChangeAttributes(key, inputValue) {
  try {
    await updateUserAttributes({
      userAttributes: {
        [key]: inputValue,
      },
    });
    showChangePopup();
  } catch (error) {
    console.error('Error updating user attribute:', error);
  }
}

// Custom attributes
async function fetchAndSetCustomAttributes() {
  try {
    const attributes = await fetchUserAttributes();
    const filtered = Object.fromEntries(
      Object.entries(attributes).filter(([key]) => customAttributes.includes(key))
    );

    customEditableAttributes.value = {
      ...customAttributes.reduce((acc, key) => {
        acc[key] = filtered[key] || '';
        return acc;
      }, {})
    };
  } catch (error) {
    console.error('Error fetching custom user attributes:', error);
  }
}

async function handleChangeCustomAttributes(key, inputValue) {
  try {
    await updateUserAttributes({
      userAttributes: {
        [key]: inputValue,
      },
    });
    showChangePopup();
  } catch (error) {
    console.error('Error updating custom user attribute:', error);
  }
}

async function handleChangeAllCustomAttributes() {
  try {
    const userAttributes = customAttributes.reduce((acc, key) => {
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

function getPlaceholderForCustomAttribute(key) {
  switch (key) {
    case 'custom:country':
      return 'Enter your country';
    case 'custom:region':
      return 'Enter your region/state';
    case 'custom:city':
      return 'Enter your city';
    case 'custom:street-address':
      return 'Street, number, floor, apartment';
    case 'custom:postal-code':
      return 'Enter your postal code';
    default:
      return 'Enter value';
  }
}

watchEffect(() => {
  fetchAndSetAttributes();
  fetchAndSetCustomAttributes();
});

// Chnage attributes helpers
function filteredAttributes() {
  return editableAttributes.value || {};
}

function filteredCustomAttributes() {
  return {
    ...customAttributes.reduce((acc, key) => {
      acc[key] = customEditableAttributes.value[key] || '';
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

//Popups helpers
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
  fetchAndSetAttributes();
  fetchAndSetCustomAttributes();
}
</script>


<style scoped>
.main-container {
  display: flex;
  justify-content: center;
  align-items: top;
  padding-top: 100px;
}

.content-container {
  display: flex;
  width: 100%;
  max-width: 1000px;
  justify-content: space-between;
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
