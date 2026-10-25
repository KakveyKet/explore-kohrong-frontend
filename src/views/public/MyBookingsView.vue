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

  if (["ACCEPT", "ACCEPTED", "CONFIRMED"].includes(value)) {
    return "Confirmed";
  }

  if (["REJECT", "REJECTED"].includes(value)) {
    return "Rejected";
  }

  if (["CANCELLED", "CANCELED"].includes(value)) {
    return "Cancelled";
  }

  if (value === "COMPLETED") {
    return "Completed";
  }

  return "Pending";
}

function statusClass(status) {
  const value = normalizeStatus(status);

  if (["ACCEPT", "ACCEPTED", "CONFIRMED", "COMPLETED"].includes(value)) {
    return "bg-green-50 text-green-700";
  }

  if (["REJECT", "REJECTED", "CANCELLED", "CANCELED"].includes(value)) {
    return "bg-red-50 text-red-700";
  }

  return "bg-amber-50 text-amber-700";
}

function statusDotClass(status) {
  const value = normalizeStatus(status);

  if (["ACCEPT", "ACCEPTED", "CONFIRMED", "COMPLETED"].includes(value)) {
    return "bg-green-500";
  }

  if (["REJECT", "REJECTED", "CANCELLED", "CANCELED"].includes(value)) {
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
    timeZone: "Asia/Phnom_Penh",
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
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

/*
|--------------------------------------------------------------------------
| SERVICE NAME
|--------------------------------------------------------------------------
*/

function serviceNames(booking) {
  /*
  |--------------------------------------------------------------------------
  | PRODUCT SNAPSHOT
  |--------------------------------------------------------------------------
  */

  if (Array.isArray(booking?.products) && booking.products.length) {
    const names = booking.products.map((item) => item?.name).filter(Boolean);

    if (names.length) {
      return names.join(", ");
    }
  }

  /*
  |--------------------------------------------------------------------------
  | POPULATED SERVICES
  |--------------------------------------------------------------------------
  */

  if (Array.isArray(booking?.products_id)) {
    const names = booking.products_id.map((item) => item?.name).filter(Boolean);

    if (names.length) {
      return names.join(", ");
    }
  }

  /*
  |--------------------------------------------------------------------------
  | DESCRIPTION SNAPSHOT
  |--------------------------------------------------------------------------
  */

  if (booking?.description?.service_name) {
    return booking.description.service_name;
  }

  return "Booking";
}

/*
|--------------------------------------------------------------------------
| NEW INVOICE NUMBER
|--------------------------------------------------------------------------
|
| Examples:
|
| AD:001
| AD:002
| AD:003
|
| The backend generates the invoice number.
| The frontend only displays it.
|
| DO NOT use MongoDB _id to generate
| a new invoice number.
|
*/

function bookingReference(booking) {
  const number = String(
    booking?.booking_number || booking?.description?.booking_number || "",
  ).trim();

  if (number) {
    return number;
  }

  /*
   * Existing bookings without migration
   * will show "Not assigned".
   */

  return "Not assigned";
}

/*
|--------------------------------------------------------------------------
| VIEW DETAILS
|--------------------------------------------------------------------------
|
| MongoDB _id is still used for routing.
|
| Invoice number is only for display.
|
*/

function viewDetails(booking) {
  if (!booking?._id) {
    return;
  }

  router.push(`/booking-success/${booking._id}`);
}

/*
|--------------------------------------------------------------------------
| NORMALIZE BOOKING RESPONSE
|--------------------------------------------------------------------------
*/

function normalizeBookings(response) {
  const data = response?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.bookings)) {
    return data.bookings;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.data?.bookings)) {
    return data.data.bookings;
  }

  return [];
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

    bookings.value = normalizeBookings(response);

    console.log(
      "[MY BOOKINGS]",
      bookings.value.map((item) => ({
        id: item._id,
        booking_number: item.booking_number,
        status: item.status,
      })),
    );
  } catch (err) {
    console.error("[MY BOOKINGS ERROR]", err);

    error.value = err?.response?.data?.message || "Unable to load bookings.";
  } finally {
    loading.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| REALTIME UPDATE
|--------------------------------------------------------------------------
*/

function handleBookingUpdated() {
  load();
}

/*
|--------------------------------------------------------------------------
| INIT
|--------------------------------------------------------------------------
*/

onMounted(async () => {
  await load();

  socket = connectSocket();

  socket?.on("booking:updated", handleBookingUpdated);
});

/*
|--------------------------------------------------------------------------
| CLEANUP
|--------------------------------------------------------------------------
*/

onBeforeUnmount(() => {
  socket?.off("booking:updated", handleBookingUpdated);
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

        <h1
          class="mt-1 text-3xl font-bold tracking-tight text-heading sm:text-4xl"
        >
          My Bookings
        </h1>

        <p class="mt-2 text-sm leading-6 text-black sm:text-base">
          Check your bookings, invoice numbers, and current status.
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
           BOOKINGS LIST
      ===================================================== -->

      <div v-else-if="bookings.length" class="grid gap-4">
        <article
          v-for="booking in bookings"
          :key="booking._id"
          class="rounded-2xl border border-border bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md sm:p-6"
        >
          <!-- =================================================
               TOP
          ================================================== -->

          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0 flex-1">
              <!-- SERVICE NAME -->

              <h2 class="truncate text-lg font-bold text-heading sm:text-xl">
                {{ serviceNames(booking) }}
              </h2>

              <!-- NEW INVOICE NUMBER -->

              <div class="mt-2 flex flex-wrap items-center gap-2">
                <span class="text-xs text-black"> Invoice Number: </span>

                <span
                  class="font-mono text-sm font-bold tracking-wide text-primary-600"
                >
                  {{ bookingReference(booking) }}
                </span>
              </div>
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
            <!-- BOOKING DATE -->

            <div class="flex items-center gap-2 text-black">
              <Icon icon="ri:calendar-line" class="text-primary-600" />

              <span>
                {{
                  formatDate(
                    booking.description?.booking_date || booking.booking_date,
                  )
                }}
              </span>
            </div>

            <!-- TOTAL PRICE -->

            <div class="flex items-center gap-2 text-black">
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
               VIEW DETAILS
          ================================================== -->

          <div class="mt-5 flex justify-end border-t border-border pt-4">
            <button
              type="button"
              class="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white transition duration-200 hover:bg-primary-700"
              @click="viewDetails(booking)"
            >
              View Details

              <Icon icon="ri:arrow-right-line" />
            </button>
          </div>
        </article>
      </div>

      <!-- ====================================================
           EMPTY STATE
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

        <h2 class="mt-4 text-xl font-semibold text-heading">No bookings yet</h2>

        <p
          class="mx-auto mt-2 max-w-sm text-sm leading-6 text-black sm:text-base"
        >
          You haven't made any bookings yet. Explore our services and choose
          your next Koh Rong experience.
        </p>

        <button
          type="button"
          class="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white transition duration-200 hover:bg-primary-700"
          @click="router.push('/services')"
        >
          <Icon icon="ri:compass-3-line" />

          Explore Services
        </button>
      </div>
    </section>
  </main>
</template>
