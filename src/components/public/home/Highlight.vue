<template>
  <section class="bg-white py-6 sm:py-8 lg:py-10">
    <div class="page space-y-6">
      <!-- ====================================================== -->
      <!-- VIDEO HIGHLIGHT -->
      <!-- ====================================================== -->

      <div
        class="overflow-hidden rounded-2xl bg-primary-50 md:grid md:grid-cols-[1.05fr_1fr]"
      >
        <!-- ================================================== -->
        <!-- VIDEO THUMBNAIL -->
        <!-- ================================================== -->

        <div
          class="group relative min-h-[250px] cursor-pointer overflow-hidden sm:min-h-[300px]"
          @click="openVideo"
        >
          <!-- THUMBNAIL -->

          <img
            :src="video.thumbnail"
            :alt="video.title"
            class="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
            @error="handleThumbnailError"
          />

          <!-- OVERLAY -->

          <div
            class="absolute inset-0 bg-black/10 transition duration-300 group-hover:bg-black/20"
          />

          <!-- ================================================== -->
          <!-- PLAY BUTTON -->
          <!-- ================================================== -->

          <div
            class="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/50 bg-primary-500/90 text-white shadow-lg backdrop-blur transition duration-300 group-hover:scale-110 group-hover:bg-primary-500 sm:h-20 sm:w-20"
          >
            <Icon icon="ri:play-fill" class="ml-1 h-7 w-7 sm:h-9 sm:w-9" />
          </div>
        </div>

        <!-- ================================================== -->
        <!-- VIDEO CONTENT -->
        <!-- ================================================== -->

        <div class="flex flex-col justify-center px-6 py-8 sm:px-8 lg:px-12">
          <!-- LABEL -->

          <p class="text-sm font-semibold text-primary-600">Video Highlight</p>

          <!-- TITLE -->

          <h2
            class="mt-2 text-2xl font-bold leading-tight text-heading sm:text-3xl"
          >
            {{ video.title }}
          </h2>

          <!-- DESCRIPTION -->

          <p class="mt-4 max-w-xl text-sm leading-6 text-muted sm:text-base">
            {{ video.description }}
          </p>

          <!-- WATCH VIDEO -->

          <button
            type="button"
            class="group mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-primary-500 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-primary-600"
            @click="openVideo"
          >
            Watch Video

            <Icon
              icon="ri:play-fill"
              class="h-4 w-4 transition duration-200 group-hover:translate-x-1"
            />
          </button>
        </div>
      </div>

      <!-- ====================================================== -->
      <!-- GOOGLE MAP -->
      <!-- ====================================================== -->

      <div
        class="overflow-hidden rounded-2xl bg-secondary-50 md:grid md:grid-cols-[0.75fr_1.25fr]"
      >
        <!-- ================================================== -->
        <!-- MAP INFORMATION -->
        <!-- ================================================== -->

        <div class="flex flex-col justify-center px-6 py-8 sm:px-8 lg:px-10">
          <!-- MAP ICON -->

          <div
            class="grid h-11 w-11 place-items-center rounded-xl bg-primary-100 text-primary-600"
          >
            <Icon icon="ri:map-pin-2-fill" class="h-5 w-5" />
          </div>

          <!-- TITLE -->

          <h2 class="mt-4 text-2xl font-bold text-heading">
            Find Us on the Map
          </h2>

          <!-- LOCATION -->

          <p class="mt-2 text-sm leading-6 text-muted sm:text-base">
            Koh Rong Island, Preah Sihanouk Province, Cambodia
          </p>

          <!-- OPEN GOOGLE MAP -->

          <a
            :href="map.googleMapsUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="group mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-primary-500 px-5 py-2.5 text-sm font-semibold text-primary-600 transition duration-200 hover:bg-primary-500 hover:text-white"
          >
            Open in Google Maps

            <Icon
              icon="ri:map-pin-2-fill"
              class="h-4 w-4 transition duration-200 group-hover:translate-x-0.5"
            />
          </a>
        </div>

        <!-- ================================================== -->
        <!-- MAP FRAME -->
        <!-- ================================================== -->

        <div
          class="min-h-[280px] overflow-hidden bg-slate-100 md:min-h-[320px]"
        >
          <iframe
            :src="map.embedUrl"
            title="Koh Rong Island Map"
            class="block h-full min-h-[280px] w-full border-0 md:min-h-[320px]"
            loading="lazy"
            allowfullscreen
            referrerpolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      <!-- ====================================================== -->
      <!-- BACK TO TOP -->
      <!-- ====================================================== -->

      <div class="flex justify-end">
        <button
          type="button"
          aria-label="Back to top"
          class="grid h-12 w-12 place-items-center rounded-full bg-primary-500 text-white shadow-lg transition duration-200 hover:-translate-y-1 hover:bg-primary-600 sm:h-14 sm:w-14"
          @click="scrollToTop"
        >
          <Icon icon="ri:arrow-up-fill" class="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </div>

      <!-- ====================================================== -->
      <!-- VIDEO MODAL -->
      <!-- ====================================================== -->

      <Teleport to="body">
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="videoVisible"
            class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            @click.self="closeVideo"
          >
            <div class="relative w-full max-w-5xl">
              <!-- ================================================== -->
              <!-- CLOSE -->
              <!-- ================================================== -->

              <button
                type="button"
                aria-label="Close video"
                class="absolute -top-12 right-0 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white transition duration-200 hover:scale-105 hover:bg-white/25"
                @click="closeVideo"
              >
                <Icon icon="ri:close-fill" class="h-5 w-5" />
              </button>

              <!-- ================================================== -->
              <!-- YOUTUBE VIDEO -->
              <!-- ================================================== -->

              <div
                class="aspect-video overflow-hidden rounded-2xl bg-black shadow-2xl"
              >
                <iframe
                  :src="embedUrl"
                  :title="video.title"
                  class="h-full w-full"
                  frameborder="0"
                  allow="
                    accelerometer;
                    autoplay;
                    clipboard-write;
                    encrypted-media;
                    gyroscope;
                    picture-in-picture;
                    web-share;
                  "
                  allowfullscreen
                />
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

