<script lang="ts" setup>
import Loading3Fill from "@iconify-icons/mingcute/loading-3-fill";

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
        :icon="Loading3Fill"
        class="animate-spin text-primary"
        width="60px"
        height="60px"
      />
    </div>
  </div>
</template>
<style lang="scss" scoped>
.show-loading-box {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-bg-color);
  border-radius: 1rem;
  animation: animate__slideInUp; /* referring directly to the animation's @keyframe declaration */
  animation-duration: 2s; /* don't forget to set a duration! */
}
</style>
