<script setup lang="ts">
import { ArtistInfoRes, saveOrUpdateArtist } from "@/api/singer";
import { UPLOAD_PIC_URL } from "@/utils/UploadProxyUrl";
import { ref } from "vue";
import {
  genFileId,
  UploadInstance,
  UploadProps,
  UploadRawFile
} from "element-plus";
import { Artist } from "@/api/model/Artist";
import { message } from "@/utils/message";

defineOptions({
  name: "DialogEditArtistInfo"
});

const value = defineModel<boolean>();
const artistInfo = defineModel<ArtistInfoRes>("artistInfo");

const emits = defineEmits(["onSubmit"]);

const onSubmit = () => {
  emits("onSubmit");
};
const picUpload = ref<UploadInstance>();
// 上传封面
const handleExceed: UploadProps["onExceed"] = files => {
  picUpload.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  picUpload.value!.handleStart(file);
};

const handleSuccess = (response: any) => {
  if (response.code == 200) {
    onSubmit();
    message("封面更新成功", { type: "success" });
  } else {
    message("封面更新失败", { type: "error" });
  }
};

const editArtistInfo = async () => {
  const data: Artist = {
    aliasName: artistInfo.value.aliasName,
    artistName: artistInfo.value.artistName,
    birth: artistInfo.value.birth,
    createTime: artistInfo.value.createTime,
    id: artistInfo.value.id,
    introduction: artistInfo.value.introduction,
    location: artistInfo.value.location,
    pic: artistInfo.value.picUrl,
    sex: artistInfo.value.sex,
    updateTime: artistInfo.value.updateTime
  };
  const r = await saveOrUpdateArtist(data);
  if (r.code == "200") {
    message("更新成功", { type: "success" });
    value.value = false;
    onSubmit();
  } else {
    message(`更新失败: ${r.message}`, { type: "error" });
  }
};
</script>

<template>
  <el-dialog v-model="value" :show-close="false">
    <div>
      <el-scrollbar height="20rem">
        <el-form label-position="top">
          <el-form-item label="歌手名">
            <el-input v-model="artistInfo.artistName" />
          </el-form-item>
          <el-form-item label="歌手名别名(请用英文,逗号分割)">
            <el-input v-model="artistInfo.aliasName" />
          </el-form-item>
          <el-form-item label="封面">
            <div class="flex items-center justify-center w-full gap-4">
              <el-input v-model="artistInfo.picUrl" disabled />
              <el-upload
                ref="picUpload"
                class="flex justify-center items-center"
                :data="{ id: artistInfo.id, type: 'artist' }"
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
            </div>
          </el-form-item>
          <el-form-item label="性别">
            <el-input v-model="artistInfo.sex" />
          </el-form-item>
          <el-form-item label="出生日期">
            <el-date-picker
              v-model="artistInfo.birth"
              type="date"
              value-format="YYYY-MM-DDT00:00:00"
              size="default"
              style="

--el-date-editor-width: 100%"
            />
          </el-form-item>
          <el-form-item label="居住地">
            <el-input v-model="artistInfo.location" />
          </el-form-item>
          <el-form-item label="介绍">
            <el-input
              v-model="artistInfo.introduction"
              type="textarea"
              :autosize="{ maxRows: 10, minRows: 4 }"
            />
          </el-form-item>
        </el-form>
      </el-scrollbar>
    </div>
    <template #footer>
      <el-button @click="value = false">取消</el-button>
      <el-button type="primary" @click="editArtistInfo">更新</el-button>
    </template>
  </el-dialog>
</template>
