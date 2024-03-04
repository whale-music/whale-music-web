<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import Loading3Fill from "@iconify-icons/mingcute/loading-3-fill";
import { clone, downloadByData, useCopyToClipboard } from "@pureadmin/utils";
import axios from "axios";
import type { UploadInstance, UploadProps, UploadRawFile } from "element-plus";
import { ElLoading, ElMessage, ElMessageBox, genFileId } from "element-plus";
import { computed, onMounted, reactive, ref, unref, watch } from "vue";
import { useRouter } from "vue-router";

import { getSelectAlbumList } from "@/api/album";
import { SelectAlbum } from "@/api/model/Album";
import { ArtistConvert, SelectArtist } from "@/api/model/Artist";
import { Resource, SaveOrUpdateMusic } from "@/api/model/Music";
import {
  deleteSourceMusic,
  getMusicInfo,
  getMusicLyric,
  getMusicUrl,
  manualUploadMusic,
  MusicDetailInfo,
  MusicMetaData,
  MusicUrlInfo,
  saveOrUpdateLyric,
  saveOrUpdateMusic,
  selectResources,
  syncMetaMusicFile,
  updateSourceMusic,
  UploadManualMusic
} from "@/api/music";
import { getUserPlayList, UserPlayListRes } from "@/api/playlist";
import { getSelectSingerList } from "@/api/singer";
import PlayIcon from "@/assets/svg/play.svg?component";
import AddMusicToPlayList from "@/components/addMusicToPlayList/addMusicToPlayList.vue";
import LoadImg from "@/components/LoadImg/LoadImg.vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { useNav } from "@/layout/hooks/useNav";
import { usePlaySongListStoreHook } from "@/store/modules/playSongList";
import { getUserData } from "@/utils/auth";
import { dateFormater } from "@/utils/dateUtil";
import { message } from "@/utils/message";
import { emitter } from "@/utils/mitt";

const { VITE_PROXY_HOST } = import.meta.env;

const { onPlayMusic } = useNav();
const router = useRouter();
const id = ref();

// 监听容器
emitter.on("resize", ({ detail }) => {
  const { width } = detail;
  reLayout(width);
});

const reLayout = (width: number) => {
  state.operateButton = width < 720;
  if (width < 720) {
    state.dialog.width = "90%";
  } else {
    state.dialog.width = "45%";
  }
};

const picUpload = ref<UploadInstance>();

const state = reactive({
  operateButton: false,
  loading: {
    selectMd5: false
  },
  input: {
    selectMd5: ""
  },
  selectPreview: {
    artist: {} as ArtistConvert[],
    album: {
      albumName: ""
    } as SelectAlbum,
    albumName: ""
  },
  syncMusicMetaData: "",
  musicInfo: {
    albumArtist: [],
    albumId: 0,
    albumName: "",
    createTime: "",
    id: null,
    musicArtist: [],
    musicName: "",
    aliasName: "",
    order: false,
    pic: undefined,
    publishTime: "",
    timeLength: 0
  } as MusicDetailInfo,
  modifyMusicInfo: {
    albumId: null,
    aliasName: "",
    musicGenre: "",
    musicTag: "",
    artistIds: [],
    createTime: "",
    id: null,
    musicName: "",
    picUrl: "",
    resource: undefined,
    sort: 0,
    tempMusicFile: "",
    tempPicFile: "",
    timeLength: 0,
    updateTime: "",
    userId: null
  } as SaveOrUpdateMusic,
  metaDataMusic: { picBase64: undefined } as MusicMetaData,
  metaUpload: {
    title: "",
    flag: false,
    imageViewerFlag: false
  },
  visible: {
    musicSelectResourcePath: false
  },
  listResource: {
    data: []
  },
  dialog: {
    width: "45%"
  }
});

const musicUrl = ref<MusicUrlInfo[]>();

async function intiGetMusicLyric() {
  musicUrl.value = (await getMusicUrl(String(state.musicInfo.id))).data;
}

const skeletonLoadingFlag = ref();

async function initInfo() {
  skeletonLoadingFlag.value = true;
  const _musicInfo = await getMusicInfo(id.value);

  // 显示和更新数据分离
  state.musicInfo = _musicInfo.data;
  state.modifyMusicInfo = clone(_musicInfo.data, true);
  state.modifyMusicInfo.musicTag = _musicInfo.data.musicTag
    .map(value => value)
    .join(",");
  state.modifyMusicInfo.artistIds = _musicInfo.data.musicArtist.map(
    value => value.id
  );
  state.selectPreview.artist = clone(_musicInfo.data.musicArtist, true);
  state.selectPreview.album.artists = clone(_musicInfo.data.albumArtist, true);
  state.selectPreview.album.albumName = clone(_musicInfo.data.albumName, true);

  await intiGetMusicLyric();
  skeletonLoadingFlag.value = false;

  const width =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;
  reLayout(width);

  getLyricList();
}

onMounted(async () => {
  id.value = useRouter().currentRoute.value.query.id;
  await initInfo();
});

const { clipboardValue, copied } = useCopyToClipboard();
function copy(value) {
  if (value == null || value === "") {
    message("空地址", { type: "error" });
    return;
  }
  clipboardValue.value = unref(value);
  if (copied.value) {
    message("拷贝成功", { type: "success" });
  }
}

