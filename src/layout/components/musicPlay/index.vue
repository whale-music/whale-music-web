<script lang="ts" setup>
import BScroll from "@better-scroll/core";
import MouseWheel from "@better-scroll/mouse-wheel";
import ArrowRightFill from "@iconify-icons/mingcute/arrow-right-fill";
import Playlist2Bold from "@iconify-icons/solar/playlist-2-bold";
import RewindForwardBoldDuotone from "@iconify-icons/solar/rewind-forward-bold-duotone";
import RewindBackBoldDuotone from "@iconify-icons/solar/rewind-back-bold-duotone";
import DownFill from "@iconify-icons/mingcute/down-fill";
import RepeatBold from "@iconify-icons/solar/repeat-bold";
import RepeatOneBold from "@iconify-icons/solar/repeat-one-bold";
import ShuffleLinear from "@iconify-icons/solar/shuffle-linear";
import { darken, isAllEmpty } from "@pureadmin/utils";
import { Lrc } from "lrc-kit";
import { computed, onMounted, reactive, ref, watch } from "vue";
import LoadImg from "@/components/LoadImg/LoadImg.vue";
import { useNav } from "@/layout/hooks/useNav";
import { usePlaySongListStoreHook } from "@/store/modules/playSongList";
import { prominent } from "@/utils/color/color";
import { dateFormater } from "@/utils/dateUtil";
import { emitter } from "@/utils/mitt";
import { getActualWidthOfChars } from "@/utils/textWidthUtil";
import { type MusicPlayInfo } from "@/api/model/Music";
import AudioPlay from "@/layout/components/musicPlay/components/AudioPlay/index.vue";
import Lyrics from "@/layout/components/musicPlay/components/lyrics/index.vue";
import IconButton from "@/layout/components/musicPlay/components/IconButton/index.vue";
import IconPlayButton from "@/layout/components/musicPlay/components/MusicPlayerInterface/components/IconPlayButton/index.vue";
import DialogPlayList from "@/layout/components/musicPlay/components/MusicPlayerInterface/components/DialogPlayList/index.vue";

const { closePlayMusic } = useNav();

// 监听容器
emitter.on("resize", ({ detail }) => {
  const { width } = detail;
  reDrawLayout(width);
});

// 进入时初始化当前音乐
emitter.on("openPlayMusic", async () => {
  await initAudio();
});

function reDrawLayout(width: number) {
  if (width <= 720) {
    const mobileWidth = 18;
    state.size.cover.width = mobileWidth + "rem";
    state.size.cover.height = mobileWidth + "rem";

    state.size.controller.width = mobileWidth + 2 + "rem";
    state.size.controller.height = mobileWidth + 2 + "rem";
  } else {
    const pcWidth = 23;
    state.size.cover.width = pcWidth + "rem";
    state.size.cover.height = pcWidth + "rem";

    state.size.controller.width = pcWidth + "rem";
    state.size.controller.height = pcWidth + "rem";
  }
}

// 歌词容器
const scrollRef = ref();
const lyricContentRef = ref([]);
// 音乐标题长度
const musicTitleRef = ref<HTMLDivElement | null>();
const audioRef = ref<HTMLAudioElement>();

const state = reactive({
  size: {
    cover: {
      width: "23rem",
      height: "23rem"
    },
    controller: {
      width: "23rem",
      height: ""
    }
  },
  dialog: {
    playList: false
  },
  style: {
    // 背景动态渐变色
    bgColor: {}
  },
  audio: {
    musicTitleWidth: 1,
    loading: false,
    musicInfo: {} as MusicPlayInfo,
    lyricsArr: [],
    timeProgressBar: 0,
    // 当前歌曲进度浮标
    lyricIndex: 0,
    audioBufferProgress: 0,
    loopType: 0
  },
  scroll: {
    //判断是否被拖动
    isChange: false,
    scrollBS: {} as BScroll,
    isScrollRolling: true
  },
  icon: {
    loopTypeIcon: ArrowRightFill
  }
});

onMounted(async () => {
  BScroll.use(MouseWheel);
  await initAudio();

  const width =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;
  reDrawLayout(width);
});

const musicInfo = computed(() => {
  return storeHook.getCurrentMusic;
});

