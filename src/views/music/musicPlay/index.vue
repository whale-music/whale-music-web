<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  getAllMusicList,
  getMusicLyric,
  getMusicUrl,
  MusicLyricRes,
  MusicSearchRes,
  MusicUrlInfo
} from "@/api/music";
import LoadImg from "@/components/LoadImg/LoadImg.vue";
import { dateFormater } from "@/utils/dateUtil";
import anime from "animejs/lib/anime.es.js";

const router = useRouter();

const idValue = ref();
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

const currentMusicLyric = ref<MusicLyricRes>({
  createTime: "",
  id: 0,
  lyric: "",
  musicId: 0,
  type: "",
  updateTime: ""
});
const musicInfo = ref<MusicSearchRes>({
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

const musicUrlList = ref<MusicUrlInfo[]>();
const musicLyricList = ref<MusicLyricRes[]>();

const lyricsArr = ref([]);

onMounted(async () => {
  idValue.value = router.currentRoute.value.query.id;
  const tempUrl = await getMusicUrl(idValue.value);
  musicUrlList.value = tempUrl.data;
  const tempMusicInfo = await getAllMusicList({
    afterDate: "",
    albumName: "",
    artistName: "",
    beforeDate: "",
    musicIds: [idValue.value],
    musicName: "",
    order: false,
    orderBy: "",
    page: { pageIndex: 0, pageNum: 0 }
  });
  musicInfo.value = tempMusicInfo.data.records[0];
  const tempMusicLyric = await getMusicLyric(idValue.value);
  musicLyricList.value = tempMusicLyric.data;

  currentMusicUrl.value = musicUrlList.value[0];
  currentMusicLyric.value = musicLyricList.value[0];

  // lyricsArr.value = currentMusicLyric.value.lyric.split("\n");
  const strings = currentMusicLyric.value.lyric.split("\n");
  for (let i = 0; i < strings.length; i++) {
    const strings2 = strings[i].split("]");
    const tempTime = strings2[0].replace("[", "");
    const time = new Date(`1970T08:${tempTime}`).getTime();

    strings2[1] = strings2[1] === "" ? "-" : strings2[1];
    // duration为毫秒值
    lyricsArr.value.push({
      duration: time,
      lyric: strings2[1]
    });
  }
});

const audioRef = ref({
  // 该字段是音频是否处于播放状态的属性
  playing: true,
  // 音频当前播放时长
  currentTime: 0,
  // 音频最大播放时长
  maxTime: 0,
  minTime: 0,
  step: 0.1
});

//判断是否被拖动
const isChange = ref<boolean>(false);
const timeProgressBar = ref<number>(0);

// 当前歌曲进度浮标
const lyricIndex = ref<number>(0);

// 进度条
const onTimeupdate = event => {
  const currentTime = event.target.currentTime;
  // state.sliderTime= formatProcessToolTip(state.sliderTime)
  // const value = (event.target.currentTime / event.target.duration) * 100;
  if (isChange.value == true) return;
  timeProgressBar.value = isNaN(currentTime) ? 0 : currentTime;
  // 转换成毫秒
  const tempCurrentTime = currentTime * 1000;

  // 匹配歌词
  for (let i = 0; i < lyricsArr.value.length; i++) {
    // 播放进度不断推进， 判断每个歌词节点, 如果大于当前播放的时间，则进入下一个节点
    if (tempCurrentTime > parseInt(lyricsArr.value[i].duration)) {
      if (i > lyricIndex.value) {
        lyricIndex.value = i;
        rollFunc(true);
      } else {
        // 如果进度条回退， 当前值值绝对回比进度条到过的最大的值要小
        const tempNum = parseInt(lyricsArr.value[lyricIndex.value].duration);
        if (tempCurrentTime < tempNum) {
          const number = lyricIndex.value - i;
          // 歌词回退
          for (let j = 0; j < number; j++) {
            rollFunc(false);
          }
          // 浮标重新赋值
          lyricIndex.value = i;
          console.log(tempCurrentTime, "进度条回退");
        }
      }
    }
  }
};
// 在加载的元数据上
// const onLoadedmetadata = event => {
//   // duration 总时长
//   sumDuration.value = parseInt(event.target.duration);
//   console.log(sumDuration.value, `总时长`);
// };
// const sumDuration = ref<number>(0);

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

//鼠标拖拽松开时
const changeMusicDuration = () => {
  audioRef.value.currentTime = timeProgressBar.value;
  isChange.value = false;
};

// 滚动步长
const rollProgress = ref<number>(0);

// 滚动到歌词播放地方
const rollFunc = flag => {
  console.log(flag, "flag");
  rollProgress.value = rollProgress.value - (flag ? 3.5 : -3.5);

  const lyricAnime = anime({
    targets: [".lyric-item"],
    translateY: `${rollProgress.value}rem`,
    duration: 1500,
    easing: "easeInOutExpo",
    autoplay: false
  });
  lyricAnime.play();
};

// 播放到歌词点击的时间点
const toLyrics = item => {
  audioRef.value.currentTime = Math.ceil(item.duration / 1000);
  console.log(audioRef.value.currentTime, "item");
  isChange.value = false;
};
</script>

<template>
  <div
    class="main-box"
    :style="{ background: `linear-gradient(#4c2046, #4d1e40)` }"
  >
    <div class="shadowMask">
      <div class="container-box">
        <div class="controller">
          <LoadImg :src="musicInfo.pic" />
          <span class="music-font">{{ musicInfo.musicName }}</span>
          <div class="flex">
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
              :min="0"
              :max="musicInfo.timeLength / 1000"
              :step="1"
              v-model="timeProgressBar"
              :show-tooltip="false"
              @mousedown="isChange = true"
              @mouseup="changeMusicDuration"
            />
            <div class="flex justify-between">
              <span>{{ dateFormater("mm:ss", timeProgressBar * 1000) }}</span>
              <span>
                {{ dateFormater("mm:ss", musicInfo.timeLength) }}
              </span>
            </div>
            <div class="flex justify-center items-center">
              <IconifyIconOnline
                @click="rollFunc(false)"
                class="cursor-pointer mr-4"
                icon="solar:rewind-back-bold-duotone"
                width="2.8rem"
                height="2.8rem"
              />
              <div>
                <div v-if="playing">
                  <IconifyIconOnline
                    @click="onPlay"
                    class="cursor-pointer"
                    icon="solar:play-bold"
                    width="3.25rem"
                    height="3.25rem"
                  />
                </div>
                <div v-else>
                  <IconifyIconOnline
                    @click="onPause"
                    class="cursor-pointer"
                    icon="solar:pause-circle-bold"
                    width="3.25rem"
                    height="3.25rem"
                  />
                </div>
              </div>
              <IconifyIconOnline
                @click="rollFunc(true)"
                class="cursor-pointer ml-4"
                icon="solar:rewind-forward-bold-duotone"
                width="2.8rem"
                height="2.8rem"
              />
            </div>
          </div>
          <audio
            :src="currentMusicUrl.url"
            @timeupdate="onTimeupdate"
            @play="onPlay"
            @pause="onPause"
            ref="audioRef"
          >
            您的浏览器不支持 audio 元素。
          </audio>
        </div>
        <div>
          <div class="lyric">
            <el-scrollbar height="100vh">
              <div v-for="(item, index) in lyricsArr" :key="index">
                <div class="mt-[36vh]" v-if="index === 0" />
                <span
                  :class="{
                    'lyric-item': true,
                    'currently-playing': lyricIndex === index
                  }"
                  @mousedown="isChange = true"
                  @mouseup="toLyrics(item)"
                >
                  {{ item.lyric }}
                </span>
                <div class="mb-24" v-if="index === lyricsArr.length - 1" />
              </div>
            </el-scrollbar>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
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
}

