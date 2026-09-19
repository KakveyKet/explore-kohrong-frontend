<script setup>
import { computed, onMounted, ref } from "vue";

import { useRouter } from "vue-router";

import { Icon } from "@iconify/vue";

import api from "../../services/api.js";

/*
|--------------------------------------------------------------------------
| ROUTER
|--------------------------------------------------------------------------
*/

const router = useRouter();

/*
|--------------------------------------------------------------------------
| STATE
|--------------------------------------------------------------------------
*/

const services = ref([]);

const loading = ref(true);

const error = ref("");

const currentPage = ref(1);

const pageSize = 6;

/*
|--------------------------------------------------------------------------
| COVER IMAGE
|--------------------------------------------------------------------------
|
| Change this URL to your own Koh Rong cover image later.
|
*/

const coverImage =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80";

/*
|--------------------------------------------------------------------------
| FEATURES
|--------------------------------------------------------------------------
*/

const features = [
  {
    icon: "ri:guide-line",

    title: "Local Guides",

    description: "Expert local knowledge",
  },

  {
    icon: "ri:money-dollar-circle-line",

    title: "Best Price",

    description: "Affordable & transparent",
  },

  {
    icon: "ri:shield-check-line",

    title: "Safe & Reliable",

    description: "Your safety is our priority",
  },

  {
    icon: "ri:landscape-line",

    title: "Island Experience",

    description: "Unforgettable moments",
  },
];

/*
|--------------------------------------------------------------------------
| NORMALIZE RESPONSE
|--------------------------------------------------------------------------
*/

