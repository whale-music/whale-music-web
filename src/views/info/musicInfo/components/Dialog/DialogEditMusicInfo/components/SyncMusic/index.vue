<script setup lang="ts">
import { message } from "@/utils/message";
import {
  ElLoading,
  genFileId,
  UploadFile,
  type UploadInstance,
  type UploadProps,
  type UploadRawFile
} from "element-plus";
import { MusicDetailInfo, MusicMetaData, syncMetaMusicFile } from "@/api/music";
import { computed, reactive, ref } from "vue";
import { isAllEmpty } from "@pureadmin/utils";

defineOptions({
  name: "SyncMusic"
});

const value = defineModel<boolean>();
const musicInfo = defineModel<MusicDetailInfo>("musicInfo", { required: true });

const metaDataMusic = ref<MusicMetaData>({
  albumArtist: "",
  albumName: "",
  genre: "",
  lyric: "",
  musicAliasName: "",
  musicArtist: "",
  musicName: "",
  picBase64: "",
  picUrl: "",
  resourceId: null,
  tag: "",
  year: ""
});
const selectResource = ref<number>();

const albumName = computed(() => musicInfo.value?.album?.albumName);
const musicGenre = computed(() => musicInfo.value?.musicGenre?.join(","));
const musicTag = computed(() => musicInfo.value?.musicTag?.join(","));

const albumArtistNames = computed(() =>
  musicInfo.value?.album?.artist?.map(value => value.artistName).join(",")
);
const musicArtistNames = computed(() =>
  musicInfo.value?.artists?.map(value => value.artistName).join(",")
);
const musicLyricValue = computed(
  () => musicInfo.value?.lyrics?.get("lyric").lyric
);
const musicPublishTime = computed(() =>
  isAllEmpty(musicInfo.value.publishTime)
    ? null
    : new Date(musicInfo.value.publishTime).toLocaleDateString()
);

const SelectSource = () => {
  const cleanMetaDataChange = () => {
    metaDataMusic.value = {} as MusicMetaData;
    selectResource.value = null;
  };

  const selectMetaDataChange = () => {
    if (isAllEmpty(selectResource.value)) {
      message("请选择音源", { type: "error" });
      return;
    }
    const _music = musicInfo.value;
    const m = metaDataMusic.value;

    m.resourceId = selectResource.value;
    m.musicName = _music.musicName;
    m.picUrl = _music.picUrl;
    m.musicAliasName = _music.aliasName;
    m.albumName = _music.album?.albumName;
    m.musicArtist = musicArtistNames.value;
    m.albumArtist = albumArtistNames.value;
    m.lyric = musicLyricValue.value;
    m.year = musicPublishTime.value;
    m.genre = musicGenre.value;
    m.tag = musicTag.value;
  };

  const syncMetaMusic = () => {
    if (!isAllEmpty(selectResource.value)) {
      message("请选择音源", { type: "error" });
      return;
    }
    if (metaDataMusic.value.musicName === "") {
      message("请输入音乐元数据", { type: "error" });
      return;
    }
    const loading = ElLoading.service({
      lock: true,
      text: "写入中",
      background: "rgba(0, 0, 0, 0.7)"
    });
    syncMetaMusicFile(metaDataMusic.value)
      .then(() => {
        message(`写入成功`, { type: "success" });
        loading.close();
        cleanMetaDataChange();
        selectResource.value = null;
      })
      .catch(() => {
        loading.close();
      });
  };
  return {
    cleanMetaDataChange,
    selectMetaDataChange,
    syncMetaMusic
  };
};

const UploadFile = () => {
  const metaUpload = reactive({
    title: "",
    flag: false,
    imageViewerFlag: false
  });
  // 不为空
  const picBase64Flag = computed(() => !metaDataMusic.value.picBase64);
  const getMetaDataPicBase = async (file: UploadFile) => {
    const isJPG = file.raw.type === "image/jpeg";
    const isPNG = file.raw.type === "image/png";
    if (!isJPG && !isPNG) {
      message("上传图片只能是JPG或者PNG格式!", { type: "error" });
      return;
    }
    if (isJPG || isPNG) {
      const loading = ElLoading.service({
        lock: true,
        text: "写入中",
        background: "rgba(0, 0, 0, 0.7)"
      });
      try {
        const res = await getBase64(file.raw);
        // base64赋值给meta数据
        metaDataMusic.value.picBase64 = isAllEmpty(res) ? null : String(res);
        loading.close();
      } catch (e) {
        message(e, { type: "error" });
        loading.close();
      }
    }
  };
  function getBase64(
    file: UploadRawFile
  ): Promise<string | ArrayBuffer | null> {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      let imgResult: string | ArrayBuffer | null = "";
      reader.readAsDataURL(file);
      reader.onload = function () {
        imgResult = reader.result;
      };
      reader.onerror = function (error) {
        reject(error);
      };
      reader.onloadend = function () {
        resolve(imgResult);
      };
    });
  }

  const metaDataUploadPic = ref<UploadInstance>();
  const metaDataUploadHandleExceed: UploadProps["onExceed"] = files => {
    metaDataUploadPic.value!.clearFiles();
    const file = files[0] as UploadRawFile;
    file.uid = genFileId();
    metaDataUploadPic.value!.handleStart(file);
  };
  return {
    getMetaDataPicBase,
    metaDataUploadHandleExceed,
    metaDataUploadPic,
    picBase64Flag,
    metaUpload
  };
};

