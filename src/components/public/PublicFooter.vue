<template>
  <footer class="bg-primary-700 text-white">
    <div class="page">
      <!-- ====================================================== -->
      <!-- MAIN FOOTER -->
      <!-- ====================================================== -->

      <div
        class="grid gap-10 py-10 md:grid-cols-2 lg:grid-cols-[1.5fr_0.65fr_0.8fr] lg:gap-14 lg:py-12"
      >
        <!-- ================================================== -->
        <!-- ABOUT / BRAND -->
        <!-- ================================================== -->

        <div>
          <!-- LOGO -->

          <RouterLink to="/" class="inline-flex">
            <img
              :src="siteConfig.logo"
              alt="Explore Koh Rong"
              class="size-32 w-auto max-w-[190px] object-contain"
            />
          </RouterLink>

          <!-- DESCRIPTION -->

          <p class="mt-5 max-w-xl text-sm leading-6 text-white/75">
            Explore Koh Rong offers authentic island adventures, local services
            and useful travel information to help you discover the beauty of Koh
            Rong. Explore beaches, boat trips, transport, scooter rentals and
            unforgettable local experiences.
          </p>

          <!-- SOCIAL -->

          <div class="mt-5 flex items-center gap-3">
            <!-- FACEBOOK -->

            <a href="#" aria-label="Facebook" class="social-button">
              <i class="pi pi-facebook" />
            </a>

            <!-- TELEGRAM -->

            <a href="#" aria-label="Telegram" class="social-button">
              <i class="pi pi-send" />
            </a>

            <!-- INSTAGRAM -->

            <a href="#" aria-label="Instagram" class="social-button">
              <i class="pi pi-instagram" />
            </a>

            <!-- WHATSAPP -->

            <a href="#" aria-label="WhatsApp" class="social-button">
              <i class="pi pi-whatsapp" />
            </a>
          </div>
        </div>

        <!-- ================================================== -->
        <!-- MENU -->
        <!-- ================================================== -->

        <div>
          <h3 class="text-xl font-bold text-white">Menu</h3>

          <nav class="mt-5 space-y-3">
            <RouterLink
              v-for="item in menuItems"
              :key="item.label"
              :to="item.to"
              class="group flex w-fit items-center gap-2 text-sm font-medium text-white/80 transition hover:text-white"
            >
              <i
                class="pi pi-chevron-right text-[10px] transition group-hover:translate-x-1"
              />

              {{ item.label }}
            </RouterLink>
          </nav>
        </div>

        <!-- ================================================== -->
        <!-- CONTACT -->
        <!-- ================================================== -->

        <div>
          <h3 class="text-xl font-bold text-white">Contact Us</h3>

          <div class="mt-5 space-y-3">
            <a
              href="tel:+855885792065"
              class="flex items-center gap-2 text-sm font-semibold text-white/85 transition hover:text-white"
            >
              <i class="pi pi-phone text-sm" />

              (+855) 885 792 065
            </a>

            <a
              href="tel:+855979938857"
              class="flex items-center gap-2 text-sm font-semibold text-white/85 transition hover:text-white"
            >
              <i class="pi pi-phone text-sm" />

              (+855) 979 938 857
            </a>

            <div
              class="mt-5 flex items-start gap-2 text-sm leading-6 text-white/70"
            >
              <i class="pi pi-map-marker mt-1 shrink-0" />

              <span> Koh Rong Island, Preah Sihanouk Province, Cambodia </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ====================================================== -->
      <!-- COPYRIGHT -->
      <!-- ====================================================== -->

      <div class="border-t border-white/15 py-4 text-center">
        <p class="text-xs text-white/65">
          © {{ currentYear }} Explore Koh Rong. All Rights Reserved.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from "vue";
import { siteConfig } from "../../config/site.js";
import { Icon } from "@iconify/vue";

/*
|--------------------------------------------------------------------------
| MENU
|--------------------------------------------------------------------------
*/

const menuItems = [
  {
    label: "Home",
    to: "/",
  },

  {
    label: "Services",
    to: "/services",
  },

  {
    label: "Blogs",
    to: "/blogs",
  },

  {
    label: "About Us",
    to: "/about",
  },

  {
    label: "Contact",
    to: "/contact",
  },
];

/*
|--------------------------------------------------------------------------
| YEAR
|--------------------------------------------------------------------------
*/

const currentYear = computed(() => {
  return new Date().getFullYear();
});
</script>

<style scoped>
.social-button {
  @apply grid h-9 w-9 place-items-center rounded-full bg-white text-primary-700 transition duration-200 hover:-translate-y-0.5 hover:bg-secondary-100;
}
</style>
