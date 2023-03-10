<script setup lang="ts">
import { getAlbumPage } from "@/api/album";
import { ref, reactive, onMounted } from "vue";
import { dateFormater } from "@/utils/dateUtil";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const tableData = ref();

const formInline = reactive({
  albumName: "",
  singerName: ""
});

const page = reactive({
  pageIndex: 0,
  pageNum: 10,
  total: 0
});
const getAlbumPageList = () => {
  getAlbumPage({
    singerName: formInline.singerName,
    albumName: formInline.albumName,
    orderBy: "",
    order: false,
    timeBy: false,
    beforeTime: "",
    laterTime: "",
    page: page,
    description: "",
    pic: "",
    updateTime: "",
    createTime: ""
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
  <div>
    <div class="flex justify-center">
      <el-form :inline="true" :model="formInline" class="demo-form-inline">
        <el-form-item :label="t('input.albumName')">
          <el-input
            v-model="formInline.albumName"
            :placeholder="t('input.pleaseEnterAlbumName')"
          />
        </el-form-item>
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
    <div>
      <el-table :data="tableData" style="width: 100%" table-layout="fixed">
        <el-table-column type="index" />
        <el-table-column prop="pic" show-overflow-tooltip>
          <template #default="scope">
            <el-image
              style="width: 5rem; height: 5rem"
              class="rounded-lg"
              :src="scope.row.pic"
              fit="scale-down"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="albumName"
          :label="t('input.albumName')"
          show-overflow-tooltip
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
    </div>
  </div>
</template>

<style scoped></style>