const currentLyric = computed(() => {
  return musicInfo.value?.lyrics?.lyrics?.lyric;
});

const currentSources = computed(() => {
  return musicInfo.value?.sources[0];
});
watch(
  () => state.audio.lyricIndex,
  newValue => {
    // 判断歌词是否切换到下一段或者跳转到其他章节
    // console.log(state.scroll.isScrollRolling, "是否在滚动，滚动时不跳转歌词");
    if (state.scroll.isScrollRolling == true && scrollRef.value != null) {
      state.scroll.scrollBS.scrollToElement(
        lyricContentRef.value[newValue],
        500,
        true,
        true
      );
    }
  }
);

const storeHook = usePlaySongListStoreHook();

async function initAudio() {
  await initPlaySong();
  initScroll();
}

function initScroll() {
  if (scrollRef.value != null) {
    state.scroll.scrollBS = new BScroll(scrollRef.value, {
      probeType: 3,
      click: true,
      mouseWheel: true,
      bounce: true
    });
    state.scroll.scrollBS.on("alterOptions", () => {
      state.scroll.isScrollRolling = false;
      setTimeout(() => (state.scroll.isScrollRolling = true), 3000);
    });
  }
}

async function initPlaySong() {
  const titleWidth = getActualWidthOfChars(musicInfo.value?.musicName);
  state.audio.musicTitleWidth =
    musicTitleRef.value.offsetWidth > titleWidth ? 1 : 2;
  // 重新播放
  audioRef.value.load();
  // 初始歌曲时重新初始化歌词数组
  state.audio.lyricIndex = 0;
  state.audio.lyricsArr = [];
  if (!isAllEmpty(currentLyric.value)) {
    const lrc = Lrc.parse(currentLyric.value);
    state.audio.lyricsArr = lrc.lyrics;
    state.audio.lyricsArr.sort((a, b) => a.timestamp - b.timestamp);
  }
  // 修改Title
  document.title = `${musicInfo.value?.musicName} - ${musicInfo.value?.album?.albumName}`;
}

watch(
  () => musicInfo.value?.picUrl,
  value => {
    if (!isAllEmpty(value)) {
      // 背景渐变色
      getBGColor(value);
    }
  }
);
const getBGColor = async (picUrl: string) => {
  const colors = await prominent(picUrl, {
    format: "hex",
    group: 30
  });

  // TODO 渐变动画，暂时不能实现
  // const newColor: Number[][] = [hexToRgb(colors[1]), hexToRgb(colors[0])];
  // switchColor(newColor);
  // colors[1] = darken(colors[1], 1 / 5);
  // imgColorStyle.value = {
  //   background: `linear-gradient(312deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`
  // };
  const color1 = colors[1] as string;
  const color = darken(color1, 1 / 5);
  state.style.bgColor = {
    backgroundColor: `${color}`
  };
};

// 当前音乐循环图标
const musicLoopType = () => {
  if (state.audio.loopType == 3) {
    state.audio.loopType = -1;
  }
  state.audio.loopType++;
  switch (state.audio.loopType) {
    // 自动完播放音乐
    case 0:
      state.icon.loopTypeIcon = ArrowRightFill;
      break;
    // 循环播放歌单音乐
    case 1:
      state.icon.loopTypeIcon = RepeatBold;
      break;
    // 循环播放当前音乐
    case 2:
      state.icon.loopTypeIcon = RepeatOneBold;
      break;
    // 随机当前歌单音乐
    case 3:
      state.icon.loopTypeIcon = ShuffleLinear;
      break;
  }
};

// 开始播放
const onPlay = () => {
  audioRef.value.play();
};
// 暂停播放
const onPause = () => {
  audioRef.value.pause();
};

const lastMusic = async () => {
  // 切换歌曲时重新初始化歌词数组
  if (storeHook.isLastMusic) {
    storeHook.lastMusic();
  } else {
    // 跳转到播放列表最后一个
    storeHook.currentIndex = storeHook.playListMusicArr.length - 1;
  }
  await initAudio();
  onPlay();
};