function copyData(data: string) {
  clipboardValue.value = unref(data);
  if (copied.value) {
    message("拷贝成功", { type: "success" });
  } else {
    message("拷贝失败", { type: "error" });
  }
}

const playMusic = () => {
  for (const musicUrlInfo of musicUrl.value) {
    // 只取第一条数据
    if (musicUrlInfo !== null && musicUrlInfo.rawUrl !== "") {
      toMusicPlay(musicUrlInfo);
      return;
    }
  }
  message("播放失败，无音源", { type: "error" });
};

const download = (name, suffix, url) => {
  axios
    .get(url, {
      responseType: "blob"
    })
    .then(({ data }) => {
      downloadByData(data, `${name}.${suffix}`);
    });
};

const editSourceFlag = ref<boolean>(false);
const editSourceValue = ref<Resource>({
  createTime: "",
  encodeType: "",
  id: 0,
  level: "",
  md5: "",
  musicId: 0,
  rate: 0,
  size: 0,
  updateTime: "",
  path: "",
  userId: 0
});
const editSource = async (url: Resource) => {
  editSourceFlag.value = true;
  editSourceValue.value = url;
};
const updateSource = async () => {
  try {
    const r = await updateSourceMusic(editSourceValue.value);
    if (r.code === "200") {
      message("更新成功", { type: "success" });
    } else {
      message("更新失败", { type: "error" });
    }
  } catch (e) {
    editSourceFlag.value = false;
  }
  editSourceFlag.value = false;
};

const deleteSource = async (id: number, index: number) => {
  ElMessageBox.confirm("是否删除音源", "确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "error"
  }).then(async () => {
    const r = await deleteSourceMusic(id);
    if (r.code === "200") {
      message("删除成功", { type: "success" });
      musicUrl.value.splice(index, 1);
    } else {
      message(`删除失败${r.message}`, { type: "success" });
    }
  });
};

const playItemDialogVisible = ref(false);
const addMusicId = ref<number>();
const userPlayItem = ref<UserPlayListRes[]>();
const userInfo = getUserData();
const getUserPlayInfo = (id: number) => {
  addMusicId.value = id;
  getUserPlayList(userInfo.id).then(res => {
    playItemDialogVisible.value = true;
    userPlayItem.value = res.data;
  });
};

const addPlaySongList = async () => {
  console.log("添加到播放歌单");
  await usePlaySongListStoreHook().addMusicToNextPlaySongList(
    state.musicInfo.id
  );
  message("成功添加音乐到歌单", { type: "success" });
};

const editMusicInfoFlag = ref<boolean>(false);

const addSoundSourceFlag = ref<boolean>(false);
const syncMusicMetaDataFlag = ref<boolean>(false);
const switchUploadFlag = ref<boolean>(false);

const tempSource = {
  createTime: "",
  encodeType: "",
  id: 0,
  level: "",
  md5: "",
  musicId: 0,
  name: "",
  path: "",
  rate: null,
  size: null,
  updateTime: "",
  userId: null
};
const addSource = ref<UploadManualMusic>(tempSource);
const addSourceLoadingBottomFlag = ref<boolean>(false);
const addSoundSource = async () => {
  console.log("添加音源");
  try {
    addSourceLoadingBottomFlag.value = true;
    addSource.value.musicId = state.musicInfo.id;
    addSource.value.userId = parseInt(userInfo.id);
    const r = await manualUploadMusic(addSource.value);
    if (r.code === "200") {
      message("上传成功", { type: "success" });
      addSoundSourceFlag.value = false;
      await intiGetMusicLyric();
      addSource.value = clone(tempSource);
    } else {
      message(`上传失败${r.message}`, { type: "error" });
    }
  } catch (e) {
    message(`请求失败${e}`, { type: "error" });
  }
  addSourceLoadingBottomFlag.value = false;
};

// 获取歌手数据
const musicArtistQuerySearchAsync = async (
  queryString: string,
  cb: (arg: any) => void
) => {
  const selectArtists = await getSelectSingerList(queryString);
  if (selectArtists.code === "200" && selectArtists.data.length !== 0) {
    cb(selectArtists.data);
  }
};

const musicArtistSearch = ref<string>("");
// 歌手添加到保存数据中
const musicArtistHandleSelect = (item: SelectArtist) => {
  if (
    state.selectPreview.artist.findIndex(value => value.id === item.id) === -1
  ) {
    state.selectPreview.artist.push(item);
  }

  if (
    state.modifyMusicInfo.artistIds.findIndex(value => value === item.id) === -1
  ) {
    state.modifyMusicInfo.artistIds.push(item.id);
  }
  musicArtistSearch.value = "";
};

// 删除歌手数据
const musicArtistHandleClose = index => {
  state.modifyMusicInfo.artistIds.splice(index, 1);
  state.selectPreview.artist.splice(index, 1);
};

// 专辑搜索
const albumQuerySearchAsync = async (
  queryString: string,
  cb: (arg: any) => void
) => {
  const selectAlbumR = await getSelectAlbumList(queryString);
  if (selectAlbumR.code === "200" && selectAlbumR.data.length !== 0) {
    cb(selectAlbumR.data);
  } else {
    cb([]);
  }
};

// 选择专辑
const albumHandleSelect = (item: SelectAlbum) => {
  state.selectPreview.album = item;
  state.modifyMusicInfo.albumId = item.id;
};

