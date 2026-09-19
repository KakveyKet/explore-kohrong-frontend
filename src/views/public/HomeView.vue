<template>
  <div class="min-h-screen bg-white">
    <HomeHero />

    <HomeServices />

    <HomeAbout />

    <HomeBlogs />

    <Highlight />
  </div>
</template>

<script setup>
import HomeServices from "../../components/public/home/HomeServices.vue";
import HomeHero from "../../components/public/home/HomeHero.vue";
import HomeAbout from "../../components/public/home/HomeAbout.vue";
import HomeBlogs from "../../components/public/home/HomeBlogs.vue";
import Highlight from "../../components/public/home/Highlight.vue";
</script>
