<script setup lang="ts">
import type { IconifyIcon } from "@iconify/types";
import AlbumLine from "@iconify-icons/mingcute/album-line";
import MusicNoteBoldDuotone from "@iconify-icons/solar/music-note-bold-duotone";
import UserRoundedBoldDuotone from "@iconify-icons/solar/user-rounded-bold-duotone";
import VideocameraBold from "@iconify-icons/solar/videocamera-bold";
import {
  EchartOptions,
  useDark,
  useECharts,
  UtilsEChartsOption
} from "@pureadmin/utils";
import dayjs from "dayjs";
import { ElScrollbar } from "element-plus";
import {
  Component,
  computed,
  DefineComponent,
  markRaw,
  onBeforeMount,
  reactive,
  Ref,
  ref
} from "vue";
import { useRouter } from "vue-router";

import {
  Count,
  getCount,
  getMusicStatistics,
  getPluginTask,
  MusicStatisticsRes,
  PluginTaskRes
} from "@/api/hone";
import { SaveOrUpdateAlbum, SelectAlbum } from "@/api/model/Album";
import { SaveOrUpdateArtist, SelectArtist } from "@/api/model/Artist";
import { LinkItem } from "@/api/model/common";
import { SaveOrUpdateMusic } from "@/api/model/Music";
import DrawerAlbum from "@/components/AddData/DrawerAlbum/index.vue";
import DrawerArtist from "@/components/AddData/DrawerArtist/index.vue";
import DrawerMusic from "@/components/AddData/DrawerMusic/index.vue";
import DrawerMv from "@/components/AddData/DrawerMv/index.vue";
import WButton from "@/components/button/index.vue";
import ReCol from "@/components/ReCol";
import { FriendlyTime } from "@/utils/DateFormat";
import { dateFormater } from "@/utils/dateUtil";
import HotData from "@/views/welcome/components/HotData/index.vue";
import LineCard from "@/views/welcome/components/LineCard/index.vue";

const router = useRouter();

defineOptions({
  name: "Welcome"
});

interface AlbumReq extends SaveOrUpdateAlbum {
  link: LinkItem[];
}

interface Static extends Count {
  icon: IconifyIcon;
  title: string;
  comp: Component | DefineComponent;
}

const state = reactive({
  loading: {
    skeletonLoadingFlag: false
  },
  statisticians: [
    {
      title: "音乐",
      icon: MusicNoteBoldDuotone,
      comp: markRaw(DrawerMusic)
    },
    {
      title: "专辑",
      icon: AlbumLine,
      comp: markRaw(DrawerAlbum)
    },
    {
      title: "艺术家",
      icon: UserRoundedBoldDuotone,
      comp: markRaw(DrawerArtist)
    },
    {
      title: "MV",
      icon: VideocameraBold,
      comp: markRaw(DrawerMv)
    }
  ] as PropType<Array<Static>>,
  show: {
    uploadMusicFlag: false,
    uploadAlbumFlag: false,
    uploadArtistFlag: false,
    sourceInfoFlag: false,
    musicPreviewPic: false,
    albumPreviewPic: false,
    artistPreviewPic: false
  },
  select: {
    musicSelectArtist: [] as SelectArtist[],
    musicSelectAlbum: {} as SelectAlbum,
    albumSelectArtist: [] as SelectArtist[]
  },
  form: {
    uploadMusicInfo: { artistIds: [], resource: {} } as SaveOrUpdateMusic,
    uploadAlbum: { artistIds: [], link: [] } as AlbumReq,
    uploadArtist: {} as SaveOrUpdateArtist
  },
  count: {
    music: {} as Count,
    album: {} as Count,
    artist: {} as Count
  },
  pie: {
    effectiveMusic: 0,
    invalidMusicOrigin: 0,
    discardMusicOrigin: 0,
    noSoundSourceCount: 0
  },
  musicStatic: {} as MusicStatisticsRes[],
  pluginTask: {} as PluginTaskRes[],
  autocomplete: {
    musicArtistInputValue: "",
    albumArtistInputValue: "",
    albumSearch: ""
  }
});

