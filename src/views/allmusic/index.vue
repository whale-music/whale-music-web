<script setup lang="ts">
import { getAllMusicList, MusicSearchReq, getMusicUrl } from "@/api/allmusic";
import DownloadIcon from "./components/download.vue";
import MusicPlay from "./components/music.play.vue";
import { ref, reactive, onMounted } from "vue";
import { message } from "@/utils/message";
import { dateFormater } from "@/utils/dateUtil";

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

const dateTimeRange = ref<[Date, Date]>([
  new Date(2000, 10, 10, 10, 10),
  new Date(2000, 10, 11, 10, 10)
]);

const tableData = ref();
const tableLoading = ref<boolean>();
// const toggleSelection = rows => {
//   if (rows) {
//     rows.forEach(row => {
//       multipleTableRef.value.toggleRowSelection(row, undefined);
//     });
//   } else {
//     multipleTableRef.value.clearSelection();
//   }
// };
const handleSelectionChange = val => {
  multipleSelection.value = val;
};

function getMusicList(param) {
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
  name: "",
  singer: "",
  album: ""
});

const search = reactive<MusicSearchReq>({
  musicName: formInline.name,
  singerName: formInline.singer,
  albumName: formInline.album,
  orderBy: "sort",
  order: false,
  beforeDate: "",
  afterDate: "",
  page: {
    pageIndex: pageConfig.pageIndex,
    pageNum: pageConfig.pageSize
  }
});

// 点击按钮查询
const onSubmit = () => {
  getMusicList(search);
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

// 表格颜色
const cellStyle = ({ columnIndex }) => {
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
          <el-form :inline="true" :model="formInline" class="demo-form-inline">
            <el-form-item label="音乐">
              <el-input
                v-model="formInline.name"
                placeholder="输入音乐名称"
                @keyup.enter="onSubmit"
              />
            </el-form-item>
            <el-form-item label="歌手">
              <el-input
                v-model="formInline.singer"
                placeholder="输入歌手名称"
                @keyup.enter="onSubmit"
              />
            </el-form-item>
            <el-form-item label="专辑">
              <el-input
                v-model="formInline.album"
                placeholder="输入专辑名称"
                @keyup.enter="onSubmit"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="small" @click="onSubmit">
                搜索
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <div class="option">
        <div class="demo-pagination-block">
          <el-pagination
            :default-current-page="pageConfig.pageIndex"
            :default-page-size="pageConfig.pageSize"
            :current-page="pageConfig.pageIndex"
            :page-size="pageConfig.pageSize"
            :page-sizes="[100, 200, 500, 1000]"
            :small="true"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pageConfig.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>

        <div style="display: flex">
          <el-select
            v-model="sortConfig"
            placeholder="排序"
            size="small"
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

          <div>
            <el-date-picker
              v-model="dateTimeRange"
              size="small"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="table">
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
    </div>
  </div>
</template>

<style lang="scss" scoped>
$searchWidth: 90%;
$searchHeight: 90%;

.absolute-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .search {
    width: $searchWidth;
    margin: 0 auto;

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

.option {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>
