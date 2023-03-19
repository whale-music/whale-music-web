<script lang="ts" setup>
import { getPlayListById } from "@/api/playlist";
import { getMusicUrl } from "@/api/music";
import { useRoute } from "vue-router"; //1.先在需要跳转的页面引入useRouter
import { ref, reactive, onMounted } from "vue";
import { dateFormater } from "@/utils/dateUtil";
import { message } from "@/utils/message";
import { CellStyle } from "element-plus/es";

const router = useRoute(); //2.在跳转页面定义router变量，解构得到指定的query和params传参的参数
console.log(router.name);

const tableData = ref();
const tableLoading = ref<boolean>();
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

const getPlay = (id: string) => {
  getPlayListById(id)
    .then(res => {
      console.log(res);
      if (res.code === "200") {
        tableData.value = res.data;
      } else {
        message(res.message, { type: "error" });
      }
    })
    .catch(res => {
      tableLoading.value = false;
      message(res, { type: "error" });
    });
};

// 点击按钮查询
const onSubmit = () => {
  getPlay(router.name.toString());
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
</script>
<template>
  <div>
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

      <el-table-column fixed label="名称" show-overflow-tooltip width="450">
        <template #default="scope">
          <span class="font-sans subpixel-antialiased">{{
            scope.row.musicName
          }}</span>
          <span class="font">&emsp;{{ scope.row.aliaName }}</span>
        </template>
      </el-table-column>

      <el-table-column label="歌手" show-overflow-tooltip>
        <template #default="scope">
          <el-tag
            disable-transitions
            v-for="item in scope.row.singers"
            :key="item.id"
            >{{ item.singerName }}</el-tag
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
      <el-table-column prop="createTime" label="上传时间" show-overflow-tooltip>
        <template #default="scope">
          <span>{{
            dateFormater("YYYY-MM-dd HH:mm:ss", scope.row.createTime)
          }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<style scoped></style>
