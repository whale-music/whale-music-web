<script setup lang="ts">
import { useDark } from "@pureadmin/utils";
import { useVModel } from "@vueuse/core";
import dayjs from "dayjs";
import { CellStyle } from "element-plus";
import { reactive, ref, watchEffect } from "vue";
import { useRoute } from "vue-router";

import { getMusicTabsPage } from "@/api/music";
import { musicLike } from "@/api/playlist";
import DownloadIcon from "@/components/DownloadIcon/download.vue";
import RePageTable from "@/components/LibPage/components/RePageTable/index.vue";
import { FriendlyTime } from "@/utils/DateFormat";
import { dateFormater } from "@/utils/dateUtil";
import { message } from "@/utils/message";
import { paramsQueryToPageReq } from "@/utils/SearchParse";

defineOptions({
  name: "MusicLibrary"
});

const typeName = "music";

const loading = ref(false);
const page = reactive({ content: [], total: 0, size: 50, current: 1 });

const route = useRoute();

const props = defineProps({
  selectCount: Array
});

const emit = defineEmits<{
  (e: "update:selectCount", value: number): void;
}>();

const selectCount = useVModel(props, "selectCount", emit);

const init = async () => {
  try {
    loading.value = true;
    const r = await getMusicTabsPage(paramsQueryToPageReq(route.query));
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

const like = async (id: number, status: boolean) => {
  const r = await musicLike(id, status);
  if (r.code === "200") {
    const index = page.content.findIndex(value => value.id === id);
    if (index !== -1) {
      message(`${status === true ? "添加成功" : "删除成功"}`, {
        type: "success"
      });
      page.content[index].isLike = status;
    } else {
      await init();
    }
  } else {
    message(`添加错误${r.message}`, { type: "error" });
  }
};

const { isDark } = useDark();
// 表格颜色
const cellStyle = ({ row, columnIndex }): CellStyle<any> => {
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
  // 设置无地址音乐颜色
  switch (row.isExist) {
    case false:
      styles["color"] = "#a2a2a2";
      styles["backgroundColor"] = isDark.value ? "#262626" : "#f4f6f7";
      break;
  }
  return styles;
};
</script>

<template>
  <RePageTable
    ref="multipleTableRef"
    v-model:select-count="selectCount"
    :page="page"
    :style="cellStyle"
    :cell-style="cellStyle"
    :loading="loading"
  >
    <el-table-column type="selection" width="40" />
    <el-table-column width="40" :show-overflow-tooltip="true">
      <template #default="scope">
        <IconifyIconOnline
          @click="like(scope.row.id, !scope.row.isLike)"
          class="cursor-pointer"
          :style="{ color: scope.row.isLike === true ? 'red' : 'grey' }"
          icon="solar:heart-bold"
          width="1.3rem"
          height="1.3rem"
        />
      </template>
    </el-table-column>
    <el-table-column width="40" :show-overflow-tooltip="true">
      <template #default="scope">
        <DownloadIcon :muiscId="scope.row.id" />
      </template>
    </el-table-column>

    <el-table-column label="名称" :show-overflow-tooltip="true">
      <template #default="scope">
        <div class="flex gap-2">
          <el-link :underline="false">
            <router-link
              class="font-bold"
              :to="{ name: 'MusicInfo', query: { id: scope.row.id } }"
            >
              {{ scope.row.musicName }}
            </router-link>
          </el-link>
          <span class="text-[var(--el-text-color-placeholder)] select-none">
            {{ scope.row.musicNameAlias }}
          </span>
        </div>
      </template>
    </el-table-column>

    <el-table-column
      prop="albumName"
      label="专辑"
      :show-overflow-tooltip="true"
    >
      <template #default="scope">
        <router-link
          :to="{
            name: 'AlbumInfo',
            query: { id: scope.row.albumId }
          }"
        >
          <el-link :underline="false">{{ scope.row.albumName }}</el-link>
        </router-link>
      </template>
    </el-table-column>

    <el-table-column label="歌手" :show-overflow-tooltip="true">
      <template #default="scope">
        <el-link
          class="mr-1"
          :underline="false"
          disable-transitions
          v-for="(item, index) in scope.row.artistNames"
          :key="index"
        >
          <router-link
            :to="{
              name: 'ArtistInfo',
              query: { id: scope.row.artistIds[index] }
            }"
          >
            <span>{{ item }}</span>
          </router-link>
        </el-link>
      </template>
    </el-table-column>

    <el-table-column
      prop="timeLength"
      label="歌曲时长"
      :show-overflow-tooltip="true"
    >
      <template #default="scope">
        <span class="font-light">{{
          dateFormater("mm:ss", scope.row.timeLength)
        }}</span>
      </template>
    </el-table-column>

    <el-table-column
      prop="userId"
      label="上传用户"
      :show-overflow-tooltip="true"
    >
      <template #default="scope">
        <el-link :underline="false">
          <router-link
            :class="
              scope.row.userId ? '' : 'text-[var(--el-text-color-placeholder)]'
            "
            :to="`/userManagement/${scope.row.userId}`"
          >
            {{ scope.row.nickname ?? scope.row.userId }}
          </router-link>
        </el-link>
      </template>
    </el-table-column>

    <el-table-column
      prop="createTime"
      label="上传时间"
      :show-overflow-tooltip="true"
    >
      <template #default="scope">
        <span>{{
          FriendlyTime(
            dateFormater("YYYY-MM-dd HH:mm:ss", scope.row.createTime),
            dayjs()
          )
        }}</span>
      </template>
    </el-table-column>
  </RePageTable>
</template>

<style scoped lang="scss"></style>
