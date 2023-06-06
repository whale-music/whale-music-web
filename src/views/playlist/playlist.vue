<script setup lang="ts">
import { SingerRes } from "@/api/singer";
import { ref, reactive, onMounted, watch } from "vue";
import { dateFormater } from "@/utils/dateUtil";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { message } from "@/utils/message";
import ShowLoading from "@/components/ShowLoading/ShowLoading.vue";
import { storageLocal, useDark } from "@pureadmin/utils";
import { CellStyle, ElTable } from "element-plus";
import {
  createPlayList,
  deletePlayList,
  getPlayListPage,
  PlayInfoReq,
  PlayInfoRes
} from "@/api/playlist";
import NameSearch from "@/components/nameSearch/index.vue";
import { emitter } from "@/utils/mitt";
import MenuFill from "@iconify-icons/mingcute/menu-fill";
import ListCheckFill from "@iconify-icons/mingcute/list-check-fill";
import Segmented, { type OptionsType } from "@/components/ReSegmented";
import { usePermissionStoreHook } from "@/store/modules/permission";
import { initRouter } from "@/router/utils";
import { useDialog } from "@/layout/hooks/useDialog";

const { widthRef } = useDialog();
const { isDark } = useDark();
const router = useRouter();

const { t } = useI18n();

// 监听容器
emitter.on("resize", ({ detail }) => {
  const { width } = detail;
  reDrawLayout(width);
});

function reDrawLayout(width: number) {
  if (width < 720) {
    state.table.show.sort = false;
  } else {
    state.table.show.sort = true;
  }
}

const state = reactive<{
  creatPlay: {
    name: string;
  };
  dialog: {
    creatPlayList: boolean;
  };
  search: {
    req: PlayInfoReq;
    res: PlayInfoRes[];
    name: string;
    searchType: string;
    typeData: {
      value: string;
      label: string;
    }[];
  };
  config: {
    playListType: Map<number, string>;
    playListTypeTag: Map<
      number,
      "success" | "info" | "warning" | "danger" | ""
    >;
  };
  table: {
    initLoading: boolean;
    show: {
      sort: boolean;
      filter: boolean;
    };
    optionSwitch: Array<OptionsType>;
  };
}>({
  creatPlay: {
    name: ""
  },
  dialog: {
    creatPlayList: false
  },
  search: {
    req: undefined,
    res: undefined,
    name: "",
    searchType: "playList",
    typeData: undefined
  },
  config: {
    playListType: undefined,
    playListTypeTag: undefined
  },
  table: {
    initLoading: false,
    optionSwitch: undefined,
    show: {
      sort: false,
      filter: false
    }
  }
});

state.search.req = {
  picId: undefined,
  count: 0,
  createTime: "",
  description: null,
  id: null,
  picUrl: "",
  playListName: state.search.name,
  sort: null,
  subscribed: false,
  type: -1,
  updateTime: "",
  userId: null,
  page: {
    pageIndex: 0,
    pageNum: 5,
    total: 0
  }
};

