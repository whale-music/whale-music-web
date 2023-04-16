<script lang="ts" setup>
const props = defineProps({
  loading: Boolean,
  height: {
    type: String,
    default: "20rem",
    required: false
  },
  width: {
    type: String,
    default: "100%",
    required: false
  }
});
</script>
<template>
  <div>
    <div
      v-show="props.loading"
      :style="{ width: props.width, height: props.height }"
      class="show-loading-box"
    >
      <IconifyIconOffline
        icon="loading3Fill"
        class="animate-spin"
        style="color: blue"
        width="60px"
        height="60px"
      />
    </div>
  </div>
</template>
<style lang="scss" scoped>
.show-loading-box {
  background-color: var(--el-bg-color);
  border-radius: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
