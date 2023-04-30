<script setup lang="ts">
import { AlbumRes, deleteAlbum, getAlbumPage } from "@/api/album";
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
const tableData = ref<AlbumRes[]>();
const tableLoading = ref<boolean>();

const menuFlag = ref<boolean>();

const formInline = reactive({
  albumName: "",
  artistName: ""
});

const sortConfig = ref("sort");

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

// 每页显示行数
const pageConfig = reactive({
  pageNum: 40,
  pageIndex: 1,
  total: 0
});

const loadingFlag = ref<boolean>(false);
const emptyFlag = ref<boolean>(false);
const getAlbumPageList = () => {
  loadingFlag.value = true;
  getAlbumPage({
    singerName: formInline.artistName,
    albumName: formInline.albumName,
    orderBy: "",
    order: false,
    timeBy: false,
    beforeTime: "",
    laterTime: "",
    page: pageConfig,
    description: "",
    pic: "",
    updateTime: "",
    createTime: ""
  })
    .then(res => {
      pageConfig.pageIndex = res.data.current;
      pageConfig.pageNum = res.data.size;
      pageConfig.total = res.data.total;

      tableData.value = res.data.records;
      loadingFlag.value = false;
    })
    .catch(res => {
      loadingFlag.value = false;
      emptyFlag.value = true;
      message(`${res}`, { type: "error" });
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
  pageConfig.pageNum = val;
  onSubmit();
};

const handleCurrentChange = val => {
  pageConfig.pageIndex = val;
  onSubmit();
};

const multipleTableRef = ref<InstanceType<typeof ElTable>>();

const switchTableAndRadioFlag = ref<boolean>(
  storageLocal().getItem("switchAlbumTableAndRadio")
);

const switchTableAndRadio = val => {
  storageLocal().setItem("switchAlbumTableAndRadio", val);
};

const deleteMusicFlag = ref<boolean>(false);
const deleteCompelMusicFlag = ref<boolean>(false);

const deleteButton = () => {
  deleteAlbumList(false);
};
const deleteCompelButton = () => {
  console.log("deleteCompelButton");
  deleteAlbumList(true);
};

const multipleSelection = ref<AlbumRes[]>();
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
      if (multipleSelection.value.length === pageConfig.pageNum) {
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
      message(`删除失败: ${res.message}`, { type: "error" });
    }
  } catch (e) {
    message(`请求失败: ${e}`, { type: "error" });
  }
};

