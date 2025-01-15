<template>
    <nav class="navbar">
        <div class="navbar-container">

            <div class="logo-burger-container">
                <NuxtLink to="/" class="logo">
                    <img src="../assets/logo.png" alt="Logo" />
                </NuxtLink>
                <button class="burger-menu" @click="toggleMenu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>

            <div class="nav-links" :class="{ 'show-menu': isMenuOpen }">
                <NuxtLink to="/" class="nav-btn" active-class="active-link">EXPLORE</NuxtLink>
                <NuxtLink to="/post" class="nav-btn" active-class="active-link">POST</NuxtLink>
                <NuxtLink to="/aquisitions" class="nav-btn" active-class="active-link">ACQUISITIONS</NuxtLink>
                <NuxtLink to="/account" class="nav-btn" active-class="active-link">ACCOUNT</NuxtLink>
                <NuxtLink to="/support" class="nav-btn" active-class="active-link">SUPPORT</NuxtLink>
            </div>

        </div>
    </nav>
</template>

<script setup>
import { ref } from 'vue';

const isMenuOpen = ref(false);

const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value;
};
</script>

<style scoped>
.navbar {
    background-color: rgb(255, 255, 255);
    font-family: arial;
    border-bottom: 1px solid #000;
}

.navbar-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 100%;
}

.logo-burger-container {
    display: flex;
    align-items: center;
    gap: 15px;
}

.logo img {
    height: 60px;
    width: 120px;
}

.burger-menu {
    display: none;
    flex-direction: column;
    justify-content: space-between;
    width: 30px;
    height: 20px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
}

.burger-menu span {
    display: block;
    width: 100%;
    height: 3px;
    background-color: #000;
    border-radius: 2px;
}

.nav-links {
    display: flex;
    gap: 7.5px;
}

.nav-links.show-menu {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 10px;
}

.nav-btn {
    text-decoration: none;
    color: #000000;
    font-weight: 500;
    padding: 0px 5px;
}

.nav-btn:hover {
    color: #2596be;
}

.active-link {
    color: #2596be;
}

@media (max-width: 768px) {
    .burger-menu {
        display: flex;
    }

    .nav-links {
        display: none;
    }

    .nav-links.show-menu {
        display: flex;
    }

    .navbar-container {
        flex-direction: column;
    }

    .logo-burger-container {
        justify-content: space-between;
        width: 100%;
        padding: 0 20px;
    }
}
</style>
