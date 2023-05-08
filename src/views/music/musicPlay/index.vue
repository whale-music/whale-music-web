<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Lyric, MusicSearchRes, MusicUrlInfo } from "@/api/music";
import LoadImg from "@/components/LoadImg/LoadImg.vue";
import { dateFormater } from "@/utils/dateUtil";
import ArrowDownBold from "@iconify-icons/solar/alt-arrow-down-outline";
import { prominent } from "@/utils/color/color";
import { usePlaySongListStoreHook } from "@/store/modules/playSongList";
import Loading3Fill from "@iconify-icons/mingcute/loading-3-fill";
import { getActualWidthOfChars } from "@/utils/textWidthUtil";
import { Lrc } from "lrc-kit";
import BScroll from "@better-scroll/core";
import MouseWheel from "@better-scroll/mouse-wheel";

const router = useRouter();

const currentMusicUrl = ref<MusicUrlInfo>({
  createTime: "",
  encodeType: "",
  exists: false,
  id: 0,
  level: "",
  md5: "",
  musicId: 0,
  origin: "",
  rate: 0,
  rawUrl: "",
  size: 0,
  updateTime: "",
  url: "",
  userId: 0
});

// 歌词容器
const scroll = ref();
const scrollBS = ref();
const isScrollRolling = ref<boolean>(true);
const lyricContentRef = ref([]);
const currentMusicLyric = ref<Lyric>({
  createTime: "",
  id: 0,
  lyric: "",
  musicId: 0,
  type: "",
  updateTime: ""
});
const musicInfo = ref<MusicSearchRes>({
  lyric: "",
  album: undefined,
  albumId: 0,
  albumName: "",
  aliaName: "",
  artistIds: [],
  artistName: [],
  artistNames: [],
  createTime: "",
  id: 0,
  isExist: false,
  isPlaying: false,
  kLyric: "",
  musicName: "",
  musicNameAlias: "",
  musicRawUrl: "",
  musicUrlList: [],
  order: false,
  pic: "",
  publishTime: "",
  singerList: [],
  sort: 0,
  timeLength: 0,
  updateTime: ""
});

// 背景动态渐变色
const imgColorStyle = ref();

const musicUrlList = ref<MusicUrlInfo[]>();
const musicLyricList = ref<Lyric[]>();
const lyricsArr = ref([]);

const currentIndex = ref<number>(0);
async function initMusicInfo(musicInfoRes: MusicSearchRes) {
  // 获取当前歌单播放音乐
  const playSongListStore = usePlaySongListStoreHook();
  musicInfo.value = musicInfoRes;
  currentIndex.value = playSongListStore.currentIndex;
  musicUrlList.value = await playSongListStore.getAllMusicUrl(
    musicInfo.value.id
  );
  musicLyricList.value = await playSongListStore.getLyric(musicInfo.value.id);
  const musicLyricIndex = musicLyricList.value.findIndex(
    value => value.type === "lyric"
  );
  if (musicLyricIndex === -1 || musicLyricList.value.length === 0) {
    currentMusicLyric.value = {
      createTime: "",
      id: 0,
      lyric: null,
      musicId: 0,
      type: "",
      updateTime: ""
    };
  } else {
    currentMusicLyric.value = musicLyricList.value[musicLyricIndex];
  }
  // currentMusicLyric.value =
  //   musicLyricIndex === -1
  //     ? currentMusicLyric.value
  //     : musicLyricList.value[musicLyricIndex];
  currentMusicUrl.value = musicUrlList.value[0];
}

async function initPlaySong() {
  const storeHook = usePlaySongListStoreHook();
  await initMusicInfo(storeHook.getCurrentMusic);
  const titleWidth = getActualWidthOfChars(musicInfo.value.musicName);
  musicTitleWidth.value = musicTitleRef.value.offsetWidth > titleWidth ? 1 : 2;

  lyricsArr.value = [];
  if (
    currentMusicLyric.value != null &&
    currentMusicLyric.value.lyric != null &&
    currentMusicLyric.value.lyric !== ""
  ) {
    const lrc = Lrc.parse(currentMusicLyric.value.lyric);
    lyricsArr.value = lrc.lyrics;
    lyricsArr.value.sort((a, b) => a.timestamp - b.timestamp);
    // const strings = currentMusicLyric.value.lyric.split("\n");
    // for (let i = 0; i < strings.length; i++) {
    //   const strings2 = strings[i].split("]");
    //   const tempTime = strings2[0].replace("[", "");
    //   const time = new Date(`1970T08:${tempTime}`).getTime();
    //
    //   strings2[1] = strings2[1] === "" ? "-" : strings2[1];
    //   // duration为毫秒值
    //   lyricsArr.value.push({
    //     duration: time,
    //     lyric: strings2[1]
    //   });
    // }
  }
  // 背景渐变色
  await getBGColor();
}

