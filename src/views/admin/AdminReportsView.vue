<template>
  <div class="space-y-6">
    <!-- =========================================================
         HEADER
    ========================================================== -->

    <Toolbar class="!border-0 !bg-transparent !p-0">
      <template #start>
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Reports</h1>

          <p class="mt-1 text-sm text-slate-500">
            View customer reports and booking history.
          </p>
        </div>
      </template>

      <template #end>
        <Button
          label="Refresh"
          icon="pi pi-refresh"
          severity="secondary"
          outlined
          :loading="loading"
          @click="loadAll"
        />
      </template>
    </Toolbar>

    <!-- =========================================================
         DATE FILTER
    ========================================================== -->

    <Card class="!rounded-2xl">
      <template #content>
        <div class="grid gap-4 md:grid-cols-[1fr_1fr_auto_auto]">
          <!-- FROM -->

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">
              From
            </label>

            <DatePicker
              v-model="filters.from"
              date-format="yy-mm-dd"
              show-icon
              class="w-full"
              placeholder="Start date"
            />
          </div>

          <!-- TO -->

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">
              To
            </label>

            <DatePicker
              v-model="filters.to"
              date-format="yy-mm-dd"
              show-icon
              class="w-full"
              placeholder="End date"
            />
          </div>

          <!-- APPLY -->

          <div class="flex items-end">
            <Button
              label="Apply"
              icon="pi pi-filter"
              :loading="loading"
              @click="loadAll"
            />
          </div>

          <!-- CLEAR -->

          <div class="flex items-end">
            <Button
              label="Clear"
              icon="pi pi-times"
              severity="secondary"
              outlined
              :disabled="loading"
              @click="clearFilters"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- =========================================================
         SUMMARY
    ========================================================== -->

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <SummaryCard
        label="Total Bookings"
        :value="summary.totalBookings"
        icon="pi pi-calendar"
      />

      <SummaryCard
        label="Pending"
        :value="summary.pendingBookings"
        icon="pi pi-clock"
      />

      <SummaryCard
        label="Accepted"
        :value="summary.acceptedBookings"
        icon="pi pi-check-circle"
      />

      <SummaryCard
        label="Rejected"
        :value="summary.rejectedBookings"
        icon="pi pi-times-circle"
      />

      <SummaryCard
        label="Customers"
        :value="summary.totalCustomers"
        icon="pi pi-users"
      />
    </div>

    <!-- =========================================================
         REPORT TABS
    ========================================================== -->

    <Card class="!rounded-2xl">
      <template #content>
        <Tabs value="bookings">
          <TabList>
            <Tab value="bookings">
              <div class="flex items-center gap-2">
                <i class="pi pi-history" />

                <span>Booking History</span>
              </div>
            </Tab>

            <Tab value="customers">
              <div class="flex items-center gap-2">
                <i class="pi pi-users" />

                <span>Customers</span>
              </div>
            </Tab>
          </TabList>

          <TabPanels>
            <!-- =================================================
                 BOOKING HISTORY
            ================================================== -->

            <TabPanel value="bookings">
              <div class="pt-5">
                <!-- BOOKING FILTER -->

                <div
                  class="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <h2 class="text-lg font-semibold text-slate-900">
                      Booking History
                    </h2>

                    <p class="mt-1 text-sm text-slate-500">
                      {{ filteredBookings.length }}
                      booking{{ filteredBookings.length === 1 ? "" : "s" }}
                    </p>
                  </div>

                  <Select
                    v-model="filters.bookingStatus"
                    :options="bookingStatusOptions"
                    option-label="label"
                    option-value="value"
                    placeholder="All booking statuses"
                    show-clear
                    class="w-full md:w-64"
                  />
                </div>

                <!-- BOOKING TABLE -->

                <DataTable
                  :value="filteredBookings"
                  :loading="loadingBookings"
                  paginator
                  :rows="10"
                  :rows-per-page-options="[10, 20, 50]"
                  striped-rows
                  responsive-layout="scroll"
                  empty-message="No booking history found."
                >
                  <!-- REFERENCE -->

                  <Column header="Booking">
                    <template #body="{ data }">
                      <div>
                        <p class="font-semibold text-slate-900">
                          {{ bookingReference(data) }}
                        </p>

                        <p class="mt-1 text-xs text-slate-500">
                          {{
                            formatDateTime(data.created_at || data.createdAt)
                          }}
                        </p>
                      </div>
                    </template>
                  </Column>

                  <!-- CUSTOMER -->

                  <Column header="Customer">
                    <template #body="{ data }">
                      <div>
                        <p class="font-semibold text-slate-900">
                          {{ bookingCustomerName(data) }}
                        </p>

                        <p class="mt-1 text-xs text-slate-500">
                          {{ bookingCustomerEmail(data) }}
                        </p>

                        <p
                          v-if="bookingCustomerPhone(data)"
                          class="mt-0.5 text-xs text-slate-500"
                        >
                          {{ bookingCustomerPhone(data) }}
                        </p>
                      </div>
                    </template>
                  </Column>

                  <!-- SERVICE -->

                  <Column header="Service">
                    <template #body="{ data }">
                      <div class="space-y-1">
                        <p
                          v-for="(service, index) in bookingServices(data)"
                          :key="`${data._id}-${index}`"
                          class="text-sm text-slate-700"
                        >
                          {{ service }}
                        </p>

                        <span
                          v-if="!bookingServices(data).length"
                          class="text-sm text-slate-400"
                        >
                          -
                        </span>
                      </div>
                    </template>
                  </Column>

                  <!-- BOOKING DATE -->

                  <Column header="Booking Date">
                    <template #body="{ data }">
                      <div>
                        <p class="text-sm text-slate-700">
                          {{
                            formatDate(
                              data.description?.booking_date ||
                                data.booking_date,
                            )
                          }}
                        </p>

                        <p
                          v-if="
                            data.description?.booking_time || data.booking_time
                          "
                          class="mt-1 text-xs text-slate-500"
                        >
                          {{
                            formatTime(
                              data.description?.booking_time ||
                                data.booking_time,
                            )
                          }}
                        </p>
                      </div>
                    </template>
                  </Column>

                  <!-- PEOPLE -->

                  <Column header="Guests">
                    <template #body="{ data }">
                      {{ data.description?.people || data.people || 1 }}
                    </template>
                  </Column>

                  <!-- PAYMENT -->

                  <Column header="Payment">
                    <template #body="{ data }">
                      {{ paymentLabel(data.payment_method || data.paid_type) }}
                    </template>
                  </Column>

                  <!-- TOTAL -->

                  <Column header="Total">
                    <template #body="{ data }">
                      <span class="font-semibold text-slate-900">
                        {{ formatPrice(data.total_price) }}
                      </span>
                    </template>
                  </Column>

                  <!-- STATUS -->

                  <Column header="Status">
                    <template #body="{ data }">
                      <Tag
                        :value="bookingStatusLabel(data.status)"
                        :severity="bookingSeverity(data.status)"
                      />
                    </template>
                  </Column>
                </DataTable>
              </div>
            </TabPanel>

            <!-- =================================================
                 CUSTOMERS
            ================================================== -->

            <TabPanel value="customers">
              <div class="pt-5">
                <div
                  class="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <h2 class="text-lg font-semibold text-slate-900">
                      Customer Report
                    </h2>

                    <p class="mt-1 text-sm text-slate-500">
                      Booking activity for each customer.
                    </p>
                  </div>

                  <div class="relative w-full md:w-72">
                    <i
                      class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400"
                    />

                    <input
                      v-model="customerSearch"
                      type="text"
                      placeholder="Search customer..."
                      class="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
                    />
                  </div>
                </div>

                <DataTable
                  :value="filteredCustomers"
                  :loading="loadingCustomers"
                  paginator
                  :rows="10"
                  :rows-per-page-options="[10, 20, 50]"
                  striped-rows
                  responsive-layout="scroll"
                  empty-message="No customers found."
                >
                  <!-- CUSTOMER -->

                  <Column header="Customer" sortable>
                    <template #body="{ data }">
                      <div class="flex items-center gap-3">
                        <div
                          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary-600"
                        >
                          {{ customerInitials(data) }}
                        </div>

                        <div>
                          <p class="font-semibold text-slate-900">
                            {{ customerName(data) }}
                          </p>

                          <p class="mt-0.5 text-xs text-slate-500">
                            {{ data.username || "-" }}
                          </p>
                        </div>
                      </div>
                    </template>
                  </Column>

                  <!-- EMAIL -->

                  <Column field="email" header="Email">
                    <template #body="{ data }">
                      {{ data.email || "-" }}
                    </template>
                  </Column>

                  <!-- PHONE -->

                  <Column field="phone" header="Phone">
                    <template #body="{ data }">
                      {{ data.phone || "-" }}
                    </template>
                  </Column>

                  <!-- BOOKINGS -->

                  <Column field="total_bookings" header="Bookings" sortable />

                  <!-- ACCEPTED -->

                  <Column field="accepted_bookings" header="Accepted" sortable>
                    <template #body="{ data }">
                      <span class="font-medium text-green-600">
                        {{ data.accepted_bookings }}
                      </span>
                    </template>
                  </Column>

                  <!-- PENDING -->

                  <Column field="pending_bookings" header="Pending" sortable>
                    <template #body="{ data }">
                      <span class="font-medium text-amber-600">
                        {{ data.pending_bookings }}
                      </span>
                    </template>
                  </Column>

                  <!-- REJECTED -->

                  <Column field="rejected_bookings" header="Rejected" sortable>
                    <template #body="{ data }">
                      <span class="font-medium text-red-600">
                        {{ data.rejected_bookings }}
                      </span>
                    </template>
                  </Column>

                  <!-- TOTAL SPENT -->

                  <Column field="total_amount" header="Total Value" sortable>
                    <template #body="{ data }">
                      <span class="font-semibold text-slate-900">
                        {{ formatPrice(data.total_amount) }}
                      </span>
                    </template>
                  </Column>

                  <!-- LAST BOOKING -->

                  <Column header="Last Booking">
                    <template #body="{ data }">
                      {{ formatDateTime(data.last_booking_date) }}
                    </template>
                  </Column>

                  <!-- STATUS -->

                  <Column header="Status">
                    <template #body="{ data }">
                      <Tag
                        :value="data.status || 'ACTIVE'"
                        :severity="
                          String(data.status || 'ACTIVE').toUpperCase() ===
                          'ACTIVE'
                            ? 'success'
                            : 'secondary'
                        "
                      />
                    </template>
                  </Column>
                </DataTable>
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
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
import Select from "primevue/select";
import Tab from "primevue/tab";
import TabList from "primevue/tablist";
import TabPanel from "primevue/tabpanel";
import TabPanels from "primevue/tabpanels";
import Tabs from "primevue/tabs";
import Tag from "primevue/tag";
import Toolbar from "primevue/toolbar";

