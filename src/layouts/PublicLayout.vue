<template>
  <div class="flex min-h-screen flex-col bg-white">
    <!-- NAVIGATION -->

    <PublicNavbar />

    <!-- PAGE -->

    <main class="flex-1">
      <RouterView />
    </main>

    <!-- FOOTER -->

    <PublicFooter />
  </div>
</template>

<script setup>
import { RouterView } from "vue-router";

import PublicNavbar from "../components/public/PublicNavbar.vue";

import PublicFooter from "../components/public/PublicFooter.vue";
</script>
