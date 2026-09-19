<template>
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
        v-if="modelValue"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-[2px] sm:p-5"
        @click.self="close"
      >
        <!-- ================================================== -->
        <!-- DIALOG -->
        <!-- ================================================== -->

        <div
          class="relative grid max-h-[90vh] w-full max-w-[780px] overflow-hidden rounded-2xl bg-white shadow-2xl lg:grid-cols-[0.85fr_1.15fr]"
        >
          <!-- ================================================== -->
          <!-- CLOSE -->
          <!-- ================================================== -->

          <button
            type="button"
            aria-label="Close"
            class="absolute right-3 top-3 z-30 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-sm text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-slate-900"
            @click="close"
          >
            <i class="pi pi-times text-sm" />
          </button>

          <!-- ================================================== -->
          <!-- LEFT IMAGE -->
          <!-- ================================================== -->

          <div class="relative hidden min-h-[520px] overflow-hidden lg:block">
            <img
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85"
              alt="Explore Koh Rong"
              class="absolute inset-0 h-full w-full object-cover"
            />

            <div
              class="absolute inset-0 bg-gradient-to-b from-primary-900/35 via-primary-900/30 to-primary-950/90"
            />

            <div
              class="relative flex min-h-[520px] flex-col justify-between p-7 text-white"
            >
              <!-- TOP -->

              <div>
                <span
                  class="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur"
                >
                  Explore Koh Rong
                </span>

                <h2 class="mt-4 text-2xl font-bold leading-tight text-white">
                  {{ leftTitle }}
                </h2>

                <p class="mt-2 max-w-xs text-xs leading-5 text-white/75">
                  {{ leftDescription }}
                </p>
              </div>

              <!-- FEATURES -->

              <div class="grid grid-cols-2 gap-x-4 gap-y-4">
                <div
                  v-for="feature in features"
                  :key="feature.title"
                  class="flex items-start gap-2"
                >
                  <div
                    class="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/25 bg-white/10"
                  >
                    <i :class="[feature.icon, 'text-[11px]']" />
                  </div>

                  <div>
                    <p class="text-[11px] font-semibold text-white">
                      {{ feature.title }}
                    </p>

                    <p class="mt-0.5 text-[9px] leading-3 text-white/60">
                      {{ feature.text }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ================================================== -->
          <!-- RIGHT -->
          <!-- ================================================== -->

          <div class="max-h-[90vh] overflow-y-auto px-5 py-6 sm:px-7 lg:px-8">
            <!-- ================================================== -->
            <!-- LOGO -->
            <!-- ================================================== -->

            <div class="text-center">
              <img
                :src="siteConfig.logo"
                alt="Explore Koh Rong"
                class="mx-auto h-20 w-auto object-contain"
              />

              <h2 class="mt-1 text-lg font-bold text-heading lg:hidden">
                {{ mobileTitle }}
              </h2>
            </div>

            <!-- ================================================== -->
            <!-- LOGIN / SIGNUP TABS -->
            <!-- ================================================== -->

            <div
              v-if="view !== 'forgot'"
              class="mx-auto mt-4 flex max-w-sm rounded-xl bg-slate-100 p-1"
            >
              <button
                type="button"
                :class="tabClass('login')"
                @click="changeTab('login')"
              >
                <i class="pi pi-sign-in text-xs" />

                Log In
              </button>

              <button
                type="button"
                :class="tabClass('signup')"
                @click="changeTab('signup')"
              >
                <i class="pi pi-user-plus text-xs" />

                Sign Up
              </button>
            </div>

            <!-- ================================================== -->
            <!-- LOGIN -->
            <!-- ================================================== -->

            <form
              v-if="view === 'login'"
              class="mx-auto mt-5 max-w-sm space-y-3"
              @submit.prevent="login"
            >
              <!-- IDENTIFIER -->

              <div>
                <label class="mb-1 block text-xs font-medium text-heading">
                  Email or Username
                </label>

                <input
                  v-model.trim="loginForm.identifier"
                  type="text"
                  class="h-10 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                  placeholder="Enter email or username"
                  autocomplete="username"
                />
              </div>

              <!-- PASSWORD -->

              <div>
                <div class="mb-1 flex items-center justify-between gap-3">
                  <label class="block text-xs font-medium text-heading">
                    Password
                  </label>

                  <button
                    type="button"
                    class="text-[11px] font-semibold text-primary-600 transition hover:text-primary-700"
                    @click="openForgotPassword"
                  >
                    Forgot password?
                  </button>
                </div>

                <div class="relative">
                  <input
                    v-model="loginForm.password"
                    :type="showLoginPassword ? 'text' : 'password'"
                    class="h-10 w-full rounded-xl border border-border bg-white px-3 pr-10 text-sm outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                    placeholder="Enter your password"
                    autocomplete="current-password"
                  />

                  <button
                    type="button"
                    aria-label="Toggle password visibility"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-primary-600"
                    @click="showLoginPassword = !showLoginPassword"
                  >
                    <i
                      :class="
                        showLoginPassword ? 'pi pi-eye-slash' : 'pi pi-eye'
                      "
                      class="text-xs"
                    />
                  </button>
                </div>
              </div>

              <!-- ERROR -->

              <p
                v-if="errorMessage"
                class="rounded-lg bg-red-50 px-3 py-2 text-xs leading-5 text-red-600"
              >
                {{ errorMessage }}
              </p>

              <!-- LOGIN -->

              <button
                type="submit"
                :disabled="submitting"
                class="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary-500 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <i v-if="submitting" class="pi pi-spin pi-spinner text-xs" />

                {{ submitting ? "Signing In..." : "Log In" }}
              </button>

              <p class="pt-1 text-center text-xs text-muted">
                Don't have an account?

                <button
                  type="button"
                  class="font-semibold text-primary-600 hover:text-primary-700"
                  @click="changeTab('signup')"
                >
                  Sign Up
                </button>
              </p>
            </form>

            <!-- ================================================== -->
            <!-- FORGOT PASSWORD -->
            <!-- ================================================== -->

            <form
              v-else-if="view === 'forgot'"
              class="mx-auto mt-5 max-w-sm"
              @submit.prevent="sendResetLink"
            >
              <!-- BACK -->

              <button
                type="button"
                class="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 transition hover:text-primary-700"
                @click="backToLogin"
              >
                <i class="pi pi-arrow-left text-[10px]" />

                Back to Log In
              </button>

              <!-- HEADER -->

              <div>
                <div
                  class="grid h-11 w-11 place-items-center rounded-xl bg-primary-50 text-primary-600"
                >
                  <i class="pi pi-envelope text-lg" />
                </div>

                <h2 class="mt-4 text-xl font-bold text-heading">
                  Forgot Password?
                </h2>

                <p class="mt-2 text-xs leading-5 text-muted">
                  Enter your registered email address. We'll send you a secure
                  link to create a new password.
                </p>
              </div>

              <!-- SUCCESS -->

              <div
                v-if="forgotSuccess"
                class="mt-5 rounded-xl border border-green-200 bg-green-50 p-4"
              >
                <div class="flex items-start gap-3">
                  <i class="pi pi-check-circle mt-0.5 text-green-600" />

                  <div>
                    <p class="text-xs font-semibold text-green-900">
                      Check your email
                    </p>

                    <p class="mt-1 text-xs leading-5 text-green-700">
                      {{ forgotSuccess }}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  class="mt-4 text-xs font-semibold text-primary-600 hover:text-primary-700"
                  @click="resetForgotPassword"
                >
                  Send to another email
                </button>
              </div>

              <!-- FORM -->

              <template v-else>
                <div class="mt-5">
                  <label
                    for="forgot-email"
                    class="mb-1 block text-xs font-medium text-heading"
                  >
                    Email Address
                  </label>

                  <div class="relative">
                    <i
                      class="pi pi-envelope pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-primary-600"
                    />

                    <input
                      id="forgot-email"
                      v-model.trim="forgotEmail"
                      type="email"
                      required
                      autocomplete="email"
                      placeholder="Enter your registered email"
                      class="h-10 w-full rounded-xl border border-border bg-white pl-9 pr-3 text-sm text-heading outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                    />
                  </div>
                </div>

                <!-- ERROR -->

                <p
                  v-if="forgotError"
                  class="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs leading-5 text-red-600"
                >
                  {{ forgotError }}
                </p>

                <!-- SEND -->

                <button
                  type="submit"
                  :disabled="forgotSubmitting"
                  class="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary-500 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <i
                    v-if="forgotSubmitting"
                    class="pi pi-spin pi-spinner text-xs"
                  />

                  <i v-else class="pi pi-send text-xs" />

                  {{ forgotSubmitting ? "Sending..." : "Send Reset Link" }}
                </button>
              </template>
            </form>

            <!-- ================================================== -->
            <!-- SIGN UP -->
            <!-- ================================================== -->

            <form
              v-else
              class="mx-auto mt-4 max-w-sm space-y-2.5"
              @submit.prevent="register"
            >
              <!-- FIRST / LAST -->

              <div class="grid gap-2.5 sm:grid-cols-2">
                <div>
                  <label class="compact-label"> First Name </label>

                  <input
                    v-model.trim="registerForm.firstName"
                    type="text"
                    class="compact-input"
                    placeholder="First name"
                  />
                </div>

                <div>
                  <label class="compact-label"> Last Name </label>

                  <input
                    v-model.trim="registerForm.lastName"
                    type="text"
                    class="compact-input"
                    placeholder="Last name"
                  />
                </div>
              </div>

              <!-- USERNAME -->

              <div>
                <label class="compact-label"> Username </label>

                <input
                  v-model.trim="registerForm.username"
                  type="text"
                  class="compact-input"
                  placeholder="Choose username"
                  autocomplete="username"
                />
              </div>

              <!-- EMAIL -->

              <div>
                <label class="compact-label"> Email </label>

                <input
                  v-model.trim="registerForm.email"
                  type="email"
                  class="compact-input"
                  placeholder="Enter email"
                  autocomplete="email"
                />
              </div>

              <!-- PHONE -->

              <div>
                <label class="compact-label"> Phone </label>

                <input
                  v-model.trim="registerForm.phone"
                  type="tel"
                  class="compact-input"
                  placeholder="Enter phone number"
                />
              </div>

              <!-- PASSWORD -->

              <div>
                <label class="compact-label"> Password </label>

                <div class="relative">
                  <input
                    v-model="registerForm.password"
                    :type="showRegisterPassword ? 'text' : 'password'"
                    class="compact-input pr-10"
                    placeholder="Create password"
                    autocomplete="new-password"
                  />

                  <button
                    type="button"
                    aria-label="Toggle password visibility"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-primary-600"
                    @click="showRegisterPassword = !showRegisterPassword"
                  >
                    <i
                      :class="
                        showRegisterPassword ? 'pi pi-eye-slash' : 'pi pi-eye'
                      "
                      class="text-xs"
                    />
                  </button>
                </div>
              </div>

              <!-- CONFIRM -->

              <div>
                <label class="compact-label"> Confirm Password </label>

                <input
                  v-model="registerForm.confirmPassword"
                  type="password"
                  class="compact-input"
                  placeholder="Confirm password"
                  autocomplete="new-password"
                />
              </div>

              <!-- TERMS -->

              <label class="flex cursor-pointer items-start gap-2 pt-1">
                <input
                  v-model="registerForm.acceptTerms"
                  type="checkbox"
                  class="mt-0.5 h-3.5 w-3.5 rounded border-border text-primary-500 focus:ring-primary-500"
                />

                <span class="text-[11px] leading-4 text-muted">
                  I accept the

                  <span class="font-medium text-primary-600">
                    Terms of Service
                  </span>

                  and

                  <span class="font-medium text-primary-600">
                    Privacy Policy </span
                  >.
                </span>
              </label>

              <!-- ERROR -->

              <p
                v-if="errorMessage"
                class="rounded-lg bg-red-50 px-3 py-2 text-xs leading-5 text-red-600"
              >
                {{ errorMessage }}
              </p>

              <!-- SUCCESS -->

              <p
                v-if="successMessage"
                class="rounded-lg bg-green-50 px-3 py-2 text-xs leading-5 text-green-700"
              >
                {{ successMessage }}
              </p>

              <!-- SIGN UP -->

              <button
                type="submit"
                :disabled="submitting"
                class="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary-500 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <i v-if="submitting" class="pi pi-spin pi-spinner text-xs" />

                {{ submitting ? "Creating Account..." : "Sign Up" }}
              </button>

              <p class="pt-1 text-center text-xs text-muted">
                Already have an account?

                <button
                  type="button"
                  class="font-semibold text-primary-600 hover:text-primary-700"
                  @click="changeTab('login')"
                >
                  Log In
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";

import { useRouter } from "vue-router";

import api from "../../services/api.js";

import { useAuthStore } from "../../stores/auth.js";

import { siteConfig } from "../../config/site.js";

/*
|--------------------------------------------------------------------------
| PROPS
|--------------------------------------------------------------------------
*/

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },

  defaultTab: {
    type: String,
    default: "login",
  },
});

