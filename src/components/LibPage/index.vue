<script setup lang="tsx">
import FilterLine from "@iconify-icons/mingcute/filter-line";
import More2Fill from "@iconify-icons/mingcute/more-2-fill";
import { cloneDeep } from "@pureadmin/utils";
import { useVModel } from "@vueuse/core";
import { TabsPaneContext } from "element-plus";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import AddMusicToPlayList from "@/components/addMusicToPlayList/addMusicToPlayList.vue";
import { showAddFilterDialogText } from "@/components/LibPage/components/AddFilterDialog";
import HighlightInput from "@/components/LibPage/components/HighlightInput/index.vue";
import {
  removeAlbum,
  removeArtist,
  removeMusic
} from "@/components/LibPage/components/RemoveConfirm";
import { message } from "@/utils/message";
import {
  pageIndexKey,
  pageNumKey,
  parseQueryToSearchName,
  parseSearchToQuery,
  randomKey
} from "@/utils/SearchParse";

defineOptions({
  name: "LibPage"
});
const emit = defineEmits<{
  (e: "update:selectCount", val: number): void;
  (e: "update:activeTabName", value: string): void;
  (e: "drawer-click", val: void): void;
}>();

const props = defineProps({
  selectCount: Array as PropType<Array<any>>,
  activeTabName: String
});

const selectCount = useVModel(props, "selectCount", emit);

const value = ref("");

const router = useRouter();
const route = useRoute();
const useSearch = () => {
  function parasSearchParam() {
    const query = parseSearchToQuery(value.value);
    query["type"] = activeName.value;
    query[randomKey] = Date.now().toString();
    return query;
  }
  const onSubmit = () => {
    const query = parasSearchParam();
    router.push({ query: query });
  };

  return {
    onSubmit
  };
};

const tabs = () => {
  const activeName = useVModel(props, "activeTabName", emit);
  const handleClick = (pane: TabsPaneContext) => {
    selectCount.value = [];
    const query = cloneDeep(route.query);
    delete query[pageIndexKey];
    delete query[pageNumKey];

    activeName.value = pane.paneName.toString();
    query["type"] = pane.paneName;
    query[randomKey] = Date.now().toString();
    router.push({ query: query });
  };

  const clickDrawer = () => {
    emit("drawer-click");
  };

  const removeData = async () => {
    switch (activeName.value) {
      case "music":
        await removeMusic(selectIds.value, onSubmit);
        break;
      case "album":
        await removeAlbum(selectIds.value, onSubmit);
        break;
      case "artist":
        await removeArtist(selectIds.value, onSubmit);
        break;
      default:
        message("移除参数错误", { type: "error" });
    }
  };
  return {
    activeName,
    handleClick,
    clickDrawer,
    removeData
  };
};

const useSelectData = () => {
  const selectIds = computed(() => {
    return selectCount.value.map((value: any) => value.id);
  });
  return {
    selectIds
  };
};

const useMusicToPlay = () => {
  const addMusicDialogFlag = ref(false);
  return {
    addMusicDialogFlag
  };
};
const { selectIds } = useSelectData();
const { onSubmit } = useSearch();
const { activeName, handleClick, clickDrawer, removeData } = tabs();
const { addMusicDialogFlag } = useMusicToPlay();
onMounted(() => {
  const { nameStr, musicStr, artistStr, albumStr } = parseQueryToSearchName(
    route.query
  );
  value.value = `${nameStr} ${musicStr} ${albumStr} ${artistStr}`.trim();

  const q = cloneDeep(route.query);
  q["type"] = activeName.value;
  router.push({ query: q });
});

const showFilterText = () => {
  showAddFilterDialogText();
};
</script>

<template>
  <div class="page-content">
    <AddMusicToPlayList
      v-model="addMusicDialogFlag"
      :music-id="selectIds"
      @closeDialog="() => (addMusicDialogFlag = false)"
    />
    <div class="flex gap-2 justify-between mb-4">
      <HighlightInput v-model="value" @keyup.enter="onSubmit" />
      <div class="flex gap-2">
        <div>
          <ElButton type="primary" size="large" @click="onSubmit">
            搜索
          </ElButton>
        </div>
        <div>
          <ElButton type="primary" size="large" @click="showFilterText">
            <ElIcon>
              <IconifyIconOffline :icon="FilterLine" />
            </ElIcon>
            添加筛选
          </ElButton>
        </div>
        <el-dropdown>
          <ElButton type="primary" size="large">
            <ElIcon>
              <IconifyIconOffline :icon="More2Fill" />
            </ElIcon>
          </ElButton>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                @click="
                  value = '';
                  onSubmit();
                "
              >
                清除搜索栏
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div class="tabs-container">
      <el-tabs class="page-tabs" v-model="activeName" @tabClick="handleClick">
        <slot />
      </el-tabs>
      <div class="mt-2 absolute top-0 right-0 flex gap-2 items-center">
        <div
          class="flex flex-row items-center animate__animated animate__fadeInUp"
          style="--animate-duration: 400ms"
          v-show="selectCount.length !== 0"
        >
          <span class="text-[var(--el-text-color-regular)] mr-4">
            选中 {{ selectCount.length }} 项
          </span>
          <ElButton type="danger" size="large" @click="removeData">
            删除
          </ElButton>
          <ElButton
            type="primary"
            size="large"
            @click="addMusicDialogFlag = !addMusicDialogFlag"
            v-if="activeName === 'music'"
          >
            添加到歌单
          </ElButton>
        </div>
        <ElButton class="" type="primary" size="large" @click="clickDrawer">
          新建
        </ElButton>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import url("@/style/pagination.scss");

.page-content {
  position: relative;
  height: calc(var(--content-height) - var(--top-height));
}

.page-tabs {
  --el-bg-color-overlay: var(--el-bg-color);
  --el-border-color-light: transparent;
  border-radius: 1rem;
}

.tabs-container {
  position: relative;
}
</style>
