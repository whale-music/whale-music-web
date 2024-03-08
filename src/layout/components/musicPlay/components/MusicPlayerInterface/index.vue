<script setup lang="ts">
import { isAllEmpty } from "@pureadmin/utils";
import RewindBackBoldDuotone from "@iconify-icons/solar/rewind-back-bold-duotone.js";
import RewindForwardBoldDuotone from "@iconify-icons/solar/rewind-forward-bold-duotone.js";
import Playlist2Bold from "@iconify-icons/solar/playlist-2-bold.js";
import { dateFormater } from "@/utils/dateUtil.js";
import { computed, onMounted, reactive, ref } from "vue";
import { emitter } from "@/utils/mitt.js";
import ArrowRightFill from "@iconify-icons/mingcute/arrow-right-fill";
import RepeatBold from "@iconify-icons/solar/repeat-bold";
import RepeatOneBold from "@iconify-icons/solar/repeat-one-bold";
import ShuffleLinear from "@iconify-icons/solar/shuffle-linear";
import DialogPlayList from "@/layout/components/musicPlay/components/MusicPlayerInterface/components/DialogPlayList/index.vue";
import IconButton from "@/layout/components/musicPlay/components/IconButton/index.vue";
import AudioPlay from "@/layout/components/musicPlay/components/AudioPlay/index.vue";
import LoadImg from "@/components/LoadImg/LoadImg.vue";
import type { MusicPlayInfo } from "@/api/model/Music";
import type { IconifyIcon } from "@iconify/types";
import { usePlaySongListStoreHook } from "@/store/modules/playSongList";
import { Lyric } from "lrc-kit/src/lrc";
import IconPlayButton from "@/layout/components/musicPlay/components/MusicPlayerInterface/components/IconPlayButton/index.vue";
import { getActualWidthOfChars } from "@/utils/textWidthUtil";
import { useRouter } from "vue-router";
import { useNav } from "@/layout/hooks/useNav";

defineOptions({
  name: "MusicPlayerInterface"
});

const audioRef = defineModel<HTMLAudioElement>("audioRef");
const isMove = defineModel<boolean>("isMove");
const lyricIndex = defineModel<number>("lyricIndex");
const lyricsArr = defineModel<Lyric[]>("lyricsArr");

const props = defineProps({
  musicInfo: {
    type: Object as PropType<MusicPlayInfo>,
    required: true
  }
});
const emits = defineEmits(["initAudio"]);
const musicInfo = computed<MusicPlayInfo>(() => {
  return props.musicInfo;
});
const audio = reactive({
  audioBufferProgress: 0,
  timeProgressBar: 0,
  musicTitleWidth: 1,
  loopType: 0,
  icon: {} as PropType<IconifyIcon>,
  loading: false
});
const dialogPlayList = ref(false);
const currentSources = computed(() => {
  return musicInfo.value?.sources[0];
});

// 音乐标题长度
const musicTitleRef = ref<HTMLElement>();
const initAudio = async () => {
  emits("initAudio");
};

const musicTitleIsRoll = computed(() => {
  const titleWidth = getActualWidthOfChars(musicInfo.value?.musicName);
  return musicTitleRef?.value?.offsetWidth > titleWidth ? 2 : 1;
});

// 监听容器
emitter.on("resize", ({ detail }) => {
  const { width } = detail;
  reDrawLayout(width);
});

onMounted(async () => {
  const width =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;
  reDrawLayout(width);

  // 初始化音乐循环icon
  musicLoopType();
});

type sizeType = { width: string; height: string };
const size = reactive({
  cover: {} as sizeType,
  controller: {} as sizeType
});

function reDrawLayout(width: number) {
  if (width <= 720) {
    const mobileWidth = 18;
    size.cover.width = mobileWidth + "rem";
    size.cover.height = mobileWidth + "rem";

    size.controller.width = mobileWidth + 2 + "rem";
    size.controller.height = mobileWidth + 2 + "rem";
  } else {
    const pcWidth = 23;
    size.cover.width = pcWidth + "rem";
    size.cover.height = pcWidth + "rem";

    size.controller.width = pcWidth + "rem";
    size.controller.height = pcWidth + "rem";
  }
}

