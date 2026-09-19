<template>
  <div class="mx-auto max-w-4xl space-y-6">
    <!-- ====================================================== -->
    <!-- HEADER -->
    <!-- ====================================================== -->

    <div>
      <h1 class="text-3xl font-bold text-slate-900">My Profile</h1>

      <p class="mt-1 text-sm text-slate-500">
        Manage your account information, profile photo and password.
      </p>
    </div>

    <!-- ====================================================== -->
    <!-- LOADING -->
    <!-- ====================================================== -->

    <Card v-if="loading" class="!rounded-2xl">
      <template #content>
        <div class="flex min-h-64 items-center justify-center">
          <div class="text-center text-slate-500">
            <i class="pi pi-spin pi-spinner text-3xl text-[#0E7490]" />

            <p class="mt-3">Loading profile...</p>
          </div>
        </div>
      </template>
    </Card>

    <!-- ====================================================== -->
    <!-- PROFILE -->
    <!-- ====================================================== -->

    <Card v-else class="!rounded-2xl">
      <template #content>
        <div class="space-y-7">
          <!-- ================================================== -->
          <!-- AVATAR -->
          <!-- ================================================== -->

          <div class="flex flex-col gap-5 sm:flex-row sm:items-center">
            <!-- PHOTO -->

            <div class="relative h-28 w-28 shrink-0">
              <!-- IMAGE -->

              <img
                v-if="form.avatar && !avatarLoadFailed"
                :src="form.avatar"
                :alt="form.username || 'Profile photo'"
                class="h-28 w-28 rounded-full border-4 border-white object-cover shadow-md"
                @load="handleAvatarLoaded"
                @error="handleAvatarError"
              />

              <!-- INITIALS -->

              <Avatar
                v-else
                :label="initials"
                shape="circle"
                class="!h-28 !w-28 !bg-[#0E7490] !text-3xl !font-bold !text-white shadow-md"
              />

              <!-- UPLOAD OVERLAY -->

              <div
                v-if="uploadingAvatar"
                class="absolute inset-0 grid place-items-center rounded-full bg-black/50"
              >
                <i class="pi pi-spin pi-spinner text-2xl text-white" />
              </div>
            </div>

            <!-- PHOTO ACTION -->

            <div class="flex-1">
              <h3 class="text-lg font-semibold text-slate-900">
                Profile Photo
              </h3>

              <p class="mt-1 text-sm text-slate-500">
                Upload a JPG, PNG or WEBP image. Maximum file size is 8 MB.
              </p>

              <div class="mt-4 flex flex-wrap gap-2">
                <FileUpload
                  mode="basic"
                  name="image"
                  accept="image/jpeg,image/png,image/webp"
                  :max-file-size="8000000"
                  choose-label="Upload Photo"
                  choose-icon="pi pi-camera"
                  custom-upload
                  auto
                  :disabled="uploadingAvatar || saving"
                  @uploader="uploadAvatar"
                />

                <Button
                  v-if="form.avatar"
                  label="Remove"
                  icon="pi pi-trash"
                  severity="danger"
                  text
                  :disabled="uploadingAvatar || saving"
                  @click="removeAvatar"
                />
              </div>

              <!-- CURRENT URL DEV INFO -->

              <p
                v-if="form.avatar && avatarLoadFailed"
                class="mt-3 text-xs text-red-500"
              >
                The profile image URL exists, but the browser could not load the
                image.
              </p>
            </div>
          </div>

          <Divider />

          <!-- ================================================== -->
          <!-- ACCOUNT -->
          <!-- ================================================== -->

          <div>
            <h3 class="text-lg font-semibold text-slate-900">
              Account Information
            </h3>

            <p class="mt-1 text-sm text-slate-500">
              Keep your admin profile simple and up to date.
            </p>
          </div>

          <div class="grid gap-5 md:grid-cols-2">
            <!-- USERNAME -->

            <div>
              <label class="label"> Username </label>

              <InputText
                v-model="form.username"
                class="w-full"
                placeholder="Username"
                :disabled="saving"
              />
            </div>

            <!-- EMAIL -->

            <div>
              <label class="label"> Email </label>

              <InputText
                v-model="form.email"
                type="email"
                class="w-full"
                placeholder="admin@example.com"
                :disabled="saving"
              />
            </div>

            <!-- ROLE -->

            <div>
              <label class="label"> Role </label>

              <InputText :model-value="roleLabel" class="w-full" disabled />
            </div>

            <!-- STATUS -->

            <div>
              <label class="label"> Status </label>

              <div class="flex min-h-[42px] items-center">
                <Tag :value="form.status || '-'" :severity="statusSeverity" />
              </div>
            </div>
          </div>

          <!-- ERROR -->

          <Message v-if="profileError" severity="error" :closable="false">
            {{ profileError }}
          </Message>

          <!-- ACTION -->

          <div class="flex justify-end">
            <Button
              label="Save Profile"
              icon="pi pi-save"
              :loading="saving"
              :disabled="uploadingAvatar"
              @click="saveProfile"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- ====================================================== -->
    <!-- PASSWORD -->
    <!-- ====================================================== -->

    <Card v-if="!loading" class="!rounded-2xl">
      <template #content>
        <div
          class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex items-center gap-4">
            <div
              class="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-cyan-50 text-[#0E7490]"
            >
              <i class="pi pi-lock text-xl" />
            </div>

            <div>
              <h3 class="font-semibold text-slate-900">Password</h3>

              <p class="mt-1 text-sm text-slate-500">
                Reset your password without entering your current password.
              </p>
            </div>
          </div>

          <Button
            label="Reset Password"
            icon="pi pi-key"
            severity="secondary"
            outlined
            @click="openPasswordDialog"
          />
        </div>
      </template>
    </Card>

    <!-- ====================================================== -->
    <!-- RESET PASSWORD -->
    <!-- ====================================================== -->

    <Dialog
      v-model:visible="passwordVisible"
      modal
      header="Reset Password"
      :style="{
        width: '30rem',
      }"
      :breakpoints="{
        '640px': '94vw',
      }"
      :closable="!resettingPassword"
    >
      <div class="space-y-5">
        <!-- NEW PASSWORD -->

        <div>
          <label class="label"> New Password </label>

          <Password
            v-model="passwordForm.newPassword"
            class="w-full"
            input-class="w-full"
            placeholder="Enter new password"
            toggle-mask
            :feedback="true"
            :disabled="resettingPassword"
          />
        </div>

        <!-- CONFIRM -->

        <div>
          <label class="label"> Confirm Password </label>

          <Password
            v-model="passwordForm.confirmPassword"
            class="w-full"
            input-class="w-full"
            placeholder="Confirm new password"
            toggle-mask
            :feedback="false"
            :disabled="resettingPassword"
            @keyup.enter="resetPassword"
          />
        </div>

        <Message severity="info" :closable="false">
          Password must contain at least 8 characters.
        </Message>

        <Message v-if="passwordError" severity="error" :closable="false">
          {{ passwordError }}
        </Message>
      </div>

      <template #footer>
        <Button
          label="Cancel"
          icon="pi pi-times"
          severity="secondary"
          outlined
          :disabled="resettingPassword"
          @click="passwordVisible = false"
        />

        <Button
          label="Reset Password"
          icon="pi pi-key"
          :loading="resettingPassword"
          @click="resetPassword"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";

