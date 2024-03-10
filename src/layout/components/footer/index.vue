<script lang="ts" setup>
import { getConfig } from "@/config";

const TITLE = getConfig("Title");
</script>

<template>
  <footer
    class="layout-footer text-[rgba(0,0,0,0.6)] dark:text-[rgba(220,220,242,0.8)]"
  >
    <div>Powered by pure-admin</div>
    <div>
      Copyright © 2022-present
      <a
        class="hover:text-primary"
        href="https://github.com/whale-music"
        target="_blank"
      >
        &nbsp;{{ TITLE }}
      </a>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.layout-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0 0 8px;
  font-size: 14px;
}
</style>