const pieDataChartRef = ref<HTMLDivElement>();

async function initHomeInfo() {
  state.loading.skeletonLoadingFlag = true;
  const countMap = await getCount();

  const data = countMap.data;
  state.statisticians[0] = {
    ...state.statisticians[0],
    ...data["music"]
  };

  state.statisticians[1] = {
    ...state.statisticians[1],
    ...data["album"]
  };
  state.statisticians[2] = {
    ...state.statisticians[2],
    ...data["artist"]
  };
  state.statisticians[3] = {
    ...state.statisticians[3],
    ...data["mv"]
  };

  const _musicMusicStatistics = await getMusicStatistics();
  state.musicStatic = _musicMusicStatistics.data;

  const _pluginTask = await getPluginTask();
  state.pluginTask = _pluginTask.data;

  let _count = 0;
  const _maps = [];
  for (const musicStatisticsRe of state.musicStatic) {
    _count += musicStatisticsRe.value;
    _maps[musicStatisticsRe.name] = musicStatisticsRe.value;
  }
  // 有效音乐
  state.pie.effectiveMusic = Math.ceil(
    (_maps["effectiveMusic"] / _count) * 100
  );
  // 无音源
  state.pie.noSoundSourceCount = Math.ceil(
    (_maps["noSoundSourceCount"] / _count) * 100
  );
  // 失效音源
  state.pie.invalidMusicOrigin = parseInt(
    (_maps["invalidMusicOrigin"] / _count) * 100
  );
  // 废弃音源
  state.pie.discardMusicOrigin = parseInt(
    (_maps["discardMusicOrigin"] / _count) * 100
  );
  setEchaerOption();

  state.loading.skeletonLoadingFlag = false;
}

onBeforeMount(async () => {
  await initHomeInfo();
});

const { isDark } = useDark();
const theme: EchartOptions["theme"] = computed(() => {
  return isDark.value ? "dark" : "default";
});

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
    color: ["#626aef", "#ff664a", "#80a492", "#c7c6b6"],
    series: [
      {
        name: "Access From",
        type: "pie",
        // radius: ["50%", "80%"],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: "center"
        },
        // roseType: "radius",
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
        data: state.musicStatic
      }
    ]
  } as UtilsEChartsOption);
}

type hotDataType =
  | "latest-upload"
  | "latest-music"
  | "latest-album"
  | "latest-artist"
  | "latest-mv"
  | "listening-history";
const value = ref<hotDataType>("latest-upload");

const options = [
  {
    value: "latest-upload",
    label: "上传音乐",
    enabled: true
  },
  {
    value: "latest-music",
    label: "最新音乐",
    enabled: true
  },
  {
    value: "latest-album",
    label: "最新专辑",
    enabled: false
  },
  {
    value: "latest-artist",
    label: "最新艺术家",
    enabled: false
  },
  {
    value: "latest-mv",
    label: "最新MV",
    enabled: false
  },
  {
    value: "listening-history",
    label: "听歌历史",
    enabled: false
  }
] as Array<{ value: hotDataType; label: string; enabled: boolean }>;

const distribution = ref("resource-distribution");
const musicDistributionOption = [
  {
    value: "resource-distribution",
    label: "音源分布",
    enabled: true
  },
  {
    value: "music-distribution",
    label: "音乐分布",
    enabled: false
  },
  {
    value: "album-distribution",
    label: "专辑分布",
    enabled: false
  },
  {
    value: "artist-distribution",
    label: "艺术家分布",
    enabled: false
  }
] as Array<{ value: string; label: string; enabled: boolean }>;

const toPluginTaskInfo = id => {
  router.push({
    path: "/plugin/taskInfo",
    query: { id: id }
  });
};
</script>

