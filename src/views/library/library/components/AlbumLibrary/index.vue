<script setup lang="ts">
import { CellStyle } from "element-plus";
import { reactive, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

import { getAlbumPage } from "@/api/album";
import RePageTable from "@/components/LibPage/components/RePageTable/index.vue";
import LoadImg from "@/components/LoadImg/LoadImg.vue";
import { dateFormater } from "@/utils/dateUtil";
import { paramsQueryToPageReq } from "@/utils/SearchParse";

defineOptions({
  name: "AlbumLibrary"
});
const route = useRoute();
const { t } = useI18n();

const typeName = "album";

const loading = ref(false);
const page = reactive({ content: [], total: 0, size: 50, current: 1 });
const init = async () => {
  try {
    loading.value = true;
    const r = await getAlbumPage(paramsQueryToPageReq(route.query));
    const data = r.data;
    page.content = data.content;
    page.current = data.current;
    page.size = data.size;
    page.total = data.total;
  } finally {
    loading.value = false;
  }
};
watchEffect(() => {
  if (route.query["type"] === typeName) {
    init();
  }
});
// 表格颜色
const cellStyle = ({ columnIndex }): CellStyle<any> => {
  let styles = {};
  styles["border"] = "none";
  styles["overflow"] = "hidden";
  // 复选框样式
  if (columnIndex === 0) {
    styles = {
      color: "#bfbfbf",
      padding: "0",
      margin: "0",
      width: "0.6rem",
      "font-size": "0.6rem",
      "text-align": "center"
    };
  }
  return styles;
};
</script>

<template>
  <RePageTable
    :page="page"
    :cell-style="cellStyle"
    :loading="loading"
    @current-change="init()"
    @size-change="init()"
  >
    <el-table-column type="selection" width="55" />
    <el-table-column width="110" :show-overflow-tooltip="false">
      <template #default="scope">
        <LoadImg
          :src="scope.row.picUrl"
          width="5rem"
          height="5rem"
          radius="1rem"
          :shadow="false"
        />
      </template>
    </el-table-column>
    <el-table-column
      :label="t('input.albumName')"
      :show-overflow-tooltip="true"
    >
      <template #default="scope">
        <el-link :underline="false">
          <router-link
            :to="{
              name: 'AlbumInfo',
              query: { id: scope.row.id }
            }"
          >
            <span class="text-xl">{{ scope.row.albumName }}</span>
          </router-link>
        </el-link>
      </template>
    </el-table-column>
    <el-table-column
      :label="t('input.singerName')"
      :show-overflow-tooltip="true"
    >
      <template #default="scope">
        <el-link
          :underline="false"
          v-for="item in scope.row.artistList"
          :key="item.id"
          class="m-1"
        >
          <router-link
            :to="{
              name: 'ArtistInfo',
              query: { id: item.id }
            }"
          >
            <span class="text-xl">
              {{ item.artistName }}
            </span>
          </router-link>
        </el-link>
      </template>
    </el-table-column>
    <el-table-column
      :label="t('table.musicSize')"
      :show-overflow-tooltip="true"
      width="100"
    >
      <template #default="scope">
        <span class="text-xl" style="color: var(--el-text-color-secondary)">
          {{ scope.row.albumSize }}
        </span>
      </template>
    </el-table-column>
    <el-table-column
      prop="createTime"
      label="上传时间"
      :show-overflow-tooltip="true"
    >
      <template #default="scope">
        <span style="color: var(--el-text-color-secondary)">{{
          dateFormater("YYYY-MM-dd HH:mm:ss", scope.row.createTime)
        }}</span>
      </template>
    </el-table-column>
  </RePageTable>
</template>

<style scoped lang="scss"></style>