import api from "../../services/api.js";

import SummaryCard from "../../components/admin/SummaryCard.vue";

/*
|--------------------------------------------------------------------------
| TOAST
|--------------------------------------------------------------------------
*/

const toast = useToast();

/*
|--------------------------------------------------------------------------
| LOADING
|--------------------------------------------------------------------------
*/

const loading = ref(false);

const loadingBookings = ref(false);

const loadingCustomers = ref(false);

/*
|--------------------------------------------------------------------------
| DATA
|--------------------------------------------------------------------------
*/

const bookings = ref([]);

const customers = ref([]);

const customerSearch = ref("");

/*
|--------------------------------------------------------------------------
| FILTER
|--------------------------------------------------------------------------
*/

const filters = reactive({
  from: null,

  to: null,

  bookingStatus: null,
});

/*
|--------------------------------------------------------------------------
| BOOKING STATUS OPTIONS
|--------------------------------------------------------------------------
*/

const bookingStatusOptions = [
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

  {
    label: "Completed",
    value: "COMPLETED",
  },

  {
    label: "Cancelled",
    value: "CANCELLED",
  },
];

/*
|--------------------------------------------------------------------------
| API DATE
|--------------------------------------------------------------------------
*/

function toApiDate(value) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/*
|--------------------------------------------------------------------------
| DATE PARAMETERS
|--------------------------------------------------------------------------
|
| Backend report controller uses:
|
| start_date
| end_date
|
*/