<template>
  <div class="welcome">
    <DrawerMusic v-model="state.show.uploadMusicFlag" @change="initHomeInfo" />

    <DrawerAlbum v-model="state.show.uploadAlbumFlag" @change="initHomeInfo" />

    <DrawerArtist
      v-model="state.show.uploadArtistFlag"
      @change="initHomeInfo"
    />

    <ElRow :gutter="24" justify="space-around">
      <ReCol
        v-for="(item, index) in state.statisticians"
        :key="index"
        class="mb-[18px] animate__slideInUp"
        :value="6"
        :md="12"
        :sm="12"
        :xs="24"
        :initial="{
          opacity: 0,
          y: 100
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            delay: 80 * (index + 1)
          }
        }"
      >
        <LineCard
          :title="item.title"
          :count="item.sumCount"
          :percentage-increase="item.percent"
          :fluctuate="item.fluctuate"
          :icon="item.icon"
          :comp="item.comp"
        />
      </ReCol>
    </ElRow>

    <ElRow :gutter="24" justify="space-around">
      <ReCol
        :value="16"
        :md="12"
        :sm="12"
        :xs="24"
        :initial="{
          opacity: 0,
          y: 100
        }"
      >
        <div class="flex items-center justify-between">
          <h1>音乐统计</h1>
          <el-select
            v-model="value"
            class="m-2"
            placeholder="Select"
            size="large"
            style="width: 240px"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              :disabled="!item.enabled"
            />
          </el-select>
        </div>
        <HotData v-model="value" />
      </ReCol>

      <ReCol
        class="mb-[18px]"
        :value="8"
        :md="12"
        :sm="12"
        :xs="24"
        :initial="{
          opacity: 0,
          y: 100
        }"
      >
        <div class="flex flex-col">
          <div>
            <div class="flex-bc">
              <h1>音乐统计</h1>
              <el-select
                v-model="distribution"
                class="m-2"
                placeholder="Select"
                size="large"
                style="width: 240px"
              >
                <el-option
                  v-for="item in musicDistributionOption"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                  :disabled="!item.enabled"
                />
              </el-select>
            </div>
            <div class="music-count line-card">
              <el-skeleton
                :loading="state.loading.skeletonLoadingFlag"
                animated
              >
                <template #template>
                  <div class="flex items-center justify-center w-full h-full">
                    <div class="flex justify-center w-1/2">
                      <el-skeleton-item
                        variant="circle"
                        style="width: 8rem; height: 8rem"
                      />
                    </div>
                    <div
                      class="flex flex-col justify-between w-1/2 gap-2 overflow-y-clip"
                    >
                      <div
                        v-for="item in 4"
                        :key="item"
                        class="flex flex-col gap-1"
                      >
                        <el-skeleton-item
                          variant="p"
                          style="width: 3rem; height: 0.8rem"
                        />
                        <el-skeleton-item
                          variant="p"
                          style="width: 7rem; height: 0.8rem"
                        />
                      </div>
                    </div>
                  </div>
                </template>
                <template #default>
                  <div class="flex w-full">
                    <div ref="pieDataChartRef" class="w-1/2" />
                    <div
                      class="flex flex-col h-full w-1/2 justify-center overflow-y-clip"
                    >
                      <div>
                        <span> 有效音乐 </span>
                        <el-progress
                          :percentage="state.pie.effectiveMusic"
                          color="#626aef"
                        />
                        <span> 无音源 </span>
                        <el-progress
                          :percentage="state.pie.noSoundSourceCount"
                          color="#c12c1f"
                        />
                        <span> 错误音源 </span>
                        <el-progress
                          :percentage="state.pie.invalidMusicOrigin"
                          color="#80a492"
                        />
                        <span> 废弃音源 </span>
                        <el-progress
                          :percentage="state.pie.discardMusicOrigin"
                          color="#c7c6b6"
                        />
                      </div>
                    </div>
                  </div>
                </template>
              </el-skeleton>
            </div>
          </div>

          <div>
            <h1>插件运行任务</h1>
            <div class="music-task line-card">
              <el-scrollbar>
                <el-skeleton
                  :loading="state.loading.skeletonLoadingFlag"
                  animated
                >
                  <template #template>
                    <div>
                      <el-skeleton-item
                        variant="h1"
                        style="
                          width: 10rem;
                          height: 2rem;
                          margin-top: 1rem;
                          margin-left: 1rem;
                        "
                      />
                      <div class="flex flex-col gap-2 mt-4">
                        <div v-for="item in 4" :key="item">
                          <div class="flex justify-around gap-1">
                            <el-skeleton-item
                              variant="circle"
                              style="width: 3rem; height: 3rem"
                            />
                            <div class="flex flex-col gap-1">
                              <el-skeleton-item
                                variant="h1"
                                style="width: 10rem; height: 2rem"
                              />
                              <el-skeleton-item
                                variant="text"
                                style="width: 3rem; height: 1rem"
                              />
                            </div>
                            <el-skeleton-item
                              variant="h1"
                              style="width: 3rem; height: 2rem"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                  <template #default>
                    <div>
                      <ul
                        v-for="(item, index) in state.pluginTask"
                        :key="index"
                      >
                        <li>
                          <div class="flex items-center justify-between ml-3">
                            <div
                              class="flex items-center justify-center cursor-pointer"
                              @click="toPluginTaskInfo(item.id)"
                            >
                              <IconifyIconOnline
                                color="#727272"
                                icon="solar:user-circle-bold"
                                width="4rem"
                                height="4rem"
                              />
                              <div>
                                <el-tooltip
                                  :content="item.pluginName"
                                  raw-content
                                >
                                  <p class="w-20 text-xl font-bold truncate">
                                    {{ item.pluginName }}
                                  </p>
                                </el-tooltip>
                                <p
                                  class="text-xs"
                                  style="color: var(--el-text-color-disabled)"
                                >
                                  {{ item.id }}
                                </p>
                              </div>
                            </div>
                            <b
                              class="text-sm"
                              style="color: var(--el-text-color-disabled)"
                            >
                              {{
                                FriendlyTime(
                                  dateFormater(
                                    "YYYY-MM-dd HH:mm:ss",
                                    item.updateTime
                                  ),
                                  dayjs()
                                )
                              }}
                            </b>
                            <div class="flex items-center mr-6">
                              <IconifyIconOnline
                                class="text-[#626aef]"
                                icon="solar:cloud-upload-line-duotone"
                                width="2rem"
                                height="2rem"
                              />
                              <span class="mr-4" />
                              <WButton :type="statusColor(item.status)"
                                >{{ statusIcon(item.status) }}
                              </WButton>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </template>
                </el-skeleton>
                <el-empty
                  v-show="
                    !state.loading.skeletonLoadingFlag &&
                    (state.pluginTask == null || state.pluginTask.length === 0)
                  "
                />
              </el-scrollbar>
            </div>
          </div>
        </div>
      </ReCol>
    </ElRow>
  </div>
