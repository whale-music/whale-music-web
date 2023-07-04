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
import {
  AlbumConvert,
  ArtistConvert,
  MusicDetailInfo,
  updateMusic
} from "@/api/music";
import LoadImg from "@/components/LoadImg/LoadImg.vue";
import { EchartOptions, useDark, useECharts } from "@pureadmin/utils";
import { ElMessageBox, ElScrollbar } from "element-plus";
import dayjs from "dayjs";
import { dateFormater } from "@/utils/dateUtil";
import { FriendlyTime } from "@/utils/DateFormat.ts";
import Wbutton from "@/components/button/index.vue";
import { ReNormalCountTo } from "@/components/ReCountTo";
import { useRouter } from "vue-router";
import ContextMenu from "@imengyu/vue3-context-menu";
import ArrowDownBold from "@iconify-icons/ep/arrow-down-bold";
import { message } from "@/utils/message";
import { getSelectSingerList, saveOrUpdateArtist } from "@/api/singer";
import {
  getSelectAlbumList,
  SaveOrUpdateAlbum,
  saveOrUpdateAlbum
} from "@/api/album";
import { Artist } from "@/api/model/Artist";

const router = useRouter();

defineOptions({
  name: "Welcome"
});

interface LinkItem {
  value: string;
  link: number;
  display: string;
}

interface AlbumReq extends SaveOrUpdateAlbum {
  link: LinkItem[];
}
const state = reactive({
  show: {
    uploadMusicFlag: false,
    uploadAlbumFlag: false,
    uploadArtistFlag: false,
    sourceInfoFlag: false
  },
  form: {
    uploadMusicInfo: { musicArtist: [] } as MusicDetailInfo,
    uploadAlbum: { artistIds: [], link: [] } as AlbumReq,
    uploadArtist: {} as Artist,
    sourceInfo: {} as any
  },
  autocomplete: {
    musicArtistInputValue: "",
    albumArtistInputValue: "",
    albumSearch: ""
  }
});

const artistList = ref<ArtistConvert[]>([]);
const albumList = ref<AlbumConvert[]>([]);

const musicCount = ref<Count>();
const albumCount = ref<Count>();
const artistCount = ref<Count>();

const albumInnerRef = ref<HTMLDivElement>();
const artistInnerRef = ref<HTMLDivElement>();

const musicMusicStatistics = ref<MusicStatisticsRes[]>();

const pluginTask = ref<PluginTaskRes[]>();

const skeletonLoadingFlag = ref<boolean>(false);

async function initHomeInfo() {
  skeletonLoadingFlag.value = true;
  const countMap = await getCount();

  musicCount.value = countMap.data["music"];
  albumCount.value = countMap.data["album"];
  artistCount.value = countMap.data["artist"];
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

  skeletonLoadingFlag.value = false;
}

onBeforeMount(async () => {
  await initHomeInfo();
});

const effectiveMusic = ref<number>();
const invalidMusicOrigin = ref<number>();
const discardMusicOrigin = ref<number>();
const noSoundSourceCount = ref<number>();

const { isDark } = useDark();
const theme: EchartOptions["theme"] = computed(() => {
  return isDark.value ? "dark" : "default";
});

const pieDataChartRef = ref<HTMLDivElement>();
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

const { VITE_PROXY_HOST } = import.meta.env;
const proxyHost = VITE_PROXY_HOST == null ? "" : VITE_PROXY_HOST;
const uploadAction = ref(`${proxyHost}/admin/music/auto/upload`);

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