function baseParams() {
  return {
    start_date: toApiDate(filters.from),

    end_date: toApiDate(filters.to),
  };
}

/*
|--------------------------------------------------------------------------
| NORMALIZE STATUS
|--------------------------------------------------------------------------
*/

function normalizeStatus(value) {
  return String(value || "")
    .trim()
    .toUpperCase();
}

/*
|--------------------------------------------------------------------------
| ACCEPTED STATUS
|--------------------------------------------------------------------------
*/

function isAcceptedStatus(value) {
  return ["ACCEPT", "ACCEPTED", "CONFIRMED", "COMPLETED"].includes(
    normalizeStatus(value),
  );
}

/*
|--------------------------------------------------------------------------
| REJECTED STATUS
|--------------------------------------------------------------------------
*/

function isRejectedStatus(value) {
  return ["REJECT", "REJECTED", "CANCELLED", "CANCELED"].includes(
    normalizeStatus(value),
  );
}

/*
|--------------------------------------------------------------------------
| PENDING STATUS
|--------------------------------------------------------------------------
*/

function isPendingStatus(value) {
  return normalizeStatus(value) === "PENDING";
}

/*
|--------------------------------------------------------------------------
| FILTERED BOOKINGS
|--------------------------------------------------------------------------
|
| Status is filtered on frontend.
| Date range is filtered by backend.
|
*/