const emit = defineEmits(["update:modelValue"]);

/*
|--------------------------------------------------------------------------
| ROUTER / STORE
|--------------------------------------------------------------------------
*/

const router = useRouter();

const auth = useAuthStore();

/*
|--------------------------------------------------------------------------
| VIEW
|--------------------------------------------------------------------------
|
| Possible:
|
| login
| signup
| forgot
|
*/

const view = ref(props.defaultTab === "signup" ? "signup" : "login");

/*
|--------------------------------------------------------------------------
| STATE
|--------------------------------------------------------------------------
*/

const submitting = ref(false);

const errorMessage = ref("");

const successMessage = ref("");

const showLoginPassword = ref(false);

const showRegisterPassword = ref(false);

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

const loginForm = reactive({
  identifier: "",
  password: "",
});

/*
|--------------------------------------------------------------------------
| REGISTER
|--------------------------------------------------------------------------
*/

const registerForm = reactive({
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
});

/*
|--------------------------------------------------------------------------
| FORGOT PASSWORD
|--------------------------------------------------------------------------
*/

const forgotEmail = ref("");

const forgotSubmitting = ref(false);

const forgotError = ref("");

const forgotSuccess = ref("");

/*
|--------------------------------------------------------------------------
| FEATURES
|--------------------------------------------------------------------------
*/

