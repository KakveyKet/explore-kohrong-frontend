<template>
  <div>
    <!-- ====================================================== -->
    <!-- HEADER -->
    <!-- ====================================================== -->

    <Toolbar class="!border-0 !bg-transparent !p-0">
      <template #start>
        <div>
          <h1 class="text-3xl font-bold">Bookings</h1>
        </div>
      </template>

      <template #end>
        <Button label="Add Booking" icon="pi pi-plus" @click="openCreate" />
      </template>
    </Toolbar>

    <!-- ====================================================== -->
    <!-- TABLE -->
    <!-- ====================================================== -->

    <Card class="mt-6 !rounded-2xl">
      <template #content>
        <!-- ================================================== -->
        <!-- FILTERS -->
        <!-- ================================================== -->

        <div
          class="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_220px_180px_180px_auto]"
        >
          <!-- SEARCH -->

          <IconField>
            <InputIcon class="pi pi-search" />

            <InputText
              v-model="filters.q"
              class="w-full"
              placeholder="Search booking, customer or service"
            />
          </IconField>

          <!-- CUSTOMER -->

          <Select
            v-model="filters.customer_id"
            :options="customerFilterOptions"
            option-label="label"
            option-value="value"
            placeholder="All customers"
            filter
            show-clear
            class="w-full"
          />

          <!-- STATUS -->

          <Select
            v-model="filters.status"
            :options="statusOptions"
            placeholder="All statuses"
            show-clear
            class="w-full"
          />

          <!-- PAYMENT -->

          <Select
            v-model="filters.paid_type"
            :options="paidTypeOptions"
            placeholder="All payments"
            show-clear
            class="w-full"
          />

          <!-- REFRESH -->

          <Button
            icon="pi pi-refresh"
            severity="secondary"
            outlined
            :loading="loading"
            @click="load"
          />
        </div>

        <!-- ================================================== -->
        <!-- DATA TABLE -->
        <!-- ================================================== -->

        <DataTable
          :value="filteredItems"
          paginator
          :rows="10"
          :rows-per-page-options="[10, 20, 50]"
          striped-rows
          responsive-layout="scroll"
          :loading="loading"
        >
          <!-- BOOKING -->

          <Column header="Booking">
            <template #body="{ data }">
              <span class="font-mono text-xs">
                {{ shortId(data._id) }}
              </span>

              <div class="text-xs text-slate-500">
                {{ formatDateTime(data.created_at) }}
              </div>
            </template>
          </Column>

          <!-- CUSTOMER -->

          <Column header="Customer">
            <template #body="{ data }">
              <div class="font-medium">
                {{ customerDisplayName(data) }}
              </div>

              <small class="text-slate-500">
                {{ customerEmail(data) }}
              </small>
            </template>
          </Column>

          <!-- SERVICES -->

          <Column header="Services">
            <template #body="{ data }">
              <span class="line-clamp-2">
                {{ serviceNames(data) }}
              </span>
            </template>
          </Column>

          <!-- DATE -->

          <Column header="Date">
            <template #body="{ data }">
              {{ formatBookingDate(data.description?.booking_date) }}
            </template>
          </Column>

          <!-- CHANNEL -->

          <Column header="Channel">
            <template #body="{ data }">
              <Tag
                :value="channelLabel(data)"
                :severity="channelSeverity(data)"
              />
            </template>
          </Column>

          <!-- PAYMENT -->

          <Column header="Payment">
            <template #body="{ data }">
              <Tag :value="paidTypeLabel(data.paid_type)" severity="info" />

              <div class="mt-1 text-xs text-slate-500">
                {{ paymentLabel(data.payment_method) }}
              </div>
            </template>
          </Column>

          <!-- TOTAL -->

          <Column header="Total">
            <template #body="{ data }">
              <span class="font-semibold">
                ${{ Number(data.total_price || 0).toFixed(2) }}
              </span>
            </template>
          </Column>

          <!-- STATUS -->

          <Column header="Status">
            <template #body="{ data }">
              <Tag
                :value="data.status"
                :severity="bookingStatusSeverity(data.status)"
              />
            </template>
          </Column>

          <!-- ACTIONS -->

          <Column header="Actions" frozen align-frozen="right">
            <template #body="{ data }">
              <div class="flex gap-1">
                <Button icon="pi pi-eye" text rounded @click="openView(data)" />

                <Button
                  icon="pi pi-pencil"
                  text
                  rounded
                  @click="openEdit(data)"
                />

                <Button
                  v-if="data.status === 'PENDING'"
                  icon="pi pi-check"
                  text
                  rounded
                  severity="success"
                  @click="accept(data)"
                />

                <Button
                  v-if="data.status === 'PENDING'"
                  icon="pi pi-times"
                  text
                  rounded
                  severity="danger"
                  @click="openReject(data)"
                />

                <Button
                  icon="pi pi-trash"
                  text
                  rounded
                  severity="danger"
                  @click="confirmDelete(data)"
                />
              </div>
            </template>
          </Column>

          <!-- EMPTY -->

          <template #empty>
            <div class="py-8 text-center text-slate-500">
              <i class="pi pi-calendar mb-2 block text-2xl" />

              No bookings found.
            </div>
          </template>
        </DataTable>
      </template>
    </Card>

    <!-- ====================================================== -->
    <!-- CREATE / EDIT / VIEW DIALOG -->
    <!-- ====================================================== -->

    <Dialog
      v-model:visible="editVisible"
      modal
      :header="
        viewOnly
          ? 'Booking Details'
          : editingId
            ? 'Edit Booking'
            : 'Add Booking'
      "
      :style="{ width: '54rem' }"
      :breakpoints="{
        '960px': '92vw',
        '640px': '96vw',
      }"
    >
      <div class="grid gap-5">
        <div class="grid gap-4 sm:grid-cols-2">
          <!-- CUSTOMER -->

          <div>
            <label class="label"> Customer </label>

            <Select
              v-model="form.customer_id"
              :options="customerOptions"
              option-label="label"
              option-value="value"
              filter
              class="w-full"
              :disabled="viewOnly"
            />
          </div>

          <!-- SERVICES -->

          <div>
            <label class="label"> Services </label>

            <MultiSelect
              v-model="form.products_id"
              :options="serviceOptions"
              option-label="label"
              option-value="value"
              filter
              display="chip"
              class="w-full"
              :disabled="viewOnly"
            />
          </div>

          <!-- DATE -->

          <div>
            <label class="label"> Booking Date </label>

            <InputText
              v-model="form.booking_date"
              type="date"
              class="w-full"
              :disabled="viewOnly"
            />
          </div>

          <!-- TIME -->

          <div>
            <label class="label"> Booking Time </label>

            <InputText
              v-model="form.booking_time"
              type="time"
              class="w-full"
              :disabled="viewOnly"
            />
          </div>

          <!-- PEOPLE -->

          <div>
            <label class="label"> People </label>

            <InputNumber
              v-model="form.people"
              :min="1"
              :max="100"
              show-buttons
              class="w-full"
              input-class="w-full"
              :disabled="viewOnly"
            />
          </div>

          <!-- STATUS -->

          <div>
            <label class="label"> Status </label>

            <Select
              v-model="form.status"
              :options="statusOptions"
              class="w-full"
              :disabled="viewOnly"
            />
          </div>

          <!-- PAID TYPE -->

          <div>
            <label class="label"> Paid Type </label>

            <Select
              v-model="form.paid_type"
              :options="paidTypeOptions"
              class="w-full"
              :disabled="viewOnly"
              @change="syncPaymentMethod"
            />
          </div>

          <!-- PAYMENT -->

          <div>
            <label class="label"> Payment Method </label>

            <Select
              v-model="form.payment_method"
              :options="paymentMethodOptions"
              class="w-full"
              :disabled="viewOnly"
            />
          </div>

          <!-- CHANNEL -->

          <div>
            <label class="label"> Booking Via </label>

            <InputText
              :model-value="form.booking_channel || '-'"
              class="w-full"
              disabled
            />
          </div>
        </div>

        <!-- NOTE -->

        <div>
          <label class="label"> Special Request / Note </label>

          <Textarea
            v-model="form.note"
            rows="4"
            class="w-full"
            auto-resize
            :disabled="viewOnly"
          />
        </div>

        <!-- CONTACT MESSAGE -->

        <div>
          <label class="label"> Contact Message </label>

          <Textarea
            v-model="form.contact_message"
            rows="3"
            class="w-full"
            auto-resize
            :disabled="viewOnly"
          />
        </div>

        <!-- REJECT REASON -->

        <div v-if="form.reject_reason">
          <label class="label"> Reject Reason </label>

          <Message severity="error" :closable="false">
            {{ form.reject_reason }}
          </Message>
        </div>

        <!-- ERROR -->

        <Message v-if="dialogError" severity="error" :closable="false">
          {{ dialogError }}
        </Message>
      </div>

      <template #footer>
        <Button
          :label="viewOnly ? 'Close' : 'Cancel'"
          icon="pi pi-times"
          severity="secondary"
          outlined
          @click="editVisible = false"
        />

        <Button
          v-if="!viewOnly"
          label="Save"
          icon="pi pi-save"
          :loading="saving"
          @click="save"
        />
      </template>
    </Dialog>

    <!-- ====================================================== -->
    <!-- REJECT DIALOG -->
    <!-- ====================================================== -->

    <Dialog
      v-model:visible="rejectVisible"
      modal
      header="Reject Booking"
      :style="{ width: '36rem' }"
      :breakpoints="{
        '640px': '96vw',
      }"
    >
      <div v-if="rejectingBooking" class="space-y-5">
        <!-- CUSTOMER -->

        <div class="rounded-2xl border border-border bg-surface-soft p-4">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs text-muted">Customer</p>

              <p class="mt-1 font-semibold text-heading">
                {{ customerDisplayName(rejectingBooking) }}
              </p>
            </div>

            <Tag
              :value="channelLabel(rejectingBooking)"
              :severity="channelSeverity(rejectingBooking)"
            />
          </div>

          <!-- WHATSAPP CONTACT -->

          <div
            v-if="bookingChannel(rejectingBooking) === 'WHATSAPP'"
            class="mt-3 flex items-center gap-2 text-sm text-muted"
          >
            <i class="pi pi-whatsapp text-green-600" />

            {{
              bookingCustomerPhone(rejectingBooking) ||
              "No WhatsApp phone number"
            }}
          </div>

          <!-- EMAIL CONTACT -->

          <div
            v-if="bookingChannel(rejectingBooking) === 'EMAIL'"
            class="mt-3 flex items-center gap-2 text-sm text-muted"
          >
            <i class="pi pi-envelope text-primary-600" />

            {{ bookingCustomerEmail(rejectingBooking) || "No customer email" }}
          </div>
        </div>

        <!-- CONTACT AVAILABLE -->

        <div
          v-if="rejectionContactAvailable"
          class="rounded-xl border border-blue-200 bg-blue-50 p-4"
        >
          <div class="flex items-start gap-3">
            <i class="pi pi-info-circle mt-0.5 text-blue-600" />

            <p class="text-sm leading-6 text-blue-700">
              The booking will be rejected first. Then
              {{ rejectionChannelDescription }}
              will open with the confirmation message.
            </p>
          </div>
        </div>

        <!-- CONTACT MISSING -->

        <div v-else class="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div class="flex items-start gap-3">
            <i class="pi pi-exclamation-triangle mt-0.5 text-amber-600" />

            <div>
              <p class="text-sm font-semibold text-amber-900">
                Customer contact unavailable
              </p>

              <p class="mt-1 text-sm leading-6 text-amber-700">
                You can still reject this booking. The status will be changed to
                REJECT, but the customer notification cannot be opened.
              </p>
            </div>
          </div>
        </div>

        <!-- REASON -->

        <div>
          <label class="label">
            Reject Reason

            <span class="font-normal text-muted"> (optional) </span>
          </label>

          <Textarea
            v-model="rejectReason"
            rows="4"
            class="w-full"
            auto-resize
            placeholder="Tell the customer why the booking cannot be confirmed"
          />
        </div>

        <!-- PREVIEW -->

        <div>
          <label class="label"> Customer Message Preview </label>

          <div
            class="max-h-64 overflow-y-auto whitespace-pre-line rounded-xl border border-border bg-surface-soft p-4 text-sm leading-6 text-body"
          >
            {{ rejectionMessagePreview }}
          </div>
        </div>

        <!-- ERROR -->

        <Message v-if="rejectError" severity="error" :closable="false">
          {{ rejectError }}
        </Message>
      </div>

      <template #footer>
        <Button
          label="Cancel"
          severity="secondary"
          outlined
          :disabled="saving"
          @click="rejectVisible = false"
        />

        <Button
          :label="rejectButtonLabel"
          :icon="rejectButtonIcon"
          severity="danger"
          :loading="saving"
          @click="rejectBooking"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";

