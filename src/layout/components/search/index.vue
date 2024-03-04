<script setup lang="ts">
import Search from "@iconify-icons/mingcute/search-3-line";
import { onMounted, ref } from "vue";

import { emitter } from "@/utils/mitt";

import { useBoolean } from "../../hooks/useBoolean";
import { SearchModal } from "./components";

defineOptions({
  name: "Search",
  inheritAttrs: false
});

const { bool: show, toggle } = useBoolean();
function handleSearch() {
  toggle();
}

const showSearchHurdleFlag = ref<boolean>(false);

function reDrawLayout(width: number) {
  showSearchHurdleFlag.value = width >= 720;
}

// todo use useResizeObserver
// 监听容器
emitter.on("resize", ({ detail }) => {
  const { width } = detail;
  reDrawLayout(width);
});

onMounted(() => {
  const width =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;
  reDrawLayout(width);
});
</script>

<template>
  <div class="search-container" @click="handleSearch">
    <div v-if="showSearchHurdleFlag" class="search">
      <IconifyIconOffline
        :icon="Search"
        style="color: var(--el-color-primary)"
      />
      <span class="ml-3 min-w-[2rem] truncate">搜索菜单</span>
      <span class="ml-auto pl-3 flex-none text-xs font-semibold"> Ctrl K </span>
    </div>
    <div v-else class="w-[40px] h-[48px] flex-c cursor-pointer navbar-bg-hover">
      <IconifyIconOffline
        :icon="Search"
        width="1.2rem"
        height="1.2rem"
        style="color: var(--el-color-primary)"
      />
    </div>
  </div>
  <SearchModal v-model:value="show" />
</template>
<style lang="scss" scoped>
.search {
  @apply h-[40px] cursor-pointer navbar-bg-hover dark:bg-black dark:shadow-black dark:border dark:border-black;

  display: flex;
  align-items: center;
  width: 15rem;
  padding-right: 1rem;
  padding-left: 1rem;
  margin-top: 4px;
  margin-bottom: 4px;
  color: $menuText;
  background: var(--el-bg-color);
  border: 2px solid var(--el-bg-color-page);
  border-radius: var(--el-border-radius-base);
  box-shadow: inset 0 1px 0 0 $menuText;
}
</style>
