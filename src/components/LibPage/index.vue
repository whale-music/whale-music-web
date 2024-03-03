<script setup lang="tsx">
import FilterLine from "@iconify-icons/mingcute/filter-line";
import More2Fill from "@iconify-icons/mingcute/more-2-fill";
import { useVModel } from "@vueuse/core";
import { ElMessage, ElMessageBox, TabsPaneContext } from "element-plus";
import { computed, ref } from "vue";

import { deleteAlbum } from "@/api/album";
import { deleteMusic } from "@/api/music";
import { deleteArtist } from "@/api/singer";
import AddMusicToPlayList from "@/components/addMusicToPlayList/addMusicToPlayList.vue";
import { showAddFilterDialogText } from "@/components/LibPage/components/AddFilterDialog";
import HighlightInput from "@/components/LibPage/components/HighlightInput/index.vue";
import { message } from "@/utils/message";

defineOptions({
  name: "LibPage"
});
const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "size-change", val: number): boolean;
  (e: "current-change", value: number): boolean;
  (e: "on-submit", value: void): void;
  (e: "update:activeTabName", value: string): void;
  (e: "tab-click", name: string | number): void;
  (e: "drawer-click", val: void): void;
  (e: "update:selectCount", val: number): void;
}>();

const props = defineProps({
  modelValue: String,
  tabs: Array<{ name: string; label: string }>,
  selectCount: Array as PropType<Array<any>>,
  activeTabName: String
});

const selectCount = useVModel(props, "selectCount", emit);

const EmitMethod = () => {
  const onSubmit = () => emit("on-submit");

  return {
    onSubmit
  };
};

const useModel = () => {
  const value = useVModel(props, "modelValue", emit);
  return {
    value
  };
};

const tabs = () => {
  const activeName = useVModel(props, "activeTabName", emit);
  const tabList = props.tabs;
  const handleClick = (pane: TabsPaneContext) => {
    selectCount.value = [];
    emit("tab-click", pane.paneName);
  };

  const clickDrawer = () => {
    emit("drawer-click");
  };

  const confirmButtonText = "删除";
  const confirmDeleteText = "强制删除";
  async function removeMusic(ids: number[]) {
    const isForceDeleteFlag = ref(false);
    await ElMessageBox.confirm(
      "正在删除音乐，需要退出直接点击关闭",
      confirmButtonText,
      {
        confirmButtonText: confirmButtonText,
        cancelButtonText: "返回",
        message: () => {
          return (
            <>
              <h3>如果歌曲绑定歌单则会删除失败</h3>
              <el-tooltip
                effect="dark"
                content="<b>该操作会强制删除<b class='text-rose-800'>歌曲</b>歌单数据</b>"
                raw-content
              >
                <el-checkbox
                  v-model={isForceDeleteFlag.value}
                  label={confirmDeleteText}
                  size="large"
                />
              </el-tooltip>
            </>
          );
        },
        beforeClose: async (action, instance, done) => {
          if (action === "confirm") {
            instance.confirmButtonLoading = true;
            instance.confirmButtonText = "Loading...";
            try {
              const res = await deleteMusic(ids, isForceDeleteFlag.value);
              if (res.code === "200") {
                message("删除成功", { type: "success" });
                onSubmit();
                done();
              }
            } finally {
              instance.confirmButtonText = confirmButtonText;
              instance.confirmButtonLoading = false;
            }
          } else {
            done();
          }
        }
      }
    ).catch(() => {});
  }
  async function removeAlbum(ids: number[]) {
    const isForceDeleteFlag = ref(false);
    await ElMessageBox.confirm(
      "正在删除专辑，需要退出直接点击关闭",
      confirmButtonText,
      {
        confirmButtonText: confirmButtonText,
        cancelButtonText: "返回",
        message: () => {
          return (
            <>
              <h3>如果歌曲绑定歌单则会删除失败</h3>
              <el-tooltip
                effect="dark"
                content="<b>该操作会强制删除<b class='text-rose-800'>专辑</b>音乐</b>"
                raw-content
              >
                <el-checkbox
                  v-model={isForceDeleteFlag.value}
                  label={confirmDeleteText}
                  size="large"
                />
              </el-tooltip>
            </>
          );
        },
        beforeClose: async (action, instance, done) => {
          if (action === "confirm") {
            instance.confirmButtonLoading = true;
            instance.confirmButtonText = "Loading...";
            try {
              const res = await deleteAlbum(ids, isForceDeleteFlag.value);
              if (res.code === "200") {
                message("删除成功", { type: "success" });
                onSubmit();
                done();
              }
            } finally {
              instance.confirmButtonText = confirmButtonText;
              instance.confirmButtonLoading = false;
            }
          } else {
            done();
          }
        }
      }
    ).catch(() => {});
  }

  async function removeArtist(ids: number[]) {
    ElMessageBox.confirm("正在删除歌曲", {
      confirmButtonText: confirmButtonText,
      cancelButtonText: "Cancel"
    })
      .then(async () => {
        const res = await deleteArtist(ids);
        if (res.code === "200") {
          message("删除成功", { type: "success" });
          onSubmit();
        }
      })
      .catch(() => {
        ElMessage({
          type: "info",
          message: "Delete canceled"
        });
      });
  }
  const removeData = async () => {
    const ids = selectCount.value.map(value1 => value1.id);

    switch (activeName.value) {
      case "music":
        await removeMusic(ids);
        break;
      case "album":
        await removeAlbum(ids);
        break;
      case "artist":
        await removeArtist(ids);
        break;
      default:
        message("移除餐厨错误", { type: "error" });
    }
  };
  return {
    activeName,
    tabList,
    handleClick,
    clickDrawer,
    removeData
  };
};
const { onSubmit } = EmitMethod();
const { value } = useModel();
const { activeName, tabList, handleClick, clickDrawer, removeData } = tabs();

const addMusicDialogFlag = ref(false);
const addMusicDialog = computed(() => {
  return selectCount.value.map(value => value.id);
});
const showFilterText = () => {
  showAddFilterDialogText();
};
</script>

<template>
  <div class="page-content">
    <AddMusicToPlayList
      v-model="addMusicDialogFlag"
      :music-id="addMusicDialog"
      @closeDialog="() => (addMusicDialog.isShow = false)"
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
      <el-tabs class="page-tabs" v-model="activeName" @tab-click="handleClick">
        <el-tab-pane
          v-for="item in tabList"
          :label="item.label"
          :name="item.name"
          :key="item.name"
          :lazy="true"
        >
          <slot :name="item.name" />
        </el-tab-pane>
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
