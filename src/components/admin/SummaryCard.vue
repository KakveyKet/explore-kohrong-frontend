<template>
  <Card class="!rounded-2xl">
    <template #content>
      <div class="flex items-center gap-4">
        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-[#0E7490]">
          <i :class="[icon, 'text-xl']" />
        </div>

        <div class="min-w-0">
          <p class="truncate text-sm text-slate-500">{{ label }}</p>
          <p class="mt-1 text-2xl font-bold text-slate-900">{{ value }}</p>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup>
import Card from "primevue/card";

defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], default: 0 },
  icon: { type: String, default: "pi pi-chart-bar" },
});
</script>
