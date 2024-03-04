<script lang="ts" setup></script>
<template>
  <button class="mv-menu-button">
    <slot />
  </button>
</template>
<style lang="scss">
.mv-menu-button {
  display: inline-block;
  width: 6rem;
  height: 2.5rem;
  margin: 5px;
  font-size: 17px;
  color: #fff;
  text-align: center;
  cursor: pointer;
  background-color: var(--el-color-primary);
  border-radius: var(--el-border-radius-base);
  transition: all 0.5s;
}

.mv-menu-button span {
  position: relative;
  display: inline-block;
  cursor: pointer;
  transition: 0.5s;
}

.mv-menu-button span::after {
  position: absolute;
  top: 0;
  right: -15px;
  content: "↓";
  opacity: 0;
  transition: 0.5s;
}

.mv-menu-button:hover span {
  padding-right: 15px;
}

.mv-menu-button:hover span::after {
  right: 0;
  opacity: 1;
}
</style>
