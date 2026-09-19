<template>
  <div>
    <Toolbar class="!border-0 !bg-transparent !p-0">
      <template #start
        ><div>
          <h1 class="text-3xl font-bold">Users</h1>
        </div></template
      >
      <template #end
        ><Button label="Add User" icon="pi pi-user-plus" @click="openCreate"
      /></template>
    </Toolbar>

    <Card class="mt-6 !rounded-2xl">
      <template #content>
        <div class="mb-4 grid gap-3 md:grid-cols-[1fr_180px_180px_auto]">
          <IconField
            ><InputIcon class="pi pi-search" /><InputText
              v-model="filters.q"
              class="w-full"
              placeholder="Search username or email"
          /></IconField>
          <Select
            v-model="filters.role"
            :options="roleFilterOptions"
            option-label="label"
            option-value="value"
            placeholder="All roles"
            show-clear
            class="w-full"
          />
          <Select
            v-model="filters.status"
            :options="statusFilterOptions"
            option-label="label"
            option-value="value"
            placeholder="All statuses"
            show-clear
            class="w-full"
          />
          <Button
            icon="pi pi-refresh"
            severity="secondary"
            outlined
            :loading="loading"
            @click="load"
          />
        </div>

        <DataTable
          :value="filteredItems"
          paginator
          :rows="10"
          :rows-per-page-options="[10, 20, 50]"
          striped-rows
          responsive-layout="scroll"
          :loading="loading"
        >
          <Column field="username" header="Username" sortable />
          <Column field="email" header="Email" sortable />
          <Column header="Role"
            ><template #body="{ data }"
              ><Tag :value="data.role" severity="info" /></template
          ></Column>
          <Column header="Status"
            ><template #body="{ data }"
              ><Tag
                :value="data.status"
                :severity="activeStatusSeverity(data.status)" /></template
          ></Column>
          <Column header="Last Login"
            ><template #body="{ data }">{{
              formatDateTime(data.login_at)
            }}</template></Column
          >
          <Column header="Actions" frozen align-frozen="right">
            <template #body="{ data }">
              <div class="flex gap-1">
                <Button
                  icon="pi pi-pencil"
                  text
                  rounded
                  aria-label="Edit user"
                  @click="openEdit(data)"
                />
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
          <template #empty
            ><div class="py-8 text-center text-slate-500">
              <i class="pi pi-users mb-2 block text-2xl" />No users found.
            </div></template
          >
        </DataTable>
      </template>
    </Card>

    <Dialog
      v-model:visible="dialogVisible"
      modal
      :header="editingId ? 'Edit User' : 'Add User'"
      :style="{ width: '34rem' }"
      :breakpoints="{ '640px': '96vw' }"
    >
      <div class="grid gap-4">
        <div>
          <label class="label">Username</label
          ><InputText v-model="form.username" class="w-full" />
        </div>
        <div>
          <label class="label">Email</label
          ><InputText v-model="form.email" type="email" class="w-full" />
        </div>
        <div>
          <label class="label"
            >Password
            {{ editingId ? "(leave blank to keep current)" : "" }}</label
          ><Password
            v-model="form.password"
            class="w-full"
            input-class="w-full"
            toggle-mask
            :feedback="false"
          />
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="label">Role</label
            ><Select
              v-model="form.role"
              :options="roleOptions"
              class="w-full"
            />
          </div>
          <div>
            <label class="label">Status</label
            ><Select
              v-model="form.status"
              :options="statusOptions"
              class="w-full"
            />
          </div>
        </div>
        <Message v-if="dialogError" severity="error">{{ dialogError }}</Message>
      </div>
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
import {
  activeStatusSeverity,
  apiMessage,
  formatDateTime,
} from "../../utils/admin.js";

const items = ref([]);
const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const dialogError = ref("");
const editingId = ref(null);
const toast = useToast();
const confirm = useConfirm();
const filters = reactive({ q: "", role: null, status: null });
const form = reactive({
  username: "",
  email: "",
  password: "",
  role: "STAFF",
  status: "ACTIVE",
});
const roleOptions = ["SUPER_ADMIN", "ADMIN", "STAFF", "CUSTOMER"];
const statusOptions = ["ACTIVE", "INACTIVE", "BLOCKED"];
const roleFilterOptions = roleOptions.map((value) => ({ label: value, value }));
const statusFilterOptions = statusOptions.map((value) => ({
  label: value,
  value,
}));

const filteredItems = computed(() => {
  const q = filters.q.trim().toLowerCase();
  return items.value.filter(
    (x) =>
      (!q ||
        x.username?.toLowerCase().includes(q) ||
        x.email?.toLowerCase().includes(q)) &&
      (!filters.role || x.role === filters.role) &&
      (!filters.status || x.status === filters.status),
  );
});

async function load() {
  loading.value = true;
  try {
    items.value = (await api.get("/users")).data.users;
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

function resetForm() {
  Object.assign(form, {
    username: "",
    email: "",
    password: "",
    role: "STAFF",
    status: "ACTIVE",
  });
  dialogError.value = "";
}
function openCreate() {
  editingId.value = null;
  resetForm();
  dialogVisible.value = true;
}
function openEdit(row) {
  editingId.value = row._id;
  Object.assign(form, {
    username: row.username,
    email: row.email,
    password: "",
    role: row.role,
    status: row.status,
  });
  dialogError.value = "";
  dialogVisible.value = true;
}

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
      role: form.role,
      status: form.status,
    };
    if (form.password) payload.password = form.password;
    if (editingId.value) await api.patch(`/users/${editingId.value}`, payload);
    else await api.post("/users", payload);
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

function confirmDelete(row) {
  confirm.require({
    message: `Deactivate ${row.username}?`,
    header: "Confirm deactivation",
    icon: "pi pi-exclamation-triangle",
    rejectProps: { label: "Cancel", severity: "secondary", outlined: true },
    acceptProps: { label: "Deactivate", severity: "danger", icon: "pi pi-ban" },
    accept: async () => {
      try {
        await api.delete(`/users/${row._id}`);
        toast.add({ severity: "success", summary: "Deactivated", life: 2000 });
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

onMounted(load);
</script>
