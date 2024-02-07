<script setup lang="ts">
import { PureTable } from "@pureadmin/table";
import { onMounted, ref } from "vue";

import { getUsersUpload, UsersUploadRes } from "@/api/hone";

defineOptions({
  name: "MusicUpload"
});

function tableRef() {
  const columns: TableColumnList = [
    {
      label: "#",
      slot: "avatar"
    },
    {
      label: "姓名",
      slot: "name"
    },
    {
      label: "音乐",
      prop: "musicCount"
    },
    {
      label: "专辑",
      prop: "albumCount"
    },
    {
      label: "艺术家",
      prop: "artistCount"
    },
    {
      label: "歌单",
      prop: "playlistCount"
    }
  ];

  const tableData = ref<UsersUploadRes[]>();

  async function getUsersUploadHttp() {
    tableData.value = (await getUsersUpload()).data;
  }

  return {
    columns,
    tableData,
    getUsersUploadHttp
  };
}

const { tableData, columns, getUsersUploadHttp } = tableRef();

onMounted(() => {
  getUsersUploadHttp();
});
</script>

<template>
  <ElButton class="view-all" type="primary" link>查看全部</ElButton>
  <PureTable :data="tableData" :columns="columns" class="rounded-2xl">
    <template #name="{ row }">
      <span v-html="row.username" />
    </template>
    <template #avatar="{ row }">
      <div v-html="row.avatarUrl" />
    </template>
  </PureTable>
</template>

<style scoped lang="scss">
.view-all {
  position: absolute;
  right: 24px;
  top: 14px;
  z-index: 10;
}

:deep(.el-table) {
  --el-table-border: none;
  --el-table-border-color: transparent;

  .el-empty__description {
    margin: 0;
  }

  .el-scrollbar__bar {
    display: none;
  }
}
</style>
