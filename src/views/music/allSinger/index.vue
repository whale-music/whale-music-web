<script setup lang="ts">
import { deleteArtist, getSingerPage, SingerRes } from "@/api/singer";
import { ref, reactive, onMounted, watch } from "vue";
import { dateFormater } from "@/utils/dateUtil";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { message } from "@/utils/message";
import ShowLoading from "@/components/ShowLoading/ShowLoading.vue";
import MultipleSelectionIcon from "@/assets/svg/multiple_selection.svg?component";
import RadioIcon from "@/assets/svg/radio.svg?component";
import { storageLocal, useDark } from "@pureadmin/utils";
import { CellStyle, ElTable } from "element-plus";

const { isDark } = useDark();
const router = useRouter();

const { t } = useI18n();
const tableData = ref<SingerRes[]>();
const tableLoading = ref<boolean>(false);
const menuFlag = ref<boolean>(false);

const formInline = reactive({
  artistName: ""
});

const page = reactive({
  pageIndex: 0,
  pageNum: 40,
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

const sortConfig = ref("sort");

const loadingFlag = ref<boolean>(false);
const emptyFlag = ref<boolean>(false);
const getAlbumPageList = () => {
  loadingFlag.value = true;
  getSingerPage({
    artistName: formInline.artistName,
    orderBy: sortConfig.value,
    order: false,
    page: page
  })
    .then(res => {
      page.pageIndex = res.data.current;
      page.pageNum = res.data.size;
      page.total = res.data.total;

      tableData.value = res.data.records;
      loadingFlag.value = false;
    })
    .catch(res => {
      message(`${res}`, { type: "error" });
      loadingFlag.value = false;
      emptyFlag.value = true;
    });
};

const onSubmit = () => {
  getAlbumPageList();
};

// 表格变更时重新查询
const sortOnSubmit = () => {
  onSubmit();
};

onMounted(() => {
  getAlbumPageList();
});

const handleSizeChange = val => {
  page.pageNum = val;
  onSubmit();
};

const handleCurrentChange = val => {
  page.pageIndex = val;
  onSubmit();
};

const switchTableAndRadioFlag = ref<boolean>(
  storageLocal().getItem("switchArtistTableAndRadio")
);
const switchTableAndRadio = val => {
  multipleSelection.value = [];
  storageLocal().setItem("switchArtistTableAndRadio", val);
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
      if (multipleSelection.value.length === page.pageNum) {
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

const toArtist = res => {
  console.log(res);
  router.push({
    path: "/music/artistInfo",
    query: { id: res.id }
  });
};
</script>

<template>
  <div class="singer">
    <div class="operation-panel-bg" v-show="selectFlag">
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
      <div class="option">
        <div class="flex items-center">
          <button @click="menuFlag = !menuFlag" class="menu-button">
            <span>{{ t("input.menuBotton") }}</span>
          </button>
          <div class="search">
            <div class="inputGroup">
              <input
                type="text"
                :required="true"
                autocomplete="off"
                v-model="formInline.artistName"
                @keyup.enter="onSubmit"
              />
              <label for="name">{{ t("input.pleaseEnterSingerName") }}</label>
            </div>

            <Transition name="slide-fade"
              ><div
                class="flex flex-col justify-center m-1"
                v-show="formInline.artistName !== ''"
              >
                <el-button
                  type="primary"
                  round
                  size="large"
                  :loading="tableLoading"
                  @click="onSubmit"
                  >{{ t("buttons.search") }}</el-button
                >
              </div></Transition
            >
          </div>
        </div>

        <div class="flex justify-center items-center flex-wrap">
          <el-switch
            class="mr-4"
            size="large"
            inline-prompt
            :active-icon="MultipleSelectionIcon"
            :inactive-icon="RadioIcon"
            style="
              --el-switch-on-color: var(--el-color-primary);
              --el-switch-off-color: #a55eea;
            "
            v-model="switchTableAndRadioFlag"
            @change="switchTableAndRadio"
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
                background
                :default-current-page="page.pageIndex"
                :default-page-size="page.pageNum"
                :current-page="page.pageIndex"
                :page-size="page.pageNum"
                :page-sizes="[100, 200, 500, 1000]"
                layout="prev, pager, next, total, sizes, jumper"
                :total="page.total"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </div>
        </el-collapse-transition>
      </div>

      <!--加载遮罩-->
      <transition name="el-fade-in">
        <ShowLoading :loading="loadingFlag" />
      </transition>
      <el-empty v-if="!loadingFlag && emptyFlag" description="description" />
      <transition name="el-zoom-in-top" class="table">
        <el-table
          ref="multipleTableRef"
          :data="tableData"
          style="width: 100%"
          :cell-style="cellStyle"
          table-layout="fixed"
          :key="switchTableAndRadioFlag"
          :header-cell-style="tableHeaderCellStyle"
          @selection-change="handleSelectionChange"
          v-show="!loadingFlag && !emptyFlag"
        >
          <el-table-column
            type="selection"
            width="55"
            v-if="switchTableAndRadioFlag"
          />
          <el-table-column type="index" />
          <el-table-column width="110" :show-overflow-tooltip="false">
            <template #default="scope">
              <el-image
                style="width: 5rem; height: 5rem"
                class="rounded shadow-md"
                :src="scope.row.pic"
                fit="cover"
              />
            </template>
          </el-table-column>

          <el-table-column
            :label="t('input.singerName')"
            :show-overflow-tooltip="true"
          >
            <template #default="scope">
              <el-link :underline="false" @click="toArtist(scope.row)"
                ><span class="text-xl">{{
                  scope.row.artistName
                }}</span></el-link
              >
              <span class="font">&emsp;{{ scope.row.aliasName }}</span>
            </template>
          </el-table-column>

          <el-table-column
            :label="t('table.albumSize')"
            :show-overflow-tooltip="true"
            width="100"
          >
            <template #default="scope">
              <span class="text-2xl">{{ scope.row.albumSize }}</span>
            </template>
          </el-table-column>

          <el-table-column
            :label="t('table.musicSize')"
            :show-overflow-tooltip="true"
            width="100"
          >
            <template #default="scope">
              <span class="text-2xl">{{ scope.row.musicSize }}</span>
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
      <div class="demo-pagination-block" v-show="!loadingFlag">
        <el-pagination
          background
          :hide-on-single-page="page.total === 0"
          :default-current-page="page.pageIndex"
          :default-page-size="page.pageNum"
          :current-page="page.pageIndex"
          :page-size="page.pageNum"
          :page-sizes="[100, 200, 500, 1000]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="page.total"
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
@import url("@/style/pagination.scss");
@import url("@/style/element/dialog.scss");

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
  width: $searchWidth;
  margin: 0 auto;
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
  border-radius: 0.3rem;
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
  //width: 15rem;
  height: 3.2rem;
  background: var(--el-bg-color);
  border-radius: 1rem;
  border: 1px solid rgba(142, 142, 142, 0.2);
  margin-bottom: 20px;
}
</style>
