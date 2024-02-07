<script lang="tsx" setup>
import AddFill from "@iconify-icons/mingcute/add-fill";
import HeartFill from "@iconify-icons/mingcute/heart-fill";
import PlayFill from "@iconify-icons/mingcute/play-fill";
import TimeFill from "@iconify-icons/mingcute/time-fill";
import { PureTable } from "@pureadmin/table";
import { onMounted, ref } from "vue";

import { getLastMusic, LastMusicRes } from "@/api/hone";
import LoadImg from "@/components/LoadImg/LoadImg.vue";
import IconifyIconOffline from "@/components/ReIcon/src/iconifyIconOffline";

defineOptions({
  name: "HotMusic"
});

function tableRef() {
  const musicHeaderRenderer = data => {
    console.log(data);
    return (
      <div class="flex items-center gap-2">
        <h1 class="text-text_color_primary font-bold">Tracks Activity</h1>
      </div>
    );
  };
  const columns: TableColumnList = [
    {
      label: "Tracks Activity",
      slot: "musicPic",
      width: "400",
      align: "center",
      headerRenderer: musicHeaderRenderer
    },
    {
      label: "Create Date",
      prop: "createDate",
      align: "center",
      headerRenderer: () => {
        return (
          <div class="flex-c">
            <IconifyIconOffline
              icon={TimeFill}
              width="1.3rem"
              height="1.3rem"
            />
          </div>
        );
      }
    },
    {
      label: "Play count",
      prop: "playCount",
      align: "center",
      headerRenderer: () => {
        return (
          <div class="flex-c">
            <IconifyIconOffline
              icon={PlayFill}
              width="1.3rem"
              height="1.3rem"
            />
          </div>
        );
      }
    },
    {
      label: "Number of favorites",
      prop: "numberOfFavorites",
      align: "center",
      headerRenderer: () => {
        return (
          <div class="flex-c">
            <IconifyIconOffline icon={AddFill} width="1.3rem" height="1.3rem" />
          </div>
        );
      }
    },
    {
      label: "Love the data",
      prop: "loveTheData",
      align: "center",
      headerRenderer: () => {
        return (
          <div class="flex-c">
            <IconifyIconOffline
              icon={HeartFill}
              width="1.3rem"
              height="1.3rem"
            />
          </div>
        );
      }
    }
  ];

  const tableData = ref<LastMusicRes[]>([]);

  async function getLastMusicHttp() {
    tableData.value = (await getLastMusic()).data;
  }

  return {
    columns,
    tableData,
    getLastMusicHttp
  };
}

const { tableData, columns, getLastMusicHttp } = tableRef();

onMounted(() => {
  getLastMusicHttp();
});
</script>

<template>
  <PureTable :data="tableData" :columns="columns" class="rounded-2xl">
    <template #musicPic="{ row }">
      <div class="flex items-center gap-8">
        <LoadImg
          :src="row.musicPic"
          height="40px"
          width="40px"
          radius="4px"
          :shadow="false"
        />
        <h3>{{ row.musicName }}</h3>
      </div>
    </template>
    <template #avatar="{ row }">
      <div v-html="row.avatarUrl" />
    </template>
  </PureTable>
</template>

<style lang="scss" scoped>
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
