<template>
  <main class="bg-white">
    <!-- ======================================================
         SIMPLE BLOG COVER
    ======================================================= -->

    <section class="relative overflow-hidden border-b border-border">
      <!-- BACKGROUND IMAGE -->
      <div class="absolute inset-0">
        <img
          :src="heroImage"
          alt="Koh Rong"
          class="h-full w-full object-cover object-center"
        />

        <!-- WHITE FADE -->
        <div
          class="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/5"
        />

        <!-- LIGHT OVERLAY -->
        <div class="absolute inset-0 bg-white/5" />
      </div>

      <!-- CONTENT -->
      <div class="page relative z-10 py-7 sm:py-8 lg:py-9">
        <!-- TITLE -->
        <div class="max-w-xl">
          <h1 class="text-2xl font-bold text-heading sm:text-3xl">Blogs</h1>

          <p class="mt-1 text-sm leading-6 text-body sm:text-base">
            Discover amazing experiences and explore the best of Koh Rong.
          </p>
        </div>

        <!-- FEATURES -->
        <div
          class="mt-8 grid gap-4 sm:grid-cols-2 lg:ml-auto lg:mt-8 lg:max-w-3xl lg:grid-cols-4"
        >
          <div
            v-for="feature in features"
            :key="feature.title"
            class="flex items-start gap-2.5"
          >
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center text-primary-600"
            >
              <Icon :icon="feature.icon" class="text-2xl" />
            </div>

            <div>
              <p class="text-sm font-semibold text-heading">
                {{ feature.title }}
              </p>

              <p class="mt-0.5 text-xs leading-5 text-muted">
                {{ feature.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ======================================================
         BLOG LIST
    ======================================================= -->

    <section ref="blogSectionRef" class="page py-10 sm:py-12 lg:py-14">
      <!-- ======================================================
           HEADER
      ======================================================= -->

      <div
        class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600"
          >
            Explore Koh Rong
          </p>

          <h2 class="mt-1 text-2xl font-bold text-heading sm:text-3xl">
            Recent Blogs
          </h2>

          <p class="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">
            Discover travel stories, island guides, local experiences, and
            useful tips for exploring Koh Rong.
          </p>
        </div>

        <!-- RESULT COUNT -->
        <div
          v-if="!loading && blogs.length"
          class="shrink-0 text-sm text-muted"
        >
          Showing

          <span class="font-semibold text-heading">
            {{ startItem }}
          </span>

          –

          <span class="font-semibold text-heading">
            {{ endItem }}
          </span>

          of

          <span class="font-semibold text-heading">
            {{ blogs.length }}
          </span>

          articles
        </div>
      </div>

      <!-- ======================================================
           LOADING
      ======================================================= -->

      <div v-if="loading" class="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="item in itemsPerPage"
          :key="item"
          class="overflow-hidden rounded-2xl border border-border bg-white"
        >
          <div class="h-52 animate-pulse bg-slate-200 sm:h-56" />

          <div class="space-y-3 p-5">
            <div class="h-5 w-4/5 animate-pulse rounded bg-slate-200" />

            <div class="h-4 w-full animate-pulse rounded bg-slate-100" />

            <div class="h-4 w-3/4 animate-pulse rounded bg-slate-100" />

            <div class="h-5 w-24 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      </div>

      <!-- ======================================================
           ERROR
      ======================================================= -->

      <div
        v-else-if="error"
        class="mt-8 rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center"
      >
        <div
          class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-500"
        >
          <Icon icon="ri:error-warning-line" class="text-xl" />
        </div>

        <p class="mt-3 font-semibold text-red-700">Unable to load blogs</p>

        <p class="mt-1 text-sm text-red-600">
          {{ error }}
        </p>

        <button
          type="button"
          class="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
          @click="loadBlogs"
        >
          <Icon icon="ri:refresh-line" class="text-base" />

          Try Again
        </button>
      </div>

      <!-- ======================================================
           BLOG GRID
      ======================================================= -->

      <template v-else-if="blogs.length">
        <div class="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="blog in paginatedBlogs"
            :key="blog._id"
            class="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <!-- ================================================
                 IMAGE
            ================================================= -->

            <RouterLink
              :to="`/blogs/${blog._id}`"
              class="relative block h-52 overflow-hidden bg-slate-100 sm:h-56"
            >
              <img
                v-if="blog.thumbnail"
                :src="blog.thumbnail"
                :alt="blog.title"
                class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />

              <div
                v-else
                class="flex h-full items-center justify-center bg-slate-100"
              >
                <Icon icon="ri:image-line" class="text-4xl text-slate-300" />
              </div>

              <div
                class="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent"
              />
            </RouterLink>

            <!-- ================================================
                 CONTENT
            ================================================= -->

            <div class="flex flex-1 flex-col p-5">
              <!-- META -->

              <div class="flex flex-wrap items-center gap-3 text-xs text-muted">
                <span class="inline-flex items-center gap-1.5">
                  <Icon icon="ri:calendar-line" class="text-primary-600" />

                  {{ formatDate(blog.created_at) }}
                </span>

                <span class="inline-flex items-center gap-1.5">
                  <Icon icon="ri:file-list-3-line" class="text-primary-600" />

                  {{ blog.post_detail?.length || 0 }}

                  {{
                    (blog.post_detail?.length || 0) === 1
                      ? "section"
                      : "sections"
                  }}
                </span>
              </div>

              <!-- TITLE -->

              <RouterLink :to="`/blogs/${blog._id}`" class="mt-3 block">
                <h2
                  class="line-clamp-2 text-lg font-bold leading-7 text-heading transition group-hover:text-primary-600"
                >
                  {{ blog.title }}
                </h2>
              </RouterLink>

              <!-- SUB TITLE -->

              <p
                v-if="firstSectionTitle(blog)"
                class="mt-1 line-clamp-1 text-sm font-medium text-primary-600"
              >
                {{ firstSectionTitle(blog) }}
              </p>

              <!-- DESCRIPTION -->

              <p
                v-if="firstSectionText(blog)"
                class="mt-2 line-clamp-3 text-sm leading-6 text-muted"
              >
                {{ firstSectionText(blog) }}
              </p>

              <div class="flex-1" />

              <!-- READ MORE -->

              <RouterLink
                :to="`/blogs/${blog._id}`"
                class="group/link mt-5 inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary-600 transition hover:text-primary-700"
              >
                Read More

                <Icon
                  icon="ri:arrow-right-line"
                  class="text-base transition group-hover/link:translate-x-1"
                />
              </RouterLink>
            </div>
          </article>
        </div>

        <!-- ======================================================
             PAGINATION
        ======================================================= -->

        <div
          v-if="totalPages > 1"
          class="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-7 sm:flex-row"
        >
          <!-- MOBILE / RESULT INFO -->

          <p class="text-sm text-muted">
            Page

            <span class="font-semibold text-heading">
              {{ currentPage }}
            </span>

            of

            <span class="font-semibold text-heading">
              {{ totalPages }}
            </span>
          </p>

          <!-- PAGINATION BUTTONS -->

          <nav
            class="flex flex-wrap items-center justify-center gap-2"
            aria-label="Blog pagination"
          >
            <!-- PREVIOUS -->

            <button
              type="button"
              class="inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-border bg-white px-3 text-sm font-medium text-body transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-white disabled:hover:text-body"
              :disabled="currentPage === 1"
              @click="previousPage"
            >
              <Icon icon="ri:arrow-left-s-line" class="text-lg" />

              <span class="hidden sm:inline"> Previous </span>
            </button>

            <!-- FIRST PAGE -->

            <button
              v-if="showFirstPage"
              type="button"
              class="flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition"
              :class="pageButtonClass(1)"
              @click="goToPage(1)"
            >
              1
            </button>

            <!-- LEFT DOTS -->

            <span
              v-if="showLeftDots"
              class="flex h-10 min-w-8 items-center justify-center text-sm text-muted"
            >
              ...
            </span>

            <!-- VISIBLE PAGES -->

            <button
              v-for="page in visiblePages"
              :key="page"
              type="button"
              class="flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition"
              :class="pageButtonClass(page)"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>

            <!-- RIGHT DOTS -->

            <span
              v-if="showRightDots"
              class="flex h-10 min-w-8 items-center justify-center text-sm text-muted"
            >
              ...
            </span>

            <!-- LAST PAGE -->

            <button
              v-if="showLastPage"
              type="button"
              class="flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition"
              :class="pageButtonClass(totalPages)"
              @click="goToPage(totalPages)"
            >
              {{ totalPages }}
            </button>

            <!-- NEXT -->

            <button
              type="button"
              class="inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-border bg-white px-3 text-sm font-medium text-body transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-white disabled:hover:text-body"
              :disabled="currentPage === totalPages"
              @click="nextPage"
            >
              <span class="hidden sm:inline"> Next </span>

              <Icon icon="ri:arrow-right-s-line" class="text-lg" />
            </button>
          </nav>
        </div>
      </template>

      <!-- ======================================================
           EMPTY
      ======================================================= -->

      <div
        v-else
        class="mt-8 rounded-2xl bg-surface-soft px-6 py-16 text-center"
      >
        <div
          class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600"
        >
          <Icon icon="ri:article-line" class="text-2xl" />
        </div>

        <h2 class="mt-4 text-lg font-semibold text-heading">No articles yet</h2>

        <p class="mt-2 text-sm text-muted">
          New travel articles will appear here.
        </p>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from "vue";

import { Icon } from "@iconify/vue";

import api from "../../services/api.js";

/*
|--------------------------------------------------------------------------
| HERO IMAGE
|--------------------------------------------------------------------------
*/

const heroImage =
  "https://res.cloudinary.com/dvljcimlz/image/upload/v1788886027/Mask_group_mw8ky8.png";

/*
|--------------------------------------------------------------------------
| COVER FEATURES
|--------------------------------------------------------------------------
*/

const features = [
  {
    title: "Local Guides",

    description: "Expert local knowledge",

    icon: "ri:map-pin-user-line",
  },

  {
    title: "Best Price",

    description: "Affordable & transparent",

    icon: "ri:money-dollar-circle-line",
  },

  {
    title: "Safe & Reliable",

    description: "Your safety is our priority",

    icon: "ri:shield-check-line",
  },

  {
    title: "Island Experience",

    description: "Unforgettable moments",

    icon: "ri:landscape-fill",
  },
];

/*
|--------------------------------------------------------------------------
| STATE
|--------------------------------------------------------------------------
*/

const blogs = ref([]);

const loading = ref(true);

const error = ref("");

const blogSectionRef = ref(null);

/*
|--------------------------------------------------------------------------
| PAGINATION
|--------------------------------------------------------------------------
*/

const itemsPerPage = 6;

const currentPage = ref(1);

/*
|--------------------------------------------------------------------------
| TOTAL PAGES
|--------------------------------------------------------------------------
*/

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(blogs.value.length / itemsPerPage));
});