const features = [
  {
    title: "Local Guides",

    text: "Expert local knowledge",

    icon: "pi pi-map-marker",
  },

  {
    title: "Best Price",

    text: "Clear & affordable",

    icon: "pi pi-dollar",
  },

  {
    title: "Safe & Reliable",

    text: "Travel confidently",

    icon: "pi pi-shield",
  },

  {
    title: "Island Experience",

    text: "Great memories",

    icon: "pi pi-sun",
  },
];

/*
|--------------------------------------------------------------------------
| LEFT TITLE
|--------------------------------------------------------------------------
*/

const leftTitle = computed(() => {
  if (view.value === "forgot") {
    return "Reset Your Password";
  }

  if (view.value === "signup") {
    return "Create Your Account";
  }

  return "Welcome Back";
});

/*
|--------------------------------------------------------------------------
| LEFT DESCRIPTION
|--------------------------------------------------------------------------
*/

const leftDescription = computed(() => {
  if (view.value === "forgot") {
    return "Enter your email and we'll help you securely recover access to your account.";
  }

  if (view.value === "signup") {
    return "Join us and start exploring the beauty and adventures of Koh Rong.";
  }

  return "Sign in and continue exploring beautiful Koh Rong.";
});

/*
|--------------------------------------------------------------------------
| MOBILE TITLE
|--------------------------------------------------------------------------
*/

