<script lang="ts" setup>
import { onMounted, reactive, ref, watch } from "vue";
import { Lyric, MusicSearchRes, MusicUrlInfo } from "@/api/music";
import LoadImg from "@/components/LoadImg/LoadImg.vue";
import { dateFormater } from "@/utils/dateUtil";
import DownFill from "@iconify-icons/mingcute/down-fill";
import { prominent } from "@/utils/color/color";
import { usePlaySongListStoreHook } from "@/store/modules/playSongList";
import Loading3Fill from "@iconify-icons/mingcute/loading-3-fill";
import ArrowRightFill from "@iconify-icons/mingcute/arrow-right-fill";
import RepeatBold from "@iconify-icons/solar/repeat-bold";
import RepeatOneBold from "@iconify-icons/solar/repeat-one-bold";
import ShuffleLinear from "@iconify-icons/solar/shuffle-linear";
import { getActualWidthOfChars } from "@/utils/textWidthUtil";
import { Lrc } from "lrc-kit";
import BScroll from "@better-scroll/core";
import MouseWheel from "@better-scroll/mouse-wheel";
import { useNav } from "@/layout/hooks/useNav";
import { emitter } from "@/utils/mitt";
import { useDialog } from "@/layout/hooks/useDialog";
import { darken } from "@pureadmin/utils";
import IconifyIconOffline from "@/components/ReIcon/src/iconifyIconOffline";

