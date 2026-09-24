<script setup>
import { computed, onMounted, ref, watch } from "vue";

import { useRoute, useRouter } from "vue-router";

import { useToast } from "primevue/usetoast";

import { Icon } from "@iconify/vue";

import Dialog from "primevue/dialog";

import api from "../../services/api.js";

/*
|--------------------------------------------------------------------------
| ROUTER
|--------------------------------------------------------------------------
*/

const route = useRoute();

const router = useRouter();

const toast = useToast();

/*
|--------------------------------------------------------------------------
| SERVICE STATE
|--------------------------------------------------------------------------
*/

const service = ref(null);

const loading = ref(true);

const error = ref("");

const activeImage = ref("");

const imageDialog = ref(false);

/*
|--------------------------------------------------------------------------
| RELATED SERVICES
|--------------------------------------------------------------------------
*/

const relatedServices = ref([]);

const relatedLoading = ref(false);

/*
|--------------------------------------------------------------------------
| SERVICE ID
|--------------------------------------------------------------------------
*/

function normalizeServiceId(value) {
  if (Array.isArray(value)) {
    value = value[0];
  }

  return String(value ?? "").trim();
}

function isValidServiceId(value) {
  const id = normalizeServiceId(value);

  return /^[a-fA-F0-9]{24}$/.test(id);
}

const serviceId = computed(() => {
  return normalizeServiceId(route.params?.id);
});

/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/

function isLoggedIn() {
  return Boolean(String(localStorage.getItem("token") || "").trim());
}

/*
|--------------------------------------------------------------------------
| NORMALIZE SERVICE
|--------------------------------------------------------------------------
*/

function normalizeService(response) {
  return (
    response?.data?.service || response?.data?.data || response?.data || null
  );
}

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
| CATEGORY
|--------------------------------------------------------------------------
*/

const categoryName = computed(() => {
  const category = service.value?.cate_id;

  if (category && typeof category === "object") {
    return category.name || "Service";
  }

  return "Service";
});

function serviceCategoryId(item) {
  const category = item?.cate_id;

  if (category && typeof category === "object") {
    return String(category._id || "");
  }

  return String(category || "");
}

function relatedCategoryName(item) {
  const category = item?.cate_id;

  if (category && typeof category === "object") {
    return category.name || "Service";
  }

  return "Service";
}

/*
|--------------------------------------------------------------------------
| IMAGES
|--------------------------------------------------------------------------
*/

const serviceImages = computed(() => {
  const images = [];

  if (service.value?.thumbnail) {
    images.push(service.value.thumbnail);
  }

  if (Array.isArray(service.value?.images)) {
    images.push(...service.value.images);
  }

  return [...new Set(images.filter(Boolean))];
});

