<script lang="ts" setup>
import {
  getPlayListInfo,
  getPlayListById,
  PlayListRes,
  PlayInfoRes,
  createPlayList,
  deletePlayList,
  updatePlayListInfo,
  tracksMusicToPlayList
} from "@/api/playlist";
import { getMusicUrl } from "@/api/music";
import { useRoute, useRouter } from "vue-router"; //1.先在需要跳转的页面引入useRouter
import { ref, reactive, onMounted, watch } from "vue";
import { dateFormater } from "@/utils/dateUtil";
import { message } from "@/utils/message";
import { CellStyle } from "element-plus/es";
import DownloadIcon from "@/components/DownloadIcon/download.vue";
import { Page } from "@/api/common";
import LoadImg from "@/components/LoadImg/LoadImg.vue";
import { getUserInfo, UserInfoRes } from "@/api/user";
import LayoutGrid from "@/assets/svg/layout_grid.svg?component";
import LayoutList from "@/assets/svg/layout_list.svg?component";
import { handleAliveRoute } from "@/router/utils";
import { removeMenusRouter } from "@/utils/removeRouter";
import Wbutton from "@/components/button/index.vue";
import { clone, storageSession, useDark } from "@pureadmin/utils";
import { ElTable } from "element-plus";
import { usePlaySongListStoreHook } from "@/store/modules/playSongList";

const route = useRoute(); //2.在跳转页面定义router变量，解构得到指定的query和params传参的参数
const router = useRouter();
const { isDark } = useDark();

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

const musicPlayConfig = reactive({
  url: "",
  totalTime: 0,
  isPlay: true,
  isDisplay: false
});

