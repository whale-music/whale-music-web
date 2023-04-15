<script lang="ts" setup>
import { getPlayListById, PlayListRes } from "@/api/playlist";
import { getMusicUrl } from "@/api/music";
import { useRoute, useRouter } from "vue-router"; //1.先在需要跳转的页面引入useRouter
import { ref, reactive, onMounted } from "vue";
import { dateFormater } from "@/utils/dateUtil";
import { message } from "@/utils/message";
import { CellStyle } from "element-plus/es";
import DownloadIcon from "@/components/DownloadIcon/download.vue";
import ShowLoading from "@/components/ShowLoading/ShowLoading.vue";
import { Page } from "@/api/common";
import LoadImg from "@/components/LoadImg/LoadImg.vue";

const route = useRoute(); //2.在跳转页面定义router变量，解构得到指定的query和params传参的参数
const router = useRouter();

const tableData = ref<PlayListRes[]>();
const layoutFlag = ref<boolean>(false);
const emptyFlag = ref<boolean>(false);
const tableLoading = ref<boolean>(true);
const multipleSelection = ref([]);

const handleSelectionChange = val => {
  multipleSelection.value = val;
};

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

const musicPlayConfig = reactive({
  url: "",
  totalTime: 0,
  isPlay: true,
  isDisplay: false
});

const musicName = ref("");
const pageConfig = ref<Page>({
  pageIndex: 0,
  pageNum: 10,
  total: 0
});
const getPlay = (id: string) => {
  tableLoading.value = true;
  getPlayListById(id, {
    afterDate: "",
    albumName: "",
    beforeDate: "",
    musicIds: [],
    musicName: musicName.value,
    order: false,
    orderBy: "",
    page: pageConfig.value,
    artistName: ""
  })
    .then(res => {
      tableLoading.value = false;
      if (res.code === "200") {
        tableData.value = res.data.records;
        emptyFlag.value =
          res.data.records == null || res.data.records.length === 0;
        pageConfig.value.pageIndex = res.data.current;
        pageConfig.value.pageNum = res.data.size;
        pageConfig.value.total = res.data.total;
      } else {
        tableData.value = null;
        emptyFlag.value = true;
        message(res.message, { type: "error" });
      }
    })
    .catch(res => {
      tableLoading.value = true;
      message(res, { type: "error" });
    });
};

// 点击按钮查询
const onSubmit = () => {
  getPlay(route.name.toString());
};

// 生命周期挂载
onMounted(() => {
  // 查询表格
  onSubmit();
});

// 播放音乐
const rowDoubleClick = (data: any) => {
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

const handleSizeChange = val => {
  pageConfig.value.pageNum = val;
  onSubmit();
};

const handleCurrentChange = val => {
  pageConfig.value.pageIndex = val;
  onSubmit();
};

const toMusicInfo = id => {
  router.push({
    path: "/music/musicInfo",
    query: { id: id }
  });
};

const toAlbum = id => {
  router.push({
    path: "/music/albumInfo",
    query: { id: id }
  });
};
</script>
<template>
  <div>
    <ShowLoading :loading="tableLoading" />
    <el-empty description="description" v-if="emptyFlag" />
    <div v-if="!tableLoading && !emptyFlag">
      <el-table
        v-if="layoutFlag"
        class="table-data"
        :data="tableData"
        highlight-current-row
        @selection-change="handleSelectionChange"
        :cell-style="cellStyle"
        @row-dblclick="rowDoubleClick"
      >
        <el-table-column fixed type="index" width="60" />

        <el-table-column fixed width="40" show-overflow-tooltip>
          <template #default="scope">
            <DownloadIcon :muiscId="scope.row.id" />
          </template>
        </el-table-column>

        <el-table-column fixed label="名称" show-overflow-tooltip width="450">
          <template #default="scope">
            <span class="font-sans subpixel-antialiased">{{
              scope.row.musicName
            }}</span>
            <span class="font">&emsp;{{ scope.row.aliasName }}</span>
          </template>
        </el-table-column>

        <el-table-column label="歌手" show-overflow-tooltip>
          <template #default="scope">
            <el-tag
              disable-transitions
              v-for="item in scope.row.artists"
              :key="item.id"
              >{{ item.artistName }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column label="专辑" show-overflow-tooltip>
          <template #default="scope">
            <el-tag>
              {{ scope.row.album.albumName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="歌曲时长" width="80" show-overflow-tooltip>
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
      <div v-else class="list-grid">
        <div v-for="(item, index) in tableData" :key="index">
          <LoadImg
            class="cursor-pointer"
            :src="item.pic"
            width="10rem"
            height="10rem"
            @click="toMusicInfo(item.id)"
          />
          <p
            class="cursor-pointer truncate hover:underline"
            @click="toMusicInfo(item.id)"
          >
            {{ item.musicName }}
          </p>
          <el-link :underline="false" @click="toAlbum(item.album.id)">
            <p class="text-ellipsis overflow-hidden font-bold text-sm">
              {{ item.album.albumName }}
            </p>
          </el-link>
        </div>
      </div>
    </div>
    <div class="option" v-show="!tableLoading">
      <el-switch
        v-model="layoutFlag"
        size="large"
        inline-prompt
        active-text="list"
        inactive-text="grid"
        style="
          --el-switch-on-color: var(--el-color-primary);
          --el-switch-off-color: #a55eea;
        "
      />
      <el-pagination
        :hide-on-single-page="pageConfig.pageNum === 0"
        background
        :default-current-page="pageConfig.pageIndex"
        :default-page-size="pageConfig.pageNum"
        :current-page="pageConfig.pageIndex"
        :page-size="pageConfig.pageNum"
        layout="prev, pager, next, jumper"
        :total="pageConfig.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>
<style scoped>
.font {
  color: #a3a39cc3;
}

.table-data {
  border-radius: 1rem;
}

:deep(.el-pager li) {
  border-radius: 6px;
}

:deep(.is-active) {
  background-color: var(--el-color-primary-light-7) !important;
  color: var(--el-color-primary) !important;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 !important;
}

.list-grid {
  display: grid;
  /*  声明列的宽度  */
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  /*  声明行间距和列间距  */
  grid-gap: 25px;
}

.option {
  display: flex;
  justify-content: space-between;
}
</style>
