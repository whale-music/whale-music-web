<script setup lang="ts">
import ListCheckFill from "@iconify-icons/mingcute/list-check-fill";
import MenuFill from "@iconify-icons/mingcute/menu-fill";
import { storageLocal, useDark } from "@pureadmin/utils";
import { CellStyle, ElTable } from "element-plus";
import { onMounted, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import {
  deleteArtist,
  getSingerPage,
  SingerReq,
  SingerRes
} from "@/api/singer";
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

const state = reactive<{
  search: {
    req: SingerReq;
    searchType: string;
    typeData: {
      value: string;
      label: string;
    }[];
  };
  table: {
    intiLoading: boolean;
    loading: boolean;
    optionSwitch: Array<OptionsType>;
    optionSwitchValue: boolean;
    show: {
      creatTime: boolean;
      musicCount: boolean;
      albumCount: boolean;
    };
  };
}>({
  search: {
    req: undefined,
    searchType: "artist",
    typeData: undefined
  },
  table: {
    intiLoading: false,
    loading: false,
    optionSwitch: undefined,
    optionSwitchValue: false,
    show: {
      creatTime: false,
      musicCount: false,
      albumCount: false
    }
  }
});

state.search.req = {
  artistName: "",
  orderBy: "sort",
  order: false,
  page: {
    pageIndex: 0,
    pageNum: 5,
    total: 0
  }
};

// 监听容器
emitter.on("resize", ({ detail }) => {
  const { width } = detail;
  reDrawLayout(width);
});

function reDrawLayout(width: number) {
  if (width < 720) {
    state.table.show.creatTime = false;
    state.table.show.musicCount = false;
    state.table.show.albumCount = false;
  } else {
    state.table.show.creatTime = true;
    state.table.show.musicCount = true;
    state.table.show.albumCount = true;
  }
}

const tableData = ref<SingerRes[]>();
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

state.search.typeData = [
  {
    value: "artist",
    label: "歌手"
  }
];

const onChangeOptionSwitch = ({ option }) => {
  const { value } = option;
  state.table.optionSwitchValue = value === "multiple";
  multipleSelection.value = [];
  storageLocal().setItem(
    "switchArtistTableAndRadio",
    state.table.optionSwitchValue
  );
};

const getAlbumPageList = async () => {
  state.table.loading = true;
  try {
    const res = await getSingerPage(state.search.req);
    state.search.req.page.pageIndex = res.data.current;
    state.search.req.page.pageNum = res.data.size;
    state.search.req.page.total = res.data.total;

    tableData.value = res.data.records;
    state.table.loading = false;
  } catch (e) {
    message(`${e}`, { type: "error" });
    state.table.loading = false;
    state.search.req.page.total = 0;
  }
};

const onSubmit = () => {
  getAlbumPageList();
};

// 表格变更时重新查询
const sortOnSubmit = () => {
  onSubmit();
};

onMounted(async () => {
  state.table.intiLoading = true;
  await getAlbumPageList();
  state.table.intiLoading = false;

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
    const res = await deleteArtist(id);
    if (res.code === "200") {
      if (multipleSelection.value.length === state.search.req.page.pageNum) {
        await onSubmit();
        return;
      }
      for (const valueElement of multipleSelection.value) {
        tableData.value = tableData.value.filter(
          value => value.id !== valueElement.id
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

const toArtist = res => {
  console.log(res);
  router.push({
    name: "ArtistInfo",
    query: { id: res.id }
  });
};
</script>

<template>
  <div class="singer">
    <div v-show="selectFlag" class="operation-panel-bg">
      <div class="operation-panel">
        <el-dialog
          v-model="deleteMusicFlag"
          width="30%"
          title="确认需要删除吗?"
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
            @click="deleteMusicFlag = true"
          />
        </div>
      </div>
    </div>

    <div class="center-singer">
      <!--搜索框-->
      <name-search
        v-model="state.search.req.artistName"
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
            state.search.req.artistName = '';
            state.search.req.page.pageIndex = 1;
            onSubmit();
          }
        "
      />

      <div class="option">
        <div class="flex items-center">
          <button class="menu-button" @click="menuFlag = !menuFlag">
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
            <div class="flex justify-center p-4" />
          </div>
        </el-collapse-transition>
      </div>

      <!--加载遮罩-->
      <transition name="el-fade-in">
        <ShowLoading :loading="state.table.intiLoading" />
      </transition>
      <el-empty
        v-if="!state.table.loading && state.search.req.page.total === 0"
        description="这里没有歌手，请在主页添加歌手"
      />
      <el-table
        v-show="state.search.req.page.total !== 0 && !state.table.intiLoading"
        ref="multipleTableRef"
        :key="state.table.optionSwitchValue"
        v-loading="state.table.loading"
        :data="tableData"
        style="width: 100%"
        :cell-style="cellStyle"
        table-layout="fixed"
        :header-cell-style="tableHeaderCellStyle"
        class="rounded-2xl"
        @selection-change="handleSelectionChange"
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
              radius="9999px"
              :shadow="false"
            />
          </template>
        </el-table-column>

        <el-table-column
          :label="t('input.singerName')"
          :show-overflow-tooltip="true"
        >
          <template #default="scope">
            <el-link :underline="false" @click="toArtist(scope.row)">
              <span class="text-xl">
                {{ scope.row.artistName }}
              </span>
            </el-link>
            <span class="font">&emsp;{{ scope.row.aliasName }}</span>
          </template>
        </el-table-column>

        <el-table-column
          v-if="state.table.show.albumCount"
          :label="t('table.albumSize')"
          :show-overflow-tooltip="true"
          width="100"
        >
          <template #default="scope">
            <span class="text-xl" style="color: var(--el-text-color-secondary)">
              {{ scope.row.albumSize }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          v-if="state.table.show.musicCount"
          :label="t('table.musicSize')"
          :show-overflow-tooltip="true"
          width="100"
        >
          <template #default="scope">
            <span class="text-xl" style="color: var(--el-text-color-secondary)">
              {{ scope.row.musicSize }}
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
      <div class="demo-pagination-block">
        <el-scrollbar>
          <el-pagination
            background
            :hide-on-single-page="state.search.req.page.total === 0"
            :default-current-page="state.search.req.page.pageIndex"
            :default-page-size="state.search.req.page.pageNum"
            :current-page="state.search.req.page.pageIndex"
            :page-size="state.search.req.page.pageNum"
            :page-sizes="[5, 10, 100, 200, 500, 1000]"
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
@import url("@/style/table.scss");

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
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
  margin: 0 auto;
}

.table {
  display: flex;
  flex-direction: column;
  border-radius: 1rem;
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

.inputGroup {
  position: relative;
  max-width: 20rem;
  margin: 10px;
  font-family: "Segoe UI", sans-serif;
}

.inputGroup input {
  width: 100%;
  padding: 0.8em;
  font-size: 100%;
  background-color: transparent;
  border: 2px solid rgb(200 200 200);
  border-radius: 1rem;
  outline: none;
}

.inputGroup label {
  position: absolute;
  left: 0;
  padding: 0.8em;
  margin-left: 0.5em;
  font-size: 100%;
  color: rgb(100 100 100);
  pointer-events: none;
  transition: all 0.3s ease;
}

.inputGroup :is(input:focus, input:valid) ~ label {
  @apply dark:bg-[#000000];

  padding: 0.4em;
  margin: 0 0 0 1.3em;
  background-color: #f0f2f3;
  transform: translateY(-50%) scale(0.9);
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
  opacity: 0;
  transform: translateX(20px);
}

.demo-pagination-block {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
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
  bottom: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  //width: 15rem;
  height: 3.2rem;
  margin-bottom: 20px;
  background: var(--el-bg-color);
  border: 1px solid rgb(142 142 142 / 20%);
  border-radius: 1rem;
}
</style>
