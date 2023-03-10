<script setup lang="ts">
import { getSingerPage, SingerRes } from "@/api/singer";
import { ref, reactive, onMounted } from "vue";
import { dateFormater } from "@/utils/dateUtil";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const tableData = ref<SingerRes[]>();

const formInline = reactive({
  singerName: ""
});

const page = reactive({
  pageIndex: 0,
  pageNum: 100,
  total: 0
});
const getAlbumPageList = () => {
  getSingerPage({
    singerName: formInline.singerName,
    orderBy: "",
    order: false,
    page: page
  }).then(res => {
    page.pageIndex = res.data.current;
    page.pageNum = res.data.size;
    page.total = res.data.total;

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
</script>

<template>
  <div class="singer">
    <div class="search">
      <el-form :inline="true" :model="formInline" class="demo-form-inline">
        <el-form-item :label="t('input.singerName')">
          <el-input
            v-model="formInline.singerName"
            :placeholder="t('input.pleaseEnterSingerName')"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">{{
            t("buttons.search")
          }}</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table">
      <el-table :data="tableData" style="width: 100%" table-layout="fixed">
        <el-table-column type="index" />
        <el-table-column width="100" show-overflow-tooltip>
          <template #default="scope">
            <el-image
              style="width: 5rem; height: 5rem"
              class="rounded shadow-md"
              :src="scope.row.pic"
              fit="contain"
            />
          </template>
        </el-table-column>

        <el-table-column
          prop="singerName"
          :label="t('input.singerName')"
          show-overflow-tooltip
        >
          <template #default="scope">
            <span class="text-xl">{{ scope.row.singerName }}</span
            ><span class="font">&emsp;{{ scope.row.alias }}</span>
          </template>
        </el-table-column>

        <el-table-column
          :label="t('table.albumSize')"
          show-overflow-tooltip
          width="100"
        >
          <template #default="scope">
            <span class="text-2xl">{{ scope.row.albumSize }}</span>
          </template>
        </el-table-column>

        <el-table-column
          :label="t('table.musicSize')"
          show-overflow-tooltip
          width="100"
        >
          <template #default="scope">
            <span class="text-2xl">{{ scope.row.musicSize }}</span>
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
.font {
  color: #a3a39cc3;
}

.singer {
  margin: 0;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .search {
    display: flex;
    justify-content: center;
  }

  .table {
    width: 90%;
  }
}
</style>
