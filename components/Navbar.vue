<template>
    <nav class="navbar">
        <div class="navbar-container">

            <div class="logo">
                <NuxtLink to="/"><img src="../assets/logo.png" alt="Logo" /></NuxtLink>
            </div>

            <div class="nav-links">
                <NuxtLink to="/" class="nav-btn" active-class="active-link">EXPLORE</NuxtLink>
                <NuxtLink to="/post" class="nav-btn" active-class="active-link">POST</NuxtLink>
                <NuxtLink to="/account" class="nav-btn" active-class="active-link">ACCOUNT</NuxtLink>
                <NuxtLink to="/support" class="nav-btn" active-class="active-link">SUPPORT</NuxtLink>
            </div>

        </div>
    </nav>
</template>

<script setup>
</script>

<style scoped>
.navbar {
    background-color: rgb(255, 255, 255);
    font-family: arial;
}

.navbar-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 100%;
    margin-bottom: 15px;
}

.logo img {
    height: 80px;
    width: 120px;
}

.nav-links {
    display: flex;
    gap: 7.5px;
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
</style>