<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

import { useRouter } from "vue-router";

import { Icon } from "@iconify/vue";

import api from "../../services/api.js";

import { connectSocket } from "../../services/socket.js";

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

const bookings = ref([]);

const loading = ref(true);

const error = ref("");

let socket = null;

/*
|--------------------------------------------------------------------------
| STATUS
|--------------------------------------------------------------------------
*/

function normalizeStatus(status) {
  return String(status || "PENDING").toUpperCase();
}

function statusLabel(status) {
  const value = normalizeStatus(status);

  if (value === "ACCEPT" || value === "ACCEPTED" || value === "CONFIRMED") {
    return "Confirmed";
  }

  if (value === "REJECT" || value === "REJECTED") {
    return "Rejected";
  }

  if (value === "CANCELLED" || value === "CANCELED") {
    return "Cancelled";
  }

  if (value === "COMPLETED") {
    return "Completed";
  }

  return "Pending";
}

function statusClass(status) {
  const value = normalizeStatus(status);

  if (
    value === "ACCEPT" ||
    value === "ACCEPTED" ||
    value === "CONFIRMED" ||
    value === "COMPLETED"
  ) {
    return "bg-green-50 text-green-700";
  }

  if (
    value === "REJECT" ||
    value === "REJECTED" ||
    value === "CANCELLED" ||
    value === "CANCELED"
  ) {
    return "bg-red-50 text-red-700";
  }

  return "bg-amber-50 text-amber-700";
}

function statusDotClass(status) {
  const value = normalizeStatus(status);

  if (
    value === "ACCEPT" ||
    value === "ACCEPTED" ||
    value === "CONFIRMED" ||
    value === "COMPLETED"
  ) {
    return "bg-green-500";
  }

  if (
    value === "REJECT" ||
    value === "REJECTED" ||
    value === "CANCELLED" ||
    value === "CANCELED"
  ) {
    return "bg-red-500";
  }

  return "bg-amber-500";
}

/*
|--------------------------------------------------------------------------
| DATE
|--------------------------------------------------------------------------
*/

function formatDate(value) {
  if (!value) {
    return "-";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    const [year, month, day] = String(value).split("-").map(Number);

    const date = new Date(Date.UTC(year, month - 1, day));

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",

      month: "short",

      year: "numeric",

      timeZone: "UTC",
    }).format(date);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",

    month: "short",

    year: "numeric",
  }).format(date);
}

/*
|--------------------------------------------------------------------------
| PRICE
|--------------------------------------------------------------------------
*/

function formatPrice(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",

    currency: "USD",

    minimumFractionDigits: 2,
  }).format(Number(value || 0));
}

/*
|--------------------------------------------------------------------------
| SERVICE NAME
|--------------------------------------------------------------------------
*/

function serviceNames(booking) {
  /*
   * New snapshot
   */

  if (Array.isArray(booking?.products) && booking.products.length) {
    const names = booking.products.map((item) => item?.name).filter(Boolean);

    if (names.length) {
      return names.join(", ");
    }
  }

  /*
   * Populated products_id
   */

  if (Array.isArray(booking?.products_id)) {
    const names = booking.products_id.map((item) => item?.name).filter(Boolean);

    if (names.length) {
      return names.join(", ");
    }
  }

  /*
   * Description snapshot
   */

  if (booking?.description?.service_name) {
    return booking.description.service_name;
  }

  return "Booking";
}

/*
|--------------------------------------------------------------------------
| BOOKING REFERENCE
|--------------------------------------------------------------------------
*/

function bookingReference(booking) {
  const value = booking?.booking_code || booking?.code || booking?._id || "-";

  /*
   * Keep Mongo ID short in the list.
   */

  if (value === booking?._id && String(value).length > 12) {
    return `${String(value).slice(0, 8)}...`;
  }

  return value;
}

/*
|--------------------------------------------------------------------------
| VIEW DETAILS
|--------------------------------------------------------------------------
*/

function viewDetails(booking) {
  if (!booking?._id) {
    return;
  }

  router.push(`/booking-success/${booking._id}`);
}

/*
|--------------------------------------------------------------------------
| LOAD BOOKINGS
|--------------------------------------------------------------------------
*/

