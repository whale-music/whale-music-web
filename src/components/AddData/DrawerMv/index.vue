<script lang="ts">
import {
  AutocompleteFetchSuggestionsCallback,
  genFileId,
  UploadFile,
  UploadFiles,
  UploadRawFile
} from "element-plus";
import { defineComponent } from "vue";

import { ArtistConvert, SelectArtist } from "@/api/model/Artist";
import { saveMvInfo, SaveOrUpdateMv } from "@/api/mv";
import { getSelectSingerList } from "@/api/singer";
import { message } from "@/utils/message";

import PreviewVideo from "./components/previewVideo/index.vue";
import VideoFrameDialog from "./components/videoFrameDialog.vue";
const { VITE_PROXY_HOST } = import.meta.env;
export default defineComponent({
  name: "DrawerMv",
  components: { PreviewVideo, VideoFrameDialog },
  props: {
    value: Boolean,
    direction: String
  },
  data() {
    return {
      isDrawer: this.value,
      show: {
        videoFrameDialog: false,
        videoPreviewVideo: false,
        picPreviewImage: false
      },
      uploadAction: `${VITE_PROXY_HOST ?? ""}/admin/pic/temp/upload`,
      uploadAccessAddress: `${VITE_PROXY_HOST ?? ""}/admin/pic/get/temp/`,
      upload: {
        previewVideoUrl: "",
        previewPicUrl: "",
        filelist: []
      },
      mvSaveData: {} as SaveOrUpdateMv,
      artistName: "",
      selectPreview: {
        artist: [] as ArtistConvert[]
      }
    };
  },
  computed: {
    getVisible: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("update:value", val);
      }
    },
    isUploadFile() {
      const filelist = this.upload.filelist;
      return (
        filelist === null || filelist === undefined || filelist.length == 0
      );
    }
  },
  watch: {
    "selectPreview.artist": {
      handler(newVal) {
        this.mvSaveData.artistIds = newVal.map(value => value.id);
      },
      deep: true
    }
  },
  methods: {
    beforeClose(done) {
      // 在这里可以执行一些自定义的关闭前逻辑
      // 如果不需要特定的关闭前逻辑，可以直接调用 done() 来关闭抽屉
      this.$emit("update:value", false);
      done();
    },
    handleOpen() {
      // 抽屉打开时的逻辑
    },
    handleClose() {
      // 抽屉关闭时的逻辑
    },
    uploadMusicOnSuccess(response: any) {
      if (response.code === "200") {
        this.upload.previewVideoUrl = `${this.uploadAccessAddress}${encodeURI(
          response?.data
        )}`;
        this.mvSaveData.mvTempPath = response?.data;
      }
    },
    uploadChange(uploadFile: UploadFile, uploadFiles: UploadFiles) {
      this.upload.filelist = uploadFiles;
    },
    musicArtistQuerySearchAsync(
      queryString: string,
      cb: AutocompleteFetchSuggestionsCallback
    ) {
      getSelectSingerList(queryString).then(selectArtists => {
        if (selectArtists.code === "200" && selectArtists.data.length !== 0) {
          cb(selectArtists.data);
        }
      });
    },
    musicArtistHandleSelect(item: SelectArtist) {
      if (
        this.selectPreview.artist.findIndex(value => value.id === item.id) ===
        -1
      ) {
        this.selectPreview.artist.push(item);
      }
      this.artistName = "";
    },
    musicArtistHandleClose(index) {
      this.selectPreview.artist.splice(index, 1);
    },
    async saveOrUpdateMvBtn() {
      const r = await saveMvInfo(this.mvSaveData);
      if (r.code === "200") {
        message("上传成功", { type: "success" });
        this.mvSaveData = {};
        this.selectPreview.artist = [];
        this.$emit("change");
      }
    },
    picUploadHandleSuccessfully(response: any) {
      if (response.code === "200") {
        this.upload.previewPicUrl = `${this.uploadAccessAddress}${encodeURI(
          response?.data
        )}`;
        this.mvSaveData.picTempPath = response?.data;
        message(response?.message, { type: "success" });
      }
    },
    uploadPicHandleExceed(files: File[]) {
      this.$refs.picUpload!.clearFiles();
      const file = files[0] as UploadRawFile;
      file.uid = genFileId();
      this.$refs.picUpload!.handleStart(file);
    }
  }
});
</script>
<template>
  <el-drawer
    v-model="getVisible"
    :before-close="beforeClose"
    title="上传MV"
    @open="handleOpen"
    @close="handleClose"
  >
    <div>
      <el-upload
        ref="musicFileUpload"
        class="upload-demo"
        drag
        :show-file-list="true"
        :action="uploadAction"
        :on-change="uploadChange"
        :on-success="uploadMusicOnSuccess"
        :limit="1"
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
      <div class="flex flex-row-reverse">
        <preview-video
          v-model="show.videoPreviewVideo"
          :preview-video-url="upload.previewVideoUrl"
        />
        <el-button
          type="primary"
          :disabled="isUploadFile"
          @click="show.videoPreviewVideo = true"
        >
          预览
        </el-button>
      </div>
      <el-form label-position="top">
        <el-form-item label="标题">
          <el-input v-model="mvSaveData.title" placeholder="请输入MV标题" />
        </el-form-item>
        <el-form-item label="封面">
          <div class="flex w-full gap-4">
            <el-input
              v-model="mvSaveData.picTempPath"
              placeholder="封面地址"
              disabled
            />
            <video-frame-dialog v-model="show.videoFrameDialog" />
            <el-image-viewer
              v-if="show.picPreviewImage"
              :url-list="[`${uploadAccessAddress}${mvSaveData.picTempPath}`]"
              @close="show.picPreviewImage = false"
            />
            <el-button
              v-if="mvSaveData.picTempPath"
              type="success"
              @click="show.picPreviewImage = true"
            >
              预览
            </el-button>
            <el-button
              v-else
              type="success"
              :disabled="isUploadFile"
              @click="show.videoFrameDialog = !show.videoFrameDialog"
            >
              设置视频封面
            </el-button>
            <el-upload
              ref="picUpload"
              :limit="1"
              :action="uploadAction"
              :on-success="picUploadHandleSuccessfully"
              :on-exceed="uploadPicHandleExceed"
              :show-file-list="false"
              :auto-upload="true"
            >
              <template #trigger>
                <el-button type="primary"> 上传 </el-button>
              </template>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="歌手">
          <el-tag
            v-for="(item, index) in selectPreview.artist"
            :key="item.id"
            effect="dark"
            closable
            round
            @close="musicArtistHandleClose(index)"
            >{{ item.artistName }}</el-tag
          >
          <el-autocomplete
            v-model="artistName"
            class="w-full mt-1"
            :fetch-suggestions="musicArtistQuerySearchAsync"
            placeholder="请输入歌手名"
            @select="musicArtistHandleSelect"
          />
        </el-form-item>
        <el-form-item label="介绍">
          <el-input
            v-model="mvSaveData.description"
            placeholder="请输入MV介绍"
            type="textarea"
          />
        </el-form-item>
        <el-form-item label="发布日期">
          <!-- --el-date-editor-width长度占满 -->
          <el-date-picker
            v-model="mvSaveData.publishTime"
            style="

--el-date-editor-width: 100%"
            type="date"
            value-format="YYYY-MM-DDTHH:mm:ss"
            placeholder="选择发布日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveOrUpdateMvBtn">
            保存
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-drawer>
</template>
