import { computed, ref } from "vue";

import { defineStore } from "pinia";

import api from "../services/api.js";

const TOKEN_KEY = "token";

const USER_KEY = "user";

function readStoredUser() {
  try {
    const value = localStorage.getItem(USER_KEY);

    if (!value) {
      return null;
    }

    return JSON.parse(value);
  } catch {
    return null;
  }
}

export const useAuthStore = defineStore("auth", () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || "");

  const user = ref(readStoredUser());

  const loading = ref(false);

  /*
      |--------------------------------------------------------------------------
      | COMPUTED
      |--------------------------------------------------------------------------
      */

  const isAuthenticated = computed(() => Boolean(token.value && user.value));

  const isAdmin = computed(() =>
    ["SUPER_ADMIN", "ADMIN", "STAFF"].includes(user.value?.role),
  );

  const isCustomer = computed(() => user.value?.role === "CUSTOMER");

  /*
      |--------------------------------------------------------------------------
      | SAVE SESSION
      |--------------------------------------------------------------------------
      */

  function saveSession(newToken, newUser) {
    token.value = newToken;

    user.value = newUser;

    localStorage.setItem(TOKEN_KEY, newToken);

    localStorage.setItem(USER_KEY, JSON.stringify(newUser));

    api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
  }

  /*
      |--------------------------------------------------------------------------
      | LOGIN
      |--------------------------------------------------------------------------
      */

  async function login(credentials) {
    loading.value = true;

    try {
      const response = await api.post("/auth/login", credentials);

      const newToken = response.data.token;

      const newUser = response.data.user;

      if (!newToken) {
        throw new Error("Authentication token was not returned.");
      }

      if (!newUser) {
        throw new Error("User information was not returned.");
      }

      saveSession(newToken, newUser);

      return newUser;
    } finally {
      loading.value = false;
    }
  }

  /*
      |--------------------------------------------------------------------------
      | REGISTER
      |--------------------------------------------------------------------------
      */

  async function register(payload) {
    loading.value = true;

    try {
      const response = await api.post("/auth/register", payload);

      saveSession(response.data.token, response.data.user);

      return response.data.user;
    } finally {
      loading.value = false;
    }
  }

  /*
      |--------------------------------------------------------------------------
      | CURRENT USER
      |--------------------------------------------------------------------------
      */

  async function loadCurrentUser() {
    const currentToken = localStorage.getItem(TOKEN_KEY);

    if (!currentToken) {
      token.value = "";

      user.value = null;

      return null;
    }

    token.value = currentToken;

    api.defaults.headers.common.Authorization = `Bearer ${currentToken}`;

    try {
      const response = await api.get("/auth/me");

      user.value = response.data.user;

      localStorage.setItem(USER_KEY, JSON.stringify(user.value));

      return user.value;
    } catch (error) {
      logout();

      throw error;
    }
  }

  /*
      |--------------------------------------------------------------------------
      | UPDATE PROFILE
      |--------------------------------------------------------------------------
      */

  async function updateProfile(payload) {
    const response = await api.patch("/auth/me", payload);

    user.value = response.data.user;

    localStorage.setItem(USER_KEY, JSON.stringify(user.value));

    return user.value;
  }

  /*
      |--------------------------------------------------------------------------
      | PASSWORD
      |--------------------------------------------------------------------------
      */

  async function changePassword(payload) {
    const response = await api.patch("/auth/change-password", payload);

    return response.data;
  }

  /*
      |--------------------------------------------------------------------------
      | LOGOUT
      |--------------------------------------------------------------------------
      */

  function logout() {
    token.value = "";

    user.value = null;

    localStorage.removeItem(TOKEN_KEY);

    localStorage.removeItem(USER_KEY);

    delete api.defaults.headers.common.Authorization;
  }

  return {
    token,
    user,
    loading,

    isAuthenticated,
    isAdmin,
    isCustomer,

    login,
    register,
    loadCurrentUser,
    updateProfile,
    changePassword,
    logout,
  };
});
