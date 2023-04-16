<script lang="ts" setup>
import {
  getPlayListInfo,
  getPlayListById,
  PlayListRes,
  PlayInfoRes,
  createPlayList,
  deletePlayList
} from "@/api/playlist";
import { getMusicUrl } from "@/api/music";
import { useRoute, useRouter } from "vue-router"; //1.先在需要跳转的页面引入useRouter
import { ref, reactive, onMounted } from "vue";
import { dateFormater } from "@/utils/dateUtil";
import { message } from "@/utils/message";
import { CellStyle } from "element-plus/es";
import DownloadIcon from "@/components/DownloadIcon/download.vue";
import ShowLoading from "@/components/ShowLoading/ShowLoading.vue";
import { Page } from "@/api/common";
import LoadImg from "@/components/LoadImg/LoadImg.vue";
import { getUserInfo, UserInfoRes } from "@/api/user";
import LayoutGrid from "@/assets/svg/layout_grid.svg?component";
import LayoutList from "@/assets/svg/layout_list.svg?component";
import { initRouter } from "@/router/utils";

const route = useRoute(); //2.在跳转页面定义router变量，解构得到指定的query和params传参的参数
const router = useRouter();

const tableData = ref<PlayListRes[]>();
const layoutFlag = ref<boolean>(false);
const emptyFlag = ref<boolean>(false);
const tableLoading = ref<boolean>(true);
const multipleSelection = ref([]);

const handleSelectionChange = val => {
  multipleSelection.value = val;
};

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

const musicPlayConfig = reactive({
  url: "",
  totalTime: 0,
  isPlay: true,
  isDisplay: false
});

const musicName = ref("");
const pageConfig = ref<Page>({
  pageIndex: 0,
  pageNum: 12,
  total: 0
});
const getPlay = (id: string) => {
  tableLoading.value = true;
  getPlayListById(id, {
    afterDate: "",
    albumName: "",
    beforeDate: "",
    musicIds: [],
    musicName: musicName.value,
    order: false,
    orderBy: "",
    page: pageConfig.value,
    artistName: ""
  })
    .then(res => {
      tableLoading.value = false;
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
      tableLoading.value = true;
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

const userInfo = ref<UserInfoRes>({
  createTime: "",
  id: 0,
  lastLoginTime: "",
  nickname: "",
  password: "",
  updateTime: "",
  username: ""
});
// 生命周期挂载
onMounted(() => {
  // 查询歌单信息
  getPlayListInfo(route.name.toString()).then(res => {
    playlistInfo.value = res.data;

    // 查询用户信息
    getUserInfo(res.data.userId).then(res => {
      userInfo.value = res.data;
    });
  });
  // 查询表格
  onSubmit();
});

const playListInput = ref("");

const createPlayListButton = () => {
  if (playListInput.value !== "") {
    createPlayList(playListInput.value).then(res => {
      addPlayListDialogVisible.value = false;
      if (res.code === "200") {
        message("创建成功", { type: "success" });
        router.go(0);
      }
    });
  } else {
    message("请输入歌单名", { type: "error" });
  }
};

const deletePlayListButton = () => {
  deleteDialogVisible.value = false;
  deletePlayList(route.name.toString()).then(res => {
    if (res.code === "200") {
      message("删除成功", { type: "success" });
      initRouter();
      router.push("/playlist");
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

const handleSizeChange = val => {
  pageConfig.value.pageNum = val;
  onSubmit();
};

const handleCurrentChange = val => {
  pageConfig.value.pageIndex = val;
  onSubmit();
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

const centerDialogVisible = ref(false);

const addPlayListDialogVisible = ref(false);

const deleteDialogVisible = ref(false);
</script>
<template>
  <div ref="divRef">
    <ShowLoading :loading="tableLoading" />
    <div v-if="!tableLoading">
      <div class="flex">
        <LoadImg :src="playlistInfo.pic" />
        <div class="ml-8 flex-auto">
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
              title="新建歌单"
              width="30%"
              align-center
            >
              <el-input v-model="playListInput" placeholder="Please input" />
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
                dateFormater("YYYY-MM-dd HH:mm:ss", playlistInfo.createTime)
              }}创建</span
            >
          </div>
          <div class="mt-1 mb-3">
            <el-button type="primary" round>播放歌单</el-button>
            <el-button round>编辑歌单</el-button>
            <el-button round>关于歌单</el-button>
            <el-button @click="deleteDialogVisible = true" type="danger" round
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
              <el-link v-else :underline="false" type="primary"
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
      </div>
      <div class="mt-12">
        <div class="desc" v-show="!tableLoading">
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
      <div class="mt-6">
        <el-table
          v-if="layoutFlag"
          class="table-data"
          :data="tableData"
          highlight-current-row
          @selection-change="handleSelectionChange"
          :cell-style="cellStyle"
          @row-dblclick="rowDoubleClick"
        >
          <el-table-column fixed type="index" width="60" />

          <el-table-column fixed width="40" show-overflow-tooltip>
            <template #default="scope">
              <DownloadIcon :muiscId="scope.row.id" />
            </template>
          </el-table-column>

          <el-table-column fixed label="名称" show-overflow-tooltip width="450">
            <template #default="scope">
              <span class="font-sans subpixel-antialiased">{{
                scope.row.musicName
              }}</span>
              <span class="font">&emsp;{{ scope.row.aliasName }}</span>
            </template>
          </el-table-column>

          <el-table-column label="歌手" show-overflow-tooltip>
            <template #default="scope">
              <el-tag
                disable-transitions
                v-for="item in scope.row.artists"
                :key="item.id"
                >{{ item.artistName }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column label="专辑" show-overflow-tooltip>
            <template #default="scope">
              <el-tag>
                {{ scope.row.album.albumName }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="歌曲时长" width="80" show-overflow-tooltip>
            <template #default="scope">
              <span class="font-light">{{
                dateFormater("mm:ss", scope.row.timeLength)
              }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="createTime"
            label="上传时间"
            show-overflow-tooltip
          >
            <template #default="scope">
              <span>{{
                dateFormater("YYYY-MM-dd HH:mm:ss", scope.row.createTime)
              }}</span>
            </template>
          </el-table-column>
        </el-table>
        <div v-else class="list-grid">
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
              <p class="text-ellipsis overflow-hidden font-bold text-sm">
                {{ item.album.albumName }}
              </p>
            </el-link>
          </div>
        </div>
      </div>
    </div>
    <el-empty description="description" v-if="emptyFlag" />
    <div class="option" v-show="!tableLoading" id="toPage">
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
</template>
<style lang="scss" scoped>
.font {
  color: #a3a39cc3;
}

.table-data {
  border-radius: 1rem;
}

:deep(.el-pager li) {
  border-radius: 6px;
}

:deep(.is-active) {
  background-color: var(--el-color-primary-light-7) !important;
  color: var(--el-color-primary) !important;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 !important;
}

.list-grid {
  display: grid;
  /*  声明列的宽度  */
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  /*  声明行间距和列间距  */
  grid-gap: 25px;
}

.option {
  display: flex;
  flex-direction: row-reverse;
  margin-top: 2rem;
  margin-right: 8rem;
  margin-bottom: 2rem;
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
</style>