import { useConfirm } from "primevue/useconfirm";

import { useToast } from "primevue/usetoast";

import Button from "primevue/button";
import Card from "primevue/card";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import Dialog from "primevue/dialog";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import MultiSelect from "primevue/multiselect";
import Select from "primevue/select";
import Tag from "primevue/tag";
import Textarea from "primevue/textarea";
import Toolbar from "primevue/toolbar";

import api from "../../services/api.js";

import { connectSocket } from "../../services/socket.js";

import {
  apiMessage,
  bookingStatusSeverity,
  formatDateTime,
} from "../../utils/admin.js";

import {
  bookingChannel,
  bookingCustomerEmail,
  bookingCustomerName,
  bookingCustomerPhone,
  bookingServiceNames,
  buildBookingRejectEmailUrl,
  buildBookingRejectMessage,
  buildBookingRejectWhatsAppUrl,
} from "../../utils/adminBookingContact.js";

/*
|--------------------------------------------------------------------------
| STATE
|--------------------------------------------------------------------------
*/

const items = ref([]);

const users = ref([]);

const services = ref([]);

const loading = ref(false);

const saving = ref(false);

const editVisible = ref(false);

const rejectVisible = ref(false);

const viewOnly = ref(false);

const editingId = ref(null);

const dialogError = ref("");

