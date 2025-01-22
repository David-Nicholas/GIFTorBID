<template>
    <nav class="navbar">
        <div class="navbar-container">

            <div class="logo">
                <NuxtLink to="/"><img src="../assets/logo.png" alt="Logo" /></NuxtLink>
            </div>

            <div class="nav-links">
                <button @click="goBack" class="nav-btn">
                    <img src="https://api.iconify.design/material-symbols:close-rounded.svg" alt="Close" class="close-icon" />
                </button>
            </div>

        </div>
    </nav>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
    if (router.options.history.state.back) {
        router.back();
    } else {
        router.push('/');
    }
};
</script>

<style scoped>
.navbar {
    background-color: rgb(255, 255, 255);
    font-family: Arial, sans-serif;
    border-bottom: 1px solid #000;
}

.navbar-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 100%;
}

.logo img {
    height: 60px;
    width: 120px;
}

.nav-links {
    display: flex;
    align-items: center;
    gap: 7.5px; 
}

.nav-btn {
    text-decoration: none;
    color: #000000;
    font-weight: 500;
    padding: 0px 5px;
    background: none;
    border: none;
    cursor: pointer;
}

.nav-btn:hover {
    color: #2596be;
}

.active-link {
    color: #2596be;
}

.close-icon {
    height: 45px; 
    margin-left: 30px; 
}

.close-icon:hover {
    filter: invert(40%) sepia(79%) saturate(4615%) hue-rotate(165deg) brightness(94%) contrast(101%);
}
</style>