function serviceImage(item) {
  return item?.thumbnail || item?.images?.[0] || "";
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
| LOAD SERVICE
|--------------------------------------------------------------------------
*/

async function loadService() {
  loading.value = true;

  error.value = "";

  service.value = null;

  activeImage.value = "";

  if (!isValidServiceId(serviceId.value)) {
    error.value = "Invalid service.";

    loading.value = false;

    return;
  }

  try {
    const response = await api.get(`/services/${serviceId.value}`);

    const item = normalizeService(response);

    if (!item?._id) {
      throw new Error("Service not found.");
    }

    service.value = item;

    activeImage.value = item.thumbnail || item.images?.[0] || "";

    /*
    |--------------------------------------------------------------------------
    | VERSION 1
    |--------------------------------------------------------------------------
    |
    | Reviews are not loaded.
    | Only related services are loaded.
    |
    */

    await loadRelatedServices();
  } catch (err) {
    console.error("[SERVICE DETAIL ERROR]", err);

    error.value =
      err?.response?.data?.message || err?.message || "Unable to load service.";
  } finally {
    loading.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| RELATED SERVICES
|--------------------------------------------------------------------------
*/

async function loadRelatedServices() {
  relatedLoading.value = true;

  try {
    const response = await api.get("/services");

    const allServices = normalizeServices(response).filter(
      (item) =>
        String(item?.status || "ACTIVE").toUpperCase() === "ACTIVE" &&
        String(item?._id || "") !== String(serviceId.value),
    );

    const currentCategory = serviceCategoryId(service.value);

    /*
    |--------------------------------------------------------------------------
    | SAME CATEGORY FIRST
    |--------------------------------------------------------------------------
    */

    const sameCategory = allServices.filter(
      (item) => currentCategory && serviceCategoryId(item) === currentCategory,
    );

    /*
    |--------------------------------------------------------------------------
    | OTHER SERVICES
    |--------------------------------------------------------------------------
    */

    const others = allServices.filter(
      (item) =>
        !sameCategory.some(
          (sameItem) => String(sameItem._id) === String(item._id),
        ),
    );

    relatedServices.value = [...sameCategory, ...others].slice(0, 3);
  } catch (err) {
    console.error("[RELATED SERVICES ERROR]", err);

    relatedServices.value = [];
  } finally {
    relatedLoading.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| BOOK SERVICE
|--------------------------------------------------------------------------
*/

function bookService() {
  const id = normalizeServiceId(service.value?._id);

  if (!isValidServiceId(id)) {
    return;
  }

  if (!isLoggedIn()) {
    toast.add({
      severity: "warn",

      summary: "Account Required",

      detail: "Please create an account or log in before booking.",

      life: 4000,
    });

    return;
  }

  router.push({
    path: "/booking",

    query: {
      service_id: id,
    },
  });
}

/*
|--------------------------------------------------------------------------
| OPEN RELATED SERVICE
|--------------------------------------------------------------------------
*/

function openService(item) {
  const id = normalizeServiceId(item?._id);

  if (!isValidServiceId(id)) {
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
| BACK
|--------------------------------------------------------------------------
*/

function backToServices() {
  router.push("/services");
}

/*
|--------------------------------------------------------------------------
| WATCH ROUTE
|--------------------------------------------------------------------------
*/

watch(
  () => route.params?.id,

  (newValue, oldValue) => {
    if (normalizeServiceId(newValue) !== normalizeServiceId(oldValue)) {
      window.scrollTo({
        top: 0,

        behavior: "smooth",
      });

      loadService();
    }
  },
);

/*
|--------------------------------------------------------------------------
| INIT
|--------------------------------------------------------------------------
*/

onMounted(loadService);
</script>

<template>
  <main class="min-h-screen bg-white pb-16">
    <!-- ======================================================
         BREADCRUMB
    ======================================================= -->

    <section class="border-b border-border bg-white">
      <div class="page py-3">
        <div class="flex flex-wrap items-center gap-1.5 text-xs text-black">
          <RouterLink to="/" class="transition hover:text-primary-600">
            Home
          </RouterLink>

          <Icon icon="ri:arrow-right-s-line" />

          <RouterLink to="/services" class="transition hover:text-primary-600">
            Services
          </RouterLink>

          <template v-if="service">
            <Icon icon="ri:arrow-right-s-line" />

            <span class="max-w-[420px] truncate font-medium text-heading">
              {{ service.name }}
            </span>
          </template>
        </div>
      </div>
    </section>

    <!-- ======================================================
         LOADING
    ======================================================= -->

    <section v-if="loading" class="page py-8">
      <div
        class="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]"
      >
        <!-- IMAGE -->

        <div>
          <div class="aspect-[4/3] animate-pulse rounded-xl bg-slate-200" />

          <div class="mt-3 grid grid-cols-5 gap-3">
            <div
              v-for="item in 5"
              :key="item"
              class="aspect-square animate-pulse rounded-lg bg-slate-200"
            />
          </div>
        </div>

        <!-- INFORMATION -->

        <div class="h-[430px] animate-pulse rounded-xl bg-slate-100" />
      </div>
    </section>

    <!-- ======================================================
         ERROR
    ======================================================= -->

    <section v-else-if="!service" class="page py-16">
      <div
        class="mx-auto max-w-lg rounded-2xl border border-border bg-white p-8 text-center shadow-sm"
      >
        <Icon
          icon="ri:error-warning-line"
          class="mx-auto text-4xl text-red-500"
        />

        <h1 class="mt-4 text-xl font-bold text-heading">Service unavailable</h1>

        <p class="mt-2 text-sm text-black">
          {{ error || "Service not found." }}
        </p>

        <button
          type="button"
          class="mt-6 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
          @click="backToServices"
        >
          Back to Services
        </button>
      </div>
    </section>

    <!-- ======================================================
         SERVICE DETAIL
    ======================================================= -->

    <template v-else>
      <section class="page py-6 sm:py-8">
        <div class="mx-auto max-w-6xl">
          <!-- ==================================================
               TOP DETAIL
          =================================================== -->

          <div
            class="grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]"
          >
            <!-- =================================================
                 LEFT IMAGE
            ================================================== -->

            <div>
              <!-- MAIN IMAGE -->

              <div
                class="group relative overflow-hidden rounded-xl bg-slate-100"
              >
                <div class="aspect-[4/3]">
                  <img
                    v-if="activeImage"
                    :src="activeImage"
                    :alt="service.name"
                    class="h-full w-full object-cover"
                  />

                  <div v-else class="flex h-full items-center justify-center">
                    <Icon
                      icon="ri:image-line"
                      class="text-6xl text-slate-300"
                    />
                  </div>
                </div>

                <!-- EXPAND -->

                <button
                  v-if="activeImage"
                  type="button"
                  aria-label="View full image"
                  class="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-heading shadow-sm transition hover:bg-white"
                  @click="imageDialog = true"
                >
                  <Icon icon="ri:fullscreen-line" class="text-lg" />
                </button>
              </div>

              <!-- THUMBNAILS -->

              <div
                v-if="serviceImages.length > 1"
                class="mt-3 grid grid-cols-5 gap-3"
              >
                <button
                  v-for="image in serviceImages.slice(0, 5)"
                  :key="image"
                  type="button"
                  class="relative overflow-hidden rounded-lg border-2 bg-slate-100 transition"
                  :class="
                    activeImage === image
                      ? 'border-primary-500'
                      : 'border-transparent hover:border-primary-300'
                  "
                  @click="activeImage = image"
                >
                  <img
                    :src="image"
                    :alt="service.name"
                    class="aspect-square h-full w-full object-cover"
                  />
                </button>
              </div>
            </div>

            <!-- =================================================
                 RIGHT INFO
            ================================================== -->

            <div>
              <!-- CATEGORY -->

              <p
                class="text-xs font-semibold uppercase tracking-wide text-primary-600"
              >
                {{ categoryName }}
              </p>

              <!-- TITLE -->

              <h1
                class="mt-2 text-3xl font-bold leading-tight tracking-tight text-heading sm:text-4xl"
              >
                {{ service.name }}
              </h1>

              <!-- DIVIDER -->

              <div class="mt-5 border-b border-border" />

              <!-- =================================================
                   INFO LIST
              ================================================== -->

              <div class="mt-6 space-y-4">
                <!-- CATEGORY -->

                <div class="flex items-center gap-3 text-sm">
                  <Icon
                    icon="ri:price-tag-3-line"
                    class="w-5 shrink-0 text-primary-600"
                  />

                  <span class="w-24 text-black"> Category: </span>

                  <span class="font-semibold text-heading">
                    {{ categoryName }}
                  </span>
                </div>

                <!-- STATUS -->

                <div class="flex items-center gap-3 text-sm">
                  <Icon
                    icon="ri:checkbox-circle-line"
                    class="w-5 shrink-0 text-primary-600"
                  />

                  <span class="w-24 text-black"> Availability: </span>

                  <span class="font-semibold text-heading">
                    {{
                      String(service.status || "ACTIVE").toUpperCase() ===
                      "ACTIVE"
                        ? "Available"
                        : "Unavailable"
                    }}
                  </span>
                </div>

                <!-- EXPERIENCE -->

                <div class="flex items-center gap-3 text-sm">
                  <Icon
                    icon="ri:compass-3-line"
                    class="w-5 shrink-0 text-primary-600"
                  />

                  <span class="w-24 text-black"> Experience: </span>

                  <span class="font-semibold text-heading">
                    Koh Rong Service
                  </span>
                </div>
              </div>

              <!-- =================================================
                   PRICE
              ================================================== -->

              <div class="mt-7 border-t border-border pt-5">
                <p class="text-sm font-medium text-black">Starting Price</p>

                <div class="mt-1 flex items-end gap-2">
                  <span class="text-3xl font-bold text-primary-600 sm:text-4xl">
                    {{ formatPrice(service.price) }}
                  </span>
                </div>
              </div>

              <!-- =================================================
                   BOOK NOW
              ================================================== -->

              <div class="mt-6">
                <button
                  type="button"
                  class="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-primary-700 sm:w-auto sm:min-w-[180px]"
                  @click="bookService"
                >
                  Book Now

                  <Icon icon="ri:calendar-check-line" class="text-lg" />
                </button>
              </div>

              <!-- SAFE NOTE -->

              <div
                class="mt-5 flex items-start gap-2 text-xs leading-5 text-black"
              >
                <Icon
                  icon="ri:shield-check-line"
                  class="mt-0.5 shrink-0 text-primary-600"
                />

                <span>
                  Review the service information before completing your booking.
                </span>
              </div>
            </div>
          </div>

          <!-- ==================================================
               DESCRIPTION
          =================================================== -->

          <section class="mt-10 border-t border-border pt-8">
            <div class="max-w-4xl">
              <!-- LABEL -->

              <p
                class="text-xs font-semibold uppercase tracking-[0.16em] text-primary-600"
              >
                Service Information
              </p>

              <!-- TITLE -->

              <h2 class="mt-2 text-2xl font-bold text-heading sm:text-3xl">
                Description
              </h2>

              <!-- DESCRIPTION -->

              <div
                v-if="service.description"
                class="service-description mt-5 text-sm leading-7 text-black sm:text-base sm:leading-8"
                v-html="service.description"
              />

              <!-- EMPTY DESCRIPTION -->

              <div
                v-else
                class="mt-5 rounded-xl bg-surface-soft p-6 text-sm text-black"
              >
                No description is available for this service.
              </div>
            </div>
          </section>

          <!-- ==================================================
               RELATED SERVICES
          =================================================== -->

          <section class="mt-14 border-t border-border pt-8">
            <!-- HEADER -->

            <div class="flex items-end justify-between gap-4">
              <div>
                <p
                  class="text-xs font-semibold uppercase tracking-[0.16em] text-primary-600"
                >
                  Explore More
                </p>

                <h2 class="mt-1 text-2xl font-bold text-heading sm:text-3xl">
                  Related Services
                </h2>

                <p class="mt-2 text-sm leading-6 text-black sm:text-base">
                  More experiences you may also enjoy.
                </p>
              </div>

              <RouterLink
                to="/services"
                class="hidden items-center gap-1 text-sm font-semibold text-primary-600 transition hover:text-primary-700 sm:flex"
              >
                View All

                <Icon icon="ri:arrow-right-line" />
              </RouterLink>
            </div>

            <!-- =================================================
                 RELATED LOADING
            ================================================== -->

            <div
              v-if="relatedLoading"
              class="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
            >
              <div
                v-for="item in 3"
                :key="item"
                class="overflow-hidden rounded-xl border border-border"
              >
                <div class="aspect-[16/10] animate-pulse bg-slate-200" />

                <div class="space-y-3 p-4">
                  <div class="h-4 w-20 animate-pulse rounded bg-slate-100" />

                  <div class="h-5 w-4/5 animate-pulse rounded bg-slate-200" />

                  <div class="h-9 w-full animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            </div>

            <!-- =================================================
                 RELATED LIST
            ================================================== -->

            <div
              v-else-if="relatedServices.length"
              class="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
            >
              <article
                v-for="item in relatedServices"
                :key="item._id"
                class="group overflow-hidden rounded-xl border border-border bg-white transition duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-md"
              >
                <!-- IMAGE -->

                <button
                  type="button"
                  class="relative block aspect-[16/10] w-full overflow-hidden bg-slate-100"
                  @click="openService(item)"
                >
                  <img
                    v-if="serviceImage(item)"
                    :src="serviceImage(item)"
                    :alt="item.name"
                    class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div v-else class="flex h-full items-center justify-center">
                    <Icon
                      icon="ri:image-line"
                      class="text-5xl text-slate-300"
                    />
                  </div>

                  <!-- PRICE -->

                  <span
                    class="absolute bottom-0 left-3 rounded-t-md bg-primary-500 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    {{ formatPrice(item.price) }}
                  </span>
                </button>

                <!-- CONTENT -->

                <div class="flex min-h-[145px] flex-col p-4">
                  <!-- CATEGORY -->

                  <p
                    class="text-[10px] font-semibold uppercase tracking-wide text-primary-600"
                  >
                    {{ relatedCategoryName(item) }}
                  </p>

                  <!-- TITLE -->

                  <button
                    type="button"
                    class="mt-1 text-left"
                    @click="openService(item)"
                  >
                    <h3
                      class="line-clamp-2 text-base font-semibold leading-6 text-heading transition group-hover:text-primary-600"
                    >
                      {{ item.name }}
                    </h3>
                  </button>

                  <!-- BUTTON -->

                  <div class="mt-auto flex justify-end pt-4">
                    <button
                      type="button"
                      class="inline-flex h-9 items-center gap-1 rounded-full bg-primary-500 px-4 text-xs font-medium text-white transition hover:bg-primary-600"
                      @click="openService(item)"
                    >
                      Read More

                      <Icon icon="ri:arrow-right-s-line" class="text-base" />
                    </button>
                  </div>
                </div>
              </article>
            </div>

            <!-- =================================================
                 NO RELATED
            ================================================== -->

            <div
              v-else
              class="mt-6 rounded-xl bg-surface-soft p-8 text-center text-sm text-black"
            >
              No related services are available at the moment.
            </div>

            <!-- MOBILE VIEW ALL -->

            <div
              v-if="relatedServices.length"
              class="mt-6 flex justify-center sm:hidden"
            >
              <RouterLink
                to="/services"
                class="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-5 py-2.5 text-sm font-semibold text-primary-600"
              >
                View All Services

                <Icon icon="ri:arrow-right-line" />
              </RouterLink>
            </div>
          </section>
        </div>
      </section>

      <!-- ======================================================
           IMAGE PREVIEW
      ======================================================= -->

      <Dialog
        v-model:visible="imageDialog"
        modal
        :draggable="false"
        dismissable-mask
        :style="{
          width: '94vw',
          maxWidth: '1000px',
        }"
        :content-style="{
          padding: '0',
        }"
      >
        <img
          v-if="activeImage"
          :src="activeImage"
          :alt="service.name"
          class="max-h-[80vh] w-full object-contain"
        />
      </Dialog>
    </template>
  </main>
</template>

<style scoped>
/*
|--------------------------------------------------------------------------
| SERVICE DESCRIPTION
|--------------------------------------------------------------------------
*/

.service-description {
  color: #000000;
}

.service-description :deep(p) {
  margin-bottom: 1rem;
  color: #000000;
}

.service-description :deep(p:last-child) {
  margin-bottom: 0;
}

.service-description :deep(ul),
.service-description :deep(ol) {
  margin: 1rem 0;
  padding-left: 1.5rem;
  color: #000000;
}

.service-description :deep(ul) {
  list-style-type: disc;
}

.service-description :deep(ol) {
  list-style-type: decimal;
}

.service-description :deep(li) {
  margin-bottom: 0.4rem;
  color: #000000;
}

.service-description :deep(strong) {
  font-weight: 600;
  color: #0f172a;
}

.service-description :deep(h1),
.service-description :deep(h2),
.service-description :deep(h3),
.service-description :deep(h4) {
  margin-top: 1.25rem;
  margin-bottom: 0.65rem;
  font-weight: 600;
  color: #0f172a;
}

.service-description :deep(a) {
  color: #1675e3;
  text-decoration: underline;
}
</style>
