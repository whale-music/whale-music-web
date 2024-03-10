<script setup lang="ts">
import { UPLOAD_PIC_URL } from "@/utils/UploadProxyUrl";
import { ref } from "vue";
import { genFileId, UploadRawFile } from "element-plus";
import { message } from "@/utils/message";

defineOptions({
  name: "UploadButton"
});

const props = defineProps({
  id: Number,
  type: String
});
const emits = defineEmits(["init"]);

const init = () => {
  emits("init");
};

const picUpload = ref();
// 上传封面
const handleExceed = (files: File[]) => {
  picUpload.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  picUpload.value!.handleStart(file);
};

const handleSuccess = (response: any) => {
  if (response.code == 200) {
    init();
    message("封面更新成功", { type: "success" });
  } else {
    message("封面更新失败", { type: "error" });
  }
};
</script>

<template>
  <el-upload
    ref="picUpload"
    class="flex justify-center items-center"
    :data="{ id: props.id, type: props.type }"
    :action="UPLOAD_PIC_URL"
    :limit="1"
    :on-exceed="handleExceed"
    :on-success="handleSuccess"
    :auto-upload="true"
  >
    <template #trigger>
      <el-button type="primary"> 上传封面 </el-button>
    </template>
  </el-upload>
</template>
