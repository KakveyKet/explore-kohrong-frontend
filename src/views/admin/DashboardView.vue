<template>
  <div>
    <!-- ====================================================== -->
    <!-- HEADER -->
    <!-- ====================================================== -->

    <Toolbar class="!border-0 !bg-transparent !p-0">
      <template #start>
        <div>
          <h1 class="text-3xl font-bold">Dashboard</h1>
        </div>
      </template>

      <template #end>
        <Button
          label="Refresh"
          icon="pi pi-refresh"
          severity="secondary"
          outlined
          :loading="loading"
          @click="load"
        />
      </template>
    </Toolbar>

    <!-- ====================================================== -->
    <!-- SUMMARY CARDS -->
    <!-- ====================================================== -->

    <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
      <Card v-for="card in cards" :key="card.label" class="!rounded-2xl">
        <template #content>
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm text-slate-500">
                {{ card.label }}
              </p>

              <p class="mt-2 text-3xl font-bold text-slate-900">
                {{ card.value }}
              </p>
            </div>

            <div
              class="flex h-11 w-11 items-center justify-center rounded-xl bg-ocean-50 text-ocean-700"
            >
              <i :class="[card.icon, 'text-lg']" />
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- ====================================================== -->
    <!-- RECENT BOOKINGS -->
    <!-- ====================================================== -->

    <Card class="mt-6 !rounded-2xl">
      <template #title>
        <div class="flex items-center gap-2 text-lg">
          <i class="pi pi-clock text-ocean-700" />

          Recent Bookings
        </div>
      </template>

      <template #content>
        <DataTable
          :value="data.recentBookings || []"
          striped-rows
          responsive-layout="scroll"
          :loading="loading"
        >
          <!-- BOOKING ID -->

          <Column header="Booking ID">
            <template #body="{ data: row }">
              <span class="font-mono text-xs text-slate-600">
                {{ shortId(row._id) }}
              </span>
            </template>
          </Column>

          <!-- CUSTOMER -->

          <Column header="Customer">
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

          <!-- SERVICE -->

          <Column header="Service">
            <template #body="{ data: row }">
              {{ bookingServices(row) }}
            </template>
          </Column>

          <!-- BOOKING DATE -->

          <Column header="Booking Date">
            <template #body="{ data: row }">
              {{ formatDate(row.description?.booking_date) }}
            </template>
          </Column>

          <!-- PEOPLE -->

          <Column header="People">
            <template #body="{ data: row }">
              {{ row.description?.people || 1 }}
            </template>
          </Column>

          <!-- TOTAL -->

          <Column header="Total">
            <template #body="{ data: row }">
              <span class="font-semibold">
                ${{ Number(row.total_price || 0).toFixed(2) }}
              </span>
            </template>
          </Column>

          <!-- STATUS -->

          <Column header="Status">
            <template #body="{ data: row }">
              <Tag
                :value="row.status"
                :severity="bookingStatusSeverity(row.status)"
              />
            </template>
          </Column>

          <!-- CREATED -->

          <Column header="Created">
            <template #body="{ data: row }">
              {{ formatDateTime(row.created_at) }}
            </template>
          </Column>

          <!-- EMPTY -->

          <template #empty>
            <div class="py-10 text-center text-slate-500">
              <i class="pi pi-calendar mb-3 block text-3xl text-slate-300" />

              No recent bookings.
            </div>
          </template>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";

import { useToast } from "primevue/usetoast";

import Button from "primevue/button";
import Card from "primevue/card";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import Tag from "primevue/tag";
import Toolbar from "primevue/toolbar";

import api from "../../services/api.js";

import { connectSocket } from "../../services/socket.js";

import { bookingStatusSeverity } from "../../utils/admin.js";

/*
|--------------------------------------------------------------------------
| STATE
|--------------------------------------------------------------------------
*/

const data = ref({});

const loading = ref(false);

const toast = useToast();

let socket;

/*
|--------------------------------------------------------------------------
| DASHBOARD CARDS
|--------------------------------------------------------------------------
|
| Version 1:
|
| Customers
| Categories
| Services
| Total Bookings
|
| Reviews and Comments are not displayed.
|
*/

const cards = computed(() => [
  {
    label: "Customers",

    value: data.value.customers || 0,

    icon: "pi pi-users",
  },

  {
    label: "Categories",

    value: data.value.categories || 0,

    icon: "pi pi-tags",
  },

  {
    label: "Services",

    value: data.value.services || 0,

    icon: "pi pi-briefcase",
  },

  {
    label: "Total Bookings",

    value: data.value.totalBookings || 0,

    icon: "pi pi-calendar",
  },
]);

/*
|--------------------------------------------------------------------------
| LOAD
|--------------------------------------------------------------------------
*/

async function load() {
  loading.value = true;

  try {
    const response = await api.get("/dashboard");

    data.value = response.data || {};
  } catch (error) {
    console.error("[DASHBOARD ERROR]", error);

    toast.add({
      severity: "error",

      summary: "Dashboard",

      detail: error.response?.data?.message || "Unable to load dashboard.",

      life: 3000,
    });
  } finally {
    loading.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| BOOKING SERVICES
|--------------------------------------------------------------------------
|
| Supports:
|
| Old data:
| products_id
|
| New booking snapshot:
| products
|
*/

function bookingServices(booking) {
  /*
   * New snapshot.
   */

  if (Array.isArray(booking?.products) && booking.products.length) {
    return booking.products
      .map((product) => product?.name)
      .filter(Boolean)
      .join(", ");
  }

  /*
   * Old products_id.
   */

  if (Array.isArray(booking?.products_id) && booking.products_id.length) {
    return booking.products_id
      .map((product) => product?.name)
      .filter(Boolean)
      .join(", ");
  }

  return "-";
}

/*
|--------------------------------------------------------------------------
| BOOKING ID
|--------------------------------------------------------------------------
*/

function shortId(value) {
  if (!value) {
    return "-";
  }

  const id = String(value);

  if (id.length <= 12) {
    return id;
  }

  return `${id.slice(0, 6)}...${id.slice(-6)}`;
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
| SOCKET
|--------------------------------------------------------------------------
*/

onMounted(async () => {
  await load();

  socket = connectSocket();

  socket?.on("booking:new", load);

  socket?.on("booking:updated", load);

  socket?.on("booking:deleted", load);
});

onUnmounted(() => {
  socket?.off("booking:new", load);

  socket?.off("booking:updated", load);

  socket?.off("booking:deleted", load);
});
</script>
