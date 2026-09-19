<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-slate-900">Dashboard</h1>
      <p class="mt-1 text-sm text-slate-500">
        Booking and operational overview for Explore Koh Rong.
      </p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <SummaryCard label="Total Bookings" :value="summary.totalBookings" icon="pi pi-calendar" />
      <SummaryCard label="Pending Bookings" :value="summary.pendingBookings" icon="pi pi-clock" />
      <SummaryCard label="Customers" :value="summary.totalCustomers" icon="pi pi-users" />
      <SummaryCard label="Active Services" :value="summary.activeServices" icon="pi pi-briefcase" />
      <SummaryCard label="Reviews" :value="summary.totalReviews" icon="pi pi-star" />
      <SummaryCard label="Blog Posts" :value="summary.totalBlogs" icon="pi pi-file-edit" />
    </div>

    <div class="grid gap-6 xl:grid-cols-2">
      <Card>
        <template #title>Booking Status</template>
        <template #content>
          <div class="grid gap-3 sm:grid-cols-3">
            <div class="rounded-xl bg-amber-50 p-4">
              <p class="text-sm text-amber-700">Pending</p>
              <p class="mt-1 text-2xl font-bold text-amber-900">{{ summary.pendingBookings }}</p>
            </div>
            <div class="rounded-xl bg-green-50 p-4">
              <p class="text-sm text-green-700">Accepted</p>
              <p class="mt-1 text-2xl font-bold text-green-900">{{ summary.acceptedBookings }}</p>
            </div>
            <div class="rounded-xl bg-red-50 p-4">
              <p class="text-sm text-red-700">Rejected</p>
              <p class="mt-1 text-2xl font-bold text-red-900">{{ summary.rejectedBookings }}</p>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #title>Popular Services</template>
        <template #content>
          <DataTable :value="popularServices" :loading="loading" :rows="5">
            <Column field="service_name" header="Service" />
            <Column field="booking_count" header="Bookings" />
            <Column header="Rating">
              <template #body="{ data }">{{ Number(data.average_rating || 0).toFixed(1) }}/5</template>
            </Column>
            <template #empty><div class="py-8 text-center text-slate-500">No booking data yet.</div></template>
          </DataTable>
        </template>
      </Card>
    </div>

    <div class="flex justify-end">
      <Button label="View Reports" icon="pi pi-chart-bar" @click="router.push('/admin/reports')" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import Button from "primevue/button";
import Card from "primevue/card";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import api from "../../services/api.js";
import SummaryCard from "../../components/admin/SummaryCard.vue";

const router = useRouter();
const toast = useToast();
const loading = ref(false);
const popularServices = ref([]);
const summary = reactive({
  totalBookings: 0,
  pendingBookings: 0,
  acceptedBookings: 0,
  rejectedBookings: 0,
  totalCustomers: 0,
  activeServices: 0,
  totalReviews: 0,
  totalBlogs: 0,
});

async function loadDashboard() {
  loading.value = true;
  try {
    const [summaryResponse, servicesResponse] = await Promise.all([
      api.get("/reports/summary"),
      api.get("/reports/services"),
    ]);
    Object.assign(summary, summaryResponse.data.summary || {});
    popularServices.value = (servicesResponse.data.services || []).slice(0, 5);
  } catch (error) {
    console.error("DASHBOARD LOAD ERROR:", error);
    toast.add({
      severity: "error",
      summary: "Dashboard",
      detail: error.response?.data?.message || "Unable to load dashboard.",
      life: 3500,
    });
  } finally {
    loading.value = false;
  }
}

onMounted(loadDashboard);
</script>