async function load() {
  try {
    error.value = "";

    const response = await api.get("/bookings/mine");

    bookings.value = response?.data?.bookings || response?.data?.data || [];
  } catch (err) {
    console.error("[MY BOOKINGS ERROR]", err);

    error.value = err?.response?.data?.message || "Unable to load bookings.";
  } finally {
    loading.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| INIT
|--------------------------------------------------------------------------
*/

onMounted(async () => {
  await load();

  socket = connectSocket();

  socket?.on("booking:updated", load);
});

/*
|--------------------------------------------------------------------------
| CLEANUP
|--------------------------------------------------------------------------
*/

onBeforeUnmount(() => {
  socket?.off("booking:updated", load);
});
</script>

<template>
  <main class="min-h-screen bg-surface-soft pb-16">
    <!-- ======================================================
         HEADER
    ======================================================= -->

    <section class="border-b border-border bg-white">
      <div class="page py-7 sm:py-9">
        <p
          class="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600"
        >
          My Account
        </p>

        <h1 class="mt-1 text-2xl font-bold text-heading sm:text-3xl">
          My Bookings
        </h1>

        <p class="mt-2 text-sm text-muted">
          Check your bookings and their current status.
        </p>
      </div>
    </section>

    <!-- ======================================================
         CONTENT
    ======================================================= -->

    <section class="page py-8">
      <!-- ====================================================
           ERROR
      ===================================================== -->

      <div
        v-if="error"
        class="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      >
        <Icon icon="ri:error-warning-line" class="shrink-0 text-lg" />

        <span>
          {{ error }}
        </span>
      </div>

      <!-- ====================================================
           LOADING
      ===================================================== -->

      <div v-if="loading" class="grid gap-4">
        <div
          v-for="item in 3"
          :key="item"
          class="rounded-2xl border border-border bg-white p-5"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <div class="h-5 w-48 animate-pulse rounded bg-slate-200" />

              <div class="mt-3 h-4 w-32 animate-pulse rounded bg-slate-100" />
            </div>

            <div class="h-7 w-20 animate-pulse rounded-full bg-slate-100" />
          </div>

          <div
            class="mt-5 flex items-end justify-between border-t border-border pt-4"
          >
            <div class="h-6 w-20 animate-pulse rounded bg-slate-100" />

            <div class="h-10 w-28 animate-pulse rounded-xl bg-slate-200" />
          </div>
        </div>
      </div>

      <!-- ====================================================
           BOOKINGS
      ===================================================== -->

      <div v-else-if="bookings.length" class="grid gap-4">
        <article
          v-for="booking in bookings"
          :key="booking._id"
          class="rounded-2xl border border-border bg-white p-5 shadow-sm transition hover:border-primary-200 hover:shadow-md sm:p-6"
        >
          <!-- =================================================
               TOP
          ================================================== -->

          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0 flex-1">
              <!-- SERVICE -->

              <h2 class="truncate text-lg font-bold text-heading sm:text-xl">
                {{ serviceNames(booking) }}
              </h2>

              <!-- REFERENCE -->

              <p class="mt-1 text-xs text-muted">
                Booking
                <span class="font-mono">
                  #{{ bookingReference(booking) }}
                </span>
              </p>
            </div>

            <!-- STATUS -->

            <span
              class="inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
              :class="statusClass(booking.status)"
            >
              <span
                class="h-2 w-2 rounded-full"
                :class="statusDotClass(booking.status)"
              />

              {{ statusLabel(booking.status) }}
            </span>
          </div>

          <!-- =================================================
               SIMPLE INFORMATION
          ================================================== -->

          <div class="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <!-- DATE -->

            <div class="flex items-center gap-2 text-muted">
              <Icon icon="ri:calendar-line" class="text-primary-600" />

              <span>
                {{
                  formatDate(
                    booking.description?.booking_date || booking.booking_date,
                  )
                }}
              </span>
            </div>

            <!-- TOTAL -->

            <div class="flex items-center gap-2 text-muted">
              <Icon
                icon="ri:money-dollar-circle-line"
                class="text-primary-600"
              />

              <span class="font-semibold text-heading">
                {{ formatPrice(booking.total_price) }}
              </span>
            </div>
          </div>

          <!-- =================================================
               ACTION
          ================================================== -->

          <div class="mt-5 flex justify-end border-t border-border pt-4">
            <button
              type="button"
              class="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white transition hover:bg-primary-700"
              @click="viewDetails(booking)"
            >
              View Details

              <Icon icon="ri:arrow-right-line" />
            </button>
          </div>
        </article>
      </div>

      <!-- ====================================================
           EMPTY
      ===================================================== -->

      <div
        v-else
        class="rounded-2xl border border-dashed border-border bg-white px-6 py-14 text-center"
      >
        <div
          class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600"
        >
          <Icon icon="ri:calendar-check-line" class="text-2xl" />
        </div>

        <h2 class="mt-4 text-lg font-semibold text-heading">No bookings yet</h2>

        <p class="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
          You haven't made any bookings yet. Explore our services and choose
          your next Koh Rong experience.
        </p>

        <button
          type="button"
          class="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white transition hover:bg-primary-700"
          @click="router.push('/services')"
        >
          <Icon icon="ri:compass-3-line" />

          Explore Services
        </button>
      </div>
    </section>
  </main>
</template>
