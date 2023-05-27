<script setup lang="ts">
import { getTopMenu } from "@/router/utils";
import { useNav } from "@/layout/hooks/useNav";
import LeftOutline from "@iconify-icons/solar/alt-arrow-left-bold";
import RightOutline from "@iconify-icons/solar/alt-arrow-right-bold";
import { useRouter } from "vue-router";

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
const topPath = getTopMenu().path;
</script>

<template>
  <div class="sidebar-logo-container" :class="{ collapses: props.collapse }">
    <transition name="sidebarLogoFade">
      <div class="flex justify-between w-full">
        <div>
          <router-link
            v-if="props.collapse"
            key="props.collapse"
            :title="title"
            class="sidebar-logo-link"
            :to="topPath"
          >
            <img src="/logo.svg" alt="logo" />
            <span class="sidebar-title">{{ title }}</span>
          </router-link>
          <router-link
            v-else
            key="expand"
            :title="title"
            class="sidebar-logo-link"
            :to="topPath"
          >
            <img src="/logo.svg" alt="logo" />
            <span class="sidebar-title">{{ title }}</span>
          </router-link>
        </div>

        <div class="mr-4">
          <a class="sidebar-logo-link">
            <div class="flex-c">
              <div class="flex flex-nowrap items-center justify-center gap-2">
                <div class="router-bg">
                  <IconifyIconOffline
                    class="router"
                    @click="toLast"
                    :icon="LeftOutline"
                  />
                </div>
                <div class="router-bg">
                  <IconifyIconOffline
                    class="router"
                    @click="toNext"
                    :icon="RightOutline"
                  />
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.sidebar-logo-container {
  //@apply shadow-sm;
  width: 100%;
  height: 48px;
  overflow: hidden;
  position: relative;
  display: flex;

  .sidebar-logo-link {
    width: 100%;
    height: 100%;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-between;

    img {
      height: 32px;
      display: inline-block;
    }

    .sidebar-title {
      height: 32px;
      line-height: 32px;
      margin: 2px 0 0 12px;
      color: $subMenuActiveText;
      display: inline-block;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      font-size: 18px;
      font-weight: 600;
    }

    .router {
      //height: 32px;
      //line-height: 32px;
      //margin: 2px 0 0 12px;
      color: $subMenuActiveText;
      display: inline-block;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      font-size: 14px;
      font-weight: 600;
    }

    .router-bg {
      @apply dark:bg-black;
      width: 1.5rem;
      height: 1.5rem;
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      justify-content: center;
      border-radius: var(--el-border-radius-base);
      background: $menuBg;
    }

    .router-bg:hover {
      @apply dark:bg-gray-800;
      background: $menuHover;
    }
  }
}
</style>
