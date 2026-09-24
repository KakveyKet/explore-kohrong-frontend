<template>
  <main class="min-h-[70vh] bg-surface-soft">
    <section class="page py-8 sm:py-10 lg:py-12">
      <!-- ====================================================== -->
      <!-- PAGE HEADER -->
      <!-- ====================================================== -->

      <div class="mb-6">
        <p
          class="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600"
        >
          My Account
        </p>

        <h1 class="mt-2 text-2xl font-bold text-heading sm:text-3xl">
          My Profile
        </h1>

        <p class="mt-2 max-w-xl text-sm text-muted">
          Manage your personal information and account password.
        </p>
      </div>

      <!-- ====================================================== -->
      <!-- LOADING -->
      <!-- ====================================================== -->

      <div
        v-if="loading"
        class="flex min-h-[350px] items-center justify-center"
      >
        <div class="text-center">
          <i class="pi pi-spin pi-spinner text-3xl text-primary-500" />

          <p class="mt-3 text-sm text-muted">Loading your profile...</p>
        </div>
      </div>

      <!-- ====================================================== -->
      <!-- CONTENT -->
      <!-- ====================================================== -->

      <div v-else class="mx-auto max-w-4xl space-y-5">
        <!-- ==================================================== -->
        <!-- PROFILE SUMMARY -->
        <!-- ==================================================== -->

        <div class="overflow-hidden rounded-2xl bg-white shadow-sm">
          <!-- TOP PROFILE -->

          <div class="bg-primary-500 px-5 py-6 sm:px-7 sm:py-7">
            <div class="flex items-center gap-4">
              <!-- INITIALS -->

              <div
                class="grid h-16 w-16 shrink-0 place-items-center rounded-full border-2 border-white/40 bg-white/15 text-xl font-bold text-white shadow-sm sm:h-20 sm:w-20 sm:text-2xl"
              >
                {{ initials }}
              </div>

              <!-- INFO -->

              <div class="min-w-0">
                <h2 class="truncate text-xl font-bold text-white sm:text-2xl">
                  {{ displayName }}
                </h2>

                <p class="mt-1 truncate text-sm text-white/75">
                  {{ profile.email || "No email" }}
                </p>
              </div>
            </div>
          </div>

          <!-- ================================================== -->
          <!-- ACCOUNT INFORMATION -->
          <!-- ================================================== -->

          <div class="p-5 sm:p-7">
            <div class="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 class="text-lg font-bold text-heading">
                  Personal Information
                </h3>

                <p class="mt-1 text-sm text-muted">
                  Update your customer account information.
                </p>
              </div>

              <div
                class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-600"
              >
                <i class="pi pi-user-edit" />
              </div>
            </div>

            <!-- FORM -->

            <form
              class="grid gap-4 sm:grid-cols-2"
              @submit.prevent="saveProfile"
            >
              <!-- FIRST NAME -->

              <div>
                <label class="profile-label"> First Name </label>

                <input
                  v-model.trim="form.firstName"
                  type="text"
                  class="profile-input"
                  placeholder="First name"
                  autocomplete="given-name"
                />
              </div>

              <!-- LAST NAME -->

              <div>
                <label class="profile-label"> Last Name </label>

                <input
                  v-model.trim="form.lastName"
                  type="text"
                  class="profile-input"
                  placeholder="Last name"
                  autocomplete="family-name"
                />
              </div>

              <!-- USERNAME -->

              <div>
                <label class="profile-label"> Username </label>

                <input
                  v-model.trim="form.username"
                  type="text"
                  class="profile-input"
                  placeholder="Username"
                  autocomplete="username"
                />
              </div>

              <!-- EMAIL -->

              <div>
                <label class="profile-label"> Email </label>

                <input
                  v-model.trim="form.email"
                  type="email"
                  class="profile-input"
                  placeholder="Email address"
                  autocomplete="email"
                />
              </div>

              <!-- PHONE -->

              <div>
                <label class="profile-label"> Phone </label>

                <input
                  v-model.trim="form.phone"
                  type="tel"
                  class="profile-input"
                  placeholder="Phone number"
                  autocomplete="tel"
                />
              </div>

              <!-- ACCOUNT TYPE -->

              <div>
                <label class="profile-label"> Account Type </label>

                <div
                  class="flex h-11 items-center gap-2 rounded-xl bg-slate-100 px-3 text-sm font-medium text-slate-500"
                >
                  <i class="pi pi-user text-xs" />

                  Customer
                </div>
              </div>

              <!-- SUCCESS -->

              <div v-if="profileMessage" class="sm:col-span-2">
                <div
                  class="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700"
                >
                  <i class="pi pi-check-circle" />

                  {{ profileMessage }}
                </div>
              </div>

              <!-- ERROR -->

              <div v-if="profileError" class="sm:col-span-2">
                <div
                  class="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
                >
                  <i class="pi pi-exclamation-circle mt-0.5" />

                  {{ profileError }}
                </div>
              </div>

              <!-- SAVE -->

              <div class="flex justify-end sm:col-span-2">
                <button
                  type="submit"
                  :disabled="saving"
                  class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-500 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <i v-if="saving" class="pi pi-spin pi-spinner text-xs" />

                  <i v-else class="pi pi-check text-xs" />

                  {{ saving ? "Saving..." : "Save Changes" }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- ==================================================== -->
        <!-- PASSWORD -->
        <!-- ==================================================== -->

        <div
          class="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6"
        >
          <div class="flex items-center gap-4">
            <div
              class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-600"
            >
              <i class="pi pi-lock" />
            </div>

            <div>
              <h3 class="font-semibold text-heading">Password</h3>

              <p class="mt-1 text-sm text-muted">
                Change the password used to access your account.
              </p>
            </div>
          </div>

          <button
            type="button"
            class="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold text-heading transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600"
            @click="passwordDialog = true"
          >
            <i class="pi pi-key text-xs" />

            Change Password
          </button>
        </div>

        <!-- ==================================================== -->
        <!-- MY BOOKINGS -->
        <!-- ==================================================== -->

        <RouterLink
          to="/my-bookings"
          class="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm transition hover:bg-primary-50 sm:p-6"
        >
          <div class="flex items-center gap-4">
            <div
              class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-600"
            >
              <i class="pi pi-calendar" />
            </div>

            <div>
              <h3 class="font-semibold text-heading">My Bookings</h3>

              <p class="mt-1 text-sm text-muted">
                View your upcoming and previous bookings.
              </p>
            </div>
          </div>

          <i class="pi pi-chevron-right text-xs text-primary-500" />
        </RouterLink>
      </div>
    </section>

    <!-- ====================================================== -->
    <!-- PASSWORD DIALOG -->
    <!-- ====================================================== -->

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="scale-[0.98] opacity-0"
        enter-to-class="scale-100 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="scale-100 opacity-100"
        leave-to-class="scale-[0.98] opacity-0"
      >
        <div
          v-if="passwordDialog"
          class="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[2px]"
          @click.self="closePasswordDialog"
        >
          <div
            class="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
          >
            <!-- HEADER -->

            <div class="flex items-start justify-between gap-4">
              <div>
                <h2 class="text-lg font-bold text-heading">Change Password</h2>

                <p class="mt-1 text-xs leading-5 text-muted">
                  Enter and confirm your new password.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close"
                class="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-heading"
                @click="closePasswordDialog"
              >
                <i class="pi pi-times text-sm" />
              </button>
            </div>

            <!-- FORM -->

            <form class="mt-5 space-y-3" @submit.prevent="resetPassword">
              <!-- NEW PASSWORD -->

              <div>
                <label class="profile-label"> New Password </label>

                <div class="relative">
                  <input
                    v-model="passwordForm.password"
                    :type="showPassword ? 'text' : 'password'"
                    class="profile-input pr-10"
                    placeholder="Enter new password"
                    autocomplete="new-password"
                  />

                  <button
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-primary-600"
                    @click="showPassword = !showPassword"
                  >
                    <i
                      :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"
                      class="text-xs"
                    />
                  </button>
                </div>
              </div>

              <!-- CONFIRM -->

              <div>
                <label class="profile-label"> Confirm Password </label>

                <div class="relative">
                  <input
                    v-model="passwordForm.confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    class="profile-input pr-10"
                    placeholder="Confirm new password"
                    autocomplete="new-password"
                  />

                  <button
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-primary-600"
                    @click="showConfirmPassword = !showConfirmPassword"
                  >
                    <i
                      :class="
                        showConfirmPassword ? 'pi pi-eye-slash' : 'pi pi-eye'
                      "
                      class="text-xs"
                    />
                  </button>
                </div>
              </div>

              <!-- ERROR -->

              <div
                v-if="passwordError"
                class="rounded-xl bg-red-50 px-3 py-2.5 text-xs text-red-600"
              >
                {{ passwordError }}
              </div>

              <!-- ACTION -->

              <div class="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  class="h-10 rounded-xl px-4 text-sm font-semibold text-muted transition hover:bg-slate-100"
                  @click="closePasswordDialog"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  :disabled="resettingPassword"
                  class="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary-500 px-5 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <i
                    v-if="resettingPassword"
                    class="pi pi-spin pi-spinner text-xs"
                  />

                  {{ resettingPassword ? "Saving..." : "Change Password" }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";

import api from "../../services/api.js";

import { useAuthStore } from "../../stores/auth.js";

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

const loading = ref(true);

const saving = ref(false);

const profile = ref({});

const profileMessage = ref("");

const profileError = ref("");

/*
|--------------------------------------------------------------------------
| PROFILE FORM
|--------------------------------------------------------------------------
*/

const form = reactive({
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  phone: "",
});

/*
|--------------------------------------------------------------------------
| PASSWORD STATE
|--------------------------------------------------------------------------
*/

const passwordDialog = ref(false);

const resettingPassword = ref(false);

const passwordError = ref("");

const showPassword = ref(false);

const showConfirmPassword = ref(false);

const passwordForm = reactive({
  password: "",
  confirmPassword: "",
});

/*
|--------------------------------------------------------------------------
| DISPLAY NAME
|--------------------------------------------------------------------------
*/

const displayName = computed(() => {
  const firstName = profile.value?.firstName || "";

  const lastName = profile.value?.lastName || "";

  const fullName = `${firstName} ${lastName}`.trim();

  return (
    fullName || profile.value?.username || auth.user?.username || "Customer"
  );
});

/*
|--------------------------------------------------------------------------
| INITIALS
|--------------------------------------------------------------------------
*/

const initials = computed(() => {
  const firstName = profile.value?.firstName || "";

  const lastName = profile.value?.lastName || "";

  if (firstName || lastName) {
    return (
      `${firstName?.[0] || ""}${lastName?.[0] || ""}` || "CU"
    ).toUpperCase();
  }

  const username = profile.value?.username || auth.user?.username || "Customer";

  return String(username).trim().slice(0, 2).toUpperCase();
});

/*
|--------------------------------------------------------------------------
| UPDATE AUTH STORE
|--------------------------------------------------------------------------
*/

function updateAuthUser(user) {
  if (!user) {
    return;
  }

  const updatedUser = {
    ...(auth.user || {}),
    ...user,
  };

  auth.$patch({
    user: updatedUser,
  });

  localStorage.setItem("user", JSON.stringify(updatedUser));
}

/*
|--------------------------------------------------------------------------
| LOAD PROFILE
|--------------------------------------------------------------------------
*/

async function loadProfile() {
  loading.value = true;

  profileError.value = "";

  try {
    const response = await api.get("/auth/me");

    const user = response.data?.user || response.data || {};

    profile.value = user;

    form.firstName = user.firstName || "";

    form.lastName = user.lastName || "";

    form.username = user.username || "";

    form.email = user.email || "";

    form.phone = user.phone || "";

    updateAuthUser(user);
  } catch (error) {
    console.error("[PROFILE LOAD ERROR]", error);

    profileError.value =
      error.response?.data?.message || "Unable to load your profile.";
  } finally {
    loading.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| SAVE PROFILE
|--------------------------------------------------------------------------
*/

async function saveProfile() {
  profileMessage.value = "";

  profileError.value = "";

  if (!form.firstName || !form.lastName || !form.username || !form.email) {
    profileError.value =
      "First name, last name, username and email are required.";

    return;
  }

  saving.value = true;

  try {
    const response = await api.patch("/auth/profile", {
      firstName: form.firstName,

      lastName: form.lastName,

      username: form.username,

      email: form.email,

      phone: form.phone,
    });

    const user = response.data?.user || response.data || {};

    profile.value = {
      ...profile.value,
      ...user,

      firstName: user.firstName ?? form.firstName,

      lastName: user.lastName ?? form.lastName,

      username: user.username ?? form.username,

      email: user.email ?? form.email,

      phone: user.phone ?? form.phone,
    };

    updateAuthUser(profile.value);

    profileMessage.value = "Profile updated successfully.";
  } catch (error) {
    console.error("[PROFILE UPDATE ERROR]", error);

    profileError.value =
      error.response?.data?.message || "Unable to update your profile.";
  } finally {
    saving.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| CLOSE PASSWORD DIALOG
|--------------------------------------------------------------------------
*/

function closePasswordDialog() {
  passwordDialog.value = false;

  passwordError.value = "";

  passwordForm.password = "";

  passwordForm.confirmPassword = "";

  showPassword.value = false;

  showConfirmPassword.value = false;
}

/*
|--------------------------------------------------------------------------
| RESET PASSWORD
|--------------------------------------------------------------------------
*/

async function resetPassword() {
  passwordError.value = "";

  if (!passwordForm.password) {
    passwordError.value = "New password is required.";

    return;
  }

  if (passwordForm.password.length < 8) {
    passwordError.value = "Password must be at least 8 characters.";

    return;
  }

  if (passwordForm.password !== passwordForm.confirmPassword) {
    passwordError.value = "Password confirmation does not match.";

    return;
  }

  resettingPassword.value = true;

  try {
    await api.patch("/auth/reset-password", {
      password: passwordForm.password,
    });

    closePasswordDialog();

    profileMessage.value = "Password updated successfully.";
  } catch (error) {
    console.error("[PASSWORD UPDATE ERROR]", error);

    passwordError.value =
      error.response?.data?.message || "Unable to change password.";
  } finally {
    resettingPassword.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| ESC CLOSE
|--------------------------------------------------------------------------
*/

function handleKeydown(event) {
  if (event.key === "Escape" && passwordDialog.value) {
    closePasswordDialog();
  }
}

/*
|--------------------------------------------------------------------------
| INIT
|--------------------------------------------------------------------------
*/

onMounted(() => {
  loadProfile();

  window.addEventListener("keydown", handleKeydown);
});

/*
|--------------------------------------------------------------------------
| CLEANUP
|--------------------------------------------------------------------------
*/

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped>
.profile-label {
  @apply mb-1.5 block text-xs font-medium text-heading;
}

.profile-input {
  @apply h-11 w-full rounded-xl border border-border bg-white px-3 text-sm text-heading outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10;
}
</style>
