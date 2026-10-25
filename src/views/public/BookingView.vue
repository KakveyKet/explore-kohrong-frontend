<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Icon } from "@iconify/vue";
import DatePicker from "primevue/datepicker";
import InputNumber from "primevue/inputnumber";
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import api from "../../services/api.js";

const route = useRoute();
const router = useRouter();

// Used ONLY to open the user's own WhatsApp chat after the database booking succeeds.
// It does NOT automatically send a WhatsApp message.
const BUSINESS_WHATSAPP = "855885792065";

const selectedService = ref(null);
const loading = ref(true);
const submitting = ref(false);
const bookingCreated = ref(false);
const error = ref("");
const successMessage = ref("");
const warningMessage = ref("");
const whatsappLink = ref("");

const form = reactive({
  booking_date: null,
  booking_time: "",
  people: 1,
  paid_type: "CASH",
  note: "",
  booking_channel: "EMAIL",
});

function normalizeServiceId(value) {
  return String(Array.isArray(value) ? value[0] : value ?? "").trim();
}
function isValidServiceId(value) {
  return /^[a-fA-F0-9]{24}$/.test(normalizeServiceId(value));
}
const serviceId = computed(() => normalizeServiceId(route.query?.service_id));

function applyChannelFromUrl() {
  const channel = String(route.query?.channel || "").toUpperCase();
  if (["EMAIL", "WHATSAPP"].includes(channel)) form.booking_channel = channel;
  else form.booking_channel = "EMAIL";
}

const timeOptions = [
  { label: "08:00 AM", value: "08:00" },
  { label: "09:00 AM", value: "09:00" },
  { label: "10:00 AM", value: "10:00" },
  { label: "11:00 AM", value: "11:00" },
  { label: "12:00 PM", value: "12:00" },
  { label: "01:00 PM", value: "13:00" },
  { label: "02:00 PM", value: "14:00" },
  { label: "03:00 PM", value: "15:00" },
  { label: "04:00 PM", value: "16:00" },
  { label: "05:00 PM", value: "17:00" },
];

const paymentOptions = [
  { label: "Pay at Check-in", value: "CASH" },
  { label: "Bank Transfer", value: "BANK_TRANSFER" },
];

const channelOptions = [
  {
    label: "Email", value: "EMAIL", icon: "ri:mail-line",
    description: "Receive booking communication by email",
  },
  {
    label: "WhatsApp", value: "WHATSAPP", icon: "ri:whatsapp-line",
    description: "Continue booking communication through WhatsApp",
  },
];

const minDate = computed(() => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
});

function apiDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function displayDate(value) {
  if (!value) return "Not selected";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not selected"
    : new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function normalizeService(response) {
  return response?.data?.service || response?.data?.data || response?.data || null;
}

const serviceImage = computed(() =>
  selectedService.value?.thumbnail || selectedService.value?.images?.[0] || "",
);
const categoryName = computed(() => {
  const category = selectedService.value?.cate_id;
  return category && typeof category === "object" ? category.name || "Service" : "Service";
});
const totalPrice = computed(() => Number(selectedService.value?.price || 0));

function formatPrice(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
function displayTime(value) {
  return timeOptions.find((item) => item.value === value)?.label || value || "Not selected";
}
function paymentLabel(value) {
  return paymentOptions.find((item) => item.value === value)?.label || value;
}
function contactLabel(value) {
  return channelOptions.find((item) => item.value === value)?.label || value;
}

/** AD:001/AD:002 comes from MongoDB through the API, never from the browser. */
function bookingReference(booking) {
  const number = String(booking?.booking_number || "").trim();
  if (number) return number;
  const id = String(booking?._id || "").trim();
  return id ? `#${id.slice(-6)}` : "-";
}

function normalizeWhatsAppNumber(value) {
  let number = String(value || "").replace(/\D/g, "");
  if (number.startsWith("8550")) number = `855${number.slice(4)}`;
  else if (number.startsWith("0")) number = `855${number.slice(1)}`;
  return number;
}

function buildWhatsAppMessage(booking) {
  const lines = [
    "Hello Explore Koh Rong,", "",
    "I have submitted a booking and would like to confirm the details.", "",
    `Booking Reference: ${bookingReference(booking)}`,
    `Service: ${selectedService.value?.name || "-"}`,
    `Date: ${displayDate(form.booking_date)}`,
    `Time: ${displayTime(form.booking_time)}`,
    `Guests: ${form.people}`,
    `Payment: ${paymentLabel(form.paid_type)}`,
    `Total: ${formatPrice(booking?.total_price ?? totalPrice.value)}`,
  ];
  if (String(form.note || "").trim()) lines.push(`Note: ${String(form.note).trim()}`);
  lines.push("", "Please confirm my booking. Thank you.");
  return lines.join("\n");
}

function buildWhatsAppUrl(booking) {
  const phone = normalizeWhatsAppNumber(BUSINESS_WHATSAPP);
  if (!phone) return "";
  return `https://wa.me/${phone}?text=${encodeURIComponent(buildWhatsAppMessage(booking))}`;
}

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
    if (!item?._id) throw new Error("Service not found.");
    selectedService.value = item;
  } catch (err) {
    console.error("[BOOKING SERVICE ERROR]", err);
    error.value = err?.response?.data?.message || err?.message || "Unable to load service.";
  } finally {
    loading.value = false;
  }
}