/*
|--------------------------------------------------------------------------
| PAGINATED BLOGS
|--------------------------------------------------------------------------
*/

const paginatedBlogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;

  const end = start + itemsPerPage;

  return blogs.value.slice(start, end);
});

/*
|--------------------------------------------------------------------------
| START ITEM
|--------------------------------------------------------------------------
*/

const startItem = computed(() => {
  if (!blogs.value.length) {
    return 0;
  }

  return (currentPage.value - 1) * itemsPerPage + 1;
});

/*
|--------------------------------------------------------------------------
| END ITEM
|--------------------------------------------------------------------------
*/

const endItem = computed(() => {
  return Math.min(currentPage.value * itemsPerPage, blogs.value.length);
});

/*
|--------------------------------------------------------------------------
| VISIBLE PAGE NUMBERS
|--------------------------------------------------------------------------
|
| Example:
|
| Page 1:
| 1 2 3 ... 10
|
| Page 5:
| 1 ... 4 5 6 ... 10
|
| Page 10:
| 1 ... 8 9 10
|
*/

const visiblePages = computed(() => {
  const pages = [];

  if (totalPages.value <= 5) {
    for (let page = 1; page <= totalPages.value; page += 1) {
      pages.push(page);
    }

    return pages;
  }

  let start = Math.max(2, currentPage.value - 1);

  let end = Math.min(totalPages.value - 1, currentPage.value + 1);

  if (currentPage.value <= 2) {
    start = 2;
    end = 4;
  }

  if (currentPage.value >= totalPages.value - 1) {
    start = totalPages.value - 3;

    end = totalPages.value - 1;
  }

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  return pages;
});