// 当前音乐循环图标
const musicLoopType = () => {
  if (audio.loopType == 3) {
    audio.loopType = -1;
  }
  audio.loopType++;
  switch (audio.loopType) {
    // 自动完播放音乐
    case 0:
      audio.icon = ArrowRightFill;
      break;
    // 循环播放歌单音乐
    case 1:
      audio.icon = RepeatBold;
      break;
    // 循环播放当前音乐
    case 2:
      audio.icon = RepeatOneBold;
      break;
    // 随机当前歌单音乐
    case 3:
      audio.icon = ShuffleLinear;
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
const storeHook = usePlaySongListStoreHook();

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
  isMove.value = false;
};

const { closePlayMusic } = useNav();
const router = useRouter();
const toArtist = (id: number) => {
  router.push({ name: "ArtistInfo", query: { id: id } });
  closePlayMusic();
};
</script>
<template>
  <div :style="{ width: size.controller.width }" class="controller select-none">
    <LoadImg
      :src="musicInfo.picUrl"
      :height="size.cover.height"
      :width="size.cover.width"
    />
    <div ref="musicTitleRef" :style="{ width: size.controller.width }">
      <div class="flex overflow-hidden">
        <div v-for="item in musicTitleIsRoll" :key="item">
          <span class="music-font" :class="{ animate: musicTitleIsRoll == 2 }">
            {{ musicInfo.musicName }}
          </span>
        </div>
      </div>
    </div>
    <div class="flex w-full">
      <span
        class="font-bold select-none text-sm hover:opacity-50 cursor-pointer"
      >
        <router-link
          :to="{ name: 'AlbumInfo', query: { id: musicInfo?.album?.id } }"
        >
          {{ musicInfo?.album?.albumName }}
        </router-link>
      </span>
      <span v-show="!isAllEmpty(musicInfo?.artists)" class="album-font">
        &nbsp;-&nbsp;
      </span>
      <span
        v-for="(item, index) in musicInfo?.artists"
        :key="index"
        class="font-bold select-none text-sm opacity-90 hover:opacity-50 cursor-pointer"
        @click="toArtist(item.id)"
      >
        {{ item.artistName }}
      </span>
    </div>
    <div :style="{ width: size.controller.width }" class="progress">
      <el-slider
        v-model="audio.timeProgressBar"
        :style="{
          '--slider-progress': `${audio.audioBufferProgress}%`
        }"
        :min="0"
        :max="musicInfo.timeLength / 1000"
        :step="1"
        :show-tooltip="false"
        @mousedown="isMove = true"
        @mouseup="changeMusicDuration"
      />
      <div class="flex justify-between mt-2">
        <span class="select-none">
          {{ dateFormater("mm:ss", audio.timeProgressBar * 1000) }}
        </span>
        <span class="select-none">
          {{ dateFormater("mm:ss", musicInfo.timeLength) }}
        </span>
      </div>
      <div class="play-operation-panel">
        <div class="flex items-center justify-between w-full">
          <IconButton
            :icon="audio.icon"
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
            :loading="audio.loading"
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
            <DialogPlayList v-model="dialogPlayList" @init="initAudio" />
            <IconButton
              :icon="Playlist2Bold"
              width="2rem"
              height="2rem"
              @click="dialogPlayList = true"
            />
          </div>
        </div>
      </div>
    </div>
    <AudioPlay
      v-model:audio-ref="audioRef"
      v-model:lyrics-index="lyricIndex"
      v-model:lyrics-list="lyricsArr"
      v-model:is-move="isMove"
      v-model:buffer-progress="audio.audioBufferProgress"
      v-model:loop-type="audio.loopType"
      v-model:current-progress="audio.timeProgressBar"
      v-model:loading="audio.loading"
      :src="currentSources.url"
      @onSubmit="initAudio"
    />
  </div>
</template>

<style lang="scss" scoped>


@keyframes scroll-animate {
  80%,
  100% {
    // todo animate
    transform: translate3d(calc((100vh + var(--gap)) / -2), 0, 0);
  }
}

.progress {
  width: 22rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

:deep(.el-progress-bar__outer) {
  cursor: pointer;
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

.album-font {
  font-size: 0.8rem;
  font-weight: 700;
  user-select: none;
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

  display: flex;
  gap: 0 var(--gap);
  width: max-content;
  font-size: 2rem;
  animation: animate 12s linear 3s infinite;
  will-change: transform;
}

.play-operation-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;

  // 小屏幕操作面板居中
  @media screen and (width <= 720px) {
    justify-content: center;
  }
}
// 音乐标题动画
.animate {
  --gap: 1.5625em;

  display: flex;
  gap: 0 var(--gap);
  animation: scroll-animate 12s linear 3s infinite;
}
</style>
