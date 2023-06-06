<script setup lang="ts">
import { deleteMusic, getAllMusicList, MusicSearchRes } from "@/api/music";
import { MusicSearchReq, Page } from "@/api/common";
import DownloadIcon from "@/components/DownloadIcon/download.vue";
import { ref, reactive, onMounted, watch } from "vue";
import { message } from "@/utils/message";
import { dateFormater } from "@/utils/dateUtil";
import { CellStyle } from "element-plus/es";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import {
  storageSession,
  useDark,
  storageLocal,
  downloadByData,
  deviceDetection
} from "@pureadmin/utils";
import ContextMenu from "@imengyu/vue3-context-menu";
import AddMusicToPlayList from "@/components/addMusicToPlayList/addMusicToPlayList.vue";
import { getUserPlayList, musicLike, UserPlayListRes } from "@/api/playlist";
import { DataInfo, sessionKey } from "@/utils/auth";
import { ElLoading, ElTable } from "element-plus";
import RefreshIcon from "@/assets/svg/refresh.svg?component";
import { FriendlyTime } from "@/utils/DateFormat.ts";
import dayjs from "dayjs";
import axios from "axios";
import { emitter } from "@/utils/mitt";
import ShowLoading from "@/components/ShowLoading/ShowLoading.vue";
import NameSearch from "@/components/nameSearch/index.vue";
import LoadImg from "@/components/LoadImg/LoadImg.vue";
import ChecklistLine from "@iconify-icons/solar/checklist-line-duotone";
import LayoutGridFill from "@iconify-icons/mingcute/layout-grid-fill";
import HamburgerMenuLinear from "@iconify-icons/solar/hamburger-menu-linear";
import Segmented, { type OptionsType } from "@/components/ReSegmented";

const { t } = useI18n();
const { isDark } = useDark();
const router = useRouter();

// 生命周期挂载
onMounted(async () => {
  if (state.table.show.layout === "grid") {
    state.req.page.pageIndex = 1;
  }

  state.initLoading = true;
  // 查询表格
  await onSubmit();
  state.initLoading = false;

  const width =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;
  reDrawLayout(width);
});

function reDrawLayout(width: number) {
  const isMobile = deviceDetection();
  if (width < 720) {
    state.dialog.width = "90%";
  } else {
    state.dialog.width = "45%";
  }
  // 小于500时过滤进入菜单栏
  state.option = width < 500;
  if (isMobile) {
    // 移动端默认grid显示
    state.table.show.layout = "grid";
    if (width < 420) {
      state.table.titleWidth = 140;
    }
  } else {
    // 小于1200
    if (width > 0 && width <= 1200) {
      state.table.titleWidth = 200;
    }
    // 大于1024重新设置标题宽度
    if (width > 1024) {
      state.table.titleWidth = 350;
    }
  }

  // 如果移动设备的table默认不显示专辑歌手等信息
  if (width < 720) {
    if (state.table.show.layout === "grid") {
      modifyShow(true);
    } else {
      modifyShow(false);
    }
  } else {
    modifyShow(true);
  }
}

// 监听容器
emitter.on("resize", ({ detail }) => {
  const { width } = detail;
  reDrawLayout(width);
});