/*
|--------------------------------------------------------------------------
| SHOW FIRST PAGE
|--------------------------------------------------------------------------
*/

const showFirstPage = computed(() => {
  return totalPages.value > 5;
});

/*
|--------------------------------------------------------------------------
| SHOW LAST PAGE
|--------------------------------------------------------------------------
*/

const showLastPage = computed(() => {
  return totalPages.value > 5;
});

/*
|--------------------------------------------------------------------------
| LEFT DOTS
|--------------------------------------------------------------------------
*/

const showLeftDots = computed(() => {
  return totalPages.value > 5 && currentPage.value > 3;
});

/*
|--------------------------------------------------------------------------
| RIGHT DOTS
|--------------------------------------------------------------------------
*/

const showRightDots = computed(() => {
  return totalPages.value > 5 && currentPage.value < totalPages.value - 2;
});

/*
|--------------------------------------------------------------------------
| PAGE BUTTON CLASS
|--------------------------------------------------------------------------
*/

function pageButtonClass(page) {
  if (currentPage.value === page) {
    return ["border-primary-600", "bg-primary-600", "text-white", "shadow-sm"];
  }

  return [
    "border-border",
    "bg-white",
    "text-body",
    "hover:border-primary-300",
    "hover:bg-primary-50",
    "hover:text-primary-600",
  ];
}

