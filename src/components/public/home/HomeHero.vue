<template>
  <section
    class="relative isolate min-h-[560px] overflow-hidden sm:min-h-[620px] lg:min-h-[680px]"
  >
    <!-- ======================================================
         BACKGROUND IMAGE
    ======================================================= -->

    <img
      src="https://res.cloudinary.com/dvljcimlz/image/upload/v1788886027/Mask_group_mw8ky8.png"
      alt="Koh Rong tropical island"
      class="absolute inset-0 -z-30 h-full w-full object-cover"
    />

    <!-- ======================================================
         DARK OVERLAY
         Keep this neutral — not primary-900/950
    ======================================================= -->

    <!-- LIGHT HERO OVERLAY -->

    <div
      class="absolute inset-0 -z-20 bg-gradient-to-r from-slate-700/45 via-slate-600/25 to-transparent"
    />

    <!-- ======================================================
         BOTTOM OVERLAY
    ======================================================= -->

    <div
      class="absolute inset-0 -z-10 bg-gradient-to-t from-black/35 via-transparent to-transparent"
    />

    <!-- ======================================================
         CONTENT
    ======================================================= -->

    <div
      class="page flex min-h-[560px] flex-col justify-center py-12 sm:min-h-[620px] lg:min-h-[680px] lg:py-20"
    >
      <div class="mx-auto w-full max-w-4xl text-center sm:mx-0 sm:text-left">
        <!-- ==================================================
             DISCOVER PARADISE
        =================================================== -->

        <div
          class="relative inline-flex items-center justify-center overflow-hidden rounded-full border border-primary-500/50 bg-white/[0.08] px-6 py-2.5 text-sm font-semibold text-primary-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_8px_24px_rgba(0,0,0,0.10)] backdrop-blur-[18px] before:pointer-events-none before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-b before:from-white/[0.14] before:via-white/[0.04] before:to-transparent before:content-[''] after:pointer-events-none after:absolute after:left-[10%] after:right-[10%] after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-primary-500/80 after:to-transparent after:content-[''] sm:px-7 sm:py-3 sm:text-base"
        >
          <span class="relative z-10"> Discover Paradise </span>
        </div>

        <!-- MOBILE TITLE -->
        <h1
          class="mt-5 text-center text-[30px] font-bold leading-[1.15] tracking-tight text-white min-[390px]:text-[34px] sm:hidden"
        >
          <span class="block"> Explore Koh Rong </span>

          <span class="mt-1 block"> The Best Way to Discover the Island </span>
        </h1>

        <!-- TABLET / DESKTOP TITLE -->
        <h1
          class="mt-5 hidden max-w-4xl font-bold leading-[1.08] tracking-tight text-white sm:block sm:text-5xl lg:text-6xl xl:text-7xl"
        >
          Explore Koh Rong

          <span class="mt-1 block"> The Best Way to Discover the Island </span>
        </h1>
        <p
          class="mx-auto mt-5 max-w-3xl text-center text-sm leading-7 text-white/90 sm:mx-0 sm:text-left sm:text-base sm:leading-8 lg:text-lg"
        >
          private and sharing boat trips, island tours by tuk-tuk, jungle
          trekking and pagoda tours, fishing and snorkeling, sunset experiences,
          scooter rentals, taxi pick up, accommodation assistance
        </p>

        <!-- ==================================================
             ACTIONS
        =================================================== -->

        <div
          class="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap sm:justify-start"
        >
          <!-- ==================================================
               DISCOVER TOURS
          =================================================== -->

          <RouterLink
            to="/services"
            class="group relative inline-flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full border border-primary-500/60 bg-white/[0.08] px-6 py-3.5 text-sm font-semibold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-[18px] transition duration-300 before:pointer-events-none before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-b before:from-white/[0.15] before:via-white/[0.04] before:to-transparent before:content-[''] after:pointer-events-none after:absolute after:left-[10%] after:right-[10%] after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-primary-500/80 after:to-transparent after:content-[''] hover:-translate-y-0.5 hover:border-primary-500 hover:bg-white/[0.13] sm:w-auto"
          >
            <span class="relative z-10"> Discover Tours </span>

            <Icon
              icon="ri:arrow-right-line"
              class="relative z-10 h-4 w-4 text-primary-500 transition duration-300 group-hover:translate-x-1"
            />
          </RouterLink>

          <!-- ==================================================
               CONTACT
          =================================================== -->

          <RouterLink
            to="/contact"
            class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition duration-200 hover:-translate-y-0.5 hover:bg-primary-600 sm:w-auto"
          >
            Contact Us
          </RouterLink>
        </div>
      </div>

      <!-- ======================================================
           HERO FEATURES
      ======================================================= -->

      <div
        class="mt-10 grid max-w-5xl grid-cols-2 gap-x-4 gap-y-5 border-t border-white/15 pt-6 sm:grid-cols-4 lg:mt-14 lg:gap-6"
      >
        <div
          v-for="feature in heroFeatures"
          :key="feature.title"
          class="flex items-start justify-center gap-3 text-center sm:justify-start sm:text-left"
        >
          <!-- ICON -->

          <div
            class="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-primary-500/30 bg-primary-500/15 text-primary-500 sm:h-10 sm:w-10"
          >
            <Icon :icon="feature.icon" class="h-[18px] w-[18px]" />
          </div>

          <!-- TEXT -->

          <div class="min-w-0">
            <p class="text-xs font-semibold text-white sm:text-sm">
              {{ feature.title }}
            </p>

            <p class="mt-0.5 hidden text-xs leading-5 text-white/70 md:block">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { Icon } from "@iconify/vue";

/*
|--------------------------------------------------------------------------
| HERO FEATURES
|--------------------------------------------------------------------------
*/

const heroFeatures = [
  {
    title: "Local Guides",

    description: "Expert local knowledge",

    icon: "ri:map-pin-2-fill",
  },

  {
    title: "Best Price",

    description: "Affordable & transparent",

    icon: "ri:money-dollar-circle-fill",
  },

  {
    title: "Safe & Reliable",

    description: "Your safety is our priority",

    icon: "ri:shield-check-fill",
  },

  {
    title: "Island Experience",

    description: "Unforgettable moments",

    icon: "ri:sun-fill",
  },
];
</script>