.shadowMask {
  background-color: rgba(202, 198, 198, 0.5);
  backdrop-filter: blur(50px);
}

.container-box {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: rgba(50, 50, 50, 0.2);
  backdrop-filter: blur(50px);
}

.controller {
  margin: 2rem;
  display: flex;
  flex-direction: column;
}

.lyric {
  height: 100%;
  margin-left: 2rem;
  width: 40rem;
}

.music-font {
  font-size: 2rem;
}

.album-font {
  @apply font-bold;
  font-size: 0.8rem;
}

.artist-font {
  @apply font-bold;
  font-size: 0.8rem;
}

.progress {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

:deep(.el-progress-bar__outer) {
  @apply cursor-pointer;
  background-color: #ebeef554;
}

:deep(.el-slider) {
  --el-slider-main-bg-color: #ffffff;
  --el-slider-runway-bg-color: rgba(255, 255, 255, 0.4);
  --el-slider-stop-bg-color: var(--el-color-white);
  --el-slider-disabled-color: var(--el-text-color-placeholder);
  --el-slider-border-radius: 3px;
  --el-slider-height: 6px;
  --el-slider-button-size: 20px;
  --el-slider-button-wrapper-size: 36px;
  --el-slider-button-wrapper-offset: -15px;
}

.lyric-item {
  @apply block mt-5 mb-5 cursor-pointer hover:text-[#f0f0f0] font-bold;
  font-size: 1.5rem; /* 24px */
  color: rgba(200, 200, 200, 0.5);
  transform: translateY(1.5rem);
}

.currently-playing {
  @apply mt-8 mb-8;
  font-size: 2rem;
  color: #ffffff;
  animation: 1s lyricsAnimation ease 1;
}

@keyframes lyricsAnimation {
  from {
    font-size: 1.5rem;
    color: rgba(200, 200, 200, 0.5);
  }

  to {
    font-size: 2rem;
    color: #ffffff;
  }
}
</style>