const rejectingId = ref(null);

const rejectingBooking = ref(null);

const rejectReason = ref("");

const rejectError = ref("");

/*
|--------------------------------------------------------------------------
| FILTER
|--------------------------------------------------------------------------
*/

const filters = reactive({
  q: "",

  customer_id: null,

  status: null,

  paid_type: null,
});

/*
|--------------------------------------------------------------------------
| FORM
|--------------------------------------------------------------------------
*/

const form = reactive({
  customer_id: "",

  products_id: [],

  booking_date: "",

  booking_time: "",

  people: 1,

  note: "",

  contact_message: "",

  booking_channel: "",

  reject_reason: "",

  status: "PENDING",

  paid_type: "CASH",

  payment_method: "PAY_AT_CHECK_IN",
});

/*
|--------------------------------------------------------------------------
| OPTIONS
|--------------------------------------------------------------------------
*/

const statusOptions = ["PENDING", "ACCEPT", "REJECT"];

const paidTypeOptions = ["CASH", "BANK"];

const paymentMethodOptions = ["PAY_AT_CHECK_IN", "BANK_TRANSFER"];

/*
|--------------------------------------------------------------------------
| PRIME
|--------------------------------------------------------------------------
*/

const toast = useToast();

const confirm = useConfirm();

let socket;

