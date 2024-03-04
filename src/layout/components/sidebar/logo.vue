<script setup lang="ts">
import { getTopMenu } from "@/router/utils";
import LeftOutline from "@iconify-icons/solar/alt-arrow-left-bold";
import RightOutline from "@iconify-icons/solar/alt-arrow-right-bold";
import { useRouter } from "vue-router";
import { useNav } from "@/layout/hooks/useNav";

const router = useRouter();
const props = defineProps({
  collapse: Boolean
});

const { title } = useNav();

const toLast = () => {
  router.go(-1);
};

const toNext = () => {
  router.go(1);
};
</script>

<template>
  <div class="sidebar-logo-container" :class="{ collapses: props.collapse }">
    <transition name="sidebarLogoFade">
      <router-link
        v-if="props.collapse"
        key="props.collapse"
        :title="title"
        class="sidebar-logo-link"
        :to="getTopMenu()?.path ?? '/'"
      >
        <!-- todo logo.svg -->
        <img src="/logo.svg" alt="logo" class="ml-4" />
        <span class="sidebar-title">{{ title }}</span>
      </router-link>
      <router-link
        v-else
        key="expand"
        :title="title"
        class="sidebar-logo-link"
        :to="getTopMenu()?.path ?? '/'"
      >
        <img src="/logo.svg" alt="logo" class="ml-4" />
        <span class="sidebar-title">{{ title }}</span>
      </router-link>
    </transition>
    <div class="mr-4">
      <a class="sidebar-logo-link">
        <div class="flex-c">
          <div class="flex flex-nowrap items-center justify-center gap-2">
            <div class="router-bg">
              <IconifyIconOffline
                class="router"
                :icon="LeftOutline"
                @click="toLast"
              />
            </div>
            <div class="router-bg">
              <IconifyIconOffline
                class="router"
                :icon="RightOutline"
                @click="toNext"
              />
            </div>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sidebar-logo-container {
  position: relative;
  display: flex;
  width: 100%;
  height: 48px;
  overflow: hidden;

  .sidebar-logo-link {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    height: 100%;

    img {
      display: inline-block;
      height: 32px;
    }

    .sidebar-title {
      display: inline-block;
      height: 32px;
      margin: 2px 0 0 12px;
      overflow: hidden;
      font-size: 18px;
      font-weight: 600;
      line-height: 32px;
      color: $subMenuActiveText;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .router {
      display: inline-block;
      overflow: hidden;
      font-size: 14px;
      font-weight: 600;
      color: $subMenuActiveText;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .router-bg {
      @apply dark:bg-black;

      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      background: $menuBg;
      border: 1px solid $menuHover;
      border-radius: var(--el-border-radius-base);
    }

    .router-bg:hover {
      @apply dark:bg-gray-800;

      background: $menuHover;
    }
  }
}
</style>
