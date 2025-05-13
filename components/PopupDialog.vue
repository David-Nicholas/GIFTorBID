<template>
    <div class="popup" v-if="visible">
        <div class="popup-content">
            <p class="attribute-key">{{ message }}</p>
            <CustomButton v-if="confirmText" :buttonText="confirmText" class="custom-btn"
                @activate="$emit('confirm')" />
            <CustomButton :buttonText="cancelText || 'Close'" class="custom-btn" @activate="$emit('cancel')" />
        </div>
    </div>
</template>

<script setup>
defineProps({
    visible: Boolean,
    message: String,
    confirmText: String,
    cancelText: String
})
</script>

<style>
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

.attribute-key {
    margin-bottom: 4px;
    font-size: 16px;
}
</style>