import { useToast } from "primevue/usetoast";

import Avatar from "primevue/avatar";
import Button from "primevue/button";
import Card from "primevue/card";
import Dialog from "primevue/dialog";
import Divider from "primevue/divider";
import FileUpload from "primevue/fileupload";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Password from "primevue/password";
import Tag from "primevue/tag";

import api from "../../services/api.js";

import { useAuthStore } from "../../stores/auth.js";

/*
|--------------------------------------------------------------------------
| SERVICES
|--------------------------------------------------------------------------
*/

const auth = useAuthStore();

const toast = useToast();

/*
|--------------------------------------------------------------------------
| STATE
|--------------------------------------------------------------------------
*/

const loading = ref(true);

const saving = ref(false);

const uploadingAvatar = ref(false);

const profileError = ref("");

const avatarLoadFailed = ref(false);

const passwordVisible = ref(false);

const resettingPassword = ref(false);

const passwordError = ref("");

/*
|--------------------------------------------------------------------------
| PROFILE FORM
|--------------------------------------------------------------------------
*/

const form = reactive({
  username: "",
  email: "",
  avatar: "",
  role: "",
  status: "",
});

/*
|--------------------------------------------------------------------------
| PASSWORD FORM
|--------------------------------------------------------------------------
*/

const passwordForm = reactive({
  newPassword: "",
  confirmPassword: "",
});

/*
|--------------------------------------------------------------------------
| INITIALS
|--------------------------------------------------------------------------
*/

const initials = computed(() => {
  const username = String(form.username || form.email || "AD").trim();

  if (!username) {
    return "AD";
  }

  const parts = username.split(/\s+/).filter(Boolean);

  if (parts.length > 1) {
    return parts
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }

  return username.slice(0, 2).toUpperCase();
});

/*
|--------------------------------------------------------------------------
| ROLE LABEL
|--------------------------------------------------------------------------
*/