/*
|--------------------------------------------------------------------------
| CUSTOMER DISPLAY
|--------------------------------------------------------------------------
*/

function userDisplayName(user) {
  if (!user) {
    return "-";
  }

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

  return fullName || user.username || user.email || "Customer";
}

function customerDisplayName(booking) {
  return bookingCustomerName(booking);
}

function customerEmail(booking) {
  return bookingCustomerEmail(booking) || "-";
}

/*
|--------------------------------------------------------------------------
| CUSTOMER OPTIONS
|--------------------------------------------------------------------------
*/

const customerOptions = computed(() => {
  return users.value
    .filter(
      (user) =>
        user.status === "ACTIVE" && (!user.role || user.role === "CUSTOMER"),
    )
    .map((user) => ({
      label: `${userDisplayName(user)} — ${user.email || "No email"}`,

      value: user._id,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
});

/*
|--------------------------------------------------------------------------
| CUSTOMER FILTER
|--------------------------------------------------------------------------
*/

const customerFilterOptions = computed(() => {
  return users.value
    .filter((user) => !user.role || user.role === "CUSTOMER")
    .map((user) => ({
      label: `${userDisplayName(user)} — ${user.email || "No email"}`,

      value: user._id,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
});

/*
|--------------------------------------------------------------------------
| SERVICES
|--------------------------------------------------------------------------
*/

const serviceOptions = computed(() => {
  return services.value
    .filter((service) => service.status === "ACTIVE")
    .map((service) => ({
      label: `${service.name} ($${Number(service.price || 0).toFixed(2)})`,

      value: service._id,
    }));
});

function serviceNames(booking) {
  return bookingServiceNames(booking);
}

/*
|--------------------------------------------------------------------------
| FILTER BOOKINGS
|--------------------------------------------------------------------------
*/

const filteredItems = computed(() => {
  const q = filters.q.trim().toLowerCase();

  return items.value.filter((booking) => {
    const customer =
      typeof booking.customer_id === "object" ? booking.customer_id : null;

    const customerId = customer?._id || booking.customer_id;

    const name = bookingCustomerName(booking);

    const email = bookingCustomerEmail(booking);

    const phone = bookingCustomerPhone(booking);

    const servicesText = bookingServiceNames(booking);

    const haystack = [booking._id, name, email, phone, servicesText]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = !q || haystack.includes(q);

    const matchesCustomer =
      !filters.customer_id ||
      String(customerId || "") === String(filters.customer_id);

    const matchesStatus = !filters.status || booking.status === filters.status;

    const matchesPayment =
      !filters.paid_type || booking.paid_type === filters.paid_type;

    return matchesSearch && matchesCustomer && matchesStatus && matchesPayment;
  });
});

/*
|--------------------------------------------------------------------------
| CHANNEL
|--------------------------------------------------------------------------
*/

function channelLabel(booking) {
  const channel = bookingChannel(booking);

  if (channel === "WHATSAPP") {
    return "WhatsApp";
  }

  if (channel === "EMAIL") {
    return "Email";
  }

  return "Unknown";
}

function channelSeverity(booking) {
  const channel = bookingChannel(booking);

  if (channel === "WHATSAPP") {
    return "success";
  }

  if (channel === "EMAIL") {
    return "info";
  }

  return "secondary";
}

/*
|--------------------------------------------------------------------------
| REJECTION MESSAGE
|--------------------------------------------------------------------------
*/

const rejectionMessagePreview = computed(() => {
  if (!rejectingBooking.value) {
    return "";
  }

  return buildBookingRejectMessage(rejectingBooking.value, rejectReason.value);
});

/*
|--------------------------------------------------------------------------
| CONTACT AVAILABLE
|--------------------------------------------------------------------------
*/

const rejectionContactAvailable = computed(() => {
  if (!rejectingBooking.value) {
    return false;
  }

  const channel = bookingChannel(rejectingBooking.value);

  if (channel === "WHATSAPP") {
    return Boolean(bookingCustomerPhone(rejectingBooking.value));
  }

  if (channel === "EMAIL") {
    return Boolean(bookingCustomerEmail(rejectingBooking.value));
  }

  return false;
});

/*
|--------------------------------------------------------------------------
| CHANNEL DESCRIPTION
|--------------------------------------------------------------------------
*/

const rejectionChannelDescription = computed(() => {
  const channel = bookingChannel(rejectingBooking.value);

  if (channel === "WHATSAPP") {
    return "WhatsApp";
  }

  if (channel === "EMAIL") {
    return "email";
  }

  return "customer notification";
});

/*
|--------------------------------------------------------------------------
| REJECT BUTTON
|--------------------------------------------------------------------------
*/

const rejectButtonLabel = computed(() => {
  const channel = bookingChannel(rejectingBooking.value);

  if (channel === "WHATSAPP" && rejectionContactAvailable.value) {
    return "Reject & Open WhatsApp";
  }

  if (channel === "EMAIL" && rejectionContactAvailable.value) {
    return "Reject & Open Email";
  }

  return "Reject Booking";
});

const rejectButtonIcon = computed(() => {
  const channel = bookingChannel(rejectingBooking.value);

  if (channel === "WHATSAPP" && rejectionContactAvailable.value) {
    return "pi pi-whatsapp";
  }

  if (channel === "EMAIL" && rejectionContactAvailable.value) {
    return "pi pi-envelope";
  }

  return "pi pi-times";
});

/*
|--------------------------------------------------------------------------
| SHORT ID
|--------------------------------------------------------------------------
*/

function shortId(id) {
  return id ? `${id.slice(0, 8)}…` : "-";
}

/*
|--------------------------------------------------------------------------
| PAYMENT
|--------------------------------------------------------------------------
*/

function paymentLabel(method) {
  if (method === "PAY_AT_CHECK_IN") {
    return "Pay at check-in";
  }

  if (method === "BANK_TRANSFER") {
    return "Bank transfer";
  }

  return method || "-";
}

function paidTypeLabel(type) {
  if (type === "CASH") {
    return "Cash";
  }

  if (type === "BANK") {
    return "Bank";
  }

  return type || "-";
}

/*
|--------------------------------------------------------------------------
| DATE
|--------------------------------------------------------------------------
*/

function formatBookingDate(value) {
  if (!value) {
    return "-";
  }

  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);

  if (!year || !month || !day) {
    return value;
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",

    month: "short",

    year: "numeric",

    timeZone: "UTC",
  }).format(date);
}

/*
|--------------------------------------------------------------------------
| PAYMENT SYNC
|--------------------------------------------------------------------------
*/

function syncPaymentMethod() {
  form.payment_method =
    form.paid_type === "CASH" ? "PAY_AT_CHECK_IN" : "BANK_TRANSFER";
}

/*
|--------------------------------------------------------------------------
| LOAD
|--------------------------------------------------------------------------
*/

async function load() {
  loading.value = true;

  try {
    const [bookingResponse, userResponse, serviceResponse] = await Promise.all([
      api.get("/bookings"),

      api.get("/users"),

      api.get("/services", {
        params: {
          all: true,
        },
      }),
    ]);

    items.value = bookingResponse.data?.bookings || [];

    users.value = userResponse.data?.users || [];

    services.value = serviceResponse.data?.services || [];
  } catch (error) {
    toast.add({
      severity: "error",

      summary: "Load failed",

      detail: apiMessage(error),

      life: 3500,
    });
  } finally {
    loading.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| SET FORM
|--------------------------------------------------------------------------
*/

function setForm(booking = null) {
  const description =
    booking?.description && typeof booking.description === "object"
      ? booking.description
      : {};

  Object.assign(form, {
    customer_id:
      booking?.customer_id?._id ||
      booking?.customer_id ||
      customerOptions.value[0]?.value ||
      "",

    products_id: (booking?.products_id || [])
      .map((service) => (typeof service === "object" ? service._id : service))
      .filter(Boolean),

    booking_date: description.booking_date || "",

    booking_time: description.booking_time || "",

    people: Number(description.people || 1),

    note: description.note || "",

    contact_message: description.contact_message || "",

    booking_channel: description.booking_channel || "",

    reject_reason: description.reject_reason || "",

    status: booking?.status || "PENDING",

    paid_type: booking?.paid_type || "CASH",

    payment_method: booking?.payment_method || "PAY_AT_CHECK_IN",
  });

  dialogError.value = "";
}

/*
|--------------------------------------------------------------------------
| OPEN
|--------------------------------------------------------------------------
*/

function openCreate() {
  editingId.value = null;

  viewOnly.value = false;

  setForm();

  editVisible.value = true;
}

function openEdit(booking) {
  editingId.value = booking._id;

  viewOnly.value = false;

  setForm(booking);

  editVisible.value = true;
}

function openView(booking) {
  editingId.value = booking._id;

  viewOnly.value = true;

  setForm(booking);

  editVisible.value = true;
}

/*
|--------------------------------------------------------------------------
| SAVE
|--------------------------------------------------------------------------
*/

async function save() {
  if (!form.customer_id || !form.products_id.length) {
    dialogError.value = "Customer and at least one service are required.";

    return;
  }

  saving.value = true;

  dialogError.value = "";

  try {
    const payload = {
      customer_id: form.customer_id,

      products_id: form.products_id,

      paid_type: form.paid_type,

      payment_method: form.payment_method,

      status: form.status,

      description: {
        booking_date: form.booking_date,

        booking_time: form.booking_time,

        people: form.people,

        note: form.note.trim(),

        contact_message: form.contact_message.trim(),

        booking_channel: form.booking_channel,

        ...(form.reject_reason
          ? {
              reject_reason: form.reject_reason,
            }
          : {}),
      },
    };

    if (editingId.value) {
      await api.patch(`/bookings/${editingId.value}`, payload);
    } else {
      await api.post("/bookings", payload);
    }

    editVisible.value = false;

    toast.add({
      severity: "success",

      summary: "Saved",

      detail: "Booking saved successfully",

      life: 2200,
    });

    await load();
  } catch (error) {
    dialogError.value = apiMessage(error);
  } finally {
    saving.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| ACCEPT
|--------------------------------------------------------------------------
*/

async function accept(booking) {
  try {
    await api.patch(`/bookings/${booking._id}/accept`);

    toast.add({
      severity: "success",

      summary: "Booking accepted",

      life: 2000,
    });

    await load();
  } catch (error) {
    toast.add({
      severity: "error",

      summary: "Unable to accept",

      detail: apiMessage(error),

      life: 3500,
    });
  }
}

/*
|--------------------------------------------------------------------------
| OPEN REJECT
|--------------------------------------------------------------------------
*/

function openReject(booking) {
  rejectingId.value = booking._id;

  rejectingBooking.value = booking;

  rejectReason.value = "";

  rejectError.value = "";

  rejectVisible.value = true;
}

/*
|--------------------------------------------------------------------------
| REJECT
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| Customer contact is NOT required
| to reject the booking.
|
*/

async function rejectBooking() {
  if (!rejectingId.value || !rejectingBooking.value) {
    return;
  }

  const booking = rejectingBooking.value;

  const reason = rejectReason.value.trim();

  const channel = bookingChannel(booking);

  rejectError.value = "";

  /*
  |--------------------------------------------------------------------------
  | BUILD CONTACT URL
  |--------------------------------------------------------------------------
  |
  | This may remain empty.
  | Rejection still continues.
  |
  */

  let contactUrl = "";

  if (channel === "WHATSAPP") {
    contactUrl = buildBookingRejectWhatsAppUrl(booking, reason);
  }

  if (channel === "EMAIL") {
    contactUrl = buildBookingRejectEmailUrl(booking, reason);
  }

  /*
  |--------------------------------------------------------------------------
  | OPEN PLACEHOLDER
  |--------------------------------------------------------------------------
  |
  | Only do this when contact information exists.
  |
  */

  let contactWindow = null;

  if (contactUrl) {
    contactWindow = window.open("about:blank", "_blank");

    if (contactWindow) {
      contactWindow.document.write(`
        <!DOCTYPE html>

        <html lang="en">
          <head>
            <meta charset="UTF-8">

            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            >

            <title>
              Preparing notification...
            </title>
          </head>

          <body
            style="
              margin:0;
              min-height:100vh;
              display:flex;
              align-items:center;
              justify-content:center;
              background:#F8FAFC;
              color:#334155;
              font-family:Arial,sans-serif;
            "
          >
            <div
              style="
                padding:32px;
                text-align:center;
              "
            >
              <div
                style="
                  font-size:18px;
                  font-weight:600;
                "
              >
                Preparing customer notification...
              </div>

              <div
                style="
                  margin-top:8px;
                  color:#64748B;
                  font-size:14px;
                "
              >
                Please wait a moment.
              </div>
            </div>
          </body>
        </html>
      `);

      contactWindow.document.close();
    }
  }

  saving.value = true;

  try {
    /*
    |--------------------------------------------------------------------------
    | STEP 1
    | REJECT BOOKING FIRST
    |--------------------------------------------------------------------------
    */

    const response = await api.patch(`/bookings/${rejectingId.value}/reject`, {
      reason,
    });

    /*
    |--------------------------------------------------------------------------
    | STEP 2
    | OPEN CONTACT WHEN AVAILABLE
    |--------------------------------------------------------------------------
    */

    if (contactUrl && contactWindow && !contactWindow.closed) {
      contactWindow.location.replace(contactUrl);
    } else if (contactUrl) {
      /*
       * Popup fallback.
       */

      window.open(contactUrl, "_blank");
    }

    /*
    |--------------------------------------------------------------------------
    | CLOSE DIALOG
    |--------------------------------------------------------------------------
    */

    rejectVisible.value = false;

    rejectingId.value = null;

    rejectingBooking.value = null;

    /*
    |--------------------------------------------------------------------------
    | MESSAGE
    |--------------------------------------------------------------------------
    */

    if (channel === "WHATSAPP" && contactUrl) {
      toast.add({
        severity: "success",

        summary: "Booking Rejected",

        detail:
          "The booking was rejected and WhatsApp opened with the customer message.",

        life: 4000,
      });
    } else if (channel === "EMAIL" && contactUrl) {
      toast.add({
        severity: "success",

        summary: "Booking Rejected",

        detail: "The booking was rejected and the email message was opened.",

        life: 4000,
      });
    } else {
      /*
       * Critical change:
       *
       * Still successful rejection
       * even without contact.
       */

      toast.add({
        severity: "warn",

        summary: "Booking Rejected",

        detail:
          channel === "WHATSAPP"
            ? "The booking was rejected, but the customer has no WhatsApp phone number."
            : channel === "EMAIL"
              ? "The booking was rejected, but the customer has no email address."
              : "The booking was rejected, but no contact channel is available.",

        life: 5000,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | OPTIONAL DIRECT UPDATE
    |--------------------------------------------------------------------------
    */

    const updated = response.data?.booking;

    if (updated) {
      const index = items.value.findIndex((item) => item._id === updated._id);

      if (index !== -1) {
        items.value[index] = updated;
      }
    }

    await load();
  } catch (error) {
    /*
     * Only close placeholder if
     * rejection itself failed.
     */

    if (contactWindow && !contactWindow.closed) {
      contactWindow.close();
    }

    rejectError.value =
      error.response?.data?.message ||
      error.message ||
      "Unable to reject booking.";
  } finally {
    saving.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

function confirmDelete(booking) {
  confirm.require({
    message: `Permanently delete booking ${shortId(booking._id)}?`,

    header: "Delete booking",

    icon: "pi pi-exclamation-triangle",

    rejectProps: {
      label: "Cancel",

      severity: "secondary",

      outlined: true,
    },

    acceptProps: {
      label: "Delete",

      severity: "danger",

      icon: "pi pi-trash",
    },

    accept: async () => {
      try {
        await api.delete(`/bookings/${booking._id}`);

        toast.add({
          severity: "success",

          summary: "Deleted",

          life: 2000,
        });

        await load();
      } catch (error) {
        toast.add({
          severity: "error",

          summary: "Unable to delete",

          detail: apiMessage(error),

          life: 3500,
        });
      }
    },
  });
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
