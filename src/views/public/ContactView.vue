<template>
  <main class="bg-white">
    <!-- ======================================================
         FULL WIDTH COVER
    ======================================================= -->

    <section
      class="relative h-[260px] overflow-hidden sm:h-[320px] lg:h-[380px]"
    >
      <!-- COVER IMAGE -->

      <img
        src="https://res.cloudinary.com/dvljcimlz/image/upload/v1788886027/Mask_group_mw8ky8.png"
        alt="Explore Koh Rong"
        class="absolute inset-0 h-full w-full object-cover"
      />

      <!-- OVERLAY -->

      <div
        class="absolute inset-0 bg-gradient-to-r from-primary-950/75 via-primary-900/35 to-transparent"
      />

      <!-- BOTTOM SHADOW -->

      <div
        class="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent"
      />

      <!-- COVER CONTENT -->

      <div
        class="page relative z-10 flex h-full items-end pb-8 sm:pb-10 lg:pb-12"
      >
        <div class="max-w-2xl">
          <!-- EYEBROW -->

          <p
            class="text-xs font-semibold uppercase tracking-[0.2em] text-secondary-300 sm:text-sm"
          >
            Discover The Island
          </p>

          <!-- TITLE -->

          <h2
            class="mt-2 text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl"
          >
            Experience the Beauty of Koh Rong
          </h2>

          <!-- DESCRIPTION -->

          <p class="mt-3 max-w-xl text-sm leading-6 text-white sm:text-base">
            Beautiful beaches, crystal clear water and unforgettable island
            experiences are waiting for you.
          </p>
        </div>
      </div>
    </section>

    <!-- ======================================================
         CONTACT INFORMATION
    ======================================================= -->

    <section class="page py-10 sm:py-12 lg:py-14">
      <!-- HEADER -->

      <div class="mx-auto max-w-3xl text-center">
        <!-- EYEBROW -->

        <p
          class="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600 sm:text-sm"
        >
          Explore Koh Rong
        </p>

        <!-- TITLE -->

        <h1
          class="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-4xl"
        >
          Let's Plan Your Koh Rong Adventure
        </h1>

        <!-- DESCRIPTION -->

        <p
          class="mx-auto mt-3 max-w-2xl text-sm leading-6 text-black sm:text-base"
        >
          Get in touch with Explore Koh Rong using the platform that is most
          convenient for you.
        </p>
      </div>

      <!-- ======================================================
           CONTACT CARDS
      ======================================================= -->

      <div
        class="mx-auto mt-9 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <a
          v-for="contact in contacts"
          :key="contact.name"
          :href="contact.href"
          :target="contact.external ? '_blank' : undefined"
          :rel="contact.external ? 'noopener noreferrer' : undefined"
          class="group flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-border bg-white px-5 py-7 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary-200 hover:bg-primary-50/50 hover:shadow-soft"
        >
          <!-- ICON -->

          <div
            class="grid h-14 w-14 place-items-center rounded-2xl bg-primary-50 text-primary-600 transition duration-300 group-hover:bg-primary-500 group-hover:text-white"
          >
            <Icon :icon="contact.icon" class="h-6 w-6" />
          </div>

          <!-- NAME -->

          <h2
            class="mt-4 text-lg font-bold text-heading transition group-hover:text-primary-600"
          >
            {{ contact.name }}
          </h2>

          <!-- DESCRIPTION -->

          <p class="mt-1 text-sm leading-5 text-black">
            {{ contact.text }}
          </p>

          <!-- VALUE -->

          <p
            v-if="contact.value"
            class="mt-3 break-all text-sm font-semibold text-primary-600"
          >
            {{ contact.value }}
          </p>

          <!-- ACTION -->

          <div
            class="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600"
          >
            {{ contact.action }}

            <Icon
              icon="ri:arrow-right-line"
              class="h-4 w-4 transition duration-300 group-hover:translate-x-1"
            />
          </div>
        </a>
      </div>
    </section>

    <!-- ======================================================
         HELP SECTION
    ======================================================= -->

    <section class="page py-6 sm:py-8">
      <div
        class="mx-auto flex max-w-5xl flex-col gap-4 rounded-2xl bg-primary-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
      >
        <div class="flex items-start gap-3">
          <!-- ICON -->

          <div
            class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-100 text-primary-600"
          >
            <Icon icon="ri:customer-service-2-fill" class="h-5 w-5" />
          </div>

          <!-- CONTENT -->

          <div>
            <h3 class="font-semibold text-heading">
              Need help with a booking?
            </h3>

            <p class="mt-1 text-sm leading-6 text-black">
              WhatsApp is the fastest way to contact us about an existing
              booking.
            </p>
          </div>
        </div>

        <!-- WHATSAPP -->

        <a
          :href="whatsAppUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white transition duration-200 hover:bg-primary-600"
        >
          <Icon icon="ri:whatsapp-fill" class="h-4 w-4" />

          Contact WhatsApp
        </a>
      </div>
    </section>
  </main>
</template>
<script setup>
import { computed } from "vue";
import { Icon } from "@iconify/vue";

/*
|--------------------------------------------------------------------------
| CONTACT INFORMATION
|--------------------------------------------------------------------------
*/

const businessEmail = "explorekohrong@gmail.com";

const phoneNumber = "+855 88 579 2065";

/*
 * WhatsApp requires the number without:
 * +
 * spaces
 * dashes
 */
const whatsAppNumber = "855885792065";

/*
|--------------------------------------------------------------------------
| SOCIAL LINKS
|--------------------------------------------------------------------------
*/

const telegramUsername = "@norea_yem";

const telegramUrl = "https://t.me/norea_yem";

/*
 * Facebook and Instagram will be updated in the next step.
 */
const instagramUrl = "#";
const facebookUrl = "#";

/*
|--------------------------------------------------------------------------
| WHATSAPP
|--------------------------------------------------------------------------
*/

const whatsAppUrl = computed(() => {
  return `https://wa.me/${whatsAppNumber}`;
});

/*
|--------------------------------------------------------------------------
| CONTACTS
|--------------------------------------------------------------------------
*/

const contacts = computed(() => [
  {
    name: "Email",

    text: "Send us an email for questions and booking support.",

    value: businessEmail,

    icon: "ri:mail-fill",

    href: `mailto:${businessEmail}`,

    action: "Send Email",

    external: false,
  },

  {
    name: "Phone",

    text: "Call us directly if you need quick assistance.",

    value: phoneNumber,

    icon: "ri:phone-fill",

    href: "tel:+855885792065",

    action: "Call Now",

    external: false,
  },

  {
    name: "Telegram",

    text: "Chat with us through Telegram.",

    value: telegramUsername,

    icon: "ri:telegram-2-fill",

    href: telegramUrl,

    action: "Open Telegram",

    external: true,
  },

  {
    name: "WhatsApp",

    text: "Message us directly about your booking.",

    value: phoneNumber,

    icon: "ri:whatsapp-fill",

    href: whatsAppUrl.value,

    action: "Open WhatsApp",

    external: true,
  },

  {
    name: "Instagram",

    text: "Follow our latest Koh Rong experiences.",

    value: "",

    icon: "ri:instagram-fill",

    href: instagramUrl,

    action: "View Instagram",

    external: true,
  },

  {
    name: "Facebook",

    text: "Follow updates and contact us on Facebook.",

    value: "",

    icon: "ri:facebook-circle-fill",

    href: facebookUrl,

    action: "View Facebook",

    external: true,
  },
]);
</script>