const musicName = ref("");
const pageConfig = ref<Page>({
  pageIndex: 0,
  pageNum: 14,
  total: 0
});
const getPlay = (id: string) => {
  getPlayListById(id, {
    afterDate: "",
    albumName: "",
    beforeDate: "",
    musicIds: [],
    musicName: musicName.value,
    order: false,
    orderBy: "",
    page: pageConfig.value,
    artistName: "",
    refresh: false,
    isShowNoExist: false
  })
    .then(res => {
      if (res.code === "200") {
        tableData.value = res.data.records;
        emptyFlag.value =
          res.data.records == null || res.data.records.length === 0;
        pageConfig.value.pageIndex = res.data.current;
        pageConfig.value.pageNum = res.data.size;
        pageConfig.value.total = res.data.total;
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
  createTime: "",
  id: 0,
  pic: "",
  playListName: "",
  sort: 0,
  subscribed: false,
  type: 0,
  updateTime: "",
  userId: 0
});

const modifyPlayListInfo = ref<PlayInfoRes>(null);

const userInfo = ref<UserInfoRes>({
  createTime: "",
  id: 0,
  lastLoginTime: "",
  nickname: "",
  password: "",
  updateTime: "",
  username: ""
});
const playListInfoFlag = ref(true);
// 生命周期挂载
onMounted(async () => {
  playListInfoFlag.value = true;
  try {
    // 查询歌单信息
    const playInfoResR = await getPlayListInfo(route.name.toString());
    playlistInfo.value = playInfoResR.data;
    modifyPlayListInfo.value = clone(playlistInfo.value);
    // 查询用户信息
    const userInfoResR = await getUserInfo(playInfoResR.data.userId);
    userInfo.value = userInfoResR.data;
  } catch (e) {
    message(`请求出错${e}`, { type: "error" });
  }
  // 查询表格
  onSubmit();
  playListInfoFlag.value = false;
});

const playListInput = ref("");

const createPlayListButton = () => {
  if (playListInput.value !== "") {
    createPlayList(playListInput.value)
      .then(res => {
        addPlayListDialogVisible.value = false;
        if (res.code === "200") {
          message("创建成功", { type: "success" });
          router.go(0);
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
      handleAliveRoute(route.matched, "delete");

      router.push({ path: "/playlist" });
      removeMenusRouter(route.name);
    } else {
      message("删除失败", { type: "error" });
    }
  });
};

// 播放音乐
const rowDoubleClick = (data: any) => {
  console.log(data);
  musicPlayConfig.isDisplay = false;
  getMusicUrl(data.id).then(res => {
    musicPlayConfig.url = res.data[0].rawUrl;
    console.log(musicPlayConfig);
    musicPlayConfig.isDisplay = true;
  });
  musicPlayConfig.totalTime = data.timeLength;
  musicPlayConfig.isPlay = true;
};

const editPlayInfoFlag = ref<boolean>(false);
const updatePlayInfo = async () => {
  try {
    const res = await updatePlayListInfo(modifyPlayListInfo.value);
    if (res.code === "200") {
      message("修改成功", { type: "success" });
      editPlayInfoFlag.value = false;
    } else {
      message(`修改失败: ${res.message}`, { type: "error" });
      modifyPlayListInfo.value = clone(playlistInfo.value);
    }
  } catch (e) {
    message(`请求失败: ${e}`, { type: "error" });
  }
};

const aboutFlag = ref<boolean>(false);

const handleSizeChange = val => {
  pageConfig.value.pageNum = val;
  onSubmit();
};

const handleCurrentChange = val => {
  pageConfig.value.pageIndex = val;
  onSubmit();
};

const playListStatusOptions = [
  {
    value: 0,
    label: "普通歌单"
  },
  {
    value: 1,
    label: "喜爱歌单"
  },
  {
    value: 2,
    label: "推荐歌单"
  }
];

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
  console.log("添加到播放歌单");
  for (const valueElement of multipleSelection.value) {
    await usePlaySongListStoreHook().addMusicToNextPlaySongList(
      valueElement.id
    );
  }
  message("成功添加音乐到歌单", { type: "success" });
};

const toMusicInfo = id => {
  router.push({
    path: "/music/musicInfo",
    query: { id: id }
  });
};

const toAlbum = id => {
  router.push({
    path: "/music/albumInfo",
    query: { id: id }
  });
};

const toMusicPlay = async () => {
  try {
    for (const valueElement of multipleSelection.value) {
      await usePlaySongListStoreHook().addMusicToNextPlaySongList(
        valueElement.id
      );
    }
  } catch (e) {
    message(e, { type: "error" });
    return;
  }
  await router.push({
    path: "/musicPlay"
  });
};
const centerDialogVisible = ref(false);

const addPlayListDialogVisible = ref(false);

const deleteDialogVisible = ref(false);

// 骨架屏延时加载时间
const throttle = ref(0);
</script>
<template>
  <div ref="divRef">
    <!--歌单操作面板-->
    <div
      class="operation-panel-bg"
      v-show="multipleSelection.length > 0 && !emptyFlag"
    >
      <div class="operation-panel">
        <div class="flex items-center rounded">
          <span class="p-4">
            <span class="text-sm" style="color: var(--el-text-color-regular)"
              >已选择</span
            >
            {{ multipleSelection.length }}
          </span>
          <IconifyIconOnline
            @click="multipleTableRef.clearSelection()"
            class="cursor-pointer"
            style="color: #636e72"
            icon="solar:close-circle-bold-duotone"
            width="2rem"
            height="2rem"
          />
        </div>
        <div class="flex items-center rounded">
          <IconifyIconOnline
            @click="toMusicPlay"
            class="cursor-pointer"
            style="color: #636e72"
            icon="solar:play-circle-bold-duotone"
            width="2rem"
            height="2rem"
          />
        </div>
        <div class="flex items-center rounded">
          <IconifyIconOnline
            @click="addPlaySongList"
            class="cursor-pointer"
            style="color: #636e72"
            icon="solar:turntable-music-note-bold-duotone"
            width="2rem"
            height="2rem"
          />
        </div>
        <div class="flex items-center rounded">
          <IconifyIconOnline
            @click="deletePlayListMusicMethod"
            class="cursor-pointer"
            style="color: #d63031"
            icon="solar:trash-bin-minimalistic-2-bold-duotone"
            width="2rem"
            height="2rem"
          />
        </div>
      </div>
    </div>
    <el-dialog
      v-model="editPlayInfoFlag"
      title="歌单信息"
      width="45%"
      :show-close="false"
    >
      <el-form label-position="top" :model="modifyPlayListInfo">
        <el-form-item label="歌单名">
          <el-input
            v-model="modifyPlayListInfo.playListName"
            placeholder="歌单名"
          />
        </el-form-item>
        <el-form-item label="封面">
          <el-input v-model="modifyPlayListInfo.pic" placeholder="https://" />
        </el-form-item>
        <el-form-item label="歌单状态">
          <el-select v-model="modifyPlayListInfo.type" placeholder="">
            <el-option
              v-for="item in playListStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="歌单描述" prop="desc">
          <el-input v-model="playlistInfo.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editPlayInfoFlag = false">取消</el-button>
          <el-button @click="updatePlayInfo" type="primary"> 更新 </el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog v-model="aboutFlag" width="30%" :show-close="false">
      <div>
        <div class="mb-4">
          <h2>歌单名</h2>
          <span>{{ playlistInfo.playListName }}</span>
        </div>
        <div class="mb-4">
          <h2>封面</h2>
          <span class="block truncate w-[23rem]">{{ playlistInfo.pic }}</span>
        </div>
        <div class="mb-4">
          <h2>歌单描述</h2>
          <span class="block truncate w-[23rem]">{{
            playlistInfo.description
          }}</span>
        </div>
      </div>
      <template #header="{ titleId, titleClass }">
        <div class="flex justify-between">
          <h4 :id="titleId" :class="titleClass">关于</h4>
          <Wbutton @click="message('功能正在开发中', { type: 'info' })"
            >导出歌单</Wbutton
          >
        </div>
      </template>
    </el-dialog>
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
                    style="height: 3rem; width: 8rem; border-radius: 1rem"
                  />
                  <el-skeleton-item
                    variant="button"
                    style="height: 3rem; width: 8rem; border-radius: 1rem"
                  />
                  <el-skeleton-item
                    variant="button"
                    style="height: 3rem; width: 8rem; border-radius: 1rem"
                  />
                  <el-skeleton-item
                    variant="button"
                    style="height: 3rem; width: 8rem; border-radius: 1rem"
                  />
                </div>
                <br />
                <el-skeleton-item variant="h1" class="h-[3rem] w-[5rem]" />
              </div>
            </div>
          </template>
          <template #default>
            <LoadImg :src="playlistInfo.pic" />
            <div class="playlist-title">
              <div class="title-name">
                <p class="playlist-name">{{ playlistInfo.playListName }}</p>
                <el-button
                  class="mr-8 mt-2"
                  type="primary"
                  @click="addPlayListDialogVisible = true"
                  >新建歌单</el-button
                >
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
                <span class="mr-4">{{ userInfo.nickname }}</span>
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
                <el-button class="button" type="primary" round
                  >播放歌单</el-button
                >
                <el-button class="button" @click="editPlayInfoFlag = true" round
                  >编辑歌单</el-button
                >
                <el-button class="button" @click="aboutFlag = true" round
                  >关于歌单</el-button
                >
                <el-button
                  class="button"
                  @click="deleteDialogVisible = true"
                  type="danger"
                  round
                  >删除歌单</el-button
                >
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
                    >添加简介</el-link
                  >
                </div>

                <!--显示专辑详细信息-->
                <el-dialog
                  class="showDialog"
                  v-model="centerDialogVisible"
                  width="30%"
                  :show-close="false"
                >
                  <template #header>
                    <h2>{{ playlistInfo.playListName }}</h2>
                    <span class="font-bold text-sm text-neutral-400">{{
                      userInfo.nickname
                    }}</span>
                    <span class="text-sm text-neutral-400">&#32;·&#32;</span>
                    <span class="text-sm text-neutral-400">
                      {{ dateFormater("YYYY", playlistInfo.createTime) }}</span
                    >
                  </template>
                  <el-scrollbar class="show-desc">
                    <span>{{ playlistInfo.description }}</span>
                  </el-scrollbar>
                </el-dialog>
              </div>
            </div>
          </template>
        </el-skeleton>
      </div>
      <div class="mt-12">
        <div class="desc">
          <p class="playlist-item-name">歌曲列表</p>
          <el-switch
            class="mr-4"
            v-model="layoutFlag"
            size="large"
            inline-prompt
            :active-icon="LayoutList"
            :inactive-icon="LayoutGrid"
            style="
              --el-switch-on-color: var(--el-color-primary);
              --el-switch-off-color: #a55eea;
            "
          />
        </div>
      </div>
      <div class="mt-6" v-show="!emptyFlag">
        <el-skeleton
          animated
          :loading="playListInfoFlag"
          v-if="layoutFlag"
          :throttle="throttle"
        >
          <template #template>
            <div class="flex flex-col items-center gap-4">
              <el-skeleton-item
                v-for="item in pageConfig.pageNum"
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
              @selection-change="handleSelectionChange"
              :cell-style="cellStyle"
              :header-cell-style="tableHeaderCellStyle"
              @row-dblclick="rowDoubleClick"
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
                  <span class="font-sans subpixel-antialiased">{{
                    scope.row.musicName
                  }}</span>
                  <span class="font">&emsp;{{ scope.row.aliasName }}</span>
                </template>
              </el-table-column>

              <el-table-column label="歌手" :show-overflow-tooltip="true">
                <template #default="scope">
                  <el-tag
                    disable-transitions
                    v-for="item in scope.row.artists"
                    :key="item.id"
                    >{{ item.artistName }}</el-tag
                  >
                </template>
              </el-table-column>
              <el-table-column label="专辑" :show-overflow-tooltip="true">
                <template #default="scope">
                  <el-tag>
                    {{ scope.row.album.albumName }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                label="歌曲时长"
                width="80"
                :show-overflow-tooltip="true"
              >
                <template #default="scope">
                  <span class="font-light">{{
                    dateFormater("mm:ss", scope.row.timeLength)
                  }}</span>
                </template>
              </el-table-column>
              <el-table-column
                prop="createTime"
                label="上传时间"
                :show-overflow-tooltip="true"
              >
                <template #default="scope">
                  <span>{{
                    dateFormater("YYYY-MM-dd HH:mm:ss", scope.row.createTime)
                  }}</span>
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
              <div v-for="item in pageConfig.pageNum" :key="item">
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
                  :src="item.pic"
                  width="10rem"
                  height="10rem"
                  @click="toMusicInfo(item.id)"
                />
                <p
                  class="cursor-pointer truncate hover:underline"
                  @click="toMusicInfo(item.id)"
                >
                  {{ item.musicName }}
                </p>
                <el-link :underline="false" @click="toAlbum(item.album.id)">
                  <p class="truncate w-40 font-bold text-sm">
                    {{ item.album.albumName }}
                  </p>
                </el-link>
              </div>
            </div>
          </template>
        </el-skeleton>
      </div>
      <div class="option" id="toPage">
        <el-pagination
          background
          :hide-on-single-page="pageConfig.total === 0"
          :default-current-page="pageConfig.pageIndex"
          :default-page-size="pageConfig.pageNum"
          :current-page="pageConfig.pageIndex"
          :page-size="pageConfig.pageNum"
          layout="prev, pager, next"
          :total="pageConfig.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    <el-empty description="description" v-if="emptyFlag" />
  </div>
</template>
<style lang="scss" scoped>
@import url("@/style/pagination.scss");

.layout-container {
  display: flex;
  flex-wrap: nowrap;
  gap: 2rem;
  flex-direction: row;

  @media screen and (max-width: 1024px) {
    flex-direction: column;
  }
}

.font {
  color: #a3a39cc3;
}

.table-data {
  border-radius: 1rem;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 !important;
  border: 1px solid var(--el-color-primary-light-8);
  border-radius: 5px;
}

.list-grid {
  display: grid;
  /*  声明列的宽度  */
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  /*  声明行间距和列间距  */
  grid-gap: 25px;

  @media screen and (max-width: 720px) {
    grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
  }
}

.option {
  display: flex;
  flex-direction: row-reverse;
  margin-top: 2rem;
  margin-right: 8rem;
  margin-bottom: 2rem;

  @media screen and (max-width: 720px) {
    display: grid;
    /*  声明列的宽度  */
    grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
    /*  声明行间距和列间距  */
    grid-gap: 25px;
  }
}

.operate-button {
  @apply mt-1 mb-3;

  @media screen and (max-width: 720px) {
    margin: 2rem 0 0;
    display: grid;
    /*  声明列的宽度  */
    grid-template-columns: repeat(auto-fill, minmax(6rem, 1fr));
    /*  声明行间距和列间距  */
    grid-gap: 25px;
  }
}

.button {
  @media screen and (max-width: 720px) {
    margin: 0;
  }
}

.playlist-name {
  font-size: 3rem;
}

.title-name {
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.playlist-item-name {
  font-size: 2rem;
}

.content {
  max-width: 40rem;
  max-height: 6rem;
  color: var(--el-color-info-light-3);
  position: relative;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: pre-line;
}

.show-desc {
  height: 20rem;
  overflow-y: auto;
}

:deep(.el-dialog) {
  border-radius: 1rem;
}

.desc {
  display: flex;
  justify-content: space-between;
}

.playlist-title {
  @apply flex-auto;

  @media screen and (max-width: 1024px) {
    margin-top: 1rem;
  }
}

.operation-panel-bg {
  display: flex;
  justify-content: center;
}

.operation-panel {
  padding-left: 1rem;
  padding-right: 1rem;
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
  gap: 1rem;
}
</style>