/*
|--------------------------------------------------------------------------
| SCROLL TO BLOGS
|--------------------------------------------------------------------------
*/

async function scrollToBlogs() {
  await nextTick();

  if (blogSectionRef.value) {
    const top =
      blogSectionRef.value.getBoundingClientRect().top + window.scrollY - 20;

    window.scrollTo({
      top,
      behavior: "smooth",
    });
  }
}

/*
|--------------------------------------------------------------------------
| GO TO PAGE
|--------------------------------------------------------------------------
*/

function goToPage(page) {
  const targetPage = Number(page);

  if (
    targetPage < 1 ||
    targetPage > totalPages.value ||
    targetPage === currentPage.value
  ) {
    return;
  }

  currentPage.value = targetPage;

  scrollToBlogs();
}

/*
|--------------------------------------------------------------------------
| PREVIOUS PAGE
|--------------------------------------------------------------------------
*/

function previousPage() {
  if (currentPage.value <= 1) {
    return;
  }

  currentPage.value -= 1;

  scrollToBlogs();
}

/*
|--------------------------------------------------------------------------
| NEXT PAGE
|--------------------------------------------------------------------------
*/

function nextPage() {
  if (currentPage.value >= totalPages.value) {
    return;
  }

  currentPage.value += 1;

  scrollToBlogs();
}

/*
|--------------------------------------------------------------------------
| LOAD BLOGS
|--------------------------------------------------------------------------
*/

async function loadBlogs() {
  loading.value = true;

  error.value = "";

  try {
    const response = await api.get("/blogs");

    const data =
      response.data?.blogs || response.data?.data || response.data || [];

    blogs.value = Array.isArray(data) ? data : [];

    /*
     * Start from page 1
     * every time blogs reload.
     */

    currentPage.value = 1;
  } catch (err) {
    console.error("[BLOG LOAD ERROR]", err);

    error.value = err.response?.data?.message || "Unable to load articles.";

    blogs.value = [];
  } finally {
    loading.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| FIRST SECTION TITLE
|--------------------------------------------------------------------------
*/

function firstSectionTitle(blog) {
  if (!Array.isArray(blog?.post_detail) || !blog.post_detail.length) {
    return "";
  }

  return String(blog.post_detail[0]?.sub_title || "").trim();
}

/*
|--------------------------------------------------------------------------
| FIRST SECTION TEXT
|--------------------------------------------------------------------------
*/

function firstSectionText(blog) {
  if (!Array.isArray(blog?.post_detail) || !blog.post_detail.length) {
    return "";
  }

  const html = String(blog.post_detail[0]?.text || "");

  if (!html) {
    return "";
  }

  const element = document.createElement("div");

  element.innerHTML = html.replace(/&nbsp;/gi, " ");

  return String(element.textContent || element.innerText || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
| KEEP PAGE VALID
|--------------------------------------------------------------------------
|
| Example:
|
| You are on page 3 and blogs are removed,
| leaving only 2 pages.
|
| Automatically move to page 2.
|
*/

watch(totalPages, (value) => {
  if (currentPage.value > value) {
    currentPage.value = value;
  }
});

/*
|--------------------------------------------------------------------------
| INIT
|--------------------------------------------------------------------------
*/

onMounted(loadBlogs);
</script>
