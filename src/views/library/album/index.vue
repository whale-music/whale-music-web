<script setup lang="ts">
import ListCheckFill from "@iconify-icons/mingcute/list-check-fill";
import MenuFill from "@iconify-icons/mingcute/menu-fill";
import { storageLocal, useDark } from "@pureadmin/utils";
import { CellStyle, ElTable } from "element-plus";
import { onMounted, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import { deleteAlbum, getAlbumListPage } from "@/api/album";
import { AlbumListPageReq, AlbumListPageRes } from "@/api/model/Album";
import { Page } from "@/api/model/common";
import LoadImg from "@/components/LoadImg/LoadImg.vue";
import NameSearch from "@/components/nameSearch/index.vue";
import Segmented, { type OptionsType } from "@/components/ReSegmented";
import ShowLoading from "@/components/ShowLoading/ShowLoading.vue";
import { dateFormater } from "@/utils/dateUtil";
import { message } from "@/utils/message";
import { emitter } from "@/utils/mitt";

const { isDark } = useDark();
const router = useRouter();

const { t } = useI18n();

onMounted(async () => {
  state.table.initLoading = true;
  await getAlbumPageList();
  state.table.initLoading = false;
});

// 监听容器
emitter.on("resize", ({ detail }) => {
  const { width } = detail;
  reDrawLayout(width);
});

function reDrawLayout(width: number) {
  if (width < 720) {
    modifyShow(false);
    state.table.nameWidth = 200;
  } else {
    state.table.nameWidth = 500;
    modifyShow(true);
  }
}

const state = reactive<{
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
    name: string;
    req: AlbumListPageReq;
    res: AlbumListPageRes[];
  };
  menuFlag: boolean;
  table: {
    nameWidth: number;
    optionSwitch: Array<OptionsType>;
    optionSwitchValue: boolean;
    initLoading: boolean;
    loading: boolean;
    emptyFlag: boolean;
    show: {
      musicCount: boolean;
      artist: boolean;
      creatTime: boolean;
    };
  };
}>({
  sortData: undefined,
  search: {
    typeData: undefined,
    searchType: "all",
    name: "",
    req: undefined,
    res: undefined
  },
  menuFlag: false,
  table: {
    nameWidth: undefined,
    optionSwitch: undefined,
    optionSwitchValue: storageLocal().getItem("switchAlbumTableAndRadio"),
    initLoading: false,
    loading: false,
    emptyFlag: false,
    show: {
      artist: true,
      musicCount: true,
      creatTime: true
    }
  }
});

const page: Page =
  storageLocal().getItem<Page>("album-page") == null
    ? {
        pageIndex: 1,
        pageNum: 5,
        total: 0
      }
    : storageLocal().getItem("album-page");

state.search.req = {
  company: "",
  id: null,
  picUrl: "",
  publishTime: undefined,
  subType: "",
  artistName: "",
  albumName: "",
  orderBy: "sort",
  order: false,
  timeBy: false,
  beforeTime: "",
  laterTime: "",
  page: page,
  description: "",
  pic: undefined,
  updateTime: "",
  createTime: ""
};

