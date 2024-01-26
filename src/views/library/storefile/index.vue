<script lang="ts">
import { defineComponent, shallowRef } from "vue";
import Mock from "mockjs";
import GalleryMinimalisticBold from "@iconify-icons/solar/gallery-minimalistic-bold";
import SoundwaveCircleBold from "@iconify-icons/solar/soundwave-circle-bold";
import VideoFramePlayVerticalBold from "@iconify-icons/solar/video-frame-play-vertical-bold";
import FileBoldDuotone from "@iconify-icons/solar/file-bold-duotone";
import PicFileInfo from "@/views/library/storefile/components/picFileInfo/index.vue";
import {
  FilterTermsRes,
  getFilterType,
  getStoreFileInfoList,
  StoreFileInfoReq,
  ResourcePageRes
} from "@/api/storefile";
import WSegmented from "@/components/WSegmented/index.vue";
import AudioFileInfo from "@/views/library/storefile/components/audioFileInfo/index.vue";
import VideoFileInfo from "@/views/library/storefile/components/videoFileInfo/index.vue";
import FilterCheckout from "./components/filterCheckout/index.vue";

import { ElLoading } from "element-plus";

export default defineComponent({
  name: "StoreFile",
  components: { WSegmented, PicFileInfo, FilterCheckout },
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
          { label: "类型", value: "type" },
          { label: "格式", value: "format" }
        ]
      },
      search: {
        select: "",
        orderBy: "createTime",
        filter: [] as string[],
        filterType: true,
        order: "asc"
      } as StoreFileInfoReq,
      classify: [] as FilterTermsRes[],
      list: [] as ResourcePageRes[]
    };
  },
  mounted() {
    this.init();
  },
  watch: {},
  methods: {
    async init() {
      const loading = ElLoading.service({
        lock: true,
        text: "Loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      try {
        await this.initFilter(this.filter.value);
        // 初始化时不用, filter自动更新时会自动请求
        await this.initStoreFileList();
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
    _init() {
      // Define the mock data template
      const dataTemplate = {
        "url|1": "@url",
        "name|1": "@title",
        "creationTime|1": "@datetime",
        "modificationTime|1": "@datetime",
        "path|1": "@url",
        "size|1": "@integer(1024, 11120480)",
        "type|1": "@pick(['audio', 'image', 'video'])"
      };

      // Generate an array of 100 mock data using the template
      this.list = Mock.mock({
        "list|10": [dataTemplate]
      }).list;

      // 生成分类假数据
      const classifyTemplate = {
        name: "@cname",
        "count|1-1000": 100,
        "value|1": [true, false]
      };

      this.classify = Mock.mock({
        "classify|3-10": [classifyTemplate]
      }).classify;
    },
    drawerClose() {},
    fileTypeTag(type: string) {
      switch (type) {
        case "audio":
          return "";
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
    formatBytes(bytes, decimals = 2) {
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
    handelCheckbox(): void {
      this.initStoreFileList();
    }
  },
  computed: {}
});
</script>

<template>
  <div>
    <component
      :is="this.previewData.fileInfoComponent"
      v-model="this.previewData.isShow"
      :key="this.previewData.name"
      :name="this.previewData.name"
      @handleClose="this.drawerClose"
      @updatePage="initStoreFileList"
    />
    <div class="table-container">
      <div class="panel">
        <div class="ml-4 mr-4 m-4">
          <h3>搜索</h3>
          <div class="flex mt-2 gap-4">
            <el-input v-model="this.search.name" size="large" clearable />
            <el-button type="primary" size="large"> 查询 </el-button>
          </div>
          <h3 class="mt-2 mb-2">排序</h3>
          <el-select
            v-model="this.search.order"
            @change="this.initStoreFileList()"
            class="w-full"
            placeholder="Select"
            size="large"
          >
            <el-option
              v-for="item in this.order.options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <h3 class="mt-2 mb-2">排序字段</h3>
          <el-select
            v-model="this.search.orderBy"
            @change="this.initStoreFileList()"
            class="w-full"
            placeholder="Select"
            size="large"
          >
            <el-option
              v-for="item in this.orderBy.options"
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
            v-model="this.filter.value"
            :options="this.filter.chooses"
            @updateSelection="this.handelSegment"
          />
        </div>
        <div class="flex flex-col">
          <div class="flex flex-col pr-8 pl-8">
            <filter-checkout
              v-model="this.search.filter"
              :cities="this.classify"
              @update-checkout="this.handelCheckbox"
            />
          </div>
        </div>
      </div>
      <div class="grow" style="height: 85vh" v-if="this.list.length !== 0">
        <el-scrollbar height="100%">
          <div class="flex flex-col gap-2">
            <a
              v-for="item in this.list"
              :key="item"
              class="a-item h-50"
              :class="item.status ? '' : 'grayscale'"
              @click="this.openFileInfoDrawer(item.path, item.type)"
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
                        :class="
                          item.status
                            ? ''
                            : 'text-[var(--el-text-color-secondary)]'
                        "
                      >
                        {{ item.name }}
                      </p>
                      <p>
                        {{ formatBytes(item.size) }}
                      </p>
                    </div>
                  </div>
                  <div class="flex justify-between mt-1 pr-4">
                    <el-tag :type="fileTypeTag(item.type)" round>{{
                      item.type
                    }}</el-tag>
                    <p class="text-[var(--el-text-color-secondary)]">
                      {{ item.modificationTime }}
                    </p>
                  </div>
                </div>
              </div>
            </a>
          </div>
        </el-scrollbar>
      </div>
      <el-empty v-else class="w-full" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.table-container {
  display: flex;
  gap: 1em;
  position: relative;
  border-radius: var(--el-border-radius-base);
  padding: 0.6rem;
}

.a-item {
  box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color))
    inset;
  transition: transform ease 200ms;
  padding: 0.5rem;
  border-radius: 0.4rem;
}

.a-item:hover {
  border-radius: 0.4rem;
  background-color: var(--el-color-primary-light-9);
}

.panel {
  width: 25%;
  height: 85vh;
  border-style: solid;
  border-color: var(--el-border-color);
  border-width: 1px;
  border-radius: 0.4rem;
  margin-left: 0;
  margin-right: 0;
  overflow-y: auto;
}
</style>