function normalizeServices(response) {
  const data = response?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.services)) {
    return data.services;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

/*
|--------------------------------------------------------------------------
| LOAD SERVICES
|--------------------------------------------------------------------------
*/

async function loadServices() {
  loading.value = true;

  error.value = "";

  try {
    const response = await api.get("/services");

    services.value = normalizeServices(response).filter(
      (item) => String(item?.status || "ACTIVE").toUpperCase() === "ACTIVE",
    );

    currentPage.value = 1;
  } catch (err) {
    console.error("[SERVICES ERROR]", err);

    error.value = err?.response?.data?.message || "Unable to load services.";

    services.value = [];
  } finally {
    loading.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| SERVICE IMAGE
|--------------------------------------------------------------------------
*/

function serviceImage(item) {
  return item?.thumbnail || item?.images?.[0] || "";
}

/*
|--------------------------------------------------------------------------
| CATEGORY
|--------------------------------------------------------------------------
*/

function categoryName(item) {
  const category = item?.cate_id;

  if (category && typeof category === "object") {
    return category.name || "Service";
  }

  return "Service";
}

/*
|--------------------------------------------------------------------------
| PRICE
|--------------------------------------------------------------------------
*/

function formatPrice(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-US", {
    style: "currency",

    currency: "USD",

    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,

    maximumFractionDigits: 2,
  }).format(amount);
}

/*
|--------------------------------------------------------------------------
| DESCRIPTION
|--------------------------------------------------------------------------
*/

function cleanDescription(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/*
|--------------------------------------------------------------------------
| PAGINATION
|--------------------------------------------------------------------------
*/

const totalResults = computed(() => {
  return services.value.length;
});

const totalPages = computed(() => {
  return Math.max(
    1,

    Math.ceil(totalResults.value / pageSize),
  );
});

const paginatedServices = computed(() => {
  const start = (currentPage.value - 1) * pageSize;

  const end = start + pageSize;

  return services.value.slice(start, end);
});

/*
|--------------------------------------------------------------------------
| VISIBLE PAGE NUMBERS
|--------------------------------------------------------------------------
*/

const visiblePages = computed(() => {
  const total = totalPages.value;

  const current = currentPage.value;

  /*
   * Small number of pages.
   */

  if (total <= 5) {
    return Array.from(
      {
        length: total,
      },

      (_, index) => index + 1,
    );
  }

  /*
   * Beginning.
   */

  if (current <= 3) {
    return [1, 2, 3, 4, 5];
  }

  /*
   * End.
   */

  if (current >= total - 2) {
    return [total - 4, total - 3, total - 2, total - 1, total];
  }

  /*
   * Middle.
   */

  return [current - 2, current - 1, current, current + 1, current + 2];
});

/*
|--------------------------------------------------------------------------
| CHANGE PAGE
|--------------------------------------------------------------------------
*/

function goToPage(page) {
  if (page < 1 || page > totalPages.value || page === currentPage.value) {
    return;
  }

  currentPage.value = page;

  window.scrollTo({
    top: 260,

    behavior: "smooth",
  });
}

/*
|--------------------------------------------------------------------------
| SERVICE DETAILS
|--------------------------------------------------------------------------
|
| New process:
|
| Services -> Service Details -> Booking
|
*/

function viewService(item) {
  const id = String(item?._id || "").trim();

  if (!id || !/^[a-fA-F0-9]{24}$/.test(id)) {
    return;
  }

  router.push({
    name: "service-detail",

    params: {
      id,
    },
  });
}

/*
|--------------------------------------------------------------------------
| INIT
|--------------------------------------------------------------------------
*/

onMounted(loadServices);
</script>

<template>
  <main class="min-h-screen bg-white pb-16">
    <!-- ======================================================
         SMALL COVER
    ======================================================= -->

    <section class="relative overflow-hidden border-b border-border">
      <!-- BACKGROUND -->

      <div class="absolute inset-0">
        <img
          :src="coverImage"
          alt="Koh Rong"
          class="h-full w-full object-cover"
        />

        <div
          class="absolute inset-0 bg-gradient-to-r from-cyan-50/95 via-cyan-50/80 to-white/20"
        />
      </div>

      <!-- CONTENT -->

      <div class="page relative z-10">
        <div
          class="flex min-h-[190px] flex-col justify-between py-7 sm:min-h-[200px] sm:py-8"
        >
          <!-- TITLE -->

          <div>
            <h1 class="text-2xl font-bold text-heading sm:text-3xl">
              Our Services
            </h1>

            <p class="mt-1 text-xs text-slate-700 sm:text-sm">
              Discover amazing experiences and explore the best of Koh Rong.
            </p>
          </div>

          <!-- FEATURES -->

          <div
            class="mt-8 grid grid-cols-2 gap-x-4 gap-y-4 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-7 lg:gap-10"
          >
            <div
              v-for="feature in features"
              :key="feature.title"
              class="flex items-center gap-2"
            >
              <!-- ICON -->

              <div
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary-400 bg-white/80 text-primary-600"
              >
                <Icon :icon="feature.icon" class="text-base" />
              </div>

              <!-- TEXT -->

              <div>
                <p
                  class="text-[11px] font-semibold leading-tight text-heading sm:text-xs"
                >
                  {{ feature.title }}
                </p>

                <p
                  class="mt-0.5 text-[9px] leading-tight text-slate-600 sm:text-[10px]"
                >
                  {{ feature.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ======================================================
         SERVICES
    ======================================================= -->

    <section class="page py-8 sm:py-10">
      <div class="mx-auto max-w-6xl">
        <!-- ==================================================
             RESULT + PAGINATION HEADER
        =================================================== -->

        <div
          class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <h2 class="text-lg font-bold text-heading">
            Show all
            {{ totalResults }}
            results
          </h2>

          <!-- TOP PAGINATION -->

          <div
            v-if="!loading && totalPages > 1"
            class="flex items-center gap-1"
          >
            <!-- PREVIOUS -->

            <button
              type="button"
              class="flex h-7 w-7 items-center justify-center rounded-md text-xs text-muted transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
            >
              <Icon icon="ri:arrow-left-s-line" />
            </button>

            <!-- PAGE -->

            <button
              v-for="page in visiblePages"
              :key="page"
              type="button"
              class="flex h-7 min-w-7 items-center justify-center rounded-md px-2 text-xs font-medium transition"
              :class="
                currentPage === page
                  ? 'bg-primary-500 text-white'
                  : 'bg-slate-50 text-muted hover:bg-slate-100'
              "
              @click="goToPage(page)"
            >
              {{ page }}
            </button>

            <!-- NEXT -->

            <button
              type="button"
              class="flex h-7 w-7 items-center justify-center rounded-md text-xs text-muted transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1)"
            >
              <Icon icon="ri:arrow-right-s-line" />
            </button>
          </div>
        </div>

        <!-- ==================================================
             LOADING
        =================================================== -->

        <div v-if="loading" class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="item in 6"
            :key="item"
            class="overflow-hidden rounded-xl border border-border bg-white"
          >
            <div class="aspect-[16/9] animate-pulse bg-slate-200" />

            <div class="space-y-3 p-4">
              <div class="h-3 w-16 animate-pulse rounded bg-slate-200" />

              <div class="h-5 w-full animate-pulse rounded bg-slate-200" />

              <div class="h-5 w-3/4 animate-pulse rounded bg-slate-100" />

              <div
                class="ml-auto h-9 w-24 animate-pulse rounded-full bg-slate-200"
              />
            </div>
          </div>
        </div>

        <!-- ==================================================
             ERROR
        =================================================== -->

        <div
          v-else-if="error"
          class="rounded-xl border border-red-200 bg-red-50 p-8 text-center"
        >
          <Icon
            icon="ri:error-warning-line"
            class="mx-auto text-4xl text-red-500"
          />

          <p class="mt-3 text-sm text-red-700">
            {{ error }}
          </p>

          <button
            type="button"
            class="mt-5 rounded-full bg-primary-500 px-5 py-2 text-xs font-semibold text-white transition hover:bg-primary-600"
            @click="loadServices"
          >
            Try Again
          </button>
        </div>

        <!-- ==================================================
             CARDS
        =================================================== -->

        <div
          v-else-if="paginatedServices.length"
          class="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          <article
            v-for="item in paginatedServices"
            :key="item._id"
            class="group overflow-hidden rounded-xl border border-border bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <!-- ==============================================
                 IMAGE
            =============================================== -->

            <button
              type="button"
              class="relative block aspect-[16/9] w-full overflow-hidden bg-slate-100 text-left"
              @click="viewService(item)"
            >
              <img
                v-if="serviceImage(item)"
                :src="serviceImage(item)"
                :alt="item.name"
                class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />

              <div v-else class="flex h-full items-center justify-center">
                <Icon icon="ri:image-line" class="text-5xl text-slate-300" />
              </div>

              <!-- PRICE -->

              <span
                class="absolute bottom-0 left-3 rounded-t-md bg-primary-500 px-2.5 py-1 text-[10px] font-semibold text-white"
              >
                {{ formatPrice(item.price) }}
              </span>
            </button>

            <!-- ==============================================
                 CARD BODY
            =============================================== -->

            <div class="flex min-h-[145px] flex-col p-4">
              <!-- CATEGORY -->

              <p
                class="text-[10px] font-semibold uppercase tracking-wide text-primary-600"
              >
                {{ categoryName(item) }}
              </p>

              <!-- NAME -->

              <button
                type="button"
                class="mt-1 text-left"
                @click="viewService(item)"
              >
                <h3
                  class="line-clamp-2 text-sm font-semibold leading-5 text-heading transition group-hover:text-primary-600"
                >
                  {{ item.name }}
                </h3>
              </button>

              <!-- DESCRIPTION -->

              <p
                v-if="cleanDescription(item.description)"
                class="mt-2 line-clamp-2 text-[11px] leading-4 text-muted"
              >
                {{ cleanDescription(item.description) }}
              </p>

              <!-- READ MORE -->

              <div class="mt-auto flex justify-end pt-4">
                <button
                  type="button"
                  class="inline-flex h-9 items-center gap-1 rounded-full bg-primary-500 px-4 text-xs font-medium text-white transition hover:bg-primary-600"
                  @click="viewService(item)"
                >
                  Read More

                  <Icon icon="ri:arrow-right-s-line" class="text-base" />
                </button>
              </div>
            </div>
          </article>
        </div>

        <!-- ==================================================
             EMPTY
        =================================================== -->

        <div
          v-else
          class="rounded-xl border border-border bg-white p-12 text-center"
        >
          <Icon
            icon="ri:briefcase-line"
            class="mx-auto text-4xl text-slate-300"
          />

          <h3 class="mt-3 font-semibold text-heading">No services available</h3>

          <p class="mt-1 text-sm text-muted">Please check again later.</p>
        </div>

        <!-- ==================================================
             BOTTOM PAGINATION
        =================================================== -->

        <div v-if="!loading && totalPages > 1" class="mt-8 flex justify-center">
          <div class="flex items-center gap-1">
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-md text-sm text-muted transition hover:bg-slate-100 disabled:opacity-30"
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
            >
              <Icon icon="ri:arrow-left-s-line" />
            </button>

            <button
              v-for="page in visiblePages"
              :key="page"
              type="button"
              class="flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-xs font-medium transition"
              :class="
                currentPage === page
                  ? 'bg-primary-500 text-white'
                  : 'bg-slate-50 text-muted hover:bg-slate-100'
              "
              @click="goToPage(page)"
            >
              {{ page }}
            </button>

            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-md text-sm text-muted transition hover:bg-slate-100 disabled:opacity-30"
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1)"
            >
              <Icon icon="ri:arrow-right-s-line" />
            </button>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