// 复选框
const rowClick = row => {
  // 多选时不进入详情页面
  if (switchTableAndRadioFlag.value) {
    multipleTableRef.value.toggleRowSelection(row, null);
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

const toAlbum = res => {
  router.push({
    path: "/music/albumInfo",
    query: { id: res.id }
  });
};

const toArtist = id => {
  console.log(id);
  router.push({
    path: "/music/artistInfo",
    query: { id: id }
  });
};
</script>

<template>
  <div class="album">
    <div class="operation-panel-bg" v-show="selectFlag">
      <div class="operation-panel">
        <el-dialog
          v-model="deleteMusicFlag"
          width="30%"
          title="确认需要删除吗?"
        >
          <b
            >该删除会删除<b class="text-rose-800">专辑</b>本身，如果有关联<b
              class="text-rose-800"
              >歌曲</b
            >会删除失败</b
          >
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="deleteMusicFlag = false">否</el-button>
              <el-button
                type="primary"
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

        <el-dialog
          v-model="deleteCompelMusicFlag"
          width="30%"
          title="确认需要删除吗?"
        >
          <b
            >该操作会删除<b class="text-rose-800">歌曲</b>和<b
              class="text-rose-800"
              >歌单</b
            >关联的音乐，并不会删除歌手专辑</b
          >
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="deleteCompelMusicFlag = false">否</el-button>
              <el-button
                type="danger"
                @click="
                  deleteCompelMusicFlag = false;
                  deleteCompelButton();
                "
              >
                是
              </el-button>
            </span>
          </template>
        </el-dialog>
        <div class="flex items-center ml-2 mr-2 rounded">
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
        <div class="flex items-center ml-2 mr-2 rounded">
          <IconifyIconOnline
            @click="deleteCompelMusicFlag = true"
            class="cursor-pointer"
            style="color: #d63031"
            icon="solar:trash-bin-minimalistic-2-bold-duotone"
            width="2rem"
            height="2rem"
          />
        </div>
      </div>
    </div>

    <div class="center_album">
      <div class="option">
        <div class="flex items-center">
          <button @click="menuFlag = !menuFlag" class="menu-button">
            <span>{{ t("input.menuBotton") }}</span>
          </button>
          <div class="search">
            <div>
              <div class="inputGroup">
                <input
                  type="text"
                  :required="true"
                  autocomplete="off"
                  v-model="formInline.albumName"
                  @keyup.enter="onSubmit"
                />
                <label for="name">{{ t("input.pleaseEnterAlbumName") }}</label>
              </div>
            </div>
            <div>
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
            </div>
            <Transition name="slide-fade"
              ><div
                class="flex flex-col justify-center m-1"
                v-show="
                  formInline.albumName !== '' || formInline.artistName !== ''
                "
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

      <div class="table">
        <div>
          <el-collapse-transition>
            <div v-show="menuFlag">
              <div class="flex justify-center p-4">
                <el-pagination
                  background
                  :default-current-page="pageConfig.pageIndex"
                  :default-page-size="pageConfig.pageNum"
                  :current-page="pageConfig.pageIndex"
                  :page-size="pageConfig.pageNum"
                  :page-sizes="[100, 200, 500, 1000]"
                  layout="prev, pager, next, total, sizes, jumper"
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
          <ShowLoading :loading="loadingFlag" />
        </transition>
        <el-empty v-if="!loadingFlag && emptyFlag" description="description" />
        <transition name="el-zoom-in-top">
          <el-table
            ref="multipleTableRef"
            :data="tableData"
            class="album-table"
            style="width: 100%"
            table-layout="fixed"
            :key="switchTableAndRadioFlag"
            v-show="!loadingFlag && !emptyFlag"
            @selection-change="handleSelectionChange"
            :header-cell-style="tableHeaderCellStyle"
            @row-click="rowClick"
            :cell-style="cellStyle"
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
                  class="rounded"
                  :src="scope.row.pic"
                  fit="cover"
                />
              </template>
            </el-table-column>
            <el-table-column
              :label="t('input.albumName')"
              :show-overflow-tooltip="true"
              width="500"
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
              :label="t('table.musicSize')"
              :show-overflow-tooltip="true"
              width="100"
            >
              <template #default="scope">
                <span class="text-2xl">{{ scope.row.albumSize }}</span>
              </template>
            </el-table-column>
            <el-table-column
              :label="t('input.singerName')"
              :show-overflow-tooltip="true"
            >
              <template #default="scope">
                <el-link
                  @click="toArtist(item.id)"
                  :underline="false"
                  v-for="item in scope.row.artistList"
                  :key="item.id"
                  class="m-1"
                  ><span class="text-xl font-bold">{{
                    item.artistName
                  }}</span></el-link
                >
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
            :default-current-page="pageConfig.pageIndex"
            :default-page-size="pageConfig.pageNum"
            :current-page="pageConfig.pageIndex"
            :page-size="pageConfig.pageNum"
            :page-sizes="[100, 200, 500, 1000]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pageConfig.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
$searchWidth: 90%;
$searchHeight: 90%;
@import url("@/style/pagination.scss");
@import url("@/style/element/dialog.scss");

.album {
  display: flex;
  flex-direction: column;
  /*主轴上的对齐方式为居中*/
  justify-content: center;
  /*交叉轴上对齐方式为居中*/
  align-items: center;
}

.center_album {
  width: $searchWidth;
  margin: 0 auto;
  overflow: hidden;

  display: flex;
  flex-direction: column;
}

.search {
  display: flex;
  justify-content: flex-start;
}

.option {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: nowrap;
  align-items: center;
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

.slide-fade-enter-active,
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
  display: flex;
  z-index: 200;
  bottom: 0;
  justify-content: center;
  align-items: center;
  width: 15rem;
  height: 3.2rem;
  background: var(--el-bg-color);
  border-radius: 1rem;
  border: 1px solid rgba(142, 142, 142, 0.2);
  margin-bottom: 20px;
}
</style>
