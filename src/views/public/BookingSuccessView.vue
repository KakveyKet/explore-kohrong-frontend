<script setup>
import { computed, onMounted, ref } from "vue";

import { useRoute, useRouter } from "vue-router";

import { Icon } from "@iconify/vue";

import api from "../../services/api.js";

/*
|--------------------------------------------------------------------------
| ROUTER
|--------------------------------------------------------------------------
*/

const route = useRoute();

const router = useRouter();

/*
|--------------------------------------------------------------------------
| STATE
|--------------------------------------------------------------------------
*/

const booking = ref(null);

const loading = ref(true);

const error = ref("");

const copied = ref(false);

/*
|--------------------------------------------------------------------------
| DESCRIPTION
|--------------------------------------------------------------------------
*/

const details = computed(() => {
  if (
    !booking.value?.description ||
    typeof booking.value.description !== "object"
  ) {
    return {};
  }

  return booking.value.description;
});

/*
|--------------------------------------------------------------------------
| SERVICES
|--------------------------------------------------------------------------
*/

const bookingServices = computed(() => {
  const products = booking.value?.products_id;

  if (!Array.isArray(products)) {
    return [];
  }

  return products.filter((item) => item && typeof item === "object");
});

const serviceNames = computed(() => {
  const names = bookingServices.value
    .map((service) => service?.name)
    .filter(Boolean);

  if (names.length) {
    return names.join(", ");
  }

  return details.value?.service_name || "Service";
});

const primaryService = computed(() => {
  if (bookingServices.value.length) {
    return bookingServices.value[0];
  }

  return {
    name: details.value?.service_name || "Service",

    price: details.value?.service_price ?? booking.value?.total_price,

    thumbnail: "",

    images: [],
  };
});

function serviceImage(service) {
  return service?.thumbnail || service?.images?.[0] || "";
}

const primaryServiceImage = computed(() => {
  return serviceImage(primaryService.value);
});

/*
|--------------------------------------------------------------------------
| BOOKING REFERENCE
|--------------------------------------------------------------------------
*/

const bookingReference = computed(() => {
  return (
    booking.value?.booking_code ||
    booking.value?.code ||
    booking.value?._id ||
    "-"
  );
});

/*
|--------------------------------------------------------------------------
| CUSTOMER
|--------------------------------------------------------------------------
*/

const customer = computed(() => {
  const value = booking.value?.customer_id;

  if (value && typeof value === "object") {
    return value;
  }

  return {};
});

const customerName = computed(() => {
  const firstName = String(customer.value?.firstName || "").trim();

  const lastName = String(customer.value?.lastName || "").trim();

  const fullName = `${firstName} ${lastName}`.trim();

  return (
    fullName ||
    customer.value?.username ||
    details.value?.customer_name ||
    booking.value?.customer_name ||
    ""
  );
});

const customerEmail = computed(() => {
  return String(
    customer.value?.email ||
      details.value?.customer_email ||
      booking.value?.customer_email ||
      "",
  ).trim();
});

const customerPhone = computed(() => {
  return String(
    customer.value?.phone ||
      details.value?.customer_phone ||
      booking.value?.customer_phone ||
      "",
  ).trim();
});

const hasCustomerInformation = computed(() => {
  return Boolean(
    customer.value?._id ||
    customerName.value ||
    customerEmail.value ||
    customerPhone.value,
  );
});

/*
|--------------------------------------------------------------------------
| PEOPLE
|--------------------------------------------------------------------------
*/

const guestCount = computed(() => {
  return details.value?.people || booking.value?.people || 1;
});

const guestLabel = computed(() => {
  const people = Number(guestCount.value || 1);

  return `${people} ${people === 1 ? "Guest" : "Guests"}`;
});

/*
|--------------------------------------------------------------------------
| PAYMENT
|--------------------------------------------------------------------------
*/

const paymentLabel = computed(() => {
  const method = String(
    booking.value?.payment_method || booking.value?.paid_type || "",
  ).toUpperCase();

  if (method === "PAY_AT_CHECK_IN" || method === "CASH" || method === "LOBBY") {
    return "Pay at Check-in";
  }

  if (method === "BANK_TRANSFER" || method === "BANK") {
    return "Bank Transfer";
  }

  return booking.value?.payment_method || booking.value?.paid_type || "-";
});

