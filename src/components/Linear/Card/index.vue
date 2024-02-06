<script setup lang="ts">
import { defineComponent } from "vue";

defineComponent({
  name: "LinearCard"
});
</script>

<template>
  <ElCard class="line-card" v-bind="$attrs">
    <slot />
  </ElCard>
</template>

<style scoped lang="scss">
@use "@/style/linear-card";
</style>
