<template>
  <section class="bg-white py-6 sm:py-8 lg:py-10">
    <div class="page">
      <div
        class="grid items-center gap-6 md:grid-cols-[300px_minmax(0,1fr)] lg:grid-cols-[330px_minmax(0,1fr)] lg:gap-8"
      >
        <!-- ================================================== -->
        <!-- IMAGE -->
        <!-- ================================================== -->

        <div class="overflow-hidden rounded-2xl bg-slate-100">
          <img
            :src="about.image"
            :alt="about.subtitle"
            class="h-[230px] w-full object-cover sm:h-[250px] md:h-[260px] lg:h-[270px]"
          />
        </div>

        <!-- ================================================== -->
        <!-- CONTENT -->
        <!-- ================================================== -->

        <div class="min-w-0">
          <!-- ABOUT -->

          <p
            class="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600"
          >
            About Us
          </p>

          <!-- TITLE -->

          <h2
            class="mt-2 max-w-4xl text-2xl font-bold leading-tight tracking-tight text-heading lg:text-3xl"
          >
            {{ about.subtitle }}
          </h2>

          <!-- DESCRIPTION -->

          <p
            class="mt-3 max-w-4xl text-sm leading-6 text-muted sm:text-base sm:leading-7"
          >
            {{ previewText }}
          </p>

          <!-- ================================================== -->
          <!-- BUTTON + STATS -->
          <!-- ================================================== -->

          <div
            class="mt-5 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"
          >
            <!-- BUTTON -->

            <RouterLink
              to="/about"
              class="group inline-flex w-fit shrink-0 items-center gap-3 rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold text-heading transition duration-200 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600"
            >
              Read More About Us

              <i
                class="pi pi-chevron-right text-xs transition duration-200 group-hover:translate-x-1"
              />
            </RouterLink>

            <!-- STATS -->

            <div
              class="grid flex-1 grid-cols-3 gap-5 sm:gap-8 lg:max-w-[520px]"
            >
              <div
                v-for="stat in about.stats"
                :key="stat.label"
                class="min-w-0"
              >
                <p class="text-xl font-bold text-primary-500 sm:text-2xl">
                  {{ stat.value }}
                </p>

                <p class="mt-0.5 text-xs leading-5 text-body sm:text-sm">
                  {{ stat.label }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";

import { aboutData } from "../../../data/about.js";

/*
|--------------------------------------------------------------------------
| DATA
|--------------------------------------------------------------------------
*/

const about = aboutData;

/*
|--------------------------------------------------------------------------
| PREVIEW TEXT
|--------------------------------------------------------------------------
*/

const previewText = computed(() => {
  const text = String(about.content || "")
    .replace(/\s+/g, " ")
    .trim();

  /*
   * Keep Home page text short.
   * Full content is shown in /about.
   */

  const maxLength = 230;

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trim()}...`;
});
</script>
