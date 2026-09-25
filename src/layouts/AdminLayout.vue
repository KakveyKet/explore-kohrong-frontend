<template>
  <div class="min-h-screen bg-slate-50">
    <!-- ====================================================== -->
    <!-- MOBILE BACKDROP -->
    <!-- ====================================================== -->

    <div
      v-if="mobileSidebarVisible"
      class="fixed inset-0 z-40 bg-black/40 lg:hidden"
      @click="mobileSidebarVisible = false"
    />

    <!-- ====================================================== -->
    <!-- SIDEBAR -->
    <!-- ====================================================== -->

    <aside
      class="fixed left-0 top-0 z-50 flex h-screen w-[280px] flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0"
      :class="mobileSidebarVisible ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- ==================================================== -->
      <!-- LOGO -->
      <!-- ==================================================== -->

      <div
        class="flex h-20 shrink-0 items-center justify-between border-b border-slate-100 px-5"
      >
        <RouterLink
          to="/admin/dashboard"
          class="flex items-center gap-3"
          @click="mobileSidebarVisible = false"
        >
          <img
            :src="siteConfig.logo"
            alt="Explore Koh Rong"
            class="h-12 w-auto object-contain"
          />

          <div class="hidden sm:block">
            <p class="text-lg font-bold leading-none text-slate-900">
              Explore
              <span class="text-primary-600">Koh Rong</span>
            </p>

            <p class="mt-1 text-xs text-slate-400">Administration</p>
          </div>
        </RouterLink>

        <Button
          icon="pi pi-times"
          text
          rounded
          severity="secondary"
          class="lg:!hidden"
          @click="mobileSidebarVisible = false"
        />
      </div>

      <!-- ==================================================== -->
      <!-- NAVIGATION -->
      <!-- ==================================================== -->

      <div class="flex-1 overflow-y-auto px-3 py-5">
        <!-- OVERVIEW -->

        <p
          class="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400"
        >
          Overview
        </p>

        <nav class="space-y-1">
          <RouterLink
            to="/admin/dashboard"
            :class="navClass('/admin/dashboard')"
            @click="mobileSidebarVisible = false"
          >
            <i class="pi pi-home text-lg" />

            <span>Dashboard</span>
          </RouterLink>
        </nav>

        <!-- MANAGEMENT -->

        <p
          class="mb-2 mt-7 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400"
        >
          Management
        </p>

        <nav class="space-y-1">
          <!-- USERS -->

          <RouterLink
            v-if="canManageUsers"
            to="/admin/users"
            :class="navClass('/admin/users')"
            @click="mobileSidebarVisible = false"
          >
            <i class="pi pi-users text-lg" />

            <span>Users</span>
          </RouterLink>

          <!-- CATEGORIES -->

          <RouterLink
            to="/admin/categories"
            :class="navClass('/admin/categories')"
            @click="mobileSidebarVisible = false"
          >
            <i class="pi pi-tags text-lg" />

            <span>Categories</span>
          </RouterLink>

          <!-- SERVICES -->

          <RouterLink
            to="/admin/services"
            :class="navClass('/admin/services')"
            @click="mobileSidebarVisible = false"
          >
            <i class="pi pi-briefcase text-lg" />

            <span>Services</span>
          </RouterLink>

          <!-- BOOKINGS -->

          <RouterLink
            to="/admin/bookings"
            :class="navClass('/admin/bookings')"
            @click="mobileSidebarVisible = false"
          >
            <i class="pi pi-calendar text-lg" />

            <span>Bookings</span>
          </RouterLink>

          <!-- BLOGS -->

          <RouterLink
            to="/admin/blogs"
            :class="navClass('/admin/blogs')"
            @click="mobileSidebarVisible = false"
          >
            <i class="pi pi-file-edit text-lg" />

            <span>Blogs</span>
          </RouterLink>

          <!-- REPORTS -->

          <RouterLink
            to="/admin/reports"
            :class="navClass('/admin/reports')"
            @click="mobileSidebarVisible = false"
          >
            <i class="pi pi-chart-bar text-lg" />

            <span>Reports</span>
          </RouterLink>
        </nav>

        <!-- ACCOUNT -->

        <p
          class="mb-2 mt-7 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400"
        >
          Account
        </p>

        <nav class="space-y-1">
          <RouterLink
            to="/admin/profile"
            :class="navClass('/admin/profile')"
            @click="mobileSidebarVisible = false"
          >
            <i class="pi pi-user text-lg" />

            <span>My Profile</span>
          </RouterLink>
        </nav>
      </div>

      <!-- ==================================================== -->
      <!-- SIDEBAR PROFILE -->
      <!-- ==================================================== -->

      <div class="shrink-0 border-t border-slate-100 p-3">
        <button
          type="button"
          class="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition hover:bg-slate-50"
          @click="goProfile"
        >
          <!-- PROFILE PHOTO -->

          <div class="relative h-11 w-11 shrink-0">
            <img
              v-if="avatarUrl && !sidebarAvatarFailed"
              :key="avatarUrl"
              :src="avatarUrl"
              :alt="username"
              class="h-11 w-11 rounded-full object-cover ring-2 ring-slate-100"
              @load="sidebarAvatarFailed = false"
              @error="sidebarAvatarFailed = true"
            />

            <Avatar
              v-else
              :label="initials"
              shape="circle"
              class="!h-11 !w-11 !bg-[#0E7490] !font-bold !text-white"
            />

            <span
              v-if="auth.user?.status === 'ACTIVE'"
              class="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"
            />
          </div>

          <!-- USER -->

          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-slate-900">
              {{ username }}
            </p>

            <p class="mt-0.5 truncate text-xs text-slate-500">
              {{ roleLabel }}
            </p>
          </div>

          <i class="pi pi-angle-right text-xs text-slate-400" />
        </button>
      </div>
    </aside>

    <!-- ====================================================== -->
    <!-- MAIN -->
    <!-- ====================================================== -->

    <div class="min-h-screen transition-all duration-300 lg:ml-[280px]">
      <!-- ==================================================== -->
      <!-- TOP NAVIGATION -->
      <!-- ==================================================== -->

      <header
        class="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8"
      >
        <!-- LEFT -->

        <div class="flex items-center gap-3">
          <Button
            icon="pi pi-bars"
            text
            rounded
            severity="secondary"
            class="lg:!hidden"
            @click="mobileSidebarVisible = true"
          />

          <div>
            <p
              class="text-xs font-medium uppercase tracking-wider text-slate-400"
            >
              Administration
            </p>

            <p class="mt-0.5 font-semibold text-slate-800">
              {{ pageTitle }}
            </p>
          </div>
        </div>

        <!-- ================================================== -->
        <!-- TOP PROFILE -->
        <!-- ================================================== -->

        <div ref="profileMenuRef" class="relative">
          <button
            type="button"
            class="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-slate-50"
            @click="profileMenuVisible = !profileMenuVisible"
          >
            <!-- PHOTO -->

            <div class="h-10 w-10 shrink-0">
              <img
                v-if="avatarUrl && !headerAvatarFailed"
                :key="avatarUrl"
                :src="avatarUrl"
                :alt="username"
                class="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100"
                @load="headerAvatarFailed = false"
                @error="headerAvatarFailed = true"
              />

              <Avatar
                v-else
                :label="initials"
                shape="circle"
                class="!h-10 !w-10 !bg-[#0E7490] !font-bold !text-white"
              />
            </div>

            <!-- TEXT -->

            <div class="hidden min-w-0 text-left sm:block">
              <p class="max-w-36 truncate text-sm font-semibold text-slate-900">
                {{ username }}
              </p>

              <p class="mt-0.5 text-xs text-slate-500">
                {{ roleLabel }}
              </p>
            </div>

            <i
              class="pi pi-angle-down hidden text-xs text-slate-400 sm:block"
            />
          </button>

          <!-- ================================================= -->
          <!-- PROFILE DROPDOWN -->
          <!-- ================================================= -->

          <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="translate-y-1 opacity-0"
            enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="translate-y-0 opacity-100"
            leave-to-class="translate-y-1 opacity-0"
          >
            <div
              v-if="profileMenuVisible"
              class="absolute right-0 top-[calc(100%+10px)] w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
            >
              <!-- USER -->

              <div class="border-b border-slate-100 p-4">
                <div class="flex items-center gap-3">
                  <div class="h-12 w-12 shrink-0">
                    <img
                      v-if="avatarUrl && !dropdownAvatarFailed"
                      :key="avatarUrl"
                      :src="avatarUrl"
                      :alt="username"
                      class="h-12 w-12 rounded-full object-cover"
                      @load="dropdownAvatarFailed = false"
                      @error="dropdownAvatarFailed = true"
                    />

                    <Avatar
                      v-else
                      :label="initials"
                      shape="circle"
                      class="!h-12 !w-12 !bg-[#0E7490] !font-bold !text-white"
                    />
                  </div>

                  <div class="min-w-0">
                    <p class="truncate font-semibold text-slate-900">
                      {{ username }}
                    </p>

                    <p class="mt-0.5 truncate text-xs text-slate-500">
                      {{ email }}
                    </p>

                    <Tag :value="roleLabel" severity="info" class="mt-2" />
                  </div>
                </div>
              </div>

              <!-- ACTIONS -->

              <div class="p-2">
                <button
                  type="button"
                  class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                  @click="goProfile"
                >
                  <i class="pi pi-user text-slate-400" />

                  My Profile
                </button>

                <button
                  type="button"
                  class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
                  @click="logout"
                >
                  <i class="pi pi-sign-out" />

                  Logout
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </header>

      <!-- ==================================================== -->
      <!-- PAGE -->
      <!-- ==================================================== -->

      <main class="p-4 sm:p-6 lg:p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

