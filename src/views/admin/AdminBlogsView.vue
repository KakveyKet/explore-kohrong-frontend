<template>
  <div class="space-y-6">
    <!-- ====================================================== -->
    <!-- HEADER -->
    <!-- ====================================================== -->

    <Toolbar class="!border-0 !bg-transparent !p-0">
      <template #start>
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Blog Management</h1>
        </div>
      </template>
      z
      <template #end>
        <Button label="Add Blog" icon="pi pi-plus" @click="openCreate" />
      </template>
    </Toolbar>

    <!-- ====================================================== -->
    <!-- FILTER -->
    <!-- ====================================================== -->

    <Card class="!rounded-2xl">
      <template #content>
        <div class="grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <IconField>
            <InputIcon class="pi pi-search" />

            <InputText
              v-model="filters.q"
              class="w-full"
              placeholder="Search blog..."
            />
          </IconField>

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
            @click="loadBlogs"
          />
        </div>
      </template>
    </Card>

    <!-- ====================================================== -->
    <!-- TABLE -->
    <!-- ====================================================== -->

    <Card class="!rounded-2xl">
      <template #content>
        <DataTable
          :value="filteredBlogs"
          :loading="loading"
          paginator
          :rows="10"
          :rows-per-page-options="[10, 20, 50]"
          striped-rows
          responsive-layout="scroll"
        >
          <!-- THUMBNAIL -->

          <Column header="Thumbnail">
            <template #body="{ data }">
              <Image
                v-if="data.thumbnail"
                :src="data.thumbnail"
                :alt="data.title"
                preview
                image-class="
                  h-14
                  w-20
                  cursor-zoom-in
                  rounded-lg
                  object-cover
                "
              />

              <div
                v-else
                class="grid h-14 w-20 place-items-center rounded-lg bg-slate-100 text-slate-400"
              >
                <i class="pi pi-image" />
              </div>
            </template>
          </Column>

          <!-- TITLE -->

          <Column field="title" header="Title" sortable>
            <template #body="{ data }">
              <div class="max-w-sm">
                <p class="font-semibold text-slate-900">
                  {{ data.title }}
                </p>

                <p class="mt-1 text-xs text-slate-500">
                  {{ data.post_detail?.length || 0 }}
                  content sections
                </p>
              </div>
            </template>
          </Column>

          <!-- STATUS -->

          <Column header="Status">
            <template #body="{ data }">
              <Tag
                :value="data.status"
                :severity="data.status === 'ACTIVE' ? 'success' : 'secondary'"
              />
            </template>
          </Column>

          <!-- UPDATED -->

          <Column header="Updated">
            <template #body="{ data }">
              {{ formatDate(data.updated_at) }}
            </template>
          </Column>

          <!-- ACTION -->

          <Column header="Actions" style="width: 160px">
            <template #body="{ data }">
              <div class="flex gap-1">
                <Button
                  icon="pi pi-eye"
                  text
                  rounded
                  severity="secondary"
                  @click="openPreview(data)"
                />

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
                  @click="confirmDelete(data)"
                />
              </div>
            </template>
          </Column>

          <template #empty>
            <div class="py-10 text-center text-slate-500">
              <i class="pi pi-file-edit mb-2 block text-3xl" />

              No blog posts found.
            </div>
          </template>
        </DataTable>
      </template>
    </Card>

    <!-- ====================================================== -->
    <!-- CREATE / EDIT DIALOG -->
    <!-- ====================================================== -->

    <Dialog
      v-model:visible="editorVisible"
      modal
      :header="editingId ? 'Edit Blog' : 'Create Blog'"
      :style="{
        width: '76rem',
      }"
      :breakpoints="{
        '1200px': '95vw',
        '640px': '98vw',
      }"
      :closable="!saving && !uploadingThumbnail && !anySectionUploading"
    >
      <div class="space-y-6">
        <!-- ================================================== -->
        <!-- MAIN BLOG -->
        <!-- ================================================== -->

        <Card>
          <template #title> Main Blog </template>

          <template #content>
            <div class="grid gap-5 md:grid-cols-2">
              <!-- TITLE -->

              <div class="md:col-span-2">
                <label class="label">
                  Blog Title
                  <span class="text-red-500"> * </span>
                </label>

                <InputText
                  v-model="form.title"
                  class="w-full"
                  placeholder="
                    Top 10 Koh Rong Places You Should Know
                  "
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

            <Divider />

            <!-- ============================================== -->
            <!-- THUMBNAIL -->
            <!-- ============================================== -->

            <div>
              <div
                class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h4 class="font-semibold text-slate-800">Blog Thumbnail</h4>

                  <p class="mt-1 text-xs text-slate-500">
                    JPG, PNG or WEBP. Maximum 8 MB.
                  </p>
                </div>

                <FileUpload
                  mode="basic"
                  name="image"
                  accept="image/*"
                  :max-file-size="8000000"
                  custom-upload
                  auto
                  choose-label="Upload Thumbnail"
                  choose-icon="pi pi-upload"
                  :disabled="uploadingThumbnail"
                  @uploader="uploadThumbnail"
                />
              </div>

              <Message
                v-if="uploadingThumbnail"
                severity="info"
                :closable="false"
                class="mt-4"
              >
                <i class="pi pi-spin pi-spinner mr-2" />

                Uploading thumbnail...
              </Message>

              <div v-if="form.thumbnail" class="mt-5">
                <div class="relative inline-block">
                  <Image
                    :src="form.thumbnail"
                    alt="Blog thumbnail"
                    preview
                    image-class="
                      h-52
                      w-80
                      cursor-zoom-in
                      rounded-xl
                      object-cover
                    "
                  />

                  <Button
                    icon="pi pi-trash"
                    severity="danger"
                    rounded
                    size="small"
                    class="!absolute !right-2 !top-2"
                    @click="removeThumbnail"
                  />
                </div>
              </div>

              <div
                v-else
                class="mt-5 flex h-44 max-w-md items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50"
              >
                <div class="text-center text-slate-400">
                  <i class="pi pi-image text-3xl" />

                  <p class="mt-2 text-sm">No thumbnail uploaded</p>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- ================================================== -->
        <!-- CHILD POSTS HEADER -->
        <!-- ================================================== -->

        <div
          class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h3 class="text-xl font-bold text-slate-900">Blog Sections</h3>

            <p class="mt-1 text-sm text-slate-500">
              Each section has its own title, rich-text content and images.
            </p>
          </div>

          <Button
            label="Add Section"
            icon="pi pi-plus"
            outlined
            @click="addSection"
          />
        </div>

        <!-- ================================================== -->
        <!-- CHILD POSTS -->
        <!-- ================================================== -->

        <div class="space-y-6">
          <Card
            v-for="(section, index) in form.post_detail"
            :key="section.localId"
          >
            <!-- HEADER -->

            <template #title>
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-9 w-9 items-center justify-center rounded-full bg-[#0E7490] text-sm font-bold text-white"
                  >
                    {{ index + 1 }}
                  </div>

                  <span>
                    Blog Section
                    {{ index + 1 }}
                  </span>
                </div>

                <div class="flex">
                  <Button
                    icon="pi pi-arrow-up"
                    severity="secondary"
                    text
                    rounded
                    :disabled="index === 0"
                    @click="moveSectionUp(index)"
                  />

                  <Button
                    icon="pi pi-arrow-down"
                    severity="secondary"
                    text
                    rounded
                    :disabled="index === form.post_detail.length - 1"
                    @click="moveSectionDown(index)"
                  />

                  <Button
                    icon="pi pi-trash"
                    severity="danger"
                    text
                    rounded
                    :disabled="form.post_detail.length <= 1"
                    @click="removeSection(index)"
                  />
                </div>
              </div>
            </template>

            <template #content>
              <div class="space-y-6">
                <!-- ========================================== -->
                <!-- SECTION TITLE -->
                <!-- ========================================== -->

                <div>
                  <label class="label">
                    Section Title

                    <span class="text-red-500"> * </span>
                  </label>

                  <InputText
                    v-model="section.sub_title"
                    class="w-full"
                    :placeholder="`Example: Long Set Beach`"
                  />
                </div>

                <!-- ========================================== -->
                <!-- RICH TEXT EDITOR -->
                <!-- ========================================== -->

                <div>
                  <div class="mb-2">
                    <label class="label !mb-0">
                      Blog Content

                      <span class="text-red-500"> * </span>
                    </label>

                    <p class="mt-1 text-xs text-slate-500">
                      Use the toolbar to customize headings, font, size, color,
                      lists, links and alignment.
                    </p>
                  </div>

                  <Editor
                    v-model="section.text"
                    editor-style="
                      height: 360px
                    "
                    class="overflow-hidden rounded-xl border border-slate-200"
                  >
                    <!-- ====================================== -->
                    <!-- CUSTOM TOOLBAR -->
                    <!-- ====================================== -->

                    <template #toolbar>
                      <span class="ql-formats">
                        <select class="ql-header">
                          <option value="1">Heading 1</option>

                          <option value="2">Heading 2</option>

                          <option value="3">Heading 3</option>

                          <option selected>Normal</option>
                        </select>
                      </span>

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

                      <span class="ql-formats">
                        <button class="ql-bold" />

                        <button class="ql-italic" />

                        <button class="ql-underline" />

                        <button class="ql-strike" />
                      </span>

                      <span class="ql-formats">
                        <select class="ql-color" />

                        <select class="ql-background" />
                      </span>

                      <span class="ql-formats">
                        <button class="ql-list" value="ordered" />

                        <button class="ql-list" value="bullet" />

                        <button class="ql-indent" value="-1" />

                        <button class="ql-indent" value="+1" />
                      </span>

                      <span class="ql-formats">
                        <select class="ql-align" />
                      </span>

                      <span class="ql-formats">
                        <button class="ql-blockquote" />

                        <button class="ql-code-block" />
                      </span>

                      <span class="ql-formats">
                        <button class="ql-link" />

                        <button class="ql-clean" />
                      </span>
                    </template>
                  </Editor>
                </div>

                <!-- ========================================== -->
                <!-- HTML PREVIEW -->
                <!-- ========================================== -->

                <div>
                  <div class="mb-3 flex items-center justify-between">
                    <div>
                      <p class="text-sm font-semibold text-slate-700">
                        Content Preview
                      </p>

                      <p class="text-xs text-slate-400">
                        Preview of how your rich content will look.
                      </p>
                    </div>

                    <Button
                      :label="
                        section.showPreview ? 'Hide Preview' : 'Show Preview'
                      "
                      :icon="
                        section.showPreview ? 'pi pi-eye-slash' : 'pi pi-eye'
                      "
                      size="small"
                      severity="secondary"
                      outlined
                      @click="section.showPreview = !section.showPreview"
                    />
                  </div>

                  <div
                    v-if="section.showPreview"
                    class="rounded-xl border border-slate-200 bg-white p-6"
                  >
                    <div
                      v-if="hasEditorContent(section.text)"
                      class="blog-rich-content"
                      v-html="sanitizedHtml(section.text)"
                    />

                    <p v-else class="text-sm text-slate-400">
                      Start writing to see the preview.
                    </p>
                  </div>
                </div>

                <Divider />

                <!-- ========================================== -->
                <!-- SECTION IMAGES -->
                <!-- ========================================== -->

                <div>
                  <div
                    class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <h4 class="text-sm font-semibold text-slate-800">
                        Section Images
                      </h4>

                      <p class="mt-1 text-xs text-slate-500">
                        Upload one or multiple images for this section.
                      </p>
                    </div>

                    <FileUpload
                      mode="basic"
                      name="images"
                      accept="image/*"
                      multiple
                      :max-file-size="8000000"
                      custom-upload
                      auto
                      choose-label="Upload Images"
                      choose-icon="pi pi-images"
                      :disabled="section.uploading"
                      @uploader="(event) => uploadSectionImages(event, index)"
                    />
                  </div>

                  <Message
                    v-if="section.uploading"
                    severity="info"
                    :closable="false"
                    class="mt-4"
                  >
                    <i class="pi pi-spin pi-spinner mr-2" />

                    Uploading images...
                  </Message>

                  <div
                    v-if="section.images.length"
                    class="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
                  >
                    <div
                      v-for="(image, imageIndex) in section.images"
                      :key="`${image}-${imageIndex}`"
                      class="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                    >
                      <Image
                        :src="image"
                        :alt="section.sub_title"
                        preview
                        image-class="
                          h-32
                          w-full
                          cursor-zoom-in
                          object-cover
                        "
                      />

                      <Button
                        icon="pi pi-trash"
                        severity="danger"
                        rounded
                        size="small"
                        class="!absolute !right-2 !top-2"
                        @click="removeSectionImage(index, imageIndex)"
                      />
                    </div>
                  </div>

                  <div
                    v-else
                    class="mt-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-400"
                  >
                    <i class="pi pi-images mb-2 block text-2xl" />

                    No section images uploaded.
                  </div>
                </div>

                <!-- ========================================== -->
                <!-- VIDEO URL -->
                <!-- ========================================== -->

                <div>
                  <label class="label">
                    Video URL

                    <span class="font-normal text-slate-400"> (optional) </span>
                  </label>

                  <InputGroup>
                    <InputGroupAddon>
                      <i class="pi pi-video" />
                    </InputGroupAddon>

                    <InputText
                      v-model="section.video_url"
                      class="w-full"
                      placeholder="
                        https://youtube.com/...
                      "
                    />
                  </InputGroup>
                </div>
              </div>
            </template>
          </Card>
        </div>

        <!-- ================================================== -->
        <!-- ERROR -->
        <!-- ================================================== -->

        <Message v-if="editorError" severity="error" :closable="false">
          {{ editorError }}
        </Message>
      </div>

      <!-- ==================================================== -->
      <!-- FOOTER -->
      <!-- ==================================================== -->

      <template #footer>
        <Button
          label="Cancel"
          icon="pi pi-times"
          severity="secondary"
          outlined
          :disabled="saving || uploadingThumbnail || anySectionUploading"
          @click="editorVisible = false"
        />

        <Button
          :label="editingId ? 'Update Blog' : 'Create Blog'"
          icon="pi pi-save"
          :loading="saving"
          :disabled="uploadingThumbnail || anySectionUploading"
          @click="saveBlog"
        />
      </template>
    </Dialog>

    <!-- ====================================================== -->
    <!-- BLOG PREVIEW -->
    <!-- ====================================================== -->

    <Dialog
      v-model:visible="previewVisible"
      modal
      header="Blog Preview"
      :style="{
        width: '68rem',
      }"
      :breakpoints="{
        '1100px': '95vw',
        '640px': '98vw',
      }"
    >
      <article v-if="preview" class="mx-auto max-w-4xl">
        <Image
          v-if="preview.thumbnail"
          :src="preview.thumbnail"
          :alt="preview.title"
          preview
          image-class="
            h-72
            w-full
            cursor-zoom-in
            rounded-2xl
            object-cover
          "
        />

        <h1 class="mt-7 text-4xl font-bold text-slate-900">
          {{ preview.title }}
        </h1>

        <div class="mt-10 space-y-16">
          <section
            v-for="(section, index) in preview.post_detail"
            :key="section._id || index"
          >
            <h2 class="text-2xl font-bold text-slate-900">
              {{ section.sub_title }}
            </h2>

            <div
              class="blog-rich-content mt-5"
              v-html="sanitizedHtml(section.text)"
            />

            <div
              v-if="section.images?.length"
              class="mt-7 grid gap-4 sm:grid-cols-2"
            >
              <Image
                v-for="(image, imageIndex) in section.images"
                :key="`${index}-${imageIndex}`"
                :src="image"
                :alt="section.sub_title"
                preview
                image-class="
                  h-64
                  w-full
                  cursor-zoom-in
                  rounded-xl
                  object-cover
                "
              />
            </div>
          </section>
        </div>
      </article>
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

