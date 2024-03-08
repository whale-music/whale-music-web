<script setup lang="ts">
import { Lyric } from "lrc-kit/src/lrc";
import { onMounted, reactive, ref, watch } from "vue";
import BScroll from "@better-scroll/core";
import MouseWheel from "@better-scroll/mouse-wheel";

defineOptions({
  name: "Lyrics"
});

// 歌词列表
const lyricsList = defineModel<Lyric[]>("lyricsList");
// 当前歌词
const currentLyricsIndex = defineModel<number>("currentLyricsIndex");
// 音频ref
const audioRef = defineModel<any>("audioRef");
// 进度条移动
const isChange = defineModel<boolean>("isChange");

const lyricContentRef = ref([]);
// 歌词容器
const scrollRef = ref<HTMLElement>();

const lyrics = reactive({
  isScrollRolling: true,
  scrollBS: {} as BScroll
});

// 设置空歌词显示动画
const loadingTime = (item: Lyric, index: number, arr: Lyric[]) => {
  if (arr != null && arr.length > 0 && index !== arr.length - 1) {
    return arr[index + 1].timestamp - item.timestamp;
  } else {
    return 2;
  }
};

// 播放到歌词点击的时间点
const toLyrics = (timestamp: number, index: number) => {
  // console.log(index, "index");
  currentLyricsIndex.value = index;
  audioRef.value.currentTime = timestamp;
  isChange.value = false;
};

onMounted(() => {
  BScroll.use(MouseWheel);
  initScroll();
});

watch(scrollRef, val => {
  // console.log(val, "scroll");
  initScroll(val);
});

// 初始化歌词列表
function initScroll(val?: HTMLElement) {
  const htmlRef = val ?? scrollRef.value;
  if (htmlRef != null) {
    lyrics.scrollBS = new BScroll(htmlRef, {
      probeType: 3,
      click: true,
      mouseWheel: true,
      bounce: true
    });
    lyrics.scrollBS.on("alterOptions", () => {
      lyrics.isScrollRolling = false;
      setTimeout(() => (lyrics.isScrollRolling = true), 3000);
    });
  }
}

watch(
  () => currentLyricsIndex.value,
  newValue => {
    // 判断歌词是否切换到下一段或者跳转到其他章节
    // console.log(lyrics.isScrollRolling, "是否在滚动，滚动时不跳转歌词");
    // console.log(newValue, "val");
    if (lyrics.isScrollRolling == true && scrollRef.value != null) {
      lyrics.scrollBS.scrollToElement(
        lyricContentRef.value[newValue],
        500,
        true,
        true
      );
    }
  }
);

const isEmpty = (val: any[]) => {
  return val === undefined || val === null || val.length === 0;
};
</script>

<template>
  <div class="lyric">
    <div class="scrollbar">
      <div v-if="isEmpty(lyricsList)">
        <div class="mt-[36vh]" />
        <span class="currently-playing lyric-item">暂无歌词，请添加</span>
        <div class="mb-24" />
      </div>
      <div v-else>
        <div ref="scrollRef" class="bscroll">
          <div>
            <div class="w-full h-[30vh]" />
            <div
              v-for="(item, index) in lyricsList"
              :key="index"
              ref="lyricContentRef"
            >
              <div
                v-if="item.content === ''"
                :style="{
                  '--lyric-loading': `${loadingTime(item, index, lyricsList)}s`
                }"
              >
                <!--歌词播放纯音乐时小圆点占位-->
                <div class="load-container">
                  <div
                    v-for="i in 4"
                    :key="i"
                    class="loader__circle"
                    :class="{
                      'loading-anima': currentLyricsIndex === index
                    }"
                  />
                </div>
                <br />
              </div>
              <p
                v-else
                :class="{
                  'currently-playing': currentLyricsIndex === index
                }"
                class="select-none lyric-item"
                @mousedown="isChange = true"
                @mouseup="toLyrics(item.timestamp, index)"
              >
                {{ item.content }}
              </p>
            </div>
            <div class="w-full h-[30vh]" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
$lyricPadding: 0.8rem;

.lyric {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 55rem;
  height: 100%;
  margin-left: 2rem;

  // 小屏幕不显示歌词
  @media screen and (width <= 720px) {
    display: none;
  }
}

.scrollbar {
  height: 90vh;
  mask: linear-gradient(
    180deg,
    hsl(0deg 0% 100% / 0%),
    hsl(0deg 0% 100% / 60%) 15%,
    #fff 25%,
    #fff 75%,
    hsl(0deg 0% 100% / 60%) 85%,
    hsl(0deg 0% 100% / 0%)
  );
}

.bscroll {
  position: relative;
  height: 90vh;
  overflow: hidden;
}

.lyric-item:hover {
  padding: $lyricPadding;
  color: #f0f0f0;
  background-color: rgb(0 0 0 / 20%);
  border-radius: 1rem;
}

.lyric-item {
  display: block;
  padding: $lyricPadding;
  margin-top: 1.25rem;
  margin-bottom: 1.25rem;
  font-size: 2.5rem;
  font-weight: 700;
  color: rgb(200 200 200 / 50%);
  cursor: pointer;
  transition: font-size 1s;
}

// 必须在lyric-item后面，否则样式会被覆盖
.currently-playing {
  padding: $lyricPadding;
  margin-top: 3rem;
  margin-bottom: 3rem;
  font-size: 3.5rem;
  color: #fff;
  transition: color 1.5s;
}

.load-container {
  @keyframes loader-901 {
    0% {
      background: rgb(200 200 200 / 50%);
      transform: scale(1);
    }

    50% {
      transform: scale(1.8);
    }

    100% {
      background: #fff;
      transform: scale(1);
    }
  }

  display: flex;
  gap: 14px;
  // justify-content: start;
  align-items: center;
  height: 100%;
  margin-left: 1rem;

  .ball {
    background: rgb(200 200 200 / 50%);
  }

  .loader__circle {
    width: 14px;
    height: 14px;
    background: rgb(200 200 200 / 50%);
    border-radius: 50%;
  }

  .loading-anima {
    animation: loader-901 var(--lyric-loading) ease-in-out infinite;
  }
}
</style>
