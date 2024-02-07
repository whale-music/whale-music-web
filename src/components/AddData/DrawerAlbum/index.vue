<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import {
  ElMessageBox,
  genFileId,
  UploadInstance,
  UploadRawFile
} from "element-plus";
import { defineComponent, reactive, ref } from "vue";

import { saveOrUpdateAlbum } from "@/api/album";
import { Count, PluginTaskRes } from "@/api/hone";
import { AlbumConvert, SaveOrUpdateAlbum } from "@/api/model/Album";
import { ArtistConvert } from "@/api/model/Artist";
import { LinkItem } from "@/api/model/common";
import { getSelectSingerList } from "@/api/singer";
import { message } from "@/utils/message";

defineComponent({
  name: "DrawerAlbum"
});

interface AlbumReq extends SaveOrUpdateAlbum {
  link: LinkItem[];
}

const state = reactive({
  loading: {
    skeletonLoadingFlag: false
  },
  show: {
    albumPreviewPic: false
  },
  form: {
    uploadAlbum: { artistIds: [], link: [] } as AlbumReq
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
  pluginTask: {} as PluginTaskRes[],
  autocomplete: {
    albumArtistInputValue: ""
  }
});

const { VITE_PROXY_HOST } = import.meta.env;
const proxyHost = VITE_PROXY_HOST == null ? "" : VITE_PROXY_HOST;
const uploadPicAction = ref(`${proxyHost}/admin/pic/temp/upload`);
const previewPic = ref(`${proxyHost}/admin/pic/get/temp/`);
const picUpload = ref<UploadInstance>();

const props = defineProps<{
  modelValue: boolean;
}>();
const emit = defineEmits(["update:modelValue", "change"]);
const value = useVModel(props, "modelValue", emit);

// 上传封面
const handleExceed = (files: File[]) => {
  picUpload.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  picUpload.value!.handleStart(file);
};

const albumHandleSuccess = (response: any) => {
  state.form.uploadAlbum.tempFile = response.data;
  console.log(state.form.uploadAlbum.tempFile);
  message("上传成功", { type: "success" });
  picUpload.value!.clearFiles();
};

const albumSaveOrUpdate = async () => {
  const r = await saveOrUpdateAlbum(state.form.uploadAlbum);
  if (r.code === "200") {
    message("更新成功", { type: "success" });
    state.form.uploadAlbum = {} as AlbumReq;
    state.autocomplete.albumArtistInputValue = "";

    emit("change");
  } else {
    message(`更新失败${r.message}`, { type: "error" });
  }
};

// 歌手添加到保存数据中
const albumArtistHandleSelect = (item: LinkItem) => {
  state.form.uploadAlbum.link.push(item);
  state.form.uploadAlbum.artistIds.push(item.link);
  state.autocomplete.albumArtistInputValue = "";
};

// 获取专辑歌手数据
const albumArtistQuerySearchAsync = async (
  queryString: string,
  cb: (arg: any) => void
): Promise<any> => {
  const selectAlbumR = await getSelectSingerList(queryString);
  if (selectAlbumR.code === "200" && selectAlbumR.data.length !== 0) {
    cb(selectAlbumR.data);
  } else {
    setTimeout(() => cb([]), 200);
  }
};

// 删除歌手数据
const albumArtistHandleClose = index => {
  state.form.uploadAlbum.link.splice(index, 1);
  state.form.uploadAlbum.artistIds.splice(index, 1);
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
  <!--添加专辑侧栏-->
  <el-drawer
    v-model="value"
    :with-header="false"
    :before-close="handleClose"
    :show-close="false"
    size="40%"
  >
    <h1 class="mb-4">添加专辑侧栏</h1>
    <el-form
      label-position="right"
      label-width="auto"
      :model="state.form.uploadAlbum"
    >
      <el-form-item label="专辑名">
        <el-input v-model="state.form.uploadAlbum.albumName" />
      </el-form-item>
      <el-form-item label="封面">
        <div class="flex w-full gap-4">
          <el-input
            :disabled="true"
            v-model="state.form.uploadAlbum.tempFile"
          />
          <el-image-viewer
            v-if="state.show.albumPreviewPic"
            :url-list="[previewPic + state.form.uploadAlbum.tempFile]"
            @close="state.show.albumPreviewPic = false"
          />
          <el-button
            :disabled="
              state.form.uploadAlbum.tempFile == null ||
              state.form.uploadAlbum.tempFile === ''
            "
            @click="state.show.albumPreviewPic = true"
          >
            预览
          </el-button>
          <el-upload
            class="flex items-center justify-center"
            ref="picUpload"
            :data="{ type: 'album' }"
            :action="uploadPicAction"
            :limit="1"
            :show-file-list="false"
            :on-exceed="handleExceed"
            :on-success="albumHandleSuccess"
            :auto-upload="true"
          >
            <template #trigger>
              <el-button type="primary">点击上传封面</el-button>
            </template>
          </el-upload>
        </div>
      </el-form-item>
      <el-form-item label="专辑歌手(艺术家)">
        <el-tag
          v-for="(item, index) in state.form.uploadAlbum.link"
          :key="item.link"
          @close="albumArtistHandleClose(index)"
          effect="dark"
          closable
          round
          >{{ item.value }}
        </el-tag>
        <el-autocomplete
          class="w-full mt-1"
          v-model="state.autocomplete.albumArtistInputValue"
          :fetch-suggestions="albumArtistQuerySearchAsync"
          placeholder="请输入歌手名"
          @select="albumArtistHandleSelect"
        />
      </el-form-item>
      <el-form-item label="发布时间">
        <el-date-picker
          v-model="state.form.uploadAlbum.publishTime"
          type="date"
          value-format="YYYY-MM-DDT00:00:00"
          size="default"
          placeholder="点击选择发布时间"
        />
      </el-form-item>
      <el-form-item label="发行公司">
        <el-input v-model="state.form.uploadAlbum.company" />
      </el-form-item>
      <el-form-item label="专辑版本">
        <el-input v-model="state.form.uploadAlbum.subType" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input
          type="textarea"
          v-model="state.form.uploadAlbum.description"
        />
      </el-form-item>
      <el-form-item>
        <div class="flex flex-row-reverse w-full">
          <el-button type="primary" @click="albumSaveOrUpdate">保存</el-button>
        </div>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<style scoped lang="scss"></style>
