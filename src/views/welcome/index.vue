<script setup lang="ts">
import { ref, onBeforeMount, Ref, computed, reactive } from "vue";
import {
  Count,
  getAlbumTop,
  getArtistTop,
  getCount,
  getMusicStatistics,
  getPluginTask,
  MusicStatisticsRes,
  PluginTaskRes
} from "@/api/hone";
import LoadImg from "@/components/LoadImg/LoadImg.vue";
import {
  EchartOptions,
  useDark,
  useECharts,
  UtilsEChartsOption
} from "@pureadmin/utils";
import { ElScrollbar } from "element-plus";
import dayjs from "dayjs";
import { dateFormater } from "@/utils/dateUtil";
import { FriendlyTime } from "@/utils/DateFormat";
import WButton from "@/components/button/index.vue";
import { ReNormalCountTo } from "@/components/ReCountTo";
import { useRouter } from "vue-router";
import ContextMenu from "@imengyu/vue3-context-menu";
import {
  ArtistConvert,
  SaveOrUpdateArtist,
  SelectArtist
} from "@/api/model/Artist";
import { LinkItem } from "@/api/model/common";
import {
  AlbumConvert,
  SaveOrUpdateAlbum,
  SelectAlbum
} from "@/api/model/Album";
import { SaveOrUpdateMusic } from "@/api/model/Music";
import DrawerMusic from "@/components/AddData/DrawerMusic/index.vue";
import DrawerAlbum from "@/components/AddData/DrawerAlbum/index.vue";
import DrawerArtist from "@/components/AddData/DrawerArtist/index.vue";

const router = useRouter();

defineOptions({
  name: "Welcome"
});

interface AlbumReq extends SaveOrUpdateAlbum {
  link: LinkItem[];
}
const state = reactive({
  loading: {
    skeletonLoadingFlag: false
  },
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
  list: {
    artist: {} as ArtistConvert[],
    album: {} as AlbumConvert[]
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

const albumInnerRef = ref<HTMLDivElement>();
const artistInnerRef = ref<HTMLDivElement>();

const pieDataChartRef = ref<HTMLDivElement>();

async function initHomeInfo() {
  state.loading.skeletonLoadingFlag = true;
  const countMap = await getCount();

  state.count.music = countMap.data["music"];
  state.count.album = countMap.data["album"];
  state.count.artist = countMap.data["artist"];
  const album = await getAlbumTop();
  const artist = await getArtistTop();
  state.list.album = album.data;
  state.list.artist = artist.data;

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

const albumRefScrollbar = ref(null);
const albumHandleScroll = e => {
  const wheelDelta = e.wheelDelta || -e.deltaY * 40;
  const scrollbar = albumRefScrollbar.value;
  // scrollbar.wrap$获取到包裹容器的element对象
  scrollbar.setScrollLeft(scrollbar.wrapRef.scrollLeft - wheelDelta);
};

const artistRefScrollbar = ref(null);
const artistHandleScroll = e => {
  const wheelDelta = e.wheelDelta || -e.deltaY * 40;
  const scrollbar = artistRefScrollbar.value;
  // scrollbar.wrap$获取到包裹容器的element对象
  scrollbar.setScrollLeft(scrollbar.wrapRef.scrollLeft - wheelDelta);
};

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
        data: state.musicStatic
      }
    ]
  } as UtilsEChartsOption);
}

type enumType = "success" | "info" | "warning" | "danger" | "";
const getType = (
  type: boolean,
  zero: enumType,
  positive: enumType,
  negative: enumType
): enumType => {
  if (type === undefined || type == null) return zero;
  return type ? positive : negative;
};

type enumUpOrDown = "↑" | "↓" | "+" | "-" | "";
const getUpOrDownType = (
  type: boolean,
  zero: enumUpOrDown,
  positive: enumUpOrDown,
  negative: enumUpOrDown
): enumUpOrDown => {
  if (type === undefined || type == null) return zero;
  return type ? positive : negative;
};

// 音乐右键菜单
const onMusicContextMenu = (e: MouseEvent) => {
  //prevent the browser's default menu
  e.preventDefault();
  //show our menu
  ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,
    items: [
      {
        label: "添加音乐",
        onClick: () => {
          state.show.uploadMusicFlag = true;
        }
      }
    ]
  });
};

