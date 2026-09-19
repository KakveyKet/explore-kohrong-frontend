<script setup>
import { computed, onMounted, ref } from "vue";

import { useRouter } from "vue-router";

import { Icon } from "@iconify/vue";

import api from "../../../services/api.js";

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

const errorMessage = ref("");

/*
|--------------------------------------------------------------------------
| NORMALIZE SERVICES
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
| DISPLAY ONLY 3 SERVICES
|--------------------------------------------------------------------------
*/

const displayedServices = computed(() => {
  return services.value
    .filter(
      (service) =>
        service?._id &&
        String(service.status || "ACTIVE").toUpperCase() === "ACTIVE",
    )
    .slice(0, 3);
});

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
  if (item?.cate_id && typeof item.cate_id === "object") {
    return item.cate_id.name || "Service";
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
| PLAIN TEXT
|--------------------------------------------------------------------------
*/

function plainText(value) {
  const html = String(value || "");

  if (!html) {
    return "";
  }

  /*
   * Browser environment.
   */

  const element = document.createElement("div");

  element.innerHTML = html;

  return String(element.textContent || element.innerText || "")
    .replace(/\s+/g, " ")
    .trim();
}

/*
|--------------------------------------------------------------------------
| VIEW SERVICE DETAIL
|--------------------------------------------------------------------------
|
| New flow:
|
| Home
|   ↓
| Service Detail
|   ↓
| Booking
|
*/

function viewService(item) {
  const id = String(item?._id || "").trim();

  /*
  |--------------------------------------------------------------------------
  | VALIDATE MONGO ID
  |--------------------------------------------------------------------------
  */

  if (!id || !/^[a-fA-F0-9]{24}$/.test(id)) {
    return;
  }

  /*
  |--------------------------------------------------------------------------
  | GO TO SERVICE DETAIL
  |--------------------------------------------------------------------------
  */

  router.push({
    name: "service-detail",

    params: {
      id,
    },
  });
}

/*
|--------------------------------------------------------------------------
| LOAD SERVICES
|--------------------------------------------------------------------------
*/

async function loadServices() {
  loading.value = true;

  errorMessage.value = "";

  try {
    const response = await api.get("/services");

    services.value = normalizeServices(response);
  } catch (error) {
    console.error("[HOME SERVICES ERROR]", error);

    errorMessage.value =
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong.";
  } finally {
    loading.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| INIT
|--------------------------------------------------------------------------
*/

onMounted(loadServices);
</script>

<template>
  <section class="bg-white py-8 sm:py-10 lg:py-12">
    <div class="page">
      <!-- ======================================================
           HEADER
      ======================================================= -->

      <div class="mb-7 flex items-end justify-between gap-4">
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600 sm:text-sm"
          >
            Explore Koh Rong
          </p>

          <h2
            class="mt-2 text-2xl font-bold tracking-tight text-heading sm:text-3xl lg:text-4xl"
          >
            Our Most Popular Adventures
          </h2>

          <p class="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">
            Discover exciting island experiences and explore the details, photos
            and customer reviews before booking.
          </p>
        </div>

        <!-- ==================================================
             VIEW ALL DESKTOP
        =================================================== -->

        <RouterLink
          to="/services"
          class="hidden shrink-0 items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-5 py-2.5 text-sm font-semibold text-primary-600 transition duration-200 hover:border-primary-300 hover:bg-primary-100 hover:text-primary-700 sm:inline-flex"
        >
          View All Services

          <Icon icon="ri:arrow-right-line" class="text-base" />
        </RouterLink>
      </div>

      <!-- ======================================================
           LOADING
      ======================================================= -->

      <div v-if="loading" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="item in 3"
          :key="item"
          class="overflow-hidden rounded-[18px] border border-slate-200 bg-white"
        >
          <!-- IMAGE -->

          <div class="h-[255px] animate-pulse bg-slate-200" />

          <!-- CONTENT -->

          <div class="space-y-4 p-5 pt-7">
            <div class="h-6 w-4/5 animate-pulse rounded bg-slate-200" />

            <div class="space-y-2 pt-3">
              <div class="h-4 w-full animate-pulse rounded bg-slate-100" />

              <div class="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
            </div>

            <div class="flex justify-end pt-3">
              <div class="h-11 w-32 animate-pulse rounded-full bg-slate-200" />
            </div>
          </div>
        </div>
      </div>

      <!-- ======================================================
           ERROR
      ======================================================= -->

      <div
        v-else-if="errorMessage"
        class="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center"
      >
        <div
          class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-500"
        >
          <Icon icon="ri:error-warning-line" class="text-xl" />
        </div>

        <h3 class="mt-4 font-semibold text-red-700">Unable to load services</h3>

        <p class="mt-1 text-sm text-red-600">
          {{ errorMessage }}
        </p>

        <button
          type="button"
          class="mt-4 rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-600"
          @click="loadServices"
        >
          Try Again
        </button>
      </div>

      <!-- ======================================================
           SERVICES
      ======================================================= -->

      <div
        v-else-if="displayedServices.length"
        class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <!-- ===================================================
             SERVICE CARD
        ==================================================== -->

        <article
          v-for="item in displayedServices"
          :key="item._id"
          class="group relative flex min-h-[485px] flex-col overflow-hidden rounded-[18px] border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-lg"
        >
          <!-- =================================================
               IMAGE
          ================================================== -->

          <button
            type="button"
            class="relative block w-full text-left"
            @click="viewService(item)"
          >
            <div class="h-[255px] w-full overflow-hidden bg-slate-100">
              <img
                v-if="serviceImage(item)"
                :src="serviceImage(item)"
                :alt="item.name"
                class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />

              <div
                v-else
                class="flex h-full items-center justify-center bg-slate-100"
              >
                <Icon icon="ri:image-line" class="text-5xl text-slate-300" />
              </div>
            </div>

            <!-- OVERLAY -->

            <div
              class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-black/5"
            />

            <!-- =================================================
                 CATEGORY
            ================================================== -->

            <div class="absolute left-4 top-4">
              <span
                class="inline-flex items-center rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm"
              >
                {{ categoryName(item) }}
              </span>
            </div>

            <!-- =================================================
                 PRICE
            ================================================== -->

            <div class="absolute -bottom-4 left-4 z-10">
              <span
                class="inline-flex min-h-8 items-center justify-center rounded-md bg-primary-500 px-3 py-1.5 text-xs font-bold text-white shadow-md"
              >
                {{ formatPrice(item.price) }}
              </span>
            </div>
          </button>

          <!-- =================================================
               CARD BODY
          ================================================== -->

          <div class="flex flex-1 flex-col px-5 pb-5 pt-8">
            <!-- TITLE -->

            <button type="button" class="text-left" @click="viewService(item)">
              <h3
                class="line-clamp-2 min-h-[56px] text-[18px] font-bold leading-7 text-heading transition duration-200 group-hover:text-primary-600"
              >
                {{ item.name }}
              </h3>
            </button>

            <!-- DESCRIPTION -->

            <p
              v-if="plainText(item.description)"
              class="mt-6 line-clamp-2 min-h-[48px] text-sm leading-6 text-muted"
            >
              {{ plainText(item.description) }}
            </p>

            <div v-else class="mt-6 min-h-[48px]" />

            <!-- PUSH DOWN -->

            <div class="flex-1" />

            <!-- =================================================
                 VIEW DETAILS
            ================================================== -->

            <div class="mt-6 flex justify-end">
              <button
                type="button"
                class="inline-flex min-w-[135px] items-center justify-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-primary-600 hover:shadow-md active:scale-[0.98]"
                @click="viewService(item)"
              >
                View Details

                <Icon
                  icon="ri:arrow-right-s-line"
                  class="text-xl transition-transform duration-200 group-hover:translate-x-1"
                />
              </button>
            </div>
          </div>
        </article>
      </div>

      <!-- ======================================================
           EMPTY
      ======================================================= -->

      <div
        v-else
        class="rounded-2xl border border-dashed border-border bg-surface-soft px-6 py-12 text-center"
      >
        <div
          class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600"
        >
          <Icon icon="ri:compass-3-line" class="text-xl" />
        </div>

        <h3 class="mt-4 font-semibold text-heading">
          No adventures available yet
        </h3>

        <p class="mt-1 text-sm text-muted">
          New island experiences will be added soon.
        </p>
      </div>

      <!-- ======================================================
           MOBILE VIEW ALL
      ======================================================= -->

      <div
        v-if="displayedServices.length"
        class="mt-7 flex justify-center sm:hidden"
      >
        <RouterLink
          to="/services"
          class="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-5 py-2.5 text-sm font-semibold text-primary-600 transition duration-200 hover:border-primary-300 hover:bg-primary-100 hover:text-primary-700"
        >
          View All Services

          <Icon icon="ri:arrow-right-line" />
        </RouterLink>
      </div>
    </div>
  </section>
</template>
