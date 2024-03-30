<script lang="ts" setup>
import BScroll from "@better-scroll/core";
import MouseWheel from "@better-scroll/mouse-wheel";
import DownFill from "@iconify-icons/mingcute/down-fill";
import { darken } from "@pureadmin/utils";
import { Lrc } from "lrc-kit";
import { computed, nextTick, onMounted, reactive, ref, watch } from "vue";
import { useNav } from "@/layout/hooks/useNav";
import { usePlaySongListStoreHook } from "@/store/modules/playSongList";
import { prominent } from "@/utils/color/color";
import { emitter } from "@/utils/mitt";
import Lyrics from "@/layout/components/musicPlay/components/lyrics/index.vue";
import IconButton from "@/layout/components/musicPlay/components/IconButton/index.vue";
import MusicPlayerInterface from "@/layout/components/musicPlay/components/MusicPlayerInterface/index.vue";
import { StringUtils } from "@/utils/ObjectsUtil";

const { closePlayMusic } = useNav();

// 进入时初始化当前音乐
emitter.on("openPlayMusic", async () => {
  await initAudio();
});

const audioRef = ref<HTMLAudioElement>();

const state = reactive({
  style: {
    // 背景动态渐变色
    bgColor: {}
  },
  audio: {
    lyricsArr: [],
    // 当前歌曲进度浮标
    lyricIndex: 0
  },
  scroll: {
    //判断是否被拖动
    isChange: false,
    scrollBS: {} as BScroll,
    isScrollRolling: true
  }
});
const storeHook = usePlaySongListStoreHook();

onMounted(async () => {
  BScroll.use(MouseWheel);
  await initAudio();
  // 页面刷新时自动获取音频是否在播放
  storeHook.isPlay = !audioRef.value.paused;
});

const musicInfo = computed(() => {
  return storeHook.getCurrentMusic;
});

const currentLyric = computed(() => {
  return musicInfo.value?.lyrics?.lyrics?.lyric;
});

async function initAudio() {
  await initPlaySong();
}

async function initPlaySong() {
  // 背景初始化
  intBgColor();
  // 重新播放
  audioRef.value?.load();
  // 初始化歌词
  initLyrics();
  // 修改Title
  document.title = `${musicInfo.value?.musicName} - ${musicInfo.value?.album?.albumName}`;
}

watch(currentLyric, val => {
  initLyrics(val);
});

// 初始歌曲时重新初始化歌词数组
function initLyrics(val: string = currentLyric.value) {
  state.audio.lyricIndex = 0;
  state.audio.lyricsArr = [];
  if (StringUtils.isNotBlank(val)) {
    const lrc = Lrc.parse(val);
    state.audio.lyricsArr = lrc.lyrics;
    state.audio.lyricsArr.sort((a, b) => a.timestamp - b.timestamp);
  }
}

watch(
  () => musicInfo?.value?.picUrl,
  () => {
    intBgColor();
  }
);

const bgImgRef = ref(null);
const intBgColor = async () => {
  if (StringUtils.isBlank(musicInfo?.value?.picUrl)) {
    return;
  }
  await nextTick();
  // 使用img element 不使用url, 防止axios图片请求跨域问题
  const colors = await prominent(bgImgRef.value, {
    format: "hex",
    group: 30
  });
  const color = colors[2] as string;
  if (color) {
    const darkColor = darken(color, 0.2);
    state.style.bgColor = {
      backgroundColor: `${darkColor}`
    };
  }
};
</script>

<template>
  <div class="main-box" :style="state.style.bgColor">
    <img
      ref="bgImgRef"
      :src="musicInfo?.picUrl"
      :alt="musicInfo?.picUrl"
      class="hidden"
    />
    <div class="toBack">
      <IconButton
        :icon="DownFill"
        width="3rem"
        height="3rem"
        @click="closePlayMusic"
      />
    </div>
    <div v-if="storeHook.isEmpty" class="w-full h-full flex-c">
      <span class="font-bold text-4xl">没有正在播放音乐</span>
    </div>
    <div v-else class="shadowMask">
      <div class="container-box">
        <MusicPlayerInterface
          v-model:audio-ref="audioRef"
          v-model:is-move="state.scroll.isChange"
          v-model:lyric-index="state.audio.lyricIndex"
          :lyrics-arr="state.audio.lyricsArr"
          :music-info="musicInfo"
          @init-audio="initAudio"
        />
        <Lyrics
          v-model:current-lyrics-index="state.audio.lyricIndex"
          v-model:audio-ref="audioRef"
          v-model:is-change="state.scroll.isChange"
          :lyrics-list="state.audio.lyricsArr"
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
  // background-color: rgba(0, 0, 0, 0.08);
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
</style>