const roleLabel = computed(() => {
  switch (form.role) {
    case "SUPER_ADMIN":
      return "Super Admin";

    case "ADMIN":
      return "Admin";

    case "STAFF":
      return "Staff";

    case "CUSTOMER":
      return "Customer";

    default:
      return form.role || "-";
  }
});

/*
|--------------------------------------------------------------------------
| STATUS
|--------------------------------------------------------------------------
*/

const statusSeverity = computed(() => {
  switch (form.status) {
    case "ACTIVE":
      return "success";

    case "BLOCKED":
      return "danger";

    case "INACTIVE":
      return "secondary";

    default:
      return "secondary";
  }
});

/*
|--------------------------------------------------------------------------
| ERROR MESSAGE
|--------------------------------------------------------------------------
*/

function getApiError(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong."
  );
}

/*
|--------------------------------------------------------------------------
| APPLY USER
|--------------------------------------------------------------------------
|
| This function is important.
|
| Every time GET /auth/me or PATCH /auth/me
| returns the latest user, use this function.
|
*/

function applyUser(user) {
  if (!user) {
    return;
  }

  form.username = user.username || "";

  form.email = user.email || "";

  form.avatar = user.avatar || "";

  form.role = user.role || "";

  form.status = user.status || "";

  avatarLoadFailed.value = false;

  /*
  |--------------------------------------------------------------------------
  | UPDATE AUTH STORE
  |--------------------------------------------------------------------------
  */

  try {
    auth.$patch({
      user,
    });
  } catch {
    /*
     * Fallback for setup-style store.
     */
    try {
      auth.user = user;
    } catch {
      // Ignore.
    }
  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE LOCAL STORAGE
  |--------------------------------------------------------------------------
  */

  localStorage.setItem("user", JSON.stringify(user));
}

/*
|--------------------------------------------------------------------------
| LOAD PROFILE
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| Never use localStorage as the primary source here.
|
| Always ask backend:
|
| GET /api/auth/me
|
*/

async function loadProfile() {
  loading.value = true;

  profileError.value = "";

  try {
    const response = await api.get("/auth/me");

    console.log("[PROFILE GET RESPONSE]", response.data);

    const user = response.data?.user;

    if (!user) {
      throw new Error("Profile data was not returned by the server.");
    }

    console.log("[PROFILE AVATAR FROM API]", user.avatar);

    applyUser(user);
  } catch (error) {
    console.error("[PROFILE LOAD ERROR]", error);

    profileError.value = getApiError(error);
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
  profileError.value = "";

  const username = String(form.username || "").trim();

  const email = String(form.email || "")
    .trim()
    .toLowerCase();

  if (!username) {
    profileError.value = "Username is required.";

    return;
  }

  if (!email) {
    profileError.value = "Email is required.";

    return;
  }

  saving.value = true;

  try {
    const response = await api.patch("/auth/me", {
      username,
      email,

      /*
       * Keep the currently saved avatar.
       */
      avatar: form.avatar || "",
    });

    console.log("[PROFILE SAVE RESPONSE]", response.data);

    const user = response.data?.user;

    if (!user) {
      throw new Error("Profile saved but updated user data was not returned.");
    }

    applyUser(user);

    toast.add({
      severity: "success",

      summary: "Profile Updated",

      detail: "Your profile was saved successfully.",

      life: 2500,
    });
  } catch (error) {
    console.error("[PROFILE SAVE ERROR]", error);

    profileError.value = getApiError(error);
  } finally {
    saving.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| EXTRACT CLOUDINARY URL
|--------------------------------------------------------------------------
|
| Supports:
|
| {
|   url: "..."
| }
|
| {
|   image: {
|      url: "..."
|   }
| }
|
| {
|   secure_url: "..."
| }
|
*/

function extractUploadedUrl(data) {
  return (
    data?.url ||
    data?.image?.url ||
    data?.image?.secure_url ||
    data?.secure_url ||
    ""
  );
}

/*
|--------------------------------------------------------------------------
| UPLOAD AVATAR
|--------------------------------------------------------------------------
*/

async function uploadAvatar(event) {
  const file = event.files?.[0];

  if (!file) {
    return;
  }

  uploadingAvatar.value = true;

  profileError.value = "";

  try {
    /*
    |--------------------------------------------------------------------------
    | 1. UPLOAD TO CLOUDINARY
    |--------------------------------------------------------------------------
    */

    const formData = new FormData();

    formData.append("image", file);

    formData.append("folder", "explore-kohrong/admin-profiles");

    const uploadResponse = await api.post("/uploads/image", formData);

    console.log("[UPLOAD RESPONSE]", uploadResponse.data);

    /*
    |--------------------------------------------------------------------------
    | 2. GET URL
    |--------------------------------------------------------------------------
    */

    const avatarUrl =
      uploadResponse.data?.url ||
      uploadResponse.data?.image?.url ||
      uploadResponse.data?.secure_url ||
      "";

    console.log("[AVATAR URL]", avatarUrl);

    if (!avatarUrl) {
      throw new Error("Image uploaded but no URL returned.");
    }

    /*
    |--------------------------------------------------------------------------
    | 3. THIS IS THE IMPORTANT REQUEST
    |--------------------------------------------------------------------------
    |
    | Cloudinary upload alone does NOT update User.avatar.
    |
    */

    const profileResponse = await api.patch("/auth/me", {
      avatar: avatarUrl,
    });

    console.log("[PROFILE SAVE RESPONSE]", profileResponse.data);

    /*
    |--------------------------------------------------------------------------
    | 4. UPDATE UI
    |--------------------------------------------------------------------------
    */

    const user = profileResponse.data?.user;

    if (!user) {
      throw new Error("Updated user was not returned.");
    }

    form.avatar = user.avatar || "";

    form.username = user.username || "";

    form.email = user.email || "";

    form.role = user.role || "";

    form.status = user.status || "";

    auth.$patch({
      user,
    });

    localStorage.setItem("user", JSON.stringify(user));

    toast.add({
      severity: "success",

      summary: "Photo Updated",

      detail: "Profile photo saved successfully.",

      life: 2500,
    });
  } catch (error) {
    console.error("[PROFILE PHOTO ERROR]", error);

    profileError.value =
      error.response?.data?.message ||
      error.message ||
      "Unable to update profile photo.";
  } finally {
    uploadingAvatar.value = false;
  }
}
/*
|--------------------------------------------------------------------------
| REMOVE AVATAR
|--------------------------------------------------------------------------
*/

async function removeAvatar() {
  uploadingAvatar.value = true;

  profileError.value = "";

  try {
    /*
     * Save blank avatar to database.
     */

    const response = await api.patch("/auth/me", {
      avatar: "",
    });

    const user = response.data?.user;

    if (user) {
      applyUser(user);
    } else {
      form.avatar = "";
    }

    avatarLoadFailed.value = false;

    toast.add({
      severity: "success",

      summary: "Photo Removed",

      detail: "Profile photo removed successfully.",

      life: 2200,
    });
  } catch (error) {
    console.error("[REMOVE AVATAR ERROR]", error);

    profileError.value = getApiError(error);
  } finally {
    uploadingAvatar.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| IMAGE LOAD
|--------------------------------------------------------------------------
*/

function handleAvatarLoaded() {
  avatarLoadFailed.value = false;

  console.log("[AVATAR IMAGE LOADED]", form.avatar);
}

function handleAvatarError(event) {
  avatarLoadFailed.value = true;

  console.error("[AVATAR IMAGE LOAD FAILED]", form.avatar);

  console.error(event);
}

/*
|--------------------------------------------------------------------------
| OPEN PASSWORD
|--------------------------------------------------------------------------
*/

function openPasswordDialog() {
  passwordForm.newPassword = "";

  passwordForm.confirmPassword = "";

  passwordError.value = "";

  passwordVisible.value = true;
}

/*
|--------------------------------------------------------------------------
| RESET PASSWORD
|--------------------------------------------------------------------------
*/

async function resetPassword() {
  passwordError.value = "";

  const newPassword = String(passwordForm.newPassword || "");

  const confirmPassword = String(passwordForm.confirmPassword || "");

  if (!newPassword) {
    passwordError.value = "New password is required.";

    return;
  }

  if (newPassword.length < 8) {
    passwordError.value = "Password must contain at least 8 characters.";

    return;
  }

  if (newPassword !== confirmPassword) {
    passwordError.value = "Password confirmation does not match.";

    return;
  }

  resettingPassword.value = true;

  try {
    await api.patch("/auth/reset-password", {
      newPassword,
      confirmPassword,
    });

    passwordVisible.value = false;

    passwordForm.newPassword = "";

    passwordForm.confirmPassword = "";

    toast.add({
      severity: "success",

      summary: "Password Reset",

      detail: "Your password was reset successfully.",

      life: 3000,
    });
  } catch (error) {
    console.error("[RESET PASSWORD ERROR]", error);

    passwordError.value = getApiError(error);
  } finally {
    resettingPassword.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| INIT
|--------------------------------------------------------------------------
*/

onMounted(loadProfile);
</script>
