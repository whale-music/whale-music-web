<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import {
  ElMessageBox,
  genFileId,
  UploadInstance,
  UploadRawFile
} from "element-plus";
import { defineComponent, reactive, ref } from "vue";

import { Count, MusicStatisticsRes, PluginTaskRes } from "@/api/hone";
import {
  AlbumConvert,
  SaveOrUpdateAlbum,
  SelectAlbum
} from "@/api/model/Album";
import {
  ArtistConvert,
  SaveOrUpdateArtist,
  SelectArtist
} from "@/api/model/Artist";
import { LinkItem } from "@/api/model/common";
import { SaveOrUpdateMusic } from "@/api/model/Music";
import { saveOrUpdateArtist } from "@/api/singer";
import { message } from "@/utils/message";

defineComponent({
  name: "DrawerArtist"
});

interface AlbumReq extends SaveOrUpdateAlbum {
  link: LinkItem[];
}

const state = reactive({
  show: {
    uploadMusicFlag: false,
    uploadAlbumFlag: false,
    uploadArtistFlag: false,
    sourceInfoFlag: false,
    musicPreviewPic: false,
    albumPreviewPic: false,
    artistPreviewPic: false
  },
  select: {
    musicSelectArtist: [] as SelectArtist[],
    musicSelectAlbum: {} as SelectAlbum,
    albumSelectArtist: [] as SelectArtist[]
  },
  form: {
    uploadMusicInfo: { artistIds: [], resource: {} } as SaveOrUpdateMusic,
    uploadAlbum: { artistIds: [], link: [] } as AlbumReq,
    uploadArtist: {} as SaveOrUpdateArtist
  },
  list: {
    artist: {} as ArtistConvert[],
    album: {} as AlbumConvert[]
  },
  count: {
    music: {} as Count,
    album: {} as Count,
    artist: {} as Count
  },
  pie: {
    effectiveMusic: 0,
    invalidMusicOrigin: 0,
    discardMusicOrigin: 0,
    noSoundSourceCount: 0
  },
  musicStatic: {} as MusicStatisticsRes[],
  pluginTask: {} as PluginTaskRes[],
  autocomplete: {
    musicArtistInputValue: "",
    albumArtistInputValue: "",
    albumSearch: ""
  }
});
const props = defineProps<{
  modelValue: boolean;
}>();
const emit = defineEmits(["update:modelValue", "change"]);
const value = useVModel(props, "modelValue", emit);

const { VITE_PROXY_HOST } = import.meta.env;
const proxyHost = VITE_PROXY_HOST == null ? "" : VITE_PROXY_HOST;
const uploadPicAction = ref(`${proxyHost}/admin/pic/temp/upload`);
const previewPic = ref(`${proxyHost}/admin/pic/get/temp/`);
const picUpload = ref<UploadInstance>();

// 上传封面
const handleExceed = (files: File[]) => {
  picUpload.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  picUpload.value!.handleStart(file);
};

const artistHandleSuccess = (response: any) => {
  state.form.uploadArtist.tempFile = response.data;
  message("上传成功", { type: "success" });
  picUpload.value!.clearFiles();
};

const editArtistInfo = async () => {
  const r = await saveOrUpdateArtist(state.form.uploadArtist);
  if (r.code == "200") {
    message("保存成功", { type: "success" });
    state.form.uploadArtist = {} as SaveOrUpdateArtist;

    emit("change");
  } else {
    message(`保存失败: ${r.message}`, { type: "error" });
  }
};

const handleClose = (done: () => void) => {
  ElMessageBox.confirm("确认退出吗？")
    .then(() => {
      done();
    })
    .catch(() => {
      // catch error
    });
};
</script>

<template>
  <!--添加艺术家-->
  <el-drawer
    v-model="value"
    :with-header="false"
    :before-close="handleClose"
    :show-close="false"
    size="40%"
  >
    <h1 class="mb-4">添加艺术家</h1>
    <el-form
      label-position="right"
      label-width="auto"
      :model="state.form.uploadArtist"
    >
      <el-form-item label="歌手(艺术家)">
        <el-input v-model="state.form.uploadArtist.artistName" />
      </el-form-item>
      <el-form-item label="别名">
        <el-input v-model="state.form.uploadArtist.aliasName" />
      </el-form-item>
      <el-form-item label="封面">
        <div class="flex w-full gap-4">
          <el-input v-model="state.form.uploadArtist.tempFile" disabled />
          <el-image-viewer
            v-if="state.show.artistPreviewPic"
            :url-list="[previewPic + state.form.uploadArtist.tempFile]"
            @close="state.show.artistPreviewPic = false"
          />
          <el-button
            :disabled="
              state.form.uploadArtist.tempFile == null ||
              state.form.uploadArtist.tempFile === ''
            "
            @click="state.show.artistPreviewPic = true"
          >
            预览
          </el-button>
          <el-upload
            ref="picUpload"
            class="flex items-center justify-center"
            :action="uploadPicAction"
            :limit="1"
            :show-file-list="false"
            :on-exceed="handleExceed"
            :on-success="artistHandleSuccess"
            :auto-upload="true"
          >
            <template #trigger>
              <el-button type="primary">上传封面</el-button>
            </template>
          </el-upload>
        </div>
      </el-form-item>
      <el-form-item label="性别">
        <el-input v-model="state.form.uploadArtist.sex" />
      </el-form-item>
      <el-form-item label="出生日期">
        <el-date-picker
          v-model="state.form.uploadArtist.birth"
          type="date"
          value-format="YYYY-MM-DDT00:00:00"
          size="default"
          placeholder="点击选择发布时间"
        />
      </el-form-item>
      <el-form-item label="居住地">
        <el-input v-model="state.form.uploadArtist.location" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input
          v-model="state.form.uploadArtist.introduction"
          type="textarea"
        />
      </el-form-item>
      <el-form-item>
        <div class="flex flex-row-reverse w-full">
          <el-button type="primary" @click="editArtistInfo">保存</el-button>
        </div>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>
