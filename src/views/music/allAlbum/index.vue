<script setup lang="ts">
import { getAlbumPage } from "@/api/album";
import { ref, reactive, onMounted } from "vue";
import { dateFormater } from "@/utils/dateUtil";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
const router = useRouter();

const { t } = useI18n();
const tableData = ref();
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
const getAlbumPageList = () => {
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
  }).then(res => {
    pageConfig.pageIndex = res.data.current;
    pageConfig.pageNum = res.data.size;
    pageConfig.total = res.data.total;

    tableData.value = res.data.records;
  });
};

const onSubmit = () => {
  console.log("submit!");
  getAlbumPageList();
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

const toAlbum = res => {
  router.push({
    path: "/music/albumInfo",
    query: { id: res.id }
  });
};
</script>

<template>
  <div class="album">
    <div class="center_album">
      <div class="search">
        <div class="m-1">
          <div class="inputGroup">
            <input
              type="text"
              required="true"
              autocomplete="off"
              v-model="formInline.albumName"
              @keyup.enter="onSubmit"
            />
            <label for="name">{{ t("input.pleaseEnterAlbumName") }}</label>
          </div>
        </div>
        <div class="m-1">
          <div class="inputGroup">
            <input
              type="text"
              required="true"
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
            v-show="formInline.albumName !== '' || formInline.artistName !== ''"
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

      <div class="option">
        <div @click="() => (menuFlag = !menuFlag)">
          <button class="menu-button">
            <span>{{ t("input.menuBotton") }}</span>
          </button>
        </div>

        <div>
          <el-select
            v-model="sortConfig"
            placeholder="排序"
            size="large"
            style="width: 8rem"
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
          </el-collapse-transition>
        </div>

        <el-table :data="tableData" style="width: 100%" table-layout="fixed">
          <el-table-column type="index" />
          <el-table-column width="100" show-overflow-tooltip>
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
            :label="t('input.albumName')"
            show-overflow-tooltip
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
            prop="albumSize"
            :label="t('table.musicSize')"
            show-overflow-tooltip
            width="100"
          />
          <el-table-column
            prop="singer.singerName"
            :label="t('input.singerName')"
            show-overflow-tooltip
          >
            <template #default="scope">
              <el-tag
                disable-transitions
                v-for="item in scope.row.singer"
                :key="item.id"
                class="m-1"
                >{{ item.singerName }}</el-tag
              >
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

        <div class="demo-pagination-block">
          <el-pagination
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

.album {
  margin: 0;
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
  overflow-x: scroll;

  display: flex;
  flex-direction: column;
}

.search {
  display: flex;
  justify-content: center;
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
  transform: translateY(-50%) scale(0.9);
  margin: 0em;
  margin-left: 1.3em;
  padding: 0.4em;
  background-color: #f0f2f3;
}

.inputGroup :is(input:focus, input:valid) {
  border-color: rgb(150, 150, 200);
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
</style>
