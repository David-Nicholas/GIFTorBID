<template>
    <nav class="navbar">
        <div class="navbar-container">

            <div class="logo">
                <NuxtLink to="/"><img src="../assets/logo.png" alt="Logo" /></NuxtLink>
            </div>

            <div class="nav-links">
                <NuxtLink to="/" class="nav-btn" active-class="active-link">EXPLORE</NuxtLink>
                <NuxtLink to="/post" class="nav-btn" active-class="active-link">POST</NuxtLink>
                <NuxtLink to="/aquisitions" class="nav-btn" active-class="active-link">ACQUISITIONS</NuxtLink>
                <NuxtLink to="/account" class="nav-btn" active-class="active-link">ACCOUNT</NuxtLink>
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


@media (max-width: 768px) {
    .navbar-container {
        flex-direction: column; 
        align-items: center;   
    }

    .nav-links {
        margin-top: 10px; 
        flex-direction: column; 
        align-items: center;
    }

    .nav-btn {
        margin: 4px 0; 
        padding: 10px; 
    }
}

.logo img {
    height: 60px;
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