const { widthRef } = useDialog();
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
const musicTitleRef = ref();
const audioRef = ref({
  // 该字段是音频是否处于播放状态的属性
  paused: false,
  // 音频当前播放时长
  currentTime: 0,
  duration: 0,
  // 音频最大播放时长
  maxTime: 0,
  minTime: 0,
  step: 0.1,
  buffered: null,
  isLoop: false,
  pause: () => {},
  play: () => {},
  load: () => {}
});

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
  music: {
    musicTitleRef: musicTitleRef
  },
  audio: {
    audioRef: audioRef,
    musicTitleWidth: 1,
    loading: false,
    musicInfo: {} as MusicSearchRes,
    musicUrlList: [] as MusicUrlInfo[],
    musicLyricList: [] as Lyric[],
    lyricsArr: [],
    currentMusicIndex: 0,
    currentMusicUrl: {} as MusicUrlInfo,
    currentMusicLyric: {} as Lyric,
    timeProgressBar: 0,
    // 当前歌曲进度浮标
    lyricIndex: 0,
    audioBufferProgress: 0,
    loopType: 0,
    playing: false
  },
  scroll: {
    scroll: scrollRef,
    //判断是否被拖动
    isChange: false,
    lyricContentRef: lyricContentRef,
    scrollBS: {} as any,
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
// 监听播放
watch(
  () => state.audio.playing,
  value => {
    console.log(value);
    storeHook.isPlay = value;
  }
);

async function initAudio() {
  await initPlaySong();
  await initScroll();
}

async function initMusicInfo(musicInfoRes: MusicSearchRes) {
  // 获取当前歌单播放音乐
  const playSongListStore = usePlaySongListStoreHook();
  state.audio.musicInfo = musicInfoRes;
  state.audio.currentMusicIndex = playSongListStore.currentIndex;
  state.audio.musicUrlList = await playSongListStore.getAllMusicUrl(
    state.audio.musicInfo.id
  );
  state.audio.musicLyricList = await playSongListStore.getLyric(
    state.audio.musicInfo.id
  );
  const musicLyricIndex = state.audio.musicLyricList.findIndex(
    value => value.type === "lyric"
  );
  if (musicLyricIndex === -1 || state.audio.musicLyricList.length === 0) {
    state.audio.currentMusicLyric = {
      createTime: "",
      id: 0,
      lyric: null,
      musicId: 0,
      type: "",
      updateTime: ""
    };
  } else {
    state.audio.currentMusicLyric = state.audio.musicLyricList[musicLyricIndex];
  }

  state.audio.currentMusicUrl = state.audio.musicUrlList[0];
}

async function initScroll() {
  if (scrollRef.value != null) {
    state.scroll.scrollBS = await new BScroll(scrollRef.value, {
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
  const storeHook = usePlaySongListStoreHook();
  const musicInfoRes = storeHook.getCurrentMusic;
  if (musicInfoRes.id === state.audio.musicInfo.id) {
    audioRef.value.pause();
  } else {
    // 不是当前的音乐时重新初始化歌词下标
    state.audio.lyricIndex = 0;
  }
  await initMusicInfo(musicInfoRes);
  const titleWidth = getActualWidthOfChars(state.audio.musicInfo.musicName);
  state.audio.musicTitleWidth =
    state.music?.musicTitleRef.value?.offsetWidth > titleWidth ? 1 : 2;

  state.audio.lyricsArr = [];
  if (
    state.audio.currentMusicLyric != null &&
    state.audio.currentMusicLyric.lyric != null &&
    state.audio.currentMusicLyric.lyric !== ""
  ) {
    const lrc = Lrc.parse(state.audio.currentMusicLyric.lyric);
    state.audio.lyricsArr = lrc.lyrics;
    state.audio.lyricsArr.sort((a, b) => a.timestamp - b.timestamp);
  }
  // 背景渐变色
  getBGColor();
  // 修改Title
  document.title = `${state.audio.musicInfo.musicName} - ${state.audio.musicInfo.artistNames}`;
}

const getBGColor = async () => {
  const colors = await prominent(state.audio.musicInfo.pic, {
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
  const color = darken(colors[1], 1 / 5);
  state.style.bgColor = {
    backgroundColor: `${color}`
  };
};

// 进度条
const onTimeupdate = event => {
  // 获取缓冲进度
  if (audioRef.value.buffered != null && audioRef.value.buffered.length > 0) {
    const currentBuffer =
      audioRef.value.buffered.end(audioRef.value.buffered.length - 1) * 100;
    state.audio.audioBufferProgress = currentBuffer / audioRef.value.duration;
  }

  const currentTime = event.target.currentTime;
  if (state.scroll.isChange == true) return;
  state.audio.timeProgressBar = isNaN(currentTime) ? 0 : currentTime;

  // 匹配歌词
  for (let i = 0; i < state.audio.lyricsArr.length; i++) {
    // 播放进度不断推进， 判断每个歌词节点, 如果大于当前播放的时间，则进入下一个节点
    if (
      currentTime >= state.audio.lyricsArr[i].timestamp &&
      i > state.audio.lyricIndex
    ) {
      state.audio.lyricIndex = i;
    }
  }
};

// 设置空歌词显示动画
const loadingTime = (item, index, arr) => {
  if (arr != null && arr.length > 0 && index !== arr.length - 1) {
    return arr[index + 1].timestamp - item.timestamp;
  } else {
    return 2;
  }
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
  state.audio.playing = true;
  audioRef.value.play();
};
// 暂停播放
const onPause = () => {
  state.audio.playing = false;
  audioRef.value.pause();
};

const onEnded = async () => {
  const storeHook = usePlaySongListStoreHook();
  onPause();
  // 切换歌曲时重新初始化歌词数组
  state.audio.lyricIndex = 0;
  // 根据当前选项选择下一首音乐
  switch (state.audio.loopType) {
    // 自动完播放音乐，关闭
    case 0:
      if (storeHook.isNextMusic) {
        storeHook.nextMusic();
        await initAudio();
      }
      break;
    // 循环播放歌单音乐
    case 1:
      if (storeHook.isNextMusic) {
        storeHook.nextMusic();
      } else {
        storeHook.currentIndex = 0;
      }
      await initAudio();
      break;
    // 循环播放当前音乐
    case 2:
      audioRef.value.isLoop = true;
      break;
    // 随机当前歌单音乐
    case 3:
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const randomNum = parseInt(
          Math.random() * storeHook.getPlayListMusic.length - 1
        );
        if (randomNum !== state.audio.currentMusicIndex) {
          storeHook.currentIndex = randomNum;
          break;
        }
      }
      await initAudio();
      break;
  }
  onPlay();
};

const lastMusic = async () => {
  // 如果歌单列表中只有一首音乐则不切换
  if (storeHook.playListMusicArr.length === 1) return;
  // 切换歌曲时重新初始化歌词数组
  state.audio.lyricIndex = 0;
  // onPause();
  if (storeHook.isLastMusic) {
    storeHook.lastMusic();
  } else {
    storeHook.currentIndex = storeHook.playListMusicArr.length - 1;
  }
  await initAudio();
  onPlay();
};

const nextMusic = async () => {
  // 如果歌单列表中只有一首音乐则不切换
  if (storeHook.playListMusicArr.length === 1) return;
  // 切换歌曲时重新初始化歌词数组
  state.audio.lyricIndex = 0;
  // onPause();
  if (storeHook.isNextMusic) {
    storeHook.nextMusic();
  } else {
    storeHook.currentIndex = 0;
  }
  await initAudio();
  onPlay();
};

const canplay = () => {
  if (state.audio.musicInfo.timeLength == null) {
    state.audio.musicInfo.timeLength = audioRef.value.duration * 1000;
    return;
  }
  // 不相等时取音频文件的时长
  if (state.audio.musicInfo.timeLength !== audioRef.value.duration * 100) {
    state.audio.musicInfo.timeLength = audioRef.value.duration * 1000;
  }
};

// 开始加载歌曲
const onLoadStart = () => {
  state.audio.loading = true;
};

const editPlaySongList = (index: number) => {
  usePlaySongListStoreHook().currentIndex = index;
  initAudio();
  state.dialog.playList = false;
};

//鼠标拖拽松开时
const changeMusicDuration = () => {
  audioRef.value.currentTime = state.audio.timeProgressBar;
  state.scroll.isChange = false;
};

// 播放到歌词点击的时间点
const toLyrics = (timestamp, index) => {
  console.log(index, "index");
  state.audio.lyricIndex = index;
  audioRef.value.currentTime = timestamp;
  state.scroll.isChange = false;
};
</script>

<template>
  <div class="main-box" :style="state.style.bgColor">
    <div class="toBack icon-bg">
      <IconifyIconOffline
        class="icon-scale"
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
            :src="state.audio.musicInfo.pic"
            :height="state.size.cover.height"
            :width="state.size.cover.width"
          />
          <div
            :style="{ width: state.size.controller.width }"
            ref="musicTitleRef"
          >
            <div class="overflow-hidden flex">
              <div v-for="item in state.audio.musicTitleWidth" :key="item">
                <span
                  class="music-font"
                  :class="{ animate: state.audio.musicTitleWidth === 2 }"
                  >{{ state.audio.musicInfo.musicName }}</span
                >
              </div>
            </div>
          </div>
          <div class="flex w-full">
            <span class="album-font">{{
              state.audio.musicInfo.albumName
            }}</span>
            <span
              class="album-font"
              v-show="
                state.audio.musicInfo.artistNames != null &&
                state.audio.musicInfo.artistNames.length !== 0
              "
              >&nbsp;-&nbsp;</span
            >
            <span
              class="artist-font"
              v-for="(item, index) in state.audio.musicInfo.artistNames"
              :key="index"
              >{{ item }}</span
            >
          </div>
          <div :style="{ width: state.size.controller.width }" class="progress">
            <el-slider
              :style="{
                '--slider-progress': `${state.audio.audioBufferProgress}%`
              }"
              :min="0"
              :max="state.audio.musicInfo.timeLength / 1000"
              :step="1"
              v-model="state.audio.timeProgressBar"
              :show-tooltip="false"
              @mousedown="state.scroll.isChange = true"
              @mouseup="changeMusicDuration"
            />
            <div class="flex justify-between mt-2">
              <span class="select-none">{{
                dateFormater("mm:ss", state.audio.timeProgressBar * 1000)
              }}</span>
              <span class="select-none">
                {{ dateFormater("mm:ss", state.audio.musicInfo.timeLength) }}
              </span>
            </div>
            <div class="play-operation-panel">
              <div class="w-full flex justify-between items-center">
                <div class="icon-bg">
                  <IconifyIconOffline
                    class="icon-scale"
                    @click="musicLoopType"
                    :icon="state.icon.loopTypeIcon"
                    width="2rem"
                    height="2rem"
                  />
                </div>
                <div class="icon-bg">
                  <IconifyIconOnline
                    @click="lastMusic"
                    class="cursor-pointer icon-scale"
                    icon="solar:rewind-back-bold-duotone"
                    width="2.8rem"
                    height="2.8rem"
                  />
                </div>
                <div>
                  <div v-if="state.audio.loading">
                    <div v-if="state.audio.playing">
                      <div class="icon-bg">
                        <IconifyIconOnline
                          @click="onPause"
                          class="cursor-pointer icon-scale"
                          icon="solar:pause-circle-bold"
                          width="3.25rem"
                          height="3.25rem"
                        />
                      </div>
                    </div>
                    <div v-else>
                      <div class="icon-bg">
                        <IconifyIconOnline
                          @click="onPlay"
                          class="cursor-pointer icon-scale"
                          icon="solar:play-bold"
                          width="3.25rem"
                          height="3.25rem"
                        />
                      </div>
                    </div>
                  </div>
                  <IconifyIconOffline
                    v-else
                    :icon="Loading3Fill"
                    class="animate-spin"
                    width="3.25rem"
                    height="3.25rem"
                  />
                </div>
                <div class="icon-bg">
                  <IconifyIconOnline
                    @click="nextMusic"
                    class="cursor-pointer icon-scale"
                    icon="solar:rewind-forward-bold-duotone"
                    width="2.8rem"
                    height="2.8rem"
                  />
                </div>
                <div>
                  <el-dialog
                    v-model="state.dialog.playList"
                    :width="widthRef"
                    :show-close="false"
                    :modal="false"
                  >
                    <div>
                      <h1 class="text-black">当前播放</h1>
                      <el-scrollbar height="20rem">
                        <div
                          v-for="(item, index) in usePlaySongListStoreHook()
                            .getPlayListMusic"
                          :key="item.id"
                          class="dialog-play-song-list"
                          @click="editPlaySongList(index)"
                        >
                          <LoadImg
                            height="3rem"
                            width="3rem"
                            radius="10px"
                            :src="item.pic"
                          />
                          <div>
                            <span class="font-bold ml-4">{{
                              item.musicName
                            }}</span>
                            <span>{{ item.aliaName }}</span>
                          </div>
                        </div>
                      </el-scrollbar>
                    </div>
                  </el-dialog>
                  <div class="icon-bg">
                    <IconifyIconOnline
                      @click="state.dialog.playList = true"
                      class="cursor-pointer icon-scale"
                      icon="solar:playlist-2-bold"
                      width="2rem"
                      height="2rem"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <audio
            :src="state.audio.currentMusicUrl.rawUrl"
            @timeupdate="onTimeupdate"
            @play="onPlay"
            @pause="onPause"
            @ended="onEnded"
            @canplay="canplay"
            @loop="audioRef.isLoop"
            @loadeddata="onLoadStart"
            autofocus
            ref="audioRef"
          >
            您的浏览器不支持 audio 元素。
          </audio>
        </div>
        <div class="lyric">
          <div class="scrollbar">
            <div
              v-if="
                state.audio.lyricsArr.length === 0 ||
                state.audio.lyricsArr[0].content === '' ||
                state.audio.lyricsArr[0].timestamp == null ||
                state.audio.currentMusicLyric.lyric == null ||
                state.audio.currentMusicLyric.lyric === ''
              "
            >
              <div class="mt-[36vh]" />
              <span class="currently-playing">纯音乐， 请欣赏</span>
              <div class="mb-24" />
            </div>
            <div v-else>
              <div ref="scrollRef" class="bscroll">
                <div class="scroll-content">
                  <div
                    v-for="(item, index) in state.audio.lyricsArr"
                    :key="index"
                    class="bscroll-container"
                    ref="lyricContentRef"
                  >
                    <div
                      v-if="item.content === ''"
                      :style="{
                        '--lyric-loading': `${loadingTime(
                          item,
                          index,
                          state.audio.lyricsArr
                        )}s`
                      }"
                    >
                      <!--歌词播放纯音乐时小圆点占位-->
                      <div class="load-container">
                        <div
                          class="loader__circle"
                          :class="{
                            'loading-anima': state.audio.lyricIndex === index
                          }"
                        />
                        <div
                          class="loader__circle"
                          :class="{
                            'loading-anima': state.audio.lyricIndex === index
                          }"
                        />
                        <div
                          class="loader__circle"
                          :class="{
                            'loading-anima': state.audio.lyricIndex === index
                          }"
                        />
                        <div
                          class="loader__circle"
                          :class="{
                            'loading-anima': state.audio.lyricIndex === index
                          }"
                        />
                      </div>
                      <br />
                    </div>
                    <p
                      v-else
                      :class="{
                        'lyric-item': true,
                        'currently-playing': state.audio.lyricIndex === index
                      }"
                      class="select-none"
                      @mousedown="state.scroll.isChange = true"
                      @mouseup="toLyrics(item.timestamp, index)"
                    >
                      {{ item.content }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
  to {
    transform: translate3d(calc((100% + var(--gap)) / -2), 0, 0);
  }
}