// 表格Ref
const multipleTableRef = ref<InstanceType<typeof ElTable>>();
const state = reactive<{
  req: MusicSearchReq;
  initLoading: boolean;
  menuFlag: boolean;
  option: boolean;
  // 排序
  sortData: {
    value: string;
    label: string;
  }[];
  search: {
    typeData: {
      value: string;
      label: string;
    }[];
    searchType: string;
  };
  table: {
    musicName: string;
    storeData: MusicSearchRes[];
    loading: boolean;
    filter: string;
    selectTableList: MusicSearchRes[];
    titleWidth: number;
    gridLoading: boolean;
    optionSwitch: Array<OptionsType>;
    optionSwitchValue: number;
    show: {
      artist: boolean;
      album: boolean;
      duration: boolean;
      uploadTime: boolean;
      isInvalid: boolean;
      download: boolean;
      layout: string;
      autoRoll: boolean;
    };
  };
  dialog: {
    width: string;
    playItemDialogVisible: boolean;
    deleteCompelMusicFlag: boolean;
  };
  userPlayItem: UserPlayListRes[];
  addMusicId: number | number[];
  userInfo: DataInfo;
  isForceDeleteFlag: boolean;
}>({
  req: undefined,
  initLoading: false,
  menuFlag: false,
  sortData: undefined,
  option: false,
  search: {
    typeData: undefined,
    searchType: "all"
  },
  table: {
    musicName: "",
    storeData: [],
    loading: false,
    gridLoading: false,
    filter: "",
    selectTableList: [],
    titleWidth: 450,
    optionSwitch: undefined,
    optionSwitchValue: 0,
    show: {
      uploadTime: true,
      duration: true,
      album: true,
      artist: true,
      isInvalid: false,
      download: true,
      layout: storageLocal().getItem("music-table-layout") ?? "radio",
      autoRoll: storageLocal().getItem("music-table-grid") ?? true
    }
  },
  dialog: {
    width: "45%",
    playItemDialogVisible: false,
    deleteCompelMusicFlag: false
  },
  userPlayItem: undefined,
  addMusicId: undefined,
  userInfo: storageSession().getItem<DataInfo>(sessionKey),
  isForceDeleteFlag: false
});

const page: Page =
  storageLocal().getItem<Page>("music-page") == null
    ? {
        pageIndex: 0,
        pageNum: 10,
        total: 0
      }
    : storageLocal().getItem("music-page");
state.req = {
  afterDate: "",
  albumName: "",
  artistName: "",
  beforeDate: "",
  isShowNoExist: false,
  musicIds: undefined,
  musicName: "",
  order: false,
  orderBy: "sort",
  page: page,
  refresh: false
};
// 排序
state.sortData = [
  {
    value: "sort",
    label: "正常排序"
  },
  {
    value: "createTime",
    label: "上传日期排序"
  },
  {
    value: "updateTime",
    label: "修改日期排序"
  },
  {
    value: "id",
    label: "歌曲ID排序"
  }
];

state.search.typeData = [
  {
    value: "all",
    label: "全部"
  },
  {
    value: "music",
    label: "音乐"
  },
  {
    value: "album",
    label: "专辑"
  },
  {
    value: "artist",
    label: "歌手"
  }
];

/** 只设置图标 */
state.table.optionSwitch = [
  {
    value: "radio",
    icon: HamburgerMenuLinear
  },
  {
    value: "multiple",
    icon: ChecklistLine
  },
  {
    value: "grid",
    icon: LayoutGridFill
  }
];

// 监听是否选择音乐
watch(
  () => state.table.selectTableList,
  newQuestion => {
    selectFlag.value = newQuestion.length > 0;
  }
);

watch(
  () => state.table.show.isInvalid,
  value => {
    storageSession().setItem("isInvalid", value);
    onSubmit(false);
  }
);

watch(
  () => state.req.page,
  value => {
    storageLocal().setItem<Page>("music-page", value);
  },
  { deep: true }
);

const getMusicList = async (param: MusicSearchReq, load?: boolean) => {
  state.table.loading = true;
  try {
    const r = await getAllMusicList(param);
    state.table.loading = false;
    if (r.code === "200") {
      if (load === true) {
        state.table.storeData.push(...r.data.records);
      } else {
        state.table.storeData = r.data.records;
      }
      state.req.page.total = r.data.total;
      state.req.page.pageNum = r.data.size;
      state.req.page.pageIndex = r.data.current;
    } else {
      message(r.message, { type: "error" });
    }
  } catch (e) {
    state.table.loading = false;
    message(`查询失败${e}`, { type: "error" });
  }
};

// 点击按钮查询
const onSubmit = async (refresh?: boolean, load?: boolean) => {
  state.req.refresh =
    refresh == null || typeof refresh != "boolean" ? false : refresh;
  state.req.isShowNoExist = state.table.show.isInvalid;

  state.req.musicName = "";
  state.req.albumName = "";
  state.req.artistName = "";
  switch (state.search.searchType) {
    case "music":
      state.req.musicName = state.table.musicName;
      break;
    case "album":
      state.req.albumName = state.table.musicName;
      break;
    case "artist":
      state.req.artistName = state.table.musicName;
      break;
    case "all":
    default:
      state.req.albumName = state.table.musicName;
      state.req.artistName = state.table.musicName;
      state.req.musicName = state.table.musicName;
      break;
  }
  await getMusicList(state.req, load);
};

