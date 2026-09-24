<template>
  <main class="bg-white">
    <!-- ======================================================
         HERO COVER
    ======================================================= -->

    <section class="relative overflow-hidden bg-primary-900">
      <!-- IMAGE -->

      <img
        :src="about.image"
        :alt="about.subtitle"
        class="absolute inset-0 h-full w-full object-cover"
      />

      <!-- MAIN OVERLAY -->

      <div
        class="absolute inset-0 bg-gradient-to-r from-primary-950/95 via-primary-900/75 to-primary-800/25"
      />

      <!-- BOTTOM OVERLAY -->

      <div
        class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"
      />

      <!-- CONTENT -->

      <div
        class="page relative z-10 flex min-h-[340px] items-center py-14 sm:min-h-[400px] sm:py-16 lg:min-h-[440px]"
      >
        <div class="max-w-3xl">
          <!-- EYEBROW -->

          <p
            class="text-xs font-semibold uppercase tracking-[0.2em] text-secondary-200 sm:text-sm"
          >
            Explore Koh Rong
          </p>

          <!-- TITLE -->

          <h1
            class="mt-3 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            {{ about.title }}
          </h1>

          <!-- SUBTITLE -->

          <p
            class="mt-4 max-w-2xl text-base leading-7 text-white sm:text-lg sm:leading-8"
          >
            {{ about.subtitle }}
          </p>
        </div>
      </div>
    </section>

    <!-- ======================================================
         ABOUT CONTENT
    ======================================================= -->

    <section class="py-12 sm:py-16 lg:py-20">
      <div
        class="page grid items-start gap-10 lg:grid-cols-[420px_1fr] lg:gap-14"
      >
        <!-- ==================================================
             LEFT IMAGE
        =================================================== -->

        <div class="lg:sticky lg:top-28">
          <!-- IMAGE -->

          <div class="overflow-hidden rounded-3xl bg-surface-soft">
            <img
              :src="about.image"
              :alt="about.subtitle"
              class="h-[340px] w-full object-cover transition duration-500 hover:scale-[1.02] sm:h-[420px]"
            />
          </div>

          <!-- ==================================================
               STATS
          =================================================== -->

          <div class="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
            <div
              v-for="stat in about.stats"
              :key="stat.label"
              class="rounded-2xl border border-border bg-white px-3 py-4 text-center shadow-sm sm:p-4"
            >
              <!-- VALUE -->

              <p class="text-xl font-bold text-primary-600 sm:text-2xl">
                {{ stat.value }}
              </p>

              <!-- LABEL -->

              <p class="mt-1 text-xs leading-5 text-black">
                {{ stat.label }}
              </p>
            </div>
          </div>
        </div>

        <!-- ==================================================
             RIGHT CONTENT
        =================================================== -->

        <article>
          <!-- EYEBROW -->

          <p
            class="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600 sm:text-sm"
          >
            Discover Our Island
          </p>

          <!-- TITLE -->

          <h2
            class="mt-3 text-3xl font-bold leading-tight tracking-tight text-heading lg:text-4xl"
          >
            {{ about.subtitle }}
          </h2>

          <!-- ==================================================
               FULL TEXT
          =================================================== -->

          <div class="mt-6 space-y-5">
            <p
              v-for="(paragraph, index) in paragraphs"
              :key="index"
              class="text-sm leading-7 text-black sm:text-base sm:leading-8"
            >
              {{ paragraph }}
            </p>
          </div>

          <!-- ==================================================
               FEATURES
          =================================================== -->

          <div class="mt-9 grid gap-4 sm:grid-cols-2">
            <div
              v-for="item in features"
              :key="item.title"
              class="group flex items-start gap-4 rounded-2xl border border-border bg-surface-soft p-5 transition duration-300 hover:-translate-y-0.5 hover:border-primary-200 hover:bg-primary-50/50"
            >
              <!-- ICON -->

              <div
                class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-600 transition duration-300 group-hover:bg-primary-500 group-hover:text-white"
              >
                <Icon :icon="item.icon" class="h-5 w-5" />
              </div>

              <!-- CONTENT -->

              <div>
                <h3 class="font-semibold text-heading">
                  {{ item.title }}
                </h3>

                <p class="mt-1 text-sm leading-6 text-black">
                  {{ item.description }}
                </p>
              </div>
            </div>
          </div>

          <!-- ==================================================
               CTA
          =================================================== -->

          <div class="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <!-- SERVICES -->

            <RouterLink
              to="/services"
              class="group inline-flex items-center justify-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-primary-600"
            >
              Explore Services

              <Icon
                icon="ri:arrow-right-line"
                class="h-4 w-4 transition duration-300 group-hover:translate-x-1"
              />
            </RouterLink>

            <!-- CONTACT -->

            <RouterLink
              to="/contact"
              class="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white px-6 py-3 text-sm font-semibold text-heading transition duration-200 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-600"
            >
              <Icon icon="ri:customer-service-2-fill" class="h-4 w-4" />

              Contact Us
            </RouterLink>
          </div>
        </article>
      </div>
    </section>

    <!-- ======================================================
         BOTTOM CTA
    ======================================================= -->

    <section class="border-t border-border bg-surface-soft">
      <div
        class="page flex flex-col gap-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:py-10"
      >
        <div class="max-w-2xl">
          <!-- EYEBROW -->

          <p
            class="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600"
          >
            Ready To Explore?
          </p>

          <!-- TITLE -->

          <h2 class="mt-2 text-2xl font-bold text-heading sm:text-3xl">
            Start Your Koh Rong Adventure
          </h2>

          <!-- DESCRIPTION -->

          <p class="mt-2 text-sm leading-6 text-black sm:text-base">
            Discover island activities, transport, tours and local experiences
            all in one place.
          </p>
        </div>

        <!-- BUTTON -->

        <RouterLink
          to="/services"
          class="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-primary-600"
        >
          View Services

          <Icon
            icon="ri:arrow-right-line"
            class="h-4 w-4 transition duration-300 group-hover:translate-x-1"
          />
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed } from "vue";

import { Icon } from "@iconify/vue";

import { aboutData } from "../../data/about.js";

/*
|--------------------------------------------------------------------------
| ABOUT DATA
|--------------------------------------------------------------------------
*/

const about = aboutData;

/*
|--------------------------------------------------------------------------
| PARAGRAPHS
|--------------------------------------------------------------------------
*/

const paragraphs = computed(() => {
  return String(about.content || "")
    .trim()
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean);
});

/*
|--------------------------------------------------------------------------
| FEATURES
|--------------------------------------------------------------------------
*/

const features = [
  {
    title: "Beautiful Beaches",

    description:
      "Discover white sand, clear water and peaceful tropical scenery.",

    icon: "ri:sun-fill",
  },

  {
    title: "Island Activities",

    description:
      "Boat trips, snorkeling, transport, rentals and local experiences.",

    icon: "ri:compass-3-fill",
  },

  {
    title: "Local Knowledge",

    description: "Helpful information from people who understand the island.",

    icon: "ri:map-pin-2-fill",
  },

  {
    title: "Easy Booking",

    description:
      "Discover and request local services from one simple platform.",

    icon: "ri:calendar-check-fill",
  },
];
</script>
