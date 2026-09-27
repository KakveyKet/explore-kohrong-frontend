<template>
  <footer class="bg-primary-500 text-white">
    <div class="page">
      <!-- ====================================================== -->
      <!-- MAIN FOOTER -->
      <!-- ====================================================== -->

      <div
        class="grid gap-10 py-10 md:grid-cols-2 lg:grid-cols-[1.5fr_0.65fr_0.9fr] lg:gap-14 lg:py-12"
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

          <!-- ================================================== -->
          <!-- SOCIAL -->
          <!-- ================================================== -->

          <div class="mt-5 flex flex-wrap items-center gap-3">
            <!-- FACEBOOK -->

            <a
              v-if="facebookUrl"
              :href="facebookUrl"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              class="social-button"
            >
              <i class="pi pi-facebook" />
            </a>

            <!-- TELEGRAM -->

            <a
              :href="telegramUrl"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              class="social-button"
            >
              <i class="pi pi-send" />
            </a>

            <!-- INSTAGRAM -->

            <a
              v-if="instagramUrl"
              :href="instagramUrl"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              class="social-button"
            >
              <i class="pi pi-instagram" />
            </a>

            <!-- WHATSAPP -->

            <a
              :href="whatsAppUrl"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              class="social-button"
            >
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

          <div class="mt-5 space-y-4">
            <!-- PHONE -->

            <a
              :href="phoneUrl"
              class="group flex items-start gap-3 text-sm text-white/85 transition hover:text-white"
            >
              <i class="pi pi-phone mt-0.5 shrink-0 text-sm" />

              <span class="min-w-0 break-words font-semibold">
                {{ phoneDisplay }}
              </span>
            </a>

            <!-- EMAIL -->

            <a
              :href="emailUrl"
              class="group flex items-start gap-3 text-sm text-white/85 transition hover:text-white"
            >
              <i class="pi pi-envelope mt-0.5 shrink-0 text-sm" />

              <span class="min-w-0 break-all font-semibold">
                {{ businessEmail }}
              </span>
            </a>

            <!-- TELEGRAM -->

            <a
              :href="telegramUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="group flex items-start gap-3 text-sm text-white/85 transition hover:text-white"
            >
              <i class="pi pi-send mt-0.5 shrink-0 text-sm" />

              <span class="min-w-0 break-words font-semibold">
                @norea_yem
              </span>
            </a>

            <!-- WHATSAPP -->

            <a
              :href="whatsAppUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="group flex items-start gap-3 text-sm text-white/85 transition hover:text-white"
            >
              <i class="pi pi-whatsapp mt-0.5 shrink-0 text-sm" />

              <span class="min-w-0 break-words font-semibold"> WhatsApp </span>
            </a>

            <!-- LOCATION -->

            <a
              :href="googleMapsUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="group flex items-start gap-3 text-sm leading-6 text-white/75 transition hover:text-white"
            >
              <i class="pi pi-map-marker mt-1 shrink-0" />

              <span class="min-w-0 break-words">
                Koh Rong Island, Preah Sihanouk Province, Cambodia
              </span>
            </a>
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

/*
|--------------------------------------------------------------------------
| CONTACT
|--------------------------------------------------------------------------
*/

const businessEmail =
  import.meta.env.VITE_BUSINESS_EMAIL ||
  import.meta.env.VITE_BOOKING_EMAIL ||
  "explorekohrong@gmail.com";

/*
|--------------------------------------------------------------------------
| PHONE
|--------------------------------------------------------------------------
*/

const phoneDisplay = "+855 88 579 2065";

const phoneUrl = "tel:+855885792065";

/*
|--------------------------------------------------------------------------
| EMAIL
|--------------------------------------------------------------------------
*/

const emailUrl = computed(() => {
  return `mailto:${businessEmail}`;
});

/*
|--------------------------------------------------------------------------
| WHATSAPP
|--------------------------------------------------------------------------
*/

const whatsAppNumber = String(
  import.meta.env.VITE_WHATSAPP_BUSINESS_NUMBER || "855885792065",
).replace(/\D/g, "");

const whatsAppUrl = computed(() => {
  return `https://wa.me/${whatsAppNumber}`;
});

/*
|--------------------------------------------------------------------------
| TELEGRAM
|--------------------------------------------------------------------------
*/

const telegramUrl =
  import.meta.env.VITE_TELEGRAM_URL || "https://t.me/norea_yem";

/*
|--------------------------------------------------------------------------
| FACEBOOK
|--------------------------------------------------------------------------
|
| Facebook is hidden until a real URL is configured.
|
*/

const facebookUrl = import.meta.env.VITE_FACEBOOK_URL || "";

/*
|--------------------------------------------------------------------------
| INSTAGRAM
|--------------------------------------------------------------------------
|
| Instagram is hidden until a real URL is configured.
|
*/

const instagramUrl = import.meta.env.VITE_INSTAGRAM_URL || "";

/*
|--------------------------------------------------------------------------
| GOOGLE MAPS
|--------------------------------------------------------------------------
*/

const googleMapsUrl =
  "https://maps.google.com/maps?q=10.715007,103.286634&ll=10.715007,103.286634&z=16";

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
/*
|--------------------------------------------------------------------------
| SOCIAL BUTTON
|--------------------------------------------------------------------------
*/

.social-button {
  @apply grid h-9 w-9 place-items-center rounded-full bg-white text-primary-700 transition duration-200 hover:-translate-y-0.5 hover:bg-secondary-100;
}
</style>