import { RouterLink, RouterView, useRoute, useRouter } from "vue-router";

import Avatar from "primevue/avatar";
import Button from "primevue/button";
import Tag from "primevue/tag";

import { useAuthStore } from "../stores/auth.js";
import { siteConfig } from "../config/site.js";

/*
|--------------------------------------------------------------------------
| ROUTER
|--------------------------------------------------------------------------
*/

const route = useRoute();

const router = useRouter();

/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/

const auth = useAuthStore();

/*
|--------------------------------------------------------------------------
| SIDEBAR
|--------------------------------------------------------------------------
*/

const mobileSidebarVisible = ref(false);

/*
|--------------------------------------------------------------------------
| PROFILE MENU
|--------------------------------------------------------------------------
*/

const profileMenuVisible = ref(false);

const profileMenuRef = ref(null);

/*
|--------------------------------------------------------------------------
| AVATAR ERROR STATES
|--------------------------------------------------------------------------
*/

const sidebarAvatarFailed = ref(false);

const headerAvatarFailed = ref(false);

const dropdownAvatarFailed = ref(false);

/*
|--------------------------------------------------------------------------
| AVATAR
|--------------------------------------------------------------------------
*/

const avatarUrl = computed(() => {
  return auth.user?.avatar || "";
});

/*
|--------------------------------------------------------------------------
| USER
|--------------------------------------------------------------------------
*/

