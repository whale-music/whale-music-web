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
  },
  shadow: {
    type: Boolean,
    default: true,
    required: false
  }
});
</script>

<template>
  <el-image
    :src="props.src"
    fit="cover"
    :lazy="true"
    :style="{ width: width, height: height, 'border-radius': props.radius }"
    :class="{
      'img-shadow': props.shadow,
      img: !props.shadow
    }"
  >
    <template #placeholder>
      <div
        v-loading="true"
        element-loading-background="rgba(234, 236, 237, 0.8)"
        class="w-full h-full"
      />
    </template>
    <template #error>
      <IconifyIconOnline
        class="w-full h-full"
        icon="ep:picture-filled"
        width="2rem"
        height="2rem"
      />
    </template>
  </el-image>
</template>

<style lang="scss" scoped>
.img-shadow {
  @apply shadow-xl;

  border-radius: 2rem;
}

.img {
  border-radius: 2rem;
}
</style>
