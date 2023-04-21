<script setup lang="ts">
import { ref, onBeforeMount, Ref, computed } from "vue";
import {
  getAlbumCount,
  getAlbumTop,
  getArtistCount,
  getMusicCount,
  getMusicStatistics,
  getMusicTop,
  getPluginTask,
  MusicStatisticsRes,
  PluginTaskRes
} from "@/api/hone";
import { Album, Music } from "@/api/music";
import LoadImg from "@/components/LoadImg/LoadImg.vue";
import { EchartOptions, useDark, useECharts } from "@pureadmin/utils";

defineOptions({
  name: "Welcome"
});

const musicList = ref<Music[]>();
const albumList = ref<Album[]>();

const musicCount = ref<number>();
const albumCount = ref<number>();
const artistCount = ref<number>();

const musicMusicStatistics = ref<MusicStatisticsRes[]>();

const pluginTask = ref<PluginTaskRes[]>();
onBeforeMount(async () => {
  const _musicCount = await getMusicCount();
  const _albumCount = await getAlbumCount();
  const _artistCount = await getArtistCount();

  musicCount.value = _musicCount.data;
  albumCount.value = _albumCount.data;
  artistCount.value = _artistCount.data;
  const album = await getAlbumTop();
  const music = await getMusicTop();
  albumList.value = album.data;
  musicList.value = music.data;

  const _musicMusicStatistics = await getMusicStatistics();
  musicMusicStatistics.value = _musicMusicStatistics.data;

  const _pluginTask = await getPluginTask();
  pluginTask.value = _pluginTask.data;

  let _count = 0;
  const _maps = [];
  for (const musicStatisticsRe of musicMusicStatistics.value) {
    _count += musicStatisticsRe.value;
    _maps[musicStatisticsRe.name] = musicStatisticsRe.value;
  }
  // 有效音乐
  effectiveMusic.value = Math.ceil((_maps["effectiveMusic"] / _count) * 100);
  // 无音源
  noSoundSourceCount.value = Math.ceil(
    (_maps["noSoundSourceCount"] / _count) * 100
  );
  // 失效音源
  invalidMusicOrigin.value = parseInt(
    (_maps["invalidMusicOrigin"] / _count) * 100
  );
  // 废弃音源
  discardMusicOrigin.value = parseInt(
    (_maps["discardMusicOrigin"] / _count) * 100
  );
  setEchaerOption();
});

const effectiveMusic = ref<number>();
const invalidMusicOrigin = ref<number>();
const discardMusicOrigin = ref<number>();
const noSoundSourceCount = ref<number>();

const { isDark } = useDark();
const theme: EchartOptions["theme"] = computed(() => {
  return isDark.value ? "dark" : "default";
});

const pieDataChartRef = ref<HTMLDivElement | null>(null);
const { setOptions } = useECharts(pieDataChartRef as Ref<HTMLDivElement>, {
  theme: theme
});

function setEchaerOption() {
  setOptions({
    tooltip: {
      trigger: "item"
    },
    color: ["#626aef", "#c12c1f", "#80a492", "#c7c6b6"],
    series: [
      {
        name: "Access From",
        type: "pie",
        radius: ["50%", "80%"],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: "center"
        },
        emphasis: {
          label: {
            show: false,
            fontSize: 40,
            fontWeight: "bold"
          }
        },
        labelLine: {
          show: false
        },
        data: musicMusicStatistics.value
      }
    ]
  });
}
</script>