/*
|--------------------------------------------------------------------------
| CHANNEL
|--------------------------------------------------------------------------
*/

const channelLabel = computed(() => {
  const channel = String(details.value?.booking_channel || "").toUpperCase();

  if (channel === "WHATSAPP") {
    return "WhatsApp";
  }

  if (channel === "EMAIL") {
    return "Email";
  }

  return "-";
});

const channelIcon = computed(() => {
  if (channelLabel.value === "WhatsApp") {
    return "ri:whatsapp-line";
  }

  return "ri:mail-line";
});

/*
|--------------------------------------------------------------------------
| NOTE
|--------------------------------------------------------------------------
*/

const bookingNote = computed(() => {
  const value = String(details.value?.note || booking.value?.note || "").trim();

  if (
    !value ||
    ["none", "n/a", "-", "no special request"].includes(value.toLowerCase())
  ) {
    return "";
  }

  return value;
});

/*
|--------------------------------------------------------------------------
| REJECTION
|--------------------------------------------------------------------------
*/

const rejectionReason = computed(() => {
  return String(
    booking.value?.reject_reason ||
      booking.value?.rejection_reason ||
      details.value?.reject_reason ||
      "",
  ).trim();
});

/*
|--------------------------------------------------------------------------
| STATUS
|--------------------------------------------------------------------------
*/

const normalizedStatus = computed(() => {
  return String(booking.value?.status || "PENDING").toUpperCase();
});

const isConfirmed = computed(() => {
  return ["ACCEPT", "ACCEPTED", "CONFIRMED"].includes(normalizedStatus.value);
});

const isCompleted = computed(() => {
  return normalizedStatus.value === "COMPLETED";
});

const isRejected = computed(() => {
  return ["REJECT", "REJECTED", "CANCELLED", "CANCELED"].includes(
    normalizedStatus.value,
  );
});

const statusLabel = computed(() => {
  if (isConfirmed.value) {
    return "Confirmed";
  }

  if (isCompleted.value) {
    return "Completed";
  }

  if (
    normalizedStatus.value === "CANCELLED" ||
    normalizedStatus.value === "CANCELED"
  ) {
    return "Cancelled";
  }

  if (isRejected.value) {
    return "Rejected";
  }

  return "Pending";
});

const statusTitle = computed(() => {
  if (isConfirmed.value) {
    return "Booking Confirmed";
  }

  if (isCompleted.value) {
    return "Booking Completed";
  }

  if (
    normalizedStatus.value === "CANCELLED" ||
    normalizedStatus.value === "CANCELED"
  ) {
    return "Booking Cancelled";
  }

  if (isRejected.value) {
    return "Booking Update";
  }

  return "Booking Received";
});

const statusDescription = computed(() => {
  if (isConfirmed.value) {
    return "Your booking has been confirmed by Explore Koh Rong.";
  }

  if (isCompleted.value) {
    return "Your booking has been completed. Thank you for choosing Explore Koh Rong.";
  }

  if (
    normalizedStatus.value === "CANCELLED" ||
    normalizedStatus.value === "CANCELED"
  ) {
    return "This booking has been cancelled.";
  }

  if (isRejected.value) {
    return "This booking could not be confirmed. Please review the information below.";
  }

  return "Your booking is waiting for confirmation from Explore Koh Rong.";
});

const statusIcon = computed(() => {
  if (isConfirmed.value || isCompleted.value) {
    return "ri:checkbox-circle-fill";
  }

  if (isRejected.value) {
    return "ri:close-circle-fill";
  }

  return "ri:time-fill";
});

const statusBadgeClass = computed(() => {
  if (isConfirmed.value || isCompleted.value) {
    return "bg-green-50 text-green-700";
  }

  if (isRejected.value) {
    return "bg-red-50 text-red-700";
  }

  return "bg-amber-50 text-amber-700";
});

const statusIconClass = computed(() => {
  if (isConfirmed.value || isCompleted.value) {
    return "bg-green-100 text-green-700";
  }

  if (isRejected.value) {
    return "bg-red-100 text-red-700";
  }

  return "bg-amber-100 text-amber-700";
});

const statusDotClass = computed(() => {
  if (isConfirmed.value || isCompleted.value) {
    return "bg-green-500";
  }

  if (isRejected.value) {
    return "bg-red-500";
  }

  return "bg-amber-500";
});

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
| DATE
|--------------------------------------------------------------------------
*/

