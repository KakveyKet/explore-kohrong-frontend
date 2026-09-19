import { createRouter, createWebHistory } from "vue-router";

/*
|--------------------------------------------------------------------------
| LAYOUT
|--------------------------------------------------------------------------
*/

import PublicLayout from "../layouts/PublicLayout.vue";

import AdminLayout from "../layouts/AdminLayout.vue";

/*
|--------------------------------------------------------------------------
| PUBLIC
|--------------------------------------------------------------------------
*/

import HomeView from "../views/public/HomeView.vue";

import ServicesView from "../views/public/ServicesView.vue";

import ServiceDetailView from "../views/public/ServiceDetailView.vue";

import BookingView from "../views/public/BookingView.vue";

import BookingSuccessView from "../views/public/BookingSuccessView.vue";

import BlogView from "../views/public/BlogView.vue";

import BlogDetailView from "../views/public/BlogDetailView.vue";

import ContactView from "../views/public/ContactView.vue";

import CustomerLoginView from "../views/public/CustomerLoginView.vue";

import RegisterView from "../views/public/RegisterView.vue";

import MyBookingsView from "../views/public/MyBookingsView.vue";
import AboutView from "../views/public/AboutView.vue";
/*
|--------------------------------------------------------------------------
| ADMIN
|--------------------------------------------------------------------------
*/

import AdminLoginView from "../views/admin/AdminLoginView.vue";

import DashboardView from "../views/admin/DashboardView.vue";

import CategoriesView from "../views/admin/CategoriesView.vue";

import AdminServicesView from "../views/admin/AdminServicesView.vue";

import AdminBookingsView from "../views/admin/AdminBookingsView.vue";

import AdminBlogsView from "../views/admin/AdminBlogsView.vue";

import AdminReviewsView from "../views/admin/AdminReviewsView.vue";

import AdminUsersView from "../views/admin/AdminUsersView.vue";

import AdminReportsView from "../views/admin/AdminReportsView.vue";

import AdminProfileView from "../views/admin/AdminProfileView.vue";
import ProfileView from "../views/public/ProfileView.vue";
import ForgotPasswordView from "../views/public/ForgotPasswordView.vue";

import ResetPasswordView from "../views/public/ResetPasswordView.vue";
/*
|--------------------------------------------------------------------------
| ROUTES
|--------------------------------------------------------------------------
*/