<template>
  <div class="welcome">
    <div class="data">
      <div class="data-header">
        <div class="header">
          <div class="flex ml-4 mt-1 items-center">
            <IconifyIconOnline
              class="cursor-pointer text-[#626aef]"
              icon="solar:music-note-bold-duotone"
              width="3rem"
              height="3rem"
            />
            <span class="count-font">
              {{ musicCount }}
            </span>
            <span class="text-xl font-bold"> 音乐 </span>
          </div>
        </div>
        <div class="header">
          <div class="flex ml-4 mt-1 items-center">
            <IconifyIconOnline
              class="cursor-pointer text-[#626aef]"
              icon="mingcute:album-line"
              width="3rem"
              height="3rem"
            />
            <span class="count-font">
              {{ albumCount }}
            </span>
            <span class="text-xl font-bold"> 专辑 </span>
          </div>
        </div>
        <div class="header">
          <div class="flex ml-4 mt-1 items-center">
            <IconifyIconOnline
              class="cursor-pointer text-[#626aef]"
              icon="solar:user-rounded-bold-duotone"
              width="3rem"
              height="3rem"
            />
            <span class="count-font">
              {{ artistCount }}
            </span>
            <span class="text-xl font-bold"> 艺术家 </span>
          </div>
        </div>
      </div>
      <h1>最新音乐</h1>
      <div class="music-new">
        <el-scrollbar>
          <div class="music-list">
            <div
              class="music-item"
              v-for="(item, index) in musicList"
              :key="index"
            >
              <LoadImg :src="item.pic" height="10rem" width="10rem" />
              <span class="block truncate w-40">{{ item.musicName }}</span>
            </div>
          </div>
        </el-scrollbar>
      </div>
      <h1>最新专辑</h1>
      <div class="album-new">
        <el-scrollbar>
          <div class="album-list">
            <div
              class="album-item"
              v-for="(item, index) in albumList"
              :key="index"
            >
              <LoadImg :src="item.pic" height="10rem" width="10rem" />
              <span class="block truncate w-40">{{ item.albumName }}</span>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </div>
    <div class="task-sidebar">
      <div class="flex music-count">
        <div ref="pieDataChartRef" class="w-1/2" />
        <div class="w-1/2 flex flex-col justify-between">
          <h1>音乐统计</h1>
          <div>
            <span> 有效音乐 </span>
            <el-progress :percentage="effectiveMusic" color="#626aef" />
            <span> 无音源 </span>
            <el-progress :percentage="noSoundSourceCount" color="#c12c1f" />
            <span> 错误音源 </span>
            <el-progress :percentage="invalidMusicOrigin" color="#80a492" />
            <span> 废弃音源 </span>
            <el-progress :percentage="discardMusicOrigin" color="#c7c6b6" />
          </div>
        </div>
      </div>
      <div class="music-task">
        <el-scrollbar>
          <h1 class="ml-6">插件运行任务</h1>
          <ul v-for="(item, index) in pluginTask" :key="index">
            <li>
              <div class="flex justify-around items-center">
                <IconifyIconOnline
                  color="#727272"
                  icon="solar:user-circle-bold"
                  width="4rem"
                  height="4rem"
                />
                <div>
                  <div>{{ item.id }}</div>
                  <div>{{ item.updateTime }}</div>
                </div>
                <div class="flex items-center">
                  <IconifyIconOnline
                    class="text-[#626aef]"
                    icon="solar:cloud-upload-line-duotone"
                    width="2rem"
                    height="2rem"
                  />
                  <span>{{ item.status }}</span>
                </div>
              </div>
            </li>
          </ul>
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
* {
  //border: 1px solid red;
}

.welcome {
  display: flex;
  flex-wrap: nowrap;
  margin: 0 !important;
  width: 100%;
  height: 100%;
}

.data {
  width: 60vw;
}

.data-header {
  display: flex;
}

.header {
  @apply shadow-2xl shadow-indigo-500/50;
  width: 60vw;
  height: 7rem;
  margin: 1rem;
  background: var(--el-bg-color);
  border-radius: 1rem;
}

.task-sidebar {
  width: 40vw;
}

.music-count {
  //height: 30vh;
}

.music-task {
  height: 60vh;
}

.music-new {
  width: 60vw;
}

.album-new {
  width: 60vw;
}

.music-list {
  display: flex;
}

.music-item {
  margin: 1rem;
}

.album-item {
  margin: 1rem;
}

.album-list {
  display: flex;
}

.count-font {
  @apply text-3xl font-bold mr-2 ml-2;
  color: var(--el-text-color-primary);
}
</style>
