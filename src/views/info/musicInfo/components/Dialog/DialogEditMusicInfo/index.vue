<script setup lang="ts">
import { isAllEmpty } from "@pureadmin/utils";
import { dateFormater } from "@/utils/dateUtil";
import { MusicDetailInfo, saveOrUpdateMusic } from "@/api/music";
import { ref } from "vue";
import { message } from "@/utils/message";
import {
  genFileId,
  type UploadInstance,
  UploadProps,
  UploadRawFile
} from "element-plus";
import type { SaveOrUpdateMusic } from "@/api/model/Music";
import { UPLOAD_PIC_URL } from "@/utils/UploadProxyUrl";
import MusicTag from "@/views/info/musicInfo/components/Dialog/DialogEditMusicInfo/components/MusicTag/index.vue";
import AutocompleteAlbum from "@/views/info/musicInfo/components/Dialog/DialogEditMusicInfo/components/SelectInput/AutocompleteAlbum.vue";
import AutocompleteArtist from "@/views/info/musicInfo/components/Dialog/DialogEditMusicInfo/components/SelectInput/AutocompleteArtist.vue";
import LyricDialog from "@/views/info/musicInfo/components/Dialog/DialogEditMusicInfo/components/lyrics/LyricDialog.vue";

defineOptions({
  name: "DialogEditMusicInfo"
});

const value = defineModel({ type: Boolean });
const musicInfo = defineModel<MusicDetailInfo>("musicInfo");
const emits = defineEmits(["onSubmit"]);
const onSubmit = () => {
  emits("onSubmit");
};

const useUploadPic = () => {
  const picUpload = ref<UploadInstance>();
  const uploadPicHandleOnError = (error: Error) => {
    message(`${error.message}`, { type: "error" });
  };
  // 上传封面
  const handleExceed: UploadProps["onExceed"] = files => {
    picUpload.value!.clearFiles();
    const file = files[0] as UploadRawFile;
    file.uid = genFileId();
    picUpload.value!.handleStart(file);
  };
  return {
    picUpload,
    uploadPicHandleOnError,
    handleExceed
  };
};

const updateMusicButton = async () => {
  try {
    const music = musicInfo.value;
    const data: SaveOrUpdateMusic = {
      id: music.id,
      musicName: music.musicName,
      aliasName: music.aliasName,
      albumId: music?.album?.albumId,
      timeLength: music.timeLength,
      musicTag: Array.from(new Set(music?.musicTag ?? [])),
      musicGenre: Array.from(new Set(music?.musicGenre ?? [])),
      artistIds: music?.artists?.map(v => v.id)
    };
    const r = await saveOrUpdateMusic(data);
    if (r.code === "200") {
      message("更新成功", { type: "success" });
      value.value = false;
      onSubmit();
    } else {
      message(`更新失败${r.message}`, { type: "error" });
    }
  } catch (e) {
    message(`请求失败: ${e}`, { type: "error" });
  }
};

function useLyrics() {
  type TypeLyrics = "lyric" | "klyric" | "tlyric";
  const lyricsFlag = ref<boolean>(false);
  const LyricsType: TypeLyrics = "lyric";
  const KLyricsType: TypeLyrics = "klyric";
  const TLyricsType: TypeLyrics = "tlyric";
  const lyricTypeRef = ref<TypeLyrics>(LyricsType);
  return {
    lyricsFlag,
    LyricsType,
    KLyricsType,
    TLyricsType,
    lyricTypeRef
  };
}

const { lyricsFlag, LyricsType, KLyricsType, lyricTypeRef } = useLyrics();

const { picUpload, handleExceed, uploadPicHandleOnError } = useUploadPic();
</script>

<template>
  <LyricDialog
    v-model="lyricsFlag"
    v-model:lyrics="musicInfo.lyrics"
    v-model:type="lyricTypeRef"
    :music-id="musicInfo.id"
    @onSubmit="onSubmit"
  />
  <el-dialog v-model="value" :show-close="false">
    <el-scrollbar height="20rem">
      <ElForm label-position="top">
        <ElFormItem label="音乐名">
          <el-input v-model="musicInfo.musicName" />
        </ElFormItem>
        <ElFormItem label="音乐别名">
          <el-input v-model="musicInfo.aliasName" />
        </ElFormItem>
        <ElFormItem label="流派">
          <MusicTag v-model="musicInfo.musicGenre" />
        </ElFormItem>
        <ElFormItem label="音乐Tag">
          <MusicTag v-model="musicInfo.musicTag" />
        </ElFormItem>
        <ElFormItem label="封面">
          <div class="flex w-full gap-4">
            <el-input v-model="musicInfo.picUrl" :disabled="true" />
            <el-upload
              ref="picUpload"
              class="flex justify-center items-center"
              :data="{ id: musicInfo.id, type: 'music' }"
              :action="UPLOAD_PIC_URL"
              :limit="1"
              :show-file-list="false"
              :on-error="uploadPicHandleOnError"
              :on-exceed="handleExceed"
              :on-success="onSubmit"
              :auto-upload="true"
            >
              <template #trigger>
                <el-button type="primary">上传图片</el-button>
              </template>
            </el-upload>
          </div>
        </ElFormItem>
        <ElFormItem label="歌手">
          <AutocompleteArtist v-model="musicInfo.artists" />
        </ElFormItem>
        <ElFormItem label="专辑">
          <template #label="{ label }">
            <div>
              <span>{{ label }}</span>
              <span class="opacity-50 ml-4"
                >#符号仅提示,防止相同专辑名引起用户选择困扰</span
              >
            </div>
          </template>
          <AutocompleteAlbum v-model="musicInfo.album" />
        </ElFormItem>
        <ElFormItem label="歌词">
          <div class="w-full flex-ac">
            <div class="flex items-center flex-nowrap">
              <el-tag
                :type="
                  musicInfo.lyrics && isAllEmpty(musicInfo?.lyrics[LyricsType])
                    ? 'info'
                    : 'primary'
                "
              >
                普通歌词
              </el-tag>
              <el-button
                class="ml-2"
                type="primary"
                round
                @click="
                  lyricsFlag = true;
                  lyricTypeRef = LyricsType;
                "
              >
                修改
              </el-button>
            </div>
            <div class="flex items-center flex-nowrap">
              <el-tag
                :type="
                  musicInfo.lyrics && isAllEmpty(musicInfo.lyrics[KLyricsType])
                    ? 'info'
                    : 'primary'
                "
              >
                逐字歌词
              </el-tag>
              <el-button
                class="ml-2"
                type="primary"
                round
                @click="
                  lyricsFlag = true;
                  lyricTypeRef = KLyricsType;
                "
                >修改
              </el-button>
            </div>
          </div>
        </ElFormItem>
        <ElFormItem label="音乐时长">
          <template #label="{ label }">
            <div>
              <span>{{ label }}(毫秒值)</span>
            </div>
          </template>
          <div class="flex justify-between w-full">
            <div class="font-bold">显示音乐毫秒，可以手动修改</div>
            <div>
              <span class="text-xl font-bold">
                {{ dateFormater("mm:ss", musicInfo.timeLength) }}
              </span>
              <ElInputNumber
                v-model="musicInfo.timeLength"
                class="ml-4"
                :step="1000"
              />
            </div>
          </div>
        </ElFormItem>
      </ElForm>
    </el-scrollbar>
    <template #footer>
      <el-button plain bg text @click="value = false">取消</el-button>
      <el-button type="primary" @click="updateMusicButton">更新</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
/* 修改 label 的字体大小和大写显示 */
:deep(.el-form-item label) {
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.75rem;
}
</style>
