<script lang="ts">
import { ElLoading } from "element-plus";
import { defineComponent } from "vue";

import { AutoCompleteCommon } from "@/api/model/StoreFile";
import {
  cleanResource,
  getMvAutocomplete,
  getVideoResourceInfo,
  ResourceVideoInfoRes,
  syncResource,
  UpdateLinkVideo,
  updateLinkVideo
} from "@/api/storefile";
import { useCopy } from "@/utils/copy";
import { message } from "@/utils/message";
import { getFileTypeColor } from "@/views/library/storefile/components/util/fileInfoUtil";

export default defineComponent({
  name: "VideoFileInfo",
  props: {
    modelValue: Boolean,
    name: String
  },
  data() {
    return {
      previews: {
        infoFlag: false
      },
      data: { linkData: { value: "" } } as ResourceVideoInfoRes,
      search: {
        name: ""
      }
    };
  },
  computed: {
    isShow: {
      get() {
        return this.modelValue;
      },
      set(val) {
        this.$emit("update:modelValue", val);
      }
    },
    inputValue: {
      get() {
        return this.data?.linkData?.value ?? "";
      },
      set(val) {
        if (this.data.linkData == null) {
          this.data.linkData = {};
        }
        this.data.linkData.value = val;
      }
    }
  },
  mounted() {
    console.log("video mounted");
    this.init();
  },
  methods: {
    useCopy,
    getFileTypeColor,
    async init() {
      const loading = ElLoading.service({
        lock: true,
        text: "Loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      try {
        const r = await getVideoResourceInfo(this.name);
        this.data = r.data;
      } finally {
        loading.close();
      }
    },
    querySearch(queryString: string, cb: any) {
      // call callback function to return suggestions
      getMvAutocomplete(queryString).then(r => {
        if (r.code === "200" && r.data.length !== 0) {
          cb(r.data);
        } else {
          setTimeout(() => cb([]), 200);
        }
      });
    },
    handleAutoCompleteSelect(item: AutoCompleteCommon) {
      this.data.linkData = {};
      this.data.linkData.name = item.value;
      this.data.linkData.id = item.link;
      this.search.name = "";
    },
    removeLinkVideo() {
      this.data.linkData = {};
    },
    async updateLinkVideo() {
      const reqParam = {
        id: this.data.mvResource.id,
        mvId: this.data.linkData.id,
        path: this.data.name
      } as UpdateLinkVideo;
      try {
        const r = await updateLinkVideo(reqParam);
        if (r.code == "200") {
          message("更新成功", { type: "success" });
        }
      } finally {
        await this.init();
      }
    },
    async cleanVideoResource() {
      try {
        const r = await cleanResource({
          id: this.data.mvResource.id,
          middleId: this.data.linkData.id,
          type: "video"
        });
        if (r.code == "200") {
          message("更新成功", { type: "success" });
          this.$emit("updatePage");
        }
      } finally {
        await this.init();
      }
    },
    async syncVideoResource() {
      try {
        const r = await syncResource({
          path: this.data.path,
          type: "video"
        });
        if (r.code == "200") {
          message("更新成功", { type: "success" });
          this.$emit("updatePage");
        }
      } finally {
        await this.init();
      }
    }
  }
});
</script>

<template>
  <div>
    <el-dialog v-model="this.previews.infoFlag">
      <template #header>
        <h3 class="dialog-title">图片信息(DB)</h3>
      </template>
      <el-descriptions title="">
        <el-descriptions-item label="ID">
          <b>{{ this.data.mvResource?.id }}</b>
        </el-descriptions-item>
        <el-descriptions-item label="MD5">
          {{ this.data.mvResource?.md5 }}
        </el-descriptions-item>
        <el-descriptions-item label="关联数">
          <el-tag type="success"> 1 </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="路径">
          <el-link :underline="false" type="primary">
            {{ this.data.mvResource?.path }}
          </el-link>
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ this.data.mvResource?.updateTime }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ this.data.mvResource?.createTime }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-drawer
      v-model="this.isShow"
      :show-close="false"
      :style="this.getFileTypeColor('video')"
      :destroy-on-close="true"
    >
      <template #header>
        <h2>文件信息</h2>
      </template>
      <div class="flex flex-col gap-2">
        <el-descriptions
          title="文件信息"
          direction="horizontal"
          :column="1"
          border
        >
          <template #extra>
            <el-button
              type="primary"
              @click="this.previews.infoFlag = true"
              :disabled="this.data.mvResource == null"
            >
              信息
            </el-button>
            <el-button type="success" @click="syncVideoResource">
              同步信息
            </el-button>
            <el-button
              type="danger"
              @click="cleanVideoResource"
              :disabled="this.data.mvResource == null"
            >
              删除信息
            </el-button>
          </template>
          <el-descriptions-item label="文件名">
            {{ this.data.name }}
          </el-descriptions-item>
          <el-descriptions-item label="路径">
            {{ this.data.path }}
          </el-descriptions-item>
          <el-descriptions-item label="地址">
            <el-link
              :underline="false"
              type="primary"
              @click="() => useCopy(this.data.url)"
            >
              点击复制
            </el-link>
          </el-descriptions-item>
          <el-descriptions-item label="类型">Video</el-descriptions-item>
          <el-descriptions-item label="文件格式">
            {{ this.data?.fileExtension }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ this.data.creationTime }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ this.data.modificationTime }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <div class="mt-4 flex justify-between">
        <h2>关联数据</h2>
        <el-button type="primary" @click="this.updateLinkVideo()">
          保存
        </el-button>
      </div>
      <el-form label-position="top">
        <el-form-item>
          <template #label>
            <h2>Video</h2>
            <div class="flex items-center justify-between">
              <div class="flex gap-4">
                <el-tag
                  effect="dark"
                  round
                  class="text-[var(--el-color-primary)]"
                  v-if="this.data?.linkData?.id"
                >
                  {{ this.data.linkData.id }}
                </el-tag>
                <el-tooltip
                  class="box-item"
                  effect="dark"
                  :content="this.data.linkData.name"
                  placement="top-start"
                  v-if="this.data?.linkData?.name"
                >
                  <p class="w-40 truncate text-[var(--el-color-primary)]">
                    {{ this.data.linkData.name }}
                  </p>
                </el-tooltip>
              </div>
              <el-button type="danger" @click="this.removeLinkVideo()" plain>
                删除
              </el-button>
            </div>
          </template>
          <el-autocomplete
            v-model="this.search.name"
            class="w-full"
            :fetch-suggestions="querySearch"
            :trigger-on-focus="true"
            :select-when-unmatched="true"
            clearable
            placeholder="输入关联MV"
            @select="handleAutoCompleteSelect"
          >
            <template #default="{ item }">
              <div class="flex justify-between">
                <span class="value">{{ item.value }}</span>
                <el-link class="link" :underline="false" type="primary">
                  {{ item.link }}
                </el-link>
              </div>
            </template>
          </el-autocomplete>
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-drawer__header) {
  border-top: 0.5rem solid var(--typeColor);
  margin-bottom: 0;
}

:deep(.el-descriptions__label) {
  font-weight: 600;
}
</style>
