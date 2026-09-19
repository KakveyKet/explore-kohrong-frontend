<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";

import { useRoute, useRouter } from "vue-router";

import { Icon } from "@iconify/vue";

import DatePicker from "primevue/datepicker";
import InputNumber from "primevue/inputnumber";
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import Dialog from "primevue/dialog";

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
| BUSINESS CONTACT
|--------------------------------------------------------------------------
*/

const BUSINESS_WHATSAPP = import.meta.env.VITE_WHATSAPP_BUSINESS_NUMBER || "";

const BUSINESS_EMAIL = import.meta.env.VITE_BUSINESS_EMAIL || "";

/*
|--------------------------------------------------------------------------
| STATE
|--------------------------------------------------------------------------
*/

const selectedService = ref(null);

const loading = ref(true);

const submitting = ref(false);

const error = ref("");

const successMessage = ref("");

/*
|--------------------------------------------------------------------------
| CONFIRM DIALOG
|--------------------------------------------------------------------------
*/

const confirmDialog = ref(false);

/*
|--------------------------------------------------------------------------
| FORM
|--------------------------------------------------------------------------
*/

const form = reactive({
  booking_date: null,

  booking_time: "",

  people: 1,

  paid_type: "CASH",

  note: "",

  booking_channel: "WHATSAPP",
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

  if (!id || id === "undefined" || id === "null") {
    return false;
  }

  return /^[a-fA-F0-9]{24}$/.test(id);
}

const serviceId = computed(() => {
  return normalizeServiceId(route.query?.service_id);
});

/*
|--------------------------------------------------------------------------
| TIME
|--------------------------------------------------------------------------
*/

const timeOptions = [
  {
    label: "08:00 AM",

    value: "08:00",
  },

  {
    label: "09:00 AM",

    value: "09:00",
  },

  {
    label: "10:00 AM",

    value: "10:00",
  },

  {
    label: "11:00 AM",

    value: "11:00",
  },

  {
    label: "12:00 PM",

    value: "12:00",
  },

  {
    label: "01:00 PM",

    value: "13:00",
  },

  {
    label: "02:00 PM",

    value: "14:00",
  },

  {
    label: "03:00 PM",

    value: "15:00",
  },

  {
    label: "04:00 PM",

    value: "16:00",
  },

  {
    label: "05:00 PM",

    value: "17:00",
  },
];

/*
|--------------------------------------------------------------------------
| PAYMENT
|--------------------------------------------------------------------------
*/

const paymentOptions = [
  {
    label: "Pay at Check-in",

    value: "CASH",
  },

  {
    label: "Bank Transfer",

    value: "BANK_TRANSFER",
  },
];

/*
|--------------------------------------------------------------------------
| CHANNEL
|--------------------------------------------------------------------------
*/

const channelOptions = [
  {
    label: "WhatsApp",

    value: "WHATSAPP",

    icon: "ri:whatsapp-line",

    description: "Continue your booking through WhatsApp",
  },

  {
    label: "Email",

    value: "EMAIL",

    icon: "ri:mail-line",

    description: "Continue your booking through email",
  },
];

/*
|--------------------------------------------------------------------------
| DATE
|--------------------------------------------------------------------------
*/

const minDate = computed(() => {
  const date = new Date();

  date.setHours(0, 0, 0, 0);

  return date;
});

function apiDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function displayDate(value) {
  if (!value) {
    return "Not selected";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not selected";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",

    month: "short",

    year: "numeric",
  }).format(date);
}

/*
|--------------------------------------------------------------------------
| SERVICE
|--------------------------------------------------------------------------
*/

function normalizeService(response) {
  return (
    response?.data?.service || response?.data?.data || response?.data || null
  );
}

const serviceImage = computed(() => {
  return (
    selectedService.value?.thumbnail || selectedService.value?.images?.[0] || ""
  );
});

const categoryName = computed(() => {
  const category = selectedService.value?.cate_id;

  if (category && typeof category === "object") {
    return category.name || "Service";
  }

  return "Service";
});

