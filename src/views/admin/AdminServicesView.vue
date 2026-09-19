<template>
  <div>
    <!-- ====================================================== -->
    <!-- HEADER -->
    <!-- ====================================================== -->

    <Toolbar class="!border-0 !bg-transparent !p-0">
      <template #start>
        <div>
          <h1 class="text-3xl font-bold">Services</h1>
        </div>
      </template>

      <template #end>
        <Button label="Add Service" icon="pi pi-plus" @click="openCreate" />
      </template>
    </Toolbar>

    <!-- ====================================================== -->
    <!-- TABLE -->
    <!-- ====================================================== -->

    <Card class="mt-6 !rounded-2xl">
      <template #content>
        <!-- FILTER -->

        <div class="mb-4 grid gap-3 md:grid-cols-[1fr_220px_180px_auto]">
          <IconField>
            <InputIcon class="pi pi-search" />

            <InputText
              v-model="filters.q"
              class="w-full"
              placeholder="Search service"
            />
          </IconField>

          <Select
            v-model="filters.category"
            :options="categories"
            option-label="name"
            option-value="_id"
            placeholder="All categories"
            show-clear
            class="w-full"
          />

          <Select
            v-model="filters.status"
            :options="statusOptions"
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

        <!-- DATATABLE -->

        <DataTable
          :value="filteredItems"
          paginator
          :rows="10"
          :rows-per-page-options="[10, 20, 50]"
          striped-rows
          responsive-layout="scroll"
          :loading="loading"
        >
          <!-- IMAGE -->

          <Column header="Image">
            <template #body="{ data }">
              <Image
                v-if="data.thumbnail"
                :src="data.thumbnail"
                :alt="data.name"
                preview
                image-class="
                  h-12
                  w-16
                  cursor-zoom-in
                  rounded-lg
                  object-cover
                "
              />

              <div
                v-else
                class="grid h-12 w-16 place-items-center rounded-lg bg-slate-100 text-slate-400"
              >
                <i class="pi pi-image" />
              </div>
            </template>
          </Column>

          <!-- NAME -->

          <Column field="name" header="Name" sortable />

          <!-- CATEGORY -->

          <Column header="Category">
            <template #body="{ data }">
              {{ data.cate_id?.name || "-" }}
            </template>
          </Column>

          <!-- PRICE -->

          <Column field="price" header="Price" sortable>
            <template #body="{ data }">
              <span class="font-semibold">
                ${{ Number(data.price || 0).toFixed(2) }}
              </span>
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

          <!-- UPDATED -->

          <Column header="Updated">
            <template #body="{ data }">
              {{ formatDateTime(data.updated_at) }}
            </template>
          </Column>

          <!-- ACTION -->

          <Column header="Actions">
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
                  icon="pi pi-trash"
                  text
                  rounded
                  severity="danger"
                  :disabled="data.status === 'INACTIVE'"
                  @click="confirmDelete(data)"
                />
              </div>
            </template>
          </Column>

          <template #empty>
            <div class="py-8 text-center text-slate-500">
              <i class="pi pi-briefcase mb-2 block text-2xl" />

              No services found.
            </div>
          </template>
        </DataTable>
      </template>
    </Card>

    <!-- ====================================================== -->
    <!-- CREATE / EDIT / VIEW -->
    <!-- ====================================================== -->

    <Dialog
      v-model:visible="visible"
      modal
      :header="
        viewOnly
          ? 'Service Details'
          : editingId
            ? 'Edit Service'
            : 'Add Service'
      "
      :style="{
        width: '64rem',
      }"
      :breakpoints="{
        '1100px': '94vw',
        '640px': '98vw',
      }"
      :closable="!saving && !uploadingThumbnail && !uploadingGallery"
    >
      <div class="grid gap-6">
        <!-- ================================================== -->
        <!-- BASIC INFORMATION -->
        <!-- ================================================== -->

        <Card>
          <template #title> Service Information </template>

          <template #content>
            <div class="grid gap-4 sm:grid-cols-2">
              <!-- NAME -->

              <div>
                <label class="label">
                  Name

                  <span class="text-red-500"> * </span>
                </label>

                <InputText
                  v-model="form.name"
                  class="w-full"
                  placeholder="Example: Koh Rong Boat Tour"
                  :disabled="viewOnly"
                />
              </div>

              <!-- CATEGORY -->

              <div>
                <label class="label">
                  Category

                  <span class="text-red-500"> * </span>
                </label>

                <Select
                  v-model="form.cate_id"
                  :options="categories"
                  option-label="name"
                  option-value="_id"
                  class="w-full"
                  :disabled="viewOnly"
                />
              </div>

              <!-- PRICE -->

              <div>
                <label class="label"> Price </label>

                <InputNumber
                  v-model="form.price"
                  mode="currency"
                  currency="USD"
                  locale="en-US"
                  :min="0"
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
            </div>
          </template>
        </Card>

        <!-- ================================================== -->
        <!-- RICH DESCRIPTION -->
        <!-- ================================================== -->

        <Card>
          <template #title> Service Description </template>

          <template #subtitle>
            Write detailed information about this service.
          </template>

          <template #content>
            <!-- EDITOR -->

            <div v-if="!viewOnly">
              <Editor
                v-model="form.description"
                editor-style="height: 360px"
                class="overflow-hidden rounded-xl border border-slate-200"
              >
                <template #toolbar>
                  <!-- HEADING -->

                  <span class="ql-formats">
                    <select class="ql-header">
                      <option value="1">Heading 1</option>

                      <option value="2">Heading 2</option>

                      <option value="3">Heading 3</option>

                      <option selected>Normal</option>
                    </select>
                  </span>

                  <!-- FONT + SIZE -->

                  <span class="ql-formats">
                    <select class="ql-font">
                      <option selected>Sans Serif</option>

                      <option value="serif">Serif</option>

                      <option value="monospace">Monospace</option>
                    </select>

                    <select class="ql-size">
                      <option value="small">Small</option>

                      <option selected>Normal</option>

                      <option value="large">Large</option>

                      <option value="huge">Huge</option>
                    </select>
                  </span>

                  <!-- TEXT -->

                  <span class="ql-formats">
                    <button class="ql-bold" />

                    <button class="ql-italic" />

                    <button class="ql-underline" />

                    <button class="ql-strike" />
                  </span>

                  <!-- COLOR -->

                  <span class="ql-formats">
                    <select class="ql-color" />

                    <select class="ql-background" />
                  </span>

                  <!-- LISTS -->

                  <span class="ql-formats">
                    <button class="ql-list" value="ordered" />

                    <button class="ql-list" value="bullet" />

                    <button class="ql-indent" value="-1" />

                    <button class="ql-indent" value="+1" />
                  </span>

                  <!-- ALIGNMENT -->

                  <span class="ql-formats">
                    <select class="ql-align" />
                  </span>

                  <!-- OTHER -->

                  <span class="ql-formats">
                    <button class="ql-blockquote" />

                    <button class="ql-link" />

                    <button class="ql-clean" />
                  </span>
                </template>
              </Editor>

              <div class="mt-3 flex justify-end">
                <Button
                  :label="
                    showDescriptionPreview
                      ? 'Hide Preview'
                      : 'Preview Description'
                  "
                  :icon="
                    showDescriptionPreview ? 'pi pi-eye-slash' : 'pi pi-eye'
                  "
                  severity="secondary"
                  outlined
                  size="small"
                  @click="showDescriptionPreview = !showDescriptionPreview"
                />
              </div>

              <!-- PREVIEW -->

              <div
                v-if="showDescriptionPreview"
                class="mt-4 rounded-xl border border-slate-200 bg-white p-6"
              >
                <div
                  v-if="hasEditorContent(form.description)"
                  class="service-rich-content"
                  v-html="sanitizedDescription"
                />

                <p v-else class="text-sm text-slate-400">
                  Start writing to see a preview.
                </p>
              </div>
            </div>

            <!-- VIEW MODE -->

            <div v-else class="rounded-xl border border-slate-200 bg-white p-6">
              <div
                v-if="hasEditorContent(form.description)"
                class="service-rich-content"
                v-html="sanitizedDescription"
              />

              <p v-else class="text-slate-400">No description.</p>
            </div>
          </template>
        </Card>

        <!-- ================================================== -->
        <!-- THUMBNAIL -->
        <!-- ================================================== -->

        <Card>
          <template #title> Thumbnail </template>

          <template #content>
            <div
              class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p class="text-sm text-slate-500">
                  JPG, PNG or WEBP. Maximum 8 MB.
                </p>
              </div>

              <FileUpload
                v-if="!viewOnly"
                mode="basic"
                name="image"
                accept="image/*"
                :max-file-size="8000000"
                choose-label="Upload Thumbnail"
                choose-icon="pi pi-image"
                custom-upload
                auto
                :disabled="uploadingThumbnail"
                @uploader="uploadThumbnail"
              />
            </div>

            <!-- UPLOADING -->

            <Message
              v-if="uploadingThumbnail"
              severity="info"
              :closable="false"
              class="mb-4"
            >
              <i class="pi pi-spin pi-spinner mr-2" />

              Uploading thumbnail...
            </Message>

            <!-- IMAGE -->

            <div v-if="form.thumbnail" class="relative inline-block">
              <Image
                :src="form.thumbnail"
                alt="Thumbnail"
                preview
                image-class="
                  h-48
                  w-72
                  cursor-zoom-in
                  rounded-xl
                  object-cover
                "
              />

              <Button
                v-if="!viewOnly"
                icon="pi pi-trash"
                rounded
                severity="danger"
                size="small"
                class="!absolute !right-2 !top-2"
                @click="removeThumbnail"
              />
            </div>

            <!-- EMPTY -->

            <div
              v-else
              class="flex h-40 w-full max-w-sm items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50"
            >
              <div class="text-center text-slate-400">
                <i class="pi pi-image text-3xl" />

                <p class="mt-2 text-sm">No thumbnail</p>
              </div>
            </div>
          </template>
        </Card>

        <!-- ================================================== -->
        <!-- GALLERY -->
        <!-- ================================================== -->

        <Card>
          <template #title> Gallery Images </template>

          <template #content>
            <div
              class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <p class="text-sm text-slate-500">
                Add multiple images for the service gallery.
              </p>

              <FileUpload
                v-if="!viewOnly"
                mode="basic"
                name="images"
                accept="image/*"
                multiple
                :max-file-size="8000000"
                choose-label="Add Images"
                choose-icon="pi pi-images"
                custom-upload
                auto
                :disabled="uploadingGallery"
                @uploader="uploadGallery"
              />
            </div>

            <!-- UPLOADING -->

            <Message
              v-if="uploadingGallery"
              severity="info"
              :closable="false"
              class="mb-4"
            >
              <i class="pi pi-spin pi-spinner mr-2" />

              Uploading gallery images...
            </Message>

            <!-- IMAGES -->

            <div
              v-if="form.images.length"
              class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
            >
              <div
                v-for="(image, index) in form.images"
                :key="`${image}-${index}`"
                class="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
              >
                <Image
                  :src="image"
                  alt="Gallery"
                  preview
                  image-class="
                    h-32
                    w-full
                    cursor-zoom-in
                    object-cover
                  "
                  class="block"
                />

                <Button
                  v-if="!viewOnly"
                  icon="pi pi-times"
                  rounded
                  severity="danger"
                  size="small"
                  class="!absolute !right-1 !top-1"
                  @click="removeGallery(index)"
                />
              </div>
            </div>

            <p
              v-else
              class="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500"
            >
              No gallery images.
            </p>
          </template>
        </Card>

        <!-- ================================================== -->
        <!-- ERROR -->
        <!-- ================================================== -->

        <Message v-if="dialogError" severity="error" :closable="false">
          {{ dialogError }}
        </Message>
      </div>

      <!-- ==================================================== -->
      <!-- FOOTER -->
      <!-- ==================================================== -->

      <template #footer>
        <Button
          :label="viewOnly ? 'Close' : 'Cancel'"
          icon="pi pi-times"
          severity="secondary"
          outlined
          :disabled="saving || uploadingThumbnail || uploadingGallery"
          @click="visible = false"
        />

        <Button
          v-if="!viewOnly"
          label="Save"
          icon="pi pi-save"
          :loading="saving"
          :disabled="uploadingThumbnail || uploadingGallery"
          @click="save"
        />
      </template>
    </Dialog>

    <ConfirmDialog />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";