const mobileTitle = computed(() => {
  if (view.value === "forgot") {
    return "Forgot Password";
  }

  if (view.value === "signup") {
    return "Create Your Account";
  }

  return "Welcome Back";
});

/*
|--------------------------------------------------------------------------
| TAB
|--------------------------------------------------------------------------
*/

function tabClass(tab) {
  const active = view.value === tab;

  return [
    "flex",
    "flex-1",
    "items-center",
    "justify-center",
    "gap-2",
    "rounded-lg",
    "px-3",
    "py-2",
    "text-xs",
    "font-semibold",
    "transition",
    "duration-200",

    active
      ? "bg-primary-500 text-white shadow-sm"
      : "text-slate-500 hover:bg-white hover:text-primary-600",
  ];
}

function changeTab(tab) {
  view.value = tab;

  errorMessage.value = "";

  successMessage.value = "";

  forgotError.value = "";

  forgotSuccess.value = "";
}

/*
|--------------------------------------------------------------------------
| FORGOT PASSWORD VIEW
|--------------------------------------------------------------------------
*/

function openForgotPassword() {
  forgotEmail.value = loginForm.identifier.includes("@")
    ? loginForm.identifier
    : "";

  forgotError.value = "";

  forgotSuccess.value = "";

  errorMessage.value = "";

  view.value = "forgot";
}

function backToLogin() {
  view.value = "login";

  forgotError.value = "";

  forgotSuccess.value = "";
}

function resetForgotPassword() {
  forgotEmail.value = "";

  forgotError.value = "";

  forgotSuccess.value = "";
}

/*
|--------------------------------------------------------------------------
| SEND RESET LINK
|--------------------------------------------------------------------------
*/