const getType = (
  type: boolean,
  zero: string,
  positive: string,
  negative: string
): string => {
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

const handleClose = (done: () => void) => {
  ElMessageBox.confirm("确认退出吗？")
    .then(() => {
      done();
    })
    .catch(() => {
      // catch error
    });
};

const updateMusicButton = async () => {
  try {
    const r = await updateMusic(state.form.uploadMusicInfo);
    if (r.code === "200") {
      message("上传成功", { type: "success" });
      state.autocomplete.albumSearch = "";
      state.form.uploadMusicInfo = {} as MusicDetailInfo;
    } else {
      message(`更新失败${r.message}`, { type: "error" });
    }
  } catch (e) {
    message(`请求失败${e}`, { type: "error" });
  }
};

// 删除歌手数据
const musicArtistHandleClose = index => {
  state.form.uploadMusicInfo.musicArtist.splice(index, 1);
};

// 获取歌手数据
const musicArtistQuerySearchAsync = async (
  queryString: string,
  cb: (arg: any) => void
) => {
  const selectAlbumR = await getSelectSingerList(queryString);
  if (selectAlbumR.code === "200" && selectAlbumR.data.length !== 0) {
    cb(selectAlbumR.data);
  } else {
    setTimeout(() => cb([]), 200);
  }
};

// 歌手添加到保存数据中
const musicArtistHandleSelect = (item: LinkItem) => {
  const items = {
    aliasName: "",
    artistName: item.value,
    birth: "",
    createTime: "",
    id: item.link,
    introduction: "",
    location: "",
    pic: "",
    sex: "",
    updateTime: ""
  };
  state.form.uploadMusicInfo.musicArtist.push(items);
  state.autocomplete.musicArtistInputValue = "";
};

// 删除歌手数据
const albumArtistHandleClose = index => {
  state.form.uploadAlbum.link.splice(index, 1);
  state.form.uploadAlbum.artistIds.splice(index, 1);
};

// 获取专辑歌手数据
const albumArtistQuerySearchAsync = async (
  queryString: string,
  cb: (arg: any) => void
) => {
  const selectAlbumR = await getSelectSingerList(queryString);
  if (selectAlbumR.code === "200" && selectAlbumR.data.length !== 0) {
    cb(selectAlbumR.data);
  } else {
    setTimeout(() => cb([]), 200);
  }
};

// 歌手添加到保存数据中
const albumArtistHandleSelect = (item: LinkItem) => {
  state.form.uploadAlbum.link.push(item);
  state.form.uploadAlbum.artistIds.push(item.link);
  state.autocomplete.albumArtistInputValue = "";
};

// 专辑搜索
const albumQuerySearchAsync = async (
  queryString: string,
  cb: (arg: any) => void
) => {
  const selectAlbumR = await getSelectAlbumList(queryString);
  if (selectAlbumR.code === "200" && selectAlbumR.data.length !== 0) {
    cb(selectAlbumR.data);
  } else {
    setTimeout(() => cb([]), 200);
  }
};

// 选择专辑
const albumHandleSelect = (item: LinkItem) => {
  state.form.uploadMusicInfo.albumName = item.value;
  state.form.uploadMusicInfo.albumId = item.link;
};

const editArtistInfo = async () => {
  const r = await saveOrUpdateArtist(state.form.uploadArtist);
  if (r.code == "200") {
    message("保存成功", { type: "success" });
    state.form.uploadArtist = {} as Artist;
    await initHomeInfo();
  } else {
    message(`保存失败: ${r.message}`, { type: "error" });
  }
};

const albumSaveOrUpdate = async () => {
  const r = await saveOrUpdateAlbum(state.form.uploadAlbum);
  if (r.code === "200") {
    message("更新成功", { type: "success" });
    state.form.uploadAlbum = {} as AlbumReq;
    state.autocomplete.albumArtistInputValue = "";
    await initHomeInfo();
  } else {
    message(`更新失败${r.message}`, { type: "error" });
  }
};

const toAlbum = id => {
  router.push({
    path: "/music/albumInfo",
    query: { id: id }
  });
};

const toArtist = id => {
  router.push({
    path: "/music/artistInfo",
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
    <!--添加音乐侧栏-->
    <el-drawer
      v-model="state.show.uploadMusicFlag"
      :with-header="false"
      :before-close="handleClose"
      :show-close="false"
      size="40%"
    >
      <h1>上传音乐信息</h1>
      <el-upload
        class="upload-demo"
        drag
        :action="uploadAction"
        multiple
        :limit="1"
      >
        <el-icon class="el-icon--upload">
          <IconifyIconOnline
            class="cursor-pointer"
            style="color: #636e72"
            icon="solar:cloud-upload-bold-duotone"
            width="2rem"
            height="2rem"
          />
        </el-icon>
        <div class="el-upload__text">
          托动音乐文件到此 或 <em>点击上传音乐</em>
        </div>
      </el-upload>

      <h1 class="mb-4">音乐信息</h1>
      <el-form
        label-position="right"
        label-width="auto"
        :model="state.form.uploadMusicInfo"
      >
        <el-form-item label="音乐名">
          <el-input
            placeholder="输入歌曲名"
            v-model="state.form.uploadMusicInfo.musicName"
          />
        </el-form-item>
        <el-form-item label="别名">
          <el-input
            placeholder="输入歌曲名别名"
            v-model="state.form.uploadMusicInfo.musicNameAlias"
          />
        </el-form-item>
        <el-form-item label="歌手(艺术家)">
          <el-tag
            v-for="(item, index) in state.form.uploadMusicInfo.musicArtist"
            :key="item.id"
            @close="musicArtistHandleClose(index)"
            effect="dark"
            closable
            round
          >
            {{ item.artistName }}</el-tag
          >
          <el-autocomplete
            style="width: 100%"
            v-model="state.autocomplete.musicArtistInputValue"
            :fetch-suggestions="musicArtistQuerySearchAsync"
            placeholder="输入歌手名"
            @select="musicArtistHandleSelect"
          />
        </el-form-item>
        <el-form-item label="专辑">
          <el-autocomplete
            class="w-full mt-1"
            v-model="state.autocomplete.albumSearch"
            :fetch-suggestions="albumQuerySearchAsync"
            placeholder="请输入专辑名"
            @select="albumHandleSelect"
          >
            <template #default="{ item }">
              <span v-html="item.display" />
            </template>
          </el-autocomplete>
        </el-form-item>
      </el-form>

      <div class="cursor-pointer flex justify-between items-center">
        <div
          class="flex-c"
          @click="state.show.sourceInfoFlag = !state.show.sourceInfoFlag"
        >
          <span>显示音乐源</span>
          <IconifyIconOffline :icon="ArrowDownBold" />
        </div>
        <el-button type="primary" @click="updateMusicButton">保存</el-button>
      </div>
      <el-collapse-transition>
        <div v-show="state.show.sourceInfoFlag">
          <el-form
            label-position="right"
            label-width="auto"
            :model="state.form.sourceInfo"
          >
            <el-form-item label="比特率">
              <el-input v-model="state.form.sourceInfo.rate" />
            </el-form-item>
            <el-form-item label="音乐路径">
              <el-input v-model="state.form.sourceInfo.path" />
            </el-form-item>
            <el-form-item label="md5">
              <el-input v-model="state.form.sourceInfo.md5" />
            </el-form-item>
            <el-form-item label="size">
              <el-input v-model="state.form.sourceInfo.size" />
            </el-form-item>
          </el-form>
        </div>
      </el-collapse-transition>
    </el-drawer>

    <!--添加专辑侧栏-->
    <el-drawer
      v-model="state.show.uploadAlbumFlag"
      :with-header="false"
      :before-close="handleClose"
      :show-close="false"
      size="40%"
    >
      <h1 class="mb-4">添加专辑侧栏</h1>
      <el-form
        label-position="right"
        label-width="auto"
        :model="state.form.uploadAlbum"
      >
        <el-form-item label="专辑名">
          <el-input v-model="state.form.uploadAlbum.albumName" />
        </el-form-item>
        <el-form-item label="专辑歌手(艺术家)">
          <el-tag
            v-for="(item, index) in state.form.uploadAlbum.link"
            :key="item"
            @close="albumArtistHandleClose(index)"
            effect="dark"
            closable
            round
            >{{ item.value }}</el-tag
          >
          <el-autocomplete
            class="w-full mt-1"
            v-model="state.autocomplete.albumArtistInputValue"
            :fetch-suggestions="albumArtistQuerySearchAsync"
            placeholder="请输入歌手名"
            @select="albumArtistHandleSelect"
          />
        </el-form-item>
        <el-form-item label="发布时间">
          <el-input v-model="state.form.uploadAlbum.publishTime" />
        </el-form-item>
        <el-form-item label="发行公司">
          <el-input v-model="state.form.uploadAlbum.company" />
        </el-form-item>
        <el-form-item label="专辑版本">
          <el-input v-model="state.form.uploadAlbum.subType" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            type="textarea"
            v-model="state.form.uploadAlbum.description"
          />
        </el-form-item>
        <el-form-item>
          <div class="flex flex-row-reverse w-full">
            <el-button type="primary" @click="albumSaveOrUpdate"
              >保存</el-button
            >
          </div>
        </el-form-item>
      </el-form>
    </el-drawer>

    <!--添加艺术家-->
    <el-drawer
      v-model="state.show.uploadArtistFlag"
      :with-header="false"
      :before-close="handleClose"
      :show-close="false"
      size="40%"
    >
      <h1 class="mb-4">添加艺术家</h1>
      <el-form
        label-position="right"
        label-width="auto"
        :model="state.form.uploadArtist"
      >
        <el-form-item label="歌手(艺术家)">
          <el-input v-model="state.form.uploadArtist.artistName" />
        </el-form-item>
        <el-form-item label="别名">
          <el-input v-model="state.form.uploadArtist.aliasName" />
        </el-form-item>
        <el-form-item label="性别">
          <el-input v-model="state.form.uploadArtist.sex" />
        </el-form-item>
        <el-form-item label="出生日期">
          <el-input v-model="state.form.uploadArtist.birth" />
        </el-form-item>
        <el-form-item label="居住地">
          <el-input v-model="state.form.uploadArtist.location" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            type="textarea"
            v-model="state.form.uploadArtist.introduction"
          />
        </el-form-item>
        <el-form-item>
          <div class="flex flex-row-reverse w-full">
            <el-button type="primary" @click="editArtistInfo">保存</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-drawer>
    <div class="data">
      <div class="data-header">
        <div class="header">
          <div class="flex ml-4 mt-1 items-center justify-between">
            <div class="flex items-center">
              <IconifyIconOnline
                class="cursor-pointer text-[#626aef]"
                icon="solar:music-note-bold-duotone"
                width="3rem"
                height="3rem"
              />
              <span class="text-xl ml-4 font-bold"> 音乐 </span>
            </div>
            <div
              class="flex flex-nowrap gap-4"
              @contextmenu="onMusicContextMenu($event)"
            >
              <IconifyIconOnline
                class="cursor-pointer mr-4"
                icon="mingcute:more-1-line"
                width="2rem"
                height="2rem"
              />
            </div>
          </div>
          <div class="ml-6 flex items-center justify-between whitespace-nowrap">
            <ReNormalCountTo
              prefix="# "
              :duration="1000"
              :color="'var(--el-text-color-primary)'"
              :fontSize="'2em'"
              :startVal="1"
              :endVal="musicCount?.sumCount"
            />
            <el-tag
              size="small"
              effect="dark"
              class="mr-4"
              v-show="musicCount?.percent != null"
              :type="getType(musicCount?.fluctuate, 'info', '', 'danger')"
              :hit="false"
              :disable-transitions="true"
              round
            >
              {{ getType(musicCount?.fluctuate, "", "+", "-") }}
              {{ musicCount?.percent }}
              {{ getType(musicCount?.fluctuate, "", "↑", "↓") }}
            </el-tag>
          </div>
        </div>
        <div class="header">
          <div class="flex ml-4 mt-1 items-center justify-between">
            <div class="flex items-center">
              <IconifyIconOnline
                class="cursor-pointer text-[#626aef]"
                icon="mingcute:album-line"
                width="3rem"
                height="3rem"
              />
              <span class="text-xl ml-4 font-bold"> 专辑 </span>
            </div>
            <div
              class="flex flex-nowrap gap-4"
              @contextmenu="onAlbumContextMenu($event)"
            >
              <IconifyIconOnline
                class="cursor-pointer mr-4"
                icon="mingcute:more-1-line"
                width="2rem"
                height="2rem"
              />
            </div>
          </div>
          <div class="ml-6 flex items-center justify-between whitespace-nowrap">
            <ReNormalCountTo
              prefix="# "
              :duration="1000"
              :color="'var(--el-text-color-primary)'"
              :fontSize="'2em'"
              :startVal="1"
              :endVal="albumCount?.sumCount"
            />
            <el-tag
              size="small"
              effect="dark"
              class="mr-4"
              v-show="musicCount?.percent != null"
              :type="getType(albumCount?.fluctuate, 'info', '', 'danger')"
              :hit="false"
              :disable-transitions="true"
              round
            >
              {{ getType(albumCount?.fluctuate, "", "+", "-") }}
              {{ albumCount?.percent }}
              {{ getType(albumCount?.fluctuate, "", "↑", "↓") }}
            </el-tag>
          </div>
        </div>
        <div class="header">
          <div class="ml-6 flex items-center justify-between">
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
              class="flex flex-nowrap gap-4"
              @contextmenu="onArtistContextMenu($event)"
            >
              <IconifyIconOnline
                class="cursor-pointer mr-4"
                icon="mingcute:more-1-line"
                width="2rem"
                height="2rem"
              />
            </div>
          </div>
          <div class="ml-6 flex items-center justify-between whitespace-nowrap">
            <ReNormalCountTo
              prefix="# "
              :duration="1000"
              :color="'var(--el-text-color-primary)'"
              :fontSize="'2em'"
              :startVal="1"
              :endVal="artistCount?.sumCount"
            />
            <el-tag
              size="small"
              effect="dark"
              class="mr-4"
              v-show="artistCount?.percent != null"
              :type="getType(artistCount?.fluctuate, 'info', '', 'danger')"
              :hit="false"
              :disable-transitions="true"
              round
            >
              {{ getType(artistCount?.fluctuate, "", "+", "-") }}
              {{ artistCount?.percent }}
              {{ getType(artistCount?.fluctuate, "", "↑", "↓") }}
            </el-tag>
          </div>
        </div>
      </div>
      <div class="flex justify-between items-center">
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
        <el-skeleton :loading="skeletonLoadingFlag" animated>
          <template #template>
            <div class="album-list overflow-hidden">
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
                  v-for="(item, index) in albumList"
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
                    class="block font-semibold truncate w-40"
                    >{{ item.albumName }}</span
                  >
                </div>
              </div>
            </el-scrollbar>
          </template>
        </el-skeleton>
      </div>
      <div class="flex justify-between items-center">
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
        <el-skeleton :loading="skeletonLoadingFlag" animated>
          <template #template>
            <div class="artist-list overflow-hidden">
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
                  v-for="(item, index) in artistList"
                  :key="index"
                >
                  <el-avatar
                    @click="toArtist(item.id)"
                    :size="150"
                    :src="item.picUrl"
                  />
                  <span
                    @click="toArtist(item.id)"
                    class="text-center font-bold text-xl block truncate w-40"
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
        <el-skeleton :loading="skeletonLoadingFlag" animated>
          <template #template>
            <div class="w-full h-full flex justify-center items-center">
              <div class="w-1/2 flex justify-center">
                <el-skeleton-item
                  variant="circle"
                  style="height: 8rem; width: 8rem"
                />
              </div>
              <div
                class="w-1/2 flex flex-col justify-between gap-2 overflow-y-clip"
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
            <div class="w-1/2 flex flex-col justify-between overflow-y-clip">
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
          </template>
        </el-skeleton>
      </div>
      <div class="music-task">
        <el-scrollbar>
          <el-skeleton :loading="skeletonLoadingFlag" animated>
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
                <div class="mt-4 flex flex-col gap-2">
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
                <ul v-for="(item, index) in pluginTask" :key="index">
                  <li>
                    <div class="flex justify-between items-center ml-3">
                      <div
                        class="flex justify-center items-center cursor-pointer"
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
                            <p class="text-xl font-bold w-20 truncate">
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
                        <Wbutton :type="statusColor(item.status)">{{
                          statusIcon(item.status)
                        }}</Wbutton>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </template>
          </el-skeleton>
          <el-empty
            v-show="
              !skeletonLoadingFlag &&
              (pluginTask == null || pluginTask.length === 0)
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
