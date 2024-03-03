<script setup lang="ts">
import { storageLocal, useDark, useGlobal } from "@pureadmin/utils";
import { computed, defineComponent, h, Transition, watch } from "vue";

import backTop from "@/assets/svg/back_top.svg?component";
import { usePermissionStoreHook } from "@/store/modules/permission";

const { isDark } = useDark();
watch(isDark, value => {
  // 是否黑暗模式缓存到本地缓存到本地, 全局Loading时读取配置
  storageLocal().setItem("darkMode", value);
});

const props = defineProps({
  fixedHeader: Boolean
});

const { $storage, $config } = useGlobal<GlobalPropertiesApi>();

const keepAlive = computed(() => {
  return $config?.KeepAlive;
});

const transitions = computed(() => {
  return route => {
    return route.meta.transition;
  };
});

const hideTabs = computed(() => {
  return $storage?.configure.hideTabs;
});

const layout = computed(() => {
  return $storage?.layout.layout === "vertical";
});

const getSectionStyle = computed(() => {
  const maxHeight = 100;
  let height = 7;
  const topHeight = 7;
  const tagHeight = 5.3;
  if (props.fixedHeader) {
    height = 0;
  }
  if (hideTabs.value && layout.value) {
    height = topHeight;
  }
  if (!hideTabs.value && layout.value) {
    height = topHeight + tagHeight;
  }
  if (hideTabs.value && !layout.value) {
    height = topHeight;
  }
  if (!hideTabs.value && !layout.value) {
    height = topHeight + tagHeight;
  }
  return [
    `--top-height: ${height + 0.2}vh;`,
    `--content-height: ${maxHeight - height - 0.2}vh;`
  ];
});

const transitionMain = defineComponent({
  render() {
    return h(
      Transition,
      {
        name:
          transitions.value(this.route) &&
          this.route.meta.transition.enterTransition
            ? "pure-classes-transition"
            : (transitions.value(this.route) &&
                this.route.meta.transition.name) ||
              "fade-transform",
        enterActiveClass:
          transitions.value(this.route) &&
          `animate__animated ${this.route.meta.transition.enterTransition}`,
        leaveActiveClass:
          transitions.value(this.route) &&
          `animate__animated ${this.route.meta.transition.leaveTransition}`,
        mode: "out-in",
        appear: true
      },
      {
        default: () => [this.$slots.default()]
      }
    );
  },
  props: {
    route: {
      type: undefined,
      required: true
    }
  }
});
</script>

<template>
  <div class="app-main-bg" :style="getSectionStyle">
    <!--顶栏占位-->
    <div style="height: var(--top-height)" class="app-main-bg" />
    <section
      :class="[props.fixedHeader ? 'app-main' : 'app-main-nofixed-header']"
    >
      <router-view>
        <template #default="{ Component, route }">
          <el-scrollbar v-if="props.fixedHeader">
            <el-backtop title="回到顶部" target=".app-main .el-scrollbar__wrap">
              <backTop />
            </el-backtop>
            <transitionMain :route="route">
              <keep-alive
                v-if="keepAlive"
                :include="usePermissionStoreHook().cachePageList"
              >
                <component
                  :is="Component"
                  :key="route.path"
                  class="main-content"
                />
              </keep-alive>
              <component
                v-else
                :is="Component"
                :key="route.path"
                class="main-content"
              />
            </transitionMain>
          </el-scrollbar>
          <div v-else>
            <transitionMain :route="route">
              <keep-alive
                v-if="keepAlive"
                :include="usePermissionStoreHook().cachePageList"
              >
                <component
                  :is="Component"
                  :key="route.path"
                  class="main-content"
                />
              </keep-alive>
              <component
                v-else
                :is="Component"
                :key="route.path"
                class="main-content"
              />
            </transitionMain>
          </div>
        </template>
      </router-view>
    </section>
  </div>
</template>

<style scoped lang="scss">
.app-main-bg {
  background: $menuBg;
}

.app-main {
  width: 100%;
  height: var(--content-height);
  position: relative;
  overflow-x: hidden;
  background: #f0f2f5;
  border-radius: var(--el-border-radius-base);
}

.app-main-nofixed-header {
  width: 100%;
  min-height: 100vh;
  position: relative;
}

.main-content {
  margin: 24px;
}
</style>