const routes = [
  /*
  |--------------------------------------------------------------------------
  | PUBLIC
  |--------------------------------------------------------------------------
  */

  {
    path: "/",

    component: PublicLayout,

    children: [
      {
        path: "",

        name: "home",

        component: HomeView,
      },
      {
        path: "forgot-password",
        name: "forgot-password",
        component: ForgotPasswordView,
      },

      {
        path: "reset-password/:token",
        name: "reset-password",
        component: ResetPasswordView,
      },
      {
        path: "profile",

        name: "customer-profile",

        component: ProfileView,

        meta: {
          auth: true,
        },
      },
      {
        path: "about",

        name: "about",

        component: AboutView,
      },
      {
        path: "services",

        name: "services",

        component: ServicesView,
      },

      {
        path: "/services/:id",
        name: "service-detail",
        component: ServiceDetailView,
      },

      {
        path: "/booking",
        name: "booking",
        component: BookingView,
      },

      {
        path: "booking-success/:id",

        name: "booking-success",

        component: BookingSuccessView,

        meta: {
          auth: true,
        },
      },

      {
        path: "blogs",

        name: "blogs",

        component: BlogView,
      },

      {
        path: "blogs/:id",

        name: "blog-detail",

        component: BlogDetailView,
      },

      {
        path: "contact",

        name: "contact",

        component: ContactView,
      },

      {
        path: "login",

        name: "customer-login",

        component: CustomerLoginView,
      },

      {
        path: "register",

        name: "register",

        component: RegisterView,
      },

      {
        path: "my-bookings",

        name: "my-bookings",

        component: MyBookingsView,

        meta: {
          auth: true,
        },
      },
    ],
  },

  /*
  |--------------------------------------------------------------------------
  | ADMIN LOGIN
  |--------------------------------------------------------------------------
  */

  {
    path: "/admin/login",

    name: "admin-login",

    component: AdminLoginView,
  },

  /*
  |--------------------------------------------------------------------------
  | ADMIN
  |--------------------------------------------------------------------------
  */

  {
    path: "/admin",

    component: AdminLayout,

    meta: {
      auth: true,
      admin: true,
    },

    children: [
      {
        path: "",

        redirect: "/admin/dashboard",
      },

      /*
      |--------------------------------------------------------------------------
      | DASHBOARD
      |--------------------------------------------------------------------------
      */

      {
        path: "dashboard",

        name: "admin-dashboard",

        component: DashboardView,

        meta: {
          title: "Dashboard",
        },
      },

      /*
      |--------------------------------------------------------------------------
      | USERS
      |--------------------------------------------------------------------------
      */

      {
        path: "users",

        name: "admin-users",

        component: AdminUsersView,

        meta: {
          title: "Users",
        },
      },

      /*
      |--------------------------------------------------------------------------
      | CATEGORIES
      |--------------------------------------------------------------------------
      */

      {
        path: "categories",

        name: "admin-categories",

        component: CategoriesView,

        meta: {
          title: "Categories",
        },
      },

      /*
      |--------------------------------------------------------------------------
      | SERVICES
      |--------------------------------------------------------------------------
      */

      {
        path: "services",

        name: "admin-services",

        component: AdminServicesView,

        meta: {
          title: "Services",
        },
      },

      /*
      |--------------------------------------------------------------------------
      | BOOKINGS
      |--------------------------------------------------------------------------
      */

      {
        path: "bookings",

        name: "admin-bookings",

        component: AdminBookingsView,

        meta: {
          title: "Bookings",
        },
      },

      /*
      |--------------------------------------------------------------------------
      | REVIEWS
      |--------------------------------------------------------------------------
      */

      {
        path: "reviews",

        name: "admin-reviews",

        component: AdminReviewsView,

        meta: {
          title: "Reviews",
        },
      },

      /*
      |--------------------------------------------------------------------------
      | BLOGS
      |--------------------------------------------------------------------------
      */

      {
        path: "blogs",

        name: "admin-blogs",

        component: AdminBlogsView,

        meta: {
          title: "Blogs",
        },
      },

      /*
      |--------------------------------------------------------------------------
      | REPORTS
      |--------------------------------------------------------------------------
      |
      | Read-only booking history.
      |
      */

      {
        path: "reports",

        name: "admin-reports",

        component: AdminReportsView,

        meta: {
          title: "Booking History",
        },
      },

      /*
      |--------------------------------------------------------------------------
      | PROFILE
      |--------------------------------------------------------------------------
      */

      {
        path: "profile",

        name: "admin-profile",

        component: AdminProfileView,

        meta: {
          title: "My Profile",
        },
      },
    ],
  },

  /*
  |--------------------------------------------------------------------------
  | NOT FOUND
  |--------------------------------------------------------------------------
  */

  {
    path: "/:pathMatch(.*)*",

    redirect: "/",
  },
];

/*
|--------------------------------------------------------------------------
| ROUTER
|--------------------------------------------------------------------------
*/

const router = createRouter({
  history: createWebHistory(),

  routes,

  scrollBehavior() {
    return {
      top: 0,
    };
  },
});

/*
|--------------------------------------------------------------------------
| ROUTE GUARD
|--------------------------------------------------------------------------
*/

router.beforeEach((to) => {
  const token = localStorage.getItem("token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const adminRoles = ["SUPER_ADMIN", "ADMIN", "STAFF"];

  /*
    |--------------------------------------------------------------------------
    | ADMIN
    |--------------------------------------------------------------------------
    */

  if (to.matched.some((record) => record.meta.admin)) {
    if (!token || !adminRoles.includes(user?.role)) {
      return {
        path: "/admin/login",
      };
    }
  }

  /*
    |--------------------------------------------------------------------------
    | NORMAL AUTH
    |--------------------------------------------------------------------------
    */

  if (to.matched.some((record) => record.meta.auth) && !token) {
    return {
      path: "/login",

      query: {
        redirect: to.fullPath,
      },
    };
  }

  /*
    |--------------------------------------------------------------------------
    | ADMIN ALREADY LOGGED IN
    |--------------------------------------------------------------------------
    */

  if (to.path === "/admin/login" && token && adminRoles.includes(user?.role)) {
    return {
      path: "/admin/dashboard",
    };
  }

  return true;
});

export default router;
