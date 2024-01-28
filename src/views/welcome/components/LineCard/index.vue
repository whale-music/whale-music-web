<script lang="ts" setup>
import { computed, defineComponent } from "vue";
import { ReNormalCountTo } from "@/components/ReCountTo";
import MusicNoteBoldDuotone from "@iconify-icons/solar/music-note-bold-duotone";
import { useDark } from "@pureadmin/utils";
import { lineChart } from "../chart/index";

const { isDark } = useDark();

defineComponent({
  name: "LineCard"
});

const props = defineProps({
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
  percentageIncrease: {
    type: String,
    default: "+10%",
    required: false
  },
  lineGraphData: {
    type: Array<Number>
  }
});

const percentage = computed(() => {
  switch (props.percentageIncrease.at(0)) {
    case "-":
      return "text-red-500";
    case "+":
      return "text-green-500";
    default:
      return "text-gray-500";
  }
});
</script>

<template>
  <el-card class="line-card" shadow="hover">
    <div class="flex justify-between">
      <span class="text-xl font-bold"> 音乐 </span>
      <div
        class="w-8 h-8 flex justify-center items-center rounded-md"
        :style="{
          backgroundColor: isDark ? 'transparent' : '#effaff'
        }"
      >
        <IconifyIconOffline
          :icon="MusicNoteBoldDuotone"
          :color="props.color"
          width="18"
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
        <p class="font-medium" :class="percentage">
          {{ props.percentageIncrease }}
        </p>
      </div>
      <lineChart
        class="!w-1/2"
        :color="props.color"
        :data="[2101, 5288, 4239, 4962, 6752, 5208, 111]"
      />
    </div>
  </el-card>
</template>

<style scoped lang="scss">
.line-card {
  --el-card-border-radius: 1rem;
}
</style>
