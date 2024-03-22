<script setup lang="ts">
import { saveOrUpdateAlbum } from "@/api/album";
import { message } from "@/utils/message";
import { AlbumInfo } from "@/api/model/Album";
import {
  genFileId,
  UploadInstance,
  UploadProps,
  UploadRawFile
} from "element-plus";
import { ref } from "vue";
import { UPLOAD_PIC_URL } from "@/utils/UploadProxyUrl";
import TagInput from "@/views/components/TagInput/index.vue";

defineOptions({
  name: "DialogEditAlbum"
});

const value = defineModel<boolean>();
const albumInfo = defineModel<AlbumInfo>("albumInfo");

const emits = defineEmits(["onSubmit"]);

const onSubmit = () => {
  emits("onSubmit");
};
const saveOrUpdate = async () => {
  const val = albumInfo.value;
  const data = {
    albumGenre: val.albumGenre,
    albumName: val.albumName,
    artistIds: val.artistList.map(value => value.id),
    company: val.company,
    description: val.description,
    id: val.id,
    publishTime: val.publishTime,
    subType: val.subType,
    tempFile: ""
  };
  const r = await saveOrUpdateAlbum(data);
  if (r.code === "200") {
    message("更新成功", { type: "success" });
    onSubmit();
    value.value = false;
  } else {
    message(`更新失败${r.message}`, { type: "error" });
  }
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
</script>

<template>
  <!--编辑专辑信息-->
  <el-dialog v-model="value" :show-close="false">
    <el-scrollbar height="20rem">
      <el-form label-position="top">
        <el-form-item label="专辑名">
          <el-input v-model="albumInfo.albumName" />
        </el-form-item>
        <el-form-item label="封面">
          <div class="flex items-center justify-center w-full gap-4">
            <el-input v-model="albumInfo.picUrl" disabled />
            <el-upload
              ref="picUpload"
              class="flex justify-center items-center"
              :data="{ id: albumInfo.id, type: 'album' }"
              :action="UPLOAD_PIC_URL"
              :limit="1"
              :show-file-list="false"
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
        <el-form-item label="专辑流派">
          <TagInput v-model="albumInfo.albumGenre" />
        </el-form-item>
        <el-form-item label="专辑版本">
          <el-input v-model="albumInfo.subType" />
        </el-form-item>
        <el-form-item label="唱片公司">
          <el-input v-model="albumInfo.company" />
        </el-form-item>
        <el-form-item label="发布时间">
          <el-date-picker
            v-model="albumInfo.publishTime"
            type="date"
            value-format="YYYY-MM-DDT00:00:00"
            size="default"
            style="

--el-date-editor-width: 100%"
          />
        </el-form-item>
        <el-form-item label="专辑描述">
          <el-input
            v-model="albumInfo.description"
            type="textarea"
            :autosize="{ maxRows: 10, minRows: 4 }"
          />
        </el-form-item>
      </el-form>
    </el-scrollbar>
    <template #footer>
      <el-button @click="value = false">取消</el-button>
      <el-button type="primary" @click="saveOrUpdate">更新</el-button>
    </template>
  </el-dialog>
</template>
