<script setup>
import { computed, onMounted, ref, watch } from "vue";

import { useRoute, useRouter } from "vue-router";

import { useToast } from "primevue/usetoast";

import { Icon } from "@iconify/vue";

import api from "../../services/api.js";

/*
|--------------------------------------------------------------------------
| ROUTER
|--------------------------------------------------------------------------
*/

const route = useRoute();

const router = useRouter();

const toast = useToast();

/*
|--------------------------------------------------------------------------
| BLOG
|--------------------------------------------------------------------------
*/

const blog = ref(null);

const relatedBlogs = ref([]);

const loading = ref(true);

const error = ref("");

/*
|--------------------------------------------------------------------------
| LIGHTBOX
|--------------------------------------------------------------------------
*/

const lightboxOpen = ref(false);

const lightboxImage = ref("");

/*
|--------------------------------------------------------------------------
| COMMENTS
|--------------------------------------------------------------------------
*/

const comments = ref([]);

const commentsLoading = ref(false);

const commentsError = ref("");

const commentSubmitting = ref(false);

const commentTextValue = ref("");

const maxCommentLength = 1000;

/*
|--------------------------------------------------------------------------
| BLOG ID
|--------------------------------------------------------------------------
*/

const blogId = computed(() => {
  return route.params.id || route.params.blogId || "";
});

/*
|--------------------------------------------------------------------------
| BLOG LIST PATH
|--------------------------------------------------------------------------
*/

const blogListPath = computed(() => {
  return route.path.startsWith("/blogs") ? "/blogs" : "/blog";
});

/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/

function isLoggedIn() {
  const token = String(localStorage.getItem("token") || "").trim();

  return Boolean(token);
}

/*
|--------------------------------------------------------------------------
| CURRENT USER
|--------------------------------------------------------------------------
*/

const currentUser = computed(() => {
  try {
    const value = localStorage.getItem("user");

    if (!value) {
      return null;
    }

    return JSON.parse(value);
  } catch {
    return null;
  }
});

const currentUserName = computed(() => {
  const user = currentUser.value;

  if (!user) {
    return "Customer";
  }

  const firstName = String(user.firstName || "").trim();

  const lastName = String(user.lastName || "").trim();

  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || user.username || "Customer";
});

const currentUserInitials = computed(() => {
  const words = currentUserName.value.split(/\s+/).filter(Boolean);

  if (!words.length) {
    return "C";
  }

  if (words.length === 1) {
    return String(words[0][0] || "C").toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
});

const currentUserAvatar = computed(() => {
  return String(currentUser.value?.avatar || "").trim();
});

/*
|--------------------------------------------------------------------------
| NORMALIZE BLOG
|--------------------------------------------------------------------------
*/

function normalizeBlog(response) {
  return response?.data?.blog || response?.data?.data || response?.data || null;
}

function normalizeBlogs(response) {
  const data = response?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.blogs)) {
    return data.blogs;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

function normalizeComments(response) {
  const data = response?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.comments)) {
    return data.comments;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

/*
|--------------------------------------------------------------------------
| TEXT
|--------------------------------------------------------------------------
*/

function plainText(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeEditorHtml(value) {
  let content = String(value || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .trim();

  if (!content) {
    return "";
  }

  const containsHtml = /<\/?[a-z][\s\S]*>/i.test(content);

  if (containsHtml) {
    return content;
  }

  return content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\r?\n/g, "<br />");
}

/*
|--------------------------------------------------------------------------
| DATE
|--------------------------------------------------------------------------
*/

function formatDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatCommentDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
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
| POST DETAILS
|--------------------------------------------------------------------------
*/

const postDetails = computed(() => {
  if (!Array.isArray(blog.value?.post_detail)) {
    return [];
  }

  return blog.value.post_detail;
});

/*
|--------------------------------------------------------------------------
| FEATURED IMAGE
|--------------------------------------------------------------------------
*/

const featuredImage = computed(() => {
  return (
    blog.value?.thumbnail ||
    blog.value?.cover_image ||
    blog.value?.cover ||
    blog.value?.image ||
    postDetails.value?.[0]?.images?.[0] ||
    ""
  );
});

/*
|--------------------------------------------------------------------------
| EXCERPT
|--------------------------------------------------------------------------
*/

const excerpt = computed(() => {
  return (
    blog.value?.excerpt || blog.value?.description || blog.value?.summary || ""
  );
});

/*
|--------------------------------------------------------------------------
| READING TIME
|--------------------------------------------------------------------------
*/

const readingTime = computed(() => {
  let content = plainText(excerpt.value);

  for (const section of postDetails.value) {
    content += ` ${section?.sub_title || ""} ${plainText(section?.text)}`;
  }

  const words = content.split(/\s+/).filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 200));
});

