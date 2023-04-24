<script setup lang="ts">
import { getAllMusicList, getMusicUrl } from "@/api/music";
import { MusicSearchReq } from "@/api/common";
import DownloadIcon from "@/components/DownloadIcon/download.vue";
import MusicPlay from "./components/music.play.vue";
import { ref, reactive, onMounted } from "vue";
import { message } from "@/utils/message";
import { dateFormater } from "@/utils/dateUtil";
import { CellStyle } from "element-plus/es";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import ShowLoading from "@/components/ShowLoading/ShowLoading.vue";
import { storageSession, useDark } from "@pureadmin/utils";
import ContextMenu from "@imengyu/vue3-context-menu";
import AddMusicToPlayList from "@/components/addMusicToPlayList/addMusicToPlayList.vue";
import { getUserPlayList, UserPlayListRes } from "@/api/playlist";
import { DataInfo, sessionKey } from "@/utils/auth";
import { ElTable } from "element-plus";
import RadioIcon from "@/assets/svg/radio.svg?component";
import MultipleSelectionIcon from "@/assets/svg/multiple_selection.svg?component";

const { isDark } = useDark();
const router = useRouter();

const { t } = useI18n();

// 每页显示行数
const pageConfig = reactive({
  pageSize: 50,
  pageIndex: 1,
  total: 0
});

// 排序
const sortData = reactive([
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
]);

const musicPlayConfig = reactive({
  url: "",
  totalTime: 0,
  isPlay: true,
  isDisplay: false
});

const sortConfig = ref("sort");

const tableData = ref();
const tableLoading = ref<boolean>();

// 表格Ref
const multipleTableRef = ref<InstanceType<typeof ElTable>>();
// 选择数据
const multipleSelectionFlag = ref<boolean>(false);
const multipleSelection = ref([]);
const handleSelectionChange = val => {
  multipleSelection.value = val;
};

function getMusicList(param: MusicSearchReq) {
  tableLoading.value = true;
  getAllMusicList(param)
    .then(res => {
      tableLoading.value = false;
      if (res.code === "200") {
        tableData.value = res.data.records;
        pageConfig.total = res.data.total;
        pageConfig.pageSize = res.data.size;
        pageConfig.pageIndex = res.data.current;
      } else {
        message(res.message, { type: "error" });
      }
    })
    .catch(res => {
      tableLoading.value = false;
      message(res, { type: "error" });
    });
}

const formInline = reactive({
  musicName: "",
  artistName: "",
  albumName: ""
});

// 点击按钮查询
const onSubmit = (refresh?: boolean) => {
  getMusicList({
    musicIds: [],
    musicName: formInline.musicName,
    artistName: formInline.artistName,
    albumName: formInline.albumName,
    orderBy: sortConfig.value,
    order: false,
    beforeDate: "",
    afterDate: "",
    refresh: refresh != null,
    page: {
      pageIndex: pageConfig.pageIndex,
      pageNum: pageConfig.pageSize
    }
  });
};

// 表格变更时重新查询
const sortOnSubmit = () => {
  onSubmit();
};

// 生命周期挂载
onMounted(() => {
  // 查询表格
  onSubmit();
});

const handleSizeChange = val => {
  pageConfig.pageSize = val;
  onSubmit();
};

const handleCurrentChange = val => {
  pageConfig.pageIndex = val;
  onSubmit();
};

const menuFlag = ref<boolean>(false);

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
  // 设置序号样式
  if (columnIndex === 1 && multipleSelectionFlag.value) {
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
      // styles["backgroundColor"] = "#1e1e1e";
      styles["backgroundColor"] = isDark.value ? "#262626" : "#f4f6f7";
      break;
  }
  return styles;
};

// 设置表头样式
const tableHeaderCellStyle = (): CellStyle<any> => {
  if (isDark.value) {
    return {
      color: "white",
      fontWeight: "bold",
      textAlign: "center",
      borderBottom: "none"
    };
  } else {
    return {
      color: "black",
      fontWeight: "bold",
      textAlign: "center",
      borderBottom: "none"
    };
  }
};

