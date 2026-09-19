<template>
  <div>
    <!-- ====================================================== -->
    <!-- HEADER -->
    <!-- ====================================================== -->

    <Toolbar class="!border-0 !bg-transparent !p-0">
      <template #start>
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Booking Histor</h1>
        </div>
      </template>

      <template #end>
        <Button
          label="Refresh"
          icon="pi pi-refresh"
          severity="secondary"
          outlined
          :loading="loading"
          @click="loadBookings"
        />
      </template>
    </Toolbar>

    <!-- ====================================================== -->
    <!-- FILTER -->
    <!-- ====================================================== -->

    <Card class="mt-6 !rounded-2xl">
      <template #content>
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <!-- SEARCH -->

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">
              Search
            </label>

            <IconField class="w-full">
              <InputIcon class="pi pi-search" />

              <InputText
                v-model="filters.search"
                class="w-full"
                placeholder="Customer, email or booking ID"
              />
            </IconField>
          </div>

          <!-- STATUS -->

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">
              Status
            </label>

            <Select
              v-model="filters.status"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              class="w-full"
              placeholder="All Status"
              show-clear
            />
          </div>

          <!-- FROM -->

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">
              From Date
            </label>

            <DatePicker
              v-model="filters.from"
              class="w-full"
              input-class="w-full"
              date-format="dd M yy"
              show-icon
              show-button-bar
            />
          </div>

          <!-- TO -->

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">
              To Date
            </label>

            <DatePicker
              v-model="filters.to"
              class="w-full"
              input-class="w-full"
              date-format="dd M yy"
              show-icon
              show-button-bar
            />
          </div>
        </div>

        <div class="mt-4 flex justify-end">
          <Button
            label="Clear Filters"
            icon="pi pi-filter-slash"
            severity="secondary"
            text
            @click="clearFilters"
          />
        </div>
      </template>
    </Card>

    <!-- ====================================================== -->
    <!-- BOOKING HISTORY -->
    <!-- ====================================================== -->

    <Card class="mt-6 !rounded-2xl">
      <template #title>
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <i class="pi pi-history text-ocean-700" />

            <span> Booking History </span>
          </div>

          <Tag
            :value="`${filteredBookings.length} bookings`"
            severity="secondary"
          />
        </div>
      </template>

      <template #content>
        <DataTable
          :value="filteredBookings"
          :loading="loading"
          striped-rows
          paginator
          :rows="10"
          :rows-per-page-options="[10, 20, 50, 100]"
          responsive-layout="scroll"
          sort-field="created_at"
          :sort-order="-1"
        >
          <!-- BOOKING ID -->

          <Column field="_id" header="Booking ID" sortable>
            <template #body="{ data: row }">
              <span class="font-mono text-xs text-slate-600" :title="row._id">
                {{ shortId(row._id) }}
              </span>
            </template>
          </Column>

          <!-- CUSTOMER -->

          <Column header="Customer" sortable sort-field="customer_id.username">
            <template #body="{ data: row }">
              <div>
                <p class="font-medium text-slate-800">
                  {{ row.customer_id?.username || "-" }}
                </p>

                <p
                  v-if="row.customer_id?.email"
                  class="mt-0.5 text-xs text-slate-400"
                >
                  {{ row.customer_id.email }}
                </p>
              </div>
            </template>
          </Column>

          <!-- SERVICES -->

          <Column header="Service">
            <template #body="{ data: row }">
              <div class="max-w-64">
                {{ bookingServices(row) }}
              </div>
            </template>
          </Column>

          <!-- BOOKING DATE -->

          <Column header="Booking Date">
            <template #body="{ data: row }">
              {{ formatDate(row.description?.booking_date) }}

              <div
                v-if="row.description?.booking_time"
                class="mt-0.5 text-xs text-slate-400"
              >
                {{ row.description.booking_time }}
              </div>
            </template>
          </Column>

          <!-- PEOPLE -->

          <Column header="People">
            <template #body="{ data: row }">
              <div class="flex items-center gap-2">
                <i class="pi pi-users text-slate-400" />

                <span>
                  {{ row.description?.people || 1 }}
                </span>
              </div>
            </template>
          </Column>

          <!-- PAYMENT -->

          <Column header="Payment">
            <template #body="{ data: row }">
              <div>
                <p class="text-sm font-medium text-slate-700">
                  {{ paymentLabel(row.payment_method) }}
                </p>

                <p class="mt-0.5 text-xs text-slate-400">
                  {{ row.paid_type || "-" }}
                </p>
              </div>
            </template>
          </Column>

          <!-- TOTAL -->

          <Column header="Total">
            <template #body="{ data: row }">
              <span class="font-semibold text-slate-800">
                ${{ Number(row.total_price || 0).toFixed(2) }}
              </span>
            </template>
          </Column>

          <!-- STATUS -->

          <Column field="status" header="Status" sortable>
            <template #body="{ data: row }">
              <Tag
                :value="statusLabel(row.status)"
                :severity="bookingStatusSeverity(row.status)"
              />
            </template>
          </Column>

          <!-- CREATED -->

          <Column field="created_at" header="Created" sortable>
            <template #body="{ data: row }">
              {{ formatDateTime(row.created_at) }}
            </template>
          </Column>

          <!-- EMPTY -->

          <template #empty>
            <div class="py-12 text-center text-slate-500">
              <i class="pi pi-history mb-3 block text-4xl text-slate-300" />

              No booking history found.
            </div>
          </template>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";