/*
|--------------------------------------------------------------------------
| PUBLISHED DATE
|--------------------------------------------------------------------------
*/

const publishedDate = computed(() => {
  return formatDate(
    blog.value?.published_at || blog.value?.created_at || blog.value?.createdAt,
  );
});

/*
|--------------------------------------------------------------------------
| AUTHOR
|--------------------------------------------------------------------------
*/

const authorName = computed(() => {
  const author = blog.value?.created_by;

  if (author && typeof author === "object") {
    const name = [author.firstName, author.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    return name || author.username || "Explore Koh Rong";
  }

  return blog.value?.author_name || "Explore Koh Rong";
});

/*
|--------------------------------------------------------------------------
| COMMENTS
|--------------------------------------------------------------------------
*/

function commentMessage(comment) {
  return String(comment?.comment || "").trim();
}

function commentUser(comment) {
  const user = comment?.user_id;

  if (user && typeof user === "object") {
    return user;
  }

  return {};
}

function commentAuthor(comment) {
  const user = commentUser(comment);

  const firstName = String(user.firstName || "").trim();

  const lastName = String(user.lastName || "").trim();

  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || user.username || "Customer";
}

function commentAvatar(comment) {
  return String(commentUser(comment).avatar || "").trim();
}

function commentInitials(comment) {
  const words = commentAuthor(comment).split(/\s+/).filter(Boolean);

  if (!words.length) {
    return "C";
  }

  if (words.length === 1) {
    return String(words[0][0] || "C").toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

const commentCount = computed(() => {
  return comments.value.length;
});

const commentCharacterCount = computed(() => {
  return String(commentTextValue.value || "").length;
});

/*
|--------------------------------------------------------------------------
| YOUTUBE
|--------------------------------------------------------------------------
*/

function getYouTubeEmbedUrl(value) {
  if (!value) {
    return "";
  }

  const url = String(value).trim();

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtube.com")) {
      const videoId = parsed.searchParams.get("v");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }

      if (parsed.pathname.startsWith("/embed/")) {
        return url;
      }

      if (parsed.pathname.startsWith("/shorts/")) {
        const id = parsed.pathname.split("/").filter(Boolean)[1];

        if (id) {
          return `https://www.youtube.com/embed/${id}`;
        }
      }
    }

    if (parsed.hostname.includes("youtu.be")) {
      const videoId = parsed.pathname.replace("/", "").trim();

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
  } catch {
    return "";
  }

  return "";
}

/*
|--------------------------------------------------------------------------
| LIGHTBOX
|--------------------------------------------------------------------------
*/

function openLightbox(image) {
  if (!image) {
    return;
  }

  lightboxImage.value = image;

  lightboxOpen.value = true;
}

function closeLightbox() {
  lightboxOpen.value = false;

  lightboxImage.value = "";
}

/*
|--------------------------------------------------------------------------
| OPEN BLOG
|--------------------------------------------------------------------------
*/

function openBlog(item) {
  if (!item?._id) {
    return;
  }

  router.push(`${blogListPath.value}/${item._id}`);
}

/*
|--------------------------------------------------------------------------
| LOAD COMMENTS
|--------------------------------------------------------------------------
*/

async function loadComments() {
  if (!blogId.value) {
    return;
  }

  commentsLoading.value = true;

  commentsError.value = "";

  try {
    const response = await api.get(`/blogs/${blogId.value}/comments`);

    comments.value = normalizeComments(response);
  } catch (err) {
    console.error("[BLOG COMMENTS ERROR]", err);

    comments.value = [];

    commentsError.value =
      err?.response?.data?.message || "Unable to load comments.";
  } finally {
    commentsLoading.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| SUBMIT COMMENT
|--------------------------------------------------------------------------
*/

async function submitComment() {
  if (!isLoggedIn()) {
    toast.add({
      severity: "warn",

      summary: "Account Required",

      detail: "Please create an account or log in before commenting.",

      life: 4000,
    });

    return;
  }

  const message = String(commentTextValue.value || "").trim();

  if (!message) {
    toast.add({
      severity: "warn",

      summary: "Comment Required",

      detail: "Please write a comment.",

      life: 3000,
    });

    return;
  }

  if (message.length > maxCommentLength) {
    toast.add({
      severity: "warn",

      summary: "Comment Too Long",

      detail: `Maximum ${maxCommentLength} characters.`,

      life: 3000,
    });

    return;
  }

  if (!blogId.value || commentSubmitting.value) {
    return;
  }

  commentSubmitting.value = true;

  try {
    const response = await api.post(`/blogs/${blogId.value}/comments`, {
      comment: message,
    });

    commentTextValue.value = "";

    const created = response?.data?.comment;

    if (created?._id) {
      comments.value = [created, ...comments.value];
    } else {
      await loadComments();
    }

    toast.add({
      severity: "success",

      summary: "Comment Added",

      detail: "Your comment has been posted.",

      life: 3000,
    });
  } catch (err) {
    console.error("[SUBMIT COMMENT ERROR]", {
      status: err?.response?.status,

      data: err?.response?.data,

      message: err?.message,
    });

    toast.add({
      severity: "error",

      summary: "Unable to Comment",

      detail:
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Unable to submit your comment.",

      life: 5000,
    });
  } finally {
    commentSubmitting.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| LOAD RELATED BLOGS
|--------------------------------------------------------------------------
*/

async function loadRelatedBlogs() {
  try {
    const response = await api.get("/blogs");

    const allBlogs = normalizeBlogs(response).filter(
      (item) =>
        item?._id &&
        String(item._id) !== String(blog.value?._id) &&
        String(item.status || "ACTIVE").toUpperCase() === "ACTIVE",
    );

    relatedBlogs.value = allBlogs.slice(0, 3);
  } catch (err) {
    console.error("[RELATED BLOG ERROR]", err);

    relatedBlogs.value = [];
  }
}

/*
|--------------------------------------------------------------------------
| LOAD BLOG
|--------------------------------------------------------------------------
*/

async function loadBlog() {
  if (!blogId.value) {
    error.value = "Blog article not found.";

    loading.value = false;

    return;
  }

  loading.value = true;

  error.value = "";

  blog.value = null;

  comments.value = [];

  relatedBlogs.value = [];

  try {
    const response = await api.get(`/blogs/${blogId.value}`);

    const item = normalizeBlog(response);

    if (!item?._id) {
      throw new Error("Blog article not found.");
    }

    blog.value = item;

    await Promise.all([loadComments(), loadRelatedBlogs()]);
  } catch (err) {
    console.error("[LOAD BLOG ERROR]", err);

    error.value =
      err?.response?.data?.message ||
      err?.message ||
      "Unable to load blog article.";
  } finally {
    loading.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| INIT
|--------------------------------------------------------------------------
*/

onMounted(loadBlog);

/*
|--------------------------------------------------------------------------
| WATCH ROUTE
|--------------------------------------------------------------------------
*/

watch(
  () => blogId.value,

  (newId, oldId) => {
    if (newId && newId !== oldId) {
      window.scrollTo({
        top: 0,

        behavior: "smooth",
      });

      loadBlog();
    }
  },
);
</script>

<template>
  <main class="min-h-screen bg-white pb-16">
    <!-- ======================================================
         BREADCRUMB
    ======================================================= -->

    <section class="border-b border-border bg-white">
      <div class="page py-3">
        <nav class="flex flex-wrap items-center gap-1.5 text-xs text-muted">
          <RouterLink to="/" class="transition hover:text-primary-600">
            Home
          </RouterLink>

          <Icon icon="ri:arrow-right-s-line" />

          <RouterLink
            :to="blogListPath"
            class="transition hover:text-primary-600"
          >
            Blog
          </RouterLink>

          <template v-if="blog">
            <Icon icon="ri:arrow-right-s-line" />

            <span class="max-w-[320px] truncate text-heading">
              {{ blog.title }}
            </span>
          </template>
        </nav>
      </div>
    </section>

    <!-- ======================================================
         LOADING
    ======================================================= -->

    <section v-if="loading" class="page py-8">
      <div class="mx-auto max-w-4xl">
        <div class="h-4 w-28 animate-pulse rounded bg-slate-200" />

        <div class="mt-5 h-10 w-full animate-pulse rounded bg-slate-200" />

        <div class="mt-3 h-5 w-4/5 animate-pulse rounded bg-slate-100" />

        <div class="mt-5 h-4 w-64 animate-pulse rounded bg-slate-100" />

        <div class="mt-7 aspect-[16/8] animate-pulse rounded-xl bg-slate-200" />

        <div class="mt-8 space-y-4">
          <div
            v-for="item in 7"
            :key="item"
            class="h-4 animate-pulse rounded bg-slate-100"
          />
        </div>
      </div>
    </section>

    <!-- ======================================================
         ERROR
    ======================================================= -->

    <section v-else-if="error" class="page py-16">
      <div
        class="mx-auto max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center"
      >
        <Icon
          icon="ri:error-warning-line"
          class="mx-auto text-4xl text-red-500"
        />

        <h1 class="mt-4 text-xl font-bold text-heading">
          Unable to load article
        </h1>

        <p class="mt-2 text-sm text-muted">
          {{ error }}
        </p>

        <button
          type="button"
          class="mt-6 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white"
          @click="loadBlog"
        >
          Try Again
        </button>
      </div>
    </section>

    <!-- ======================================================
         BLOG
    ======================================================= -->

    <template v-else-if="blog">
      <!-- ====================================================
           ARTICLE HEADER
      ===================================================== -->

      <section class="page pt-8 sm:pt-10">
        <div class="mx-auto max-w-4xl">
          <!-- LABEL -->

          <p
            class="text-xs font-semibold uppercase tracking-[0.16em] text-primary-600"
          >
            Travel Guide
          </p>

          <!-- TITLE -->

          <h1
            class="mt-3 text-3xl font-bold leading-tight text-heading sm:text-4xl lg:text-[42px]"
          >
            {{ blog.title }}
          </h1>

          <!-- EXCERPT -->

          <p
            v-if="excerpt"
            class="mt-4 max-w-3xl text-base leading-7 text-muted"
          >
            {{ plainText(excerpt) }}
          </p>

          <!-- META -->

          <div
            class="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted sm:text-sm"
          >
            <div class="flex items-center gap-1.5">
              <Icon icon="ri:user-3-line" class="text-primary-600" />

              {{ authorName }}
            </div>

            <span
              v-if="publishedDate"
              class="hidden h-1 w-1 rounded-full bg-slate-300 sm:block"
            />

            <div v-if="publishedDate" class="flex items-center gap-1.5">
              <Icon icon="ri:calendar-line" class="text-primary-600" />

              {{ publishedDate }}
            </div>

            <span class="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />

            <div class="flex items-center gap-1.5">
              <Icon icon="ri:time-line" class="text-primary-600" />

              {{ readingTime }}
              min read
            </div>

            <span class="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />

            <div class="flex items-center gap-1.5">
              <Icon icon="ri:chat-3-line" class="text-primary-600" />

              {{ commentCount }}
              {{ commentCount === 1 ? "comment" : "comments" }}
            </div>
          </div>

          <!-- FEATURED IMAGE -->

          <button
            v-if="featuredImage"
            type="button"
            class="group mt-7 block w-full overflow-hidden rounded-xl bg-slate-100 text-left"
            @click="openLightbox(featuredImage)"
          >
            <img
              :src="featuredImage"
              :alt="blog.title"
              class="aspect-[16/8] w-full object-cover transition duration-500 group-hover:scale-[1.01]"
            />
          </button>
        </div>
      </section>

      <!-- ====================================================
           ARTICLE CONTENT
      ===================================================== -->

      <section class="page pt-8">
        <article class="mx-auto max-w-4xl">
          <!-- INTRO -->

          <div
            v-if="excerpt"
            class="mb-8 border-l-4 border-primary-500 bg-primary-50 px-5 py-4"
          >
            <p class="text-sm leading-7 text-body sm:text-[15px]">
              {{ plainText(excerpt) }}
            </p>
          </div>

          <!-- DETAILS -->

          <div v-if="postDetails.length" class="space-y-10">
            <section
              v-for="(section, sectionIndex) in postDetails"
              :key="section._id || sectionIndex"
            >
              <!-- TITLE -->

              <h2
                v-if="section.sub_title"
                class="text-2xl font-bold leading-tight text-heading"
              >
                {{ section.sub_title }}
              </h2>

              <!-- TEXT -->

              <div
                v-if="section.text"
                class="blog-rich-text"
                :class="section.sub_title ? 'mt-4' : ''"
                v-html="normalizeEditorHtml(section.text)"
              />

              <!-- IMAGES -->

              <div
                v-if="Array.isArray(section.images) && section.images.length"
                class="mt-6"
              >
                <!-- SINGLE IMAGE -->

                <button
                  v-if="section.images.length === 1"
                  type="button"
                  class="group block w-full overflow-hidden rounded-xl bg-slate-100"
                  @click="openLightbox(section.images[0])"
                >
                  <img
                    :src="section.images[0]"
                    :alt="section.sub_title || blog.title"
                    class="aspect-[16/9] w-full object-cover transition duration-500 group-hover:scale-[1.01]"
                  />
                </button>

                <!-- MULTIPLE -->

                <div v-else class="grid gap-3 sm:grid-cols-2">
                  <button
                    v-for="(image, imageIndex) in section.images"
                    :key="`${sectionIndex}-${imageIndex}`"
                    type="button"
                    class="group overflow-hidden rounded-xl bg-slate-100"
                    @click="openLightbox(image)"
                  >
                    <img
                      :src="image"
                      :alt="`${section.sub_title || blog.title} ${
                        imageIndex + 1
                      }`"
                      class="aspect-[4/3] h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                    />
                  </button>
                </div>
              </div>

              <!-- VIDEO -->

              <div v-if="section.video_url" class="mt-6">
                <div
                  v-if="getYouTubeEmbedUrl(section.video_url)"
                  class="aspect-video overflow-hidden rounded-xl bg-slate-950"
                >
                  <iframe
                    :src="getYouTubeEmbedUrl(section.video_url)"
                    class="h-full w-full"
                    title="Blog video"
                    allow="
                      accelerometer;
                      autoplay;
                      clipboard-write;
                      encrypted-media;
                      gyroscope;
                      picture-in-picture;
                    "
                    allowfullscreen
                  />
                </div>

                <a
                  v-else
                  :href="section.video_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-3 rounded-xl border border-border p-4 transition hover:border-primary-300"
                >
                  <div
                    class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white"
                  >
                    <Icon icon="ri:play-fill" />
                  </div>

                  <div>
                    <p class="text-sm font-semibold text-heading">
                      Watch Video
                    </p>

                    <p class="text-xs text-muted">Open video</p>
                  </div>
                </a>
              </div>
            </section>
          </div>

          <!-- EMPTY CONTENT -->

          <div v-else class="py-10 text-center">
            <Icon
              icon="ri:file-text-line"
              class="mx-auto text-4xl text-slate-300"
            />

            <p class="mt-3 text-sm text-muted">
              Article content is not available yet.
            </p>
          </div>
        </article>
      </section>

      <!-- ======================================================
           COMMENTS
      ======================================================= -->

      <section class="page pt-12">
        <div class="mx-auto max-w-4xl border-t border-border pt-8">
          <!-- HEADER -->

          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-xl font-bold text-heading sm:text-2xl">
                Comments
              </h2>

              <span
                class="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-600"
              >
                {{ commentCount }}
              </span>
            </div>

            <p class="mt-1 text-sm text-muted">
              Share your thoughts about this article.
            </p>
          </div>

          <!-- =================================================
               LOGGED IN
          ================================================== -->

          <div v-if="isLoggedIn()" class="mt-6">
            <div class="flex items-start gap-3">
              <!-- AVATAR -->

              <div
                class="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-primary-100"
              >
                <img
                  v-if="currentUserAvatar"
                  :src="currentUserAvatar"
                  :alt="currentUserName"
                  class="h-full w-full object-cover"
                />

                <div
                  v-else
                  class="flex h-full w-full items-center justify-center text-sm font-bold text-primary-700"
                >
                  {{ currentUserInitials }}
                </div>
              </div>

              <!-- FORM -->

              <div class="min-w-0 flex-1">
                <p class="mb-2 text-sm font-semibold text-heading">
                  {{ currentUserName }}
                </p>

                <textarea
                  v-model="commentTextValue"
                  :maxlength="maxCommentLength"
                  rows="4"
                  class="w-full resize-none rounded-xl border border-border bg-white px-4 py-3 text-sm text-body outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                  placeholder="Write a comment..."
                />

                <div class="mt-2 flex items-center justify-between gap-3">
                  <p
                    class="text-xs"
                    :class="
                      commentCharacterCount >= maxCommentLength
                        ? 'text-red-500'
                        : 'text-muted'
                    "
                  >
                    {{ commentCharacterCount }}
                    /
                    {{ maxCommentLength }}
                  </p>

                  <button
                    type="button"
                    class="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="
                      commentSubmitting || !String(commentTextValue).trim()
                    "
                    @click="submitComment"
                  >
                    <Icon
                      v-if="commentSubmitting"
                      icon="ri:loader-4-line"
                      class="animate-spin"
                    />

                    <Icon v-else icon="ri:send-plane-2-line" />

                    {{ commentSubmitting ? "Posting..." : "Post Comment" }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- =================================================
               NOT LOGGED IN
          ================================================== -->

          <div v-else class="mt-6 rounded-xl bg-surface-soft p-5">
            <div class="flex items-start gap-3">
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-primary-600"
              >
                <Icon icon="ri:user-line" class="text-xl" />
              </div>

              <div>
                <p class="text-sm font-semibold text-heading">
                  Want to leave a comment?
                </p>

                <p class="mt-1 text-xs leading-5 text-muted">
                  Please create an account or log in before commenting.
                </p>
              </div>
            </div>
          </div>

          <!-- ERROR -->

          <div
            v-if="commentsError"
            class="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <Icon icon="ri:error-warning-line" class="mt-0.5 shrink-0" />

            {{ commentsError }}
          </div>

          <!-- COMMENT LOADING -->

          <div v-if="commentsLoading" class="mt-7 space-y-5">
            <div v-for="item in 3" :key="item" class="flex gap-3">
              <div
                class="h-10 w-10 shrink-0 animate-pulse rounded-full bg-slate-200"
              />

              <div class="flex-1">
                <div class="h-4 w-32 animate-pulse rounded bg-slate-200" />

                <div
                  class="mt-3 h-4 w-full animate-pulse rounded bg-slate-100"
                />

                <div
                  class="mt-2 h-4 w-4/5 animate-pulse rounded bg-slate-100"
                />
              </div>
            </div>
          </div>

          <!-- COMMENTS -->

          <div v-else-if="comments.length" class="mt-7 divide-y divide-border">
            <article
              v-for="comment in comments"
              :key="comment._id"
              class="flex gap-3 py-5 first:pt-0"
            >
              <!-- AVATAR -->

              <div
                class="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-primary-50"
              >
                <img
                  v-if="commentAvatar(comment)"
                  :src="commentAvatar(comment)"
                  :alt="commentAuthor(comment)"
                  class="h-full w-full object-cover"
                />

                <div
                  v-else
                  class="flex h-full w-full items-center justify-center text-sm font-bold text-primary-600"
                >
                  {{ commentInitials(comment) }}
                </div>
              </div>

              <!-- CONTENT -->

              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p class="text-sm font-semibold text-heading">
                    {{ commentAuthor(comment) }}
                  </p>

                  <span class="text-xs text-muted">
                    {{
                      formatCommentDate(comment.created_at || comment.createdAt)
                    }}
                  </span>
                </div>

                <p
                  class="mt-2 whitespace-pre-line break-words text-sm leading-6 text-body"
                >
                  {{ commentMessage(comment) }}
                </p>
              </div>
            </article>
          </div>

          <!-- EMPTY -->

          <div
            v-else
            class="mt-7 rounded-xl bg-surface-soft px-5 py-8 text-center"
          >
            <Icon
              icon="ri:chat-smile-2-line"
              class="mx-auto text-3xl text-primary-600"
            />

            <h3 class="mt-2 font-semibold text-heading">No comments yet</h3>

            <p class="mt-1 text-sm text-muted">
              Be the first to share your thoughts.
            </p>
          </div>
        </div>
      </section>

      <!-- ======================================================
           RELATED ARTICLES
      ======================================================= -->

      <section v-if="relatedBlogs.length" class="page pt-14">
        <div class="mx-auto max-w-6xl border-t border-border pt-8">
          <!-- HEADER -->

          <div class="flex items-end justify-between gap-4">
            <div>
              <p
                class="text-xs font-semibold uppercase tracking-[0.16em] text-primary-600"
              >
                Keep Exploring
              </p>

              <h2 class="mt-1 text-2xl font-bold text-heading">
                Related Articles
              </h2>
            </div>

            <RouterLink
              :to="blogListPath"
              class="hidden items-center gap-1 text-sm font-semibold text-primary-600 transition hover:text-primary-700 sm:flex"
            >
              View All

              <Icon icon="ri:arrow-right-line" />
            </RouterLink>
          </div>

          <!-- ARTICLES -->

          <div class="mt-6 grid gap-5 md:grid-cols-3">
            <article
              v-for="item in relatedBlogs"
              :key="item._id"
              class="group overflow-hidden rounded-xl border border-border bg-white transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <!-- IMAGE -->

              <button
                type="button"
                class="block aspect-[16/10] w-full overflow-hidden bg-slate-100"
                @click="openBlog(item)"
              >
                <img
                  v-if="
                    item.thumbnail ||
                    item.cover_image ||
                    item.image ||
                    item.post_detail?.[0]?.images?.[0]
                  "
                  :src="
                    item.thumbnail ||
                    item.cover_image ||
                    item.image ||
                    item.post_detail?.[0]?.images?.[0]
                  "
                  :alt="item.title"
                  class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

                <div v-else class="flex h-full items-center justify-center">
                  <Icon icon="ri:image-line" class="text-4xl text-slate-300" />
                </div>
              </button>

              <!-- CONTENT -->

              <div class="p-4">
                <p class="text-xs text-muted">
                  {{
                    formatDate(item.created_at || item.createdAt) ||
                    "Travel Guide"
                  }}
                </p>

                <button
                  type="button"
                  class="mt-2 block w-full text-left"
                  @click="openBlog(item)"
                >
                  <h3
                    class="line-clamp-2 text-base font-semibold leading-6 text-heading transition group-hover:text-primary-600"
                  >
                    {{ item.title }}
                  </h3>
                </button>

                <p class="mt-2 line-clamp-2 text-sm leading-5 text-muted">
                  {{
                    plainText(
                      item.excerpt ||
                        item.description ||
                        item.post_detail?.[0]?.text ||
                        "",
                    )
                  }}
                </p>

                <button
                  type="button"
                  class="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-600"
                  @click="openBlog(item)"
                >
                  Read Article

                  <Icon icon="ri:arrow-right-line" />
                </button>
              </div>
            </article>
          </div>

          <!-- MOBILE -->

          <div class="mt-6 text-center sm:hidden">
            <RouterLink
              :to="blogListPath"
              class="inline-flex items-center gap-2 rounded-lg border border-primary-600 px-5 py-2.5 text-sm font-semibold text-primary-600"
            >
              View All Articles

              <Icon icon="ri:arrow-right-line" />
            </RouterLink>
          </div>
        </div>
      </section>

      <!-- ======================================================
           LIGHTBOX
      ======================================================= -->

      <Teleport to="body">
        <div
          v-if="lightboxOpen"
          class="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/95 p-4"
          @click.self="closeLightbox"
        >
          <button
            type="button"
            class="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Close image"
            @click="closeLightbox"
          >
            <Icon icon="ri:close-line" class="text-2xl" />
          </button>

          <img
            v-if="lightboxImage"
            :src="lightboxImage"
            :alt="blog.title"
            class="max-h-[88vh] max-w-[92vw] rounded-xl object-contain"
          />
        </div>
      </Teleport>
    </template>
  </main>
</template>

<style scoped>
/*
|--------------------------------------------------------------------------
| BLOG RICH TEXT
|--------------------------------------------------------------------------
*/

.blog-rich-text {
  color: #334155;
  font-size: 1rem;
  line-height: 1.9;
  overflow-wrap: break-word;
}

/*
|--------------------------------------------------------------------------
| PARAGRAPH
|--------------------------------------------------------------------------
*/

.blog-rich-text :deep(p) {
  margin: 0 0 1.25rem;
  line-height: 1.9;
}

.blog-rich-text :deep(p:last-child) {
  margin-bottom: 0;
}

/*
|--------------------------------------------------------------------------
| HEADINGS
|--------------------------------------------------------------------------
*/

.blog-rich-text :deep(h1),
.blog-rich-text :deep(h2),
.blog-rich-text :deep(h3),
.blog-rich-text :deep(h4),
.blog-rich-text :deep(h5),
.blog-rich-text :deep(h6) {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-family: Poppins, sans-serif;
  font-weight: 700;
  line-height: 1.35;
  color: #0f172a;
}

.blog-rich-text :deep(h1) {
  font-size: 2rem;
}

.blog-rich-text :deep(h2) {
  font-size: 1.625rem;
}

.blog-rich-text :deep(h3) {
  font-size: 1.3rem;
}

.blog-rich-text :deep(h4) {
  font-size: 1.1rem;
}

/*
|--------------------------------------------------------------------------
| STRONG
|--------------------------------------------------------------------------
*/

.blog-rich-text :deep(strong),
.blog-rich-text :deep(b) {
  font-weight: 700;
  color: #0f172a;
}

/*
|--------------------------------------------------------------------------
| ITALIC
|--------------------------------------------------------------------------
*/

.blog-rich-text :deep(em),
.blog-rich-text :deep(i) {
  font-style: italic;
}

/*
|--------------------------------------------------------------------------
| LIST
|--------------------------------------------------------------------------
*/

.blog-rich-text :deep(ul),
.blog-rich-text :deep(ol) {
  margin-top: 1rem;
  margin-bottom: 1.5rem;
  padding-left: 1.6rem;
}

.blog-rich-text :deep(ul) {
  list-style-type: disc;
}

.blog-rich-text :deep(ol) {
  list-style-type: decimal;
}

.blog-rich-text :deep(li) {
  margin-bottom: 0.7rem;
  padding-left: 0.25rem;
  line-height: 1.75;
}

.blog-rich-text :deep(li::marker) {
  color: #1675e3;
}

/*
|--------------------------------------------------------------------------
| LINK
|--------------------------------------------------------------------------
*/

.blog-rich-text :deep(a) {
  color: #1675e3;
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.blog-rich-text :deep(a:hover) {
  color: #125cbd;
}

/*
|--------------------------------------------------------------------------
| BLOCKQUOTE
|--------------------------------------------------------------------------
*/

.blog-rich-text :deep(blockquote) {
  margin: 1.75rem 0;
  border-left: 4px solid #1675e3;
  background: #eff8ff;
  padding: 1rem 1.25rem;
  color: #334155;
}

/*
|--------------------------------------------------------------------------
| IMAGE
|--------------------------------------------------------------------------
*/

.blog-rich-text :deep(img) {
  display: block;
  width: 100%;
  height: auto;
  margin: 1.75rem auto;
  border-radius: 0.75rem;
}

/*
|--------------------------------------------------------------------------
| HR
|--------------------------------------------------------------------------
*/

.blog-rich-text :deep(hr) {
  margin: 2rem 0;
  border: 0;
  border-top: 1px solid #e2e8f0;
}

/*
|--------------------------------------------------------------------------
| CODE
|--------------------------------------------------------------------------
*/

.blog-rich-text :deep(code) {
  border-radius: 0.35rem;
  background: #f1f5f9;
  padding: 0.15rem 0.35rem;
  color: #0f172a;
  font-size: 0.9em;
}

.blog-rich-text :deep(pre) {
  margin: 1.5rem 0;
  overflow-x: auto;
  border-radius: 0.75rem;
  background: #0f172a;
  padding: 1rem 1.25rem;
  color: #f8fafc;
}

.blog-rich-text :deep(pre code) {
  background: transparent;
  padding: 0;
  color: inherit;
}

/*
|--------------------------------------------------------------------------
| TABLE
|--------------------------------------------------------------------------
*/

.blog-rich-text :deep(table) {
  width: 100%;
  margin: 1.75rem 0;
  border-collapse: collapse;
}

.blog-rich-text :deep(th),
.blog-rich-text :deep(td) {
  border: 1px solid #e2e8f0;
  padding: 0.8rem 1rem;
  text-align: left;
}

.blog-rich-text :deep(th) {
  background: #f8fafc;
  font-weight: 600;
  color: #0f172a;
}

/*
|--------------------------------------------------------------------------
| MOBILE
|--------------------------------------------------------------------------
*/

@media (max-width: 640px) {
  .blog-rich-text {
    font-size: 0.9375rem;
    line-height: 1.8;
  }

  .blog-rich-text :deep(h1) {
    font-size: 1.6rem;
  }

  .blog-rich-text :deep(h2) {
    font-size: 1.4rem;
  }

  .blog-rich-text :deep(h3) {
    font-size: 1.2rem;
  }

  .blog-rich-text :deep(table) {
    display: block;
    overflow-x: auto;
  }
}
</style>
