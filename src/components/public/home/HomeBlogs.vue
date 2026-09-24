<template>
  <section class="bg-white py-6 sm:py-8 lg:py-10">
    <div class="page">
      <!-- ======================================================
           HEADER
      ======================================================= -->

      <div class="flex items-center justify-between gap-4">
        <h2 class="text-xl font-bold text-heading sm:text-2xl">Recent Blogs</h2>

        <RouterLink
          to="/blogs"
          class="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-5 py-2.5 text-sm font-semibold text-primary-600 transition duration-200 hover:border-primary-300 hover:bg-primary-100 hover:text-primary-700"
        >
          View All Posts

          <i class="pi pi-arrow-right text-xs" />
        </RouterLink>
      </div>

      <!-- ======================================================
           LOADING
      ======================================================= -->

      <div v-if="loading" class="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="item in 3"
          :key="item"
          class="overflow-hidden rounded-2xl border border-border bg-white"
        >
          <div class="h-52 animate-pulse bg-slate-200 sm:h-56" />

          <div class="space-y-3 p-4">
            <div class="h-5 w-4/5 animate-pulse rounded bg-slate-200" />

            <div class="h-4 w-full animate-pulse rounded bg-slate-100" />

            <div class="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      </div>

      <!-- ======================================================
           BLOGS
      ======================================================= -->

      <div
        v-else-if="recentBlogs.length"
        class="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
      >
        <article
          v-for="blog in recentBlogs"
          :key="blog._id"
          class="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white transition duration-300 hover:-translate-y-1 hover:shadow-soft"
        >
          <!-- ==================================================
               IMAGE
          =================================================== -->

          <RouterLink
            :to="`/blogs/${blog._id}`"
            class="block h-52 overflow-hidden bg-slate-100 sm:h-56"
          >
            <img
              v-if="blog.thumbnail"
              :src="blog.thumbnail"
              :alt="blog.title"
              class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />

            <div v-else class="flex h-full items-center justify-center">
              <i class="pi pi-image text-4xl text-slate-300" />
            </div>
          </RouterLink>

          <!-- ==================================================
               CONTENT
          =================================================== -->

          <div class="flex flex-1 flex-col p-4">
            <!-- TITLE -->

            <RouterLink :to="`/blogs/${blog._id}`">
              <h3
                class="line-clamp-2 text-lg font-semibold leading-6 text-heading transition hover:text-primary-600"
              >
                {{ blog.title }}
              </h3>
            </RouterLink>

            <!-- PREVIEW -->

            <p
              v-if="firstSectionText(blog)"
              class="mt-2 line-clamp-3 text-sm leading-5 text-black"
            >
              {{ firstSectionText(blog) }}
            </p>

            <!-- PUSH BUTTON DOWN -->

            <div class="flex-1" />

            <!-- READ MORE -->

            <RouterLink
              :to="`/blogs/${blog._id}`"
              class="group/link mt-4 inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary-600 transition hover:text-primary-700"
            >
              Read More

              <i
                class="pi pi-chevron-right text-xs transition duration-200 group-hover/link:translate-x-1"
              />
            </RouterLink>
          </div>
        </article>
      </div>

      <!-- ======================================================
           EMPTY
      ======================================================= -->

      <div v-else class="py-12 text-center text-black">
        <i class="pi pi-file text-3xl text-slate-300" />

        <p class="mt-3 text-sm text-black">No blog posts available yet.</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";

import api from "../../../services/api.js";

/*
|--------------------------------------------------------------------------
| STATE
|--------------------------------------------------------------------------
*/

const blogs = ref([]);

const loading = ref(true);

/*
|--------------------------------------------------------------------------
| RECENT 3 POSTS
|--------------------------------------------------------------------------
*/

const recentBlogs = computed(() => {
  return [...blogs.value]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3);
});

/*
|--------------------------------------------------------------------------
| LOAD BLOGS
|--------------------------------------------------------------------------
*/

async function loadBlogs() {
  loading.value = true;

  try {
    const response = await api.get("/blogs");

    blogs.value = response.data?.blogs || [];
  } catch (error) {
    console.error("[HOME BLOG ERROR]", error);

    blogs.value = [];
  } finally {
    loading.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| BLOG PREVIEW TEXT
|--------------------------------------------------------------------------
|
| post_detail[].text contains rich HTML.
| We only show plain text on the Home card.
|
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

  element.innerHTML = html;

  const text = String(element.textContent || element.innerText || "")
    .replace(/\s+/g, " ")
    .trim();

  /*
   * Keep Home card preview short.
   */

  const maxLength = 150;

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trim()}...`;
}

/*
|--------------------------------------------------------------------------
| INIT
|--------------------------------------------------------------------------
*/

onMounted(loadBlogs);
</script>