const nextMusic = async () => {
  // 如果歌单列表中只有一首音乐则不切换
  // if (storeHook.getPlayMusicLength === 1) return;
  if (storeHook.isNextMusic) {
    storeHook.nextMusic();
  } else {
    // 跳转到播放列表第一个
    storeHook.currentIndex = 0;
  }
  await initAudio();
  onPlay();
};

//鼠标拖拽松开时
const changeMusicDuration = () => {
  state.scroll.isChange = false;
};
</script>

<template>
  <div class="main-box" :style="state.style.bgColor">
    <div class="toBack">
      <IconButton
        :icon="DownFill"
        width="3rem"
        height="3rem"
        @click="closePlayMusic"
      />
    </div>
    <div class="shadowMask">
      <div class="container-box">
        <div :style="{ width: state.size.controller.width }" class="controller">
          <LoadImg
            :src="musicInfo?.picUrl"
            :height="state.size.cover.height"
            :width="state.size.cover.width"
          />
          <div
            ref="musicTitleRef"
            :style="{ width: state.size.controller.width }"
          >
            <div class="flex overflow-hidden">
              <div v-for="item in state.audio.musicTitleWidth" :key="item">
                <span
                  class="music-font"
                  :class="{ animate: state.audio.musicTitleWidth === 2 }"
                >
                  {{ musicInfo.musicName }}
                </span>
              </div>
            </div>
          </div>
          <div class="flex w-full">
            <span class="album-font">{{ musicInfo?.album?.albumName }}</span>
            <span v-show="isAllEmpty(musicInfo?.artists)" class="album-font"
              >&nbsp;-&nbsp;</span
            >
            <span
              v-for="(item, index) in musicInfo?.artists"
              :key="index"
              class="artist-font"
            >
              {{ item.aliasName }}
            </span>
          </div>
          <div :style="{ width: state.size.controller.width }" class="progress">
            <el-slider
              v-model="state.audio.timeProgressBar"
              :style="{
                '--slider-progress': `${state.audio.audioBufferProgress}%`
              }"
              :min="0"
              :max="musicInfo.timeLength / 1000"
              :step="1"
              :show-tooltip="false"
              @mousedown="state.scroll.isChange = true"
              @mouseup="changeMusicDuration"
            />
            <div class="flex justify-between mt-2">
              <span class="select-none">
                {{ dateFormater("mm:ss", state.audio.timeProgressBar * 1000) }}
              </span>
              <span class="select-none">
                {{ dateFormater("mm:ss", musicInfo?.timeLength) }}
              </span>
            </div>
            <div class="play-operation-panel">
              <div class="flex items-center justify-between w-full">
                <IconButton
                  :icon="state.icon.loopTypeIcon"
                  width="2rem"
                  height="2rem"
                  @click="musicLoopType"
                />
                <IconButton
                  :icon="RewindBackBoldDuotone"
                  width="2.8rem"
                  height="2.8rem"
                  @click="lastMusic"
                />
                <IconPlayButton
                  :loading="state.audio.loading"
                  :is-play="storeHook.isPlay"
                  @onPause="onPause"
                  @onPlay="onPlay"
                />
                <IconButton
                  :icon="RewindForwardBoldDuotone"
                  width="2.8rem"
                  height="2.8rem"
                  @click="nextMusic"
                />
                <div>
                  <DialogPlayList
                    v-model="state.dialog.playList"
                    @init="initAudio"
                  />
                  <IconButton
                    :icon="Playlist2Bold"
                    width="2rem"
                    height="2rem"
                    @click="state.dialog.playList = true"
                  />
                </div>
              </div>
            </div>
          </div>
          <AudioPlay
            v-model:audio-ref="audioRef"
            v-model:lyrics-index="state.audio.lyricIndex"
            v-model:lyrics-list="state.audio.lyricsArr"
            v-model:is-move="state.scroll.isChange"
            v-model:buffer-progress="state.audio.audioBufferProgress"
            v-model:loop-type="state.audio.loopType"
            v-model:current-progress="state.audio.timeProgressBar"
            v-model:loading="state.audio.loading"
            :src="currentSources.url"
            @onSubmit="initAudio"
          />
        </div>
        <Lyrics
          v-model:lyrics-list="state.audio.lyricsArr"
          v-model:current-lyrics-index="state.audio.lyricIndex"
          v-model:audio-ref="audioRef"
          v-model:is-change="state.scroll.isChange"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$lyricPadding: 0.8rem;