import DOMPurify from "dompurify";

import { useConfirm } from "primevue/useconfirm";

import { useToast } from "primevue/usetoast";

import Button from "primevue/button";
import Card from "primevue/card";
import Column from "primevue/column";
import ConfirmDialog from "primevue/confirmdialog";
import DataTable from "primevue/datatable";
import Dialog from "primevue/dialog";
import Editor from "primevue/editor";
import FileUpload from "primevue/fileupload";
import IconField from "primevue/iconfield";
import Image from "primevue/image";
import InputIcon from "primevue/inputicon";
import InputNumber from "primevue/inputnumber";
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

/*
|--------------------------------------------------------------------------
| STATE
|--------------------------------------------------------------------------
*/

const items = ref([]);

const categories = ref([]);

const loading = ref(false);

const saving = ref(false);

const uploadingThumbnail = ref(false);

const uploadingGallery = ref(false);

const visible = ref(false);

const editingId = ref(null);

const viewOnly = ref(false);

const dialogError = ref("");

const showDescriptionPreview = ref(false);

/*
|--------------------------------------------------------------------------
| FILTERS
|--------------------------------------------------------------------------
*/

const filters = reactive({
  q: "",
  category: null,
  status: null,
});

/*
|--------------------------------------------------------------------------
| FORM
|--------------------------------------------------------------------------
*/

