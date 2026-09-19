<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";

import { useRoute, useRouter } from "vue-router";

import { useToast } from "primevue/usetoast";

import { Icon } from "@iconify/vue";

import Dialog from "primevue/dialog";
import Rating from "primevue/rating";
import Textarea from "primevue/textarea";

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
| TAB
|--------------------------------------------------------------------------
*/

const activeTab = ref("description");

/*
|--------------------------------------------------------------------------
| RELATED SERVICES
|--------------------------------------------------------------------------
*/

const relatedServices = ref([]);

const relatedLoading = ref(false);

/*
|--------------------------------------------------------------------------
| REVIEWS
|--------------------------------------------------------------------------
*/

const reviews = ref([]);

const reviewLoading = ref(false);

const reviewDialog = ref(false);

const reviewSubmitting = ref(false);

const eligibilityLoading = ref(false);

const reviewEligibility = reactive({
  eligible: false,

  reviewed: false,

  reason: "",

  review: null,
});

const reviewSummary = reactive({
  total_reviews: 0,

  average_rating: 0,

  ratings: {
    1: 0,

    2: 0,

    3: 0,

    4: 0,

    5: 0,
  },
});

const reviewForm = reactive({
  rating: 5,

  comment: "",
});

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

  activeTab.value = "description";

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

    await Promise.all([
      loadReviews(),

      loadReviewEligibility(),

      loadRelatedServices(),
    ]);
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
| LOAD REVIEWS
|--------------------------------------------------------------------------
*/

