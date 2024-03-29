<script lang="ts">
import { clone, isEqualObject } from "@pureadmin/utils";
import { ElLoading } from "element-plus";
import { defineComponent } from "vue";

import { AutoCompleteCommon } from "@/api/model/StoreFile";
import {
  cleanResource,
  getAudioResourceInfo,
  getMusicAutocomplete,
  ResourceAudioInfoRes,
  syncResource,
  UpdateLinkAudio,
  updateLinkAudio
} from "@/api/storefile";
import { useCopy } from "@/utils/copy";
import { message } from "@/utils/message";
import { getFileTypeColor } from "@/views/library/storefile/components/util/fileInfoUtil";

export default defineComponent({
  name: "AudioFileInfo",
  props: {
    modelValue: Boolean,
    name: String
  },
  data() {
    return {
      previews: {
        infoFlag: false
      },
      data: { linkData: { value: "" } } as ResourceAudioInfoRes,
      oldData: { linkData: { value: "" } } as ResourceAudioInfoRes,
      musicQuery: ""
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
    isDataUpdate() {
      return isEqualObject(this.oldData, this.data);
    }
  },
  mounted() {
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
        const r = await getAudioResourceInfo(this.name);
        this.data = r.data;
        this.oldData = clone(r.data);
      } finally {
        loading.close();
      }
    },
    querySearch(queryString: string, cb: any) {
      // call callback function to return suggestions
      getMusicAutocomplete(queryString).then(r => {
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
      this.musicQuery = "";
    },
    async updateLinkAudio() {
      const reqParam = {
        id: this.data?.dbResource?.id,
        musicId: this.data.linkData.id
      } as UpdateLinkAudio;
      try {
        const r = await updateLinkAudio(reqParam);
        if (r.code == "200") {
          message("更新成功", { type: "success" });
        }
      } finally {
        await this.init();
      }
    },
    async cleanAudioResource(flag) {
      try {
        const r = await cleanResource({
          id: this.data.dbResource.id,
          isForceDelete: flag,
          middleId: this.data.dbResource.musicId,
          type: "audio"
        });
        if (r.code == "200") {
          message("更新成功", { type: "success" });
          this.$emit("updatePage");
        }
      } finally {
        await this.init();
      }
    },
    async syncAudioResource() {
      try {
        const r = await syncResource({
          path: this.data.path,
          type: "audio"
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
    <el-dialog v-model="previews.infoFlag">
      <template #header>
        <h3 class="dialog-title">图片信息(DB)</h3>
      </template>
      <el-descriptions title="">
        <el-descriptions-item label="ID">
          <b>{{ data.dbResource?.id }}</b>
        </el-descriptions-item>
        <el-descriptions-item label="MD5">
          {{ data.dbResource?.md5 }}
        </el-descriptions-item>
        <el-descriptions-item label="关联数">
          <el-tag type="success"> 1 </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="路径">
          <el-link :underline="false" type="primary">
            {{ data.dbResource?.path }}
          </el-link>
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ data.dbResource?.updateTime }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ data.dbResource?.createTime }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-drawer
      v-model="isShow"
      :show-close="false"
      :style="getFileTypeColor('audio')"
      :destroy-on-close="true"
    >
      <el-descriptions
        title="文件信息"
        direction="horizontal"
        :column="1"
        border
      >
        <template #extra>
          <el-button
            type="primary"
            :disabled="data.dbResource == null"
            @click="previews.infoFlag = true"
          >
            信息
          </el-button>
          <el-button type="success" @click="syncAudioResource">
            同步信息
          </el-button>
          <el-button
            type="danger"
            :disabled="data.dbResource == null"
            @click="cleanAudioResource(true)"
          >
            删除信息
          </el-button>
        </template>
        <el-descriptions-item label="文件名">
          {{ data.name }}
        </el-descriptions-item>
        <el-descriptions-item label="路径">
          {{ data.path }}
        </el-descriptions-item>
        <el-descriptions-item label="地址">
          <el-link
            :underline="false"
            type="primary"
            @click="() => useCopy(data.url)"
          >
            点击复制
          </el-link>
        </el-descriptions-item>
        <el-descriptions-item label="类型">Audio</el-descriptions-item>
        <el-descriptions-item label="文件格式">
          {{ data?.fileExtension }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ data.creationTime }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ data.modificationTime }}
        </el-descriptions-item>
      </el-descriptions>
      <div class="flex justify-between mt-4">
        <h2>关联数据</h2>
        <el-button
          type="primary"
          :disabled="isDataUpdate"
          @click="updateLinkAudio()"
        >
          保存
        </el-button>
      </div>
      <el-form label-position="top">
        <el-form-item>
          <template #label>
            <h2>Audio</h2>
            <div class="flex items-center justify-between">
              <div class="flex gap-4">
                <el-tag
                  v-if="data.linkData.id"
                  effect="dark"
                  round
                  class="text-[var(--el-color-primary)]"
                >
                  {{ data.linkData.id }}
                </el-tag>
                <el-tooltip
                  class="box-item"
                  effect="dark"
                  :content="data.linkData.name"
                  placement="top-start"
                >
                  <p class="w-40 truncate text-[var(--el-color-primary)]">
                    {{ data.linkData.name }}
                  </p>
                </el-tooltip>
              </div>
              <el-button
                type="danger"
                :disabled="data.linkData.id == null"
                plain
                @click="cleanAudioResource(false)"
              >
                清除
              </el-button>
            </div>
          </template>
          <el-autocomplete
            v-model="musicQuery"
            class="w-full"
            :fetch-suggestions="querySearch"
            :trigger-on-focus="true"
            :select-when-unmatched="true"
            clearable
            placeholder="输入关联音乐名"
            @select="handleAutoCompleteSelect"
          >
            <template #default="{ item }">
              <div class="flex justify-between">
                <span class="value">{{ item.value }}</span>
                <el-link class="link" :underline="false" type="primary">{{
                  item.link
                }}</el-link>
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
  margin-bottom: 0;
  border-top: 0.5rem solid var(--type-color);
}

.singe-line {
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  white-space: nowrap;
}
</style>