function formatDate(dateValue) {
  if (!dateValue) {
    return "-";
  }

  /*
   * Prevent YYYY-MM-DD
   * timezone shift.
   */

  if (/^\d{4}-\d{2}-\d{2}$/.test(String(dateValue))) {
    const [year, month, day] = String(dateValue).split("-").map(Number);

    const date = new Date(Date.UTC(year, month - 1, day));

    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",

      day: "2-digit",

      month: "short",

      year: "numeric",

      timeZone: "UTC",
    }).format(date);
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
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
| TIME
|--------------------------------------------------------------------------
*/

function formatTime(value) {
  if (!value) {
    return "-";
  }

  const match = String(value).match(/^(\d{1,2}):(\d{2})$/);

  if (!match) {
    return value;
  }

  let hour = Number(match[1]);

  const minute = match[2];

  const period = hour >= 12 ? "PM" : "AM";

  hour = hour % 12 || 12;

  return `${String(hour).padStart(2, "0")}:${minute} ${period}`;
}

/*
|--------------------------------------------------------------------------
| COPY BOOKING REFERENCE
|--------------------------------------------------------------------------
*/

async function copyBookingId() {
  const text = String(bookingReference.value || "");

  if (!text || text === "-") {
    return;
  }

  try {
    await navigator.clipboard.writeText(text);

    copied.value = true;

    window.setTimeout(() => {
      copied.value = false;
    }, 1500);
  } catch (err) {
    console.warn("Unable to copy booking ID.", err);
  }
}

/*
|--------------------------------------------------------------------------
| LOAD BOOKING
|--------------------------------------------------------------------------
*/