const filteredBookings = computed(() => {
  if (!filters.bookingStatus) {
    return bookings.value;
  }

  const selected = normalizeStatus(filters.bookingStatus);

  return bookings.value.filter((booking) => {
    const status = normalizeStatus(booking.status);

    if (selected === "ACCEPT") {
      return ["ACCEPT", "ACCEPTED", "CONFIRMED"].includes(status);
    }

    if (selected === "REJECT") {
      return ["REJECT", "REJECTED"].includes(status);
    }

    if (selected === "CANCELLED") {
      return ["CANCELLED", "CANCELED"].includes(status);
    }

    return status === selected;
  });
});

/*
|--------------------------------------------------------------------------
| SUMMARY
|--------------------------------------------------------------------------
*/

const summary = computed(() => {
  return {
    totalBookings: bookings.value.length,

    pendingBookings: bookings.value.filter((booking) =>
      isPendingStatus(booking.status),
    ).length,

    acceptedBookings: bookings.value.filter((booking) =>
      isAcceptedStatus(booking.status),
    ).length,

    rejectedBookings: bookings.value.filter((booking) =>
      isRejectedStatus(booking.status),
    ).length,

    totalCustomers: customers.value.length,
  };
});

/*
|--------------------------------------------------------------------------
| BOOKING CUSTOMER ID
|--------------------------------------------------------------------------
*/

function bookingCustomerId(booking) {
  const customer = booking?.customer_id;

  if (customer && typeof customer === "object") {
    return String(customer._id || "");
  }

  return String(customer || "");
}

/*
|--------------------------------------------------------------------------
| CUSTOMER BOOKING REPORT
|--------------------------------------------------------------------------
|
| We calculate customer booking statistics from
| the booking history already loaded.
|
*/

const customerReport = computed(() => {
  const bookingMap = new Map();

  for (const booking of bookings.value) {
    const customerId = bookingCustomerId(booking);

    if (!customerId) {
      continue;
    }

    if (!bookingMap.has(customerId)) {
      bookingMap.set(customerId, {
        total_bookings: 0,

        accepted_bookings: 0,

        pending_bookings: 0,

        rejected_bookings: 0,

        total_amount: 0,

        last_booking_date: null,
      });
    }

    const report = bookingMap.get(customerId);

    report.total_bookings += 1;

    /*
    |--------------------------------------------------------------------------
    | STATUS
    |--------------------------------------------------------------------------
    */

    if (isAcceptedStatus(booking.status)) {
      report.accepted_bookings += 1;
    } else if (isRejectedStatus(booking.status)) {
      report.rejected_bookings += 1;
    } else {
      report.pending_bookings += 1;
    }

    /*
    |--------------------------------------------------------------------------
    | TOTAL AMOUNT
    |--------------------------------------------------------------------------
    */

    report.total_amount += Number(booking.total_price || 0);

    /*
    |--------------------------------------------------------------------------
    | LAST BOOKING
    |--------------------------------------------------------------------------
    */

    const bookingDate =
      booking.created_at ||
      booking.createdAt ||
      booking.description?.booking_date ||
      null;

    if (bookingDate) {
      const currentDate = new Date(bookingDate);

      const previousDate = report.last_booking_date
        ? new Date(report.last_booking_date)
        : null;

      if (
        !Number.isNaN(currentDate.getTime()) &&
        (!previousDate || currentDate > previousDate)
      ) {
        report.last_booking_date = bookingDate;
      }
    }
  }

  return customers.value.map((customer) => {
    const customerId = String(customer?._id || "");

    const bookingReport = bookingMap.get(customerId) || {
      total_bookings: 0,

      accepted_bookings: 0,

      pending_bookings: 0,

      rejected_bookings: 0,

      total_amount: 0,

      last_booking_date: null,
    };

    return {
      ...customer,

      ...bookingReport,
    };
  });
});

