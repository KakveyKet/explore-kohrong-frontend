<script setup>
import { computed, ref, watch } from "vue";
import { Icon } from "@iconify/vue";

/*
|--------------------------------------------------------------------------
| PROPS
|--------------------------------------------------------------------------
|
| Pass the real booking object:
|
| <BookingReceiptCard :booking="booking" />
|
*/

const props = defineProps({
  booking: {
    type: Object,
    required: true,
  },
});

/*
|--------------------------------------------------------------------------
| COPY
|--------------------------------------------------------------------------
*/

const copied = ref(false);

/*
|--------------------------------------------------------------------------
| BOOKING OBJECT
|--------------------------------------------------------------------------
*/

const bookingData = computed(() => {
  return props.booking || {};
});

/*
|--------------------------------------------------------------------------
| BOOKING ID
|--------------------------------------------------------------------------
*/

const bookingId = computed(() => {
  return String(bookingData.value?._id || bookingData.value?.id || "").trim();
});

/*
|--------------------------------------------------------------------------
| CREATED DATE
|--------------------------------------------------------------------------
|
| Used only for the short reference.
|
| Priority:
| 1. created_at
| 2. createdAt
| 3. MongoDB ObjectId timestamp
|
*/

function getCreatedDate() {
  const item = bookingData.value;

  /*
   * created_at
   */

  if (item?.created_at) {
    const date = new Date(item.created_at);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  /*
   * createdAt
   */

  if (item?.createdAt) {
    const date = new Date(item.createdAt);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  /*
   * MongoDB ObjectId timestamp
   */

  const id = bookingId.value;

  if (/^[a-fA-F0-9]{24}$/.test(id)) {
    const timestamp = parseInt(id.substring(0, 8), 16);

    const date = new Date(timestamp * 1000);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
}

/*
|--------------------------------------------------------------------------
| BOOKING REFERENCE
|--------------------------------------------------------------------------
|
| Mongo ID:
| 6ad4665fa03b3a0bb53b5541
|
| Example:
| #10_22_2026_541
|
*/

const bookingReference = computed(() => {
  const id = bookingId.value;

  if (!id) {
    return "-";
  }

  const date = getCreatedDate();

  if (!date) {
    return `#${id.slice(-3).toUpperCase()}`;
  }

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  const year = date.getFullYear();

  const lastThree = id.slice(-3).toUpperCase();

  return `#${month}_${day}_${year}_${lastThree}`;
});

/*
|--------------------------------------------------------------------------
| DESCRIPTION
|--------------------------------------------------------------------------
|
| Your current booking payload stores some booking fields inside:
|
| description: {
|   booking_date,
|   booking_time,
|   people,
|   note,
|   booking_channel
| }
|
*/

const description = computed(() => {
  const value = bookingData.value?.description;

  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value;
  }

  return {};
});

/*
|--------------------------------------------------------------------------
| SERVICE
|--------------------------------------------------------------------------
|
| Supports:
|
| service_id: populated service
| products_id: [populated service]
| product_id
| service
|
*/

const service = computed(() => {
  const item = bookingData.value;

  /*
   * service_id populated
   */

  if (item?.service_id && typeof item.service_id === "object") {
    return item.service_id;
  }

  /*
   * products_id populated
   */

  if (Array.isArray(item?.products_id) && item.products_id.length) {
    const first = item.products_id[0];

    if (first && typeof first === "object") {
      return first;
    }
  }

  /*
   * service
   */

  if (item?.service && typeof item.service === "object") {
    return item.service;
  }

  /*
   * product
   */

  if (item?.product && typeof item.product === "object") {
    return item.product;
  }

  return {};
});

/*
|--------------------------------------------------------------------------
| SERVICE NAME
|--------------------------------------------------------------------------
*/

const serviceName = computed(() => {
  return (
    service.value?.name ||
    bookingData.value?.service_name ||
    bookingData.value?.product_name ||
    "Service"
  );
});

/*
|--------------------------------------------------------------------------
| SERVICE IMAGE
|--------------------------------------------------------------------------
*/

const serviceImage = computed(() => {
  return (
    service.value?.thumbnail ||
    service.value?.images?.[0] ||
    bookingData.value?.thumbnail ||
    ""
  );
});

/*
|--------------------------------------------------------------------------
| TOTAL
|--------------------------------------------------------------------------
|
| Your booking form currently sends total_price.
|
*/

const totalAmount = computed(() => {
  const value =
    bookingData.value?.total_price ??
    bookingData.value?.totalPrice ??
    bookingData.value?.total ??
    bookingData.value?.amount ??
    service.value?.price ??
    0;

  return Number(value || 0);
});

/*
|--------------------------------------------------------------------------
| FORMAT PRICE
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
| BOOKING DATE RAW
|--------------------------------------------------------------------------
*/

const bookingDateRaw = computed(() => {
  return (
    bookingData.value?.booking_date ||
    description.value?.booking_date ||
    bookingData.value?.date ||
    ""
  );
});

/*
|--------------------------------------------------------------------------
| FORMAT BOOKING DATE
|--------------------------------------------------------------------------
*/

const bookingDate = computed(() => {
  const value = bookingDateRaw.value;

  if (!value) {
    return "-";
  }

  /*
   * YYYY-MM-DD
   *
   * Avoid timezone changing the date.
   */

  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (match) {
    const [, year, month, day] = match;

    const date = new Date(Number(year), Number(month) - 1, Number(day));

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
});

/*
|--------------------------------------------------------------------------
| BOOKING TIME RAW
|--------------------------------------------------------------------------
*/

const bookingTimeRaw = computed(() => {
  return (
    bookingData.value?.booking_time ||
    description.value?.booking_time ||
    bookingData.value?.time ||
    ""
  );
});

/*
|--------------------------------------------------------------------------
| FORMAT TIME
|--------------------------------------------------------------------------
*/

const bookingTime = computed(() => {
  const value = String(bookingTimeRaw.value || "").trim();

  if (!value) {
    return "-";
  }

  /*
   * Already formatted
   */

  if (
    value.toUpperCase().includes("AM") ||
    value.toUpperCase().includes("PM")
  ) {
    return value;
  }

  /*
   * 08:00
   */

  const match = value.match(/^(\d{1,2}):(\d{2})/);

  if (!match) {
    return value;
  }

  let hour = Number(match[1]);

  const minute = match[2];

  const period = hour >= 12 ? "PM" : "AM";

  hour %= 12;

  if (hour === 0) {
    hour = 12;
  }

  return `${String(hour).padStart(2, "0")}:${minute} ${period}`;
});

/*
|--------------------------------------------------------------------------
| PEOPLE
|--------------------------------------------------------------------------
*/

const peopleCount = computed(() => {
  return Number(
    bookingData.value?.people ??
      description.value?.people ??
      bookingData.value?.guests ??
      1,
  );
});

const guestsLabel = computed(() => {
  const count = peopleCount.value || 1;

  return `${count} ${count === 1 ? "Guest" : "Guests"}`;
});

/*
|--------------------------------------------------------------------------
| PAYMENT
|--------------------------------------------------------------------------
*/

const paymentRaw = computed(() => {
  return String(
    bookingData.value?.paid_type ||
      bookingData.value?.payment_method ||
      bookingData.value?.payment_type ||
      "",
  ).toUpperCase();
});

const paymentLabel = computed(() => {
  const value = paymentRaw.value;

  if (
    value === "CASH" ||
    value === "PAY_AT_CHECK_IN" ||
    value === "PAY_AT_CHECKIN"
  ) {
    return "Pay at Check-in";
  }

  if (value === "BANK" || value === "BANK_TRANSFER") {
    return "Bank Transfer";
  }

  if (!value) {
    return "-";
  }

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
});

/*
|--------------------------------------------------------------------------
| BOOKING CHANNEL
|--------------------------------------------------------------------------
*/

const bookingChannelRaw = computed(() => {
  return String(
    bookingData.value?.booking_channel ||
      description.value?.booking_channel ||
      bookingData.value?.channel ||
      "",
  ).toUpperCase();
});

const bookingChannel = computed(() => {
  const value = bookingChannelRaw.value;

  if (value === "WHATSAPP") {
    return "WhatsApp";
  }

  if (value === "EMAIL") {
    return "Email";
  }

  if (value === "TELEGRAM") {
    return "Telegram";
  }

  return value || "-";
});

/*
|--------------------------------------------------------------------------
| BOOKING CHANNEL ICON
|--------------------------------------------------------------------------
*/

const bookingChannelIcon = computed(() => {
  const value = bookingChannelRaw.value;

  if (value === "WHATSAPP") {
    return "ri:whatsapp-line";
  }

  if (value === "EMAIL") {
    return "ri:mail-line";
  }

  if (value === "TELEGRAM") {
    return "ri:telegram-line";
  }

  return "ri:message-2-line";
});

/*
|--------------------------------------------------------------------------
| COPY
|--------------------------------------------------------------------------
*/

async function copyReference() {
  if (!bookingReference.value || bookingReference.value === "-") {
    return;
  }

  try {
    await navigator.clipboard.writeText(bookingReference.value);

    copied.value = true;

    setTimeout(() => {
      copied.value = false;
    }, 1500);
  } catch (error) {
    console.error("[COPY REFERENCE ERROR]", error);
  }
}

/*
|--------------------------------------------------------------------------
| DEBUG
|--------------------------------------------------------------------------
|
| Useful while testing.
|
*/

watch(
  () => props.booking,
  (value) => {
    console.log("[BOOKING RECEIPT]", value);
  },
  {
    immediate: true,
    deep: true,
  },
);
</script>

<template>
  <article
    class="overflow-hidden rounded-2xl border border-border bg-white shadow-sm"
  >
    <!-- ====================================================== -->
    <!-- SERVICE -->
    <!-- ====================================================== -->

    <div
      class="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
    >
      <!-- LEFT -->

      <div class="flex min-w-0 items-center gap-4">
        <!-- SERVICE IMAGE -->

        <div
          class="flex h-24 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50"
        >
          <img
            v-if="serviceImage"
            :src="serviceImage"
            :alt="serviceName"
            class="h-full w-full object-contain"
          />

          <Icon v-else icon="ri:image-line" class="text-4xl text-slate-300" />
        </div>

        <!-- SERVICE NAME -->

        <div class="min-w-0">
          <p
            class="text-xs font-semibold uppercase tracking-[0.16em] text-primary-500"
          >
            Service
          </p>

          <h2
            class="mt-1 break-words text-xl font-bold text-heading sm:text-2xl"
          >
            {{ serviceName }}
          </h2>
        </div>
      </div>

      <!-- TOTAL -->

      <div class="shrink-0 sm:text-right">
        <p class="text-xs font-medium text-black">Total</p>

        <p class="mt-1 text-2xl font-bold text-primary-500 sm:text-3xl">
          {{ formatPrice(totalAmount) }}
        </p>
      </div>
    </div>

    <!-- ====================================================== -->
    <!-- BOOKING REFERENCE -->
    <!-- ====================================================== -->

    <div
      class="flex flex-col gap-4 border-y border-border bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
    >
      <div class="min-w-0">
        <p class="text-xs font-medium text-black">Booking Reference</p>

        <p class="mt-1 break-words text-sm font-semibold text-heading">
          {{ bookingReference }}
        </p>
      </div>

      <button
        type="button"
        :disabled="bookingReference === '-'"
        class="inline-flex h-10 w-fit shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-heading transition hover:border-primary-500 hover:text-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
        @click="copyReference"
      >
        <Icon
          :icon="copied ? 'ri:check-line' : 'ri:file-copy-line'"
          class="text-base"
        />

        {{ copied ? "Copied" : "Copy" }}
      </button>
    </div>

    <!-- ====================================================== -->
    <!-- BOOKING INFORMATION -->
    <!-- ====================================================== -->

    <div class="p-5 sm:p-6">
      <h3 class="text-lg font-bold text-heading">Booking Information</h3>

      <div class="mt-6 grid gap-x-12 gap-y-6 sm:grid-cols-2">
        <!-- DATE -->

        <div class="flex items-center gap-3">
          <div class="info-icon">
            <Icon icon="ri:calendar-line" />
          </div>

          <div class="min-w-0">
            <p class="text-xs text-black">Date</p>

            <p class="mt-1 break-words text-sm font-semibold text-heading">
              {{ bookingDate }}
            </p>
          </div>
        </div>

        <!-- TIME -->

        <div class="flex items-center gap-3">
          <div class="info-icon">
            <Icon icon="ri:time-line" />
          </div>

          <div class="min-w-0">
            <p class="text-xs text-black">Time</p>

            <p class="mt-1 break-words text-sm font-semibold text-heading">
              {{ bookingTime }}
            </p>
          </div>
        </div>

        <!-- GUESTS -->

        <div class="flex items-center gap-3">
          <div class="info-icon">
            <Icon icon="ri:group-line" />
          </div>

          <div>
            <p class="text-xs text-black">Guests</p>

            <p class="mt-1 text-sm font-semibold text-heading">
              {{ guestsLabel }}
            </p>
          </div>
        </div>

        <!-- PAYMENT -->

        <div class="flex items-center gap-3">
          <div class="info-icon">
            <Icon icon="ri:bank-card-line" />
          </div>

          <div>
            <p class="text-xs text-black">Payment</p>

            <p class="mt-1 text-sm font-semibold text-heading">
              {{ paymentLabel }}
            </p>
          </div>
        </div>

        <!-- BOOKING VIA -->

        <div class="flex items-center gap-3">
          <div class="info-icon">
            <Icon :icon="bookingChannelIcon" />
          </div>

          <div>
            <p class="text-xs text-black">Booking Via</p>

            <p class="mt-1 text-sm font-semibold text-heading">
              {{ bookingChannel }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.info-icon {
  @apply grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-50 text-lg text-primary-500;
}
</style>