onMounted(async () => {
  await initPlaySong();
  BScroll.use(MouseWheel);
  scrollBS.value = await new BScroll(".bscroll", {
    probeType: 3,
    click: true,
    mouseWheel: true,
    bounce: true
  });
  scrollBS.value.on("alterOptions", () => {
    isScrollRolling.value = false;
    console.log(isScrollRolling.value, "滚动中");
    setTimeout(() => (isScrollRolling.value = true), 3000);
  });
});

const getBGColor = async () => {
  const musicPicUrl = `${musicInfo.value.pic}?time=${Math.random()}`;
  const colors = await prominent(musicPicUrl, {
    format: "hex",
    group: 30
  });

  imgColorStyle.value = {
    backgroundImage: `linear-gradient(312deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`
  };
};

const audioRef = ref({
  // 该字段是音频是否处于播放状态的属性
  playing: true,
  // 音频当前播放时长
  currentTime: 0,
  duration: 0,
  // 音频最大播放时长
  maxTime: 0,
  minTime: 0,
  step: 0.1,
  isLoading: false,
  buffered: null,
  isLoop: false,
  pause: () => {},
  play: () => {}
});

//判断是否被拖动
const isChange = ref<boolean>(false);
const timeProgressBar = ref<number>(0);

// 当前歌曲进度浮标
const lyricIndex = ref<number>(0);

// 进度条
const onTimeupdate = event => {
  // 获取缓冲进度
  if (audioRef.value.buffered != null && audioRef.value.buffered.length > 0) {
    const currentBuffer =
      audioRef.value.buffered.end(audioRef.value.buffered.length - 1) * 100;
    audioBufferProgress.value = currentBuffer / audioRef.value.duration;
  }

  const currentTime = event.target.currentTime;
  // state.sliderTime= formatProcessToolTip(state.sliderTime)
  // const value = (event.target.currentTime / event.target.duration) * 100;
  if (isChange.value == true) return;
  timeProgressBar.value = isNaN(currentTime) ? 0 : currentTime;
  // 转换成毫秒
  // const tempCurrentTime = currentTime * 1000;

  // 匹配歌词
  for (let i = 0; i < lyricsArr.value.length; i++) {
    // 播放进度不断推进， 判断每个歌词节点, 如果大于当前播放的时间，则进入下一个节点
    if (currentTime >= lyricsArr.value[i].timestamp) {
      if (i > lyricIndex.value) {
        lyricIndex.value = i;
        // rollFunc(true);
      } else {
        // 如果进度条回退， 当前值值绝对回比进度条到过的最大的值要小
        const tempNum = parseInt(lyricsArr.value[lyricIndex.value].timestamp);
        if (currentTime < tempNum) {
          const number = lyricIndex.value - i;
          // 歌词回退
          for (let j = 0; j < number; j++) {
            // rollFunc(false);
          }
          // 浮标重新赋值
          lyricIndex.value = i;
        }
      }
    }
  }
};

watch(lyricIndex, newValue => {
  // 判断歌词是否切换到下一段或者跳转到其他章节
  // console.log(isScrollRolling.value, "是否在滚动，滚动时不跳转歌词");
  if (isScrollRolling.value) {
    console.log("跳转歌词", newValue);
    scrollBS.value.scrollToElement(
      lyricContentRef.value[newValue],
      500,
      true,
      true
    );
  }
});

// 设置空歌词显示动画
const loadingTime = (item, index, arr) => {
  if (arr != null && arr.length > 0 && index !== arr.length - 1) {
    const number = arr[index + 1].timestamp - item.timestamp;
    console.log(number, "number");
    return number;
  } else {
    return 2;
  }
};

