<script setup lang="ts">
defineOptions({
  name: "Placeholder"
});

const Loading = "loading";
const Fail = "fail";
// const Success = "success";
type Type = "loading" | "fail" | "success";

const props = defineProps({
  type: {
    type: String as PropType<Type>,
    required: true
  }
});
</script>

<template>
  <div>
    <slot v-if="props.type === Loading" name="loading" />
    <slot v-else-if="props.type === Fail" name="fail" />
    <slot v-else />
  </div>
</template>