watch(
  () => state.selectPreview.album.albumName,
  value => {
    if (value === "") {
      state.selectPreview.album.artists = [];
      state.modifyMusicInfo.albumId = null;
    }
  }
);

const lyricType = ref("lyric");
const klyricType = ref("klyric");

const lyricValueFlag = ref<boolean>(false);
const kLyricValueFlag = ref<boolean>(false);
const lyricValue = ref<string>("");
const kLyricValue = ref<string>("");
const getLyricList = async () => {
  const r = await getMusicLyric(state.musicInfo.id.toString());
  const lyricIndex = r.data.findIndex(value => value.type === lyricType.value);
  const kyricIndex = r.data.findIndex(value => value.type === klyricType.value);
  lyricValue.value = r.data[lyricIndex]?.lyric;
  kLyricValue.value = r.data[kyricIndex]?.lyric;
};
const updateLyric = async (type: string, lyric: string) => {
  try {
    const r = await saveOrUpdateLyric(state.musicInfo.id, type, lyric);
    if (r.code === "200") {
      message("更新成功", { type: "success" });
    } else {
      message(`更新失败${r.message}`, { type: "error" });
    }
  } catch (e) {
    message(`更新失败${e}`, { type: "error" });
  }
};

const updateMusicButton = async () => {
  try {
    const r = await saveOrUpdateMusic(state.modifyMusicInfo);
    if (r.code === "200") {
      message("更新成功", { type: "success" });
      editMusicInfoFlag.value = false;
      await initInfo();
    } else {
      message(`更新失败${r.message}`, { type: "error" });
    }
  } catch (e) {
    message(`请求失败${e}`, { type: "error" });
  }
};

const proxyHost = VITE_PROXY_HOST == null ? "" : VITE_PROXY_HOST;
const uploadAction = ref(`${proxyHost}/admin/music/auto/upload`);
const uploadPicAction = ref(`${proxyHost}/admin/pic/upload`);

