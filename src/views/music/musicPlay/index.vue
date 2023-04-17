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

const lyricsArr = ref<string[]>();

const progressRed = ref(null);
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

  lyricsArr.value = currentMusicLyric.value.lyric.split("\n");

  console.log(progressRed.value.offsetHeight, `offsetHeight`);
  console.log(currentMusicUrl.value);
});

// const audioRef = ref<HTMLAudioElement>(new Audio());
// const onTimeupdateFun = event => {
//   console.log(event.currentTime);
// };

const audioRef = ref({
  // 该字段是音频是否处于播放状态的属性
  playing: false,
  // 音频当前播放时长
  currentTime: 0,
  // 音频最大播放时长
  maxTime: 0,
  minTime: 0,
  step: 0.1
});

// 进度条
const onTimeupdate = event => {
  const currentTime = event.target.currentTime;
  console.log(currentTime, `currentTime`);
  // state.sliderTime= formatProcessToolTip(state.sliderTime)
};
const onLoadedmetadata = event => {
  const duration = parseInt(event.target.duration);
  console.log(duration, `duration`);
};

const timeProgressBar = ref<number>(20);

const toProgress = event => {
  console.log(event.x, `x`);
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
            <el-progress
              ref="progressRed"
              @click="toProgress($event)"
              :percentage="timeProgressBar"
              color="#f5eeee"
              :show-text="false"
            />
          </div>
          <audio
            :src="currentMusicUrl.url"
            @timeupdate="onTimeupdate"
            @canplay="onLoadedmetadata"
            controls
            ref="audioRef"
          >
            您的浏览器不支持 audio 元素。
          </audio>
        </div>
        <div>
          <div class="lyric">
            <el-scrollbar height="100vh">
              <div v-for="(item, index) in lyricsArr" :key="index">
                <div class="mt-24" v-if="index === 0" />
                <span
                  class="block mt-8 mb-8 cursor-pointer hover:text-[#302b2c] font-bold text-2xl"
                >
                  {{ item }}
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
  height: 100vh;
  background-color: rgba(50, 50, 50, 0.2);
  backdrop-filter: blur(50px);
}

.controller {
  margin: 2rem;
  display: flex;
  flex-direction: column;
}

.lyric {
  height: 100vh;
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
</style>