const handleSizeChange = val => {
  state.req.page.pageNum = val;
  onSubmit();
};

const handleCurrentChange = val => {
  state.req.page.pageIndex = val;
  onSubmit();
};

// 表格颜色
const cellStyle = ({ row, columnIndex }): CellStyle<any> => {
  let styles = {};
  styles["border"] = "none";
  styles["overflow"] = "hidden";
  // 复选框样式
  if (columnIndex === 0) {
    styles = {
      color: "#bfbfbf",
      padding: "0",
      margin: "0",
      width: "0.6rem",
      "font-size": "0.6rem",
      "text-align": "center"
    };
  }
  // 设置序号样式 必须为单选
  if (columnIndex === 1 && state.table.show.layout === "radio") {
    styles = {
      color: "#bfbfbf",
      padding: "0",
      margin: "0",
      width: "0.6rem",
      "font-size": "0.6rem",
      "text-align": "center"
    };
  }
  // 设置无地址音乐颜色
  switch (row.isExist) {
    case false:
      styles["color"] = "#a2a2a2";
      styles["backgroundColor"] = isDark.value ? "#262626" : "#f4f6f7";
      break;
  }
  return styles;
};

// 设置表头样式
const tableHeaderCellStyle = ({ columnIndex }): CellStyle<any> => {
  const style = {};
  style["color"] = "white";
  style["font-weight"] = "bold";
  style["text-align"] = "left";
  style["border-bottom"] = "none";
  if (columnIndex === 0) {
    style["textAlign"] = "center";
  }
  if (isDark.value) {
    style["color"] = "white";
    return style;
  } else {
    style["color"] = "black";
    return style;
  }
};

const getUserPlayInfo = async (id: number | number[]) => {
  state.addMusicId = id;
  const r = await getUserPlayList(state.userInfo.id);
  state.dialog.playItemDialogVisible = true;
  state.userPlayItem = r.data;
};

// 右键菜单
const onContextMenu = (e: MouseEvent, id: number) => {
  //prevent the browser's default menu
  e.preventDefault();
  //show our menu
  ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,
    items: [
      {
        label: "添加音乐到歌单",
        onClick: () => {
          getUserPlayInfo(id);
        }
      }
    ]
  });
};

// 复选框
const rowClick = row => {
  // 多选时不进入详情页面
  if (state.table.show.layout === "multiple") {
    multipleTableRef.value.toggleRowSelection(row, null);
  }
};

const handleSelectionChange = val => {
  state.table.selectTableList = val;
};
const selectFlag = ref<boolean>(false);
const deleteMusicList = async (
  id: number[],
  compel: boolean
): Promise<boolean> => {
  const res = await deleteMusic(id, compel);
  if (res.code === "200") {
    message("删除成功", { type: "success" });
    return true;
  } else {
    message(`删除失败: ${res.message}`, { type: "error" });
    return false;
  }
};

const cancelButton = () => {
  multipleTableRef.value.clearSelection();
};

// 强制删除
const deleteCompelButton = async (flag: boolean) => {
  state.dialog.deleteCompelMusicFlag = false;
  try {
    const id = state.table.selectTableList.map(value => value.id);
    const b = await deleteMusicList(id, flag);
    if (b) {
      if (state.table.selectTableList.length === state.req.page.pageNum) {
        await onSubmit();
        return;
      }
      for (const valueElement of state.table.selectTableList) {
        state.table.storeData = state.table.storeData.filter(
          value => value.id !== valueElement.id
        );
      }
    }
  } catch (e) {
    message(`请求失败: ${e}`, { type: "error" });
  }
};

