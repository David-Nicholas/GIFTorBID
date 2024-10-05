<template>
    <nav class="navbar">
        <div class="navbar-container">

            <div class="logo">
                <NuxtLink to="/"><img src="../assets/logo.png" alt="Logo" /></NuxtLink>
            </div>

            <div class="nav-links">
                <NuxtLink to="/account" class="nav-btn" active-class="active-link"> 
                    <img src="https://api.iconify.design/material-symbols:close-rounded.svg" alt="Close" class="close-icon" />
                </NuxtLink>
            </div>

        </div>
    </nav>
</template>

<script setup>
</script>

<style scoped>
.navbar {
    background-color: rgb(255, 255, 255);
    font-family: Arial, sans-serif;
}

.navbar-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 100%;
    margin-bottom: 15px;
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
