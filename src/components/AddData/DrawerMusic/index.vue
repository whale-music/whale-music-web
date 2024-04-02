<script lang="ts" setup>
import ArrowDownBold from "@iconify-icons/ep/arrow-down-bold";
import CircleClose from "@iconify-icons/ep/circle-close";
import { useVModel } from "@vueuse/core";
import {
  ElMessageBox,
  genFileId,
  UploadInstance,
  UploadRawFile
} from "element-plus";
import { defineComponent, reactive, ref } from "vue";

import { getSelectAlbumList } from "@/api/album";
import { Count } from "@/api/hone";
import { AlbumConvert, SelectAlbum } from "@/api/model/Album";
import { ArtistConvert, SelectArtist } from "@/api/model/Artist";
import { R } from "@/api/model/common";
import { AudioInfoRes } from "@/api/model/Music";
import { SaveMusic, saveMusic } from "@/api/music";
import { getSelectSingerList } from "@/api/singer";
import { message } from "@/utils/message";

defineComponent({
  name: "DrawerMusic"
});

const state = reactive({
  loading: {
    skeletonLoadingFlag: false
  },
  show: {
    uploadMusicFlag: false,
    sourceInfoFlag: false,
    musicPreviewPic: false
  },
  select: {
    musicSelectArtist: [] as SelectArtist[],
    musicSelectAlbum: {} as SelectAlbum
  },
  form: {
    uploadMusicInfo: { artistIds: [], resource: {} } as SaveMusic
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
  autocomplete: {
    musicArtistInputValue: "",
    albumSearch: ""
  }
});
const { VITE_PROXY_HOST } = import.meta.env;
const proxyHost = VITE_PROXY_HOST == null ? "" : VITE_PROXY_HOST;
const uploadAction = ref(`${proxyHost}/admin/music/upload/music/file`);
const uploadPicAction = ref(`${proxyHost}/admin/pic/temp/upload`);
const previewPic = ref(`${proxyHost}/admin/pic/get/temp/`);
const musicPicUpload = ref<UploadInstance>();
const musicFileUpload = ref<UploadInstance>();
const picUpload = ref<UploadInstance>();

const props = defineProps<{
  modelValue: boolean;
}>();
const emit = defineEmits(["update:modelValue", "change"]);
const value = useVModel(props, "modelValue", emit);

const handleClose = (done: () => void) => {
  ElMessageBox.confirm("确认退出吗？")
    .then(() => {
      done();
    })
    .catch(() => {
      // catch error
    });
};

const updateMusicButton = async () => {
  const r = await saveMusic(state.form.uploadMusicInfo);
  if (r.code === "200") {
    message("上传成功", { type: "success" });
    cleanUploadMusicInfo();

    emit("change");
  } else {
    message(`更新失败${r.message}`, { type: "error" });
  }
};

// 删除歌手数据
const musicArtistHandleClose = index => {
  state.select.musicSelectArtist.splice(index, 1);
  state.form.uploadMusicInfo.artistIds.splice(index, 1);
};

// 获取歌手数据
const musicArtistQuerySearchAsync = async (
  queryString: string,
  cb: (arg: any) => void
): Promise<any> => {
  const selectArtist = await getSelectSingerList(queryString);
  if (selectArtist.code === "200" && selectArtist.data.length !== 0) {
    cb(selectArtist.data);
  } else {
    setTimeout(() => cb([]), 200);
  }
};

// 歌手添加到保存数据中
const musicArtistHandleSelect = (item: SelectArtist) => {
  state.select.musicSelectArtist.push(item);
  state.form.uploadMusicInfo.artistIds.push(item.id);
  state.autocomplete.musicArtistInputValue = "";
};

// 专辑搜索
const albumQuerySearchAsync = async (
  queryString: string,
  cb: (arg: any) => void
): Promise<any> => {
  const selectAlbumR = await getSelectAlbumList(queryString);
  if (selectAlbumR.code === "200" && selectAlbumR.data.length !== 0) {
    cb(selectAlbumR.data);
  } else {
    setTimeout(() => cb([]), 200);
  }
};

// 选择专辑
const musicAlbumHandleSelect = (item: SelectAlbum) => {
  state.select.musicSelectAlbum = item;
  state.form.uploadMusicInfo.albumId = item.link;
};

const musicHandleSuccess = (response: any) => {
  state.form.uploadMusicInfo.tempPicFile = response.data;
  message("上传成功", { type: "success" });
  picUpload.value!.clearFiles();
};

const uploadMusicOnSuccess = (response: R<AudioInfoRes>) => {
  if (response.code === "200") {
    state.form.uploadMusicInfo.musicName = response.data.musicName;
    state.form.uploadMusicInfo.aliasName = response.data.aliasName;
    state.form.uploadMusicInfo.tempMusicFile = response.data.musicFileTemp;

    state.form.uploadMusicInfo.resource = response.data;
    state.form.uploadMusicInfo.timeLength = response.data.timeLength;
  } else {
    message("上传音乐文件错误", { type: "error" });
  }
};

const cleanUploadMusicInfo = () => {
  state.autocomplete.albumSearch = "";
  state.form.uploadMusicInfo = {} as any;
  state.form.uploadMusicInfo.resource = {} as any;
  musicFileUpload.value.clearFiles();

  cleanMusicAlbumAutocompleteInput();
};

// 清除音乐上传中的各种信息
const cleanMusicAlbumAutocompleteInput = () => {
  state.autocomplete.albumSearch = "";
  musicAlbumChange(state.autocomplete.albumSearch);
  state.select.musicSelectArtist = [];
};

const musicAlbumChange = (value: string | number) => {
  if (value === "") {
    state.select.musicSelectAlbum = {} as any;
  }
};

// 上传封面
const handleExceed = (files: File[]) => {
  picUpload.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  picUpload.value!.handleStart(file);
};
</script>

<template>
  <!--添加音乐侧栏-->
  <el-drawer
    v-model="value"
    :with-header="false"
    :before-close="handleClose"
    :show-close="false"
    size="40%"
  >
    <h1>上传音乐信息</h1>
    <el-upload
      ref="musicFileUpload"
      class="upload-demo"
      drag
      multiple
      :action="uploadAction"
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
      <div class="el-upload__text">
        托动音乐文件到此 或 <em>点击上传音乐</em>
      </div>
    </el-upload>
    <div class="flex items-center justify-between">
      <h1 class="mb-4">音乐信息</h1>
      <el-button type="danger" @click="cleanUploadMusicInfo">清除</el-button>
    </div>
    <el-form
      label-position="right"
      label-width="auto"
      :model="state.form.uploadMusicInfo"
    >
      <el-form-item label="音乐名">
        <el-input
          v-model="state.form.uploadMusicInfo.musicName"
          placeholder="输入歌曲名"
        />
      </el-form-item>
      <el-form-item label="别名">
        <el-input
          v-model="state.form.uploadMusicInfo.aliasName"
          placeholder="输入歌曲名别名"
        />
      </el-form-item>
      <el-form-item label="封面">
        <div class="flex w-full gap-4">
          <el-input
            v-model="state.form.uploadMusicInfo.tempPicFile"
            :disabled="true"
          />
          <el-image-viewer
            v-if="state.show.musicPreviewPic"
            :url-list="[previewPic + state.form.uploadMusicInfo.tempPicFile]"
            @close="state.show.musicPreviewPic = false"
          />
          <el-button
            :disabled="
              state.form.uploadMusicInfo.tempPicFile == null ||
              state.form.uploadMusicInfo.tempPicFile === ''
            "
            @click="state.show.musicPreviewPic = true"
            >预览
          </el-button>
          <el-upload
            ref="musicPicUpload"
            class="flex items-center justify-center"
            :action="uploadPicAction"
            :on-exceed="handleExceed"
            :on-success="musicHandleSuccess"
            :show-file-list="false"
            :auto-upload="true"
          >
            <template #trigger>
              <el-button type="primary">点击上传封面</el-button>
            </template>
          </el-upload>
        </div>
      </el-form-item>
      <el-form-item label="歌手(艺术家)">
        <div class="flex gap-2">
          <el-tag
            v-for="(item, index) in state.select.musicSelectArtist"
            :key="item.id"
            effect="dark"
            closable
            round
            @close="musicArtistHandleClose(index)"
          >
            {{ item.artistName }}
          </el-tag>
        </div>
        <el-autocomplete
          v-model="state.autocomplete.musicArtistInputValue"
          style="width: 100%"
          :fetch-suggestions="musicArtistQuerySearchAsync"
          placeholder="输入歌手名"
          @select="musicArtistHandleSelect"
        />
      </el-form-item>
      <el-form-item label="专辑">
        <div class="flex gap-4">
          <el-tag
            v-for="item in state.select.musicSelectAlbum.artists"
            :key="item.id"
            type="success"
            effect="dark"
            :round="true"
            :underline="false"
          >
            {{ item.artistName }}
          </el-tag>
        </div>
        <el-autocomplete
          v-model="state.autocomplete.albumSearch"
          class="w-full mt-1"
          :fetch-suggestions="albumQuerySearchAsync"
          placeholder="请输入专辑名"
          @change="musicAlbumChange"
          @select="musicAlbumHandleSelect"
        >
          <template #default="{ item }">
            <span v-html="item.display" />
          </template>
          <template #suffix>
            <IconifyIconOffline
              v-if="state.autocomplete.albumSearch !== ''"
              :icon="CircleClose"
              @click="cleanMusicAlbumAutocompleteInput"
            />
          </template>
        </el-autocomplete>
      </el-form-item>
    </el-form>

    <div class="flex items-center justify-between cursor-pointer">
      <div
        class="flex-c"
        @click="state.show.sourceInfoFlag = !state.show.sourceInfoFlag"
      >
        <span>显示音乐源</span>
        <IconifyIconOffline :icon="ArrowDownBold" />
      </div>
      <el-button type="primary" @click="updateMusicButton">保存</el-button>
    </div>
    <el-collapse-transition>
      <div v-show="state.show.sourceInfoFlag">
        <el-form
          label-position="right"
          label-width="auto"
          :model="state.form.uploadMusicInfo.resource"
        >
          <el-form-item label="音乐时长">
            <el-input v-model="state.form.uploadMusicInfo.timeLength" />
          </el-form-item>
          <el-form-item label="比特率">
            <el-input v-model="state.form.uploadMusicInfo.resource.rate" />
          </el-form-item>
          <el-form-item label="音乐临时路径">
            <el-input v-model="state.form.uploadMusicInfo.tempMusicFile" />
          </el-form-item>
          <el-form-item label="音乐等级">
            <el-input v-model="state.form.uploadMusicInfo.resource.level" />
          </el-form-item>
          <el-form-item label="音乐格式">
            <el-input
              v-model="state.form.uploadMusicInfo.resource.encodeType"
            />
          </el-form-item>
          <el-form-item label="md5">
            <el-input v-model="state.form.uploadMusicInfo.resource.md5" />
          </el-form-item>
          <el-form-item label="size">
            <el-input v-model="state.form.uploadMusicInfo.resource.size" />
          </el-form-item>
        </el-form>
      </div>
    </el-collapse-transition>
  </el-drawer>
</template>
