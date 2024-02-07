<script lang="ts">
import AddCircleLinear from "@iconify-icons/solar/add-circle-linear";
import { clone, isEqualObject } from "@pureadmin/utils";
import { ElLoading } from "element-plus";
import { defineComponent } from "vue";

import {
  AutocompletePicRes,
  cleanResource,
  getPicAutocomplete,
  getPicResourceInfo,
  LinkList,
  ResourcePicInfoRes,
  syncResource,
  UpdateLinkPic,
  updateLinkPic
} from "@/api/storefile";
import { useCopy } from "@/utils/copy";
import { message } from "@/utils/message";
import { getFileTypeColor } from "@/views/library/storefile/components/util/fileInfoUtil";

export default defineComponent({
  name: "picFileInfo",
  components: {},
  props: {
    modelValue: Boolean,
    name: String
  },
  setup() {
    return {
      AddCircleLinear
    };
  },
  data() {
    return {
      search: {
        name: ""
      },
      currentLikeType: "music",
      data: {} as ResourcePicInfoRes,
      oldData: {} as ResourcePicInfoRes,
      previews: {
        infoFlag: false
      },
      options: [
        {
          value: "music",
          label: "音乐"
        },
        {
          value: "playlist",
          label: "歌单"
        },
        {
          value: "artist",
          label: "歌手"
        },
        {
          value: "album",
          label: "专辑"
        },
        {
          value: "UserBackground",
          label: "用户背景"
        },
        {
          value: "UserAvatar",
          label: "用户头像"
        },
        {
          value: "mv",
          label: "MV"
        }
      ]
    };
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
        const r = await getPicResourceInfo(this.name);
        this.data = r.data;
        this.oldData = clone(this.data, true);
      } finally {
        loading.close();
      }
    },
    async updateLinkPic() {
      const linkLists = this.data.linkData.map(value => {
        return { id: value.id, type: value.type } as LinkList;
      });
      const reqParam = {
        id: this.data.picResource.id,
        linkList: linkLists
      } as UpdateLinkPic;
      try {
        const r = await updateLinkPic(reqParam);
        if (r.code == "200") {
          message("更新成功", { type: "success" });
        }
      } finally {
        await this.init();
      }
    },
    async cleanPicResource(picId, type, flag) {
      try {
        const r = await cleanResource({
          id: this.data.picResource.id,
          isForceDelete: flag,
          middleId: picId,
          picType: type,
          type: "pic"
        });
        if (r.code == "200") {
          message("更新成功", { type: "success" });
          this.$emit("updatePage");
        }
      } finally {
        await this.init();
      }
    },
    async syncPicResource() {
      try {
        const r = await syncResource({
          path: this.data.path,
          type: "pic"
        });
        if (r.code == "200") {
          message("更新成功", { type: "success" });
          this.$emit("updatePage");
        }
      } finally {
        await this.init();
      }
    },
    fileTypeTag(type: string): string {
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
    addLinkData(type: string) {
      const items = { type: type };
      this.data.linkData.push(items);
    },
    querySearch(queryString: string, cb: any, type: string) {
      // call callback function to return suggestions
      getPicAutocomplete(queryString, type).then(r => {
        if (r.code === "200" && r.data.length !== 0) {
          cb(r.data);
        } else {
          setTimeout(() => cb([]), 200);
        }
      });
    },
    handleAutoCompleteSelect(item: AutocompletePicRes) {
      const items = {
        id: item.link,
        name: item.value,
        type: item.type
      };
      const flag = this.data.linkData.findIndex(value =>
        isEqualObject(value, items)
      );
      if (flag === -1) {
        this.data.linkData.push(items);
      } else {
        message("该数据已添加", { type: "warning" });
      }
      this.search.name = "";
    }
  },
  watch: {},
  computed: {
    isShowFlag: {
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
          <b>{{ this.data.picResource?.id }}</b>
        </el-descriptions-item>
        <el-descriptions-item label="MD5">
          {{ this.data.picResource?.md5 }}
        </el-descriptions-item>
        <el-descriptions-item label="关联数">
          <el-tag type="success">
            {{ this.data.picResource?.count }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="路径">
          <el-link :underline="false" type="primary">
            {{ this.data.picResource?.path }}
          </el-link>
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ this.data.picResource?.updateTime }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ this.data.picResource?.createTime }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
    <el-drawer
      v-model="this.isShowFlag"
      :show-close="false"
      :style="this.getFileTypeColor('image')"
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
            @click="this.previews.infoFlag = true"
            :disabled="this.data.picResource == null"
          >
            信息
          </el-button>
          <el-button type="success" @click="syncPicResource">
            同步信息
          </el-button>
          <el-button
            type="danger"
            @click="cleanPicResource(null, null, true)"
            :disabled="this.data.picResource == null"
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
        <el-descriptions-item label="类型">image</el-descriptions-item>
        <el-descriptions-item label="文件格式">
          {{ this.data.fileExtension }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ this.data.creationTime }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ this.data.modificationTime }}
        </el-descriptions-item>
      </el-descriptions>
      <div class="flex items-center justify-between mt-4 mb-4">
        <div class="flex items-center gap-2">
          <h3>关联数据</h3>
          <el-text size="large">
            {{
              this.data.linkData?.length == undefined
                ? 0
                : this.data.linkData.length
            }}
          </el-text>
        </div>
        <el-button
          type="primary"
          :disabled="isDataUpdate"
          @click="this.updateLinkPic()"
        >
          保存
        </el-button>
      </div>
      <el-form label-position="top">
        <div>
          <div class="flex-c">
            <el-select
              v-model="this.currentLikeType"
              class="m-2"
              placeholder="Select"
            >
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-autocomplete
              v-model="this.search.name"
              class="w-full"
              :fetch-suggestions="
                (queryString, cb) =>
                  querySearch(queryString, cb, currentLikeType)
              "
              :trigger-on-focus="true"
              :select-when-unmatched="true"
              clearable
              placeholder="输入关联名"
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
          </div>
          <div class="m-2">
            <el-form-item v-for="item in this.data.linkData" :key="item.id">
              <template #label>
                <h2>{{ item.type }}</h2>
                <div class="flex items-center justify-between">
                  <div class="flex gap-4">
                    <el-tag
                      :disable-transitions="true"
                      effect="dark"
                      round
                      class="text-[var(--el-color-primary)]"
                      v-if="item.id"
                    >
                      {{ item.id }}
                    </el-tag>
                    <el-tooltip
                      class="box-item"
                      effect="dark"
                      :content="item.name"
                      placement="top-start"
                    >
                      <p class="w-40 truncate text-[var(--el-color-primary)]">
                        {{ item.name }}
                      </p>
                    </el-tooltip>
                  </div>
                  <el-button
                    type="danger"
                    @click="cleanPicResource(item.id, item.type, false)"
                    plain
                  >
                    删除
                  </el-button>
                </div>
              </template>
            </el-form-item>
          </div>
        </div>
      </el-form>
    </el-drawer>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-drawer__header) {
  border-top: 0.5rem solid var(--typeColor);
  margin-bottom: 0;
}

:deep(.el-dialog__header) {
  padding: 10px 0 0;
  margin-left: 16px;
}

.dialog-title {
  border-left: 0.3rem solid var(--el-color-primary);
  padding-left: 0.5rem;
}

:deep(.el-descriptions__label) {
  font-weight: 600;
}
</style>