// 当前音乐循环选项
const loopType = ref<number>(0);
const loopTypeIcon = ref<string>("solar:arrow-right-bold");
const musicLoopType = () => {
  if (loopType.value == 3) {
    loopType.value = -1;
  }
  loopType.value++;
  switch (loopType.value) {
    // 自动完播放音乐
    case 0:
      loopTypeIcon.value = "solar:arrow-right-bold";
      break;
    // 循环播放歌单音乐
    case 1:
      loopTypeIcon.value = "solar:repeat-bold";
      break;
    // 循环播放当前音乐
    case 2:
      loopTypeIcon.value = "solar:repeat-one-bold";
      break;
    // 随机当前歌单音乐
    case 3:
      loopTypeIcon.value = "solar:shuffle-linear";
      break;
  }
};

const playing = ref<boolean>(true);
// 开始播放
const onPlay = () => {
  playing.value = false;
  console.log(playing.value);
  audioRef.value.play();
};
// 暂停播放
const onPause = () => {
  playing.value = true;
  console.log(playing.value);
  audioRef.value.pause();
};

const onEnded = async () => {
  const storeHook = usePlaySongListStoreHook();
  onPause();
  // 根据当前选项选择下一首音乐
  switch (loopType.value) {
    // 自动完播放音乐，关闭
    case 0:
      if (storeHook.isNextMusic) {
        storeHook.nextMusic();
        await initPlaySong();
      }
      break;
    // 循环播放歌单音乐
    case 1:
      // eslint-disable-next-line no-case-declarations
      if (storeHook.isNextMusic) {
        storeHook.nextMusic();
      } else {
        storeHook.currentIndex = 0;
      }
      await initPlaySong();
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
        if (randomNum !== currentIndex.value) {
          storeHook.currentIndex = randomNum;
          break;
        }
      }
      await initPlaySong();
      break;
  }
  onPlay();
};

const lastMusic = async () => {
  console.log("上一首");
  onPause();
  const storeHook = usePlaySongListStoreHook();
  if (storeHook.isLastMusic) {
    storeHook.lastMusic();
  } else {
    storeHook.currentIndex = storeHook.playListMusicArr.length - 1;
  }
  await initPlaySong();
};

const nextMusic = async () => {
  console.log("下一首");
  onPause();
  const storeHook = usePlaySongListStoreHook();
  if (storeHook.isNextMusic) {
    storeHook.nextMusic();
  } else {
    storeHook.currentIndex = 0;
  }
  await initPlaySong();
  onPlay();
};

const canplay = () => {
  audioRef.value.isLoading = true;
  if (musicInfo.value.timeLength == null) {
    musicInfo.value.timeLength = audioRef.value.duration * 1000;
    return;
  }
  // 不相等时取音频文件的时长
  if (musicInfo.value.timeLength !== audioRef.value.duration * 100) {
    musicInfo.value.timeLength = audioRef.value.duration * 1000;
  }
};

const editPlaySongListFlag = ref<boolean>(false);
const editPlaySongList = (index: number) => {
  usePlaySongListStoreHook().currentIndex = index;
  initPlaySong();
  editPlaySongListFlag.value = false;
};

const audioBufferProgress = ref(0);

// 音乐标题长度
const musicTitleRef = ref();
const musicTitleWidth = ref<number>(1);

//鼠标拖拽松开时
const changeMusicDuration = () => {
  audioRef.value.currentTime = timeProgressBar.value;
  isChange.value = false;
};

// 播放到歌词点击的时间点
const toLyrics = timestamp => {
  audioRef.value.currentTime = timestamp;
  console.log(audioRef.value.currentTime, "item");
  isChange.value = false;
};
</script>

