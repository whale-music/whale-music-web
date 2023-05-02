<script setup lang="ts">
import { ref, onBeforeMount, Ref, computed } from "vue";
import {
  getAlbumCount,
  getAlbumTop,
  getArtistCount,
  getArtistTop,
  getMusicCount,
  getMusicStatistics,
  getPluginTask,
  MusicStatisticsRes,
  PluginTaskRes
} from "@/api/hone";
import { Album, Artist } from "@/api/music";
import LoadImg from "@/components/LoadImg/LoadImg.vue";
import { EchartOptions, useDark, useECharts } from "@pureadmin/utils";
import { ElScrollbar } from "element-plus";
import dayjs from "dayjs";
import { dateFormater } from "@/utils/dateUtil";
import { FriendlyTime } from "@/utils/DateFormat.ts";
import Wbutton from "@/components/button/index.vue";

defineOptions({
  name: "Welcome"
});

const artistList = ref<Artist[]>();
const albumList = ref<Album[]>();

const musicCount = ref<number>();
const albumCount = ref<number>();
const artistCount = ref<number>();

const albumInnerRef = ref<HTMLDivElement>();
const artistInnerRef = ref<HTMLDivElement>();

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
  const artist = await getArtistTop();
  albumList.value = album.data;
  artistList.value = artist.data;

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

const statusIcon = status => {
  switch (status) {
    // stop
    case 0:
      return "stop";
    case 1:
      return "run";
    case 2:
      return "error";
  }
};

const statusColor = status => {
  switch (status) {
    // stop
    case 0:
      return "success";
    //  run
    case 1:
      return "primary";
    // error
    case 2:
      return "danger";
  }
};

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
      <div class="flex justify-between items-center">
        <h1>最新专辑</h1>
        <div class="font-bold">
          <el-tooltip
            class="box-item"
            effect="dark"
            content="按住shift建鼠标滚动以查看"
            placement="top"
          >
            <IconifyIconOnline
              class="cursor-pointer text-[#a4b0be]"
              icon="solar:info-circle-bold-duotone"
              width="2rem"
              height="2rem"
            />
          </el-tooltip>
        </div>
      </div>
      <div class="album-new">
        <el-scrollbar>
          <div class="album-list" ref="albumInnerRef">
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
      <div class="flex justify-between items-center">
        <h1>最新艺术家</h1>
        <div class="font-bold">
          <el-tooltip
            class="box-item"
            effect="dark"
            content="按住shift建鼠标滚动以查看"
            placement="top"
          >
            <IconifyIconOnline
              class="cursor-pointer text-[#a4b0be]"
              icon="solar:info-circle-bold-duotone"
              width="2rem"
              height="2rem"
            />
          </el-tooltip>
        </div>
      </div>
      <div class="artist-new">
        <el-scrollbar>
          <div class="artist-list" ref="artistInnerRef">
            <div
              class="artist-item"
              v-for="(item, index) in artistList"
              :key="index"
            >
              <el-avatar :size="150" :src="item.pic" />
              <span class="text-center font-bold text-xl block truncate w-40">{{
                item.artistName
              }}</span>
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
              <div class="flex justify-between items-center ml-6">
                <div class="flex justify-center items-center">
                  <IconifyIconOnline
                    color="#727272"
                    icon="solar:user-circle-bold"
                    width="4rem"
                    height="4rem"
                  />
                  <div>
                    <div>{{ item.id }}</div>
                    <b class="text-sm">
                      {{
                        FriendlyTime(
                          dateFormater("YYYY-MM-dd HH:mm:ss", item.updateTime),
                          dayjs()
                        )
                      }}
                    </b>
                  </div>
                </div>
                <div class="flex items-center mr-6">
                  <IconifyIconOnline
                    class="text-[#626aef]"
                    icon="solar:cloud-upload-line-duotone"
                    width="2rem"
                    height="2rem"
                  />
                  <span class="mr-4" />
                  <Wbutton :type="statusColor(item.status)">{{
                    statusIcon(item.status)
                  }}</Wbutton>
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

// 音乐数据显示
.task-sidebar {
  width: 40vw;
  margin-left: 1rem;
  margin-right: 1rem;
  background: var(--el-bg-color);
  //border: 1px solid var(--el-text-color-regular);
  border-radius: 1rem;
}

// 音乐数据饼图
.music-count {
  height: 30vh;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
}

// 插件运行历史记录
.music-task {
  height: 62vh;
  background: var(--el-bg-color);
  border-top: 1px solid #b0b0b0;
  border-bottom-left-radius: 1rem;
}

.artist-new {
  width: 60vw;
  background: var(--el-bg-color);
  //border: 1px solid var(--el-text-color-regular);
  border-radius: 1rem;
}

.album-new {
  width: 60vw;
  background: var(--el-bg-color);
  //border: 1px solid var(--el-text-color-regular);
  border-radius: 1rem;
}

.artist-list {
  display: flex;
}

.artist-item {
  margin: 1rem;
  will-change: filter;
  transition: filter 300ms;
}

.artist-item:hover {
  filter: drop-shadow(0 0 0.8em var(--el-color-primary));
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