const username = computed(() => {
  return auth.user?.username || auth.user?.email || "Admin";
});

const email = computed(() => {
  return auth.user?.email || "";
});

/*
|--------------------------------------------------------------------------
| INITIALS
|--------------------------------------------------------------------------
*/

const initials = computed(() => {
  const value = String(username.value || "AD").trim();

  const parts = value.split(/\s+/).filter(Boolean);

  if (parts.length > 1) {
    return parts
      .slice(0, 2)
      .map((item) => item.charAt(0).toUpperCase())
      .join("");
  }

  return value.slice(0, 2).toUpperCase();
});

/*
|--------------------------------------------------------------------------
| ROLE
|--------------------------------------------------------------------------
*/

const roleLabel = computed(() => {
  switch (auth.user?.role) {
    case "SUPER_ADMIN":
      return "Super Admin";

    case "ADMIN":
      return "Admin";

    case "STAFF":
      return "Staff";

    default:
      return auth.user?.role || "Admin";
  }
});

/*
|--------------------------------------------------------------------------
| PERMISSION
|--------------------------------------------------------------------------
*/

const canManageUsers = computed(() => {
  return ["SUPER_ADMIN", "ADMIN"].includes(auth.user?.role);
});

/*
|--------------------------------------------------------------------------
| PAGE TITLE
|--------------------------------------------------------------------------
*/