const playItemDialogVisible = ref(false);
const userPlayItem = ref<UserPlayListRes[]>();
const addMusicId = ref<number>();
const userInfo = storageSession().getItem<DataInfo>(sessionKey);
const getUserPlayInfo = (id: number) => {
  console.log(`Music: ${id}`);
  addMusicId.value = id;
  getUserPlayList(userInfo.id).then(res => {
    playItemDialogVisible.value = true;
    userPlayItem.value = res.data;
  });
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

// 播放音乐
const rowDoubleClick = data => {
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

// 复选框
const rowClick = row => {
  // 多选时不进入详情页面
  if (multipleSelectionFlag.value) {
    multipleTableRef.value.toggleRowSelection(row, null);
  } else {
    toMusicInfo(row.id);
  }
};

const toMusicInfo = id => {
  router.push({
    path: "/music/musicInfo",
    query: { id: id }
  });
};

const toAlbum = res => {
  router.push({
    path: "/music/albumInfo",
    query: { id: res.albumId }
  });
};
const toArtist = res => {
  console.log(res);
  router.push({
    path: "/music/artistInfo",
    query: { id: res }
  });
};
</script>

<template>
  <div class="absolute-container">
    <!--添加歌曲到歌单-->
    <el-dialog v-model="playItemDialogVisible" width="30%" center>
      <AddMusicToPlayList
        :play-item="userPlayItem"
        :userId="Number.parseInt(userInfo.id)"
        :music-id="addMusicId"
      />
    </el-dialog>

    <!--刷新-->
    <div class="refresh" v-show="!tableLoading">
      <el-tooltip
        class="box-item"
        effect="dark"
        content="刷新缓存"
        placement="left-start"
      >
        <IconifyIconOnline
          @click="onSubmit(true)"
          class="cursor-pointer"
          icon="solar:refresh-outline"
          width="2rem"
          height="2rem"
        />
      </el-tooltip>
    </div>
    <div class="table">
      <div class="search">
        <div>
          <div class="data">
            <div
              class="play music animate__animated animate__fadeIn"
              v-if="musicPlayConfig.isDisplay"
            >
              <MusicPlay
                :url="musicPlayConfig.url"
                :totalTime="musicPlayConfig.totalTime"
                :isPlay="musicPlayConfig.isPlay"
              />
            </div>
          </div>
          <div class="data">
            <div class="demo-form-inline">
              <div class="m-1">
                <div class="inputGroup">
                  <input
                    type="text"
                    :required="true"
                    autocomplete="off"
                    v-model="formInline.musicName"
                    @keyup.enter="onSubmit"
                  />
                  <label for="name">输入音乐名称</label>
                </div>
              </div>

              <div class="m-1">
                <div class="inputGroup">
                  <input
                    type="text"
                    :required="true"
                    autocomplete="off"
                    v-model="formInline.artistName"
                    @keyup.enter="onSubmit"
                  />
                  <label for="name">输入歌手名称</label>
                </div>
              </div>

              <div class="m-1">
                <div class="inputGroup">
                  <input
                    type="text"
                    :required="true"
                    autocomplete="off"
                    v-model="formInline.albumName"
                    @keyup.enter="onSubmit"
                  />
                  <label for="name">输入专辑名称</label>
                </div>
              </div>

              <Transition name="slide-fade">
                <div
                  class="flex flex-col justify-center m-1"
                  v-show="
                    formInline.albumName !== '' ||
                    formInline.musicName !== '' ||
                    formInline.artistName !== ''
                  "
                >
                  <el-button
                    type="primary"
                    round
                    size="large"
                    :loading="tableLoading"
                    @click="onSubmit"
                    >{{ t("buttons.search") }}
                  </el-button>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </div>

      <div class="option">
        <div @click="menuFlag = !menuFlag">
          <button class="menu-button focus:ring-4 var(--el-color-primary)">
            <span>{{ t("input.menuBotton") }}</span>
          </button>
        </div>

        <div>
          <el-switch
            size="large"
            :active-icon="MultipleSelectionIcon"
            :inactive-icon="RadioIcon"
            v-model="multipleSelectionFlag"
          />
          <el-select
            v-model="sortConfig"
            placeholder="排序"
            size="large"
            style="width: 8rem"
            @change="sortOnSubmit"
          >
            <el-option
              v-for="item in sortData"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              suffix-icon="download"
            />
          </el-select>
        </div>
      </div>

      <div>
        <el-collapse-transition>
          <div v-show="menuFlag">
            <div class="flex justify-center p-4">
              <el-pagination
                :default-current-page="pageConfig.pageIndex"
                :default-page-size="pageConfig.pageSize"
                :current-page="pageConfig.pageIndex"
                :page-size="pageConfig.pageSize"
                :page-sizes="[100, 200, 500, 1000]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="pageConfig.total"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </div>
        </el-collapse-transition>
      </div>

      <!--加载遮罩-->
      <transition name="el-fade-in">
        <ShowLoading :loading="tableLoading" />
      </transition>
      <transition
        name="el-zoom-in-top"
        class="tableDataShow"
        v-show="!tableLoading"
        :key="multipleSelectionFlag"
      >
        <el-table
          ref="multipleTableRef"
          :data="tableData"
          highlight-current-row
          header-align="left"
          @selection-change="handleSelectionChange"
          :cell-style="cellStyle"
          :header-cell-style="tableHeaderCellStyle"
          @row-dblclick="rowDoubleClick"
          @row-click="rowClick"
        >
          <el-table-column
            type="selection"
            width="55"
            v-if="multipleSelectionFlag"
          />
          <el-table-column fixed type="index" width="50" />

          <el-table-column fixed width="50" :show-overflow-tooltip="true">
            <template #default="scope">
              <DownloadIcon :muiscId="scope.row.id" />
            </template>
          </el-table-column>

          <el-table-column
            fixed
            prop="musicName"
            label="名称"
            :show-overflow-tooltip="true"
            width="450"
          >
            <template #default="scope">
              <div @contextmenu="onContextMenu($event, scope.row.id)">
                <el-link
                  :underline="false"
                  class="font-sans"
                  @click="toMusicInfo(scope.row.id)"
                  >{{ scope.row.musicName }}</el-link
                >
                <span class="font">&emsp;{{ scope.row.musicNameAlias }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="歌手" :show-overflow-tooltip="true">
            <template #default="scope">
              <el-link
                class="mr-1"
                :underline="false"
                disable-transitions
                v-for="(item, index) in scope.row.artistNames"
                :key="index"
              >
                <span @click="toArtist(scope.row.artistIds[index])">{{
                  item
                }}</span>
              </el-link>
            </template>
          </el-table-column>
          <el-table-column
            prop="albumName"
            label="专辑"
            :show-overflow-tooltip="true"
          >
            <template #default="scope">
              <span @click="toAlbum(scope.row)">
                <el-link :underline="false">{{ scope.row.albumName }}</el-link>
              </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="timeLength"
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
      </transition>

      <div class="demo-pagination-block" v-show="!tableLoading">
        <el-pagination
          :default-current-page="pageConfig.pageIndex"
          :default-page-size="pageConfig.pageSize"
          :current-page="pageConfig.pageIndex"
          :page-size="pageConfig.pageSize"
          :page-sizes="[50, 100, 500, 1000]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pageConfig.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$searchWidth: 90%;
$searchHeight: 90%;

.refresh {
  position: fixed;
  bottom: 200px;
  right: 40px;
  margin: 3px;
  z-index: 100;
  animation: animate__slideInUp; /* referring directly to the animation's @keyframe declaration */
  animation-duration: 2s; /* don't forget to set a duration! */
}

.absolute-container {
  margin: 0;
  display: flex;
  flex-direction: column;
  /*主轴上的对齐方式为居中*/
  justify-content: center;
  /*交叉轴上对齐方式为居中*/
  // align-items: center;

  .table {
    width: $searchWidth;
    margin: 0 auto;
    overflow-x: scroll;
  }
}

.search {
  .data {
    display: flex;
    justify-content: center;

    .play.music {
      position: absolute;
      z-index: 100;
      bottom: 0;
      margin: 4rem;
    }
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
  margin: 2rem;
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

.demo-form-inline {
  display: flex;
}

.inputGroup {
  font-family: "Segoe UI", sans-serif;
  margin: 1em 0 1em 0;
  max-width: 190px;
  position: relative;
}

.inputGroup input {
  font-size: 100%;
  padding: 0.8em;
  outline: none;
  border: 2px solid rgb(200, 200, 200);
  background-color: transparent;
  border-radius: 20px;
  width: 100%;
}

.inputGroup label {
  font-size: 100%;
  position: absolute;
  left: 0;
  padding: 0.8em;
  margin-left: 0.5em;
  pointer-events: none;
  transition: all 0.3s ease;
  color: rgb(100, 100, 100);
}

.inputGroup :is(input:focus, input:valid) ~ label {
  @apply dark:bg-[#020409] bg-neutral-100;
  transform: translateY(-50%) scale(0.9);
  margin: 0 0 0 1.3em;
  padding: 0.4em;
}

.inputGroup :is(input:focus, input:valid) {
  border-color: rgb(150, 150, 200);
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

:deep(.el-dialog) {
  border-radius: 1rem;
}

:deep(.el-select__popper) {
  border-radius: 1rem;
}

:deep(.el-input__wrapper) {
  border-radius: 1rem;
}

:deep(.el-table__row td) {
  border: 1px solid transparent;
}

.tableDataShow {
  border-radius: 1rem;
}
</style>
