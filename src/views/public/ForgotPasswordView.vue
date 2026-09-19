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
          Forgot Password?
        </h1>

        <p class="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
          Enter your registered email address and we'll send you a secure
          password reset link.
        </p>
      </div>

      <!-- ==================================================== -->
      <!-- SUCCESS -->
      <!-- ==================================================== -->

      <div
        v-if="success"
        class="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4"
      >
        <div class="flex items-start gap-3">
          <Icon
            icon="ri:checkbox-circle-fill"
            class="mt-0.5 h-5 w-5 shrink-0 text-green-600"
          />

          <div>
            <p class="text-sm font-semibold text-green-900">Check your email</p>

            <p class="mt-1 text-sm leading-6 text-green-700">
              {{ success }}
            </p>
          </div>
        </div>

        <button
          type="button"
          class="mt-4 text-sm font-semibold text-green-700 hover:text-green-800"
          @click="resetForm"
        >
          Send to another email
        </button>
      </div>

      <!-- ==================================================== -->
      <!-- FORM -->
      <!-- ==================================================== -->

      <form v-else class="mt-6" @submit.prevent="submit">
        <label
          for="forgot-email"
          class="mb-2 block text-sm font-semibold text-heading"
        >
          Email Address
        </label>

        <div class="relative">
          <Icon
            icon="ri:mail-fill"
            class="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-600"
          />

          <input
            id="forgot-email"
            v-model.trim="email"
            type="email"
            required
            autocomplete="email"
            placeholder="you@example.com"
            class="h-12 w-full rounded-xl border border-border bg-white pl-11 pr-4 text-sm text-heading outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
          />
        </div>

        <!-- ERROR -->

        <div
          v-if="error"
          class="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3"
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
          :disabled="loading"
          class="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon
            v-if="loading"
            icon="ri:loader-4-line"
            class="h-4 w-4 animate-spin"
          />

          <Icon v-else icon="ri:mail-send-fill" class="h-4 w-4" />

          {{ loading ? "Sending..." : "Send Reset Link" }}
        </button>
      </form>

      <!-- ==================================================== -->
      <!-- BACK -->
      <!-- ==================================================== -->

      <RouterLink
        to="/"
        class="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-primary-600 transition hover:text-primary-700"
      >
        <Icon icon="ri:arrow-left-line" class="h-4 w-4" />

        Back to Home
      </RouterLink>
    </div>
  </main>
</template>

<script setup>
import { ref } from "vue";

import { Icon } from "@iconify/vue";

import api from "../../services/api.js";

import { siteConfig } from "../../config/site.js";

/*
|--------------------------------------------------------------------------
| STATE
|--------------------------------------------------------------------------
*/

const email = ref("");

const loading = ref(false);

const error = ref("");

const success = ref("");

/*
|--------------------------------------------------------------------------
| SUBMIT
|--------------------------------------------------------------------------
*/

async function submit() {
  error.value = "";

  success.value = "";

  if (!email.value) {
    error.value = "Please enter your email address.";

    return;
  }

  loading.value = true;

  try {
    const response = await api.post("/auth/forgot-password", {
      email: email.value,
    });

    success.value =
      response.data?.message ||
      "If an account exists with that email, a password reset link has been sent.";
  } catch (err) {
    error.value =
      err.response?.data?.message || "Unable to send password reset email.";
  } finally {
    loading.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| RESET FORM
|--------------------------------------------------------------------------
*/

function resetForm() {
  email.value = "";

  error.value = "";

  success.value = "";
}
</script>