</template>

<style lang="scss" scoped>
@use "@/style/linear-card";

.main-content {
  margin: 20px 20px 0 !important;
}

// 音乐数据饼图
.music-count {
  display: flex;
  height: 30vh;
  background: var(--el-bg-color);
  border-radius: 1rem;
}

// 插件运行历史记录
.music-task {
  background: var(--el-bg-color);
  border-radius: 1rem;
}

.artist-new {
  height: 14rem;
  background: var(--el-bg-color);
  border-radius: 1rem;
}

.album-new {
  height: 14rem;
  background: var(--el-bg-color);
  border-radius: 1rem;
}

.album-list {
  display: flex;
}

.artist-list {
  display: flex;
}

.artist-item {
  margin: 1rem;
  cursor: pointer;
  transition: filter 300ms;
  will-change: filter;
}

.artist-item:hover {
  filter: drop-shadow(0 0 0.8em var(--el-color-primary));
}

.album-item {
  margin: 1rem;
  cursor: pointer;
}

.album-item:hover {
  filter: drop-shadow(0 0 0.8em var(--el-color-primary));
  transition: filter 300ms;
  will-change: filter;
}

.count-font {
  @apply text-3xl font-bold mr-2 ml-2;

  color: var(--el-text-color-primary);
}
</style>
