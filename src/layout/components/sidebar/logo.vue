<script setup lang="ts">
import { useNav } from "@/layout/hooks/useNav";
import LeftOutline from "@iconify-icons/solar/alt-arrow-left-bold";
import RightOutline from "@iconify-icons/solar/alt-arrow-right-bold";
import { useRouter } from "vue-router";

const router = useRouter();
const props = defineProps({
  collapse: Boolean
});

const { title } = useNav();
</script>

<template>
  <div class="sidebar-logo-container" :class="{ collapses: props.collapse }">
    <transition name="sidebarLogoFade">
      <router-link
        v-if="props.collapse"
        key="props.collapse"
        :title="title"
        class="sidebar-logo-link"
        to="/"
      >
        <span class="sidebar-title">{{ title }}</span>
      </router-link>
      <router-link
        v-else
        key="expand"
        :title="title"
        class="sidebar-logo-link"
        to="/"
      >
        <span class="sidebar-title">{{ title }}</span>
        <IconifyIconOffline
          class="router"
          @click="router.back()"
          :icon="LeftOutline"
        />
        <IconifyIconOffline
          class="router"
          @click="router.back(1)"
          :icon="RightOutline"
        />
      </router-link>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.sidebar-logo-container {
  @apply shadow-sm;
  width: 100%;
  height: 48px;
  overflow: hidden;
  position: relative;

  .sidebar-logo-link {
    height: 100%;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;

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
      height: 32px;
      line-height: 32px;
      margin: 2px 0 0 12px;
      color: $subMenuActiveText;
      display: inline-block;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      font-size: 14px;
      font-weight: 600;
    }
  }
}
</style>