async function sendResetLink() {
  forgotError.value = "";

  forgotSuccess.value = "";

  const email = forgotEmail.value.trim().toLowerCase();

  if (!email) {
    forgotError.value = "Please enter your email address.";

    return;
  }

  /*
   * Simple frontend email check.
   */

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    forgotError.value = "Please enter a valid email address.";

    return;
  }

  forgotSubmitting.value = true;

  try {
    const response = await api.post("/auth/forgot-password", {
      email,
    });

    /*
     * Backend should always use
     * a generic response.
     */

    forgotSuccess.value =
      response.data?.message ||
      "If an account exists with that email, a password reset link has been sent.";
  } catch (error) {
    forgotError.value =
      error.response?.data?.message ||
      error.message ||
      "Unable to send password reset email.";
  } finally {
    forgotSubmitting.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| CLOSE
|--------------------------------------------------------------------------
*/

function close() {
  emit("update:modelValue", false);
}

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

async function login() {
  errorMessage.value = "";

  if (!loginForm.identifier || !loginForm.password) {
    errorMessage.value = "Email/username and password are required.";

    return;
  }

  submitting.value = true;

  try {
    const response = await api.post("/auth/login", {
      identifier: loginForm.identifier,

      password: loginForm.password,
    });

    const token = response.data?.token;

    const user = response.data?.user;

    if (!token || !user) {
      throw new Error("Login response is incomplete.");
    }

    /*
    |--------------------------------------------------------------------------
    | SAVE AUTH
    |--------------------------------------------------------------------------
    */

    localStorage.setItem("token", token);

    localStorage.setItem("user", JSON.stringify(user));

    auth.$patch({
      token,
      user,
    });

    /*
    |--------------------------------------------------------------------------
    | CLEAR PASSWORD
    |--------------------------------------------------------------------------
    */

    loginForm.password = "";

    close();

    /*
    |--------------------------------------------------------------------------
    | ADMIN REDIRECT
    |--------------------------------------------------------------------------
    */

    if (["ADMIN", "SUPER_ADMIN", "STAFF"].includes(user.role)) {
      await router.push("/admin/dashboard");
    }
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || error.message || "Unable to login.";
  } finally {
    submitting.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| REGISTER
|--------------------------------------------------------------------------
*/

async function register() {
  errorMessage.value = "";

  successMessage.value = "";

  if (
    !registerForm.firstName ||
    !registerForm.lastName ||
    !registerForm.username ||
    !registerForm.email ||
    !registerForm.phone ||
    !registerForm.password
  ) {
    errorMessage.value = "Please complete all required fields.";

    return;
  }

  if (registerForm.password.length < 8) {
    errorMessage.value = "Password must be at least 8 characters.";

    return;
  }

  if (registerForm.password !== registerForm.confirmPassword) {
    errorMessage.value = "Password confirmation does not match.";

    return;
  }

  if (!registerForm.acceptTerms) {
    errorMessage.value =
      "Please accept the Terms of Service and Privacy Policy.";

    return;
  }

  submitting.value = true;

  try {
    await api.post("/auth/register", {
      firstName: registerForm.firstName,

      lastName: registerForm.lastName,

      username: registerForm.username,

      email: registerForm.email,

      phone: registerForm.phone,

      password: registerForm.password,
    });

    successMessage.value = "Account created successfully.";

    loginForm.identifier = registerForm.email;

    /*
    |--------------------------------------------------------------------------
    | CLEAR SENSITIVE FIELDS
    |--------------------------------------------------------------------------
    */

    registerForm.password = "";

    registerForm.confirmPassword = "";

    /*
    |--------------------------------------------------------------------------
    | SWITCH TO LOGIN
    |--------------------------------------------------------------------------
    */

    setTimeout(() => {
      view.value = "login";

      successMessage.value = "";
    }, 700);
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message ||
      error.message ||
      "Unable to create account.";
  } finally {
    submitting.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| WHEN DIALOG OPENS
|--------------------------------------------------------------------------
*/

watch(
  () => props.modelValue,

  (visible) => {
    document.body.style.overflow = visible ? "hidden" : "";

    if (visible) {
      view.value = props.defaultTab === "signup" ? "signup" : "login";

      errorMessage.value = "";

      successMessage.value = "";

      forgotError.value = "";

      forgotSuccess.value = "";
    }
  },
);

/*
|--------------------------------------------------------------------------
| DEFAULT TAB CHANGE
|--------------------------------------------------------------------------
*/

watch(
  () => props.defaultTab,

  (tab) => {
    if (props.modelValue) {
      view.value = tab === "signup" ? "signup" : "login";
    }
  },
);

/*
|--------------------------------------------------------------------------
| ESC
|--------------------------------------------------------------------------
*/

function handleKeydown(event) {
  if (event.key === "Escape" && props.modelValue) {
    close();
  }
}

/*
|--------------------------------------------------------------------------
| INIT
|--------------------------------------------------------------------------
*/

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

/*
|--------------------------------------------------------------------------
| CLEANUP
|--------------------------------------------------------------------------
*/

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);

  document.body.style.overflow = "";
});
</script>

<style scoped>
.compact-label {
  @apply mb-1 block text-xs font-medium text-heading;
}

.compact-input {
  @apply h-9 w-full rounded-lg border border-border bg-white px-3 text-xs text-heading outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10;
}
</style>
