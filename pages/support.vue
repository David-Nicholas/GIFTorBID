<template>
    <div class="main-container">
        <div class="content-container">
            <div class="info-container">
                <form @submit.prevent="handleSubmit">
                    <div class="form-group">
                        <label class="attribute-key" for="name">Name</label>
                        <input v-model="form.name" type="text" id="name" placeholder="Enter your name"
                            class="attribute-input"/>
                    </div>

                    <div class="form-group">
                        <label class="attribute-key" for="email">Email</label>
                        <input v-model="form.email" type="email" id="email" placeholder="Enter your email"
                            class="attribute-input" />
                    </div>

                    <div class="form-group">
                        <label class="attribute-key" for="subject">Subject</label>
                        <input v-model="form.subject" type="text" id="subject" placeholder="Enter the subject"
                            class="attribute-input"/>
                    </div>

                    <div class="form-group">
                        <label class="attribute-key" for="message">Message</label>
                        <textarea v-model="form.message" id="message" placeholder="Enter your message" rows="6"
                            class="attribute-input"></textarea>
                    </div>

                    <div class="form-group">
                        <CustomButton :buttonText="'Submit'" class="custom-btn" @activate="handleSubmit" />
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div v-if="isValidationPopupVisible" class="popup">
        <div class="popup-content">
            <p class="attribute-key">Please fill out all fields before submitting.</p>
            <CustomButton :buttonText="'Close'" class="custom-btn" @activate="closeValidationPopup" />
        </div>
    </div>

    <div v-if="isPopupVisible" class="popup">
        <div class="popup-content">
            <p class="attribute-key">Thank you for reaching out! We will get back to you soon.</p>
            <CustomButton :buttonText="'Close'" class="custom-btn" @activate="closePopup" />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const config = useRuntimeConfig().public;

definePageMeta({
    layout: 'custom'
});

const form = ref({
    name: '',
    email: '',
    subject: '', 
    message: '',
});

const isPopupVisible = ref(false);
const isValidationPopupVisible = ref(false);

async function handleSubmit() {
    if (!form.value.name || !form.value.email || !form.value.subject || !form.value.message) {
        isValidationPopupVisible.value = true;
        return;
    }

    const payload = {
        name: form.value.name,
        email: form.value.email,
        subject: form.value.subject,
        bodyText: form.value.message, 
    };

    try {
        const response = await $fetch(`${config.contact_api_link}`, {
            method: 'POST',
            body: payload,
        });

        if (response) {
            isPopupVisible.value = true;
            form.value = {
                name: '',
                email: '',
                subject: '',
                message: '',
            };
        }
    } catch (error) {
        console.error('An error occurred while submitting the form:', error);
    }
}

function closePopup() {
    isPopupVisible.value = false;
}

function closeValidationPopup() {
    isValidationPopupVisible.value = false;
}
</script>

<style scoped>
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

@media (max-width: 768px) {
    .content-container {
        width: 100%;
    }
}
</style>
