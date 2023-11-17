<script lang="ts" setup></script>
<template>
  <button class="mv-menu-button">
    <slot />
  </button>
</template>
<style lang="scss">
.mv-menu-button {
  display: inline-block;
  background-color: var(--el-color-primary);
  border-radius: var(--el-border-radius-base);
  color: #ffffff;
  text-align: center;
  font-size: 17px;
  height: 2.5rem;
  width: 6rem;
  transition: all 0.5s;
  cursor: pointer;
  margin: 5px;
}

.mv-menu-button span {
  cursor: pointer;
  display: inline-block;
  position: relative;
  transition: 0.5s;
}

.mv-menu-button span:after {
  content: "↓";
  position: absolute;
  opacity: 0;
  top: 0;
  right: -15px;
  transition: 0.5s;
}

.mv-menu-button:hover span {
  padding-right: 15px;
}

.mv-menu-button:hover span:after {
  opacity: 1;
  right: 0;
}
</style>
