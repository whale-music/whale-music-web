<script setup lang="ts">
defineOptions({
  name: "FloatingComp"
});
</script>

<template>
  <div class="float-comp">
    <div class="child">
      <slot />
    </div>
    <div class="float-window">
      <slot name="content" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.float-comp {
  //border: 1px solid red;
  //border-radius: 1rem;
  position: relative;
  overflow: hidden;
}

.float-comp .float-window {
  border-radius: 1rem;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: var(--el-bg-color);
  top: 100%;
  transition: all 0.3s cubic-bezier(0.6, 0.4, 0, 1);
}

.float-comp > :not(*) {
  transition: all 0.3s cubic-bezier(0.6, 0.4, 0, 1);
}

.float-comp:hover .float-window {
  top: 0;
  opacity: 1;
}

.float-comp:hover > .child {
  opacity: 0;
}
</style>
