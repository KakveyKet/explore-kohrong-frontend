<template>
  <header class="sticky top-0 z-50 w-full bg-white shadow-sm">
    <!-- ======================================================
         TOP BAR
    ======================================================= -->

    <div class="bg-primary-500 text-white">
      <div class="page flex min-h-9 items-center justify-between gap-4 py-2">
        <!-- CONTACT -->

        <div class="flex items-center gap-2 text-xs font-medium sm:text-sm">
          <Icon icon="lucide:phone" class="h-4 w-4 shrink-0" />

          <!-- DESKTOP -->

          <a
            :href="phoneUrl"
            class="hidden transition hover:text-white/80 sm:inline"
          >
            {{ phoneDisplay }}
          </a>

          <!-- MOBILE -->

          <a :href="phoneUrl" class="transition hover:text-white/80 sm:hidden">
            {{ phoneDisplay }}
          </a>
        </div>

        <!-- ==================================================
             SOCIAL
        =================================================== -->

        <div class="flex items-center gap-3">
          <!-- FACEBOOK -->

          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            class="flex items-center justify-center text-white transition duration-200 hover:text-secondary-200"
          >
            <Icon icon="ri:facebook-circle-fill" class="h-[18px] w-[18px]" />
          </a>

          <!-- TELEGRAM -->

          <a
            :href="telegramUrl"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram"
            class="flex items-center justify-center text-white transition duration-200 hover:text-secondary-200"
          >
            <Icon icon="ri:telegram-2-fill" class="h-[18px] w-[18px]" />
          </a>

          <!-- INSTAGRAM -->

          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            class="flex items-center justify-center text-white transition duration-200 hover:text-secondary-200"
          >
            <Icon icon="ri:instagram-fill" class="h-[18px] w-[18px]" />
          </a>

          <!-- WHATSAPP -->

          <a
            :href="whatsAppUrl"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            class="flex items-center justify-center text-white transition duration-200 hover:text-secondary-200"
          >
            <Icon icon="ri:whatsapp-fill" class="h-[18px] w-[18px]" />
          </a>
        </div>
      </div>
    </div>

    <!-- ======================================================
         MAIN NAVIGATION
    ======================================================= -->

    <div class="border-b border-border bg-white">
      <div class="page flex h-20 items-center justify-between lg:h-24">
        <!-- ==================================================
             LOGO
        =================================================== -->

        <RouterLink
          to="/"
          class="flex shrink-0 items-center gap-3"
          aria-label="Explore Koh Rong Home"
        >
          <img
            :src="siteConfig.logo"
            alt="Explore Koh Rong"
            class="size-24 object-contain"
          />
        </RouterLink>

        <!-- ==================================================
             DESKTOP NAVIGATION
        =================================================== -->

        <nav class="hidden items-center gap-1 lg:flex">
          <RouterLink
            v-for="item in navItems"
            :key="item.label"
            :to="item.to"
            :class="desktopNavClass(item.to)"
          >
            {{ item.label }}
          </RouterLink>

          <!-- ==================================================
               CUSTOMER LOGGED IN
          =================================================== -->

          <template v-if="isCustomerLoggedIn">
            <!-- MY BOOKINGS -->

            <RouterLink
              to="/my-bookings"
              class="ml-3 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-2.5 text-sm font-semibold text-primary-600 transition duration-200 hover:border-primary-300 hover:bg-primary-100"
            >
              <Icon icon="lucide:calendar-days" class="h-4 w-4" />

              My Bookings
            </RouterLink>

            <!-- ==================================================
                 ACCOUNT
            =================================================== -->

            <div ref="accountMenuRef" class="relative ml-2">
              <!-- ACCOUNT BUTTON -->

              <button
                type="button"
                class="flex max-w-[190px] items-center gap-2 rounded-full bg-primary-500 py-1.5 pl-1.5 pr-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-primary-600"
                :aria-expanded="accountMenuOpen"
                aria-label="Open account menu"
                @click.stop="toggleAccountMenu"
              >
                <!-- INITIAL -->

                <div
                  class="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/30 bg-white/20 text-xs font-bold text-white"
                >
                  {{ customerInitials }}
                </div>

                <!-- USERNAME -->

                <span class="max-w-[90px] truncate">
                  {{ customerName }}
                </span>

                <!-- CHEVRON -->

                <Icon
                  icon="lucide:chevron-down"
                  class="h-3.5 w-3.5 shrink-0 transition duration-200"
                  :class="{
                    'rotate-180': accountMenuOpen,
                  }"
                />
              </button>

              <!-- ==================================================
                   ACCOUNT DROPDOWN
              =================================================== -->

              <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="translate-y-1 opacity-0"
                enter-to-class="translate-y-0 opacity-100"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="translate-y-0 opacity-100"
                leave-to-class="translate-y-1 opacity-0"
              >
                <div
                  v-if="accountMenuOpen"
                  class="absolute right-0 top-[calc(100%+10px)] w-60 overflow-hidden rounded-2xl border border-border bg-white p-2 shadow-xl"
                >
                  <!-- ==================================================
                       USER INFO
                  =================================================== -->

                  <div
                    class="flex items-center gap-3 border-b border-slate-100 px-3 pb-3 pt-2"
                  >
                    <div
                      class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-500 text-xs font-bold text-white"
                    >
                      {{ customerInitials }}
                    </div>

                    <div class="min-w-0">
                      <p class="truncate text-sm font-semibold text-heading">
                        {{ customerName }}
                      </p>

                      <p class="mt-0.5 truncate text-xs text-black">
                        {{ customerEmail || "Customer account" }}
                      </p>
                    </div>
                  </div>

                  <!-- ==================================================
                       PROFILE
                  =================================================== -->

                  <RouterLink
                    to="/profile"
                    class="account-link mt-1"
                    @click="accountMenuOpen = false"
                  >
                    <div
                      class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-600"
                    >
                      <Icon icon="lucide:user-round" class="h-4 w-4" />
                    </div>

                    <span>My Profile</span>
                  </RouterLink>

                  <!-- ==================================================
                       BOOKINGS
                  =================================================== -->

                  <RouterLink
                    to="/my-bookings"
                    class="account-link"
                    @click="accountMenuOpen = false"
                  >
                    <div
                      class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-600"
                    >
                      <Icon icon="lucide:calendar-days" class="h-4 w-4" />
                    </div>

                    <span>My Bookings</span>
                  </RouterLink>

                  <!-- ==================================================
                       LOGOUT
                  =================================================== -->

                  <div class="mt-1 border-t border-slate-100 pt-1">
                    <button
                      type="button"
                      class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition duration-200 hover:bg-red-50"
                      @click="logout"
                    >
                      <div
                        class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-red-50"
                      >
                        <Icon icon="lucide:log-out" class="h-4 w-4" />
                      </div>

                      Logout
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
          </template>

          <!-- ==================================================
               NOT LOGGED IN
          =================================================== -->

          <button
            v-else
            type="button"
            class="ml-3 inline-flex items-center justify-center gap-2 rounded-full bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-primary-600 hover:shadow-md"
            @click="openAuthDialog"
          >
            <Icon icon="lucide:user-round" class="h-4 w-4" />

            Login
          </button>
        </nav>

        <!-- ==================================================
             MOBILE BUTTON
        =================================================== -->

        <button
          type="button"
          class="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-white text-heading transition duration-200 hover:bg-primary-50 hover:text-primary-600 lg:hidden"
          :aria-expanded="mobileOpen"
          aria-label="Open navigation"
          @click="mobileOpen = !mobileOpen"
        >
          <Icon
            :icon="mobileOpen ? 'lucide:x' : 'lucide:menu'"
            class="h-6 w-6"
          />
        </button>
      </div>
    </div>

    <!-- ======================================================
         MOBILE MENU
    ======================================================= -->

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="-translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="-translate-y-2 opacity-0"
    >
      <div
        v-if="mobileOpen"
        class="border-b border-border bg-white shadow-lg lg:hidden"
      >
        <div class="page py-4">
          <!-- ==================================================
               NAVIGATION
          =================================================== -->

          <nav class="space-y-1">
            <RouterLink
              v-for="item in navItems"
              :key="item.label"
              :to="item.to"
              :class="mobileNavClass(item.to)"
              @click="closeMenu"
            >
              <span>
                {{ item.label }}
              </span>

              <Icon icon="lucide:chevron-right" class="h-4 w-4" />
            </RouterLink>
          </nav>

          <!-- ==================================================
               MOBILE CUSTOMER
          =================================================== -->

          <div
            v-if="isCustomerLoggedIn"
            class="mt-4 border-t border-border pt-4"
          >
            <!-- USER -->

            <RouterLink
              to="/profile"
              class="flex items-center gap-3 rounded-2xl bg-primary-50 p-3 transition duration-200 hover:bg-primary-100"
              @click="closeMenu"
            >
              <!-- INITIALS -->

              <div
                class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary-500 text-sm font-bold text-white"
              >
                {{ customerInitials }}
              </div>

              <!-- INFO -->

              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-heading">
                  {{ customerName }}
                </p>

                <p class="mt-0.5 truncate text-xs text-black">
                  {{ customerEmail || "Customer account" }}
                </p>
              </div>

              <Icon
                icon="lucide:chevron-right"
                class="h-4 w-4 shrink-0 text-primary-500"
              />
            </RouterLink>

            <!-- ==================================================
                 PROFILE / BOOKING
            =================================================== -->

            <div class="mt-3 grid grid-cols-2 gap-2">
              <!-- PROFILE -->

              <RouterLink
                to="/profile"
                class="flex items-center justify-center gap-2 rounded-xl border border-primary-200 px-3 py-2.5 text-xs font-semibold text-primary-600 transition duration-200 hover:bg-primary-50"
                @click="closeMenu"
              >
                <Icon icon="lucide:user-round" class="h-4 w-4" />

                My Profile
              </RouterLink>

              <!-- BOOKING -->

              <RouterLink
                to="/my-bookings"
                class="flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-3 py-2.5 text-xs font-semibold text-white transition duration-200 hover:bg-primary-600"
                @click="closeMenu"
              >
                <Icon icon="lucide:calendar-days" class="h-4 w-4" />

                My Bookings
              </RouterLink>
            </div>

            <!-- ==================================================
                 LOGOUT
            =================================================== -->

            <button
              type="button"
              class="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition duration-200 hover:bg-red-50"
              @click="logout"
            >
              <Icon icon="lucide:log-out" class="h-4 w-4" />

              Logout
            </button>
          </div>

          <!-- ==================================================
               MOBILE LOGIN
          =================================================== -->

          <button
            v-else
            type="button"
            class="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-primary-600"
            @click="openMobileAuthDialog"
          >
            <Icon icon="lucide:user-round" class="h-4 w-4" />

            Login
          </button>

          <!-- ==================================================
               CONTACT
          =================================================== -->

          <div class="mt-5 border-t border-border pt-4">
            <p
              class="text-xs font-semibold uppercase tracking-wider text-black"
            >
              Contact
            </p>

            <div class="mt-3 space-y-3">
              <!-- PHONE -->

              <a
                :href="phoneUrl"
                class="flex items-center gap-2 text-sm font-medium text-primary-600"
              >
                <Icon icon="lucide:phone" class="h-4 w-4" />

                {{ phoneDisplay }}
              </a>

              <!-- EMAIL -->

              <a
                :href="emailUrl"
                class="flex items-center gap-2 break-all text-sm font-medium text-primary-600"
              >
                <Icon icon="lucide:mail" class="h-4 w-4 shrink-0" />

                {{ businessEmail }}
              </a>

              <!-- TELEGRAM -->

              <a
                :href="telegramUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-2 text-sm font-medium text-primary-600"
              >
                <Icon icon="ri:telegram-2-fill" class="h-4 w-4" />

                @norea_yem
              </a>

              <!-- WHATSAPP -->

              <a
                :href="whatsAppUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-2 text-sm font-medium text-primary-600"
              >
                <Icon icon="ri:whatsapp-fill" class="h-4 w-4" />

                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ======================================================
         AUTH DIALOG
    ======================================================= -->

    <CustomerAuthDialog v-model="authDialogVisible" />
  </header>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

