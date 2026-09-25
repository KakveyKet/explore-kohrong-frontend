<template>
  <div>
    <!-- ====================================================== -->
    <!-- HEADER -->
    <!-- ====================================================== -->

    <Toolbar class="!border-0 !bg-transparent !p-0">
      <template #start>
        <div>
          <h1 class="text-3xl font-bold">Users</h1>
        </div>
      </template>

      <template #end>
        <Button label="Add User" icon="pi pi-user-plus" @click="openCreate" />
      </template>
    </Toolbar>

    <!-- ====================================================== -->
    <!-- USERS -->
    <!-- ====================================================== -->

    <Card class="mt-6 !rounded-2xl">
      <template #content>
        <!-- ================================================== -->
        <!-- FILTERS -->
        <!-- ================================================== -->

        <div
          class="mb-4 grid gap-3"
          :class="
            isSuperAdmin
              ? 'md:grid-cols-[1fr_180px_180px_auto]'
              : 'md:grid-cols-[1fr_180px_auto]'
          "
        >
          <!-- SEARCH -->

          <IconField>
            <InputIcon class="pi pi-search" />

            <InputText
              v-model="filters.q"
              class="w-full"
              placeholder="Search username or email"
            />
          </IconField>

          <!-- ROLE FILTER -->
          <!-- SUPER ADMIN ONLY -->

          <Select
            v-if="isSuperAdmin"
            v-model="filters.role"
            :options="roleFilterOptions"
            option-label="label"
            option-value="value"
            placeholder="All roles"
            show-clear
            class="w-full"
          />

          <!-- STATUS -->

          <Select
            v-model="filters.status"
            :options="statusFilterOptions"
            option-label="label"
            option-value="value"
            placeholder="All statuses"
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
        <!-- TABLE -->
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
          <!-- USERNAME -->

          <Column field="username" header="Username" sortable />

          <!-- EMAIL -->

          <Column field="email" header="Email" sortable />

          <!-- ROLE -->

          <Column header="Role">
            <template #body="{ data }">
              <Tag :value="data.role" severity="info" />
            </template>
          </Column>

          <!-- STATUS -->

          <Column header="Status">
            <template #body="{ data }">
              <Tag
                :value="data.status"
                :severity="activeStatusSeverity(data.status)"
              />
            </template>
          </Column>

          <!-- LAST LOGIN -->

          <Column header="Last Login">
            <template #body="{ data }">
              {{ formatDateTime(data.login_at) }}
            </template>
          </Column>

          <!-- ACTIONS -->

          <Column header="Actions" frozen align-frozen="right">
            <template #body="{ data }">
              <div class="flex gap-1">
                <!-- EDIT -->

                <Button
                  icon="pi pi-pencil"
                  text
                  rounded
                  aria-label="Edit user"
                  @click="openEdit(data)"
                />

                <!-- DEACTIVATE -->

                <Button
                  icon="pi pi-ban"
                  text
                  rounded
                  severity="danger"
                  aria-label="Deactivate user"
                  :disabled="data.status === 'INACTIVE'"
                  @click="confirmDelete(data)"
                />
              </div>
            </template>
          </Column>

          <!-- EMPTY -->

          <template #empty>
            <div class="py-8 text-center text-slate-500">
              <i class="pi pi-users mb-2 block text-2xl" />

              No users found.
            </div>
          </template>
        </DataTable>
      </template>
    </Card>

    <!-- ====================================================== -->
    <!-- USER DIALOG -->
    <!-- ====================================================== -->

    <Dialog
      v-model:visible="dialogVisible"
      modal
      :header="editingId ? 'Edit User' : 'Add User'"
      :style="{ width: '34rem' }"
      :breakpoints="{ '640px': '96vw' }"
    >
      <div class="grid gap-4">
        <!-- USERNAME -->

        <div>
          <label class="label"> Username </label>

          <InputText v-model="form.username" class="w-full" />
        </div>

        <!-- EMAIL -->

        <div>
          <label class="label"> Email </label>

          <InputText v-model="form.email" type="email" class="w-full" />
        </div>

        <!-- PASSWORD -->

        <div>
          <label class="label">
            Password
            {{ editingId ? "(leave blank to keep current)" : "" }}
          </label>

          <Password
            v-model="form.password"
            class="w-full"
            input-class="w-full"
            toggle-mask
            :feedback="false"
          />
        </div>

        <!-- ROLE / STATUS -->

        <div class="grid gap-4 sm:grid-cols-2">
          <!-- ROLE -->

          <div>
            <label class="label"> Role </label>

            <Select
              v-model="form.role"
              :options="roleOptions"
              class="w-full"
              :disabled="!isSuperAdmin"
            />
          </div>

          <!-- STATUS -->

          <div>
            <label class="label"> Status </label>

            <Select
              v-model="form.status"
              :options="statusOptions"
              class="w-full"
            />
          </div>
        </div>

        <!-- ERROR -->

        <Message v-if="dialogError" severity="error">
          {{ dialogError }}
        </Message>
      </div>

      <!-- FOOTER -->

      <template #footer>
        <Button
          label="Cancel"
          icon="pi pi-times"
          severity="secondary"
          outlined
          @click="dialogVisible = false"
        />

        <Button
          label="Save"
          icon="pi pi-save"
          :loading="saving"
          @click="save"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";