function validateForm() {
  error.value = "";
  warningMessage.value = "";
  if (!isValidServiceId(selectedService.value?._id)) error.value = "Invalid service.";
  else if (!form.booking_date || apiDate(form.booking_date) < apiDate(minDate.value)) {
    error.value = "Please select a valid future booking date.";
  } else if (!form.booking_time) error.value = "Please select a booking time.";
  else if (!Number.isInteger(Number(form.people)) || Number(form.people) < 1) {
    error.value = "Guests must be a positive whole number.";
  } else if (!["CASH", "BANK_TRANSFER"].includes(form.paid_type)) {
    error.value = "Please select a payment method.";
  } else if (!["EMAIL", "WHATSAPP"].includes(form.booking_channel)) {
    error.value = "Please select a contact method.";
  }
  return !error.value;
}

async function submitBooking() {
  if (submitting.value || bookingCreated.value || !validateForm()) return;

  submitting.value = true;
  successMessage.value = "";
  warningMessage.value = "";
  whatsappLink.value = "";

  // Opening a blank tab from the click event avoids popup-blocking after await.
  // The browser may still block it; a visible manual link is provided below.
  const channel = form.booking_channel;
  let whatsappWindow = channel === "WHATSAPP" ? window.open("", "_blank") : null;

  try {
    const id = normalizeServiceId(selectedService.value?._id);
    const note = String(form.note || "").trim();
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
        booking_channel: channel,
        service_id: id,
        service_name: selectedService.value?.name || "",
        service_price: Number(selectedService.value?.price || 0),
      },
    };

    const response = await api.post("/bookings", payload);
    const booking = response?.data?.booking || response?.data?.data;
    if (!booking?._id) {
      throw new Error("Booking response does not include an ID. Check your bookings before trying again.");
    }

    bookingCreated.value = true;
    successMessage.value = `Booking ${bookingReference(booking)} submitted successfully.`;

    const email = response?.data?.notification?.email || booking?.description?.notification?.email;
    if (email?.business?.status === "FAILED") {
      console.error("[BUSINESS EMAIL FAILED]", email.business.error);
      warningMessage.value = "Booking saved. Business email could not be sent; contact us using the booking reference.";
    }
    if (email?.customer?.status === "FAILED") {
      console.warn("[CUSTOMER EMAIL FAILED]", email.customer.error);
    }

    if (channel === "WHATSAPP") {
      const url = buildWhatsAppUrl(booking);
      if (url) {
        whatsappLink.value = url;
        if (whatsappWindow && !whatsappWindow.closed) {
          whatsappWindow.location.replace(url);
        } else {
          warningMessage.value = "Booking saved. Use the Open WhatsApp button below to send your message.";
          return; // Don't redirect before the customer can click the fallback.
        }
      } else {
        whatsappWindow?.close();
        warningMessage.value = "Booking saved, but a WhatsApp link could not be prepared.";
        return;
      }
    }

    // Keep the website available after WhatsApp opens in another tab.
    await router.push(`/my-bookings/${booking._id}`);
  } catch (err) {
    if (whatsappWindow && !whatsappWindow.closed) whatsappWindow.close();
    console.error("[BOOKING ERROR]", err);
    error.value = err?.response?.data?.message || err?.message || "Unable to submit booking.";
  } finally {
    submitting.value = false;
  }
}

function backToServices() {
  router.push("/services");
}

watch(() => route.query?.service_id, (next, previous) => {
  if (normalizeServiceId(next) !== normalizeServiceId(previous)) {
    bookingCreated.value = false;
    loadService();
  }
});
watch(() => route.query?.channel, applyChannelFromUrl);
onMounted(() => {
  applyChannelFromUrl();
  loadService();
});
</script>

