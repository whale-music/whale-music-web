<script setup lang="ts">
import { isAllEmpty } from "@pureadmin/utils";

defineOptions({
  name: "DisPlayDefault"
});
const props = defineProps({
  value: {
    type: null,
    required: true
  },
  default: {
    type: null,
    required: false
  }
});
</script>

<template>
  <span v-if="isAllEmpty(props.value)" class="opacity-40 font-bold">
    {{ props.default ?? "unknown" }}
  </span>
  <div v-else class="inline space-x-1">
    <slot />
  </div>
</template>
