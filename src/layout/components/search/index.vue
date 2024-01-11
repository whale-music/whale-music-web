<script setup lang="ts">
import { SearchModal } from "./components";
import { useBoolean } from "../../hooks/useBoolean";
import Search from "@iconify-icons/mingcute/search-3-line";
import { onMounted, ref } from "vue";
import { emitter } from "@/utils/mitt";

const { bool: show, toggle } = useBoolean();
function handleSearch() {
  toggle();
}

const showSearchHurdleFlag = ref<boolean>(false);

function reDrawLayout(width: number) {
  showSearchHurdleFlag.value = width >= 720;
}

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
    <div class="search" v-if="showSearchHurdleFlag">
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
  // height: 48
  @apply h-[40px] cursor-pointer navbar-bg-hover dark:bg-black dark:shadow-black dark:border dark:border-black;
  width: 15rem;
  padding-right: 1rem;
  padding-left: 1rem;
  margin-top: 4px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  border-radius: var(--el-border-radius-base);
  color: $menuText;
  border: 2px solid var(--el-bg-color-page);
  background: var(--el-bg-color);
  box-shadow: inset 0 1px 0 0 $menuText;
}
</style>
