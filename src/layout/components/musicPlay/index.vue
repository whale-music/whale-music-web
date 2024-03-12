<script lang="ts" setup>
import BScroll from "@better-scroll/core";
import MouseWheel from "@better-scroll/mouse-wheel";
import DownFill from "@iconify-icons/mingcute/down-fill";
import { darken, isAllEmpty } from "@pureadmin/utils";
import { Lrc } from "lrc-kit";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useNav } from "@/layout/hooks/useNav";
import { usePlaySongListStoreHook } from "@/store/modules/playSongList";
import { prominent } from "@/utils/color/color";
import { emitter } from "@/utils/mitt";
import Lyrics from "@/layout/components/musicPlay/components/lyrics/index.vue";
import IconButton from "@/layout/components/musicPlay/components/IconButton/index.vue";
import MusicPlayerInterface from "@/layout/components/musicPlay/components/MusicPlayerInterface/index.vue";

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

onMounted(async () => {
  BScroll.use(MouseWheel);
  await initAudio();
});

const musicInfo = computed(() => {
  return storeHook.getCurrentMusic;
});

const currentLyric = computed(() => {
  return musicInfo.value?.lyrics?.lyrics?.lyric;
});

const storeHook = usePlaySongListStoreHook();

async function initAudio() {
  await initPlaySong();
}

async function initPlaySong() {
  // 背景初始化
  intBgColor();
  // 重新播放
  audioRef.value?.load();
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

const intBgColor = async (picUrl?: string) => {
  const url = picUrl ?? musicInfo.value?.picUrl;
  const colors = await prominent(url, {
    format: "hex",
    group: 30
  });
  const color1 = colors[2] as string;
  if (color1) {
    const color = darken(color1, 1 / 5);
    state.style.bgColor = {
      backgroundColor: `${color}`
    };
  }

  // TODO 渐变动画，暂时不能实现
  // const newColor: Number[][] = [hexToRgb(colors[1]), hexToRgb(colors[0])];
  // switchColor(newColor);
  // colors[1] = darken(colors[1], 1 / 5);
  // imgColorStyle.value = {
  //   background: `linear-gradient(312deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`
  // };
  // console.log(colors);
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
        <MusicPlayerInterface
          v-model:audio-ref="audioRef"
          v-model:is-move="state.scroll.isChange"
          v-model:lyric-index="state.audio.lyricIndex"
          v-model:lyrics-arr="state.audio.lyricsArr"
          :music-info="musicInfo"
          @init-audio="initAudio"
        />
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
</style>
