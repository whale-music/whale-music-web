<script lang="ts" setup>
const props = defineProps({
  src: String,
  height: {
    type: String,
    default: "20rem",
    required: false
  },
  width: {
    type: String,
    default: "20rem",
    required: false
  },
  radius: {
    type: String,
    default: "2rem",
    required: false
  }
});
</script>

<template>
  <el-image
    :src="props.src"
    fit="cover"
    :style="{ width: width, height: height, 'border-radius': props.radius }"
    class="img"
  >
    <template #placeholder>
      <div
        element-loading-background="rgba(234, 236, 237, 0.8)"
        class="w-full h-full"
        v-loading="true"
      />
    </template>
    <template #error>
      <div
        element-loading-background="rgba(234, 236, 237, 0.8)"
        class="w-full h-full"
        v-loading="true"
      />
    </template>
  </el-image>
</template>

<style lang="scss" scoped>
.img {
  @apply shadow-xl;
  border-radius: 2rem;
}
</style>
