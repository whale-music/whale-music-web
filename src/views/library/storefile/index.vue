<script lang="ts">
import FileBoldDuotone from "@iconify-icons/solar/file-bold-duotone";
import GalleryMinimalisticBold from "@iconify-icons/solar/gallery-minimalistic-bold";
import SoundwaveCircleBold from "@iconify-icons/solar/soundwave-circle-bold";
import VideoFramePlayVerticalBold from "@iconify-icons/solar/video-frame-play-vertical-bold";
import { ElLoading } from "element-plus";
import { defineComponent, shallowRef } from "vue";

import {
  FilterTermsRes,
  getFilterType,
  getStoreFileInfoList,
  ResourcePageRes,
  StoreFileInfoReq
} from "@/api/storefile";
import WSegmented from "@/components/WSegmented/index.vue";
import AudioFileInfo from "@/views/library/storefile/components/audioFileInfo/index.vue";
import PicFileInfo from "@/views/library/storefile/components/picFileInfo/index.vue";
import VideoFileInfo from "@/views/library/storefile/components/videoFileInfo/index.vue";

import FilterCheckout from "./components/filterCheckout/index.vue";

import { DynamicScroller, DynamicScrollerItem } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import { StringUtils } from "@/utils/ObjectsUtil";
import WButton from "@/components/button/index.vue";
import PreviewFile from "@/views/library/storefile/components/previewFile/index.vue";

