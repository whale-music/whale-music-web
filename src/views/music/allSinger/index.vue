<script setup lang="ts">
import { getSingerPage, SingerRes } from "@/api/singer";
import { ref, reactive, onMounted } from "vue";
import { dateFormater } from "@/utils/dateUtil";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { message } from "@/utils/message";
import ShowLoading from "@/components/ShowLoading/ShowLoading.vue";

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
    <div class="center-singer">
      <div class="search">
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
        </el-collapse-transition>
      </div>

      <!--加载遮罩-->
      <transition name="el-fade-in">
        <ShowLoading :loading="loadingFlag" />
      </transition>
      <el-empty v-if="!loadingFlag && emptyFlag" description="description" />
      <transition name="el-zoom-in-top">
        <div class="table" v-show="!loadingFlag && !emptyFlag">
          <el-table :data="tableData" style="width: 100%" table-layout="fixed">
            <el-table-column type="index" />
            <el-table-column width="100" :show-overflow-tooltip="false">
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
              prop="singerName"
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

          <div class="demo-pagination-block" v-show="!loadingFlag">
            <el-pagination
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
      </transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$searchWidth: 90%;
$searchHeight: 90%;

.font {
  color: #a3a39cc3;
}

.singer {
  margin: 0;

  display: flex;
  flex-direction: column;
  justify-content: center;
  // align-items: center;

  .search {
    display: flex;
    justify-content: center;
  }
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

:deep(.el-table__row td) {
  border: 1px solid transparent;
}
</style>
