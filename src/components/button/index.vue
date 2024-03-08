<script lang="ts" setup>
import Loading3Fill from "@iconify-icons/mingcute/loading-3-fill";

const pros = defineProps({
  color: String,
  width: {
    type: String,
    default: "20px",
    required: false
  },
  height: {
    type: String,
    default: "20px",
    required: false
  }
});
</script>
<template>
  <ElButton class="button" v-bind="$attrs" plain text bg>
    <template #loading>
      <IconifyIconOffline
        :icon="Loading3Fill"
        class="animate-spin"
        :style="{ color: pros.color ?? 'inherit' }"
        :width="pros.width"
        :height="pros.height"
      />
    </template>
    <slot />
  </ElButton>
</template>

<style lang="scss" scoped>
:deep(.el-button--primary) {
  background: red;
}

.el-button.el-button--primary.is-plain.is-text.is-has-bg.button {
  background: var(--el-color-primary-light-8);
}

.el-button.el-button--warning.is-plain.is-text.is-has-bg.button {
  background: var(--el-color-warning-light-8);
}

.el-button.el-button--success.is-plain.is-text.is-has-bg.button {
  background: var(--el-color-success-light-8);
}

.el-button.el-button--danger.is-plain.is-text.is-has-bg.button {
  background: var(--el-color-danger-light-8);
}

.button:active {
  transition: scale ease 0.5s;
  transform: scale(0.9, 0.9);
}
</style>