@keyframes progress-1a35f519 {
  to {
    background-position: 25px 0;
  }
}

@keyframes scroll-animate {
  80%,
  100% {
    // todo animate
    transform: translate3d(calc((100vh + var(--gap)) / -2), 0, 0);
  }
}

* {
  @apply select-none;
  //transition: all ease 0.8s;
}

.toBack {
  position: absolute;
  top: 1rem;
  right: 2rem;
  z-index: 1;
}

.toBack:hover {
  background: #c4c4c440;
  border-radius: 1rem;
}

.main-box {
  width: 100%;
  height: 100%;
  color: #fff;

  /* 设置背景颜色，背景图加载过程中会显示背景色 */
  background-color: #464646;

  /* 背景图不平铺 */
  background-repeat: no-repeat;

  /* 当内容高度大于图片高度时，背景图像的位置相对于viewport固定 */
  background-attachment: fixed;

  /* 背景图垂直、水平均居中 */
  background-position: center center;

  /* 让背景图基于容器大小伸缩 */
  background-size: cover;
  transition: all 2s;
}

.shadowMask {
  height: 100%;
  background-color: rgb(118 118 122 / 47%);
  backdrop-filter: blur(50px);
}

.container-box {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  background-color: rgb(50 50 50 / 20%);
  backdrop-filter: blur(50px);

  // 小屏幕操作面板居中
  @media screen and (width <= 720px) {
    justify-content: center;
  }
}

.controller {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 24rem;
  margin-right: 2rem;
  margin-left: 2rem;
}

.music-font {
  --gap: 1.5625em;

  @apply w-max will-change-transform;

  display: flex;
  gap: 0 var(--gap);
  width: max-content;
  font-size: 2rem;
  animation: animate 12s linear 3s infinite;
}

.album-font {
  @apply font-bold select-none;

  font-size: 0.8rem;
}

.artist-font {
  @apply font-bold select-none;

  font-size: 0.8rem;
}

.progress {
  width: 22rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

:deep(.el-progress-bar__outer) {
  @apply cursor-pointer;

  background-color: #ebeef554;
}

:deep(.el-slider) {
  --el-slider-main-bg-color: #fff;
  --el-slider-runway-bg-color: rgb(255 255 255 / 10%);
  --el-slider-stop-bg-color: var(--el-color-white);
  --el-slider-disabled-color: var(--el-text-color-placeholder);
  --el-slider-border-radius: 3px;
  --el-slider-height: 6px;
  --el-slider-button-size: 20px;
  --el-slider-button-wrapper-size: 36px;
  --el-slider-button-wrapper-offset: -15px;

  height: var(--el-slider-height);
  background-color: transparent;
}

:deep(.el-slider__runway) {
  flex: none;
  width: 100%;
  background-color: rgb(255 255 255 / 10%);
}

:deep(.el-slider__runway::before) {
  display: block;
  flex: none;
  width: var(--slider-progress);
  height: var(--el-slider-height);
  content: "";
  background-color: rgb(255 255 255 / 40%);
  border-radius: var(--el-slider-border-radius);
  transition: width ease-in 0.5s;
}

:deep(.el-slider__bar) {
  top: 0;
}

.play-operation-panel {
  @apply flex justify-between items-center;

  // 小屏幕操作面板居中
  @media screen and (width <= 720px) {
    justify-content: center;
  }
}

// 背景渐变动画
.seekbar.loading .buffer[data-v-1a35f519] {
  background-color: rgb(193 200 209 / 60%);
  background-image: linear-gradient(
    -45deg,
    rgb(58 66 78 / 60%) 25%,
    transparent 0,
    transparent 50%,
    rgb(58 66 78 / 60%) 0,
    rgb(58 66 78 / 60%) 75%,
    transparent 0,
    transparent
  );
  background-repeat: repeat-x;
  background-size: 25px 25px;
  animation: progress-1a35f519 1s linear infinite;
}

.animate {
  --gap: 1.5625em;

  display: flex;
  gap: 0 var(--gap);
  animation: scroll-animate 12s linear 3s infinite;
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