const pageTitle = computed(() => {
  if (route.path.startsWith("/admin/users")) {
    return "Users";
  }

  if (route.path.startsWith("/admin/categories")) {
    return "Categories";
  }

  if (route.path.startsWith("/admin/services")) {
    return "Services";
  }

  if (route.path.startsWith("/admin/bookings")) {
    return "Bookings";
  }

  if (route.path.startsWith("/admin/blogs")) {
    return "Blogs";
  }

  if (route.path.startsWith("/admin/reports")) {
    return "Reports";
  }

  if (route.path.startsWith("/admin/profile")) {
    return "My Profile";
  }

  return "Dashboard";
});

/*
|--------------------------------------------------------------------------
| NAV CLASS
|--------------------------------------------------------------------------
*/

function navClass(path) {
  const active = route.path === path || route.path.startsWith(`${path}/`);

  return [
    "flex",
    "items-center",
    "gap-3",
    "rounded-xl",
    "px-3",
    "py-2.5",
    "text-sm",
    "font-medium",
    "transition",

    active
      ? "bg-cyan-50 text-[#0E7490]"
      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
  ];
}

/*
|--------------------------------------------------------------------------
| LOAD LATEST USER
|--------------------------------------------------------------------------
*/

async function refreshCurrentUser() {
  try {
    if (typeof auth.loadCurrentUser === "function") {
      await auth.loadCurrentUser();
    }
  } catch (error) {
    console.error("[ADMIN USER REFRESH ERROR]", error);
  }
}

/*
|--------------------------------------------------------------------------
| PROFILE
|--------------------------------------------------------------------------
*/

function goProfile() {
  profileMenuVisible.value = false;

  mobileSidebarVisible.value = false;

  router.push("/admin/profile");
}

/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

async function logout() {
  profileMenuVisible.value = false;

  try {
    if (typeof auth.logout === "function") {
      await auth.logout();
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  } finally {
    router.replace("/admin/login");
  }
}

/*
|--------------------------------------------------------------------------
| CLOSE PROFILE DROPDOWN
|--------------------------------------------------------------------------
*/

function handleDocumentClick(event) {
  if (!profileMenuRef.value) {
    return;
  }

  if (!profileMenuRef.value.contains(event.target)) {
    profileMenuVisible.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| WATCH AVATAR
|--------------------------------------------------------------------------
*/

watch(avatarUrl, () => {
  sidebarAvatarFailed.value = false;

  headerAvatarFailed.value = false;

  dropdownAvatarFailed.value = false;
});

/*
|--------------------------------------------------------------------------
| ROUTE
|--------------------------------------------------------------------------
*/

watch(
  () => route.fullPath,
  () => {
    profileMenuVisible.value = false;

    mobileSidebarVisible.value = false;
  },
);

/*
|--------------------------------------------------------------------------
| INIT
|--------------------------------------------------------------------------
*/

onMounted(() => {
  refreshCurrentUser();

  document.addEventListener("click", handleDocumentClick);
});

/*
|--------------------------------------------------------------------------
| DESTROY
|--------------------------------------------------------------------------
*/

onBeforeUnmount(() => {
  document.removeEventListener("click", handleDocumentClick);
});
</script>