const downloads = async () => {
  const loading = ElLoading.service({
    lock: true,
    text: "下载中",
    background: "rgba(0, 0, 0, 0.7)"
  });
  for (const selectTableListElement of state.table.selectTableList) {
    const element = selectTableListElement.musicRawUrl;
    if (element != null && element != "") {
      const strings = element.split(".");
      const splice = strings[strings.length - 1].split("?");
      try {
        const { data } = await axios.get(element, {
          responseType: "blob"
        });
        downloadByData(
          data,
          `${selectTableListElement.musicName}.${splice[0]}`
        );
      } catch (e) {
        message(`下载错误${e}`, { type: "error" });
      }
    }
  }
  loading.close();
};

const like = async (id: number, status: boolean) => {
  const r = await musicLike(id, status);
  if (r.code === "200") {
    const index = state.table.storeData.findIndex(value => value.id === id);
    if (index !== -1) {
      message(`${status === true ? "添加成功" : "删除成功"}`, {
        type: "success"
      });
      state.table.storeData[index].isLike = status;
    } else {
      await onSubmit(false);
    }
  } else {
    message(`添加错误${r.message}`, { type: "error" });
  }
};

const modifyShow = (status: boolean) => {
  state.table.show.artist = status;
  state.table.show.album = status;
  state.table.show.duration = status;
  state.table.show.download = status;
};

const gridLoad = async () => {
  // 判断是否需要自动滚动
  if (
    state.table.show.autoRoll ||
    state.req.page.pageIndex * state.req.page.pageNum >= state.req.page.total
  )
    return;

  if (state.req.page.total > state.req.page.pageIndex) {
    state.req.page.pageIndex++;
  }
  state.table.gridLoading = true;
  await onSubmit(false, true);
  state.table.gridLoading = false;
};

const onChangeOptionSwitch = ({ option }) => {
  const { value } = option;
  state.table.show.layout = value;
  // 如果宫格则索引归零
  if (value === "grid") {
    state.req.page.pageIndex = 1;
    modifyShow(true);
  } else {
    state.req.page.pageIndex = 1;
    onSubmit(false);
  }
  storageLocal().setItem("music-table-layout", state.table.show.layout);
};

const autoRollChange = val => {
  storageLocal().setItem("music-table-grid", val);
  state.req.page.pageIndex = 0;
  onSubmit(false);
};

const toMusicInfo = id => {
  router.push({
    path: "/music/musicInfo",
    query: { id: id }
  });
};
</script>

