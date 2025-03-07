<template>
    <NuxtLayout name="404">
        <div class="error-container">
            <p class="error-message">Oops... Page not found</p>
            <NuxtLink to="/">
                <CustomButton :buttonText="'Go Back'"/>
            </NuxtLink>
        </div>
    </NuxtLayout>
</template>

<script setup>
</script>

<style scoped>
html, body {
    background-color: white;
    height: 100%;
    margin: 0;
}

.error-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    text-align: center;
    background-color: white;
}

.error-message {
    font-size: 24px;
    font-weight: bold;
    color: #555;
    margin-bottom: 20px;
}

/* Center button */
NuxtLink {
    display: flex;
    justify-content: center;
}
</style>