<template>
  <div class="main-box" :style="imgColorStyle">
    <div class="toBack icon-bg">
      <IconifyIconOffline
        class="icon-scale"
        :icon="ArrowDownBold"
        width="3rem"
        height="3rem"
        @click="router.back()"
      />
    </div>
    <div class="shadowMask">
      <div class="container-box">
        <div class="controller">
          <LoadImg :src="musicInfo.pic" height="23rem" width=" 23rem" />
          <div class="w-[24rem]" ref="musicTitleRef">
            <div class="overflow-hidden flex">
              <div v-for="item in musicTitleWidth" :key="item">
                <span
                  class="music-font"
                  :class="{ animate: musicTitleWidth === 2 }"
                  >{{ musicInfo.musicName }}</span
                >
              </div>
            </div>
          </div>
          <div class="flex w-full">
            <span class="album-font">{{ musicInfo.albumName }}</span>
            <span
              class="album-font"
              v-show="
                musicInfo.artistNames !== null &&
                musicInfo.artistNames.length !== 0
              "
              >&nbsp;-&nbsp;</span
            >
            <span
              class="artist-font"
              v-for="(item, index) in musicInfo.artistNames"
              :key="index"
              >{{ item }}</span
            >
          </div>
          <div class="progress">
            <el-slider
              :style="{
                '--slider-progress': `${audioBufferProgress}%`
              }"
              :min="0"
              :max="musicInfo.timeLength / 1000"
              :step="1"
              v-model="timeProgressBar"
              :show-tooltip="false"
              @mousedown="isChange = true"
              @mouseup="changeMusicDuration"
            />
            <div class="flex justify-between mt-2">
              <span class="select-none">{{
                dateFormater("mm:ss", timeProgressBar * 1000)
              }}</span>
              <span class="select-none">
                {{ dateFormater("mm:ss", musicInfo.timeLength) }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <div class="icon-bg">
                <a>
                  <IconifyIconOnline
                    class="icon-scale"
                    @click="musicLoopType"
                    :icon="loopTypeIcon"
                    width="2rem"
                    height="2rem"
                  />
                </a>
              </div>
              <div class="flex justify-center items-center">
                <div class="icon-bg mr-2">
                  <IconifyIconOnline
                    @click="lastMusic"
                    class="cursor-pointer icon-scale"
                    icon="solar:rewind-back-bold-duotone"
                    width="2.8rem"
                    height="2.8rem"
                  />
                </div>
                <div>
                  <div v-if="audioRef.isLoading">
                    <div v-if="playing">
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
                    <div v-else>
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
                  </div>
                  <IconifyIconOffline
                    v-else
                    :icon="Loading3Fill"
                    class="animate-spin"
                    width="3.25rem"
                    height="3.25rem"
                  />
                </div>
                <div class="icon-bg ml-2">
                  <IconifyIconOnline
                    @click="nextMusic"
                    class="cursor-pointer icon-scale"
                    icon="solar:rewind-forward-bold-duotone"
                    width="2.8rem"
                    height="2.8rem"
                  />
                </div>
              </div>
              <div>
                <el-dialog
                  v-model="editPlaySongListFlag"
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
                    @click="editPlaySongListFlag = true"
                    class="cursor-pointer icon-scale"
                    icon="solar:playlist-2-bold"
                    width="2rem"
                    height="2rem"
                  />
                </div>
              </div>
            </div>
          </div>
          <audio
            :src="currentMusicUrl.url"
            @timeupdate="onTimeupdate"
            @play="onPlay"
            @pause="onPause"
            @ended="onEnded"
            @canplay="canplay"
            @loop="audioRef.isLoop"
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
                lyricsArr.length === 0 ||
                lyricsArr[0].content === '' ||
                lyricsArr[0].timestamp == null ||
                currentMusicLyric.lyric == null ||
                currentMusicLyric.lyric === ''
              "
            >
              <div class="mt-[36vh]" />
              <span class="currently-playing">纯音乐， 请欣赏</span>
              <div class="mb-24" />
            </div>
            <div v-else>
              <div ref="scroll" class="bscroll">
                <div class="scroll-content">
                  <div
                    v-for="(item, index) in lyricsArr"
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
                          lyricsArr
                        )}s`
                      }"
                    >
                      <div class="load-container">
                        <div
                          class="loader__circle"
                          :class="{ 'loading-anima': lyricIndex === index }"
                        />
                        <div
                          class="loader__circle"
                          :class="{ 'loading-anima': lyricIndex === index }"
                        />
                        <div
                          class="loader__circle"
                          :class="{ 'loading-anima': lyricIndex === index }"
                        />
                        <div
                          class="loader__circle"
                          :class="{ 'loading-anima': lyricIndex === index }"
                        />
                      </div>
                      <br />
                    </div>
                    <p
                      v-else
                      :class="{
                        'lyric-item': true,
                        'currently-playing': lyricIndex === index
                      }"
                      class="select-none"
                      @mousedown="isChange = true"
                      @mouseup="toLyrics(item.timestamp)"
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
  background-color: rgba(202, 198, 198, 0.5);
  backdrop-filter: blur(50px);
}

.container-box {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: 100%;
  background-color: rgba(50, 50, 50, 0.2);
  backdrop-filter: blur(50px);
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
