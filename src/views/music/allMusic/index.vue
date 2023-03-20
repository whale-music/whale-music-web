<script setup lang="ts">
import { getAllMusicList, getMusicUrl } from "@/api/music";
import { MusicSearchReq } from "@/api/common";
import DownloadIcon from "./components/download.vue";
import MusicPlay from "./components/music.play.vue";
import { ref, reactive, onMounted } from "vue";
import { message } from "@/utils/message";
import { dateFormater } from "@/utils/dateUtil";
import { CellStyle } from "element-plus/es";

const multipleTableRef = ref();
const multipleSelection = ref([]);

// 每页显示行数
const pageConfig = reactive({
  pageSize: 100,
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
  singerName: "",
  albumName: ""
});

// 点击按钮查询
const onSubmit = () => {
  getMusicList({
    musicName: formInline.musicName,
    singerName: formInline.singerName,
    albumName: formInline.albumName,
    orderBy: "sort",
    order: false,
    beforeDate: "",
    afterDate: "",
    page: {
      pageIndex: pageConfig.pageIndex,
      pageNum: pageConfig.pageSize
    }
  });
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
</script>

<template>
  <div class="absolute-container">
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
                  required="true"
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
                  required="true"
                  autocomplete="off"
                  v-model="formInline.singerName"
                  @keyup.enter="onSubmit"
                />
                <label for="name">输入歌手名称</label>
              </div>
            </div>

            <div class="m-1">
              <div class="inputGroup">
                <input
                  type="text"
                  required="true"
                  autocomplete="off"
                  v-model="formInline.albumName"
                  @keyup.enter="onSubmit"
                />
                <label for="name">输入专辑名称</label>
              </div>
            </div>

            <div class="flex flex-col justify-center m-1">
              <el-button
                type="primary"
                round
                size="large"
                :loading="tableLoading"
                @click="onSubmit"
                >Primary</el-button
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="table">
      <div class="option">
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

        <div @click="() => (menuFlag = !menuFlag)">
          <button class="btn">
            <span class="icon">
              <svg viewBox="0 0 175 80" width="40" height="40">
                <rect width="80" height="15" fill="#f0f0f0" rx="10" />
                <rect y="30" width="80" height="15" fill="#f0f0f0" rx="10" />
                <rect y="60" width="80" height="15" fill="#f0f0f0" rx="10" />
              </svg>
            </span>
            <span class="text">MENU</span>
          </button>
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

      <el-table
        ref="multipleTableRef"
        :data="tableData"
        v-loading="tableLoading"
        highlight-current-row
        @selection-change="handleSelectionChange"
        :cell-style="cellStyle"
        @row-dblclick="rowDoubleClick"
      >
        <el-table-column fixed type="index" width="50" />

        <el-table-column fixed width="40" show-overflow-tooltip>
          <template #default="scope">
            <DownloadIcon :muiscId="scope.row.id" />
          </template>
        </el-table-column>

        <el-table-column
          fixed
          prop="musicName"
          label="名称"
          show-overflow-tooltip
          width="450"
        >
          <template #default="scope">
            <span class="font-sans subpixel-antialiased">{{
              scope.row.musicName
            }}</span>
            <span class="font">&emsp;{{ scope.row.musicNameAlias }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="singerName" label="歌手" show-overflow-tooltip>
          <template #default="scope">
            <el-tag
              disable-transitions
              v-for="item in scope.row.singerName"
              :key="item"
              >{{ item }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column prop="albumName" label="专辑" show-overflow-tooltip />
        <el-table-column
          prop="timeLength"
          label="歌曲时长"
          width="80"
          show-overflow-tooltip
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
  </div>
</template>

<style lang="scss" scoped>
$searchWidth: 90%;
$searchHeight: 90%;

.absolute-container {
  margin: 0;
  display: flex;
  flex-direction: column;
  /*主轴上的对齐方式为居中*/
  justify-content: center;
  /*交叉轴上对齐方式为居中*/
  // align-items: center;

  .search {
    width: $searchWidth;

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

  .table {
    width: $searchWidth;
    margin: 0 auto;
    overflow-x: scroll;
  }
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
  transform: translateY(-50%) scale(0.9);
  margin: 0em;
  margin-left: 1.3em;
  padding: 0.4em;
  background-color: #f0f2f3;
}

.inputGroup :is(input:focus, input:valid) {
  border-color: rgb(150, 150, 200);
}

.btn {
  width: 10rem;
  height: 2.9rem;
  border-radius: 5px;
  border: none;
  transition: all 0.5s ease-in-out;
  font-size: 20px;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  font-weight: 600;
  display: flex;
  align-items: center;
  background: var(--el-color-primary);
  color: #f5f5f5;
}

.btn:hover {
  box-shadow: 0 0 20px 0px #2e2e2e3a;
}

.btn .icon {
  position: absolute;
  height: 40px;
  width: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.5s;
}

.btn .text {
  transform: translateX(55px);
}

.btn:hover .icon {
  width: 175px;
}

.btn:hover .text {
  transition: all 0.5s;
  opacity: 0;
}

.btn:focus {
  outline: none;
}

.btn:active .icon {
  transform: scale(0.85);
}
</style>