const totalPrice = computed(() => {
  return Number(selectedService.value?.price || 0);
});

/*
|--------------------------------------------------------------------------
| FORMAT
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

function displayTime(value) {
  if (!value) {
    return "Not selected";
  }

  return timeOptions.find((item) => item.value === value)?.label || value;
}

function paymentLabel(value) {
  return paymentOptions.find((item) => item.value === value)?.label || value;
}

/*
|--------------------------------------------------------------------------
| CHANNEL LABEL
|--------------------------------------------------------------------------
*/

function channelLabel(value) {
  if (value === "WHATSAPP") {
    return "WhatsApp";
  }

  if (value === "EMAIL") {
    return "Email";
  }

  return "-";
}

/*
|--------------------------------------------------------------------------
| LOAD SERVICE
|--------------------------------------------------------------------------
*/

async function loadService() {
  loading.value = true;

  error.value = "";

  selectedService.value = null;

  const id = serviceId.value;

  if (!isValidServiceId(id)) {
    error.value = "No valid service was selected.";

    loading.value = false;

    return;
  }

  try {
    const response = await api.get(`/services/${id}`);

    const item = normalizeService(response);

    if (!item?._id) {
      throw new Error("Service not found.");
    }

    selectedService.value = item;
  } catch (err) {
    console.error("[BOOKING SERVICE ERROR]", err);

    error.value =
      err?.response?.data?.message || err?.message || "Unable to load service.";
  } finally {
    loading.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| WHATSAPP
|--------------------------------------------------------------------------
*/

function normalizeWhatsAppNumber(value) {
  let number = String(value || "")
    .trim()
    .replace(/\D/g, "");

  if (number.startsWith("8550")) {
    number = `855${number.slice(4)}`;
  }

  if (number.startsWith("0")) {
    number = `855${number.slice(1)}`;
  }

  return number;
}

/*
|--------------------------------------------------------------------------
| VALIDATE
|--------------------------------------------------------------------------
*/

function validateForm() {
  error.value = "";

  if (!isValidServiceId(selectedService.value?._id)) {
    error.value = "Invalid service.";

    return false;
  }

  if (!form.booking_date) {
    error.value = "Please select a booking date.";

    return false;
  }

  if (!form.booking_time) {
    error.value = "Please select a booking time.";

    return false;
  }

  if (!form.people || Number(form.people) < 1) {
    error.value = "Number of guests must be at least 1.";

    return false;
  }

  if (!form.paid_type) {
    error.value = "Please select a payment method.";

    return false;
  }

  if (!form.booking_channel) {
    error.value = "Please select WhatsApp or Email.";

    return false;
  }

  if (
    form.booking_channel === "WHATSAPP" &&
    !normalizeWhatsAppNumber(BUSINESS_WHATSAPP)
  ) {
    error.value = "Business WhatsApp number is not configured.";

    return false;
  }

  if (form.booking_channel === "EMAIL" && !String(BUSINESS_EMAIL).trim()) {
    error.value = "Business email is not configured.";

    return false;
  }

  return true;
}

/*
|--------------------------------------------------------------------------
| OPEN CONFIRMATION
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| This does NOT create the booking.
| It only validates the form and opens the confirmation dialog.
|
*/

function openConfirmDialog() {
  if (!validateForm()) {
    return;
  }

  error.value = "";

  confirmDialog.value = true;
}

/*
|--------------------------------------------------------------------------
| CANCEL CONFIRMATION
|--------------------------------------------------------------------------
*/

function cancelConfirmation() {
  if (submitting.value) {
    return;
  }

  confirmDialog.value = false;
}

/*
|--------------------------------------------------------------------------
| MESSAGE
|--------------------------------------------------------------------------
*/

function buildBookingMessage(booking = null) {
  const note = String(form.note || "").trim();

  const reference =
    booking?.booking_code || booking?.code || booking?._id || "";

  const lines = [
    "Hello Explore Koh Rong,",

    "",

    "I would like to make a booking.",

    "",

    `Service: ${selectedService.value?.name || "-"}`,

    `Date: ${displayDate(form.booking_date)}`,

    `Time: ${displayTime(form.booking_time)}`,

    `Guests: ${form.people}`,

    `Payment: ${paymentLabel(form.paid_type)}`,

    `Total: ${formatPrice(totalPrice.value)}`,
  ];

  if (note) {
    lines.push(`Note: ${note}`);
  }

  if (reference) {
    lines.push(`Booking Reference: ${reference}`);
  }

  lines.push("", "Please confirm my booking. Thank you.");

  return lines.join("\n");
}

/*
|--------------------------------------------------------------------------
| WHATSAPP URL
|--------------------------------------------------------------------------
*/

function buildWhatsAppUrl(booking = null) {
  const phone = normalizeWhatsAppNumber(BUSINESS_WHATSAPP);

  if (!phone) {
    return "";
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(
    buildBookingMessage(booking),
  )}`;
}

/*
|--------------------------------------------------------------------------
| EMAIL URL
|--------------------------------------------------------------------------
*/

function buildEmailUrl(booking = null) {
  const email = String(BUSINESS_EMAIL || "").trim();

  if (!email) {
    return "";
  }

  const subject = `Booking - ${
    selectedService.value?.name || "Explore Koh Rong"
  }`;

  const body = buildBookingMessage(booking);

  return (
    "https://mail.google.com/mail/?view=cm&fs=1" +
    `&to=${encodeURIComponent(email)}` +
    `&su=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`
  );
}

/*
|--------------------------------------------------------------------------
| CONFIRM AND SUBMIT
|--------------------------------------------------------------------------
|
| THIS is the function that actually creates the booking.
|
*/

async function confirmAndSubmitBooking() {
  /*
   * Protect against duplicate clicks.
   */

  if (submitting.value) {
    return;
  }

  /*
   * Validate again in case the form changed.
   */

  if (!validateForm()) {
    confirmDialog.value = false;

    return;
  }

  submitting.value = true;

  error.value = "";

  successMessage.value = "";

  try {
    const id = normalizeServiceId(selectedService.value._id);

    const note = String(form.note || "").trim();

    /*
    |--------------------------------------------------------------------------
    | PAYLOAD
    |--------------------------------------------------------------------------
    */

    const payload = {
      products_id: [id],

      service_id: id,

      booking_date: apiDate(form.booking_date),

      booking_time: form.booking_time,

      people: Number(form.people),

      paid_type: form.paid_type,

      payment_method: form.paid_type,

      total_price: totalPrice.value,

      note,

      description: {
        booking_date: apiDate(form.booking_date),

        booking_time: form.booking_time,

        people: Number(form.people),

        note,

        booking_channel: form.booking_channel,

        service_id: id,

        service_name: selectedService.value.name,

        service_price: Number(selectedService.value.price || 0),
      },
    };

    console.log("[BOOKING PAYLOAD]", payload);

    /*
    |--------------------------------------------------------------------------
    | SAVE BOOKING
    |--------------------------------------------------------------------------
    */

    const response = await api.post("/bookings", payload);

    const booking = response?.data?.booking || response?.data?.data || null;

    successMessage.value = "Booking submitted successfully.";

    /*
     * Close dialog after successful API creation.
     */

    confirmDialog.value = false;

    /*
    |--------------------------------------------------------------------------
    | WHATSAPP
    |--------------------------------------------------------------------------
    */

    if (form.booking_channel === "WHATSAPP") {
      const url = buildWhatsAppUrl(booking);

      if (!url) {
        error.value = "Booking was saved, but WhatsApp could not be opened.";

        return;
      }

      window.location.href = url;

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | EMAIL
    |--------------------------------------------------------------------------
    */

    if (form.booking_channel === "EMAIL") {
      const url = buildEmailUrl(booking);

      if (!url) {
        error.value = "Booking was saved, but Email could not be opened.";

        return;
      }

      window.location.href = url;

      return;
    }
  } catch (err) {
    console.error("[BOOKING ERROR]", err);

    error.value = err?.response?.data?.message || "Unable to submit booking.";

    /*
     * Keep dialog open so customer knows it failed.
     */
  } finally {
    submitting.value = false;
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
| WATCH
|--------------------------------------------------------------------------
*/

watch(
  () => route.query?.service_id,

  (newValue, oldValue) => {
    if (normalizeServiceId(newValue) !== normalizeServiceId(oldValue)) {
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
  <main class="min-h-screen bg-surface-soft pb-16">
    <!-- ======================================================
         BREADCRUMB
    ======================================================= -->

    <section class="border-b border-border bg-white">
      <div class="page py-4">
        <div class="flex items-center gap-2 text-sm text-muted">
          <RouterLink to="/" class="hover:text-primary-600"> Home </RouterLink>

          <Icon icon="ri:arrow-right-s-line" />

          <RouterLink to="/services" class="hover:text-primary-600">
            Services
          </RouterLink>

          <Icon icon="ri:arrow-right-s-line" />

          <span class="font-medium text-heading"> Booking </span>
        </div>
      </div>
    </section>

    <!-- ======================================================
         LOADING
    ======================================================= -->

    <section v-if="loading" class="page py-10">
      <div
        class="mx-auto grid max-w-5xl gap-7 lg:grid-cols-[minmax(0,1fr)_350px]"
      >
        <div class="h-[500px] animate-pulse rounded-2xl bg-slate-200" />

        <div class="h-[480px] animate-pulse rounded-2xl bg-slate-200" />
      </div>
    </section>

    <!-- ======================================================
         INVALID SERVICE
    ======================================================= -->

    <section v-else-if="!selectedService" class="page py-16">
      <div
        class="mx-auto max-w-lg rounded-2xl border border-border bg-white p-8 text-center shadow-sm"
      >
        <Icon
          icon="ri:error-warning-line"
          class="mx-auto text-4xl text-red-500"
        />

        <h1 class="mt-4 text-xl font-bold text-heading">Service unavailable</h1>

        <p class="mt-2 text-sm text-muted">
          {{ error || "Please choose a service first." }}
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
         BOOKING
    ======================================================= -->

    <section v-else class="page py-8 sm:py-10 lg:py-12">
      <div class="mx-auto max-w-5xl">
        <!-- HEADER -->

        <div>
          <p
            class="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600"
          >
            Explore Koh Rong
          </p>

          <h1 class="mt-1 text-2xl font-bold text-heading sm:text-3xl">
            Complete Your Booking
          </h1>

          <p class="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">
            Complete your booking details and continue through WhatsApp or
            Email.
          </p>
        </div>

        <!-- LAYOUT -->

        <div
          class="mt-8 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_350px]"
        >
          <!-- ==================================================
               LEFT
          =================================================== -->

          <div class="space-y-6">
            <!-- ERROR -->

            <div
              v-if="error"
              class="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <Icon icon="ri:error-warning-line" class="mt-0.5 shrink-0" />

              <span>
                {{ error }}
              </span>
            </div>

            <!-- SUCCESS -->

            <div
              v-if="successMessage"
              class="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
            >
              <Icon icon="ri:checkbox-circle-line" class="mt-0.5 shrink-0" />

              <span>
                {{ successMessage }}
              </span>
            </div>

            <!-- ==================================================
                 BOOKING DETAILS
            =================================================== -->

            <div
              class="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6"
            >
              <div class="flex items-center gap-3">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600"
                >
                  <Icon icon="ri:calendar-check-line" class="text-xl" />
                </div>

                <div>
                  <h2 class="font-semibold text-heading">Booking Details</h2>

                  <p class="text-sm text-muted">
                    Choose your preferred schedule.
                  </p>
                </div>
              </div>

              <div class="mt-6 grid gap-5 sm:grid-cols-2">
                <!-- DATE -->

                <div>
                  <label class="label">
                    Booking Date

                    <span class="text-red-500"> * </span>
                  </label>

                  <DatePicker
                    v-model="form.booking_date"
                    :min-date="minDate"
                    date-format="dd M yy"
                    show-icon
                    fluid
                    placeholder="Select date"
                  />
                </div>

                <!-- TIME -->

                <div>
                  <label class="label">
                    Booking Time

                    <span class="text-red-500"> * </span>
                  </label>

                  <Select
                    v-model="form.booking_time"
                    :options="timeOptions"
                    option-label="label"
                    option-value="value"
                    placeholder="Select time"
                    fluid
                  />
                </div>

                <!-- GUESTS -->

                <div>
                  <label class="label">
                    Guests

                    <span class="text-red-500"> * </span>
                  </label>

                  <InputNumber
                    v-model="form.people"
                    :min="1"
                    :max="50"
                    show-buttons
                    fluid
                  />
                </div>

                <!-- PAYMENT -->

                <div>
                  <label class="label">
                    Payment

                    <span class="text-red-500"> * </span>
                  </label>

                  <Select
                    v-model="form.paid_type"
                    :options="paymentOptions"
                    option-label="label"
                    option-value="value"
                    fluid
                  />
                </div>
              </div>

              <!-- NOTE -->

              <div class="mt-5">
                <label class="label"> Special Request </label>

                <Textarea
                  v-model="form.note"
                  rows="4"
                  fluid
                  placeholder="Any special request..."
                />
              </div>
            </div>

            <!-- ==================================================
                 SEND BY
            =================================================== -->

            <div
              class="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6"
            >
              <h2 class="font-semibold text-heading">Send Booking By</h2>

              <p class="mt-1 text-sm text-muted">Choose WhatsApp or Email.</p>

              <div class="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  v-for="channel in channelOptions"
                  :key="channel.value"
                  type="button"
                  class="flex items-center gap-3 rounded-xl border p-4 text-left transition"
                  :class="
                    form.booking_channel === channel.value
                      ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-600/10'
                      : 'border-border hover:border-primary-300'
                  "
                  @click="form.booking_channel = channel.value"
                >
                  <div
                    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-primary-600 shadow-sm"
                  >
                    <Icon :icon="channel.icon" class="text-xl" />
                  </div>

                  <div class="flex-1">
                    <p class="font-semibold text-heading">
                      {{ channel.label }}
                    </p>

                    <p class="text-xs leading-5 text-muted">
                      {{ channel.description }}
                    </p>
                  </div>

                  <Icon
                    :icon="
                      form.booking_channel === channel.value
                        ? 'ri:radio-button-line'
                        : 'ri:checkbox-blank-circle-line'
                    "
                    class="text-xl text-primary-600"
                  />
                </button>
              </div>
            </div>
          </div>

          <!-- ==================================================
               SUMMARY
          =================================================== -->

          <aside class="lg:sticky lg:top-24">
            <div
              class="overflow-hidden rounded-2xl border border-border bg-white shadow-sm"
            >
              <!-- IMAGE -->

              <div class="aspect-[16/9] bg-slate-100">
                <img
                  v-if="serviceImage"
                  :src="serviceImage"
                  :alt="selectedService.name"
                  class="h-full w-full object-cover"
                />

                <div v-else class="flex h-full items-center justify-center">
                  <Icon icon="ri:image-line" class="text-4xl text-slate-300" />
                </div>
              </div>

              <!-- CONTENT -->

              <div class="p-5">
                <p
                  class="text-xs font-semibold uppercase tracking-wider text-primary-600"
                >
                  Booking Summary
                </p>

                <h2 class="mt-2 text-lg font-bold text-heading">
                  {{ selectedService.name }}
                </h2>

                <p class="mt-1 text-xs text-muted">
                  {{ categoryName }}
                </p>

                <!-- DETAILS -->

                <div class="mt-5 space-y-3 border-y border-border py-4 text-sm">
                  <div class="flex justify-between gap-4">
                    <span class="text-muted"> Date </span>

                    <strong>
                      {{ displayDate(form.booking_date) }}
                    </strong>
                  </div>

                  <div class="flex justify-between gap-4">
                    <span class="text-muted"> Time </span>

                    <strong>
                      {{ displayTime(form.booking_time) }}
                    </strong>
                  </div>

                  <div class="flex justify-between gap-4">
                    <span class="text-muted"> Guests </span>

                    <strong>
                      {{ form.people }}
                    </strong>
                  </div>

                  <div class="flex justify-between gap-4">
                    <span class="text-muted"> Payment </span>

                    <strong class="text-right">
                      {{ paymentLabel(form.paid_type) }}
                    </strong>
                  </div>

                  <div class="flex justify-between gap-4">
                    <span class="text-muted"> Send By </span>

                    <strong>
                      {{ channelLabel(form.booking_channel) }}
                    </strong>
                  </div>
                </div>

                <!-- TOTAL -->

                <div class="mt-5 flex items-end justify-between">
                  <span class="text-sm text-muted"> Total Price </span>

                  <span class="text-2xl font-bold text-primary-600">
                    {{ formatPrice(totalPrice) }}
                  </span>
                </div>

                <!-- =================================================
                     OPEN CONFIRM DIALOG
                ================================================== -->

                <button
                  type="button"
                  class="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary-600 font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="submitting"
                  @click="openConfirmDialog"
                >
                  <Icon
                    :icon="
                      form.booking_channel === 'WHATSAPP'
                        ? 'ri:whatsapp-line'
                        : 'ri:mail-send-line'
                    "
                    class="text-lg"
                  />

                  {{
                    form.booking_channel === "WHATSAPP"
                      ? "Continue to WhatsApp"
                      : "Continue to Email"
                  }}
                </button>

                <p class="mt-3 text-center text-xs leading-5 text-muted">
                  You'll review and confirm your booking before it is submitted.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <!-- ======================================================
         CONFIRM BOOKING DIALOG
    ======================================================= -->

    <Dialog
      v-model:visible="confirmDialog"
      modal
      :closable="!submitting"
      :dismissable-mask="!submitting"
      :draggable="false"
      :style="{
        width: '94vw',
        maxWidth: '520px',
      }"
    >
      <!-- ====================================================
           CUSTOM HEADER
      ===================================================== -->

      <template #header>
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600"
          >
            <Icon icon="ri:calendar-check-line" class="text-xl" />
          </div>

          <div>
            <h2 class="font-bold text-heading">Confirm Your Booking</h2>

            <p class="text-xs text-muted">Please review before submitting.</p>
          </div>
        </div>
      </template>

      <!-- ====================================================
           CONTENT
      ===================================================== -->

      <div>
        <!-- NOTICE -->

        <div
          class="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
        >
          <Icon icon="ri:information-line" class="mt-0.5 shrink-0 text-lg" />

          <p class="leading-6">
            After you confirm, your booking will be submitted and you'll
            continue to
            <strong> {{ channelLabel(form.booking_channel) }} </strong>.
          </p>
        </div>

        <!-- ==================================================
             SERVICE
        =================================================== -->

        <div
          class="mt-5 flex items-center gap-4 rounded-xl border border-border bg-surface-soft p-4"
        >
          <div
            class="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100"
          >
            <img
              v-if="serviceImage"
              :src="serviceImage"
              :alt="selectedService.name"
              class="h-full w-full object-cover"
            />

            <div v-else class="flex h-full items-center justify-center">
              <Icon icon="ri:image-line" class="text-xl text-muted" />
            </div>
          </div>

          <div class="min-w-0 flex-1">
            <p class="text-xs text-muted">Service</p>

            <h3 class="mt-0.5 line-clamp-2 font-semibold text-heading">
              {{ selectedService.name }}
            </h3>

            <p class="mt-1 text-sm font-bold text-primary-600">
              {{ formatPrice(totalPrice) }}
            </p>
          </div>
        </div>

        <!-- ==================================================
             BOOKING DETAILS
        =================================================== -->

        <div class="mt-5 overflow-hidden rounded-xl border border-border">
          <!-- DATE -->

          <div
            class="flex items-center justify-between gap-4 border-b border-border px-4 py-3"
          >
            <div class="flex items-center gap-2 text-sm text-muted">
              <Icon icon="ri:calendar-line" class="text-primary-600" />

              Date
            </div>

            <p class="text-sm font-semibold text-heading">
              {{ displayDate(form.booking_date) }}
            </p>
          </div>

          <!-- TIME -->

          <div
            class="flex items-center justify-between gap-4 border-b border-border px-4 py-3"
          >
            <div class="flex items-center gap-2 text-sm text-muted">
              <Icon icon="ri:time-line" class="text-primary-600" />

              Time
            </div>

            <p class="text-sm font-semibold text-heading">
              {{ displayTime(form.booking_time) }}
            </p>
          </div>

          <!-- GUESTS -->

          <div
            class="flex items-center justify-between gap-4 border-b border-border px-4 py-3"
          >
            <div class="flex items-center gap-2 text-sm text-muted">
              <Icon icon="ri:group-line" class="text-primary-600" />

              Guests
            </div>

            <p class="text-sm font-semibold text-heading">
              {{ form.people }}
            </p>
          </div>

          <!-- PAYMENT -->

          <div
            class="flex items-center justify-between gap-4 border-b border-border px-4 py-3"
          >
            <div class="flex items-center gap-2 text-sm text-muted">
              <Icon icon="ri:bank-card-line" class="text-primary-600" />

              Payment
            </div>

            <p class="text-right text-sm font-semibold text-heading">
              {{ paymentLabel(form.paid_type) }}
            </p>
          </div>

          <!-- SEND BY -->

          <div class="flex items-center justify-between gap-4 px-4 py-3">
            <div class="flex items-center gap-2 text-sm text-muted">
              <Icon
                :icon="
                  form.booking_channel === 'WHATSAPP'
                    ? 'ri:whatsapp-line'
                    : 'ri:mail-line'
                "
                class="text-primary-600"
              />

              Send By
            </div>

            <p class="text-sm font-semibold text-heading">
              {{ channelLabel(form.booking_channel) }}
            </p>
          </div>
        </div>

        <!-- ==================================================
             SPECIAL REQUEST
        =================================================== -->

        <div
          v-if="String(form.note || '').trim()"
          class="mt-4 rounded-xl bg-surface-soft p-4"
        >
          <p class="text-xs font-semibold uppercase tracking-wide text-muted">
            Special Request
          </p>

          <p class="mt-2 whitespace-pre-line text-sm leading-6 text-body">
            {{ form.note }}
          </p>
        </div>

        <!-- TOTAL -->

        <div
          class="mt-5 flex items-end justify-between rounded-xl bg-primary-50 p-4"
        >
          <div>
            <p class="text-sm text-muted">Total Amount</p>

            <p class="mt-1 text-xs text-muted">Service total</p>
          </div>

          <p class="text-2xl font-bold text-primary-600">
            {{ formatPrice(totalPrice) }}
          </p>
        </div>

        <!-- ==================================================
             ACTIONS
        =================================================== -->

        <div class="mt-6 grid gap-3 sm:grid-cols-2">
          <!-- CANCEL -->

          <button
            type="button"
            class="flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-semibold text-heading transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="submitting"
            @click="cancelConfirmation"
          >
            <Icon icon="ri:close-line" />

            Go Back
          </button>

          <!-- CONFIRM -->

          <button
            type="button"
            class="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="submitting"
            @click="confirmAndSubmitBooking"
          >
            <Icon
              v-if="submitting"
              icon="ri:loader-4-line"
              class="animate-spin text-lg"
            />

            <Icon
              v-else
              :icon="
                form.booking_channel === 'WHATSAPP'
                  ? 'ri:whatsapp-line'
                  : 'ri:mail-send-line'
              "
              class="text-lg"
            />

            {{
              submitting
                ? "Submitting..."
                : form.booking_channel === "WHATSAPP"
                  ? "Confirm & Open WhatsApp"
                  : "Confirm & Open Email"
            }}
          </button>
        </div>

        <p class="mt-4 text-center text-xs leading-5 text-muted">
          Clicking confirm will create your booking request.
        </p>
      </div>
    </Dialog>
  </main>
</template>