// 专辑右键菜单
const onAlbumContextMenu = (e: MouseEvent) => {
  //prevent the browser's default menu
  e.preventDefault();
  //show our menu
  ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,
    items: [
      {
        label: "添加专辑",
        onClick: () => {
          state.show.uploadAlbumFlag = true;
        }
      }
    ]
  });
};

// 歌手右键菜单
const onArtistContextMenu = (e: MouseEvent) => {
  //prevent the browser's default menu
  e.preventDefault();
  //show our menu
  ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,
    items: [
      {
        label: "添加歌手(艺术家)",
        onClick: () => {
          state.show.uploadArtistFlag = true;
        }
      }
    ]
  });
};

const toAlbum = id => {
  router.push({
    name: "AlbumInfo",
    query: { id: id }
  });
};

const toArtist = id => {
  router.push({
    name: "ArtistInfo",
    query: { id: id }
  });
};

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

    <div class="data">
      <div class="data-header">
        <div class="header">
          <div class="flex items-center justify-between mt-1 ml-4">
            <div class="flex items-center">
              <IconifyIconOnline
                class="cursor-pointer text-[#626aef]"
                icon="solar:music-note-bold-duotone"
                width="3rem"
                height="3rem"
              />
              <span class="ml-4 text-xl font-bold"> 音乐 </span>
            </div>
            <div
              class="flex gap-4 flex-nowrap"
              @contextmenu="onMusicContextMenu($event)"
            >
              <IconifyIconOnline
                class="mr-4 cursor-pointer"
                icon="mingcute:more-1-line"
                width="2rem"
                height="2rem"
              />
            </div>
          </div>
          <div class="flex items-center justify-between ml-6 whitespace-nowrap">
            <ReNormalCountTo
              prefix="# "
              :duration="1000"
              :color="'var(--el-text-color-primary)'"
              :fontSize="'2em'"
              :startVal="1"
              :endVal="state.count.music?.sumCount"
            />
            <el-tag
              size="small"
              effect="dark"
              class="mr-4"
              v-show="state.count.music?.percent != null"
              :type="
                getType(state.count.music?.fluctuate, 'info', '', 'danger')
              "
              :hit="false"
              :disable-transitions="true"
              round
            >
              {{ getUpOrDownType(state.count.music?.fluctuate, "", "+", "-") }}
              {{ state.count.music?.percent }}
              {{ getUpOrDownType(state.count.music?.fluctuate, "", "↑", "↓") }}
            </el-tag>
          </div>
        </div>
        <div class="header">
          <div class="flex items-center justify-between mt-1 ml-4">
            <div class="flex items-center">
              <IconifyIconOnline
                class="cursor-pointer text-[#626aef]"
                icon="mingcute:album-line"
                width="3rem"
                height="3rem"
              />
              <span class="ml-4 text-xl font-bold"> 专辑 </span>
            </div>
            <div
              class="flex gap-4 flex-nowrap"
              @contextmenu="onAlbumContextMenu($event)"
            >
              <IconifyIconOnline
                class="mr-4 cursor-pointer"
                icon="mingcute:more-1-line"
                width="2rem"
                height="2rem"
              />
            </div>
          </div>
          <div class="flex items-center justify-between ml-6 whitespace-nowrap">
            <ReNormalCountTo
              prefix="# "
              :duration="1000"
              :color="'var(--el-text-color-primary)'"
              :fontSize="'2em'"
              :startVal="1"
              :endVal="state.count.album?.sumCount"
            />
            <el-tag
              size="small"
              effect="dark"
              class="mr-4"
              v-show="state.count.music?.percent != null"
              :type="
                getType(state.count.album?.fluctuate, 'info', '', 'danger')
              "
              :hit="false"
              :disable-transitions="true"
              round
            >
              {{ getUpOrDownType(state.count.album?.fluctuate, "", "+", "-") }}
              {{ state.count.album?.percent }}
              {{ getUpOrDownType(state.count.album?.fluctuate, "", "↑", "↓") }}
            </el-tag>
          </div>
        </div>
        <div class="header">
          <div class="flex items-center justify-between ml-6">
            <div class="flex items-center">
              <IconifyIconOnline
                class="cursor-pointer text-[#626aef]"
                icon="solar:user-rounded-bold-duotone"
                width="3rem"
                height="3rem"
              />
              <span class="text-xl font-bold"> 艺术家 </span>
            </div>
            <div
              class="flex gap-4 flex-nowrap"
              @contextmenu="onArtistContextMenu($event)"
            >
              <IconifyIconOnline
                class="mr-4 cursor-pointer"
                icon="mingcute:more-1-line"
                width="2rem"
                height="2rem"
              />
            </div>
          </div>
          <div class="flex items-center justify-between ml-6 whitespace-nowrap">
            <ReNormalCountTo
              prefix="# "
              :duration="1000"
              :color="'var(--el-text-color-primary)'"
              :fontSize="'2em'"
              :startVal="1"
              :endVal="state.count.artist?.sumCount"
            />
            <el-tag
              size="small"
              effect="dark"
              class="mr-4"
              v-show="state.count.artist?.percent != null"
              :type="
                getType(state.count.artist?.fluctuate, 'info', '', 'danger')
              "
              :hit="false"
              :disable-transitions="true"
              round
            >
              {{ getUpOrDownType(state.count.artist?.fluctuate, "", "+", "-") }}
              {{ state.count.artist?.percent }}
              {{ getUpOrDownType(state.count.artist?.fluctuate, "", "↑", "↓") }}
            </el-tag>
          </div>
        </div>
      </div>
      <div class="flex items-center justify-between">
        <h1 class="ml-4">最新专辑</h1>
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
        <el-skeleton :loading="state.loading.skeletonLoadingFlag" animated>
          <template #template>
            <div class="overflow-hidden album-list">
              <div v-for="item in 5" :key="item" style="margin: 1rem">
                <el-skeleton-item
                  variant="image"
                  style="width: 10rem; height: 10rem; border-radius: 1rem"
                />
                <el-skeleton-item
                  variant="h1"
                  style="
                    margin-top: 0.8rem;
                    margin-left: 0.3rem;
                    width: 8rem;
                    height: 1rem;
                  "
                />
              </div>
            </div>
          </template>
          <template #default>
            <el-scrollbar
              ref="albumRefScrollbar"
              @wheel.prevent="albumHandleScroll"
            >
              <div class="album-list" ref="albumInnerRef">
                <div
                  class="album-item"
                  v-for="(item, index) in state.list.album"
                  :key="index"
                >
                  <LoadImg
                    @click="toAlbum(item.id)"
                    :src="item.picUrl"
                    height="10rem"
                    width="10rem"
                  />
                  <span
                    @click="toAlbum(item.id)"
                    class="block w-40 font-semibold truncate"
                    >{{ item.albumName }}</span
                  >
                </div>
              </div>
            </el-scrollbar>
          </template>
        </el-skeleton>
      </div>
      <div class="flex items-center justify-between">
        <h1 class="ml-4">最新艺术家</h1>
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
        <el-skeleton :loading="state.loading.skeletonLoadingFlag" animated>
          <template #template>
            <div class="overflow-hidden artist-list">
              <div v-for="item in 5" :key="item" style="margin: 1rem">
                <el-skeleton-item
                  variant="circle"
                  style="width: 10rem; height: 10rem"
                />
                <div class="flex justify-center">
                  <el-skeleton-item
                    variant="h1"
                    style="margin-top: 0.4rem; width: 8rem; height: 1rem"
                  />
                </div>
              </div>
            </div>
          </template>
          <template #default>
            <el-scrollbar
              ref="artistRefScrollbar"
              @wheel.prevent="artistHandleScroll"
            >
              <div class="artist-list" ref="artistInnerRef">
                <div
                  class="artist-item"
                  v-for="(item, index) in state.list.artist"
                  :key="index"
                >
                  <el-avatar
                    @click="toArtist(item.id)"
                    :size="150"
                    :src="item.picUrl"
                  />
                  <span
                    @click="toArtist(item.id)"
                    class="block w-40 text-xl font-bold text-center truncate"
                    >{{ item.artistName }}</span
                  >
                </div>
              </div>
            </el-scrollbar>
          </template>
        </el-skeleton>
      </div>
    </div>
    <div class="task-sidebar">
      <div class="flex music-count">
        <el-skeleton :loading="state.loading.skeletonLoadingFlag" animated>
          <template #template>
            <div class="flex items-center justify-center w-full h-full">
              <div class="flex justify-center w-1/2">
                <el-skeleton-item
                  variant="circle"
                  style="height: 8rem; width: 8rem"
                />
              </div>
              <div
                class="flex flex-col justify-between w-1/2 gap-2 overflow-y-clip"
              >
                <div class="flex flex-col gap-1" v-for="item in 4" :key="item">
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
            <div ref="pieDataChartRef" class="w-1/2" />
            <div class="flex flex-col justify-between w-1/2 overflow-y-clip">
              <h1>音乐统计</h1>
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
          </template>
        </el-skeleton>
      </div>
      <div class="music-task">
        <el-scrollbar>
          <el-skeleton :loading="state.loading.skeletonLoadingFlag" animated>
            <template #template>
              <div>
                <el-skeleton-item
                  variant="h1"
                  style="
                    margin-top: 1rem;
                    margin-left: 1rem;
                    height: 2rem;
                    width: 10rem;
                  "
                />
                <div class="flex flex-col gap-2 mt-4">
                  <div v-for="item in 4" :key="item">
                    <div class="flex justify-around gap-1">
                      <el-skeleton-item
                        variant="circle"
                        style="height: 3rem; width: 3rem"
                      />
                      <div class="flex flex-col gap-1">
                        <el-skeleton-item
                          variant="h1"
                          style="height: 2rem; width: 10rem"
                        />
                        <el-skeleton-item
                          variant="text"
                          style="height: 1rem; width: 3rem"
                        />
                      </div>
                      <el-skeleton-item
                        variant="h1"
                        style="height: 2rem; width: 3rem"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <template #default>
              <div>
                <h1 class="ml-6">插件运行任务</h1>
                <ul v-for="(item, index) in state.pluginTask" :key="index">
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
                          <el-tooltip :content="item.pluginName" raw-content>
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
                        <WButton :type="statusColor(item.status)">{{
                          statusIcon(item.status)
                        }}</WButton>
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
</template>

