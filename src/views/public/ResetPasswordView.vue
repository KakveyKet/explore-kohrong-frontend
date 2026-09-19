<template>
  <main
    class="flex min-h-[70vh] items-center justify-center bg-surface-soft px-4 py-12"
  >
    <div
      class="w-full max-w-md rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-8"
    >
      <!-- ==================================================== -->
      <!-- LOGO -->
      <!-- ==================================================== -->

      <RouterLink to="/" class="flex justify-center">
        <img
          :src="siteConfig.logo"
          alt="Explore Koh Rong"
          class="h-24 w-auto object-contain"
        />
      </RouterLink>

      <!-- ==================================================== -->
      <!-- HEADER -->
      <!-- ==================================================== -->

      <div class="mt-3 text-center">
        <p
          class="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600"
        >
          Account Recovery
        </p>

        <h1 class="mt-2 text-2xl font-bold text-heading sm:text-3xl">
          Create New Password
        </h1>

        <p class="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
          Choose a new password for your Explore Koh Rong account.
        </p>
      </div>

      <!-- ==================================================== -->
      <!-- SUCCESS -->
      <!-- ==================================================== -->

      <div
        v-if="success"
        class="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5"
      >
        <div class="text-center">
          <div
            class="mx-auto grid h-12 w-12 place-items-center rounded-full bg-green-100 text-green-600"
          >
            <Icon icon="ri:checkbox-circle-fill" class="h-6 w-6" />
          </div>

          <h2 class="mt-3 font-bold text-green-900">Password Updated</h2>

          <p class="mt-2 text-sm leading-6 text-green-700">
            {{ success }}
          </p>

          <RouterLink
            to="/"
            class="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-600"
          >
            <Icon icon="ri:login-box-fill" class="h-4 w-4" />

            Return to Sign In
          </RouterLink>
        </div>
      </div>

      <!-- ==================================================== -->
      <!-- RESET FORM -->
      <!-- ==================================================== -->

      <form v-else class="mt-6 space-y-5" @submit.prevent="submit">
        <!-- NEW PASSWORD -->

        <div>
          <label
            for="new-password"
            class="mb-2 block text-sm font-semibold text-heading"
          >
            New Password
          </label>

          <div class="relative">
            <Icon
              icon="ri:lock-password-fill"
              class="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-600"
            />

            <input
              id="new-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              minlength="8"
              autocomplete="new-password"
              placeholder="Minimum 8 characters"
              class="h-12 w-full rounded-xl border border-border bg-white pl-11 pr-12 text-sm text-heading outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
            />

            <button
              type="button"
              aria-label="Toggle password visibility"
              class="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted transition hover:text-primary-600"
              @click="showPassword = !showPassword"
            >
              <Icon
                :icon="showPassword ? 'ri:eye-off-fill' : 'ri:eye-fill'"
                class="h-5 w-5"
              />
            </button>
          </div>

          <p class="mt-1.5 text-xs text-muted">Use at least 8 characters.</p>
        </div>

        <!-- CONFIRM PASSWORD -->

        <div>
          <label
            for="confirm-password"
            class="mb-2 block text-sm font-semibold text-heading"
          >
            Confirm Password
          </label>

          <div class="relative">
            <Icon
              icon="ri:lock-password-fill"
              class="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-600"
            />

            <input
              id="confirm-password"
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              minlength="8"
              autocomplete="new-password"
              placeholder="Enter password again"
              class="h-12 w-full rounded-xl border border-border bg-white pl-11 pr-12 text-sm text-heading outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
            />

            <button
              type="button"
              aria-label="Toggle confirmation password visibility"
              class="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted transition hover:text-primary-600"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <Icon
                :icon="showConfirmPassword ? 'ri:eye-off-fill' : 'ri:eye-fill'"
                class="h-5 w-5"
              />
            </button>
          </div>
        </div>

        <!-- PASSWORD MATCH -->

        <div
          v-if="password && confirmPassword"
          class="flex items-center gap-2 text-xs"
          :class="passwordsMatch ? 'text-green-600' : 'text-red-600'"
        >
          <Icon
            :icon="
              passwordsMatch
                ? 'ri:checkbox-circle-fill'
                : 'ri:close-circle-fill'
            "
            class="h-4 w-4"
          />

          {{ passwordsMatch ? "Passwords match" : "Passwords do not match" }}
        </div>

        <!-- ERROR -->

        <div
          v-if="error"
          class="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3"
        >
          <Icon
            icon="ri:error-warning-fill"
            class="mt-0.5 h-5 w-5 shrink-0 text-red-600"
          />

          <p class="text-sm leading-6 text-red-700">
            {{ error }}
          </p>
        </div>

        <!-- SUBMIT -->

        <button
          type="submit"
          :disabled="loading || !passwordsMatch || password.length < 8"
          class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon
            v-if="loading"
            icon="ri:loader-4-line"
            class="h-4 w-4 animate-spin"
          />

          <Icon v-else icon="ri:lock-unlock-fill" class="h-4 w-4" />

          {{ loading ? "Updating Password..." : "Reset Password" }}
        </button>
      </form>
    </div>
  </main>
</template>

<script setup>
import { computed, ref } from "vue";

import { useRoute } from "vue-router";

import { Icon } from "@iconify/vue";

import api from "../../services/api.js";

import { siteConfig } from "../../config/site.js";

/*
|--------------------------------------------------------------------------
| ROUTE
|--------------------------------------------------------------------------
*/

const route = useRoute();

/*
|--------------------------------------------------------------------------
| STATE
|--------------------------------------------------------------------------
*/

const password = ref("");

const confirmPassword = ref("");

const showPassword = ref(false);

const showConfirmPassword = ref(false);

const loading = ref(false);

const error = ref("");

const success = ref("");

/*
|--------------------------------------------------------------------------
| MATCH
|--------------------------------------------------------------------------
*/

const passwordsMatch = computed(() => {
  return password.value === confirmPassword.value;
});

/*
|--------------------------------------------------------------------------
| SUBMIT
|--------------------------------------------------------------------------
*/

async function submit() {
  error.value = "";

  success.value = "";

  /*
   * Token
   */

  const token = String(route.params.token || "");

  if (!token) {
    error.value = "Password reset token is missing.";

    return;
  }

  /*
   * Password length
   */

  if (password.value.length < 8) {
    error.value = "Password must contain at least 8 characters.";

    return;
  }

  /*
   * Match
   */

  if (password.value !== confirmPassword.value) {
    error.value = "Passwords do not match.";

    return;
  }

  loading.value = true;

  try {
    const response = await api.post(`/auth/reset-password/${token}`, {
      password: password.value,

      confirmPassword: confirmPassword.value,
    });

    success.value =
      response.data?.message || "Your password has been reset successfully.";

    password.value = "";

    confirmPassword.value = "";
  } catch (err) {
    error.value =
      err.response?.data?.message || "Unable to reset your password.";
  } finally {
    loading.value = false;
  }
}
</script>