async function loadBooking() {
  loading.value = true;

  error.value = "";

  booking.value = null;

  const id = String(route.params?.id || "").trim();

  if (!id) {
    error.value = "Booking ID is missing.";

    loading.value = false;

    return;
  }

  try {
    const response = await api.get(`/bookings/${id}`);

    booking.value =
      response?.data?.booking || response?.data?.data || response?.data || null;

    if (!booking.value?._id) {
      throw new Error("Booking not found.");
    }
  } catch (err) {
    console.error("[BOOKING DETAIL ERROR]", err);

    error.value =
      err?.response?.data?.message ||
      err?.message ||
      "Unable to load your booking.";
  } finally {
    loading.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| INIT
|--------------------------------------------------------------------------
*/

onMounted(loadBooking);
</script>

<template>
  <main class="min-h-screen bg-surface-soft pb-16">
    <!-- ======================================================
         BREADCRUMB
    ======================================================= -->

    <section class="border-b border-border bg-white">
      <div class="page py-4">
        <div class="flex flex-wrap items-center gap-2 text-sm text-black">
          <RouterLink to="/" class="transition hover:text-primary-600">
            Home
          </RouterLink>

          <Icon icon="ri:arrow-right-s-line" />

          <RouterLink
            to="/my-bookings"
            class="transition hover:text-primary-600"
          >
            My Bookings
          </RouterLink>

          <Icon icon="ri:arrow-right-s-line" />

          <span class="font-medium text-heading"> Booking Details </span>
        </div>
      </div>
    </section>

    <!-- ======================================================
         LOADING
    ======================================================= -->

    <section v-if="loading" class="page py-10">
      <div class="mx-auto max-w-4xl space-y-5">
        <div class="h-36 animate-pulse rounded-2xl bg-slate-200" />

        <div class="h-72 animate-pulse rounded-2xl bg-slate-200" />

        <div class="h-24 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    </section>

    <!-- ======================================================
         ERROR
    ======================================================= -->

    <section v-else-if="error" class="page py-16">
      <div
        class="mx-auto max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm"
      >
        <div
          class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500"
        >
          <Icon icon="ri:error-warning-line" class="text-3xl" />
        </div>

        <h1 class="mt-4 text-xl font-bold text-heading">
          Unable to load booking
        </h1>

        <p class="mt-2 text-sm leading-6 text-black">
          {{ error }}
        </p>

        <button
          type="button"
          class="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white transition hover:bg-primary-700"
          @click="router.push('/my-bookings')"
        >
          <Icon icon="ri:arrow-left-line" />

          My Bookings
        </button>
      </div>
    </section>

    <!-- ======================================================
         DETAILS
    ======================================================= -->

    <section v-else-if="booking" class="page py-8 sm:py-10">
      <div class="mx-auto max-w-4xl space-y-5">
        <!-- ==================================================
             STATUS
        =================================================== -->

        <div
          class="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6"
        >
          <div
            class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="flex items-start gap-4">
              <!-- STATUS ICON -->

              <div
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                :class="statusIconClass"
              >
                <Icon :icon="statusIcon" class="text-2xl" />
              </div>

              <!-- STATUS TEXT -->

              <div>
                <h1 class="text-xl font-bold text-heading sm:text-2xl">
                  {{ statusTitle }}
                </h1>

                <p
                  class="mt-1 max-w-2xl text-sm leading-6 text-black sm:text-base"
                >
                  {{ statusDescription }}
                </p>
              </div>
            </div>

            <!-- STATUS BADGE -->

            <span
              class="inline-flex w-fit shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
              :class="statusBadgeClass"
            >
              <span class="h-2 w-2 rounded-full" :class="statusDotClass" />

              {{ statusLabel }}
            </span>
          </div>
        </div>

        <!-- ==================================================
             MAIN BOOKING CARD
        =================================================== -->

        <div
          class="overflow-hidden rounded-2xl border border-border bg-white shadow-sm"
        >
          <!-- =================================================
               SERVICE
          ================================================== -->

          <div
            class="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6"
          >
            <!-- IMAGE -->

            <div
              class="h-28 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-24 sm:w-32"
            >
              <img
                v-if="primaryServiceImage"
                :src="primaryServiceImage"
                :alt="serviceNames"
                class="h-full w-full object-cover"
              />

              <div v-else class="flex h-full items-center justify-center">
                <Icon icon="ri:image-line" class="text-3xl text-slate-300" />
              </div>
            </div>

            <!-- SERVICE INFORMATION -->

            <div class="min-w-0 flex-1">
              <p
                class="text-xs font-semibold uppercase tracking-[0.15em] text-primary-600"
              >
                Service
              </p>

              <h2 class="mt-1 text-xl font-bold text-heading">
                {{ serviceNames }}
              </h2>

              <p
                v-if="primaryService?.cate_id?.name"
                class="mt-1 text-sm text-black"
              >
                {{ primaryService.cate_id.name }}
              </p>
            </div>

            <!-- TOTAL -->

            <div class="sm:text-right">
              <p class="text-xs text-black">Total</p>

              <p class="mt-1 text-2xl font-bold text-primary-600">
                {{ formatPrice(booking.total_price) }}
              </p>
            </div>
          </div>

          <!-- =================================================
               REFERENCE
          ================================================== -->

          <div class="border-t border-border bg-surface-soft px-5 py-3 sm:px-6">
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0">
                <p class="text-xs text-black">Booking Reference</p>

                <p
                  class="mt-0.5 truncate font-mono text-sm font-medium text-heading"
                >
                  {{ bookingReference }}
                </p>
              </div>

              <!-- COPY -->

              <button
                type="button"
                class="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-border bg-white px-3 text-xs font-semibold text-heading transition hover:border-primary-300 hover:text-primary-600"
                @click="copyBookingId"
              >
                <Icon :icon="copied ? 'ri:check-line' : 'ri:file-copy-line'" />

                {{ copied ? "Copied" : "Copy" }}
              </button>
            </div>
          </div>

          <!-- =================================================
               BOOKING INFORMATION
          ================================================== -->

          <div class="border-t border-border p-5 sm:p-6">
            <h3 class="font-semibold text-heading">Booking Information</h3>

            <div class="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <!-- =============================================
                   DATE
              ============================================== -->

              <div class="flex items-start gap-3">
                <div
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600"
                >
                  <Icon icon="ri:calendar-line" />
                </div>

                <div>
                  <p class="text-xs text-black">Date</p>

                  <p class="mt-1 text-sm font-semibold text-heading">
                    {{
                      formatDate(details.booking_date || booking.booking_date)
                    }}
                  </p>
                </div>
              </div>

              <!-- =============================================
                   TIME
              ============================================== -->

              <div class="flex items-start gap-3">
                <div
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600"
                >
                  <Icon icon="ri:time-line" />
                </div>

                <div>
                  <p class="text-xs text-black">Time</p>

                  <p class="mt-1 text-sm font-semibold text-heading">
                    {{
                      formatTime(details.booking_time || booking.booking_time)
                    }}
                  </p>
                </div>
              </div>

              <!-- =============================================
                   GUESTS
              ============================================== -->

              <div class="flex items-start gap-3">
                <div
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600"
                >
                  <Icon icon="ri:group-line" />
                </div>

                <div>
                  <p class="text-xs text-black">Guests</p>

                  <p class="mt-1 text-sm font-semibold text-heading">
                    {{ guestLabel }}
                  </p>
                </div>
              </div>

              <!-- =============================================
                   PAYMENT
              ============================================== -->

              <div class="flex items-start gap-3">
                <div
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600"
                >
                  <Icon icon="ri:bank-card-line" />
                </div>

                <div>
                  <p class="text-xs text-black">Payment</p>

                  <p class="mt-1 text-sm font-semibold text-heading">
                    {{ paymentLabel }}
                  </p>
                </div>
              </div>

              <!-- =============================================
                   CHANNEL
              ============================================== -->

              <div class="flex items-start gap-3">
                <div
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600"
                >
                  <Icon :icon="channelIcon" />
                </div>

                <div>
                  <p class="text-xs text-black">Booking Via</p>

                  <p class="mt-1 text-sm font-semibold text-heading">
                    {{ channelLabel }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ==================================================
             REJECTION
        =================================================== -->

        <div
          v-if="isRejected && rejectionReason"
          class="rounded-2xl border border-red-200 bg-red-50 p-5"
        >
          <div class="flex items-start gap-3">
            <Icon
              icon="ri:error-warning-line"
              class="mt-0.5 shrink-0 text-xl text-red-600"
            />

            <div>
              <h3 class="font-semibold text-red-800">Booking Update</h3>

              <p class="mt-1 text-sm leading-6 text-red-700">
                {{ rejectionReason }}
              </p>
            </div>
          </div>
        </div>

        <!-- ==================================================
             SPECIAL REQUEST
        =================================================== -->

        <div
          v-if="bookingNote"
          class="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6"
        >
          <div class="flex items-center gap-3">
            <Icon icon="ri:sticky-note-line" class="text-xl text-primary-600" />

            <h3 class="font-semibold text-heading">Special Request</h3>
          </div>

          <p class="mt-3 whitespace-pre-line text-sm leading-6 text-black">
            {{ bookingNote }}
          </p>
        </div>

        <!-- ==================================================
             CUSTOMER
        =================================================== -->

        <div
          v-if="hasCustomerInformation"
          class="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6"
        >
          <!-- HEADER -->

          <div class="flex items-center gap-3">
            <Icon icon="ri:user-3-line" class="text-xl text-primary-600" />

            <h3 class="font-semibold text-heading">Customer Information</h3>
          </div>

          <!-- INFORMATION -->

          <div class="mt-5 grid gap-4 sm:grid-cols-3">
            <!-- NAME -->

            <div v-if="customerName">
              <p class="text-xs text-black">Name</p>

              <p class="mt-1 text-sm font-semibold text-heading">
                {{ customerName }}
              </p>
            </div>

            <!-- PHONE -->

            <div v-if="customerPhone">
              <p class="text-xs text-black">Phone</p>

              <p class="mt-1 text-sm font-semibold text-heading">
                {{ customerPhone }}
              </p>
            </div>

            <!-- EMAIL -->

            <div v-if="customerEmail">
              <p class="text-xs text-black">Email</p>

              <p class="mt-1 break-all text-sm font-semibold text-heading">
                {{ customerEmail }}
              </p>
            </div>
          </div>
        </div>

        <!-- ==================================================
             ACTIONS
        =================================================== -->

        <div class="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
          <!-- BOOK ANOTHER -->

          <button
            type="button"
            class="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-5 text-sm font-semibold text-heading transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600"
            @click="router.push('/services')"
          >
            <Icon icon="ri:add-circle-line" />

            Book Another Service
          </button>

          <!-- MY BOOKINGS -->

          <button
            type="button"
            class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white transition hover:bg-primary-700"
            @click="router.push('/my-bookings')"
          >
            <Icon icon="ri:file-list-3-line" />

            My Bookings
          </button>
        </div>
      </div>
    </section>
  </main>
</template>