import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

import Button from "primevue/button";
import Card from "primevue/card";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import Dialog from "primevue/dialog";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Password from "primevue/password";
import Select from "primevue/select";
import Tag from "primevue/tag";
import Toolbar from "primevue/toolbar";

import api from "../../services/api.js";

import { useAuthStore } from "../../stores/auth.js";

import {
  activeStatusSeverity,
  apiMessage,
  formatDateTime,
} from "../../utils/admin.js";

/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/

const auth = useAuthStore();

/*
|--------------------------------------------------------------------------
| ROLE PERMISSION
|--------------------------------------------------------------------------
*/

const isSuperAdmin = computed(() => {
  return auth.user?.role === "SUPER_ADMIN";
});

const isAdmin = computed(() => {
  return auth.user?.role === "ADMIN";
});

/*
|--------------------------------------------------------------------------
| STATE
|--------------------------------------------------------------------------
*/

const items = ref([]);

const loading = ref(false);

const saving = ref(false);

const dialogVisible = ref(false);

const dialogError = ref("");

const editingId = ref(null);

const toast = useToast();

const confirm = useConfirm();

/*
|--------------------------------------------------------------------------
| FILTERS
|--------------------------------------------------------------------------
*/

const filters = reactive({
  q: "",
  role: null,
  status: null,
});

/*
|--------------------------------------------------------------------------
| FORM
|--------------------------------------------------------------------------
*/

const form = reactive({
  username: "",
  email: "",
  password: "",
  role: "CUSTOMER",
  status: "ACTIVE",
});

/*
|--------------------------------------------------------------------------
| OPTIONS
|--------------------------------------------------------------------------
*/

const allRoleOptions = ["SUPER_ADMIN", "ADMIN", "STAFF", "CUSTOMER"];

/*
 * SUPER_ADMIN:
 * all roles
 *
 * ADMIN:
 * CUSTOMER only
 */
const roleOptions = computed(() => {
  if (isSuperAdmin.value) {
    return allRoleOptions;
  }

  return ["CUSTOMER"];
});

const statusOptions = ["ACTIVE", "INACTIVE", "BLOCKED"];

/*
|--------------------------------------------------------------------------
| ROLE FILTER OPTIONS
|--------------------------------------------------------------------------
*/

const roleFilterOptions = computed(() => {
  return roleOptions.value.map((value) => ({
    label: value,
    value,
  }));
});

/*
|--------------------------------------------------------------------------
| STATUS FILTER OPTIONS
|--------------------------------------------------------------------------
*/

const statusFilterOptions = statusOptions.map((value) => ({
  label: value,
  value,
}));

/*
|--------------------------------------------------------------------------
| FILTERED USERS
|--------------------------------------------------------------------------
|
| SUPER_ADMIN:
| sees all users
|
| ADMIN:
| sees CUSTOMER only
|
*/

const filteredItems = computed(() => {
  const q = filters.q.trim().toLowerCase();

  return items.value.filter((user) => {
    /*
     * Role permission.
     */

    if (!isSuperAdmin.value && user.role !== "CUSTOMER") {
      return false;
    }

    /*
     * Search.
     */

    const matchesSearch =
      !q ||
      user.username?.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q);

    /*
     * Role filter.
     */

    const matchesRole = !filters.role || user.role === filters.role;

    /*
     * Status filter.
     */

    const matchesStatus = !filters.status || user.status === filters.status;

    return matchesSearch && matchesRole && matchesStatus;
  });
});

