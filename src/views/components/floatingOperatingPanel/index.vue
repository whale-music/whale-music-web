<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "FloatingOperatingPanel",
  props: {},
  methods: {}
});
</script>

<template>
  <div class="operation-panel-bg">
    <div class="operation-panel">
      <div class="flex gap-1 m-1">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.operation-panel-bg {
  display: flex;
  justify-content: center;
}

.operation-panel {
  position: absolute;
  display: flex;
  z-index: 200;
  bottom: 0;
  justify-content: center;
  align-items: center;
  height: 3.2rem;
  background: var(--el-bg-color);
  border-radius: 1rem;
  border: 1px solid rgba(142, 142, 142, 0.2);
  margin-bottom: 20px;
}
</style>
