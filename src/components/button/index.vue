<script lang="ts" setup>
const pros = defineProps({
  type: {
    type: String,
    default: "primary",
    required: false
  },
  loading: {
    type: Boolean,
    default: false,
    required: false
  },
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
  <el-button
    class="button"
    :type="pros.type"
    plain
    :loading="pros.loading"
    text
    bg
  >
    <template #loading>
      <IconifyIconOffline
        icon="loading3Fill"
        class="animate-spin"
        :style="{ color: pros.color === undefined ? 'inherit' : pros.color }"
        :width="pros.width"
        :height="pros.height"
      />
    </template>
    <slot />
  </el-button>
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
