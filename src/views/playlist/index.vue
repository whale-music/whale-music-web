<script lang="ts" setup>
import ListCheckFill from "@iconify-icons/mingcute/list-check-fill";
import MenuFill from "@iconify-icons/mingcute/menu-fill";
import { clone, storageLocal, storageSession, useDark } from "@pureadmin/utils";
import { ElTable } from "element-plus";
import { CellStyle } from "element-plus/es";
import { nextTick, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router"; //1.先在需要跳转的页面引入useRouter
import { MusicSearchReq } from "@/api/model/common";
import {
  createPlayList,
  deletePlayList,
  getPlayListById,
  getPlayListInfo,
  PlayInfoRes,
  PlayListRes,
  tracksMusicToPlayList
} from "@/api/playlist";
import DownloadIcon from "@/components/DownloadIcon/download.vue";
import LoadImg from "@/components/LoadImg/LoadImg.vue";
import Segmented, { type OptionsType } from "@/components/ReSegmented";
import { useNav } from "@/layout/hooks/useNav";
import { initRouter } from "@/router/utils";
import { usePlaySongListStoreHook } from "@/store/modules/playSongList";
import { dateFormater } from "@/utils/dateUtil";
import { message } from "@/utils/message";
import DialogEditPlayList from "@/views/components/PlayList/Dialog/DialogEditPlayList/index.vue";
import DialogAbout from "@/views/components/PlayList/Dialog/DialogAbout/index.vue";

const { onPlayMusic } = useNav();
const route = useRoute();
const router = useRouter();
const { isDark } = useDark();

const state = reactive<{
  search: {
    name: string;
    req: MusicSearchReq;
    res: PlayListRes;
  };
  table: {
    optionSwitch: Array<OptionsType>;
    optionSwitchValue: number;
  };
}>({
  search: {
    name: "",
    req: undefined,
    res: undefined
  },
  table: {
    optionSwitch: undefined,
    optionSwitchValue: storageLocal().getItem<number>("layoutSwitch")
  }
});

/** 只设置图标 */
state.table.optionSwitch = [
  {
    value: 0,
    icon: MenuFill
  },
  {
    value: 1,
    icon: ListCheckFill
  }
];

state.search.req = {
  afterDate: "",
  albumName: "",
  beforeDate: "",
  musicIds: [],
  musicName: "",
  order: false,
  orderBy: "",
  artistName: "",
  refresh: false,
  isShowNoExist: false,
  page: {
    pageIndex: 0,
    pageNum: 14,
    total: 0
  }
};

const tableData = ref<PlayListRes[]>();
const emptyFlag = ref<boolean>(false);
const multipleSelection = ref<PlayListRes[]>([]);
// 表格Ref
const multipleTableRef = ref<InstanceType<typeof ElTable>>();
const handleSelectionChange = (val: PlayListRes[]) => {
  multipleSelection.value = val;
  console.log(multipleSelection.value, "multiple");
};

const layoutSwitchKey = "layoutSwitch";
const layoutFlag = ref(storageSession().getItem(layoutSwitchKey));
watch(layoutFlag, value => {
  console.log(value, "value");
  storageSession().setItem(layoutSwitchKey, value);
  multipleTableRef.value?.clearSelection();
});
// 表格颜色
const cellStyle = ({ columnIndex }): CellStyle<any> => {
  if (columnIndex === 0) {
    return {
      color: "#bfbfbf",
      padding: "0",
      margin: "0",
      width: "0.6rem",
      "font-size": "0.6rem",
      "text-align": "center"
    };
  }
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

const getPlay = (id: string) => {
  state.search.req.musicName = state.search.name;
  state.search.req.artistName = state.search.name;
  state.search.req.albumName = state.search.name;

  getPlayListById(id, state.search.req)
    .then(res => {
      if (res.code === "200") {
        tableData.value = res.data.records;
        emptyFlag.value =
          res.data.records == null || res.data.records.length === 0;
        state.search.req.page.pageIndex = res.data.current;
        state.search.req.page.pageNum = res.data.size;
        state.search.req.page.total = res.data.total;
      } else {
        tableData.value = null;
        emptyFlag.value = true;
        message(res.message, { type: "error" });
      }
    })
    .catch(res => {
      message(res, { type: "error" });
    });
};

// 点击按钮查询
const onSubmit = () => {
  getPlay(route.name.toString());
};

const playlistInfo = ref<PlayInfoRes>({
  description: undefined,
  picId: 0,
  createTime: "",
  id: 0,
  picUrl: "",
  playListName: "",
  sort: 0,
  subscribed: false,
  type: 0,
  collectTag: [],
  updateTime: "",
  userId: 0
});

const modifyPlayListInfo = ref<PlayInfoRes>();

const playListInfoFlag = ref(true);
// 生命周期挂载
onMounted(async () => {
  await init();
});
async function init() {
  playListInfoFlag.value = true;
  try {
    // 查询歌单信息
    const playInfoResR = await getPlayListInfo(route.name.toString());
    playlistInfo.value = playInfoResR.data;
    modifyPlayListInfo.value = clone(playlistInfo.value);
  } catch (e) {
    message(`请求出错${e}`, { type: "error" });
  }
  // 查询表格
  onSubmit();
  playListInfoFlag.value = false;
}

const playListInput = ref("");

const createPlayListButton = () => {
  if (playListInput.value !== "") {
    createPlayList(playListInput.value)
      .then(res => {
        addPlayListDialogVisible.value = false;
        if (res.code === "200") {
          message("创建成功", { type: "success" });
          initRouter().then(() => {
            nextTick().then(() => {
              router.push(`/playlist/${res.data.id}`);
            });
          });
        } else {
          message(`创建失败${res.message}`, { type: "error" });
        }
      })
      .catch(res => {
        message(`创建失败${res}`, { type: "error" });
      });
  } else {
    message("请输入歌单名", { type: "error" });
  }
};

const deletePlayListButton = () => {
  deleteDialogVisible.value = false;
  deletePlayList([route.name.toString()]).then(res => {
    if (res.code === "200") {
      message("删除成功", { type: "success" });

      router.push({ path: "/playlist" });
      initRouter();
    } else {
      message("删除失败", { type: "error" });
    }
  });
};

const editPlayInfoFlag = ref<boolean>(false);

const aboutFlag = ref<boolean>(false);

const handleSizeChange = val => {
  state.search.req.page.pageNum = val;
  onSubmit();
};

const handleCurrentChange = val => {
  state.search.req.page.pageIndex = val;
  onSubmit();
};

const deletePlayListMusicMethod = async () => {
  const map = multipleSelection.value.map(value => value.id);
  const r = await tracksMusicToPlayList(
    playlistInfo.value.id.toString(),
    map,
    false
  );
  if (r.code === "200") {
    message("删除成功", { type: "success" });
    onSubmit();
  } else {
    message(`删除失败${r.message}`, { type: "error" });
  }
};

const addPlaySongList = async () => {
  const ids = multipleSelection.value.map(value => value.id);
  await usePlaySongListStoreHook().setPlaySongListByMusicIds(ids);
  message("成功添加音乐到歌单", { type: "success" });
};

const onChangeOptionSwitch = ({ option }) => {
  const { value } = option;
  state.table.optionSwitchValue = value;
  multipleSelection.value = [];
  storageLocal().setItem<number>("layoutSwitch", state.table.optionSwitchValue);
};

const toMusicInfo = id => {
  router.push({
    name: "MusicInfo",
    query: { id: id }
  });
};

const toAlbum = id => {
  router.push({
    name: "AlbumInfo",
    query: { id: id }
  });
};

const toMusicPlay = async () => {
  try {
    await usePlaySongListStoreHook().playSongList(
      multipleSelection.value.map(value => value.id)
    );
  } catch (e) {
    message(e, { type: "error" });
    return;
  }
  onPlayMusic();
};

const playListMusic = async () => {
  try {
    await usePlaySongListStoreHook().playSongList(
      tableData.value.map(value => value.id)
    );
  } catch (e) {
    message(e, { type: "error" });
    return;
  }
  onPlayMusic();
};

const centerDialogVisible = ref(false);

const addPlayListDialogVisible = ref(false);

const deleteDialogVisible = ref(false);

// 骨架屏延时加载时间
const throttle = ref(0);
</script>
<template>
  <div>
    <DialogEditPlayList
      v-model="editPlayInfoFlag"
      v-model:play-list-info="playlistInfo"
      @init="init"
    />
    <DialogAbout v-model="aboutFlag" :play-list-info="playlistInfo" />
    <!--歌单操作面板-->
    <div
      v-show="multipleSelection.length > 0 && !emptyFlag"
      class="operation-panel-bg"
    >
      <div class="operation-panel">
        <div class="flex items-center rounded">
          <span class="p-4">
            <span class="text-sm" style="color: var(--el-text-color-regular)">
              已选择
            </span>
            {{ multipleSelection.length }}
          </span>
          <IconifyIconOnline
            class="cursor-pointer"
            style="color: #636e72"
            icon="solar:close-circle-bold-duotone"
            width="2rem"
            height="2rem"
            @click="multipleTableRef.clearSelection()"
          />
        </div>
        <div class="flex items-center rounded">
          <IconifyIconOnline
            class="cursor-pointer"
            style="color: #636e72"
            icon="solar:play-circle-bold-duotone"
            width="2rem"
            height="2rem"
            @click="toMusicPlay"
          />
        </div>
        <div class="flex items-center rounded">
          <IconifyIconOnline
            class="cursor-pointer"
            style="color: #636e72"
            icon="solar:turntable-music-note-bold-duotone"
            width="2rem"
            height="2rem"
            @click="addPlaySongList"
          />
        </div>
        <div class="flex items-center rounded">
          <IconifyIconOnline
            class="cursor-pointer"
            style="color: #d63031"
            icon="solar:trash-bin-minimalistic-2-bold-duotone"
            width="2rem"
            height="2rem"
            @click="deletePlayListMusicMethod"
          />
        </div>
      </div>
    </div>
    <div>
      <div class="layout-container">
        <el-skeleton
          animated
          :loading="playListInfoFlag"
          class="w-[30rem]"
          :throttle="throttle"
        >
          <template #template>
            <div class="flex flex-wrap gap-4">
              <el-skeleton-item
                variant="image"
                style="width: 20rem; height: 20rem; border-radius: 1rem"
              />
              <div class="w-[60%] gap-1 flex flex-col">
                <div>
                  <el-skeleton-item
                    variant="h1"
                    style="width: 30rem; height: 4rem; border-radius: 5px"
                  />
                  <br />
                  <el-skeleton-item variant="h1" />
                </div>
                <div class="flex gap-4">
                  <el-skeleton-item
                    variant="button"
                    style="width: 8rem; height: 3rem; border-radius: 1rem"
                  />
                  <el-skeleton-item
                    variant="button"
                    style="width: 8rem; height: 3rem; border-radius: 1rem"
                  />
                  <el-skeleton-item
                    variant="button"
                    style="width: 8rem; height: 3rem; border-radius: 1rem"
                  />
                  <el-skeleton-item
                    variant="button"
                    style="width: 8rem; height: 3rem; border-radius: 1rem"
                  />
                </div>
                <br />
                <el-skeleton-item variant="h1" class="h-[3rem] w-[5rem]" />
              </div>
            </div>
          </template>
          <template #default>
            <LoadImg :src="playlistInfo.picUrl" />
            <div class="playlist-title">
              <div class="title-name">
                <p class="playlist-name">{{ playlistInfo.playListName }}</p>
                <el-button
                  class="mr-8 mt-2"
                  type="primary"
                  @click="addPlayListDialogVisible = true"
                  >新建歌单
                </el-button>
                <el-dialog
                  v-model="addPlayListDialogVisible"
                  width="30%"
                  align-center
                >
                  <h1 class="text-center">新建歌单</h1>
                  <el-input
                    v-model="playListInput"
                    placeholder="输入新建歌单名"
                  />
                  <template #footer>
                    <span class="flex justify-center">
                      <el-button type="primary" @click="createPlayListButton">
                        添加
                      </el-button>
                    </span>
                  </template>
                </el-dialog>
              </div>
              <div class="mt-2 mb-2">
                <span class="mr-4">{{ playlistInfo.nickname }}</span>
                <span class="text-sm text-[var(--el-color-info-light-3)]"
                  >{{
                    dateFormater(
                      "YYYY-MM-dd HH:mm:ss",
                      playlistInfo.createTime
                    )
                  }}创建</span
                >
              </div>
              <div class="operate-button">
                <el-button
                  class="button"
                  type="primary"
                  round
                  @click="playListMusic"
                >
                  播放歌单
                </el-button>
                <el-button
                  class="button"
                  round
                  @click="editPlayInfoFlag = true"
                >
                  编辑歌单
                </el-button>
                <el-button class="button" round @click="aboutFlag = true">
                  关于歌单
                </el-button>
                <el-button
                  class="button"
                  type="danger"
                  round
                  @click="deleteDialogVisible = true"
                  >删除歌单
                </el-button>
                <el-dialog
                  v-model="deleteDialogVisible"
                  title="确定删除歌单吗? "
                  width="30%"
                  center
                >
                  <template #footer>
                    <span class="dialog-footer">
                      <el-button @click="deleteDialogVisible = false"
                        >取消</el-button
                      >
                      <el-button type="danger" @click="deletePlayListButton">
                        删除
                      </el-button>
                    </span>
                  </template>
                </el-dialog>
              </div>
              <div>
                <div class="flex">
                  <p class="content">
                    <span class="mr-1">简介:</span>
                    <span class="text-desc font-bold"
                      >{{ playlistInfo.description }}
                    </span>
                  </p>
                  <el-link
                    v-if="
                      playlistInfo.description !== '' &&
                      playlistInfo.description !== null
                    "
                    class="tail"
                    :underline="false"
                    @click="centerDialogVisible = !centerDialogVisible"
                    >[详情]
                  </el-link>
                  <el-link
                    v-else
                    :underline="false"
                    type="primary"
                    @click="editPlayInfoFlag = true"
                    >添加简介
                  </el-link>
                </div>

                <!--显示专辑详细信息-->
                <el-dialog
                  v-model="centerDialogVisible"
                  class="showDialog"
                  width="30%"
                  :show-close="false"
                >
                  <template #header>
                    <h2>{{ playlistInfo.playListName }}</h2>
                    <span class="font-bold text-sm text-neutral-400">{{
                      playlistInfo.nickname
                    }}</span>
                    <span class="text-sm text-neutral-400">&#32;·&#32;</span>
                    <span class="text-sm text-neutral-400">
                      {{ dateFormater("YYYY", playlistInfo.createTime) }}
                    </span>
                  </template>
                  <el-scrollbar height="20rem">
                    <span>{{ playlistInfo.description }}</span>
                  </el-scrollbar>
                </el-dialog>
              </div>
            </div>
          </template>
        </el-skeleton>
      </div>
      <div class="mt-12">
        <div class="desc flex-nowrap">
          <p class="playlist-item-name leading-8 min-w-8 truncate">歌曲列表</p>
          <div class="flex-c gap-1">
            <el-input
              v-model="state.search.name"
              placeholder="搜索音乐"
              :clearable="true"
              @clear="onSubmit"
              @keydown.enter="onSubmit"
            />
            <Segmented
              v-model="state.table.optionSwitchValue"
              :options="state.table.optionSwitch"
              @change="onChangeOptionSwitch"
            />
          </div>
        </div>
      </div>
      <div v-show="!emptyFlag" class="mt-6">
        <el-skeleton
          v-if="state.table.optionSwitchValue === 1"
          animated
          :loading="playListInfoFlag"
          :throttle="throttle"
        >
          <template #template>
            <div class="flex flex-col items-center gap-4">
              <el-skeleton-item
                v-for="item in state.search.req.page.pageNum"
                :key="item"
                variant="h1"
                style="width: 80%; height: 2rem; border-radius: 0.6rem"
              />
            </div>
          </template>
          <template #default>
            <el-table
              ref="multipleTableRef"
              class="table-data"
              :data="tableData"
              highlight-current-row
              :cell-style="cellStyle"
              :header-cell-style="tableHeaderCellStyle"
              @selection-change="handleSelectionChange"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column fixed type="index" width="60" />
              <el-table-column fixed width="40" :show-overflow-tooltip="true">
                <template #default="scope">
                  <DownloadIcon :muiscId="scope.row.id" />
                </template>
              </el-table-column>

              <el-table-column
                fixed
                label="名称"
                :show-overflow-tooltip="true"
                width="450"
              >
                <template #default="scope">
                  <span class="font-sans subpixel-antialiased">
                    {{ scope.row.musicName }}
                  </span>
                  <span class="font">&emsp;{{ scope.row.aliasName }}</span>
                </template>
              </el-table-column>

              <el-table-column label="歌手" :show-overflow-tooltip="true">
                <template #default="scope">
                  <el-tag
                    v-for="item in scope.row.artists"
                    :key="item.id"
                    disable-transitions
                  >
                    {{ item.artistName }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="专辑" :show-overflow-tooltip="true">
                <template #default="scope">
                  <el-tag v-if="scope.row.album?.albumName">
                    {{ scope.row.album?.albumName }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                label="歌曲时长"
                width="80"
                :show-overflow-tooltip="true"
              >
                <template #default="scope">
                  <span class="font-light">
                    {{ dateFormater("mm:ss", scope.row.timeLength) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column
                prop="createTime"
                label="上传时间"
                :show-overflow-tooltip="true"
              >
                <template #default="scope">
                  <span>
                    {{
                      dateFormater("YYYY-MM-dd HH:mm:ss", scope.row.createTime)
                    }}
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-skeleton>
        <el-skeleton
          v-else
          :loading="playListInfoFlag"
          animated
          :throttle="throttle"
        >
          <template #template>
            <div class="list-grid">
              <div v-for="item in state.search.req.page.pageNum" :key="item">
                <el-skeleton-item
                  variant="image"
                  style="width: 10rem; height: 10rem; border-radius: 1rem"
                />
                <el-skeleton-item variant="text" style="width: 10rem" />
                <br />
                <el-skeleton-item variant="text" style="width: 5rem" />
              </div>
            </div>
          </template>
          <template #default>
            <div class="list-grid">
              <div v-for="(item, index) in tableData" :key="index">
                <LoadImg
                  class="cursor-pointer"
                  :src="item.picUrl"
                  width="10rem"
                  height="10rem"
                  @click="toMusicInfo(item.id)"
                />
                <p
                  class="text-base cursor-pointer truncate hover:underline"
                  @click="toMusicInfo(item.id)"
                >
                  {{ item.musicName }}
                </p>
                <el-link :underline="false" @click="toAlbum(item.album.id)">
                  <p class="truncate w-40 font-bold text-sm">
                    {{ item.album?.albumName }}
                  </p>
                </el-link>
              </div>
            </div>
          </template>
        </el-skeleton>
      </div>
      <div id="toPage" class="option">
        <el-pagination
          background
          :hide-on-single-page="state.search.req.page.total === 0"
          :default-current-page="state.search.req.page.pageIndex"
          :default-page-size="state.search.req.page.pageNum"
          :current-page="state.search.req.page.pageIndex"
          :page-size="state.search.req.page.pageNum"
          layout="prev, pager, next"
          :total="state.search.req.page.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    <el-empty
      v-if="emptyFlag"
      description="这里没有歌曲，请在歌单界面添加歌曲到歌单"
    />
  </div>
</template>
<style lang="scss" scoped>
@import url("@/style/pagination.scss");

.layout-container {
  display: flex;
  flex-flow: row nowrap;
  gap: 2rem;

  @media screen and (width <= 1024px) {
    flex-direction: column;
  }
}

.font {
  color: #a3a39cc3;
}

.table-data {
  border-radius: 1rem;
}

.list-grid {
  display: grid;

  /*  声明列的宽度  */
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));

  /*  声明行间距和列间距  */
  grid-gap: 25px;

  @media screen and (width <= 720px) {
    grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
  }
}

.option {
  display: flex;
  flex-direction: row-reverse;
  margin-top: 2rem;
  margin-right: 8rem;
  margin-bottom: 2rem;

  @media screen and (width <= 720px) {
    display: grid;

    /*  声明列的宽度  */
    grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));

    /*  声明行间距和列间距  */
    grid-gap: 25px;
  }
}

.operate-button {
  @apply mt-1 mb-3;

  @media screen and (width <= 720px) {
    display: grid;

    /*  声明列的宽度  */
    grid-template-columns: repeat(auto-fill, minmax(6rem, 1fr));

    /*  声明行间距和列间距  */
    grid-gap: 25px;
    margin: 2rem 0 0;
  }
}

.button {
  @media screen and (width <= 720px) {
    margin: 0;
  }
}

.playlist-name {
  font-size: 3rem;
}

.title-name {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.playlist-item-name {
  font-size: 2rem;
}

.content {
  position: relative;
  max-width: 40rem;
  max-height: 6rem;
  overflow: hidden;
  color: var(--el-color-info-light-3);
  text-overflow: ellipsis;
  white-space: pre-line;
}

.desc {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.playlist-title {
  @apply flex-auto;

  @media screen and (width <= 1024px) {
    margin-top: 1rem;
  }
}

.operation-panel-bg {
  display: flex;
  justify-content: center;
}

.operation-panel {
  position: absolute;
  bottom: 0;
  z-index: 200;
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  height: 3.2rem;
  padding-right: 1rem;
  padding-left: 1rem;
  margin-bottom: 20px;
  background: var(--el-bg-color);
  border: 1px solid rgb(142 142 142 / 20%);
  border-radius: 1rem;
}
</style>