state.search.typeData = [
  {
    value: "playList",
    label: "歌单"
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

const menuFlag = ref<boolean>(false);

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

// 排序
const typeSortData = reactive([
  {
    value: -1,
    label: "全部歌单"
  },
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
]);

state.config.playListType = new Map([
  [0, "普通歌单"],
  [1, "喜爱歌单"],
  [2, "推荐歌单"]
]);

state.config.playListTypeTag = new Map([
  [0, ""],
  [1, "danger"],
  [2, "success"]
]);

const sortConfig = ref("sort");

const loadingFlag = ref<boolean>(false);
const emptyFlag = ref<boolean>(false);

const getAlbumPageList = async () => {
  loadingFlag.value = true;
  try {
    state.search.req.playListName = state.search.name;
    const r = await getPlayListPage(state.search.req);
    if (r.code === "200") {
      state.search.res = r.data.records;
      state.search.req.page.pageIndex = r.data.current;
      state.search.req.page.pageNum = r.data.size;
      state.search.req.page.total = r.data.total;
    } else {
      message(`查询失败: ${r.message}`, { type: "error" });
    }
    loadingFlag.value = false;
    emptyFlag.value = state.search.res.length === 0;
  } catch (e) {
    message(`请求失败: ${e}`, { type: "error" });
    loadingFlag.value = false;
    emptyFlag.value = true;
  }
};

const onSubmit = async () => {
  await getAlbumPageList();
};

// 表格变更时重新查询
const sortOnSubmit = () => {
  onSubmit();
};

onMounted(() => {
  state.table.initLoading = true;
  getAlbumPageList();
  state.table.initLoading = false;

  const width =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;
  reDrawLayout(width);
});

const handleSizeChange = val => {
  state.search.req.page.pageNum = val;
  onSubmit();
};

const handleCurrentChange = val => {
  state.search.req.page.pageIndex = val;
  onSubmit();
};

const onChangeOptionSwitch = ({ option }) => {
  const { value } = option;
  switchTableAndRadioFlag.value = value === "multiple";
  multipleSelection.value = [];
  storageLocal().setItem(
    "switchPlayListTableAndRadio",
    switchTableAndRadioFlag.value
  );
};

const switchTableAndRadioFlag = ref<boolean>(
  storageLocal().getItem("switchPlayListTableAndRadio")
);
const multipleSelection = ref<SingerRes[]>([]);
const selectFlag = ref<boolean>(false);
const multipleTableRef = ref<InstanceType<typeof ElTable>>();

// 监听是否选择歌手
watch(multipleSelection, async newQuestion => {
  selectFlag.value = newQuestion.length > 0;
});
const handleSelectionChange = val => {
  multipleSelection.value = val;
};
const deleteMusicFlag = ref<boolean>(false);
const cancelButton = () => {
  multipleTableRef.value.clearSelection();
};

const deleteButton = async () => {
  const id = [];
  multipleSelection.value.forEach(value => id.push(value.id));
  try {
    const res = await deletePlayList(id);
    if (res.code === "200") {
      id.forEach(value => usePermissionStoreHook().removeMenusRouter(value));
      if (multipleSelection.value.length === state.search.req.page.pageNum) {
        await onSubmit();
        return;
      }
      for (const valueElement of multipleSelection.value) {
        state.search.res = state.search.res.filter(
          value => value.id.toString() !== valueElement.id.toString()
        );
      }
      message("删除成功", { type: "success" });
    } else {
      message(`删除失败:${res.message}`, { type: "error" });
    }
  } catch (e) {
    message(`删除失败:${e}`, { type: "error" });
  }
};

const createPlayListButton = () => {
  if (state.creatPlay.name !== "") {
    createPlayList(state.creatPlay.name)
      .then(res => {
        state.dialog.creatPlayList = false;
        if (res.code === "200") {
          message("创建成功", { type: "success" });
          initRouter().then(() => router.push(String(res.data.id)));
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
  if (columnIndex === 1 && switchTableAndRadioFlag.value) {
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

const toPlayList = id => {
  router.push({
    path: `/playlist/${id}`
  });
};
</script>

<template>
  <div class="singer">
    <!--新建歌单-->
    <el-dialog
      v-model="state.dialog.creatPlayList"
      :width="widthRef"
      align-center
    >
      <h1 class="text-center">新建歌单</h1>
      <el-input
        v-model="state.creatPlay.name"
        placeholder="输入新建歌单名"
        @keydown.enter="createPlayListButton"
      />
      <template #footer>
        <span class="flex justify-center">
          <el-button type="primary" @click="createPlayListButton">
            添加
          </el-button>
        </span>
      </template>
    </el-dialog>

    <div class="operation-panel-bg" v-show="selectFlag">
      <div class="operation-panel">
        <el-dialog
          v-model="deleteMusicFlag"
          width="30%"
          title="确认需要删除吗?"
          :append-to-body="true"
        >
          <span> 该操作只会删除歌手数据 </span>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="deleteMusicFlag = false">否</el-button>
              <el-button
                type="danger"
                @click="
                  deleteMusicFlag = false;
                  deleteButton();
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
            @click="cancelButton"
            class="cursor-pointer"
            style="color: #636e72"
            icon="solar:close-circle-bold-duotone"
            width="2rem"
            height="2rem"
          />
        </div>
        <div class="flex items-center ml-2 mr-2 rounded">
          <IconifyIconOnline
            @click="deleteMusicFlag = true"
            class="cursor-pointer"
            style="color: #636e72"
            icon="solar:trash-bin-2-outline"
            width="2rem"
            height="2rem"
          />
        </div>
      </div>
    </div>

    <div class="center-singer">
      <!--搜索框-->
      <name-search
        v-model="state.search.name"
        v-model:dropdownValue="state.search.searchType"
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
          <button @click="menuFlag = !menuFlag" class="menu-button">
            <span>{{ t("input.menuBotton") }}</span>
          </button>
        </div>

        <div class="flex justify-center items-center flex-wrap gap-4">
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
            v-if="state.table.show.sort"
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

          <el-select
            v-model="state.search.req.type"
            placeholder="歌单类型"
            size="large"
            style="width: 8rem"
            @change="sortOnSubmit"
          >
            <el-option
              v-for="item in typeSortData"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              suffix-icon="download"
            />
          </el-select>

          <el-button
            v-if="state.table.show.sort"
            type="primary"
            @click="state.dialog.creatPlayList = true"
          >
            新建
          </el-button>
        </div>
      </div>

      <div>
        <el-collapse-transition>
          <div v-show="menuFlag">
            <div class="flex flex-row-reverse p-4 items-center gap-4">
              <el-button
                v-if="!state.table.show.sort"
                type="primary"
                @click="state.dialog.creatPlayList = true"
              >
                新建
              </el-button>
              <el-select
                v-if="!state.table.show.sort"
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
        </el-collapse-transition>
      </div>

      <!--加载遮罩-->
      <transition name="el-fade-in">
        <ShowLoading :loading="state.table.initLoading" />
      </transition>
      <el-empty v-if="!loadingFlag && emptyFlag" description="description" />
      <el-table
        v-loading="loadingFlag"
        ref="multipleTableRef"
        :data="state.search.res"
        style="width: 100%"
        :cell-style="cellStyle"
        table-layout="fixed"
        :key="switchTableAndRadioFlag"
        :header-cell-style="tableHeaderCellStyle"
        @selection-change="handleSelectionChange"
        class="rounded-2xl"
        v-show="!emptyFlag"
      >
        <el-table-column
          type="selection"
          width="55"
          v-if="switchTableAndRadioFlag"
        />
        <el-table-column type="index" />

        <el-table-column
          label="歌单类型"
          :show-overflow-tooltip="true"
          width="100"
        >
          <template #default="scope">
            <el-tag :type="state.config.playListTypeTag.get(scope.row.type)">
              {{ state.config.playListType.get(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column width="110" :show-overflow-tooltip="false">
          <template #default="scope">
            <el-image
              style="width: 5rem; height: 5rem"
              class="rounded shadow-md"
              :src="scope.row.picUrl"
              fit="cover"
            />
          </template>
        </el-table-column>

        <el-table-column label="歌单名" :show-overflow-tooltip="true">
          <template #default="scope">
            <el-link :underline="false" @click="toPlayList(scope.row.id)"
              ><span class="text-xl">{{
                scope.row.playListName
              }}</span></el-link
            >
            <span class="font">&emsp;{{ scope.row.aliasName }}</span>
          </template>
        </el-table-column>

        <el-table-column
          :label="t('table.musicSize')"
          :show-overflow-tooltip="true"
          width="110"
        >
          <template #default="scope">
            <span class="text-2xl">{{ scope.row.count }}首</span>
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
      <div class="demo-pagination-block">
        <el-scrollbar>
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
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import url("@/style/pagination.scss");

.font {
  color: #a3a39cc3;
}

.singer {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.search {
  display: flex;
  justify-content: center;
}

.center-singer {
  width: 100%;
}

.option {
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: nowrap;
  align-items: center;
}

.table {
  display: flex;
  flex-direction: column;
  border-radius: 1rem;
}

.menu-button {
  display: inline-block;
  background-color: var(--el-color-primary);
  border-radius: var(--el-border-radius-base);
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

.inputGroup {
  margin: 10px;
  font-family: "Segoe UI", sans-serif;
  max-width: 20rem;
  position: relative;
}

.inputGroup input {
  font-size: 100%;
  padding: 0.8em;
  outline: none;
  border: 2px solid rgb(200, 200, 200);
  background-color: transparent;
  border-radius: 1rem;
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
  @apply dark:bg-[#000000];
  transform: translateY(-50%) scale(0.9);
  margin: 0 0 0 1.3em;
  padding: 0.4em;
  background-color: #f0f2f3;
}

.inputGroup :is(input:focus, input:valid) {
  border-color: var(--el-color-primary-light-3);
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

.demo-pagination-block {
  margin: 2rem;
  display: flex;
  justify-content: center;
}

:deep(.el-table__row td) {
  border: 1px solid transparent;
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
</style>
