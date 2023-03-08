<template>
  <div>
    <div class="play">
      <el-icon :size="50" class="start">
        <Icon icon="material-symbols:play-circle-sharp" />
      </el-icon>
      <el-icon :size="30" class="stop">
        <Icon icon="material-symbols:stop-circle" />
      </el-icon>
      <div class="progress">{{ progress }}</div>
      <div class="slider"><el-slider v-model="sliderNum" size="small" /></div>
      <el-icon :size="30" class="sound">
        <Icon icon="iconoir:sound-high" />
      </el-icon>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import { ref } from "vue";

const progress = ref<string>("00:00 / 03:22");
const sliderNum = ref<number>(0);
</script>

<style scoped lang="scss">
.play {
  width: 28rem;
  height: 4rem;

  opacity: 1;
  border-radius: 90px;
  background: linear-gradient(
    90deg,
    rgba(0, 181, 217, 0.83) 0%,
    rgba(144, 225, 240, 0.72) 20%,
    rgba(72, 202, 228, 0.62) 40%,
    rgba(0, 150, 199, 0.47) 60%,
    rgba(0, 127, 186, 0.74) 79.44%,
    rgba(0, 119, 182, 0.87) 100%
  );
  box-shadow: 0px 2px 36px 0px rgba(84, 203, 214, 0.4);
  backdrop-filter: blur(4px);

  display: flex;
  align-items: center;

  justify-content: space-between;

  .start {
    margin-left: 1rem;
  }

  .stop {
    margin-left: -0.6rem;
    margin-right: 0rem;
    padding: 0;
  }

  .progress {
    color: #ffffff;
    font-size: larger;
    padding-right: 1rem;
  }

  .slider {
    width: 10rem;
  }

  .sound {
    margin-right: 1rem;
  }
}
</style>