state.search.typeData = [
  {
    value: "all",
    label: "全部"
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

/** 只设置图标 */
state.table.optionSwitch = [
  {
    value: "radio",
    icon: MenuFill
  },
  {
    value: "multiple",
    icon: ListCheckFill
  }
];

const onChangeOptionSwitch = ({ option }) => {
  const { value } = option;
  state.table.optionSwitchValue = value === "multiple";
  multipleSelection.value = [];
  storageLocal().setItem(
    "switchAlbumTableAndRadio",
    state.table.optionSwitchValue
  );
};

const getAlbumPageList = async () => {
  state.table.loading = true;

  state.search.req.albumName = "";
  state.search.req.artistName = "";
  switch (state.search.searchType) {
    case "album":
      state.search.req.albumName = state.search.name;
      break;
    case "artist":
      state.search.req.artistName = state.search.name;
      break;
    default:
    case "all":
      state.search.req.albumName = state.search.name;
      state.search.req.artistName = state.search.name;
      break;
  }

  try {
    const res = await getAlbumListPage(state.search.req);

    state.search.req.page.pageIndex = res.data.current;
    state.search.req.page.pageNum = res.data.size;
    state.search.req.page.total = res.data.total;

    state.search.res = res.data.records;
    state.table.loading = false;
  } catch (e) {
    state.table.loading = false;
    state.search.req.page.total = 0;
    message(`${e}`, { type: "error" });
  }
};

const onSubmit = () => {
  getAlbumPageList();
};

const handleSizeChange = val => {
  state.search.req.page.pageNum = val;
  onSubmit();
};

const handleCurrentChange = val => {
  state.search.req.page.pageIndex = val;
  onSubmit();
};

const multipleTableRef = ref<InstanceType<typeof ElTable>>();

const deleteMusicFlag = ref<boolean>(false);
const deleteCompelMusicFlag = ref<boolean>(false);

const multipleSelection = ref<AlbumListPageRes[]>([]);
const selectFlag = ref<boolean>(false);
// 监听是否选择音乐
watch(multipleSelection, async newQuestion => {
  selectFlag.value = newQuestion.length > 0;
});
const handleSelectionChange = val => {
  multipleSelection.value = val;
};

const cancelButton = () => {
  multipleTableRef.value.clearSelection();
};

const deleteAlbumList = async (flag: boolean) => {
  const id = [];
  multipleSelection.value.forEach(value => id.push(value.id));
  try {
    const res = await deleteAlbum(id, flag);
    if (res.code === "200") {
      if (multipleSelection.value.length === state.search.req.page.pageNum) {
        await onSubmit();
        return;
      }
      for (const valueElement of multipleSelection.value) {
        state.search.res = state.search.res.filter(
          value => value.id !== valueElement.id
        );
      }
      message("删除成功", { type: "success" });
    } else {
      message(`删除失败: ${res.message}`, { type: "error" });
    }
  } catch (e) {
    message(`请求失败: ${e}`, { type: "error" });
  }
};

// 复选框
const rowClick = row => {
  // 多选时不进入详情页面
  if (state.table.optionSwitchValue) {
    multipleTableRef.value.toggleRowSelection(row, null);
  }
};

const modifyShow = (status: boolean) => {
  // state.table.show.artist = status;
  state.table.show.creatTime = status;
  state.table.show.musicCount = status;
};

// 表格颜色
const cellStyle = ({ columnIndex }): CellStyle<any> => {
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
  if (columnIndex === 1 && state.table.optionSwitchValue) {
    styles = {
      color: "#bfbfbf",
      padding: "0",
      margin: "0",
      width: "0.6rem",
      "font-size": "0.6rem",
      "text-align": "center"
    };
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

const toAlbum = res => {
  router.push({
    name: "AlbumInfo",
    query: { id: res.id }
  });
};

const toArtist = id => {
  console.log(id);
  router.push({
    name: "ArtistInfo",
    query: { id: id }
  });
};
</script>

<template>
  <div class="album">
    <div v-show="selectFlag" class="operation-panel-bg">
      <div class="operation-panel">
        <el-dialog
          v-model="deleteCompelMusicFlag"
          width="45%"
          title="确认需要删除吗?"
        >
          <b>
            该删除会删除
            <b class="text-rose-800">专辑</b>
            ，如果有关联
            <b class="text-rose-800">歌曲</b>
            会删除失败
          </b>
          <br />
          <el-tooltip
            effect="dark"
            content="<b>该操作会强制删除<b class='text-rose-800'>专辑</b>, 并不会删除歌曲"
            raw-content
          >
            <el-checkbox
              v-model="deleteMusicFlag"
              label="强制删除"
              size="large"
            />
          </el-tooltip>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="deleteCompelMusicFlag = false">否</el-button>
              <el-button
                type="danger"
                @click="
                  deleteCompelMusicFlag = false;
                  deleteAlbumList(deleteMusicFlag);
                "
              >
                是
              </el-button>
            </span>
          </template>
        </el-dialog>
        <div class="flex items-center ml-2 mr-2 rounded">
          <span class="p-4">
            <span class="text-sm" style="color: var(--el-text-color-regular)"
              >已选择</span
            >
            {{ multipleSelection.length }}
          </span>
          <IconifyIconOnline
            class="cursor-pointer"
            style="color: #636e72"
            icon="solar:close-circle-bold-duotone"
            width="2rem"
            height="2rem"
            @click="cancelButton"
          />
        </div>
        <div class="flex items-center ml-2 mr-2 rounded">
          <IconifyIconOnline
            class="cursor-pointer"
            style="color: #d63031"
            icon="solar:trash-bin-minimalistic-2-bold-duotone"
            width="2rem"
            height="2rem"
            @click="deleteCompelMusicFlag = true"
          />
        </div>
      </div>
    </div>

    <div class="center_album">
      <!--搜索框-->
      <name-search
        v-model="state.search.name"
        v-model:dropdownValue="state.search.searchType"
        :loading="state.table.loading"
        :dropdown="state.search.typeData"
        :buttonName="t('buttons.search')"
        @onSearch="
          () => {
            state.search.req.page.pageIndex = 1;
            onSubmit();
          }
        "
        @onClean="
          () => {
            state.search.name = '';
            state.search.req.page.pageIndex = 1;
            onSubmit();
          }
        "
      />

      <div class="option">
        <div class="flex items-center">
          <button class="menu-button" @click="state.menuFlag = !state.menuFlag">
            <span>{{ t("input.menuBotton") }}</span>
          </button>
        </div>

        <div class="flex-c gap-2">
          <Segmented
            :options="state.table.optionSwitch"
            :defaultValue="
              state.table.optionSwitch.findIndex(
                value => value.value === 'radio'
              )
            "
            @change="onChangeOptionSwitch"
          />

          <el-select
            v-model="state.search.req.orderBy"
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
        </div>
      </div>

      <div class="table-view">
        <div>
          <el-collapse-transition>
            <div v-show="state.menuFlag">
              <div class="flex justify-center p-4" />
            </div>
          </el-collapse-transition>
        </div>

        <!--加载遮罩-->
        <transition name="el-fade-in">
          <ShowLoading :loading="state.table.initLoading" />
        </transition>
        <el-empty
          v-if="state.search.req.page.total === 0"
          description="这里没有专辑，请去主页添加"
        />
        <div>
          <el-table
            v-if="state.search.req.page.total !== 0"
            v-show="!state.table.initLoading"
            ref="multipleTableRef"
            :key="state.table.optionSwitchValue"
            v-loading="state.table.loading"
            :data="state.search.res"
            class="album-table"
            style="width: 100%"
            table-layout="fixed"
            :header-cell-style="tableHeaderCellStyle"
            :cell-style="cellStyle"
            @selection-change="handleSelectionChange"
            @row-click="rowClick"
          >
            <el-table-column
              v-if="state.table.optionSwitchValue"
              type="selection"
              width="55"
            />
            <el-table-column type="index" />
            <el-table-column width="110" :show-overflow-tooltip="false">
              <template #default="scope">
                <load-img
                  :src="scope.row.picUrl"
                  width="5rem"
                  height="5rem"
                  radius="1rem"
                  :shadow="false"
                />
              </template>
            </el-table-column>
            <el-table-column
              :label="t('input.albumName')"
              :show-overflow-tooltip="true"
              :width="state.table.nameWidth"
            >
              <template #default="scope">
                <el-link :underline="false">
                  <span class="text-xl" @click="toAlbum(scope.row)">{{
                    scope.row.albumName
                  }}</span>
                </el-link>
              </template>
            </el-table-column>
            <el-table-column
              v-if="state.table.show.artist"
              :label="t('input.singerName')"
              :show-overflow-tooltip="true"
            >
              <template #default="scope">
                <el-link
                  v-for="item in scope.row.artistList"
                  :key="item.id"
                  :underline="false"
                  class="m-1"
                  @click="toArtist(item.id)"
                >
                  <span class="text-xl">
                    {{ item.artistName }}
                  </span>
                </el-link>
              </template>
            </el-table-column>
            <el-table-column
              v-if="state.table.show.musicCount"
              :label="t('table.musicSize')"
              :show-overflow-tooltip="true"
              width="100"
            >
              <template #default="scope">
                <span
                  class="text-xl"
                  style="color: var(--el-text-color-secondary)"
                >
                  {{ scope.row.albumSize }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              v-if="state.table.show.creatTime"
              prop="createTime"
              label="上传时间"
              :show-overflow-tooltip="true"
            >
              <template #default="scope">
                <span style="color: var(--el-text-color-secondary)">{{
                  dateFormater("YYYY-MM-dd HH:mm:ss", scope.row.createTime)
                }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="demo-pagination-block">
          <el-scrollbar>
            <div class="flex">
              <el-pagination
                background
                :hide-on-single-page="state.search.req.page.total === 0"
                :default-current-page="state.search.req.page.pageIndex"
                :default-page-size="state.search.req.page.pageNum"
                :current-page="state.search.req.page.pageIndex"
                :page-size="state.search.req.page.pageNum"
                :page-sizes="[100, 200, 500, 1000]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="state.search.req.page.total"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </el-scrollbar>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import url("@/style/pagination.scss");
@import url("@/style/table.scss");

.album {
  display: flex;
  flex-direction: column;

  /* 交叉轴上对齐方式为居中 */
  align-items: center;

  /* 主轴上的对齐方式为居中 */
  justify-content: center;
}

.center_album {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.search {
  display: flex;
  justify-content: flex-start;
}

.option {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
}

.menu-button {
  display: inline-block;
  width: 6rem;
  height: 2.5rem;
  margin: 5px;
  font-size: 17px;
  color: #fff;
  text-align: center;
  cursor: pointer;
  background-color: var(--el-color-primary);
  border-radius: var(--el-border-radius-base);
  transition: all 0.5s;
}

.menu-button span {
  position: relative;
  display: inline-block;
  cursor: pointer;
  transition: 0.5s;
}

.menu-button span::after {
  position: absolute;
  top: 0;
  right: -15px;
  content: "↓";
  opacity: 0;
  transition: 0.5s;
}

.menu-button:hover span {
  padding-right: 15px;
}

.menu-button:hover span::after {
  right: 0;
  opacity: 1;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.5s ease-in;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.demo-pagination-block {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.album-table {
  border-radius: 1rem;
}

:deep(.el-table__row td) {
  border: 1px solid transparent;
}

// 输入框样式
:deep(.el-input__wrapper) {
  border-radius: 1rem;
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
  align-items: center;
  justify-content: center;
  height: 3.2rem;
  margin-bottom: 20px;
  background: var(--el-bg-color);
  border: 1px solid rgb(142 142 142 / 20%);
  border-radius: 1rem;
}
</style>
