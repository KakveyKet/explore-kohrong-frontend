<template>
  <section
    class="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#FAF8F2] px-4 py-12"
  >
    <div
      class="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-lg lg:grid-cols-2"
    >
      <!-- ==================================================== -->
      <!-- LEFT -->
      <!-- ==================================================== -->

      <div
        class="hidden bg-[#0E7490] p-10 text-white lg:flex lg:flex-col lg:justify-between"
      >
        <div>
          <div
            class="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15"
          >
            <i class="pi pi-compass text-2xl" />
          </div>

          <h1 class="mt-8 text-4xl font-bold leading-tight">
            Welcome back to Explore Koh Rong
          </h1>

          <p class="mt-4 max-w-md leading-7 text-cyan-50">
            Sign in to manage your bookings, comment on travel articles and
            continue exploring Koh Rong.
          </p>
        </div>

        <div class="mt-12 space-y-4 text-sm text-cyan-50">
          <div class="flex items-center gap-3">
            <i class="pi pi-check-circle" />

            Manage your bookings
          </div>

          <div class="flex items-center gap-3">
            <i class="pi pi-check-circle" />

            Comment on travel articles
          </div>

          <div class="flex items-center gap-3">
            <i class="pi pi-check-circle" />

            Book tours and services
          </div>
        </div>
      </div>

      <!-- ==================================================== -->
      <!-- LOGIN -->
      <!-- ==================================================== -->

      <div class="p-6 sm:p-10 lg:p-12">
        <!-- MOBILE LOGO -->

        <div class="mb-8 lg:hidden">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0E7490] text-white"
          >
            <i class="pi pi-compass text-xl" />
          </div>
        </div>

        <div>
          <p
            class="text-sm font-semibold uppercase tracking-wider text-[#0E7490]"
          >
            Customer Account
          </p>

          <h2 class="mt-2 text-3xl font-bold text-slate-900">Sign in</h2>

          <p class="mt-2 text-sm text-slate-500">
            Enter your email or username and password.
          </p>
        </div>

        <!-- ================================================== -->
        <!-- FORM -->
        <!-- ================================================== -->

        <form class="mt-8 space-y-5" @submit.prevent="submit">
          <!-- IDENTIFIER -->

          <div>
            <label
              for="customer-identifier"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              Email or Username
            </label>

            <InputGroup>
              <InputGroupAddon>
                <i class="pi pi-user" />
              </InputGroupAddon>

              <InputText
                id="customer-identifier"
                v-model="form.identifier"
                class="w-full"
                autocomplete="username"
                placeholder="Email or username"
                :disabled="loading"
              />
            </InputGroup>
          </div>

          <!-- PASSWORD -->

          <div>
            <label
              for="customer-password"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              Password
            </label>

            <Password
              id="customer-password"
              v-model="form.password"
              :feedback="false"
              toggle-mask
              fluid
              autocomplete="current-password"
              placeholder="Enter your password"
              :disabled="loading"
            />
          </div>

          <!-- ERROR -->

          <Message v-if="error" severity="error" :closable="false">
            {{ error }}
          </Message>

          <!-- LOGIN -->

          <Button
            type="submit"
            label="Sign In"
            icon="pi pi-sign-in"
            class="w-full"
            :loading="loading"
          />

          <!-- REGISTER -->

          <div class="pt-2 text-center text-sm text-slate-500">
            Don't have an account?

            <button
              type="button"
              class="ml-1 font-semibold text-[#0E7490] hover:underline"
              @click="router.push('/register')"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref } from "vue";

import { useRoute, useRouter } from "vue-router";

import Button from "primevue/button";

import InputGroup from "primevue/inputgroup";

import InputGroupAddon from "primevue/inputgroupaddon";

import InputText from "primevue/inputtext";

import Message from "primevue/message";

import Password from "primevue/password";

import { useAuthStore } from "../../stores/auth.js";

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

const loading = ref(false);

const error = ref("");

const form = reactive({
  identifier: "",

  password: "",
});

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

async function submit() {
  error.value = "";

  /*
  |--------------------------------------------------------------------------
  | VALIDATION
  |--------------------------------------------------------------------------
  */

  const identifier = form.identifier.trim();

  if (!identifier) {
    error.value = "Email or username is required.";

    return;
  }

  if (!form.password) {
    error.value = "Password is required.";

    return;
  }

  loading.value = true;

  try {
    /*
    |--------------------------------------------------------------------------
    | IMPORTANT
    |--------------------------------------------------------------------------
    |
    | Backend expects:
    |
    | {
    |   identifier,
    |   password
    | }
    |
    */

    const user = await auth.login({
      identifier,

      password: form.password,
    });

    console.log("[CUSTOMER LOGIN] user:", user);

    /*
    |--------------------------------------------------------------------------
    | ROLE
    |--------------------------------------------------------------------------
    */

    if (!user?.role) {
      auth.logout();

      error.value = "Unable to determine account role.";

      return;
    }

    /*
     * If somebody uses the customer
     * login screen with an admin account,
     * send them to the admin dashboard.
     */

    if (["SUPER_ADMIN", "ADMIN", "STAFF"].includes(user.role)) {
      await router.replace("/admin/dashboard");

      return;
    }

    /*
     * Customer only.
     */

    if (user.role !== "CUSTOMER") {
      auth.logout();

      error.value = "This account cannot access the customer website.";

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | REDIRECT
    |--------------------------------------------------------------------------
    |
    | Example:
    |
    | /login?redirect=/booking/123
    |
    | After login:
    |
    | /booking/123
    |
    */

    const redirect =
      typeof route.query.redirect === "string" ? route.query.redirect : "/";

    /*
     * Prevent customer from being
     * redirected into an admin URL.
     */

    const safeRedirect = redirect.startsWith("/admin") ? "/" : redirect;

    await router.replace(safeRedirect);
  } catch (err) {
    console.error("[CUSTOMER LOGIN ERROR]", err);

    error.value =
      err.response?.data?.message || err.message || "Unable to login.";
  } finally {
    loading.value = false;
  }
}
</script>