const form = reactive({
  cate_id: "",

  name: "",

  price: 0,

  /*
   * HTML string generated
   * by PrimeVue Editor.
   */
  description: "",

  thumbnail: "",

  status: "ACTIVE",

  images: [],
});

/*
|--------------------------------------------------------------------------
| OPTIONS
|--------------------------------------------------------------------------
*/

const statusOptions = ["ACTIVE", "INACTIVE"];

/*
|--------------------------------------------------------------------------
| PRIMEVUE
|--------------------------------------------------------------------------
*/

const toast = useToast();

const confirm = useConfirm();

/*
|--------------------------------------------------------------------------
| SANITIZED DESCRIPTION
|--------------------------------------------------------------------------
*/

const sanitizedDescription = computed(() => {
  return sanitizeHtml(form.description);
});

/*
|--------------------------------------------------------------------------
| FILTERED SERVICES
|--------------------------------------------------------------------------
*/

const filteredItems = computed(() => {
  const q = filters.q.trim().toLowerCase();

  return items.value.filter((item) => {
    const name = String(item.name || "").toLowerCase();

    /*
     * Remove HTML before searching.
     */
    const description = stripHtml(item.description || "").toLowerCase();

    const matchesText = !q || name.includes(q) || description.includes(q);

    const matchesCategory =
      !filters.category ||
      String(item.cate_id?._id || item.cate_id || "") ===
        String(filters.category);

    const matchesStatus = !filters.status || item.status === filters.status;

    return matchesText && matchesCategory && matchesStatus;
  });
});

