<script setup lang="ts">
const tableData = [
  {
    uploadDate: "2016-05-03",
    albumName: "Tom",
    singerName: "No. 189, Grove St, Los Angeles"
  },
  {
    uploadDate: "2016-05-03",
    albumName: "Tom",
    singerName: "No. 189, Grove St, Los Angeles"
  },
  {
    uploadDate: "2016-05-03",
    albumName: "Tom",
    singerName: "No. 189, Grove St, Los Angeles"
  },
  {
    uploadDate: "2016-05-03",
    albumName: "Tom",
    singerName: "No. 189, Grove St, Los Angeles"
  },
  {
    uploadDate: "2016-05-03",
    albumName: "Tom",
    singerName: "No. 189, Grove St, Los Angeles"
  }
];
</script>

<template>
  <div>
    <el-table :data="tableData" style="width: 100%">
      <el-table-column type="index" width="50" />
      <el-table-column
        prop="albumName"
        label="专辑名"
        width="180"
        show-overflow-tooltip
      />
      <el-table-column
        prop="singerName"
        label="歌手"
        width="180"
        show-overflow-tooltip
      />
      <el-table-column
        prop="uploadDate"
        label="上传时间"
        show-overflow-tooltip
      />
    </el-table>
  </div>
</template>

<style scoped></style>
