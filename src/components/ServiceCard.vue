<template>
  <article
    class="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white transition duration-300 hover:-translate-y-1 hover:shadow-soft"
  >
    <!-- ====================================================== -->
    <!-- IMAGE -->
    <!-- ====================================================== -->

    <div class="relative h-56 overflow-hidden sm:h-60 lg:h-64">
      <img
        :src="imageSrc"
        :alt="service.name"
        class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        @error="handleImageError"
      />

      <!-- LIGHT IMAGE OVERLAY -->

      <div
        class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"
      />

      <!-- CATEGORY -->

      <span
        v-if="categoryName"
        class="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-heading shadow-sm backdrop-blur"
      >
        {{ categoryName }}
      </span>
    </div>

    <!-- ====================================================== -->
    <!-- CONTENT -->
    <!-- ====================================================== -->

    <div class="relative flex flex-1 flex-col px-5 pb-5 pt-7">
      <!-- ==================================================== -->
      <!-- PRICE -->
      <!-- ==================================================== -->

      <span
        class="absolute -top-3 left-4 inline-flex items-center rounded-md bg-primary-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm"
      >
        {{ formattedPrice }}
      </span>

      <!-- ==================================================== -->
      <!-- TITLE -->
      <!-- ==================================================== -->

      <h3
        class="line-clamp-2 min-h-[56px] text-lg font-semibold leading-7 text-heading"
      >
        {{ service.name }}
      </h3>

      <!-- ==================================================== -->
      <!-- DESCRIPTION -->
      <!-- ==================================================== -->

      <p
        v-if="plainDescription"
        class="mt-2 line-clamp-2 text-sm leading-6 text-muted"
      >
        {{ plainDescription }}
      </p>

      <!-- PUSH BUTTON TO BOTTOM -->

      <div class="flex-1" />

      <!-- ==================================================== -->
      <!-- FOOTER -->
      <!-- ==================================================== -->

      <div class="mt-6 flex items-center justify-end">
        <Button
          label="Read More"
          icon="pi pi-chevron-right"
          icon-pos="right"
          rounded
          size="small"
          class="!border-primary-500 !bg-primary-500 !px-5 !py-2.5 !font-semibold !text-white transition hover:!border-primary-600 hover:!bg-primary-600"
          @click="goToDetail"
        />
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed, ref } from "vue";

import { useRouter } from "vue-router";

import Button from "primevue/button";

/*
|--------------------------------------------------------------------------
| PROPS
|--------------------------------------------------------------------------
*/

const props = defineProps({
  service: {
    type: Object,
    required: true,
  },
});

/*
|--------------------------------------------------------------------------
| ROUTER
|--------------------------------------------------------------------------
*/

const router = useRouter();

/*
|--------------------------------------------------------------------------
| FALLBACK
|--------------------------------------------------------------------------
*/

const fallback =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80";

const imageError = ref(false);

/*
|--------------------------------------------------------------------------
| IMAGE
|--------------------------------------------------------------------------
*/

const imageSrc = computed(() => {
  if (imageError.value) {
    return fallback;
  }

  return props.service?.thumbnail || props.service?.images?.[0] || fallback;
});

/*
|--------------------------------------------------------------------------
| CATEGORY
|--------------------------------------------------------------------------
*/

const categoryName = computed(() => {
  return props.service?.cate_id?.name || "Adventure";
});

/*
|--------------------------------------------------------------------------
| PRICE
|--------------------------------------------------------------------------
*/

const formattedPrice = computed(() => {
  const price = Number(props.service?.price || 0);

  return `$${price.toFixed(2)}`;
});

/*
|--------------------------------------------------------------------------
| DESCRIPTION
|--------------------------------------------------------------------------
|
| Your service description may contain HTML
| from PrimeVue Editor.
|
| Service card should display plain text only.
|
*/

const plainDescription = computed(() => {
  const html = String(props.service?.description || "");

  if (!html) {
    return "";
  }

  const element = document.createElement("div");

  element.innerHTML = html;

  return (element.textContent || element.innerText || "").trim();
});

/*
|--------------------------------------------------------------------------
| IMAGE ERROR
|--------------------------------------------------------------------------
*/

function handleImageError() {
  imageError.value = true;
}

/*
|--------------------------------------------------------------------------
| DETAIL
|--------------------------------------------------------------------------
*/

function goToDetail() {
  if (!props.service?._id) {
    return;
  }

  router.push(`/services/${props.service._id}`);
}
</script>