const uploadLoadingFlag = ref();
const handleAvatarSuccess: UploadProps["onSuccess"] = async response => {
  console.log(response, "onSuccess");
  if (response?.response == null) return;
  uploadLoadingFlag.value?.close();
  if (response.response.code === "200") {
    ElMessage.success("上传成功");
    addSoundSourceFlag.value = false;
    await intiGetMusicLyric();
  } else {
    ElMessage.error(`上传失败${response.response.message}`);
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

// 上传封面
const handleExceed: UploadProps["onExceed"] = files => {
  picUpload.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  picUpload.value!.handleStart(file);
};

const uploadPicHandleOnError = (error: Error) => {
  message(`${error.message}`, { type: "error" });
};

const uploadPicHandleOnSuccess = () => {
  initInfo();
};

const selectMd5Search = async (value: string | number) => {
  state.loading.selectMd5 = true;
  try {
    const r = await selectResources(String(value));
    state.listResource.data = r.data;
  } finally {
    state.loading.selectMd5 = false;
  }
};

// 填充数据
const paddingData = data => {
  console.log(data);
  state.visible.musicSelectResourcePath = false;
  addSource.value.md5 = data.md5;
  addSource.value.name = data.fileName;
  addSource.value.size = data.size;
};

const musicArtistNames = computed(() =>
  state.musicInfo.musicArtist.map(value => value.artistName).join(",")
);

const albumArtistNames = computed(() =>
  state.musicInfo.albumArtist.map(value => value.artistName).join(",")
);

const musicPublishTime = computed(() =>
  new Date(state.musicInfo.publishTime).toLocaleDateString()
);

const musicTagComputed = computed(() => state.musicInfo.musicTag.join(","));

const syncMetaMusic = () => {
  if (state.syncMusicMetaData === "") {
    message("请选择音源", { type: "error" });
    return;
  }
  if (state.metaDataMusic.musicName === "") {
    message("请输入音乐元数据", { type: "error" });
    return;
  }
  const loading = ElLoading.service({
    lock: true,
    text: "写入中",
    background: "rgba(0, 0, 0, 0.7)"
  });
  syncMetaMusicFile(state.metaDataMusic)
    .then(() => {
      message(`写入成功`, { type: "success" });
      loading.close();
      cleanMetaDataChange();
      state.syncMusicMetaData = "";
    })
    .catch(() => {
      loading.close();
    });
};
// 不为空
const picBase64Flag = computed(() => !state.metaDataMusic.picBase64);

const selectMetaDataChange = () => {
  if (state.syncMusicMetaData === "") {
    message("请选择音源", { type: "error" });
    return;
  }
  state.metaDataMusic.resourceId = state.syncMusicMetaData;
  state.metaDataMusic.musicName = state.musicInfo.musicName;
  state.metaDataMusic.picUrl = state.musicInfo.picUrl;
  state.metaDataMusic.musicAliasName = state.musicInfo.aliasName;
  state.metaDataMusic.albumName = state.musicInfo.albumName;
  state.metaDataMusic.musicArtist = musicArtistNames;
  state.metaDataMusic.albumArtist = albumArtistNames;
  state.metaDataMusic.lyric = lyricValue.value;
  state.metaDataMusic.year = musicPublishTime;
  state.metaDataMusic.genre = state.musicInfo.musicGenre;
  state.metaDataMusic.tag = musicTagComputed;
};

const cleanMetaDataChange = () => {
  state.metaDataMusic = {};
};

const metaDataUploadPic = ref<UploadInstance>();

const metaDataUploadHandleExceed: UploadProps["onExceed"] = files => {
  metaDataUploadPic.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  metaDataUploadPic.value!.handleStart(file);
};

function getBase64(file) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    let imgResult = "";
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

const getMetaDataPicBase = (file: any) => {
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
    getBase64(file.raw)
      .then(res => {
        // base64赋值给meta数据
        state.metaDataMusic.picBase64 = res;
        loading.close();
      })
      .catch(reason => {
        message(reason, { type: "error" });
        loading.close();
      });
  }
};

const toAlbum = albumId => {
  router.push({
    name: "AlbumInfo",
    query: { id: albumId }
  });
};

const toArtist = res => {
  router.push({
    name: "ArtistInfo",
    query: { id: res }
  });
};

const toMusicPlay = async res => {
  if (res.rawUrl == null || res.rawUrl === "" || !res.exists) {
    message(`该音源无效`, { type: "error" });
    return;
  }
  try {
    await usePlaySongListStoreHook().playSongList(state.musicInfo.id);
  } catch (e) {
    message(e, { type: "error" });
    return;
  }
  onPlayMusic();
};
</script>
<template>
  <div>
    <!--同步音乐元数据-->
    <el-dialog v-model="syncMusicMetaDataFlag" :width="state.dialog.width">
      <template #header>
        <h1>同步音乐文件元数据</h1>
      </template>
      <el-form label-position="top">
        <el-form-item label="选择音源">
          <el-select
            v-model="state.syncMusicMetaData"
            placeholder="选择音源"
            @change="selectMetaDataChange"
          >
            <el-option
              v-for="item in musicUrl"
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
                <el-input v-model="state.musicInfo.musicName" disabled />
              </el-form-item>
              <el-form-item label="音乐别名">
                <el-input v-model="state.musicInfo.aliasName" disabled />
              </el-form-item>
              <el-form-item label="封面">
                <el-input v-model="state.musicInfo.picUrl" disabled />
              </el-form-item>
              <el-form-item label="专辑名">
                <el-input v-model="state.musicInfo.albumName" disabled />
              </el-form-item>
              <el-form-item label="音乐歌手">
                <el-input v-model="musicArtistNames" disabled />
              </el-form-item>
              <el-form-item label="专辑歌手">
                <el-input v-model="albumArtistNames" disabled />
              </el-form-item>
              <el-form-item label="歌词">
                <el-input v-model="lyricValue" disabled type="textarea" />
              </el-form-item>
              <el-form-item label="发布时间">
                <el-input v-model="musicPublishTime" disabled />
              </el-form-item>
              <el-form-item label="流派">
                <el-input v-model="state.musicInfo.musicGenre" disabled />
              </el-form-item>
              <el-form-item label="tag">
                <el-input v-model="musicTagComputed" disabled />
              </el-form-item>
            </el-form>
            <el-form label-position="top" class="w-full">
              <el-form-item label="音乐名">
                <el-input v-model="state.metaDataMusic.musicName" />
              </el-form-item>
              <el-form-item label="音乐别名">
                <el-input v-model="state.metaDataMusic.musicAliasName" />
              </el-form-item>
              <el-form-item>
                <div class="w-full flex justify-between">
                  <b>封面</b>
                  <el-switch
                    v-model="state.metaUpload.flag"
                    active-text="封面文件上传"
                    inactive-text="封面url上传"
                  />
                </div>
                <div v-if="state.metaUpload.flag" class="w-full flex gap-1">
                  <el-image-viewer
                    v-if="state.metaUpload.imageViewerFlag"
                    :url-list="[state.metaDataMusic.picBase64]"
                    @close="state.metaUpload.imageViewerFlag = false"
                  />
                  <el-button
                    type="primary"
                    class="w-1/2"
                    :disabled="picBase64Flag"
                    @click="state.metaUpload.imageViewerFlag = true"
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
                <el-input v-else v-model="state.metaDataMusic.picUrl" />
              </el-form-item>
              <el-form-item label="专辑名">
                <el-input v-model="state.metaDataMusic.albumName" />
              </el-form-item>
              <el-form-item label="音乐歌手">
                <el-input v-model="state.metaDataMusic.musicArtist" />
              </el-form-item>
              <el-form-item label="专辑歌手">
                <el-input v-model="state.metaDataMusic.albumArtist" />
              </el-form-item>
              <el-form-item label="歌词">
                <el-input v-model="state.metaDataMusic.lyric" type="textarea" />
              </el-form-item>
              <el-form-item label="发布时间">
                <el-input v-model="state.metaDataMusic.year" />
              </el-form-item>
              <el-form-item label="流派">
                <el-input v-model="state.metaDataMusic.genre" />
              </el-form-item>
              <el-form-item label="tag">
                <el-input v-model="state.metaDataMusic.tag" />
              </el-form-item>
            </el-form>
          </div>
          <div class="w-full mt-4 flex flex-row-reverse">
            <el-button type="primary" @click="syncMetaMusic">提交</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!--选择音源MD5-->
    <el-dialog
      v-model="state.visible.musicSelectResourcePath"
      title="选择音源"
      width="60%"
    >
      <el-input v-model="state.input.selectMd5" @input="selectMd5Search" />
      <el-table
        v-loading="state.loading.selectMd5"
        height="10rem"
        :data="state.listResource.data"
        style="width: 100%"
      >
        <el-table-column
          min-width="30"
          show-overflow-tooltip
          fixed
          label="MD5"
          property="md5"
        >
          <template #default="scope">
            <span class="cursor-pointer" @click="copy(scope.row.md5)">{{
              scope.row.md5
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          min-width="30"
          show-overflow-tooltip
          label="文件名"
          property="fileName"
        >
          <template #default="scope">
            <span class="cursor-pointer" @click="copy(scope.row.fileName)">{{
              scope.row.fileName
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          min-width="30"
          show-overflow-tooltip
          label="文件大小"
          property="size"
        >
          <template #default="scope">
            <span class="cursor-pointer" @click="copy(scope.row.size)">{{
              scope.row.size
            }}</span>
          </template>
        </el-table-column>
        <el-table-column>
          <template #default="scope">
            <audio :src="scope.row.audio" controls />
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="120">
          <template #default="scope">
            <el-button type="primary" @click="paddingData(scope.row)">
              填入数据
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <!--编辑音源-->
    <el-dialog
      v-model="editSourceFlag"
      :width="state.dialog.width"
      title="编辑音源"
      :show-close="false"
    >
      <el-scrollbar height="20rem">
        <el-form label-position="top">
          <el-form-item label="关联音乐ID">
            <el-input v-model="editSourceValue.musicId" />
          </el-form-item>
          <el-form-item label="地址">
            <el-input v-model="editSourceValue.path" />
          </el-form-item>
          <el-form-item label="MD5">
            <el-input v-model="editSourceValue.md5" />
          </el-form-item>
          <el-form-item label="文件格式">
            <el-input v-model="editSourceValue.encodeType" />
          </el-form-item>
          <el-form-item label="音乐存储大小(字节)">
            <el-input v-model="editSourceValue.size" />
          </el-form-item>
          <el-form-item label="比特率">
            <el-input v-model="editSourceValue.rate" />
          </el-form-item>
        </el-form>
      </el-scrollbar>
      <template #footer>
        <el-button @click="editSourceFlag = false">取消</el-button>
        <el-button type="primary" @click="updateSource">更新</el-button>
      </template>
    </el-dialog>
    <!--添加音源提示框-->
    <el-dialog
      v-model="addSoundSourceFlag"
      :width="state.dialog.width"
      :show-close="false"
    >
      <template #header="{ titleId, titleClass }">
        <div class="flex flex-nowrap justify-between">
          <div class="">
            <h1>添加音源</h1>
          </div>
          <!--切换上传方式-->
          <div class="flex items-center">
            <h1 :id="titleId" :class="titleClass" class="mr-4">手动上传</h1>
            <el-switch v-model="switchUploadFlag" size="large" />
          </div>
        </div>
      </template>
      <div v-if="switchUploadFlag">
        <el-scrollbar height="20rem">
          <!--输入添加音源-->
          <el-form label-position="top">
            <el-alert type="info" show-icon :closable="false">
              <p>
                手动上传需要用户自己上传到对于存储中，然后复制文件名粘贴于此
              </p>
            </el-alert>
            <el-form-item
              label="文件名(请以md5+文件格式命名)"
              :rules="[{ required: true }]"
            >
              <div class="w-full flex gap-4">
                <el-input v-model="addSource.name" />
                <el-button
                  type="primary"
                  @click="
                    () => {
                      state.visible.musicSelectResourcePath = true;
                      selectMd5Search('');
                    }
                  "
                  >选择</el-button
                >
              </div>
            </el-form-item>
            <el-form-item label="MD5" :rules="[{ required: true }]">
              <el-input v-model="addSource.md5" />
            </el-form-item>
            <el-form-item label="Rate(比特率)" :rules="[{ required: true }]">
              <el-input v-model="addSource.rate" />
            </el-form-item>
            <el-form-item
              label="文件大小(Byte)"
              :rules="[
                { required: true, type: 'number', message: '请输入数字' }
              ]"
            >
              <el-input v-model="addSource.size" />
            </el-form-item>
          </el-form>
        </el-scrollbar>
        <div class="flex flex-row-reverse mt-4">
          <el-button
            type="primary"
            :loading="addSourceLoadingBottomFlag"
            :loading-icon="useRenderIcon(Loading3Fill)"
            @click="addSoundSource"
            >添加</el-button
          >
          <el-button class="mr-4" @click="addSoundSourceFlag = false"
            >取消</el-button
          >
        </div>
      </div>
      <div v-else>
        <el-upload
          drag
          :multiple="false"
          :data="{
            userId: userInfo.id,
            id: state.musicInfo.id
          }"
          :action="uploadAction"
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
      </div>
    </el-dialog>
    <!--编辑普通歌曲框-->
    <el-dialog v-model="lyricValueFlag" :width="state.dialog.width">
      <template #header> <h1>普通歌词</h1> </template>
      <el-input v-model="lyricValue" :rows="10" type="textarea" />
      <template #footer>
        <el-button @click="lyricValueFlag = false">取消</el-button>
        <el-button
          type="primary"
          @click="
            lyricValueFlag = false;
            updateLyric(lyricType, lyricValue);
          "
          >更新</el-button
        >
      </template>
    </el-dialog>
    <!--编辑逐字歌曲框-->
    <el-dialog v-model="kLyricValueFlag" :width="state.dialog.width">
      <template #header> <h1>逐字歌词</h1> </template>
      <el-input v-model="kLyricValue" type="textarea" :rows="10" />
      <template #footer>
        <el-button @click="kLyricValueFlag = false">取消</el-button>
        <el-button
          type="primary"
          @click="
            lyricValueFlag = false;
            updateLyric(klyricType, kLyricValue);
          "
          >更新</el-button
        >
      </template>
    </el-dialog>
    <!--编辑音乐信息框-->
    <el-dialog
      v-model="editMusicInfoFlag"
      :width="state.dialog.width"
      :show-close="false"
    >
      <el-scrollbar height="20rem">
        <h1>音乐名</h1>
        <el-input v-model="state.modifyMusicInfo.musicName" />
        <h1>音乐别名</h1>
        <el-input v-model="state.modifyMusicInfo.aliasName" />
        <h1>流派</h1>
        <el-input v-model="state.modifyMusicInfo.musicGenre" />
        <div>
          <h1>音乐Tag</h1>
          <span>多个请用逗号标注</span>
        </div>
        <el-input v-model="state.modifyMusicInfo.musicTag" />
        <h1>封面</h1>
        <div class="flex-c gap-4 items-center">
          <el-input v-model="state.modifyMusicInfo.picUrl" :disabled="true" />
          <el-upload
            ref="picUpload"
            class="flex justify-center items-center"
            :data="{ id: state.modifyMusicInfo.id, type: 'music' }"
            :action="uploadPicAction"
            :limit="1"
            :show-file-list="false"
            :on-error="uploadPicHandleOnError"
            :on-exceed="handleExceed"
            :on-success="uploadPicHandleOnSuccess"
            :auto-upload="true"
          >
            <template #trigger>
              <el-button type="primary">上传图片</el-button>
            </template>
          </el-upload>
        </div>
        <h1>艺术家</h1>
        <div class="flex gap-2">
          <el-tag
            v-for="(item, index) in state.selectPreview.artist"
            :key="item.id"
            effect="dark"
            closable
            round
            @close="musicArtistHandleClose(index)"
            >{{ item.artistName }}</el-tag
          >
        </div>
        <el-autocomplete
          v-model="musicArtistSearch"
          class="w-full mt-1"
          :fetch-suggestions="musicArtistQuerySearchAsync"
          placeholder="请输入歌手名"
          @select="musicArtistHandleSelect"
        />
        <div class="flex flex-nowrap items-center">
          <h1>专辑</h1>
          <span class="text-black/30 text-sm font-bold"
            >#符号仅提示,防止相同专辑名引起用户选择困扰</span
          >
        </div>
        <div class="flex gap-2">
          <el-link
            v-for="item in state.selectPreview.album.artists"
            :key="item.id"
            class="font-bold"
            type="primary"
            :underline="false"
            @click="copyData(item.artistName)"
          >
            <span class="font-bold">#{{ item.artistName }}#</span>
          </el-link>
        </div>
        <el-autocomplete
          v-model="state.selectPreview.albumName"
          class="w-full mt-1"
          :fetch-suggestions="albumQuerySearchAsync"
          placeholder="请输入专辑名"
          @select="albumHandleSelect"
        >
          <template #default="{ item }">
            <span v-html="item.display" />
          </template>
        </el-autocomplete>
        <h1>歌词</h1>
        <div class="flex items-center justify-around">
          <div class="flex items-center flex-nowrap">
            <el-tag :type="lyricValue === undefined ? 'info' : ''"
              >普通歌词</el-tag
            >
            <el-button
              class="ml-2"
              type="primary"
              round
              @click="lyricValueFlag = true"
              >修改</el-button
            >
          </div>
          <div class="flex items-center flex-nowrap">
            <el-tag :type="kLyricValue === undefined ? 'info' : ''"
              >逐字歌词</el-tag
            >
            <el-button
              class="ml-2"
              type="primary"
              round
              @click="kLyricValueFlag = true"
              >修改</el-button
            >
          </div>
        </div>
        <br />
        <div>
          <div class="flex flex-nowrap items-center">
            <h1>音乐时长</h1>
            <span class="text-sm">(毫秒值)</span>
          </div>
          <div class="flex flex-nowrap items-center justify-between">
            <div>显示音乐毫秒，可以手动修改</div>
            <div>
              <span class="text-xl font-bold">{{
                dateFormater("mm:ss", state.modifyMusicInfo.timeLength)
              }}</span>
              <el-input-number
                v-model="state.modifyMusicInfo.timeLength"
                class="ml-4"
                :step="1000"
              />
            </div>
          </div>
        </div>
      </el-scrollbar>
      <template #footer>
        <el-button @click="editMusicInfoFlag = false">取消</el-button>
        <el-button type="primary" @click="updateMusicButton">更新</el-button>
      </template>
    </el-dialog>

    <div class="info">
      <el-skeleton :loading="skeletonLoadingFlag" animated>
        <template #template>
          <div class="skeleton-info">
            <el-skeleton-item
              variant="image"
              style="width: 20rem; height: 20rem; border-radius: 2rem"
            />
            <div class="flex flex-col gap-3">
              <el-skeleton-item
                variant="h1"
                style="width: 20rem; height: 3rem"
              />
              <div class="flex flex-col gap-1">
                <el-skeleton-item
                  variant="text"
                  style="width: 10rem; height: 1rem"
                />
                <el-skeleton-item
                  variant="text"
                  style="width: 8rem; height: 1rem"
                />
                <el-skeleton-item
                  variant="text"
                  style="width: 9rem; height: 1rem"
                />
              </div>
              <div class="flex flex-nowrap gap-4">
                <el-skeleton-item
                  variant="button"
                  style="width: 6rem; height: 2.25rem; border-radius: 1rem"
                />
                <el-skeleton-item
                  variant="button"
                  style="width: 6rem; height: 2.25rem; border-radius: 1rem"
                />
                <el-skeleton-item
                  variant="button"
                  style="width: 6rem; height: 2.25rem; border-radius: 1rem"
                />
                <el-skeleton-item
                  variant="button"
                  style="width: 6rem; height: 2.25rem; border-radius: 1rem"
                />
              </div>
            </div>
          </div>
        </template>
        <template #default>
          <LoadImg :src="state.musicInfo?.picUrl" />
          <div class="data">
            <div>
              <div>
                <p class="name">
                  {{ state.musicInfo.musicName }}
                </p>
                <p class="name-alis">{{ state.musicInfo.aliasName }}</p>
                <div>
                  <span class="show-font">流派: </span>
                  <el-link :underline="false">
                    <span class="font-semibold">
                      {{ state.musicInfo.musicGenre }}
                    </span>
                  </el-link>
                </div>
                <div>
                  <span class="show-font">Tag: </span>
                  <el-link
                    v-for="item in state.musicInfo.musicTag"
                    :key="item"
                    :underline="false"
                  >
                    <span class="font-semibold">
                      {{ item + "\u00a0" }}
                    </span>
                  </el-link>
                </div>
                <span class="show-font">专辑: </span>
                <el-link
                  :underline="false"
                  @click="toAlbum(state.musicInfo.albumId)"
                >
                  <span class="cursor-pointer font-semibold">
                    {{ state.musicInfo.albumName }}
                  </span>
                </el-link>
                <br />
                <span class="show-font">艺术家: </span>
                <el-link
                  v-for="(item, index) in state.musicInfo.musicArtist"
                  :key="index"
                  :underline="false"
                  ><span
                    class="cursor-pointer font-semibold"
                    @click="toArtist(item.id)"
                    v-html="item.artistName + '\u00a0'"
                /></el-link>
                <br />
                <span class="show-font">发行时间: </span>
                <span class="font-bold">{{
                  dateFormater("YYYY-MM-dd", state.musicInfo.publishTime)
                }}</span>
              </div>
              <div class="edit-music">
                <div>
                  <el-button-group type="primary">
                    <el-button
                      class="edit-music-button"
                      size="default"
                      round
                      @click="playMusic"
                    >
                      <i><PlayIcon class="w-5 h-5" /></i>
                      <span>播放</span>
                    </el-button>
                    <el-button
                      class="edit-music-button"
                      round
                      size="default"
                      @click="getUserPlayInfo(state.musicInfo.id)"
                    >
                      <IconifyIconOnline
                        color="#ffffff"
                        icon="mingcute:add-fill"
                        width="1.1rem"
                        height="1.1rem"
                      />
                    </el-button>
                  </el-button-group>
                  <!--添加歌曲到歌单-->
                  <add-music-to-play-list
                    v-if="playItemDialogVisible"
                    :play-item="userPlayItem"
                    :userId="Number.parseInt(userInfo.id)"
                    :music-id="addMusicId"
                    :width="state.dialog.width"
                    @closeDialog="playItemDialogVisible = false"
                  />
                </div>
                <el-button
                  v-show="!state.operateButton"
                  class="edit-music-button"
                  plain
                  round
                  @click="addPlaySongList"
                  ><IconifyIconOnline
                    color="#868686"
                    icon="solar:turntable-music-note-bold-duotone"
                    width="1.1rem"
                    height="1.1rem"
                  />添加到播放歌单
                </el-button>
                <el-button
                  v-show="!state.operateButton"
                  class="edit-music-button"
                  round
                  @click="
                    getLyricList();
                    editMusicInfoFlag = true;
                  "
                >
                  <IconifyIconOnline
                    color="#868686"
                    icon="mingcute:edit-3-line"
                    width="1.1rem"
                    height="1.1rem"
                  />
                  编辑音乐</el-button
                >
                <el-button
                  v-show="!state.operateButton"
                  class="edit-music-button"
                  round
                  @click="addSoundSourceFlag = true"
                >
                  <IconifyIconOnline
                    color="#868686"
                    icon="mingcute:add-circle-fill"
                    width="1.1rem"
                    height="1.1rem"
                  />添加音源</el-button
                >
                <el-button
                  v-show="!state.operateButton"
                  class="edit-music-button"
                  round
                  @click="syncMusicMetaDataFlag = true"
                >
                  <IconifyIconOnline
                    color="#868686"
                    icon="solar:refresh-bold-duotone"
                    width="1.1rem"
                    height="1.1rem"
                  />同步音乐元数据</el-button
                >
                <el-dropdown v-show="state.operateButton">
                  <el-button class="edit-music-button" round>
                    <IconifyIconOnline
                      color="#868686"
                      icon="mingcute:more-2-line"
                      width="1.1rem"
                      height="1.1rem"
                    />
                    更多
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-item @click="addPlaySongList">
                      <IconifyIconOnline
                        color="#868686"
                        icon="solar:turntable-music-note-bold-duotone"
                        width="1.1rem"
                        height="1.1rem"
                      />添加到播放歌单
                    </el-dropdown-item>
                    <el-dropdown-item
                      @click="
                        getLyricList();
                        editMusicInfoFlag = true;
                      "
                    >
                      <IconifyIconOnline
                        color="#868686"
                        icon="mingcute:edit-3-line"
                        width="1.1rem"
                        height="1.1rem"
                      />编辑音乐
                    </el-dropdown-item>
                    <el-dropdown-item @click="addSoundSourceFlag = true">
                      <IconifyIconOnline
                        color="#868686"
                        icon="mingcute:add-circle-fill"
                        width="1.1rem"
                        height="1.1rem"
                      />添加音源
                    </el-dropdown-item>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </div>
        </template>
      </el-skeleton>
    </div>
    <div class="text-2xl mt-4">音源</div>
    <el-skeleton :loading="skeletonLoadingFlag" animated>
      <template #template>
        <div class="mt-4">
          <el-skeleton-item
            variant="rect"
            style="width: 100%; height: 3.6rem; border-radius: 1rem"
          />
        </div>
      </template>
      <template #default>
        <div class="item-list">
          <div v-for="(item, index) in musicUrl" :key="index">
            <div class="show-item">
              <div
                class="ml-4 flex items-center h-full cursor-pointer"
                @click="toMusicPlay(item)"
              >
                <span class="index">{{ index + 1 }}</span>
                <span class="music-name">{{ state.musicInfo.musicName }}</span>
                <span class="md5">{{ item.md5 }}</span>
              </div>
              <div
                class="grow h-full cursor-pointer"
                @click="toMusicPlay(item)"
              />
              <div class="operate-info">
                <el-tooltip
                  class="box-item"
                  effect="dark"
                  :content="
                    item.rawUrl == null || item.rawUrl === ''
                      ? '不可播放'
                      : '可播放'
                  "
                  placement="top-start"
                >
                  <IconifyIconOnline
                    class="mr-4"
                    :style="{
                      color:
                        item.rawUrl == null ||
                        item.rawUrl === '' ||
                        !item.exists
                          ? '#7d7d7d'
                          : '#626aef'
                    }"
                    icon="solar:play-stream-bold"
                    width="2rem"
                    height="2rem"
                  />
                </el-tooltip>
                <span class="mr-4 font-medium level">{{ item.level }}</span>
                <div class="flex items-center">
                  <el-button round class="mr-4" @click="copy(item.rawUrl)"
                    >复制</el-button
                  >
                  <el-link :underline="false">
                    <el-dropdown>
                      <el-icon :size="20" class="cursor-pointer">
                        <Icon icon="ep:more-filled" />
                      </el-icon>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item
                            @click="
                              download(
                                state.musicInfo.musicName,
                                item.encodeType,
                                item.rawUrl
                              )
                            "
                            >下载音源
                          </el-dropdown-item>
                          <el-dropdown-item @click="editSource(item)"
                            >编辑音源
                          </el-dropdown-item>
                          <el-dropdown-item
                            @click="deleteSource(item.id, index)"
                            >删除音源
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </el-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<style lang="scss" scoped>
.info {
  display: flex;
  flex-wrap: wrap;
  gap: 3rem;

  @media screen and (width <= 1024px) {
    flex-direction: column;
  }
}

.frontCover {
  width: 20rem;
  height: 20rem;
  border-radius: 2rem;
  // 四周阴影
  box-shadow: var(--el-color-info-light-3) 1px 1px 10px;
}

.name {
  font-size: 3rem;

  @media screen and (width <= 720px) {
    @apply truncate;

    width: 20rem;
  }
}

.name-alis {
  font-size: 2rem;
  color: var(--el-color-info-light-3);
}

.show-font {
  font-size: 1rem;
  color: var(--el-color-info-light-3);
}

.data {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: space-between;
}

.item-list {
  margin-top: 1rem;
}

.show-item {
  display: flex;
  flex-flow: row nowrap;
  place-content: center space-between;
  align-items: center;
  width: 100%;
  height: 3.6rem;
  background-color: var(--el-bg-color);
  border-radius: 1rem;
}

.operate-info {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 2rem;

  @media screen and (width <= 720px) {
    margin-right: 10px;
  }
}

.level {
  color: #a2a2a2;
}

.index {
  color: var(--el-color-info-light-3);
}

.music-name {
  @apply ml-4 font-bold;

  @media screen and (width <= 720px) {
    @apply truncate;

    width: 3rem;
  }
}

.md5 {
  margin-left: 3rem;
  color: var(--el-color-info-light-3);

  @media screen and (width <= 720px) {
    display: none;
  }
}

.edit-music {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: flex-start;
}

.edit-music-button {
  height: 2.2rem;
}

.skeleton-info {
  display: flex;
  flex-direction: row;
  gap: 3rem;

  @media screen and (width <= 1024px) {
    flex-direction: column;
  }
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-upload.el-upload--text) {
  width: 100%;
}
</style>
