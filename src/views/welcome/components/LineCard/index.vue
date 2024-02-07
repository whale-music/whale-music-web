<script lang="ts" setup>
import AddCircleFill from "@iconify-icons/mingcute/add-circle-fill";
import More2Fill from "@iconify-icons/mingcute/more-2-fill";
import ContextMenu from "@imengyu/vue3-context-menu";
import { useDark } from "@pureadmin/utils";
import type { PropType, VNode } from "vue";
import { computed, ref } from "vue";

import IcTwotoneTrendingDown from "@/assets/components/IcTwotoneTrendingDown.vue";
import IcTwotoneTrendingFlat from "@/assets/components/IcTwotoneTrendingFlat.vue";
import IcTwotoneTrendingUp from "@/assets/components/IcTwotoneTrendingUp.vue";
import { ReNormalCountTo } from "@/components/ReCountTo";
import FloatingComp from "@/views/components/FloatingComp/index.vue";

import { lineChart } from "../chart/index";

const { isDark } = useDark();

defineOptions({
  name: "LineCard"
});

const props = defineProps({
  title: String,
  icon: Object,
  color: {
    type: String,
    default: "#626aef",
    required: false
  },
  duration: {
    type: Number,
    default: 2200,
    required: false
  },
  count: {
    type: Number,
    default: 0,
    required: false
  },
  fluctuate: Boolean,
  percentageIncrease: {
    type: Number,
    default: 0,
    required: false
  },
  lineGraphData: {
    type: Array as PropType<Array<number>>
  },
  comp: {
    type: Object as PropType<VNode>,
    required: false
  }
});

const percentage = computed(() => {
  switch (props.fluctuate) {
    case false:
      return "text-red-500";
    case true:
      return "text-green-500";
    default:
      return "text-gray-500";
  }
});

const lineGraphComp = () => {
  switch (props.fluctuate) {
    case false:
      return IcTwotoneTrendingDown;
    case true:
      return IcTwotoneTrendingUp;
    default:
      return IcTwotoneTrendingFlat;
  }
};

const show = ref(false);

const onContextMenu = (e: MouseEvent) => {
  //prevent the browser's default menu
  e.preventDefault();
  //show our menu
  ContextMenu.showContextMenu({
    x: e.x - 100,
    y: e.y,
    items: [
      {
        label: "添加专辑",
        onClick: () => {
          show.value = true;
        }
      }
    ]
  });
};
</script>

<template>
  <component :is="props.comp" v-model="show" />
  <FloatingComp>
    <ElCard class="line-card" shadow="never">
      <div class="flex justify-between">
        <span class="text-gradient text-xl font-bold"> {{ props.title }} </span>
        <div
          class="w-8 h-8 flex justify-center items-center rounded-md"
          :style="{
            backgroundColor: isDark ? 'transparent' : '#effaff'
          }"
        >
          <IconifyIconOffline
            :icon="props.icon"
            :color="props.color"
            width="100"
          />
        </div>
      </div>
      <div class="flex justify-between items-start mt-3">
        <div class="w-1/2">
          <ReNormalCountTo
            :duration="props.duration"
            :fontSize="'1.6em'"
            :startVal="100"
            :endVal="props.count"
          />
          <div class="flex justify-start items-center gap-2">
            <component :is="lineGraphComp()" :class="percentage" />
            <p class="font-medium" :class="percentage">
              {{ props.percentageIncrease }}
            </p>
          </div>
        </div>
        <lineChart
          class="!w-1/2"
          :color="props.color"
          :data="props.lineGraphData ?? [0, 0, 0, 0, 0, 0, 0]"
        />
      </div>
    </ElCard>
    <template #content>
      <div class="h-full w-full flex items-center relative">
        <div
          class="absolute top-2 right-2"
          @contextmenu="onContextMenu($event)"
        >
          <IconifyIconOffline :icon="More2Fill" width="25" />
        </div>
        <div class="w-1/2 flex-c">
          <IconifyIconOffline
            :icon="props.icon"
            :color="props.color"
            width="100"
          />
        </div>
        <div class="w-1/2">
          <el-button class="relative" @click="show = true">
            <IconifyIconOffline :icon="AddCircleFill" width="20" />
            <span>添加</span>
          </el-button>
        </div>
      </div>
    </template>
  </FloatingComp>
</template>

<style scoped lang="scss">
@use "@/style/linear-card";

:deep(.el-card) {
  --el-card-border-color: none;

  /* 解决概率进度条宽度 */
  .el-progress--line {
    width: 85%;
  }

  /* 解决概率进度条字体大小 */
  .el-progress-bar__innerText {
    font-size: 15px;
  }

  /* 隐藏 el-scrollbar 滚动条 */
  .el-scrollbar__bar {
    display: none;
  }

  /* el-timeline 每一项上下、左右边距 */
  .el-timeline-item {
    margin: 0 6px;
  }
}
</style>