<style lang="scss" scoped>
* {
  //border: 1px solid red;
}

.welcome {
  display: flex;
  flex-wrap: wrap;
  margin: 0 !important;
  width: 100%;
  height: 100%;
}

.data {
  width: 70%;
  display: flex;
  flex-direction: column;

  @media screen and (max-width: 1440px) {
    width: 100%;
  }
}

.data-header {
  display: grid;
  /*  声明列的宽度  */
  grid-template-columns: repeat(auto-fill, minmax(30%, 1fr));
  /*  声明行间距和列间距  */
  grid-gap: 25px;

  @media screen and (max-width: 720px) {
    grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
  }
}

.header {
  @apply shadow-2xl shadow-indigo-500/50;
  height: 7rem;
  margin: 1rem;
  background: var(--el-bg-color);
  border-radius: 1rem;
}

// 音乐数据显示
.task-sidebar {
  width: 28%;
  margin-left: auto;
  margin-right: auto;
  background: var(--el-bg-color);
  border-radius: 1rem;

  @media screen and (max-width: 1440px) {
    width: 100%;
    margin: 1rem;
  }
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
  width: 100%;
  height: 14rem;
  background: var(--el-bg-color);
  //border: 1px solid var(--el-text-color-regular);
  border-radius: 1rem;
}

.album-new {
  width: 100%;
  //width: fit-content;
  height: 14rem;
  background: var(--el-bg-color);
  //border: 1px solid var(--el-text-color-regular);
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
  will-change: filter;
  transition: filter 300ms;
  cursor: pointer;
}

.artist-item:hover {
  filter: drop-shadow(0 0 0.8em var(--el-color-primary));
}

.album-item {
  cursor: pointer;
  margin: 1rem;
}

.album-item:hover {
  will-change: filter;
  transition: filter 300ms;
  filter: drop-shadow(0 0 0.8em var(--el-color-primary));
}

.count-font {
  @apply text-3xl font-bold mr-2 ml-2;
  color: var(--el-text-color-primary);
}
</style>