/*
|--------------------------------------------------------------------------
| FILTERED CUSTOMERS
|--------------------------------------------------------------------------
*/

const filteredCustomers = computed(() => {
  const keyword = String(customerSearch.value || "")
    .trim()
    .toLowerCase();

  if (!keyword) {
    return customerReport.value;
  }

  return customerReport.value.filter((customer) => {
    const searchable = [
      customer.firstName,

      customer.lastName,

      customer.username,

      customer.email,

      customer.phone,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchable.includes(keyword);
  });
});

/*
|--------------------------------------------------------------------------
| LOAD BOOKINGS
|--------------------------------------------------------------------------
*/

async function loadBookings() {
  loadingBookings.value = true;

  try {
    const response = await api.get("/reports/bookings", {
      params: baseParams(),
    });

    const data = response?.data;

    if (Array.isArray(data)) {
      bookings.value = data;
    } else if (Array.isArray(data?.bookings)) {
      bookings.value = data.bookings;
    } else if (Array.isArray(data?.data)) {
      bookings.value = data.data;
    } else {
      bookings.value = [];
    }
  } catch (error) {
    console.error("[LOAD BOOKINGS REPORT ERROR]", error);

    bookings.value = [];

    throw error;
  } finally {
    loadingBookings.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| LOAD CUSTOMERS
|--------------------------------------------------------------------------
*/

async function loadCustomers() {
  loadingCustomers.value = true;

  try {
    const response = await api.get("/reports/customers", {
      params: baseParams(),
    });

    const data = response?.data;

    if (Array.isArray(data)) {
      customers.value = data;
    } else if (Array.isArray(data?.customers)) {
      customers.value = data.customers;
    } else if (Array.isArray(data?.data)) {
      customers.value = data.data;
    } else {
      customers.value = [];
    }
  } catch (error) {
    console.error("[LOAD CUSTOMERS REPORT ERROR]", error);

    customers.value = [];

    throw error;
  } finally {
    loadingCustomers.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| LOAD ALL
|--------------------------------------------------------------------------
*/

async function loadAll() {
  if (loading.value) {
    return;
  }

  loading.value = true;

  try {
    await Promise.all([loadBookings(), loadCustomers()]);
  } catch (error) {
    console.error("[LOAD REPORTS ERROR]", error);

    toast.add({
      severity: "error",

      summary: "Reports",

      detail: error?.response?.data?.message || "Unable to load reports.",

      life: 3500,
    });
  } finally {
    loading.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| CLEAR FILTER
|--------------------------------------------------------------------------
*/

async function clearFilters() {
  filters.from = null;

  filters.to = null;

  filters.bookingStatus = null;

  customerSearch.value = "";

  await loadAll();
}

/*
|--------------------------------------------------------------------------
| CUSTOMER NAME
|--------------------------------------------------------------------------
*/

function customerName(customer) {
  const firstName = String(customer?.firstName || "").trim();

  const lastName = String(customer?.lastName || "").trim();

  const name = `${firstName} ${lastName}`.trim();

  return name || customer?.username || "Customer";
}

/*
|--------------------------------------------------------------------------
| CUSTOMER INITIALS
|--------------------------------------------------------------------------
*/

function customerInitials(customer) {
  const name = customerName(customer);

  const parts = name.split(/\s+/).filter(Boolean);

  if (!parts.length) {
    return "C";
  }

  if (parts.length === 1) {
    return String(parts[0][0] || "C").toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/*
|--------------------------------------------------------------------------
| BOOKING CUSTOMER
|--------------------------------------------------------------------------
*/

function bookingCustomer(booking) {
  const customer = booking?.customer_id;

  if (customer && typeof customer === "object") {
    return customer;
  }

  return {};
}

function bookingCustomerName(booking) {
  const customer = bookingCustomer(booking);

  const name = customerName(customer);

  if (name !== "Customer") {
    return name;
  }

  return (
    booking?.description?.customer_name || booking?.customer_name || "Customer"
  );
}

function bookingCustomerEmail(booking) {
  const customer = bookingCustomer(booking);

  return (
    customer?.email ||
    booking?.description?.customer_email ||
    booking?.customer_email ||
    "-"
  );
}

function bookingCustomerPhone(booking) {
  const customer = bookingCustomer(booking);

  return (
    customer?.phone ||
    booking?.description?.customer_phone ||
    booking?.customer_phone ||
    ""
  );
}

/*
|--------------------------------------------------------------------------
| BOOKING SERVICES
|--------------------------------------------------------------------------
*/

function bookingServices(booking) {
  /*
   * Support API returning:
   *
   * products
   * products_id populated
   * description.service_name
   */

  if (Array.isArray(booking?.products)) {
    const values = booking.products
      .map((product) => product?.name)
      .filter(Boolean);

    if (values.length) {
      return values;
    }
  }

  if (Array.isArray(booking?.products_id)) {
    const values = booking.products_id
      .map((product) => {
        if (product && typeof product === "object") {
          return product.name;
        }

        return null;
      })
      .filter(Boolean);

    if (values.length) {
      return values;
    }
  }

  if (booking?.description?.service_name) {
    return [booking.description.service_name];
  }

  return [];
}

/*
|--------------------------------------------------------------------------
| BOOKING REFERENCE
|--------------------------------------------------------------------------
*/

function bookingReference(booking) {
  const value = booking?.booking_code || booking?.code || booking?._id || "-";

  const text = String(value);

  if (value === booking?._id && text.length > 12) {
    return `#${text.slice(0, 8)}`;
  }

  return text;
}

/*
|--------------------------------------------------------------------------
| BOOKING STATUS LABEL
|--------------------------------------------------------------------------
*/

function bookingStatusLabel(status) {
  const value = normalizeStatus(status);

  if (["ACCEPT", "ACCEPTED", "CONFIRMED"].includes(value)) {
    return "Accepted";
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

/*
|--------------------------------------------------------------------------
| BOOKING SEVERITY
|--------------------------------------------------------------------------
*/

function bookingSeverity(status) {
  const value = normalizeStatus(status);

  if (["ACCEPT", "ACCEPTED", "CONFIRMED", "COMPLETED"].includes(value)) {
    return "success";
  }

  if (["REJECT", "REJECTED", "CANCELLED", "CANCELED"].includes(value)) {
    return "danger";
  }

  return "warn";
}

/*
|--------------------------------------------------------------------------
| PAYMENT
|--------------------------------------------------------------------------
*/

function paymentLabel(value) {
  const method = normalizeStatus(value);

  if (["BANK_TRANSFER", "BANK"].includes(method)) {
    return "Bank Transfer";
  }

  if (["PAY_AT_CHECK_IN", "CASH", "LOBBY"].includes(method)) {
    return "Pay at Check-in";
  }

  return value || "-";
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
| DATE
|--------------------------------------------------------------------------
*/

function formatDate(value) {
  if (!value) {
    return "-";
  }

  /*
   * YYYY-MM-DD
   */

  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    const [year, month, day] = String(value).split("-").map(Number);

    const date = new Date(Date.UTC(year, month - 1, day));

    return new Intl.DateTimeFormat("en-US", {
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

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",

    month: "short",

    year: "numeric",

    timeZone: "Asia/Phnom_Penh",
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
| INIT
|--------------------------------------------------------------------------
*/

onMounted(loadAll);
</script>