async function loadReviews() {
  if (!isValidServiceId(serviceId.value)) {
    return;
  }

  reviewLoading.value = true;

  try {
    const response = await api.get(`/services/${serviceId.value}/reviews`);

    reviews.value = Array.isArray(response?.data?.reviews)
      ? response.data.reviews
      : [];

    const summary = response?.data?.summary || {};

    reviewSummary.total_reviews = Number(summary.total_reviews || 0);

    reviewSummary.average_rating = Number(summary.average_rating || 0);

    reviewSummary.ratings = {
      1: Number(summary.ratings?.[1] || 0),

      2: Number(summary.ratings?.[2] || 0),

      3: Number(summary.ratings?.[3] || 0),

      4: Number(summary.ratings?.[4] || 0),

      5: Number(summary.ratings?.[5] || 0),
    };
  } catch (err) {
    console.error("[SERVICE REVIEWS ERROR]", err);

    reviews.value = [];

    reviewSummary.total_reviews = 0;

    reviewSummary.average_rating = 0;

    reviewSummary.ratings = {
      1: 0,

      2: 0,

      3: 0,

      4: 0,

      5: 0,
    };
  } finally {
    reviewLoading.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| REVIEW ELIGIBILITY
|--------------------------------------------------------------------------
*/

async function loadReviewEligibility() {
  reviewEligibility.eligible = false;

  reviewEligibility.reviewed = false;

  reviewEligibility.reason = "";

  reviewEligibility.review = null;

  if (!isLoggedIn()) {
    return;
  }

  eligibilityLoading.value = true;

  try {
    const response = await api.get(
      `/services/${serviceId.value}/reviews/eligibility`,
    );

    reviewEligibility.eligible = Boolean(response?.data?.eligible);

    reviewEligibility.reviewed = Boolean(response?.data?.reviewed);

    reviewEligibility.reason = response?.data?.reason || "";

    reviewEligibility.review = response?.data?.review || null;
  } catch (err) {
    console.error("[REVIEW ELIGIBILITY ERROR]", err);
  } finally {
    eligibilityLoading.value = false;
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
| REVIEW CUSTOMER
|--------------------------------------------------------------------------
*/

function reviewCustomer(review) {
  const customer = review?.customer_id;

  if (customer && typeof customer === "object") {
    return customer;
  }

  return {};
}

function reviewCustomerName(review) {
  const customer = reviewCustomer(review);

  const firstName = String(customer.firstName || "").trim();

  const lastName = String(customer.lastName || "").trim();

  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || customer.username || "Customer";
}

function reviewCustomerAvatar(review) {
  return String(reviewCustomer(review).avatar || "").trim();
}

function reviewCustomerInitials(review) {
  const words = reviewCustomerName(review).split(/\s+/).filter(Boolean);

  if (!words.length) {
    return "C";
  }

  if (words.length === 1) {
    return String(words[0][0] || "C").toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

/*
|--------------------------------------------------------------------------
| REVIEW DATE
|--------------------------------------------------------------------------
*/

function formatReviewDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",

    month: "short",

    year: "numeric",

    timeZone: "Asia/Phnom_Penh",
  }).format(date);
}

/*
|--------------------------------------------------------------------------
| RATING PERCENTAGE
|--------------------------------------------------------------------------
*/

function ratingPercentage(star) {
  const total = Number(reviewSummary.total_reviews || 0);

  if (!total) {
    return 0;
  }

  const count = Number(reviewSummary.ratings?.[star] || 0);

  return Math.round((count / total) * 100);
}

/*
|--------------------------------------------------------------------------
| OPEN REVIEW
|--------------------------------------------------------------------------
*/

function openReviewDialog() {
  if (!isLoggedIn()) {
    toast.add({
      severity: "warn",

      summary: "Account Required",

      detail:
        "Please create an account or log in before reviewing this service.",

      life: 4000,
    });

    return;
  }

  if (reviewEligibility.reviewed) {
    toast.add({
      severity: "info",

      summary: "Already Reviewed",

      detail: "You have already reviewed this service.",

      life: 3500,
    });

    return;
  }

  if (!reviewEligibility.eligible) {
    toast.add({
      severity: "warn",

      summary: "Review Not Available",

      detail: reviewEligibility.reason || "Unable to review this service.",

      life: 4000,
    });

    return;
  }

  reviewForm.rating = 5;

  reviewForm.comment = "";

  reviewDialog.value = true;
}

/*
|--------------------------------------------------------------------------
| SUBMIT REVIEW
|--------------------------------------------------------------------------
*/

async function submitReview() {
  if (reviewSubmitting.value) {
    return;
  }

  const rating = Number(reviewForm.rating);

  const comment = String(reviewForm.comment || "").trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    toast.add({
      severity: "warn",

      summary: "Rating Required",

      detail: "Please select a rating from 1 to 5 stars.",

      life: 3500,
    });

    return;
  }

  if (comment.length > 1000) {
    toast.add({
      severity: "warn",

      summary: "Review Too Long",

      detail: "Your review must be 1000 characters or fewer.",

      life: 3500,
    });

    return;
  }

  reviewSubmitting.value = true;

  try {
    const response = await api.post(`/services/${serviceId.value}/reviews`, {
      rating,

      comment,
    });

    reviewDialog.value = false;

    toast.add({
      severity: "success",

      summary: "Review Submitted",

      detail: response?.data?.message || "Thank you for your review.",

      life: 3500,
    });

    await Promise.all([loadReviews(), loadReviewEligibility()]);

    activeTab.value = "reviews";
  } catch (err) {
    console.error("[SUBMIT REVIEW ERROR]", err);

    toast.add({
      severity: "error",

      summary: "Unable to Review",

      detail: err?.response?.data?.message || "Unable to submit your review.",

      life: 4500,
    });
  } finally {
    reviewSubmitting.value = false;
  }
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
        <div class="flex flex-wrap items-center gap-1.5 text-xs text-muted">
          <RouterLink to="/" class="transition hover:text-primary-600">
            Home
          </RouterLink>

          <Icon icon="ri:arrow-right-s-line" />

          <RouterLink to="/services" class="transition hover:text-primary-600">
            Services
          </RouterLink>

          <template v-if="service">
            <Icon icon="ri:arrow-right-s-line" />

            <span class="max-w-[420px] truncate text-heading">
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

        <p class="mt-2 text-sm text-muted">
          {{ error || "Service not found." }}
        </p>

        <button
          type="button"
          class="mt-6 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white"
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

              <p class="text-xs font-semibold text-primary-600">
                {{ categoryName }}
              </p>

              <!-- TITLE -->

              <h1
                class="mt-2 text-2xl font-bold leading-tight text-heading sm:text-3xl"
              >
                {{ service.name }}
              </h1>

              <!-- RATING -->

              <div
                class="mt-4 flex flex-wrap items-center gap-2 border-b border-border pb-4"
              >
                <div class="flex items-center gap-0.5">
                  <Icon
                    v-for="star in 5"
                    :key="star"
                    :icon="
                      star <=
                      Math.round(Number(reviewSummary.average_rating || 0))
                        ? 'ri:star-fill'
                        : 'ri:star-line'
                    "
                    class="text-sm text-primary-500"
                  />
                </div>

                <span class="text-xs font-medium text-heading">
                  {{ Number(reviewSummary.average_rating || 0).toFixed(1) }}
                </span>

                <button
                  type="button"
                  class="text-xs text-muted transition hover:text-primary-600"
                  @click="activeTab = 'reviews'"
                >
                  ({{ reviewSummary.total_reviews }}
                  {{
                    reviewSummary.total_reviews === 1 ? "review" : "reviews"
                  }})
                </button>
              </div>

              <!-- INFO LIST -->

              <div class="mt-5 space-y-3">
                <!-- CATEGORY -->

                <div class="flex items-center gap-3 text-sm">
                  <Icon
                    icon="ri:price-tag-3-line"
                    class="w-5 shrink-0 text-muted"
                  />

                  <span class="w-24 text-muted"> Category: </span>

                  <span class="font-medium text-heading">
                    {{ categoryName }}
                  </span>
                </div>

                <!-- STATUS -->

                <div class="flex items-center gap-3 text-sm">
                  <Icon
                    icon="ri:checkbox-circle-line"
                    class="w-5 shrink-0 text-muted"
                  />

                  <span class="w-24 text-muted"> Availability: </span>

                  <span class="font-medium text-heading">
                    {{
                      String(service.status || "ACTIVE").toUpperCase() ===
                      "ACTIVE"
                        ? "Available"
                        : "Unavailable"
                    }}
                  </span>
                </div>

                <!-- TYPE -->

                <div class="flex items-center gap-3 text-sm">
                  <Icon
                    icon="ri:compass-3-line"
                    class="w-5 shrink-0 text-muted"
                  />

                  <span class="w-24 text-muted"> Experience: </span>

                  <span class="font-medium text-heading">
                    Koh Rong Service
                  </span>
                </div>
              </div>

              <!-- PRICE -->

              <div class="mt-6 border-t border-border pt-5">
                <div class="flex items-end gap-2">
                  <span class="text-sm font-medium text-heading"> Price: </span>

                  <span class="text-3xl font-bold text-primary-600">
                    {{ formatPrice(service.price) }}
                  </span>
                </div>
              </div>

              <!-- ACTIONS -->

              <div class="mt-5 grid gap-3 sm:grid-cols-2">
                <!-- BOOK -->

                <button
                  type="button"
                  class="flex h-11 items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 text-sm font-semibold text-white transition hover:bg-primary-700"
                  @click="bookService"
                >
                  Book Now

                  <Icon icon="ri:calendar-check-line" />
                </button>

                <!-- REVIEW -->

                <button
                  type="button"
                  class="flex h-11 items-center justify-center gap-2 rounded-lg border border-primary-300 bg-white px-5 text-sm font-semibold text-primary-600 transition hover:bg-primary-50"
                  @click="openReviewDialog"
                >
                  <Icon icon="ri:star-line" />

                  Write Review
                </button>
              </div>

              <!-- SAFE NOTE -->

              <div class="mt-5 flex items-center gap-2 text-xs text-muted">
                <Icon icon="ri:shield-check-line" class="text-primary-600" />

                Review service information before completing your booking.
              </div>
            </div>
          </div>

          <!-- ==================================================
               DESCRIPTION / REVIEWS TABS
          =================================================== -->

          <div class="mt-10">
            <!-- TAB HEADER -->

            <div class="flex items-center gap-7 border-b border-border">
              <button
                type="button"
                class="relative pb-3 text-sm font-semibold transition"
                :class="
                  activeTab === 'description'
                    ? 'text-primary-600'
                    : 'text-muted hover:text-heading'
                "
                @click="activeTab = 'description'"
              >
                Description

                <span
                  v-if="activeTab === 'description'"
                  class="absolute inset-x-0 bottom-0 h-0.5 bg-primary-600"
                />
              </button>

              <button
                type="button"
                class="relative pb-3 text-sm font-semibold transition"
                :class="
                  activeTab === 'reviews'
                    ? 'text-primary-600'
                    : 'text-muted hover:text-heading'
                "
                @click="activeTab = 'reviews'"
              >
                Reviews ({{ reviewSummary.total_reviews }})

                <span
                  v-if="activeTab === 'reviews'"
                  class="absolute inset-x-0 bottom-0 h-0.5 bg-primary-600"
                />
              </button>
            </div>

            <!-- =================================================
                 DESCRIPTION TAB
            ================================================== -->

            <div v-if="activeTab === 'description'" class="pt-6">
              <div
                v-if="service.description"
                class="service-description max-w-4xl text-sm leading-7 text-body"
                v-html="service.description"
              />

              <div
                v-else
                class="rounded-lg bg-surface-soft p-6 text-sm text-muted"
              >
                No description is available for this service.
              </div>
            </div>

            <!-- =================================================
                 REVIEW TAB
            ================================================== -->

            <div v-else class="pt-6">
              <!-- SUMMARY -->

              <div
                class="grid gap-6 rounded-xl border border-border bg-surface-soft p-5 md:grid-cols-[180px_minmax(0,1fr)]"
              >
                <!-- SCORE -->

                <div
                  class="flex flex-col items-center justify-center text-center"
                >
                  <p class="text-4xl font-bold text-heading">
                    {{ Number(reviewSummary.average_rating || 0).toFixed(1) }}
                  </p>

                  <div class="mt-2 flex gap-0.5">
                    <Icon
                      v-for="star in 5"
                      :key="star"
                      :icon="
                        star <=
                        Math.round(Number(reviewSummary.average_rating || 0))
                          ? 'ri:star-fill'
                          : 'ri:star-line'
                      "
                      class="text-lg text-amber-500"
                    />
                  </div>

                  <p class="mt-2 text-xs text-muted">
                    Based on
                    {{ reviewSummary.total_reviews }}
                    reviews
                  </p>
                </div>

                <!-- BREAKDOWN -->

                <div class="space-y-2">
                  <div
                    v-for="star in [5, 4, 3, 2, 1]"
                    :key="star"
                    class="flex items-center gap-3"
                  >
                    <span class="w-10 text-xs text-muted">
                      {{ star }}
                      star
                    </span>

                    <div
                      class="h-2 flex-1 overflow-hidden rounded-full bg-white"
                    >
                      <div
                        class="h-full rounded-full bg-amber-400"
                        :style="{
                          width: `${ratingPercentage(star)}%`,
                        }"
                      />
                    </div>

                    <span class="w-7 text-right text-xs text-muted">
                      {{ reviewSummary.ratings?.[star] || 0 }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- REVIEWED MESSAGE -->

              <div
                v-if="!eligibilityLoading && reviewEligibility.reviewed"
                class="mt-5 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
              >
                <Icon icon="ri:checkbox-circle-line" class="mt-0.5 shrink-0" />

                You have already reviewed this service.
              </div>

              <!-- REVIEW ACTION -->

              <div class="mt-6 flex items-center justify-between gap-4">
                <div>
                  <h3 class="font-semibold text-heading">Customer Reviews</h3>

                  <p class="mt-1 text-xs text-muted">
                    Share your experience with other visitors.
                  </p>
                </div>

                <button
                  type="button"
                  class="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white transition hover:bg-primary-700"
                  @click="openReviewDialog"
                >
                  <Icon icon="ri:star-line" />

                  Write Review
                </button>
              </div>

              <!-- REVIEW LOADING -->

              <div v-if="reviewLoading" class="mt-6 space-y-5">
                <div v-for="item in 3" :key="item" class="flex gap-3">
                  <div
                    class="h-10 w-10 shrink-0 animate-pulse rounded-full bg-slate-200"
                  />

                  <div class="flex-1">
                    <div class="h-4 w-32 animate-pulse rounded bg-slate-200" />

                    <div
                      class="mt-3 h-4 w-full animate-pulse rounded bg-slate-100"
                    />
                  </div>
                </div>
              </div>

              <!-- REVIEWS -->

              <div
                v-else-if="reviews.length"
                class="mt-6 divide-y divide-border"
              >
                <article
                  v-for="review in reviews"
                  :key="review._id"
                  class="flex gap-3 py-5 first:pt-0"
                >
                  <!-- AVATAR -->

                  <div
                    class="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-primary-50"
                  >
                    <img
                      v-if="reviewCustomerAvatar(review)"
                      :src="reviewCustomerAvatar(review)"
                      :alt="reviewCustomerName(review)"
                      class="h-full w-full object-cover"
                    />

                    <div
                      v-else
                      class="flex h-full w-full items-center justify-center text-sm font-bold text-primary-600"
                    >
                      {{ reviewCustomerInitials(review) }}
                    </div>
                  </div>

                  <!-- CONTENT -->

                  <div class="min-w-0 flex-1">
                    <div
                      class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div>
                        <p class="text-sm font-semibold text-heading">
                          {{ reviewCustomerName(review) }}
                        </p>

                        <p class="mt-0.5 text-xs text-muted">
                          {{
                            formatReviewDate(
                              review.created_at || review.createdAt,
                            )
                          }}
                        </p>
                      </div>

                      <div class="flex gap-0.5">
                        <Icon
                          v-for="star in 5"
                          :key="star"
                          :icon="
                            star <= Number(review.rating)
                              ? 'ri:star-fill'
                              : 'ri:star-line'
                          "
                          class="text-amber-500"
                        />
                      </div>
                    </div>

                    <p
                      v-if="review.comment"
                      class="mt-2 whitespace-pre-line break-words text-sm leading-6 text-body"
                    >
                      {{ review.comment }}
                    </p>
                  </div>
                </article>
              </div>

              <!-- EMPTY -->

              <div
                v-else
                class="mt-6 rounded-xl bg-surface-soft p-8 text-center"
              >
                <Icon
                  icon="ri:star-smile-line"
                  class="mx-auto text-3xl text-amber-500"
                />

                <h3 class="mt-2 text-sm font-semibold text-heading">
                  No reviews yet
                </h3>

                <p class="mt-1 text-xs text-muted">
                  Be the first customer to review this service.
                </p>
              </div>
            </div>
          </div>

          <!-- ==================================================
               RELATED SERVICES
          =================================================== -->

          <section class="mt-14 border-t border-border pt-8">
            <div class="flex items-end justify-between gap-4">
              <div>
                <p
                  class="text-xs font-semibold uppercase tracking-[0.16em] text-primary-600"
                >
                  Explore More
                </p>

                <h2 class="mt-1 text-xl font-bold text-heading sm:text-2xl">
                  Related Services
                </h2>

                <p class="mt-1 text-sm text-muted">
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

            <!-- RELATED LOADING -->

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

            <!-- RELATED LIST -->

            <div
              v-else-if="relatedServices.length"
              class="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
            >
              <article
                v-for="item in relatedServices"
                :key="item._id"
                class="group overflow-hidden rounded-xl border border-border bg-white transition hover:-translate-y-0.5 hover:shadow-md"
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
                    class="absolute bottom-0 left-3 rounded-t-md bg-primary-500 px-2.5 py-1 text-[10px] font-semibold text-white"
                  >
                    {{ formatPrice(item.price) }}
                  </span>
                </button>

                <!-- CONTENT -->

                <div class="flex min-h-[130px] flex-col p-4">
                  <p
                    class="text-[10px] font-semibold uppercase tracking-wide text-primary-600"
                  >
                    {{ relatedCategoryName(item) }}
                  </p>

                  <button
                    type="button"
                    class="mt-1 text-left"
                    @click="openService(item)"
                  >
                    <h3
                      class="line-clamp-2 text-sm font-semibold leading-5 text-heading transition group-hover:text-primary-600"
                    >
                      {{ item.name }}
                    </h3>
                  </button>

                  <div class="mt-auto flex justify-end pt-4">
                    <button
                      type="button"
                      class="inline-flex h-9 items-center gap-1 rounded-full bg-primary-500 px-4 text-xs font-medium text-white transition hover:bg-primary-600"
                      @click="openService(item)"
                    >
                      Read More

                      <Icon icon="ri:arrow-right-s-line" />
                    </button>
                  </div>
                </div>
              </article>
            </div>

            <!-- NO RELATED -->

            <div
              v-else
              class="mt-6 rounded-xl bg-surface-soft p-8 text-center text-sm text-muted"
            >
              No related services are available at the moment.
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

      <!-- ======================================================
           REVIEW DIALOG
      ======================================================= -->

      <Dialog
        v-model:visible="reviewDialog"
        modal
        :closable="!reviewSubmitting"
        :dismissable-mask="!reviewSubmitting"
        :draggable="false"
        :style="{
          width: '94vw',
          maxWidth: '480px',
        }"
      >
        <template #header>
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-500"
            >
              <Icon icon="ri:star-smile-line" class="text-xl" />
            </div>

            <div>
              <h2 class="font-bold text-heading">Review Service</h2>

              <p class="text-xs text-muted">
                Share your experience with other visitors.
              </p>
            </div>
          </div>
        </template>

        <!-- SERVICE -->

        <div
          class="flex items-center gap-4 rounded-xl border border-border bg-surface-soft p-4"
        >
          <div
            class="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100"
          >
            <img
              v-if="activeImage"
              :src="activeImage"
              :alt="service.name"
              class="h-full w-full object-cover"
            />

            <div v-else class="flex h-full items-center justify-center">
              <Icon icon="ri:image-line" class="text-xl text-muted" />
            </div>
          </div>

          <div class="min-w-0 flex-1">
            <p class="text-xs text-muted">Reviewing</p>

            <p class="line-clamp-2 font-semibold text-heading">
              {{ service.name }}
            </p>
          </div>
        </div>

        <!-- RATING -->

        <div class="mt-6">
          <label class="label">
            Your Rating

            <span class="text-red-500"> * </span>
          </label>

          <Rating v-model="reviewForm.rating" :stars="5" />
        </div>

        <!-- COMMENT -->

        <div class="mt-5">
          <label class="label"> Your Review </label>

          <Textarea
            v-model="reviewForm.comment"
            rows="5"
            maxlength="1000"
            fluid
            placeholder="Tell other visitors about your experience..."
          />

          <p class="mt-1 text-right text-xs text-muted">
            {{ String(reviewForm.comment || "").length }}
            / 1000
          </p>
        </div>

        <!-- ACTIONS -->

        <div class="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            class="flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-heading transition hover:bg-slate-50 disabled:opacity-50"
            :disabled="reviewSubmitting"
            @click="reviewDialog = false"
          >
            <Icon icon="ri:close-line" />

            Cancel
          </button>

          <button
            type="button"
            class="flex h-11 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
            :disabled="reviewSubmitting"
            @click="submitReview"
          >
            <Icon
              v-if="reviewSubmitting"
              icon="ri:loader-4-line"
              class="animate-spin"
            />

            <Icon v-else icon="ri:star-fill" />

            {{ reviewSubmitting ? "Submitting..." : "Submit Review" }}
          </button>
        </div>
      </Dialog>
    </template>
  </main>
</template>

<style scoped>
.service-description :deep(p) {
  margin-bottom: 1rem;
}

.service-description :deep(p:last-child) {
  margin-bottom: 0;
}

.service-description :deep(ul),
.service-description :deep(ol) {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.service-description :deep(ul) {
  list-style-type: disc;
}

.service-description :deep(ol) {
  list-style-type: decimal;
}

.service-description :deep(li) {
  margin-bottom: 0.4rem;
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