/*
|--------------------------------------------------------------------------
| SANITIZE HTML
|--------------------------------------------------------------------------
*/

function sanitizeHtml(html) {
  return DOMPurify.sanitize(String(html || ""), {
    USE_PROFILES: {
      html: true,
    },
  });
}

/*
|--------------------------------------------------------------------------
| STRIP HTML
|--------------------------------------------------------------------------
*/

function stripHtml(html) {
  const container = document.createElement("div");

  container.innerHTML = String(html || "");

  return (container.textContent || container.innerText || "").trim();
}

/*
|--------------------------------------------------------------------------
| CHECK EDITOR CONTENT
|--------------------------------------------------------------------------
|
| Quill may return:
|
| <p><br></p>
|
| even when content is empty.
|
*/

function hasEditorContent(html) {
  return Boolean(stripHtml(html));
}

/*
|--------------------------------------------------------------------------
| LOAD
|--------------------------------------------------------------------------
*/

async function load() {
  loading.value = true;

  try {
    const [serviceResponse, categoryResponse] = await Promise.all([
      api.get("/services", {
        params: {
          all: true,
        },
      }),

      api.get("/categories", {
        params: {
          all: true,
        },
      }),
    ]);

    items.value = serviceResponse.data.services || [];

    categories.value = categoryResponse.data.categories || [];
  } catch (error) {
    console.error("LOAD SERVICES ERROR:", error);

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

function setForm(service = null) {
  Object.assign(form, {
    cate_id:
      service?.cate_id?._id ||
      service?.cate_id ||
      categories.value[0]?._id ||
      "",

    name: service?.name || "",

    price: Number(service?.price || 0),

    description: service?.description || "",

    thumbnail: service?.thumbnail || "",

    status: service?.status || "ACTIVE",

    images: Array.isArray(service?.images) ? [...service.images] : [],
  });

  dialogError.value = "";

  uploadingThumbnail.value = false;

  uploadingGallery.value = false;

  showDescriptionPreview.value = false;
}

/*
|--------------------------------------------------------------------------
| CREATE
|--------------------------------------------------------------------------
*/

function openCreate() {
  editingId.value = null;

  viewOnly.value = false;

  setForm();

  visible.value = true;
}

/*
|--------------------------------------------------------------------------
| EDIT
|--------------------------------------------------------------------------
*/

function openEdit(service) {
  editingId.value = service._id;

  viewOnly.value = false;

  setForm(service);

  visible.value = true;
}

/*
|--------------------------------------------------------------------------
| VIEW
|--------------------------------------------------------------------------
*/

function openView(service) {
  editingId.value = service._id;

  viewOnly.value = true;

  setForm(service);

  visible.value = true;
}

/*
|--------------------------------------------------------------------------
| EXTRACT UPLOADED URL
|--------------------------------------------------------------------------
*/

function extractUploadedUrl(data) {
  return data?.url || data?.image?.url || data?.secure_url || "";
}

/*
|--------------------------------------------------------------------------
| UPLOAD ONE FILE
|--------------------------------------------------------------------------
*/

async function uploadOneFile(file, folder) {
  if (!file) {
    throw new Error("No image selected.");
  }

  const formData = new FormData();

  formData.append("image", file);

  formData.append("folder", folder);

  /*
   * Browser automatically generates
   * multipart boundary.
   */
  const response = await api.post("/uploads/image", formData);

  console.log("[UPLOAD RESPONSE]", response.data);

  const url = extractUploadedUrl(response.data);

  if (!url) {
    throw new Error("Image uploaded but server did not return an image URL.");
  }

  return url;
}

/*
|--------------------------------------------------------------------------
| THUMBNAIL
|--------------------------------------------------------------------------
*/

async function uploadThumbnail(event) {
  const file = event.files?.[0];

  if (!file) {
    return;
  }

  uploadingThumbnail.value = true;

  dialogError.value = "";

  try {
    form.thumbnail = await uploadOneFile(file, "explore-kohrong/services");

    toast.add({
      severity: "success",

      summary: "Thumbnail uploaded",

      detail: "Thumbnail uploaded successfully.",

      life: 2200,
    });
  } catch (error) {
    console.error("THUMBNAIL UPLOAD ERROR:", error);

    dialogError.value =
      apiMessage(error) || error.message || "Thumbnail upload failed.";
  } finally {
    uploadingThumbnail.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| GALLERY
|--------------------------------------------------------------------------
*/

async function uploadGallery(event) {
  const files = Array.from(event.files || []);

  if (!files.length) {
    return;
  }

  uploadingGallery.value = true;

  dialogError.value = "";

  try {
    const urls = [];

    for (const file of files) {
      const url = await uploadOneFile(file, "explore-kohrong/services/gallery");

      urls.push(url);
    }

    form.images = [...new Set([...form.images, ...urls])];

    toast.add({
      severity: "success",

      summary: "Images uploaded",

      detail: `${urls.length} image(s) uploaded successfully.`,

      life: 2200,
    });
  } catch (error) {
    console.error("GALLERY UPLOAD ERROR:", error);

    dialogError.value =
      apiMessage(error) || error.message || "Gallery upload failed.";
  } finally {
    uploadingGallery.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| REMOVE THUMBNAIL
|--------------------------------------------------------------------------
*/

function removeThumbnail() {
  form.thumbnail = "";
}

/*
|--------------------------------------------------------------------------
| REMOVE IMAGE
|--------------------------------------------------------------------------
*/

function removeGallery(index) {
  form.images.splice(index, 1);
}

/*
|--------------------------------------------------------------------------
| SAVE
|--------------------------------------------------------------------------
*/

async function save() {
  dialogError.value = "";

  if (uploadingThumbnail.value || uploadingGallery.value) {
    dialogError.value = "Please wait until all images finish uploading.";

    return;
  }

  if (!form.cate_id) {
    dialogError.value = "Category is required.";

    return;
  }

  if (!form.name.trim()) {
    dialogError.value = "Service name is required.";

    return;
  }

  /*
   * Optional:
   *
   * If you want description required,
   * keep this check.
   */

  if (!hasEditorContent(form.description)) {
    dialogError.value = "Service description is required.";

    return;
  }

  saving.value = true;

  try {
    const payload = {
      cate_id: form.cate_id,

      name: form.name.trim(),

      price: Number(form.price || 0),

      /*
       * Save sanitized HTML.
       */
      description: sanitizeHtml(form.description),

      thumbnail: form.thumbnail || "",

      images: form.images.filter(Boolean),

      status: form.status,
    };

    console.log("[SERVICE SAVE PAYLOAD]", payload);

    if (editingId.value) {
      await api.patch(`/services/${editingId.value}`, payload);
    } else {
      await api.post("/services", payload);
    }

    visible.value = false;

    toast.add({
      severity: "success",

      summary: "Saved",

      detail: "Service saved successfully.",

      life: 2200,
    });

    await load();
  } catch (error) {
    console.error("SAVE SERVICE ERROR:", error);

    dialogError.value = apiMessage(error);
  } finally {
    saving.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| DEACTIVATE
|--------------------------------------------------------------------------
*/

function confirmDelete(service) {
  confirm.require({
    message: `Deactivate service "${service.name}"?`,

    header: "Confirm",

    icon: "pi pi-exclamation-triangle",

    rejectProps: {
      label: "Cancel",

      severity: "secondary",

      outlined: true,
    },

    acceptProps: {
      label: "Deactivate",

      severity: "danger",
    },

    accept: async () => {
      try {
        await api.delete(`/services/${service._id}`);

        toast.add({
          severity: "success",

          summary: "Deactivated",

          detail: "Service deactivated successfully.",

          life: 2000,
        });

        await load();
      } catch (error) {
        toast.add({
          severity: "error",

          summary: "Unable to deactivate",

          detail: apiMessage(error),

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

<style scoped>
/*
|--------------------------------------------------------------------------
| SERVICE RICH CONTENT
|--------------------------------------------------------------------------
*/

.service-rich-content {
  color: #334155;
  font-size: 1rem;
  line-height: 1.8;
  overflow-wrap: anywhere;
}

.service-rich-content :deep(p) {
  margin: 0.85rem 0;
}

.service-rich-content :deep(h1) {
  margin: 1.5rem 0 0.8rem;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
  color: #0f172a;
}

.service-rich-content :deep(h2) {
  margin: 1.4rem 0 0.7rem;
  font-size: 1.7rem;
  font-weight: 700;
  line-height: 1.3;
  color: #0f172a;
}

.service-rich-content :deep(h3) {
  margin: 1.25rem 0 0.6rem;
  font-size: 1.4rem;
  font-weight: 700;
  color: #0f172a;
}

.service-rich-content :deep(strong) {
  font-weight: 700;
}

.service-rich-content :deep(em) {
  font-style: italic;
}

.service-rich-content :deep(ul) {
  margin: 1rem 0;
  padding-left: 1.75rem;
  list-style-type: disc;
}

.service-rich-content :deep(ol) {
  margin: 1rem 0;
  padding-left: 1.75rem;
  list-style-type: decimal;
}

.service-rich-content :deep(li) {
  margin: 0.35rem 0;
}

.service-rich-content :deep(a) {
  color: #0e7490;
  font-weight: 500;
  text-decoration: underline;
}

.service-rich-content :deep(blockquote) {
  margin: 1.25rem 0;
  border-left: 4px solid #0e7490;
  background: #ecfeff;
  padding: 0.9rem 1.2rem;
  color: #475569;
}

.service-rich-content :deep(.ql-align-center) {
  text-align: center;
}

.service-rich-content :deep(.ql-align-right) {
  text-align: right;
}

.service-rich-content :deep(.ql-align-justify) {
  text-align: justify;
}

.service-rich-content :deep(.ql-size-small) {
  font-size: 0.8em;
}

.service-rich-content :deep(.ql-size-large) {
  font-size: 1.5em;
}

.service-rich-content :deep(.ql-size-huge) {
  font-size: 2.2em;
}

.service-rich-content :deep(.ql-font-serif) {
  font-family: Georgia, "Times New Roman", serif;
}

.service-rich-content :deep(.ql-font-monospace) {
  font-family: Monaco, Consolas, "Courier New", monospace;
}
</style>