import { Icon } from "@iconify/vue";

/*
|--------------------------------------------------------------------------
| YOUTUBE
|--------------------------------------------------------------------------
*/

const youtubeId = "OF4OysiOc4c";

/*
|--------------------------------------------------------------------------
| VIDEO
|--------------------------------------------------------------------------
*/

const video = {
  title: "Experience the Beauty of Koh Rong",

  description:
    "Watch our latest video and get inspired by the crystal clear waters, white sandy beaches, and island life.",

  thumbnail: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
};

/*
|--------------------------------------------------------------------------
| VIDEO MODAL
|--------------------------------------------------------------------------
*/

const videoVisible = ref(false);

/*
|--------------------------------------------------------------------------
| YOUTUBE EMBED
|--------------------------------------------------------------------------
*/

const embedUrl = computed(() => {
  if (!videoVisible.value) {
    return "";
  }

  return `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`;
});

/*
|--------------------------------------------------------------------------
| OPEN VIDEO
|--------------------------------------------------------------------------
*/

function openVideo() {
  videoVisible.value = true;

  document.body.style.overflow = "hidden";
}

/*
|--------------------------------------------------------------------------
| CLOSE VIDEO
|--------------------------------------------------------------------------
*/

function closeVideo() {
  videoVisible.value = false;

  document.body.style.overflow = "";
}

/*
|--------------------------------------------------------------------------
| THUMBNAIL FALLBACK
|--------------------------------------------------------------------------
*/

function handleThumbnailError(event) {
  const fallback = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;

  if (event.target.src === fallback) {
    return;
  }

  event.target.src = fallback;
}

/*
|--------------------------------------------------------------------------
| GOOGLE MAP
|--------------------------------------------------------------------------
*/

const map = {
  googleMapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Koh+Rong+Island+Cambodia",

  embedUrl:
    "https://www.google.com/maps?q=Koh%20Rong%20Island%20Cambodia&z=11&output=embed",
};

/*
|--------------------------------------------------------------------------
| BACK TO TOP
|--------------------------------------------------------------------------
*/

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

/*
|--------------------------------------------------------------------------
| KEYBOARD
|--------------------------------------------------------------------------
*/

function handleKeydown(event) {
  if (event.key === "Escape" && videoVisible.value) {
    closeVideo();
  }
}

/*
|--------------------------------------------------------------------------
| MOUNT
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
