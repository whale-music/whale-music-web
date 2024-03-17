<script setup lang="ts">
defineOptions({
  name: "FailureDisplay"
});

const props = defineProps({
  msg: {
    type: [String, Number],
    default: "Loading Failure"
  }
});
</script>

<template>
  <div class="flex-ac">{{ props.msg }}</div>
</template>
