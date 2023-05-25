<script setup lang="ts">
import { SearchModal } from "./components";
import { useBoolean } from "../../hooks/useBoolean";
import Search from "@iconify-icons/ep/search";

const { bool: show, toggle } = useBoolean();
function handleSearch() {
  toggle();
}
</script>

<template>
  <div class="search-container search" @click="handleSearch">
    <IconifyIconOffline :icon="Search" />
    <span class="ml-3">搜索菜单</span>
    <span class="ml-auto pl-3 flex-none text-xs font-semibold"> Ctrl K </span>
  </div>
  <SearchModal v-model:value="show" />
</template>
<style lang="scss" scoped>
.search {
  // height: 48
  @apply h-[40px] cursor-pointer navbar-bg-hover;
  width: 15rem;
  padding-right: 1rem;
  padding-left: 1rem;
  margin-top: 4px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  border-radius: var(--el-border-radius-base);
  background: var(--el-bg-color-page);
}
</style>
