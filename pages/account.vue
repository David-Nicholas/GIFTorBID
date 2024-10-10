<template>
  <div class="main-container">
    <Authenticator :login-mechanisms="['email']"
      :sign-up-attributes="['phone_number', 'name', 'nickname', 'birthdate']">
      <template v-slot="{ signOut, user }">
        <div class="content-container">
          <div class="left-column">
            <div class="info-container">
              <CustomButton :buttonText="'Sign out'" class="custom-btn" @activate="signOut" />
            </div>
            <div class="info-container">
              <div v-for="(value, key) in filteredAttributes()" :key="key">
                <p class="attribute-key">{{ formatKey(key) }}</p>
                <input v-model="editableAttributes[key]" type="text" class="attribute-input" />
                <CustomButton :buttonText="'Change'" class="custom-btn"
                  @activate="handleChangeAttributes(key, editableAttributes[key])" />
              </div>
            </div>
          </div>
          <div class="right-column">
            <div class="info-container">
              <p class="attribute-key">
                Deleting the GIFTorBID account is an irreversible action by which your data will be removed. Keep in
                mind that for legal reasons, some data can be kept.
              </p>
              <CustomButton :buttonText="'Delete account'" class="custom-btn" @activate="showDeletePopup()" />
            </div>
            <div class="info-container">
              <p class="attribute-key">
                Visiting the GIFTorBID support page will help you with any questions or problems you have. Some 
                issues may take longer to resolve because of legal or technical reasons.
              </p>
              <CustomButton :buttonText="'Support'" class="custom-btn" @activate="redirectTo('/support')" />
            </div>
          </div>
        </div>
      </template>
    </Authenticator>

    <div v-if="isDeletePopupVisible" class="popup">
      <div class="popup-content">
        <p class="attribute-key">Are you sure you want to delete your account?</p>
        <CustomButton :buttonText="'Delete'" class="custom-btn" @activate="handleDeleteUser()" />
        <CustomButton :buttonText="'Cancel'" class="custom-btn" @activate="closeDeletePopup()" />
      </div>
    </div>

    <div v-if="isChangePopupVisible" class="popup">
      <div class="popup-content">
        <p class="attribute-key">The information was successfully changed</p>
        <CustomButton :buttonText="'Close'" class="custom-btn" @activate="closeChangePopup()" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { Authenticator } from "@aws-amplify/ui-vue";
import "@aws-amplify/ui-vue/styles.css";
import { ref, watchEffect } from 'vue';
import { fetchUserAttributes, updateUserAttributes, deleteUser, signOut } from 'aws-amplify/auth';
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
const editableAttributes = ref({});

const isDeletePopupVisible = ref(false);
const isChangePopupVisible = ref(false);

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

watchEffect(() => {
  fetchAndSetAttributes();
});


async function handleChangeAttributes(key, inputValue) {
  try {
    await updateUserAttributes({
      userAttributes: {
        [key]: inputValue,
      },
    });
    isChangePopupVisible.value = true;
  } catch (error) {
    console.error('Error updating user attribute:', error);
  }
}

async function handleDeleteUser() {
  try {
    await deleteUser();
  } catch (error) {
    console.error('Error deleting user:', error);
  }
}

function showDeletePopup() {
  isDeletePopupVisible.value = true;
}

function closeDeletePopup() {
  isDeletePopupVisible.value = false;
}

function closeChangePopup() {
  isChangePopupVisible.value = false;
  fetchAndSetAttributes();
}

function filteredAttributes() {
  return editableAttributes.value || {};
}

function formatKey(key) {
  return key
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
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