<template>
  <div class="absolute-container">
    <!--添加歌曲到歌单-->
    <add-music-to-play-list
      v-if="state.dialog.playItemDialogVisible"
      :play-item="state.userPlayItem"
      :userId="Number.parseInt(state.userInfo.id)"
      :music-id="state.addMusicId"
      :width="state.dialog.width"
      @closeDialog="() => (state.dialog.playItemDialogVisible = false)"
    />
    <div class="operation-panel-bg" v-show="selectFlag">
      <div class="operation-panel">
        <el-dialog
          v-model="state.dialog.deleteCompelMusicFlag"
          :width="state.dialog.width"
          title="确认需要删除吗?"
        >
          <b>
            该删除会删除
            <b class="text-rose-800">歌曲</b>
            本身，如果有关联歌单会删除失败
          </b>
          <br />
          <i>
            如需要同时删除歌单请点击
            <b class="text-rose-800">强制删除</b>
          </i>
          <br />
          <el-tooltip
            effect="dark"
            content="<b>该操作只会删除<b class='text-rose-800'>歌曲</b>和<b class='text-rose-800'>歌单</b>关联的音乐，并不会删除歌手专辑</b>"
            raw-content
          >
            <el-checkbox
              v-model="state.isForceDeleteFlag"
              label="强制删除"
              size="large"
            />
          </el-tooltip>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="state.dialog.deleteCompelMusicFlag = false">
                否
              </el-button>
              <el-button
                type="danger"
                @click="deleteCompelButton(state.isForceDeleteFlag)"
              >
                是
              </el-button>
            </span>
          </template>
        </el-dialog>
        <div class="flex gap-1 p-2">
          <div class="flex items-center rounded">
            <span class="p-4">
              <span class="text-sm" style="color: var(--el-text-color-regular)">
                已选择
              </span>
              {{ state.table.selectTableList.length }}
            </span>
            <IconifyIconOnline
              @click="cancelButton"
              class="cursor-pointer"
              style="color: #636e72"
              icon="solar:close-circle-bold-duotone"
              width="2rem"
              height="2rem"
            />
          </div>
          <div class="flex items-center rounded">
            <IconifyIconOnline
              @click="state.dialog.deleteCompelMusicFlag = true"
              class="cursor-pointer"
              style="color: #d63031"
              icon="solar:trash-bin-minimalistic-2-bold-duotone"
              width="2rem"
              height="2rem"
            />
          </div>
          <div class="flex items-center rounded">
            <IconifyIconOnline
              @click="
                getUserPlayInfo(
                  state.table.selectTableList.map(value => value.id)
                )
              "
              class="cursor-pointer"
              style="color: var(--el-color-primary-light-3)"
              icon="solar:playlist-2-bold-duotone"
              width="2rem"
              height="2rem"
            />
          </div>
          <div class="flex items-center rounded">
            <IconifyIconOnline
              @click="downloads"
              class="cursor-pointer"
              style="color: var(--el-color-primary-light-3)"
              icon="solar:download-square-bold"
              width="2rem"
              height="2rem"
            />
          </div>
        </div>
      </div>
    </div>

    <div>
      <!--搜索框-->
      <name-search
        v-model="state.table.musicName"
        v-model:dropdownValue="state.search.searchType"
        :loading="state.table.loading"
        :dropdown="state.search.typeData"
        :buttonName="t('buttons.search')"
        @onSearch="
          () => {
            state.req.page.pageIndex = 0;
            onSubmit();
          }
        "
        @onClean="
          () => {
            state.table.musicName = '';
            state.req.page.pageIndex = 0;
            onSubmit();
          }
        "
      />
    </div>
    <div class="table-view">
      <div class="option mb-0.5">
        <div class="">
          <div @click="state.menuFlag = !state.menuFlag">
            <button class="menu-button focus:ring-4 var(--el-color-primary)">
              <span>{{ t("input.menuBotton") }}</span>
            </button>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <Segmented
            :options="state.table.optionSwitch"
            :defaultValue="
              state.table.optionSwitch.findIndex(
                value => value.value === state.table.show.layout
              )
            "
            @change="onChangeOptionSwitch"
          />
          <el-select
            v-if="!state.option"
            v-model="state.req.orderBy"
            placeholder="排序"
            size="large"
            style="width: 8rem"
            @change="onSubmit"
          >
            <el-option
              v-for="item in state.sortData"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              suffix-icon="download"
            />
          </el-select>
          <el-dropdown v-if="!state.option" trigger="click">
            <el-button class="rounded-md" size="large">过滤</el-button>
            <template #dropdown>
              <div class="pt-1 pb-1" style="border-radius: 1rem">
                <div class="dropdown-item">
                  <el-checkbox
                    v-model="state.table.show.isInvalid"
                    size="large"
                    label="显示无音源"
                  />
                </div>
                <div class="dropdown-item">
                  <el-checkbox v-model="state.table.show.artist" label="歌手" />
                </div>
                <div class="dropdown-item">
                  <el-checkbox v-model="state.table.show.album" label="专辑" />
                </div>
                <div class="dropdown-item">
                  <el-checkbox
                    :disabled="state.table.show.layout === 'grid'"
                    v-model="state.table.show.duration"
                    label="歌曲时长"
                  />
                </div>
                <div class="dropdown-item">
                  <el-checkbox
                    :disabled="state.table.show.layout === 'grid'"
                    v-model="state.table.show.uploadTime"
                    label="上传时间"
                  />
                </div>
              </div>
            </template>
          </el-dropdown>
        </div>
      </div>
      <!--隐藏菜单-->
      <div>
        <el-collapse-transition>
          <div v-show="state.menuFlag">
            <div class="flex flex-row-reverse p-4 gap-2">
              <div>
                <el-switch
                  v-model="state.table.show.autoRoll"
                  active-text="手动滚动"
                  inactive-text="自动滚动"
                  @change="autoRollChange"
                />
              </div>
              <el-select
                v-if="state.option"
                v-model="state.req.orderBy"
                placeholder="排序"
                size="large"
                style="width: 8rem"
                @change="onSubmit"
              >
                <el-option
                  v-for="item in state.sortData"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                  suffix-icon="download"
                />
              </el-select>
              <el-dropdown v-if="state.option" trigger="click">
                <el-button class="rounded-md" size="large">过滤</el-button>
                <template #dropdown>
                  <div class="pt-1 pb-1" style="border-radius: 1rem">
                    <div class="dropdown-item">
                      <el-checkbox
                        v-model="state.table.show.isInvalid"
                        size="large"
                        label="显示无音源"
                      />
                    </div>
                    <div class="dropdown-item">
                      <el-checkbox
                        v-model="state.table.show.artist"
                        label="歌手"
                      />
                    </div>
                    <div class="dropdown-item">
                      <el-checkbox
                        v-model="state.table.show.album"
                        label="专辑"
                      />
                    </div>
                    <div class="dropdown-item">
                      <el-checkbox
                        v-model="state.table.show.duration"
                        label="歌曲时长"
                      />
                    </div>
                    <div class="dropdown-item">
                      <el-checkbox
                        v-model="state.table.show.uploadTime"
                        label="上传时间"
                      />
                    </div>
                  </div>
                </template>
              </el-dropdown>
              <div class="flex flex-nowrap items-center gap-1">
                <el-tooltip
                  class="box-item"
                  content="刷新缓存，这需要一段时间"
                  placement="top-start"
                >
                  <el-button
                    @click="onSubmit(true)"
                    type="primary"
                    :icon="RefreshIcon"
                    round
                    >刷新
                  </el-button>
                </el-tooltip>
              </div>
            </div>
          </div>
        </el-collapse-transition>
      </div>
      <!--加载遮罩-->
      <transition name="el-fade-in">
        <ShowLoading :loading="state.initLoading" />
      </transition>
      <el-empty
        v-if="
          (state.table.storeData == null ||
            state.table.storeData.length === 0) &&
          !state.table.loading
        "
        description="这里没有音乐, 你可以首页添加音乐"
      />
      <div>
        <div v-if="state.table.show.layout === 'grid'">
          <ul
            class="table-grid"
            v-infinite-scroll="gridLoad"
            infinite-scroll-delay="1000"
            infinite-scroll-distance="-10"
          >
            <li v-for="item in state.table.storeData" :key="item.id">
              <LoadImg
                @click="toMusicInfo(item.id)"
                :src="item.pic"
                height="10rem"
                width="10rem"
                class="cursor-pointer"
                :class="{ grayscale: !item.isExist }"
              />
              <!--音乐名-->
              <span
                class="block w-40 truncate font-bold hover:underline cursor-pointer"
                @click="toMusicInfo(item.id)"
              >
                {{ item.musicName }}
              </span>
              <!--专辑名-->
              <div
                v-if="state.table.show.album"
                class="flex flex-nowrap items-center gap-1"
              >
                <IconifyIconOnline
                  class="cursor-pointer"
                  style="color: var(--el-text-color-primary)"
                  icon="mingcute:album-line"
                  width="1rem"
                  height="1rem"
                />
                <span
                  style="color: var(--el-text-color-placeholder)"
                  class="w-40 font-medium truncate hover:underline cursor-pointer"
                >
                  <router-link
                    :to="{
                      name: 'AlbumInfo',
                      query: { id: item.albumId }
                    }"
                  >
                    {{ item.albumName }}
                  </router-link>
                </span>
              </div>
              <!--歌手-->
              <div
                v-if="state.table.show.artist"
                class="flex flex-nowrap gap-1"
              >
                <IconifyIconOnline
                  class="cursor-pointer"
                  style="color: var(--el-text-color-primary)"
                  icon="mingcute:mic-fill"
                  width="1rem"
                  height="1rem"
                />
                <div class="w-40 truncate text-xs flex flex-nowrap gap-1">
                  <span
                    v-for="(artist, index) in item.artistNames"
                    :key="index"
                    style="color: var(--el-text-color-disabled)"
                    class="hover:underline cursor-pointer"
                  >
                    <router-link
                      :to="{
                        name: 'ArtistInfo',
                        query: { id: item.artistIds[index] }
                      }"
                    >
                      {{ artist }}</router-link
                    >
                  </span>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <el-table
          v-else
          class="rounded-2xl"
          v-loading="state.table.loading"
          ref="multipleTableRef"
          :data="state.table.storeData"
          @selection-change="handleSelectionChange"
          :cell-style="cellStyle"
          :header-cell-style="tableHeaderCellStyle"
          v-show="
            !state.initLoading &&
            state.table.storeData != null &&
            state.table.storeData.length !== 0
          "
          :key="state.table.show.layout"
          @row-click="rowClick"
        >
          <el-table-column
            type="selection"
            width="55"
            v-if="state.table.show.layout === 'multiple'"
          />
          <el-table-column type="index" width="50" />

          <el-table-column width="50" :show-overflow-tooltip="true">
            <template #default="scope">
              <IconifyIconOnline
                @click="like(scope.row.id, !scope.row.isLike)"
                class="cursor-pointer"
                :style="{ color: scope.row.isLike === true ? 'red' : 'grey' }"
                icon="solar:heart-bold"
                width="1.3rem"
                height="1.3rem"
              />
            </template>
          </el-table-column>

          <el-table-column
            width="50"
            :show-overflow-tooltip="true"
            v-if="state.table.show.download"
          >
            <template #default="scope">
              <DownloadIcon :muiscId="scope.row.id" />
            </template>
          </el-table-column>

          <el-table-column
            label="名称"
            :show-overflow-tooltip="true"
            :width="state.table.titleWidth"
          >
            <template #default="scope">
              <div
                class="flex flex-nowrap gap-4"
                @contextmenu="onContextMenu($event, scope.row.id)"
              >
                <el-link
                  :underline="false"
                  class="font-sans"
                  @click="toMusicInfo(scope.row.id)"
                  >{{ scope.row.musicName }}
                </el-link>
                <span class="font select-none">
                  {{ scope.row.musicNameAlias }}
                </span>
              </div>
            </template>
          </el-table-column>

          <el-table-column
            v-if="state.table.show.artist"
            label="歌手"
            :show-overflow-tooltip="true"
          >
            <template #default="scope">
              <el-link
                class="mr-1"
                :underline="false"
                disable-transitions
                v-for="(item, index) in scope.row.artistNames"
                :key="index"
              >
                <router-link
                  :to="{
                    name: 'ArtistInfo',
                    query: { id: scope.row.artistIds[index] }
                  }"
                >
                  <span>{{ item }}</span>
                </router-link>
              </el-link>
            </template>
          </el-table-column>
          <el-table-column
            v-if="state.table.show.album"
            prop="albumName"
            label="专辑"
            :show-overflow-tooltip="true"
          >
            <template #default="scope">
              <router-link
                :to="{
                  name: 'AlbumInfo',
                  query: { id: scope.row.albumId }
                }"
              >
                <el-link :underline="false">{{ scope.row.albumName }}</el-link>
              </router-link>
            </template>
          </el-table-column>
          <el-table-column
            v-if="state.table.show.duration"
            prop="timeLength"
            label="歌曲时长"
            :show-overflow-tooltip="true"
          >
            <template #default="scope">
              <span class="font-light">{{
                dateFormater("mm:ss", scope.row.timeLength)
              }}</span>
            </template>
          </el-table-column>
          <el-table-column
            v-if="state.table.show.uploadTime"
            prop="createTime"
            label="上传时间"
            :show-overflow-tooltip="true"
          >
            <template #default="scope">
              <span>{{
                FriendlyTime(
                  dateFormater("YYYY-MM-dd HH:mm:ss", scope.row.createTime),
                  dayjs()
                )
              }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div
        class="demo-pagination-block"
        v-if="state.table.show.layout !== 'grid' || state.table.show.autoRoll"
      >
        <el-scrollbar>
          <div class="flex" v-show="!state.initLoading">
            <el-pagination
              background
              :hide-on-single-page="state.req.page.total === 0"
              :default-current-page="state.req.page.pageIndex"
              :default-page-size="state.req.page.pageNum"
              :current-page="state.req.page.pageIndex"
              :page-size="state.req.page.pageNum"
              :page-sizes="[10, 50, 100, 500, 1000]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="state.req.page.total"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-scrollbar>
      </div>
      <div
        v-else-if="
          !state.table.gridLoading &&
          state.table.show.layout === 'grid' &&
          state.req.page.pageIndex * state.req.page.pageNum <=
            state.req.page.total
        "
      >
        <div class="pt-4 w-full h-15 flex items-center justify-center gap-2">
          <IconifyIconOnline
            class="animate-spin"
            style="color: var(--el-text-color-placeholder)"
            icon="mingcute:loading-3-fill"
            width="1rem"
            height="1rem"
          />
          <span style="color: var(--el-text-color-placeholder)">加载中</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import url("@/style/pagination.scss");

.refresh {
  border-radius: 3px;
  animation: animate__slideInUp; /* referring directly to the animation's @keyframe declaration */
  animation-duration: 2s; /* don't forget to set a duration! */
}

.operation-panel-bg {
  display: flex;
  justify-content: center;
}

.operation-panel {
  position: absolute;
  display: flex;
  z-index: 200;
  bottom: 0;
  justify-content: center;
  align-items: center;
  height: 3.2rem;
  background: var(--el-bg-color);
  border-radius: 1rem;
  border: 1px solid rgba(142, 142, 142, 0.2);
  margin-bottom: 20px;
}

:deep(.el-dialog) {
  border-radius: 1rem;
}

.absolute-container {
  display: flex;
  flex-direction: column;
  /*主轴上的对齐方式为居中*/
  justify-content: center;
  margin-left: 10px;
  margin-right: 10px;
}

.table-grid {
  display: grid;
  /*  声明列的宽度  */
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  /*  声明行间距和列间距  */
  grid-gap: 25px;

  @media screen and (max-width: 720px) {
    grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
  }
}

:deep(.hover-row) {
  transform: scale(1.01);
  transition: all 0.3s ease 0s;
}
/*表格鼠标悬停的样式（背景颜色）*/
:deep(.el-table tbody tr:hover > td) {
  background-color: var(--el-border-color);
}

.font {
  color: #a3a39cc3;
}

// 底部分页条
.demo-pagination-block {
  margin-top: 0.6rem;
  display: flex;
  justify-content: center;
}

//折叠菜单
.folding.menu {
  height: 0;
}

.option {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: nowrap;
  align-items: center;
}

.search-button {
  height: 2.4rem;
  margin-right: 1rem;
  border-radius: 1rem;
  transition: width 1s ease;
}

.menu-button {
  display: inline-block;
  background-color: var(--el-color-primary);
  border-radius: 0.8rem;
  color: #ffffff;
  text-align: center;
  font-size: 17px;
  height: 2.5rem;
  width: 6rem;
  transition: all 0.5s;
  cursor: pointer;
  margin: 5px;
}

.menu-button span {
  cursor: pointer;
  display: inline-block;
  position: relative;
  transition: 0.5s;
}

.menu-button span:after {
  content: "↓";
  position: absolute;
  opacity: 0;
  top: 0;
  right: -15px;
  transition: 0.5s;
}

.menu-button:hover span {
  padding-right: 15px;
}

.menu-button:hover span:after {
  opacity: 1;
  right: 0;
}

.slide-fade-enter-active {
  transition: all 0.5s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.5s ease-in;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

.show-loading {
  width: 100%;
  height: 20rem;
  padding: 2rem;
  border-radius: 2rem;
  background-color: var(--el-bg-color);

  display: flex;
  justify-content: center;
  align-items: center;
}

// 选择框样式，没有生效
:deep(.el-popper.is-pure) {
  border-radius: 1rem !important;
}

// 表格样式
:deep(.el-table__row td) {
  border: 1px solid transparent;
}

:deep(.el-radio-group) {
  flex-wrap: nowrap;
}

.tableDataShow {
  border-radius: 1rem;
}

.dropdown-item {
  @apply pl-1 pr-1 flex flex-nowrap items-center;
}

.dropdown-item:hover {
  background: var(--el-fill-color);
}

.dropdown-item-font {
  @apply pl-1 font-bold whitespace-nowrap;
}
</style>