<template>
  <main class="min-h-screen bg-surface-soft pb-16">
    <section class="border-b border-border bg-white">
      <div class="page py-4">
        <div class="flex flex-wrap items-center gap-2 text-sm text-muted">
          <RouterLink to="/" class="transition hover:text-primary-600">Home</RouterLink>
          <Icon icon="ri:arrow-right-s-line" />
          <RouterLink to="/services" class="transition hover:text-primary-600">Services</RouterLink>
          <Icon icon="ri:arrow-right-s-line" />
          <span class="font-medium text-heading">Booking</span>
        </div>
      </div>
    </section>

    <section v-if="loading" class="page py-10">
      <div class="mx-auto grid max-w-5xl gap-7 lg:grid-cols-[minmax(0,1fr)_350px]">
        <div class="h-[500px] animate-pulse rounded-2xl bg-slate-200" />
        <div class="h-[480px] animate-pulse rounded-2xl bg-slate-200" />
      </div>
    </section>

    <section v-else-if="!selectedService" class="page py-16">
      <div class="mx-auto max-w-lg rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
        <Icon icon="ri:error-warning-line" class="mx-auto text-4xl text-red-500" />
        <h1 class="mt-4 text-xl font-bold text-heading">Service unavailable</h1>
        <p class="mt-2 text-sm text-muted">{{ error || "Please choose a service first." }}</p>
        <button type="button" class="mt-6 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700" @click="backToServices">
          Back to Services
        </button>
      </div>
    </section>

    <section v-else class="page py-8 sm:py-10 lg:py-12">
      <div class="mx-auto max-w-5xl">
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">Explore Koh Rong</p>
        <h1 class="mt-1 text-2xl font-bold text-heading sm:text-3xl">Complete Your Booking</h1>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">
          Choose your booking details and preferred contact method.
        </p>

        <div class="mt-8 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_350px]">
          <div class="space-y-6">
            <div v-if="error" class="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
              <Icon icon="ri:error-warning-line" class="mt-0.5 shrink-0 text-lg" />
              <span>{{ error }}</span>
            </div>
            <div v-if="warningMessage" class="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700" role="status">
              <Icon icon="ri:alert-line" class="mt-0.5 shrink-0 text-lg" />
              <span>{{ warningMessage }}</span>
            </div>
            <div v-if="successMessage" class="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700" role="status">
              <Icon icon="ri:checkbox-circle-line" class="mt-0.5 shrink-0 text-lg" />
              <span>{{ successMessage }}</span>
            </div>
            <a v-if="whatsappLink" :href="whatsappLink" target="_blank" rel="noopener noreferrer"
               class="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700">
              <Icon icon="ri:whatsapp-line" class="text-lg" />Open WhatsApp
            </a>

            <div class="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <Icon icon="ri:calendar-check-line" class="text-xl" />
                </div>
                <div>
                  <h2 class="font-semibold text-heading">Booking Details</h2>
                  <p class="text-sm text-muted">Choose your preferred schedule.</p>
                </div>
              </div>
              <div class="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label class="label">Booking Date <span class="text-red-500">*</span></label>
                  <DatePicker v-model="form.booking_date" :min-date="minDate" date-format="dd M yy" show-icon fluid placeholder="Select date" />
                </div>
                <div>
                  <label class="label">Booking Time <span class="text-red-500">*</span></label>
                  <Select v-model="form.booking_time" :options="timeOptions" option-label="label" option-value="value" placeholder="Select time" fluid />
                </div>
                <div>
                  <label class="label">Guests <span class="text-red-500">*</span></label>
                  <InputNumber v-model="form.people" :min="1" :max="50" show-buttons fluid />
                </div>
                <div>
                  <label class="label">Payment <span class="text-red-500">*</span></label>
                  <Select v-model="form.paid_type" :options="paymentOptions" option-label="label" option-value="value" fluid />
                </div>
              </div>
              <div class="mt-5">
                <label class="label">Special Request</label>
                <Textarea v-model="form.note" rows="4" fluid placeholder="Any special request..." />
              </div>
            </div>

            <div class="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <Icon icon="ri:message-3-line" class="text-xl" />
                </div>
                <div>
                  <h2 class="font-semibold text-heading">Preferred Contact Method</h2>
                  <p class="mt-1 text-sm text-muted">Choose how you want to communicate about your booking.</p>
                </div>
              </div>
              <div class="mt-5 grid gap-3 sm:grid-cols-2">
                <button v-for="channel in channelOptions" :key="channel.value" type="button"
                        class="flex items-center gap-3 rounded-xl border p-4 text-left transition"
                        :class="form.booking_channel === channel.value ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-600/10' : 'border-border hover:border-primary-300'"
                        :disabled="submitting || bookingCreated"
                        @click="form.booking_channel = channel.value">
                  <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50">
                    <Icon :icon="channel.icon" class="text-xl text-primary-600" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="font-semibold text-heading">{{ channel.label }}</p>
                    <p class="mt-1 text-xs leading-5 text-muted">{{ channel.description }}</p>
                  </div>
                  <Icon :icon="form.booking_channel === channel.value ? 'ri:radio-button-line' : 'ri:checkbox-blank-circle-line'" class="shrink-0 text-xl text-primary-600" />
                </button>
              </div>
              <div v-if="form.booking_channel === 'EMAIL'" class="mt-4 flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-xs leading-5 text-slate-700">
                <Icon icon="ri:mail-check-line" class="mt-0.5 shrink-0 text-base text-primary-600" />
                <span>The system saves your booking, then automatically emails the business and sends you a receipt if your account has an email address.</span>
              </div>
              <div v-else class="mt-4 flex items-start gap-2 rounded-xl bg-green-50 p-3 text-xs leading-5 text-slate-700">
                <Icon icon="ri:whatsapp-line" class="mt-0.5 shrink-0 text-base text-green-600" />
                <span>Your booking is saved and the business email is sent first. WhatsApp then opens with the booking reference (AD:001, AD:002...). Press Send in WhatsApp yourself.</span>
              </div>
            </div>
          </div>

          <aside class="lg:sticky lg:top-24">
            <div class="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
              <div class="aspect-[16/9] bg-slate-100">
                <img v-if="serviceImage" :src="serviceImage" :alt="selectedService.name" class="h-full w-full object-cover" />
                <div v-else class="flex h-full items-center justify-center"><Icon icon="ri:image-line" class="text-5xl text-slate-300" /></div>
              </div>
              <div class="p-5">
                <p class="text-xs font-semibold uppercase tracking-wider text-primary-600">Booking Summary</p>
                <h2 class="mt-2 text-lg font-bold text-heading">{{ selectedService.name }}</h2>
                <p class="mt-1 text-xs text-muted">{{ categoryName }}</p>
                <div class="mt-5 space-y-3 border-y border-border py-4 text-sm">
                  <div class="flex justify-between gap-4"><span class="text-muted">Date</span><strong class="text-right">{{ displayDate(form.booking_date) }}</strong></div>
                  <div class="flex justify-between gap-4"><span class="text-muted">Time</span><strong class="text-right">{{ displayTime(form.booking_time) }}</strong></div>
                  <div class="flex justify-between gap-4"><span class="text-muted">Guests</span><strong>{{ form.people }}</strong></div>
                  <div class="flex justify-between gap-4"><span class="text-muted">Payment</span><strong class="text-right">{{ paymentLabel(form.paid_type) }}</strong></div>
                  <div class="flex justify-between gap-4"><span class="text-muted">Contact</span><strong class="text-right">{{ contactLabel(form.booking_channel) }}</strong></div>
                </div>
                <div class="mt-5 flex items-end justify-between gap-4">
                  <span class="text-sm text-muted">Total Price</span>
                  <span class="text-2xl font-bold text-primary-600">{{ formatPrice(totalPrice) }}</span>
                </div>
                <button type="button" class="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                        :disabled="submitting || bookingCreated" @click="submitBooking">
                  <Icon v-if="submitting" icon="ri:loader-4-line" class="animate-spin text-lg" />
                  <Icon v-else :icon="form.booking_channel === 'WHATSAPP' ? 'ri:whatsapp-line' : 'ri:mail-send-line'" class="text-lg" />
                  {{ bookingCreated ? 'Booking Saved' : submitting ? 'Sending Booking...' : form.booking_channel === 'WHATSAPP' ? 'Book & Continue to WhatsApp' : 'Send Booking by Email' }}
                </button>
                <p class="mt-3 text-center text-xs leading-5 text-muted">Your booking remains <strong>PENDING</strong> until Explore Koh Rong reviews it.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.label { display:block; margin-bottom:0.5rem; font-size:0.875rem; font-weight:500; color:#0f172a; }
</style>
