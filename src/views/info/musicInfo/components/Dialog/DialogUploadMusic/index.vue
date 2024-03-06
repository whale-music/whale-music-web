<script setup lang="ts">
import { ref } from "vue";
import { getUserData } from "@/utils/auth";
import { MusicDetailInfo } from "@/api/music";
import { UPLOAD_AUTO_MUSIC } from "@/utils/UploadProxyUrl";
import { ElLoading, UploadFile, UploadProps } from "element-plus";
import { message } from "@/utils/message";

defineOptions({
  name: "DialogUploadMusic"
});
const userInfo = getUserData();

const value = ref();
const uploadLoadingFlag = ref();

const musicInfo = defineModel<MusicDetailInfo>("musicInfo");
const emits = defineEmits(["onSubmit"]);

const handleAvatarSuccess = async (response: UploadFile) => {
  if (response?.response == null) {
    message("upload error", { type: "error" });
    return;
  }
  uploadLoadingFlag.value?.close();
  const r = response.response as any;
  if (r.code === "200") {
    message("上传成功", { type: "success" });
    value.value = false;
    emits("onSubmit");
  } else {
    message(`上传失败${r.message}`, { type: "error" });
  }
};
const beforeAvatarUpload: UploadProps["beforeUpload"] = () => {
  uploadLoadingFlag.value = ElLoading.service({
    lock: true,
    text: "Loading",
    background: "rgba(0, 0, 0, 0.7)"
  });
  return true;
};
</script>

<template>
  <!--添加音源提示框-->
  <el-dialog v-model="value" :show-close="false" title="添加音源">
    <el-upload
      drag
      :multiple="false"
      :data="{
        userId: userInfo.id,
        id: musicInfo.id
      }"
      :action="UPLOAD_AUTO_MUSIC"
      :on-change="handleAvatarSuccess"
      :before-upload="beforeAvatarUpload"
    >
      <el-icon class="el-icon--upload"
        ><IconifyIconOnline
          class="cursor-pointer"
          style="color: #636e72"
          icon="solar:cloud-upload-bold-duotone"
          width="2rem"
          height="2rem"
      /></el-icon>
      <div class="el-upload__text">
        托动音乐文件到此 或 <em>点击上传音乐</em>
      </div>
    </el-upload>
  </el-dialog>
</template>