/*
|--------------------------------------------------------------------------
| LOAD USERS
|--------------------------------------------------------------------------
*/

async function load() {
  loading.value = true;

  try {
    const response = await api.get("/users");

    items.value = response.data?.users || [];
  } catch (e) {
    toast.add({
      severity: "error",
      summary: "Load failed",
      detail: apiMessage(e),
      life: 3500,
    });
  } finally {
    loading.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| RESET FORM
|--------------------------------------------------------------------------
*/

function resetForm() {
  Object.assign(form, {
    username: "",
    email: "",
    password: "",

    /*
     * SUPER ADMIN default:
     * STAFF
     *
     * ADMIN:
     * CUSTOMER
     */
    role: isSuperAdmin.value ? "STAFF" : "CUSTOMER",

    status: "ACTIVE",
  });

  dialogError.value = "";
}

/*
|--------------------------------------------------------------------------
| CREATE
|--------------------------------------------------------------------------
*/

function openCreate() {
  editingId.value = null;

  resetForm();

  dialogVisible.value = true;
}

/*
|--------------------------------------------------------------------------
| EDIT
|--------------------------------------------------------------------------
*/

function openEdit(row) {
  /*
   * Extra frontend protection.
   *
   * ADMIN cannot edit users other than CUSTOMER.
   */
  if (!isSuperAdmin.value && row.role !== "CUSTOMER") {
    return;
  }

  editingId.value = row._id;

  Object.assign(form, {
    username: row.username,

    email: row.email,

    password: "",

    /*
     * ADMIN must remain CUSTOMER.
     */
    role: isSuperAdmin.value ? row.role : "CUSTOMER",

    status: row.status,
  });

  dialogError.value = "";

  dialogVisible.value = true;
}

/*
|--------------------------------------------------------------------------
| SAVE
|--------------------------------------------------------------------------
*/

async function save() {
  if (!form.username || !form.email || (!editingId.value && !form.password)) {
    dialogError.value = "Username, email and password are required.";

    return;
  }

  saving.value = true;

  dialogError.value = "";

  try {
    const payload = {
      username: form.username.trim(),

      email: form.email.trim(),

      /*
       * Important:
       *
       * SUPER_ADMIN can choose role.
       * ADMIN can only create/update CUSTOMER.
       */
      role: isSuperAdmin.value ? form.role : "CUSTOMER",

      status: form.status,
    };

    if (form.password) {
      payload.password = form.password;
    }

    /*
     * UPDATE
     */

    if (editingId.value) {
      await api.patch(`/users/${editingId.value}`, payload);
    } else {

    /*
     * CREATE
     */
      await api.post("/users", payload);
    }

    dialogVisible.value = false;

    toast.add({
      severity: "success",
      summary: "Saved",
      detail: "User saved successfully",
      life: 2200,
    });

    await load();
  } catch (e) {
    dialogError.value = apiMessage(e);
  } finally {
    saving.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| DEACTIVATE
|--------------------------------------------------------------------------
*/

function confirmDelete(row) {
  /*
   * ADMIN can only manage CUSTOMER.
   */

  if (!isSuperAdmin.value && row.role !== "CUSTOMER") {
    return;
  }

  confirm.require({
    message: `Deactivate ${row.username}?`,

    header: "Confirm deactivation",

    icon: "pi pi-exclamation-triangle",

    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true,
    },

    acceptProps: {
      label: "Deactivate",
      severity: "danger",
      icon: "pi pi-ban",
    },

    accept: async () => {
      try {
        await api.delete(`/users/${row._id}`);

        toast.add({
          severity: "success",
          summary: "Deactivated",
          life: 2000,
        });

        await load();
      } catch (e) {
        toast.add({
          severity: "error",
          summary: "Unable to deactivate",
          detail: apiMessage(e),
          life: 3500,
        });
      }
    },
  });
}

/*
|--------------------------------------------------------------------------
| INIT
|--------------------------------------------------------------------------
*/

onMounted(load);
</script>
