<script setup lang="ts">
import { CellStyle } from "element-plus";
import { reactive, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

import { getArtistPage } from "@/api/singer";
import LoadImg from "@/components/LoadImg/LoadImg.vue";
import { dateFormater } from "@/utils/dateUtil";
import { paramsQueryToPageReq } from "@/utils/SearchParse";
import RePageTable from "@/components/RePageTable/index.vue";

defineOptions({
  name: "ArtistLibrary"
});

const route = useRoute();

const { t } = useI18n();

const typeName = "artist";

const loading = ref(false);
const page = reactive({ content: [], total: 0, size: 50, current: 1 });
const init = async () => {
  try {
    loading.value = true;
    const r = await getArtistPage(paramsQueryToPageReq(route.query));
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
    :data="page.content"
    :page="page"
    style="width: 100%"
    :cell-style="cellStyle"
    :loading="loading"
  >
    <el-table-column type="selection" width="55" />
    <el-table-column width="110" :show-overflow-tooltip="false">
      <template #default="scope">
        <LoadImg
          :src="scope.row.picUrl"
          width="5rem"
          height="5rem"
          radius="9999px"
          :shadow="false"
        />
      </template>
    </el-table-column>

    <el-table-column
      :label="t('input.singerName')"
      :show-overflow-tooltip="true"
    >
      <template #default="scope">
        <el-link :underline="false">
          <router-link
            :to="{
              name: 'ArtistInfo',
              query: { id: scope.row }
            }"
          >
            <span class="text-xl">
              {{ scope.row.artistName }}
            </span>
          </router-link>
        </el-link>
        <span class="font">&emsp;{{ scope.row.aliasName }}</span>
      </template>
    </el-table-column>

    <el-table-column
      :label="t('table.albumSize')"
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
      :label="t('table.musicSize')"
      :show-overflow-tooltip="true"
      width="100"
    >
      <template #default="scope">
        <span class="text-xl" style="color: var(--el-text-color-secondary)">
          {{ scope.row.musicSize }}
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