import Divider from "primevue/divider";

import Editor from "primevue/editor";

import FileUpload from "primevue/fileupload";

import IconField from "primevue/iconfield";

import Image from "primevue/image";

import InputGroup from "primevue/inputgroup";

import InputGroupAddon from "primevue/inputgroupaddon";

import InputIcon from "primevue/inputicon";

import InputText from "primevue/inputtext";

import Message from "primevue/message";

import Select from "primevue/select";

import Tag from "primevue/tag";

import Toolbar from "primevue/toolbar";

import api from "../../services/api.js";

/*
|--------------------------------------------------------------------------
| STATE
|--------------------------------------------------------------------------
*/

const blogs = ref([]);

const loading = ref(false);

const saving = ref(false);

const uploadingThumbnail = ref(false);

const editorVisible = ref(false);

const previewVisible = ref(false);

const editingId = ref(null);

const editorError = ref("");

const preview = ref(null);

/*
|--------------------------------------------------------------------------
| FILTER
|--------------------------------------------------------------------------
*/

const filters = reactive({
  q: "",
  status: null,
});

/*
|--------------------------------------------------------------------------
| FORM
|--------------------------------------------------------------------------
*/

const form = reactive({
  title: "",
  thumbnail: "",
  status: "ACTIVE",
  post_detail: [],
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
| FILTERED BLOGS
|--------------------------------------------------------------------------
*/

const filteredBlogs = computed(() => {
  const keyword = filters.q.trim().toLowerCase();

  return blogs.value.filter((blog) => {
    const matchesSearch =
      !keyword ||
      String(blog.title || "")
        .toLowerCase()
        .includes(keyword);

    const matchesStatus = !filters.status || blog.status === filters.status;

    return matchesSearch && matchesStatus;
  });
});

/*
|--------------------------------------------------------------------------
| UPLOAD STATE
|--------------------------------------------------------------------------
*/

const anySectionUploading = computed(() => {
  return form.post_detail.some((section) => Boolean(section.uploading));
});

/*
|--------------------------------------------------------------------------
| EMPTY SECTION
|--------------------------------------------------------------------------
*/

function createEmptySection() {
  return {
    localId: `${Date.now()}-${Math.random()}`,

    sub_title: "",

    /*
     * This now contains HTML.
     */
    text: "",

    images: [],

    video_url: "",

    uploading: false,

    showPreview: false,
  };
}

/*
|--------------------------------------------------------------------------
| RESET
|--------------------------------------------------------------------------
*/

function resetForm() {
  editingId.value = null;

  editorError.value = "";

  form.title = "";

  form.thumbnail = "";

  form.status = "ACTIVE";

  form.post_detail = [createEmptySection()];
}

/*
|--------------------------------------------------------------------------
| CREATE
|--------------------------------------------------------------------------
*/

function openCreate() {
  resetForm();

  editorVisible.value = true;
}

/*
|--------------------------------------------------------------------------
| EDIT
|--------------------------------------------------------------------------
*/

function openEdit(blog) {
  editingId.value = blog._id;

  editorError.value = "";

  form.title = blog.title || "";

  form.thumbnail = blog.thumbnail || "";

  form.status = blog.status || "ACTIVE";

  form.post_detail = (blog.post_detail || []).map((section) => ({
    localId: section._id || `${Date.now()}-${Math.random()}`,

    sub_title: section.sub_title || "",

    text: section.text || "",

    images: Array.isArray(section.images) ? [...section.images] : [],

    video_url: section.video_url || "",

    uploading: false,

    showPreview: false,
  }));

  if (!form.post_detail.length) {
    form.post_detail = [createEmptySection()];
  }

  editorVisible.value = true;
}

/*
|--------------------------------------------------------------------------
| PREVIEW
|--------------------------------------------------------------------------
*/

function openPreview(blog) {
  preview.value = blog;

  previewVisible.value = true;
}

/*
|--------------------------------------------------------------------------
| ADD SECTION
|--------------------------------------------------------------------------
*/

function addSection() {
  form.post_detail.push(createEmptySection());
}

/*
|--------------------------------------------------------------------------
| REMOVE SECTION
|--------------------------------------------------------------------------
*/

function removeSection(index) {
  if (form.post_detail.length <= 1) {
    return;
  }

  form.post_detail.splice(index, 1);
}

/*
|--------------------------------------------------------------------------
| MOVE UP
|--------------------------------------------------------------------------
*/

function moveSectionUp(index) {
  if (index <= 0) {
    return;
  }

  const section = form.post_detail[index];

  form.post_detail.splice(index, 1);

  form.post_detail.splice(index - 1, 0, section);
}

/*
|--------------------------------------------------------------------------
| MOVE DOWN
|--------------------------------------------------------------------------
*/

function moveSectionDown(index) {
  if (index >= form.post_detail.length - 1) {
    return;
  }

  const section = form.post_detail[index];

  form.post_detail.splice(index, 1);

  form.post_detail.splice(index + 1, 0, section);
}

/*
|--------------------------------------------------------------------------
| SANITIZE HTML
|--------------------------------------------------------------------------
*/

function sanitizedHtml(html) {
  return DOMPurify.sanitize(String(html || ""), {
    USE_PROFILES: {
      html: true,
    },
  });
}

/*
|--------------------------------------------------------------------------
| CHECK RICH TEXT EMPTY
|--------------------------------------------------------------------------
|
| Quill can return:
|
| <p><br></p>
|
| even though there is no actual text.
|
*/

function hasEditorContent(html) {
  const container = document.createElement("div");

  container.innerHTML = String(html || "");

  const text = container.textContent?.replace(/\u00a0/g, " ").trim();

  return Boolean(text);
}

/*
|--------------------------------------------------------------------------
| EXTRACT UPLOAD URL
|--------------------------------------------------------------------------
*/

function extractUploadedUrl(data) {
  return data?.url || data?.image?.url || data?.secure_url || "";
}

/*
|--------------------------------------------------------------------------
| UPLOAD ONE IMAGE
|--------------------------------------------------------------------------
*/

async function uploadOneImage(file, folder) {
  const data = new FormData();

  data.append("image", file);

  data.append("folder", folder);

  /*
   * Don't manually set multipart
   * Content-Type.
   */
  const response = await api.post("/uploads/image", data);

  const url = extractUploadedUrl(response.data);

  if (!url) {
    throw new Error("Image uploaded but no image URL was returned.");
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

  editorError.value = "";

  try {
    form.thumbnail = await uploadOneImage(file, "explore-kohrong/blogs");

    toast.add({
      severity: "success",
      summary: "Thumbnail Uploaded",
      detail: "Blog thumbnail uploaded successfully.",
      life: 2500,
    });
  } catch (error) {
    editorError.value =
      error.response?.data?.message ||
      error.message ||
      "Unable to upload thumbnail.";
  } finally {
    uploadingThumbnail.value = false;
  }
}

function removeThumbnail() {
  form.thumbnail = "";
}

/*
|--------------------------------------------------------------------------
| SECTION IMAGE UPLOAD
|--------------------------------------------------------------------------
*/

async function uploadSectionImages(event, sectionIndex) {
  const section = form.post_detail[sectionIndex];

  if (!section) {
    return;
  }

  const files = Array.from(event.files || []);

  if (!files.length) {
    return;
  }

  section.uploading = true;

  editorError.value = "";

  try {
    const urls = [];

    for (const file of files) {
      const url = await uploadOneImage(file, "explore-kohrong/blogs/sections");

      urls.push(url);
    }

    section.images = [...new Set([...section.images, ...urls])];

    toast.add({
      severity: "success",

      summary: "Images Uploaded",

      detail: `${urls.length} image(s) uploaded successfully.`,

      life: 2500,
    });
  } catch (error) {
    editorError.value =
      error.response?.data?.message ||
      error.message ||
      "Unable to upload section images.";
  } finally {
    section.uploading = false;
  }
}

/*
|--------------------------------------------------------------------------
| REMOVE SECTION IMAGE
|--------------------------------------------------------------------------
*/

function removeSectionImage(sectionIndex, imageIndex) {
  form.post_detail[sectionIndex].images.splice(imageIndex, 1);
}

/*
|--------------------------------------------------------------------------
| VALIDATE
|--------------------------------------------------------------------------
*/

function validateForm() {
  editorError.value = "";

  if (!form.title.trim()) {
    editorError.value = "Blog title is required.";

    return false;
  }

  if (!form.thumbnail) {
    editorError.value = "Please upload the blog thumbnail.";

    return false;
  }

  if (!form.post_detail.length) {
    editorError.value = "Please add at least one blog section.";

    return false;
  }

  for (let index = 0; index < form.post_detail.length; index += 1) {
    const section = form.post_detail[index];

    if (!section.sub_title.trim()) {
      editorError.value = `Section ${index + 1} title is required.`;

      return false;
    }

    if (!hasEditorContent(section.text)) {
      editorError.value = `Section ${index + 1} content is required.`;

      return false;
    }
  }

  return true;
}

/*
|--------------------------------------------------------------------------
| PAYLOAD
|--------------------------------------------------------------------------
*/

function buildPayload() {
  return {
    title: form.title.trim(),

    thumbnail: form.thumbnail,

    status: form.status,

    post_detail: form.post_detail.map((section) => ({
      sub_title: section.sub_title.trim(),

      /*
       * HTML string.
       */
      text: sanitizedHtml(section.text),

      images: section.images.filter(Boolean),

      video_url: section.video_url.trim(),
    })),
  };
}

/*
|--------------------------------------------------------------------------
| SAVE
|--------------------------------------------------------------------------
*/

async function saveBlog() {
  if (uploadingThumbnail.value || anySectionUploading.value) {
    editorError.value = "Please wait until all images finish uploading.";

    return;
  }

  if (!validateForm()) {
    return;
  }

  saving.value = true;

  editorError.value = "";

  try {
    const payload = buildPayload();

    if (editingId.value) {
      await api.patch(`/blogs/${editingId.value}`, payload);
    } else {
      await api.post("/blogs", payload);
    }

    toast.add({
      severity: "success",

      summary: editingId.value ? "Blog Updated" : "Blog Created",

      detail: editingId.value
        ? "Blog updated successfully."
        : "Blog created successfully.",

      life: 3000,
    });

    editorVisible.value = false;

    await loadBlogs();
  } catch (error) {
    editorError.value =
      error.response?.data?.message || error.message || "Unable to save blog.";
  } finally {
    saving.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| LOAD
|--------------------------------------------------------------------------
*/

async function loadBlogs() {
  loading.value = true;

  try {
    const response = await api.get("/blogs", {
      params: {
        all: true,
      },
    });

    blogs.value = response.data.blogs || [];
  } catch (error) {
    toast.add({
      severity: "error",

      summary: "Load Failed",

      detail: error.response?.data?.message || "Unable to load blogs.",

      life: 3500,
    });
  } finally {
    loading.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

function confirmDelete(blog) {
  confirm.require({
    header: "Delete Blog",

    message: `Delete "${blog.title}"?`,

    icon: "pi pi-exclamation-triangle",

    rejectProps: {
      label: "Cancel",

      severity: "secondary",

      outlined: true,
    },

    acceptProps: {
      label: "Delete",

      severity: "danger",
    },

    accept: async () => {
      try {
        await api.delete(`/blogs/${blog._id}`);

        toast.add({
          severity: "success",

          summary: "Deleted",

          detail: "Blog deleted successfully.",

          life: 2500,
        });

        await loadBlogs();
      } catch (error) {
        toast.add({
          severity: "error",

          summary: "Delete Failed",

          detail: error.response?.data?.message || "Unable to delete blog.",

          life: 3500,
        });
      }
    },
  });
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

    hour: "2-digit",

    minute: "2-digit",
  }).format(date);
}

/*
|--------------------------------------------------------------------------
| INIT
|--------------------------------------------------------------------------
*/

onMounted(loadBlogs);
</script>

<style scoped>
/*
|--------------------------------------------------------------------------
| RICH BLOG CONTENT
|--------------------------------------------------------------------------
|
| Tailwind removes many default browser
| heading/list styles, so we restore them
| for Quill-generated content.
|
*/

.blog-rich-content {
  color: #334155;
  font-size: 1rem;
  line-height: 1.8;
  overflow-wrap: anywhere;
}

.blog-rich-content :deep(p) {
  margin: 0.8rem 0;
}

.blog-rich-content :deep(h1) {
  margin: 1.5rem 0 0.8rem;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.25;
  color: #0f172a;
}

.blog-rich-content :deep(h2) {
  margin: 1.4rem 0 0.7rem;
  font-size: 1.7rem;
  font-weight: 700;
  line-height: 1.3;
  color: #0f172a;
}

.blog-rich-content :deep(h3) {
  margin: 1.25rem 0 0.6rem;
  font-size: 1.4rem;
  font-weight: 700;
  color: #0f172a;
}

.blog-rich-content :deep(ul) {
  margin: 1rem 0;
  padding-left: 1.6rem;
  list-style: disc;
}

.blog-rich-content :deep(ol) {
  margin: 1rem 0;
  padding-left: 1.6rem;
  list-style: decimal;
}

.blog-rich-content :deep(li) {
  margin: 0.35rem 0;
}

.blog-rich-content :deep(a) {
  color: #0e7490;
  font-weight: 500;
  text-decoration: underline;
}

.blog-rich-content :deep(blockquote) {
  margin: 1.4rem 0;
  padding: 0.8rem 1.2rem;
  border-left: 4px solid #0e7490;
  background: #ecfeff;
  color: #475569;
}

.blog-rich-content :deep(pre) {
  margin: 1rem 0;
  overflow-x: auto;
  border-radius: 0.75rem;
  background: #0f172a;
  padding: 1rem;
  color: white;
}

.blog-rich-content :deep(.ql-align-center) {
  text-align: center;
}

.blog-rich-content :deep(.ql-align-right) {
  text-align: right;
}

.blog-rich-content :deep(.ql-align-justify) {
  text-align: justify;
}

.blog-rich-content :deep(.ql-size-small) {
  font-size: 0.8em;
}

.blog-rich-content :deep(.ql-size-large) {
  font-size: 1.5em;
}

.blog-rich-content :deep(.ql-size-huge) {
  font-size: 2.2em;
}

.blog-rich-content :deep(.ql-font-serif) {
  font-family: Georgia, "Times New Roman", serif;
}

.blog-rich-content :deep(.ql-font-monospace) {
  font-family: Monaco, Consolas, monospace;
}
</style>