export default defineComponent({
  name: "StoreFile",
  components: {
    PreviewFile,
    WButton,
    WSegmented,
    PicFileInfo,
    FilterCheckout,
    DynamicScroller,
    DynamicScrollerItem
  },
  setup() {
    return {
      GalleryMinimalisticBold,
      SoundwaveCircleBold,
      VideoFramePlayVerticalBold,
      FileBoldDuotone
    };
  },
  data() {
    return {
      previewData: {
        isShow: false,
        fileInfoComponent: null,
        name: ""
      },
      previewFile: {
        isShow: false,
        src: "",
        type: "",
        title: ""
      },
      displayResource: {
        display: "all",
        options: [
          {
            value: "all",
            label: "显示全部"
          },
          {
            value: "bind",
            label: "显示绑定数据"
          },
          {
            value: "noBind",
            label: "显示无绑定数据"
          }
        ]
      },
      order: {
        options: [
          {
            value: "asc",
            label: "升序"
          },
          {
            value: "desc",
            label: "降序"
          }
        ]
      },
      orderBy: {
        options: [
          {
            value: "createTime",
            label: "创建时间"
          },
          {
            value: "updateTime",
            label: "更新时间"
          },
          {
            value: "name",
            label: "文件名"
          },
          {
            value: "size",
            label: "文件大小"
          }
        ]
      },
      filter: {
        checkAll: true,
        isIndeterminate: false,
        value: "type",
        chooses: [
          { name: "类型", value: "type" },
          { name: "格式", value: "format" }
        ] as Array<{ name: string; value: string }>
      },
      search: {
        select: "",
        orderBy: "updateTime",
        filter: [] as string[],
        filterType: true,
        order: "asc",
        refresh: false
      } as StoreFileInfoReq,
      classify: [] as FilterTermsRes[],
      list: [] as ResourcePageRes[]
    };
  },
  computed: {
    searchFilter() {
      const filter = this.search.filter;
      const filterTypeFlag = this.filter.value === "type";
      const resourcePageRes = this.list
        .filter((value: ResourcePageRes) => {
          // 过滤搜索值
          const b =
            StringUtils.isBlank(this.search.select) ||
            value.name.includes(this.search.select);
          // 判断是否包含需要过滤的值
          const filterTypeCondition = filterTypeFlag
            ? filter.findIndex(
                (v: string) =>
                  v === this.filterTypeCondition(value.fileExtension)
              ) !== -1
            : filter.findIndex((v: string) => v === value.fileExtension) !== -1;
          // 判断音源显示
          const display = this.displayResource.display;
          const displayFlag =
            display === "all" ||
            (display === "bind" ? value.status : !value.status);
          return b && filterTypeCondition && displayFlag;
        })
        .sort((a: ResourcePageRes, b: ResourcePageRes) => {
          switch (this.search.orderBy) {
            case "createTime":
              return (
                new Date(a.creationTime).getTime() -
                new Date(b.creationTime).getTime()
              );
            case "name":
              return a.name.localeCompare(b.name);
            case "size":
              return a.size - b.size;
            case "updateTime":
            default:
              return (
                new Date(a.modificationTime).getTime() -
                new Date(b.lastAccessTime).getTime()
              );
          }
        });
      return this.search.order === "asc"
        ? resourcePageRes
        : resourcePageRes.reverse();
    }
  },
  watch: {},
  mounted() {
    this.init();
  },
  methods: {
    async init() {
      const loading = ElLoading.service({
        lock: true,
        text: "Loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      try {
        await this.initStoreFileList();
        await this.initFilter(this.filter.value);
      } finally {
        loading.close();
      }
    },
    async initStoreFileList() {
      // 文件列表
      const r = await getStoreFileInfoList(this.search);
      this.list = r.data;
    },
    async initFilter(val: string) {
      // 过滤
      const filterRes = await getFilterType(val);
      this.classify = filterRes.data;
      this.search.filter = filterRes.data.map(value => value.name);
      this.search.filterType = val === "type";
    },
    drawerClose() {},
    fileTypeTag(
      type: string
    ): "primary" | "success" | "info" | "warning" | "danger" {
      switch (type) {
        case "audio":
          return "primary";
        case "video":
          return "success";
        case "image":
          return "warning";
        default:
          return "info";
      }
    },
    fileTypeIcon(type: string) {
      switch (type) {
        case "audio":
          return SoundwaveCircleBold;
        case "video":
          return VideoFramePlayVerticalBold;
        case "image":
          return GalleryMinimalisticBold;
        default:
          return FileBoldDuotone;
      }
    },
    formatBytes(bytes: number, decimals = 2) {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return (
        parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
      );
    },
    async handelSegment(val: string) {
      await this.initFilter(val);
    },
    openFileInfoDrawer(name: string, type: string) {
      switch (type) {
        case "image":
          this.previewData.fileInfoComponent = shallowRef(PicFileInfo);
          break;
        case "video":
          this.previewData.fileInfoComponent = shallowRef(VideoFileInfo);
          break;
        case "audio":
          this.previewData.fileInfoComponent = shallowRef(AudioFileInfo);
          break;
      }
      this.previewData.name = name;
      this.previewData.isShow = true;
    },
    filterTypeCondition(val: string) {
      switch (val) {
        case "jpg":
        case "jpeg":
        case "png":
          return "image";
        case "mp4":
        case "avi":
        case "mkv":
        case "mov":
          return "video";
        case "mp3":
        case "wav":
        case "aac":
        case "ogg":
        case "flac":
          return "audio";
        default:
          return "unknown";
      }
    },
    async onSubmitReFresh() {
      try {
        this.search.refresh = true;
        await this.init();
      } finally {
        this.search.refresh = false;
      }
    },
    previewBtn(item) {
      this.previewFile.isShow = true;
      this.previewFile.src = item.url;
      this.previewFile.type = item.type;
      this.previewFile.title = item.name;
    }
  }
});
</script>

<template>
  <div>
    <PreviewFile
      v-model="previewFile.isShow"
      :src="previewFile.src"
      :type="previewFile.type"
      :title="previewFile.title"
    />
    <component
      :is="previewData.fileInfoComponent"
      :key="previewData.name"
      v-model="previewData.isShow"
      :name="previewData.name"
      @handleClose="drawerClose"
      @updatePage="initStoreFileList"
    />
    <div class="table-container container-height">
      <div class="panel">
        <ElScrollbar :always="true">
          <div class="ml-4 mr-4 m-4">
            <div class="flex justify-between">
              <div class="flex-c space-x-2">
                <h3>搜索</h3>
                <span class="opacity-50 text-sm">
                  {{ searchFilter.length }} 总数
                </span>
              </div>
              <WButton type="danger" @click="onSubmitReFresh">刷新缓存</WButton>
            </div>
            <div class="mt-2">
              <el-input v-model="search.select" size="large" clearable />
            </div>
            <h3 class="mt-2 mb-2">显示绑定数据</h3>
            <el-select
              v-model="displayResource.display"
              class="w-full"
              placeholder="Select"
              size="large"
            >
              <el-option
                v-for="item in displayResource.options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <h3 class="mt-2 mb-2">排序</h3>
            <el-select
              v-model="search.order"
              class="w-full"
              placeholder="Select"
              size="large"
            >
              <el-option
                v-for="item in order.options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <h3 class="mt-2 mb-2">排序字段</h3>
            <el-select
              v-model="search.orderBy"
              class="w-full"
              placeholder="Select"
              size="large"
              @change="initStoreFileList()"
            >
              <el-option
                v-for="item in orderBy.options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          <el-divider />
          <div class="flex justify-between pl-2 pr-2">
            <h3>过滤</h3>
            <w-segmented
              v-model="filter.value"
              :options="filter.chooses"
              @updateSelection="handelSegment"
            />
          </div>
          <div class="flex flex-col">
            <div class="flex flex-col pr-8 pl-8">
              <filter-checkout v-model="search.filter" :cities="classify" />
            </div>
          </div>
        </ElScrollbar>
      </div>
      <el-empty v-if="list.length === 0" class="w-full" />
      <div v-else class="grow">
        <div class="flex flex-col overflow-y-hidden container-height">
          <DynamicScroller
            v-slot="{ item, index, active }"
            class="h-screen"
            :items="searchFilter"
            :min-item-size="54"
            key-field="path"
          >
            <DynamicScrollerItem
              :item="item"
              :active="active"
              :size-dependencies="[item.path]"
              :data-index="index"
              :data-active="active"
              :title="`${item.name}`"
            >
              <div class="flex flex-col gap-2">
                <a
                  :key="item.md5"
                  class="a-item"
                  :class="item.status ? '' : 'grayscale'"
                  @click="openFileInfoDrawer(item.path, item.type)"
                >
                  <div class="flex">
                    <IconifyIconOffline
                      width="4rem"
                      height="4rem"
                      class="mr-2 text-[var(--el-color-primary)]"
                      :class="item.status ? '' : 'text-[var(--el-color-info)]'"
                      :icon="fileTypeIcon(item.type)"
                    />
                    <div class="w-full">
                      <div>
                        <div class="flex justify-between pr-4">
                          <p
                            class="w-96 truncate"
                            :class="
                              item.status
                                ? ''
                                : 'text-[var(--el-text-color-secondary)]'
                            "
                          >
                            {{ item.name }}
                          </p>
                          <div class="flex space-x-2">
                            <p>
                              {{ formatBytes(item.size) }}
                            </p>
                            <WButton
                              type="primary"
                              size="small"
                              @click.stop="previewBtn(item)"
                            >
                              预览
                            </WButton>
                          </div>
                        </div>
                      </div>
                      <p class="opacity-50 text-sm w-80 truncate">
                        {{ item.path }}
                      </p>
                      <div class="flex justify-between mt-1 pr-4">
                        <el-tag :type="fileTypeTag(item.type)" round>
                          {{ item.type }}
                        </el-tag>
                        <p class="text-[var(--el-text-color-secondary)]">
                          {{ item.modificationTime }}
                        </p>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            </DynamicScrollerItem>
          </DynamicScroller>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container-height {
  height: 79vh;
}

.table-container {
  position: relative;
  display: flex;
  gap: 1em;
  padding: 0.6rem;
  border-radius: var(--el-border-radius-base);
}

.a-item {
  padding: 0.5rem;
  border-radius: 0.4rem;
  //box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color))
  //  inset;
  transition: transform ease 200ms;
}

.a-item:hover {
  background-color: var(--el-color-primary-light-9);
  border-radius: 0.4rem;
}

.panel {
  width: 25%;
  margin-right: 0;
  margin-left: 0;
  overflow-y: auto;
  border-color: var(--el-border-color);
  border-style: solid;
  border-width: 1px;
  border-radius: 0.4rem;
}
</style>