import { useToast } from "primevue/usetoast";

import Button from "primevue/button";

import Card from "primevue/card";

import Column from "primevue/column";

import DataTable from "primevue/datatable";

import DatePicker from "primevue/datepicker";

import IconField from "primevue/iconfield";

import InputIcon from "primevue/inputicon";

import InputText from "primevue/inputtext";

import Select from "primevue/select";

import Tag from "primevue/tag";

import Toolbar from "primevue/toolbar";

import api from "../../services/api.js";

import { bookingStatusSeverity } from "../../utils/admin.js";

/*
|--------------------------------------------------------------------------
| STATE
|--------------------------------------------------------------------------
*/

const bookings = ref([]);

const loading = ref(false);

const toast = useToast();

/*
|--------------------------------------------------------------------------
| FILTER
|--------------------------------------------------------------------------
*/

const filters = reactive({
  search: "",
  status: null,
  from: null,
  to: null,
});

const statusOptions = [
  {
    label: "Pending",
    value: "PENDING",
  },

  {
    label: "Accepted",
    value: "ACCEPT",
  },

  {
    label: "Rejected",
    value: "REJECT",
  },
];

/*
|--------------------------------------------------------------------------
| LOAD BOOKING HISTORY
|--------------------------------------------------------------------------
*/

async function loadBookings() {
  loading.value = true;

  try {
    /*
     * Read-only report endpoint.
     */

    const response = await api.get("/reports/bookings");

    const payload = response.data;

    /*
     * Supports:
     *
     * [ ... ]
     *
     * or:
     *
     * {
     *   bookings: [...]
     * }
     *
     * or:
     *
     * {
     *   data: [...]
     * }
     */

    if (Array.isArray(payload)) {
      bookings.value = payload;
    } else if (Array.isArray(payload?.bookings)) {
      bookings.value = payload.bookings;
    } else if (Array.isArray(payload?.data)) {
      bookings.value = payload.data;
    } else {
      bookings.value = [];
    }
  } catch (error) {
    console.error("[BOOKING HISTORY ERROR]", error);

    toast.add({
      severity: "error",
      summary: "Booking History",

      detail:
        error.response?.data?.message || "Unable to load booking history.",

      life: 3000,
    });
  } finally {
    loading.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| FILTERED BOOKINGS
|--------------------------------------------------------------------------
*/

const filteredBookings = computed(() => {
  let result = [...bookings.value];

  /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

  const search = String(filters.search || "")
    .trim()
    .toLowerCase();

  if (search) {
    result = result.filter((booking) => {
      const bookingId = String(booking?._id || "").toLowerCase();

      const username = String(
        booking?.customer_id?.username || "",
      ).toLowerCase();

      const email = String(booking?.customer_id?.email || "").toLowerCase();

      const services = bookingServices(booking).toLowerCase();

      return (
        bookingId.includes(search) ||
        username.includes(search) ||
        email.includes(search) ||
        services.includes(search)
      );
    });
  }

  /*
    |--------------------------------------------------------------------------
    | STATUS
    |--------------------------------------------------------------------------
    */

  if (filters.status) {
    result = result.filter((booking) => booking.status === filters.status);
  }

  /*
    |--------------------------------------------------------------------------
    | FROM DATE
    |--------------------------------------------------------------------------
    */

  if (filters.from) {
    const from = new Date(filters.from);

    from.setHours(0, 0, 0, 0);

    result = result.filter((booking) => {
      const created = new Date(booking.created_at);

      return created >= from;
    });
  }

  /*
    |--------------------------------------------------------------------------
    | TO DATE
    |--------------------------------------------------------------------------
    */

  if (filters.to) {
    const to = new Date(filters.to);

    to.setHours(23, 59, 59, 999);

    result = result.filter((booking) => {
      const created = new Date(booking.created_at);

      return created <= to;
    });
  }

  /*
    |--------------------------------------------------------------------------
    | LATEST FIRST
    |--------------------------------------------------------------------------
    */

  return result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
});

/*
|--------------------------------------------------------------------------
| CLEAR
|--------------------------------------------------------------------------
*/

function clearFilters() {
  filters.search = "";

  filters.status = null;

  filters.from = null;

  filters.to = null;
}

/*
|--------------------------------------------------------------------------
| SERVICES
|--------------------------------------------------------------------------
|
| Supports new snapshot:
|
| products
|
| and existing:
|
| products_id
|
*/

function bookingServices(booking) {
  if (Array.isArray(booking?.products) && booking.products.length) {
    return booking.products
      .map((item) => item?.name)
      .filter(Boolean)
      .join(", ");
  }

  if (Array.isArray(booking?.products_id) && booking.products_id.length) {
    return booking.products_id
      .map((item) => item?.name)
      .filter(Boolean)
      .join(", ");
  }

  return "-";
}

/*
|--------------------------------------------------------------------------
| STATUS
|--------------------------------------------------------------------------
*/

function statusLabel(value) {
  switch (value) {
    case "ACCEPT":
      return "Accepted";

    case "REJECT":
      return "Rejected";

    case "PENDING":
      return "Pending";

    default:
      return value || "-";
  }
}

/*
|--------------------------------------------------------------------------
| PAYMENT
|--------------------------------------------------------------------------
*/

function paymentLabel(value) {
  switch (value) {
    case "PAY_AT_CHECK_IN":
      return "Pay at Check-in";

    case "BANK_TRANSFER":
      return "Bank Transfer";

    default:
      return value || "-";
  }
}

/*
|--------------------------------------------------------------------------
| ID
|--------------------------------------------------------------------------
*/

function shortId(value) {
  if (!value) {
    return "-";
  }

  const id = String(value);

  if (id.length <= 14) {
    return id;
  }

  return `${id.slice(0, 7)}...${id.slice(-5)}`;
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

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/*
|--------------------------------------------------------------------------
| DATE TIME
|--------------------------------------------------------------------------
*/

function formatDateTime(value) {
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
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/*
|--------------------------------------------------------------------------
| INIT
|--------------------------------------------------------------------------
*/

onMounted(loadBookings);
</script>