* {
  @apply select-none;
  transition: all ease 0.8s;
}

.toBack {
  z-index: 1;
  position: absolute;
  top: 1rem;
  right: 2rem;
}

.toBack:hover {
  background: #c4c4c440;
  border-radius: 1rem;
}

.main-box {
  color: #ffffff;
  /* 背景图垂直、水平均居中 */
  background-position: center center;
  /* 背景图不平铺 */
  background-repeat: no-repeat;
  /* 当内容高度大于图片高度时，背景图像的位置相对于viewport固定 */
  background-attachment: fixed;
  /* 让背景图基于容器大小伸缩 */
  background-size: cover;
  /* 设置背景颜色，背景图加载过程中会显示背景色 */
  background-color: #464646;
  transition: all 2s;
  width: 100%;
  height: 100%;
}

.shadowMask {
  height: 100%;
  background-color: rgba(118, 118, 122, 0.47);
  backdrop-filter: blur(50px);
}

.container-box {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: 100%;
  background-color: rgba(50, 50, 50, 0.2);
  backdrop-filter: blur(50px);

  // 小屏幕操作面板居中
  @media screen and (max-width: 720px) {
    justify-content: center;
  }
}

.controller {
  margin-left: 2rem;
  margin-right: 2rem;
  width: 24rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.lyric {
  height: 100%;
  width: 55rem;
  margin-left: 2rem;

  display: flex;
  flex-direction: column;
  justify-content: center;

  // 小屏幕不显示歌词
  @media screen and (max-width: 720px) {
    display: none;
  }
}

.music-font {
  --gap: 1.5625em;
  @apply w-max will-change-transform;
  width: max-content;
  font-size: 2rem;
  animation: animate 12s linear 3s infinite;
  display: flex;
  gap: 0 var(--gap);
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
  margin-top: 1rem;
  margin-bottom: 1rem;
  width: 22rem;
}

:deep(.el-progress-bar__outer) {
  @apply cursor-pointer;
  background-color: #ebeef554;
}

:deep(.el-slider) {
  --el-slider-main-bg-color: #ffffff;
  --el-slider-runway-bg-color: rgba(255, 255, 255, 0.1);
  --el-slider-stop-bg-color: var(--el-color-white);
  --el-slider-disabled-color: var(--el-text-color-placeholder);
  --el-slider-border-radius: 3px;
  --el-slider-height: 6px;
  --el-slider-button-size: 20px;
  --el-slider-button-wrapper-size: 36px;
  --el-slider-button-wrapper-offset: -15px;
  background-color: transparent;
  height: var(--el-slider-height);
}

:deep(.el-slider__runway) {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  flex: none;
}

:deep(.el-slider__runway::before) {
  content: "";
  transition: width ease-in 0.5s;
  width: var(--slider-progress);
  height: var(--el-slider-height);
  border-radius: var(--el-slider-border-radius);
  background-color: rgba(255, 255, 255, 0.4);
  flex: none;
  display: block;
}

:deep(.el-slider__bar) {
  top: 0;
}

.lyric-item:hover {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 1rem;
  padding: $lyricPadding;
}

.lyric-item {
  @apply block mt-5 mb-5 cursor-pointer hover:text-[#f0f0f0] font-bold;
  font-size: 2.5rem;
  color: rgba(200, 200, 200, 0.5);
  padding: $lyricPadding;
  transition: font-size 1s;
}

.currently-playing {
  @apply mt-12 mb-12;
  font-size: 3.5rem;
  padding: $lyricPadding;
  color: #ffffff;
  transition: color 1.5s;
}

.scrollbar {
  height: 90vh;
  -webkit-mask: linear-gradient(
    180deg,
    hsla(0, 0%, 100%, 0),
    hsla(0, 0%, 100%, 0.6) 15%,
    #fff 25%,
    #fff 75%,
    hsla(0, 0%, 100%, 0.6) 85%,
    hsla(0, 0%, 100%, 0)
  );
  mask: linear-gradient(
    180deg,
    hsla(0, 0%, 100%, 0),
    hsla(0, 0%, 100%, 0.6) 15%,
    #fff 25%,
    #fff 75%,
    hsla(0, 0%, 100%, 0.6) 85%,
    hsla(0, 0%, 100%, 0)
  );
}

.bscroll {
  height: 90vh;
  overflow: hidden;
  position: relative;
}

:deep(.el-dialog) {
  border-radius: 1rem;
  height: 30rem;
  backdrop-filter: blur(20px);
  background-color: var(--el-bg-color);
}

.dialog-play-song-list {
  display: flex;
  align-items: center;
  padding: 0.8rem;
  border-radius: 1rem;
  z-index: 100;
}

.dialog-play-song-list:hover {
  background: rgba(98, 97, 97, 0.37);
}

.play-operation-panel {
  @apply flex justify-between items-center;

  // 小屏幕操作面板居中
  @media screen and (max-width: 720px) {
    justify-content: center;
  }
}

.icon-bg {
  height: 4rem;
  width: 4rem;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  border-radius: 1rem;
  transition: all ease-in-out 0.2s;
}

.icon-bg:hover {
  background: #dedede7c;
  border-radius: 1rem;
}

.icon-bg:active {
  background-color: #cecececb;
  border-radius: 1rem;
}

.icon-scale {
  transition: transform cubic-bezier(0.4, 0, 0.2, 1) 0.15s;
}

.icon-scale:active {
  transform: scale(0.8, 0.8);
}

// 背景渐变动画
.seekbar.loading .buffer[data-v-1a35f519] {
  animation: progress-1a35f519 1s linear infinite;
  background-color: rgba(193, 200, 209, 0.6);
  background-image: linear-gradient(
    -45deg,
    rgba(58, 66, 78, 0.6) 25%,
    transparent 0,
    transparent 50%,
    rgba(58, 66, 78, 0.6) 0,
    rgba(58, 66, 78, 0.6) 75%,
    transparent 0,
    transparent
  );
  background-repeat: repeat-x;
  background-size: 25px 25px;
}

.animate {
  --gap: 1.5625em;
  animation: scroll-animate 12s linear 3s infinite;
  display: flex;
  gap: 0 var(--gap);
}

.load-container {
  @keyframes loader_901 {
    0% {
      transform: scale(1);
      background: rgba(200, 200, 200, 0.5);
    }

    50% {
      transform: scale(1.8);
    }

    100% {
      transform: scale(1);
      background: #ffffff;
    }
  }
  display: flex;
  margin-left: 1rem;
  justify-content: start;
  align-items: center;
  height: 100%;
  gap: 14px;

  .ball {
    background: rgba(200, 200, 200, 0.5);
  }

  .loader__circle {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: rgba(200, 200, 200, 0.5);
  }

  .loading-anima {
    animation: loader_901 var(--lyric-loading) ease-in-out infinite;
  }
}
</style>
