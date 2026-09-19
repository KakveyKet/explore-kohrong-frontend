<template>
  <div>
    <Toolbar class="!border-0 !bg-transparent !p-0">
      <template #start
        ><div>
          <h1 class="text-3xl font-bold">Categories</h1>
        </div></template
      >
      <template #end
        ><Button label="Add Category" icon="pi pi-plus" @click="openCreate"
      /></template>
    </Toolbar>

    <Card class="mt-6 !rounded-2xl">
      <template #content>
        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <IconField class="flex-1"
            ><InputIcon class="pi pi-search" /><InputText
              v-model="q"
              class="w-full"
              placeholder="Search category"
          /></IconField>
          <Select
            v-model="statusFilter"
            :options="statusOptions"
            placeholder="All statuses"
            show-clear
            class="w-full sm:w-52"
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
          striped-rows
          responsive-layout="scroll"
          :loading="loading"
        >
          <Column field="name" header="Name" sortable />
          <Column field="slug" header="Slug" sortable />
          <Column header="Status"
            ><template #body="{ data }"
              ><Tag
                :value="data.status"
                :severity="activeStatusSeverity(data.status)" /></template
          ></Column>
          <Column header="Created"
            ><template #body="{ data }">{{
              formatDateTime(data.created_at)
            }}</template></Column
          >
          <Column header="Actions">
            <template #body="{ data }"
              ><div class="flex gap-1">
                <Button
                  icon="pi pi-pencil"
                  text
                  rounded
                  @click="openEdit(data)"
                /><Button
                  icon="pi pi-trash"
                  text
                  rounded
                  severity="danger"
                  :disabled="data.status === 'INACTIVE'"
                  @click="confirmDelete(data)"
                /></div
            ></template>
          </Column>
          <template #empty
            ><div class="py-8 text-center text-slate-500">
              <i class="pi pi-tags mb-2 block text-2xl" />No categories found.
            </div></template
          >
        </DataTable>
      </template>
    </Card>

    <Dialog
      v-model:visible="visible"
      modal
      :header="editingId ? 'Edit Category' : 'Add Category'"
      :style="{ width: '30rem' }"
      :breakpoints="{ '640px': '96vw' }"
    >
      <div class="grid gap-4">
        <div>
          <label class="label">Name</label
          ><InputText v-model="form.name" class="w-full" />
        </div>
        <div>
          <label class="label">Slug</label
          ><InputText
            v-model="form.slug"
            class="w-full"
            placeholder="Auto-generated when blank"
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
        <Message v-if="dialogError" severity="error">{{ dialogError }}</Message>
      </div>
      <template #footer
        ><Button
          label="Cancel"
          icon="pi pi-times"
          severity="secondary"
          outlined
          @click="visible = false" /><Button
          label="Save"
          icon="pi pi-save"
          :loading="saving"
          @click="save"
      /></template>
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
import Select from "primevue/select";
import Tag from "primevue/tag";
import Toolbar from "primevue/toolbar";
import api from "../../services/api.js";
import {
  activeStatusSeverity,
  apiMessage,
  formatDateTime,
} from "../../utils/admin.js";

const items = ref([]),
  loading = ref(false),
  saving = ref(false),
  visible = ref(false),
  editingId = ref(null),
  dialogError = ref(""),
  q = ref(""),
  statusFilter = ref(null);
const form = reactive({ name: "", slug: "", status: "ACTIVE" });
const statusOptions = ["ACTIVE", "INACTIVE"];
const toast = useToast(),
  confirm = useConfirm();
const filteredItems = computed(() =>
  items.value.filter(
    (x) =>
      (!q.value ||
        x.name.toLowerCase().includes(q.value.toLowerCase()) ||
        x.slug?.toLowerCase().includes(q.value.toLowerCase())) &&
      (!statusFilter.value || x.status === statusFilter.value),
  ),
);

async function load() {
  loading.value = true;
  try {
    items.value = (
      await api.get("/categories", { params: { all: true } })
    ).data.categories;
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
function openCreate() {
  editingId.value = null;
  Object.assign(form, { name: "", slug: "", status: "ACTIVE" });
  dialogError.value = "";
  visible.value = true;
}
function openEdit(x) {
  editingId.value = x._id;
  Object.assign(form, { name: x.name, slug: x.slug || "", status: x.status });
  dialogError.value = "";
  visible.value = true;
}
async function save() {
  if (!form.name.trim()) {
    dialogError.value = "Name is required.";
    return;
  }
  saving.value = true;
  try {
    const payload = { name: form.name.trim(), status: form.status };
    if (form.slug.trim()) payload.slug = form.slug.trim();
    editingId.value
      ? await api.patch(`/categories/${editingId.value}`, payload)
      : await api.post("/categories", payload);
    visible.value = false;
    toast.add({ severity: "success", summary: "Saved", life: 2000 });
    await load();
  } catch (e) {
    dialogError.value = apiMessage(e);
  } finally {
    saving.value = false;
  }
}
function confirmDelete(x) {
  confirm.require({
    message: `Deactivate category “${x.name}”?`,
    header: "Confirm",
    icon: "pi pi-exclamation-triangle",
    rejectProps: { label: "Cancel", severity: "secondary", outlined: true },
    acceptProps: { label: "Deactivate", severity: "danger" },
    accept: async () => {
      try {
        await api.delete(`/categories/${x._id}`);
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
