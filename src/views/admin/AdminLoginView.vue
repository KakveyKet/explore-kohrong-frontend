<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-50 px-4">
    <Card class="w-full max-w-md">
      <template #content>
        <div class="py-4">
          <!-- LOGO -->

          <div class="mb-7 text-center">
            <div
              class="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#0E7490] text-white"
            >
              <i class="pi pi-compass text-2xl" />
            </div>

            <h1 class="mt-4 text-2xl font-bold text-slate-900">
              Explore Koh Rong
            </h1>

            <p class="mt-1 text-sm text-slate-500">Administration Login</p>
          </div>

          <form class="space-y-5" @submit.prevent="submit">
            <!-- EMAIL / USERNAME -->

            <div>
              <label
                for="login-identifier"
                class="mb-2 block text-sm font-medium text-slate-700"
              >
                Email or Username
              </label>

              <InputGroup>
                <InputGroupAddon>
                  <i class="pi pi-user" />
                </InputGroupAddon>

                <InputText
                  id="login-identifier"
                  v-model="form.identifier"
                  autocomplete="username"
                  placeholder="
                    admin@example.com
                  "
                  class="w-full"
                />
              </InputGroup>
            </div>

            <!-- PASSWORD -->

            <div>
              <label
                for="login-password"
                class="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <Password
                id="login-password"
                v-model="form.password"
                :feedback="false"
                toggle-mask
                fluid
                autocomplete="
                  current-password
                "
                placeholder="
                  Enter password
                "
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
              icon="
                pi pi-sign-in
              "
              class="w-full"
              :loading="loading"
            />
          </form>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";

import { useRouter } from "vue-router";

import Button from "primevue/button";

import Card from "primevue/card";

import InputGroup from "primevue/inputgroup";

import InputGroupAddon from "primevue/inputgroupaddon";

import InputText from "primevue/inputtext";

import Message from "primevue/message";

import Password from "primevue/password";

import { useAuthStore } from "../../stores/auth.js";

const router = useRouter();

const auth = useAuthStore();

const loading = ref(false);

const error = ref("");

const form = reactive({
  identifier: "",
  password: "",
});

async function submit() {
  error.value = "";

  if (!form.identifier.trim()) {
    error.value = "Email or username is required.";

    return;
  }

  if (!form.password) {
    error.value = "Password is required.";

    return;
  }

  loading.value = true;

  try {
    const user = await auth.login({
      identifier: form.identifier.trim(),

      password: form.password,
    });

    /*
     * Only admin roles should
     * access admin panel.
     */
    if (!["SUPER_ADMIN", "ADMIN", "STAFF"].includes(user.role)) {
      auth.logout();

      error.value = "You do not have permission to access the admin panel.";

      return;
    }

    await router.push("/admin/dashboard");
  } catch (err) {
    error.value = err.response?.data?.message || "Unable to login.";
  } finally {
    loading.value = false;
  }
}
</script>