const {
  getMetaDataPicBase,
  metaDataUploadHandleExceed,
  metaDataUploadPic,
  picBase64Flag,
  metaUpload
} = UploadFile();
const { cleanMetaDataChange, selectMetaDataChange, syncMetaMusic } =
  SelectSource();
</script>

<template>
  <!--同步音乐元数据-->
  <el-dialog v-model="value">
    <el-scrollbar height="20rem">
      <template #header>
        <h1>同步音乐文件元数据</h1>
      </template>
      <el-form label-position="top">
        <el-form-item label="选择音源">
          <el-select
            v-model="selectResource"
            placeholder="选择音源"
            @change="selectMetaDataChange"
          >
            <el-option
              v-for="item in musicInfo.sources"
              :key="item.id"
              :label="item.level"
              :value="item.id"
            />
          </el-select>
          <div class="w-full mt-2 flex flex-row-reverse">
            <el-form-item>
              <el-button type="primary" @click="selectMetaDataChange"
                >复制</el-button
              >
              <el-button type="danger" @click="cleanMetaDataChange"
                >清除</el-button
              >
            </el-form-item>
          </div>
          <div class="flex w-full gap-8">
            <el-form label-position="top" class="w-full">
              <el-form-item label="音乐名">
                <el-input v-model="musicInfo.musicName" disabled />
              </el-form-item>
              <el-form-item label="音乐别名">
                <el-input v-model="musicInfo.aliasName" disabled />
              </el-form-item>
              <el-form-item label="封面">
                <el-input v-model="musicInfo.picUrl" disabled />
              </el-form-item>
              <el-form-item label="专辑名">
                <el-input v-model="albumName" disabled />
              </el-form-item>
              <el-form-item label="音乐歌手">
                <el-input v-model="musicArtistNames" disabled />
              </el-form-item>
              <el-form-item label="专辑歌手">
                <el-input v-model="albumArtistNames" disabled />
              </el-form-item>
              <el-form-item label="歌词">
                <el-input v-model="musicLyricValue" disabled type="textarea" />
              </el-form-item>
              <el-form-item label="发布时间">
                <el-input v-model="musicPublishTime" disabled />
              </el-form-item>
              <el-form-item label="流派">
                <el-input v-model="musicGenre" disabled />
              </el-form-item>
              <el-form-item label="tag">
                <el-input v-model="musicTag" disabled />
              </el-form-item>
            </el-form>
            <el-form label-position="top" class="w-full">
              <el-form-item label="音乐名">
                <el-input v-model="metaDataMusic.musicName" />
              </el-form-item>
              <el-form-item label="音乐别名">
                <el-input v-model="metaDataMusic.musicAliasName" />
              </el-form-item>
              <el-form-item>
                <div class="w-full flex justify-between">
                  <b>封面</b>
                  <el-switch
                    v-model="metaUpload.flag"
                    active-text="封面文件上传"
                    inactive-text="封面url上传"
                  />
                </div>
                <div v-if="metaUpload.flag" class="w-full flex gap-1">
                  <el-image-viewer
                    v-if="metaUpload.imageViewerFlag"
                    :url-list="[metaDataMusic.picBase64]"
                    @close="metaUpload.imageViewerFlag = false"
                  />
                  <el-button
                    type="primary"
                    class="w-1/2"
                    :disabled="picBase64Flag"
                    @click="metaUpload.imageViewerFlag = true"
                  >
                    预览
                  </el-button>
                  <el-upload
                    ref="metaDataUploadPic"
                    class="w-1/2"
                    :limit="1"
                    :on-exceed="metaDataUploadHandleExceed"
                    :on-change="getMetaDataPicBase"
                    :show-file-list="false"
                    :auto-upload="false"
                  >
                    <template #trigger>
                      <el-button type="success" class="w-full">上传</el-button>
                    </template>
                  </el-upload>
                </div>
                <el-input v-else v-model="metaDataMusic.picUrl" />
              </el-form-item>
              <el-form-item label="专辑名">
                <el-input v-model="metaDataMusic.albumName" />
              </el-form-item>
              <el-form-item label="音乐歌手">
                <el-input v-model="metaDataMusic.musicArtist" />
              </el-form-item>
              <el-form-item label="专辑歌手">
                <el-input v-model="metaDataMusic.albumArtist" />
              </el-form-item>
              <el-form-item label="歌词">
                <el-input v-model="metaDataMusic.lyric" type="textarea" />
              </el-form-item>
              <el-form-item label="发布时间">
                <el-input v-model="metaDataMusic.year" />
              </el-form-item>
              <el-form-item label="流派">
                <el-input v-model="metaDataMusic.genre" />
              </el-form-item>
              <el-form-item label="tag">
                <el-input v-model="metaDataMusic.tag" />
              </el-form-item>
            </el-form>
          </div>
        </el-form-item>
      </el-form>
    </el-scrollbar>
    <template #footer>
      <el-button plain bg text @click="value = false">取消</el-button>
      <el-button type="primary" @click="syncMetaMusic">更新</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
:deep(.el-upload) {
  width: 100%;
}
</style>
