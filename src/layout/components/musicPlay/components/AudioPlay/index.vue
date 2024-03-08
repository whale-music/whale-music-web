<script setup lang="ts">
import { useEventListener } from "@vueuse/core";
import { Lyric } from "lrc-kit/src/lrc";
import { usePlaySongListStoreHook } from "@/store/modules/playSongList";
import { ref, watch } from "vue";

defineOptions({
  name: "AudioPlay"
});
const src = defineModel<string>("src");
const audioPlayRef = defineModel<HTMLAudioElement>("audioRef");
const currentProgress = defineModel("currentProgress");
const bufferProgress = defineModel("bufferProgress");
const isLoad = defineModel("isLoad");
const isPlaying = defineModel("isPlaying");
const isMove = defineModel("isMove");
const lyricsIndex = defineModel<number>("lyricsIndex");
const lyricsList = defineModel<Lyric[]>("lyricsList");
const loopType = defineModel<number>("loopType");
const loading = defineModel("loading");

const audioRef = ref();
const isLoop = ref<boolean>(false);
const emits = defineEmits([
  "onPlay",
  "onPause",
  "onEnded",
  "canplay",
  "onLoadStart",
  "onSubmit"
]);

watch(audioRef, v => {
  audioPlayRef.value = v;
});

watch(currentProgress, val => {
  audioRef.value.currentTime = val;
});

const storeHook = usePlaySongListStoreHook();

const onPlay = () => {
  storeHook.isPlay = true;
  emits("onPlay");
};
const onPause = () => {
  storeHook.isPlay = false;
  emits("onPause");
};
const onSubmit = () => {
  emits("onSubmit");
};

const canplay = () => {
  isLoad.value = true;
  emits("canplay");
};
const onLoadStart = () => {
  emits("onLoadStart");
};

useEventListener(audioRef, "pause", val => {
  isPlaying.value = false;
  storeHook.isPlay = false;
});
useEventListener(audioRef, "playing", val => {
  isPlaying.value = true;
  storeHook.isPlay = true;
});
useEventListener(audioRef, "loadedmetadata", val => {
  loading.value = true;
});

// 进度条
// 获取缓冲进度
const onTimeupdate = (event: any) => {
  if (audioRef.value?.buffered != null && audioRef.value.buffered.length > 0) {
    bufferProgress.value =
      (event.target.buffered.end(event.target.buffered.length - 1) * 100) /
      audioRef.value.duration;
  }

  // console.log(bufferProgress.value);
  if (isMove.value == true) return;
  const currentTime = event.target.currentTime;
  currentProgress.value = isNaN(currentTime) ? 0 : currentTime;
  // console.log(currentProgress.value);

  // 匹配歌词
  for (let i = 0; i < lyricsList.value.length; i++) {
    // 播放进度不断推进， 判断每个歌词节点, 如果大于当前播放的时间，则进入下一个节点
    if (currentTime >= lyricsList.value[i].timestamp) {
      const index = lyricsIndex.value;
      if (i > index) {
        lyricsIndex.value = i;
      } else {
        // 如果进度条回退， 当前值值绝对回比进度条到过的最大的值要小
        const tempNum = parseInt(lyricsList.value[index].timestamp);
        if (currentTime < tempNum) {
          // 浮标重新赋值
          lyricsIndex.value = i;
        }
      }
    }
  }
};

// 歌曲循环状态
const onEnded = async () => {
  onPause();
  // 切换歌曲时重新初始化歌词数组
  lyricsIndex.value = 0;
  // 根据当前选项选择下一首音乐
  switch (loopType.value) {
    // 自动完播放音乐，关闭
    case 0:
      if (storeHook.isNextMusic) {
        storeHook.nextMusic();
        break;
      }
      return;
    // 循环播放歌单音乐
    case 1:
      if (storeHook.isNextMusic) {
        storeHook.nextMusic();
      } else {
        storeHook.seekMusicByIndex(0);
      }
      break;
    // 循环播放当前音乐
    case 2:
      isLoop.value = true;
      break;
    // 随机当前歌单音乐
    case 3:
      storeHook.randomMusic();
      break;
  }
  onPlay();
  onSubmit();
  emits("onEnded");
};
</script>

<template>
  <audio
    ref="audioRef"
    :src="src"
    autofocus
    @timeupdate="onTimeupdate"
    @play="onPlay"
    @pause="onPause"
    @ended="onEnded"
    @canplay="canplay"
    @loop="isLoop"
    @loadeddata="onLoadStart"
  >
    您的浏览器不支持 audio 元素。
  </audio>
</template>