import { useRoute, useRouter } from "vue-router";

import { Icon } from "@iconify/vue";

import { useAuthStore } from "../../stores/auth.js";

import CustomerAuthDialog from "./CustomerAuthDialog.vue";

import { siteConfig } from "../../config/site.js";

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
| STATE
|--------------------------------------------------------------------------
*/

const mobileOpen = ref(false);

const authDialogVisible = ref(false);

const accountMenuOpen = ref(false);

const accountMenuRef = ref(null);

/*
|--------------------------------------------------------------------------
| CONTACT CONFIG
|--------------------------------------------------------------------------
*/

const businessEmail =
  import.meta.env.VITE_BUSINESS_EMAIL || "explorekohrong@gmail.com";

const whatsAppNumber = String(
  import.meta.env.VITE_WHATSAPP_BUSINESS_NUMBER || "855885792065",
).replace(/\D/g, "");

const telegramUrl =
  import.meta.env.VITE_TELEGRAM_URL || "https://t.me/norea_yem";

/*
|--------------------------------------------------------------------------
| CONTACT DISPLAY
|--------------------------------------------------------------------------
*/

const phoneDisplay = "+855 88 579 2065";

const phoneUrl = "tel:+855885792065";

const emailUrl = computed(() => {
  return `mailto:${businessEmail}`;
});

