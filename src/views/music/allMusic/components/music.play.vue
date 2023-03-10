<template>
  <div>
    <div class="play">
      <el-icon :size="50" class="start" @click="playMethod" v-if="isPlay">
        <Icon icon="material-symbols:play-circle" />
      </el-icon>
      <el-icon :size="50" class="start" @click="playMethod" v-else>
        <Icon icon="material-symbols:pause-circle-rounded" />
      </el-icon>
      <el-icon :size="30" class="stop">
        <Icon icon="material-symbols:stop-circle" />
      </el-icon>
      <div class="progress">{{ progressStart }} / {{ progressEnd }}</div>
      <div class="slider">
        <el-slider
          @change="handleChange"
          v-model="sliderNum"
          size="small"
          :disabled="disabled"
        />
      </div>
      <el-icon :size="30" class="sound">
        <Icon icon="iconoir:sound-high" />
      </el-icon>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import { ref, onUnmounted } from "vue";
import { Howl } from "howler";
import { dateFormater } from "@/utils/dateUtil";

const sliderNum = ref<number>(0);
const disabled = ref<boolean>(true);
const prop = defineProps({
  url: {
    type: String,
    default: ""
  },
  totalTime: {
    type: Number,
    defalut: 0
  },
  isPlay: {
    type: Boolean,
    default: true
  }
});
console.log(prop.url);

const isPlay = ref<boolean>(prop.isPlay);

const sound = new Howl({
  src: [prop.url],
  html5: true
});

const progressStart = ref<string>("00:00");
// 音乐时长
const progressEnd = ref<string>(dateFormater("mm:ss", prop.totalTime));
// 定时更新进度和播放时间
const timingMethod = () => {
  const seek = sound.seek();
  if (seek !== 0) {
    progressStart.value = dateFormater("mm:ss", seek);
    console.log(seek);
    handleChange(seek, true);
  }
};

// 播放
let timer;
const playMethod = () => {
  if (isPlay.value) {
    sound.play();
    isPlay.value = false;

    disabled.value = false;
    timer = setInterval(timingMethod, 300);
  } else {
    sound.pause();
    isPlay.value = true;

    disabled.value = true;
    clearInterval(timer);
  }
};

// isSeek为true就是底层调用，false取反就是拖动滑块事件
const handleChange = (seekNum: number, isSeek: boolean) => {
  if (!isSeek) {
    sound.seek(sliderNum.value * (sound._duration / 100));
    sound.play();
  }
};
// 清除定时器
onUnmounted(() => {
  clearInterval(timer);
  sound.stop();
});
</script>

<style scoped lang="scss">
.play {
  width: 28rem;
  height: 4rem;

  opacity: 1;
  border-radius: 90px;
  backdrop-filter: blur(2px);
  background: linear-gradient(
    90deg,
    rgba(67, 230, 134, 0.83) 0%,
    rgba(149, 232, 196, 0.72) 20%,
    rgba(72, 202, 228, 0.62) 40%,
    rgba(0, 150, 199, 0.47) 60%,
    rgba(0, 127, 186, 0.74) 79.44%,
    rgba(0, 119, 182, 0.87) 100%
  );
  box-shadow: 0px 2px 36px 0px rgba(84, 203, 214, 0.4);

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
    padding-right: 0.5rem;
  }

  .slider {
    width: 10rem;
    padding-right: 0.6rem;
  }

  .sound {
    margin-right: 1rem;
  }
}
</style>
