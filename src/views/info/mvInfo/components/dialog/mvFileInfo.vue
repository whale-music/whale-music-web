<script lang="ts">
import { storageSession } from "@pureadmin/utils";
import { defineComponent } from "vue";

import { DataInfo, sessionKey } from "@/utils/auth";
import { message } from "@/utils/message";
const { VITE_PROXY_HOST } = import.meta.env;

export default defineComponent({
  name: "MvFileInfo",
  setup() {
    return {};
  },
  props: {
    value: Boolean,
    mvInfo: Object
  },
  data() {
    return {
      uploadAction: `${VITE_PROXY_HOST ?? ""}/admin/pic/temp/upload`,
      mvUpload: `${VITE_PROXY_HOST ?? ""}/admin/mv/upload/file`,
      picUpload: `${VITE_PROXY_HOST}/admin/pic/upload`,
      dialog: {
        picPreviewFlag: false
      },
      userId: storageSession().getItem<DataInfo>(sessionKey)
    };
  },
  computed: {
    isShow: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("update:value", value);
      }
    },
    editInfo: {
      get() {
        return this.mvInfo;
      },
      set(value) {
        this.$emit("update:mvInfo", value);
      }
    }
  },
  methods: {
    mvUploadHandleSuccessfully(response: any) {
      if (response.code === "200") {
        this.editInfo.mvUrl = response?.data;
        message(response?.message, { type: "success" });
      } else {
        message(response?.message, { type: "error" });
      }
      // 清空文件列表
      this.$refs.mvUpload.clearFiles();
      this.$emit("updateChange");
    },
    mvUploadHandleError(error: Error) {
      message(error.message, { type: "error" });
    },
    picUploadHandleSuccessfully(response: any) {
      if (response.code === "200") {
        this.editInfo.picUrl = response?.data;
        message(response?.message, { type: "success" });
      } else {
        message(response?.message, { type: "error" });
      }
      // 清空文件列表
      this.$refs.picUpload.clearFiles();
      this.$emit("updateChange");
    }
  }
});
</script>
<template>
  <el-dialog v-model="this.isShow">
    <el-form>
      <el-upload
        ref="mvUpload"
        drag
        :multiple="false"
        :data="{
          id: this.editInfo.id
        }"
        :action="mvUpload"
        :limit="1"
        :auto-upload="true"
        :on-success="this.mvUploadHandleSuccessfully"
        :on-error="this.mvUploadHandleError"
        :show-file-list="true"
      >
        <el-icon class="el-icon--upload">
          <IconifyIconOnline
            class="cursor-pointer"
            style="color: #636e72"
            icon="solar:cloud-upload-bold-duotone"
            width="2rem"
            height="2rem"
          />
        </el-icon>
        <div class="el-upload__text">托动MV文件到此 或 <em>点击上传MV</em></div>
      </el-upload>
      <el-form-item label="封面">
        <div class="flex w-full gap-2 mt-4">
          <el-input v-model="this.editInfo.picUrl" disabled />
          <el-image-viewer
            v-if="this.dialog.picPreviewFlag"
            :url-list="[this.editInfo.picUrl]"
            @close="this.dialog.picPreviewFlag = false"
          />
          <el-button type="success" @click="this.dialog.picPreviewFlag = true">
            预览
          </el-button>
          <el-upload
            ref="picUpload"
            :data="{ id: this.editInfo.id, type: 'mv' }"
            :limit="1"
            :action="picUpload"
            :on-success="this.picUploadHandleSuccessfully"
            :show-file-list="false"
            :auto-upload="true"
          >
            <template #trigger>
              <el-button type="primary"> 上传 </el-button>
            </template>
          </el-upload>
        </div>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<style scoped></style>