const whatsAppUrl = computed(() => {
  return `https://wa.me/${whatsAppNumber}`;
});

/*
|--------------------------------------------------------------------------
| NAVIGATION
|--------------------------------------------------------------------------
*/

const navItems = [
  {
    label: "Home",
    to: "/",
  },

  {
    label: "Services",
    to: "/services",
  },

  {
    label: "Blogs",
    to: "/blogs",
  },

  {
    label: "About Us",
    to: "/about",
  },

  {
    label: "Contact",
    to: "/contact",
  },
];

/*
|--------------------------------------------------------------------------
| CUSTOMER AUTH
|--------------------------------------------------------------------------
*/

const isCustomerLoggedIn = computed(() => {
  return !!auth.user && auth.user.role === "CUSTOMER";
});

/*
|--------------------------------------------------------------------------
| CUSTOMER INFORMATION
|--------------------------------------------------------------------------
*/

const customerName = computed(() => {
  const firstName = auth.user?.firstName || "";

  const lastName = auth.user?.lastName || "";

  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || auth.user?.username || "Customer";
});

const customerEmail = computed(() => {
  return auth.user?.email || "";
});

/*
|--------------------------------------------------------------------------
| INITIALS
|--------------------------------------------------------------------------
*/

const customerInitials = computed(() => {
  const firstName = auth.user?.firstName || "";

  const lastName = auth.user?.lastName || "";

  if (firstName || lastName) {
    return (
      `${firstName?.[0] || ""}${lastName?.[0] || ""}` || "CU"
    ).toUpperCase();
  }

  const name = String(auth.user?.username || "Customer").trim();

  return name.slice(0, 2).toUpperCase();
});

