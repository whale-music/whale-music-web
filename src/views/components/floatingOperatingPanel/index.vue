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
  bottom: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 3.2rem;
  margin-bottom: 20px;
  background: var(--el-bg-color);
  border: 1px solid rgb(142 142 142 / 20%);
  border-radius: 1rem;
}
</style>