/*
|--------------------------------------------------------------------------
| AUTH DIALOG
|--------------------------------------------------------------------------
*/

function openAuthDialog() {
  authDialogVisible.value = true;
}

function openMobileAuthDialog() {
  mobileOpen.value = false;

  authDialogVisible.value = true;
}

/*
|--------------------------------------------------------------------------
| ACCOUNT MENU
|--------------------------------------------------------------------------
*/

function toggleAccountMenu() {
  accountMenuOpen.value = !accountMenuOpen.value;
}

/*
|--------------------------------------------------------------------------
| ACTIVE ROUTE
|--------------------------------------------------------------------------
*/

function isActive(path) {
  if (path === "/") {
    return route.path === "/";
  }

  return route.path.startsWith(path);
}

/*
|--------------------------------------------------------------------------
| DESKTOP NAV
|--------------------------------------------------------------------------
*/

function desktopNavClass(path) {
  return [
    "relative",
    "rounded-lg",
    "px-4",
    "py-2.5",
    "text-sm",
    "font-medium",
    "transition",
    "duration-200",

    isActive(path)
      ? "bg-primary-50 text-primary-600"
      : "text-black hover:bg-primary-50 hover:text-primary-600",
  ];
}

/*
|--------------------------------------------------------------------------
| MOBILE NAV
|--------------------------------------------------------------------------
*/

function mobileNavClass(path) {
  return [
    "flex",
    "items-center",
    "justify-between",
    "rounded-xl",
    "px-4",
    "py-3",
    "text-sm",
    "font-medium",
    "transition",
    "duration-200",

    isActive(path)
      ? "bg-primary-50 text-primary-600"
      : "text-black hover:bg-surface-soft hover:text-primary-600",
  ];
}

/*
|--------------------------------------------------------------------------
| CLOSE MENU
|--------------------------------------------------------------------------
*/

function closeMenu() {
  mobileOpen.value = false;

  accountMenuOpen.value = false;
}

/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

async function logout() {
  accountMenuOpen.value = false;

  mobileOpen.value = false;

  try {
    if (typeof auth.logout === "function") {
      await auth.logout();
    } else {
      localStorage.removeItem("token");

      localStorage.removeItem("user");

      auth.$patch({
        token: null,
        user: null,
      });
    }
  } catch (error) {
    console.error("[LOGOUT ERROR]", error);

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    auth.$patch({
      token: null,
      user: null,
    });
  }

  await router.push("/");
}

/*
|--------------------------------------------------------------------------
| CLICK OUTSIDE
|--------------------------------------------------------------------------
*/

function handleClickOutside(event) {
  if (!accountMenuOpen.value) {
    return;
  }

  if (accountMenuRef.value && !accountMenuRef.value.contains(event.target)) {
    accountMenuOpen.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| ROUTE CHANGE
|--------------------------------------------------------------------------
*/

watch(
  () => route.fullPath,

  () => {
    mobileOpen.value = false;

    accountMenuOpen.value = false;
  },
);

/*
|--------------------------------------------------------------------------
| LOAD CURRENT USER
|--------------------------------------------------------------------------
*/

onMounted(async () => {
  document.addEventListener("click", handleClickOutside);

  const token = localStorage.getItem("token");

  if (token && typeof auth.loadCurrentUser === "function") {
    try {
      await auth.loadCurrentUser();
    } catch (error) {
      console.error("[NAVBAR USER LOAD ERROR]", error);
    }
  }
});

/*
|--------------------------------------------------------------------------
| CLEANUP
|--------------------------------------------------------------------------
*/

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.account-link {
  @apply flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-black transition duration-200 hover:bg-primary-50 hover:text-primary-600;
}
</style>
