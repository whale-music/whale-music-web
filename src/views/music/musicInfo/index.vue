<script lang="ts" setup>
import { onMounted, reactive, ref, unref, watch } from "vue";
import { useRouter } from "vue-router";
import {
  deleteSourceMusic,
  getMusicInfo,
  getMusicLyric,
  getMusicUrl,
  manualUploadMusic,
  MusicDetailInfo,
  MusicUrl,
  MusicUrlInfo,
  saveOrUpdateLyric,
  updateMusic,
  updateSourceMusic,
  UploadManualMusic
} from "@/api/music";
import { dateFormater } from "@/utils/dateUtil";
import { Icon } from "@iconify/vue";
import LoadImg from "@/components/LoadImg/LoadImg.vue";
import {
  storageSession,
  useCopyToClipboard,
  downloadByData,
  clone
} from "@pureadmin/utils";
import { message } from "@/utils/message";
import axios from "axios";
import PlayIcon from "@/assets/svg/play.svg?component";
import AddMusicToPlayList from "@/components/addMusicToPlayList/addMusicToPlayList.vue";
import { getUserPlayList, UserPlayListRes } from "@/api/playlist";
import { DataInfo, sessionKey } from "@/utils/auth";
import { usePlaySongListStoreHook } from "@/store/modules/playSongList";
import { getSelectAlbumList } from "@/api/album";
import { getSelectSingerList } from "@/api/singer";
import { ElLoading, ElMessage, ElMessageBox, genFileId } from "element-plus";
import type { UploadInstance, UploadProps, UploadRawFile } from "element-plus";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Loading3Fill from "@iconify-icons/mingcute/loading-3-fill";
import { emitter } from "@/utils/mitt";
import { useNav } from "@/layout/hooks/useNav";
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

const state = reactive({
  operateButton: false,
  dialog: {
    width: "45%"
  }
});

const picUpload = ref<UploadInstance>();

const musicInfo = ref<MusicDetailInfo>({
  albumArtist: [],
  albumId: 0,
  albumName: "",
  createTime: "",
  id: null,
  musicArtist: [],
  musicName: "",
  musicNameAlias: "",
  order: false,
  pic: undefined,
  publishTime: "",
  timeLength: 0
});
const modifyMusicInfo = ref<MusicDetailInfo>();

const musicUrl = ref<MusicUrlInfo[]>();

const publishTime = ref<Date>();

async function intiGetMusicLyric() {
  musicUrl.value = (await getMusicUrl(musicInfo.value.id.toString())).data;
}

const skeletonLoadingFlag = ref();
onMounted(async () => {
  id.value = useRouter().currentRoute.value.query.id;

  skeletonLoadingFlag.value = true;
  const _musicInfo = await getMusicInfo(id.value);

  musicInfo.value = _musicInfo.data;
  modifyMusicInfo.value = clone(_musicInfo.data, true);
  publishTime.value = clone(modifyMusicInfo.value.publishTime);

  await intiGetMusicLyric();
  skeletonLoadingFlag.value = false;

  const width =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;
  reLayout(width);
});

const { clipboardValue, copied } = useCopyToClipboard();
function copy(value) {
  if (value == null || value === "") {
    message("空地址", { type: "error" });
    return;
  }
  clipboardValue.value = unref(value);
  if (copied.value) {
    message("拷贝音源地址成功", { type: "success" });
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
const editSourceValue = ref<MusicUrl>({
  createTime: "",
  encodeType: "",
  id: 0,
  level: "",
  md5: "",
  musicId: 0,
  origin: "",
  rate: 0,
  size: 0,
  updateTime: "",
  url: "",
  userId: 0
});
const editSource = async (url: MusicUrl) => {
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
const userInfo = storageSession().getItem<DataInfo>(sessionKey);
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
    musicInfo.value.id
  );
  message("成功添加音乐到歌单", { type: "success" });
};

const editMusicInfoFlag = ref<boolean>(false);

const addSoundSourceFlag = ref<boolean>(false);
const switchUploadFlag = ref<boolean>(false);

const tempSource = {
  createTime: "",
  encodeType: "",
  id: null,
  level: "",
  md5: "",
  musicId: null,
  name: "",
  origin: "",
  rate: null,
  size: null,
  updateTime: "",
  url: "",
  userId: null
};
const addSource = ref<UploadManualMusic>(clone(tempSource));
const addSourceLoadingBottomFlag = ref<boolean>(false);
const addSoundSource = async () => {
  console.log("添加音源");
  try {
    addSourceLoadingBottomFlag.value = true;
    addSource.value.musicId = musicInfo.value.id;
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

interface LinkItem {
  value: string;
  link: number;
  display: string;
}

// 获取专辑歌手数据
const musicArtistQuerySearchAsync = async (
  queryString: string,
  cb: (arg: any) => void
) => {
  const selectAlbumR = await getSelectSingerList(queryString);
  if (selectAlbumR.code === "200" && selectAlbumR.data.length !== 0) {
    cb(selectAlbumR.data);
  }
};

const musicArtistSearch = ref<string>("");
// 歌手添加到保存数据中
const musicArtistHandleSelect = (item: LinkItem) => {
  const items = {
    alias: "",
    artistName: item.value,
    birth: "",
    createTime: "",
    id: item.link,
    introduction: "",
    location: "",
    pic: "",
    sex: "",
    updateTime: ""
  };
  modifyMusicInfo.value.musicArtist.push(items);
  musicArtistSearch.value = "";
};

// 获取专辑歌手数据
const albumArtistQuerySearchAsync = async (
  queryString: string,
  cb: (arg: any) => void
) => {
  const selectAlbumR = await getSelectSingerList(queryString);
  if (selectAlbumR.code === "200" && selectAlbumR.data.length !== 0) {
    cb(selectAlbumR.data);
  }
};

// 删除歌手数据
const albumArtistHandleClose = index => {
  modifyMusicInfo.value.albumArtist.splice(index, 1);
};

// 删除歌手数据
const musicArtistHandleClose = index => {
  modifyMusicInfo.value.musicArtist.splice(index, 1);
};

const albumArtistSearch = ref<string>("");
// 歌手添加到保存数据中
const albumArtistHandleSelect = (item: LinkItem) => {
  const items = {
    alias: "",
    artistName: item.value,
    birth: "",
    createTime: "",
    id: item.link,
    introduction: "",
    location: "",
    pic: "",
    sex: "",
    updateTime: ""
  };
  modifyMusicInfo.value.albumArtist.push(items);
  albumArtistSearch.value = "";
};

const albumSearch = ref<string>("");
// 专辑搜索
const albumQuerySearchAsync = async (
  queryString: string,
  cb: (arg: any) => void
) => {
  const selectAlbumR = await getSelectAlbumList(queryString);
  if (selectAlbumR.code === "200" && selectAlbumR.data.length !== 0) {
    cb(selectAlbumR.data);
  }
};

// 选择专辑
const albumHandleSelect = (item: LinkItem) => {
  modifyMusicInfo.value.albumName = item.value;
  modifyMusicInfo.value.albumId = item.link;
  albumSearch.value = "";
};

const lyricType = ref("lyric");
const klyricType = ref("klyric");

const lyricValueFlag = ref<boolean>(false);
const kLyricValueFlag = ref<boolean>(false);
const lyricValue = ref<string>(null);
const kLyricValue = ref<string>(null);
const getLyricList = async () => {
  if (lyricValue.value == null || kLyricValue.value == null) {
    const r = await getMusicLyric(musicInfo.value.id.toString());
    const lyricIndex = r.data.findIndex(
      value => value.type === lyricType.value
    );
    const kyricIndex = r.data.findIndex(
      value => value.type === klyricType.value
    );
    lyricValue.value = r.data[lyricIndex]?.lyric;
    kLyricValue.value = r.data[kyricIndex]?.lyric;
  }
};
const updateLyric = async (type: string, lyric: string) => {
  try {
    const r = await saveOrUpdateLyric(musicInfo.value.id, type, lyric);
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
    const r = await updateMusic(modifyMusicInfo.value);
    if (r.code === "200") {
      message("更新成功", { type: "success" });
      editMusicInfoFlag.value = false;
      musicInfo.value = modifyMusicInfo.value;
    } else {
      message(`更新失败${r.message}`, { type: "error" });
    }
  } catch (e) {
    message(`请求失败${e}`, { type: "error" });
  }
};

watch(publishTime, value => {
  modifyMusicInfo.value.publishTime = dateFormater(
    "YYYY-MM-ddTHH:mm:ss",
    value
  );
});

const proxyHost = VITE_PROXY_HOST == null ? "" : VITE_PROXY_HOST;
const uploadAction = ref(`${proxyHost}/admin/music/auto/upload`);
const uploadPicAction = ref(`${proxyHost}/admin/music/pic/upload`);

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
  console.log(`beforeAvatarUpload`);
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

const toAlbum = albumId => {
  router.push({
    path: "/music/albumInfo",
    query: { id: albumId }
  });
};

const toArtist = res => {
  router.push({
    path: "/music/artistInfo",
    query: { id: res }
  });
};

const toMusicPlay = async res => {
  if (res.rawUrl == null || res.rawUrl === "" || !res.exists) {
    message(`该音源无效`, { type: "error" });
    return;
  }
  try {
    await usePlaySongListStoreHook().playSongList(musicInfo.value.id);
  } catch (e) {
    message(e, { type: "error" });
    return;
  }
  onPlayMusic();
};
</script>
<template>
  <div>
    <!--编辑音源-->
    <el-dialog
      :width="state.dialog.width"
      v-model="editSourceFlag"
      title="编辑音源"
      :show-close="false"
    >
      <el-scrollbar height="20rem">
        <el-form label-position="top">
          <el-form-item label="关联音乐ID">
            <el-input v-model="editSourceValue.musicId" />
          </el-form-item>
          <el-form-item label="地址">
            <el-input v-model="editSourceValue.url" />
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
          <el-form-item label="音乐来源">
            <el-input v-model="editSourceValue.origin" />
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
      :width="state.dialog.width"
      v-model="addSoundSourceFlag"
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
              <el-input v-model="addSource.name" />
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
            @click="addSoundSource"
            :loading="addSourceLoadingBottomFlag"
            :loading-icon="useRenderIcon(Loading3Fill)"
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
            id: musicInfo.id
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
    <el-dialog :width="state.dialog.width" v-model="lyricValueFlag">
      <template #header> <h1>普通歌词</h1> </template>
      <el-input v-model="lyricValue" :rows="10" type="textarea" />
      <template #footer>
        <el-button @click="lyricValueFlag = false">取消</el-button>
        <el-button
          @click="
            lyricValueFlag = false;
            updateLyric(lyricType, lyricValue);
          "
          type="primary"
          >更新</el-button
        >
      </template>
    </el-dialog>
    <!--编辑逐字歌曲框-->
    <el-dialog :width="state.dialog.width" v-model="kLyricValueFlag">
      <template #header> <h1>逐字歌词</h1> </template>
      <el-input v-model="kLyricValue" type="textarea" :rows="10" />
      <template #footer>
        <el-button @click="kLyricValueFlag = false">取消</el-button>
        <el-button
          @click="
            lyricValueFlag = false;
            updateLyric(klyricType, kLyricValue);
          "
          type="primary"
          >更新</el-button
        >
      </template>
    </el-dialog>
    <!--编辑音乐信息框-->
    <el-dialog
      :width="state.dialog.width"
      v-model="editMusicInfoFlag"
      :show-close="false"
    >
      <el-scrollbar height="20rem">
        <h1>音乐名</h1>
        <el-input v-model="modifyMusicInfo.musicName" />
        <h1>音乐别名</h1>
        <el-input v-model="modifyMusicInfo.musicNameAlias" />
        <h1>封面</h1>
        <div class="flex-c gap-4">
          <el-input v-model="modifyMusicInfo.pic.url" />
          <el-upload
            ref="picUpload"
            :action="uploadPicAction"
            :limit="1"
            :on-exceed="handleExceed"
            :auto-upload="true"
          >
            <template #trigger>
              <el-button type="primary">上传图片</el-button>
            </template>
          </el-upload>
        </div>
        <h1>艺术家</h1>
        <el-tag
          v-for="(item, index) in modifyMusicInfo.musicArtist"
          :key="item.id"
          @close="musicArtistHandleClose(index)"
          effect="dark"
          closable
          round
          >{{ item.artistName }}</el-tag
        >
        <el-autocomplete
          class="w-full mt-1"
          v-model="musicArtistSearch"
          :fetch-suggestions="musicArtistQuerySearchAsync"
          placeholder="请输入歌手名"
          @select="musicArtistHandleSelect"
        />
        <div class="flex flex-nowrap items-end">
          <h1>专辑艺术家</h1>
        </div>
        <el-tag
          v-for="(item, index) in modifyMusicInfo.albumArtist"
          :key="item"
          @close="albumArtistHandleClose(index)"
          effect="dark"
          closable
          round
          >{{ item.artistName }}</el-tag
        >
        <el-autocomplete
          class="w-full mt-1"
          v-model="musicArtistSearch"
          :fetch-suggestions="albumArtistQuerySearchAsync"
          placeholder="请输入歌手名"
          @select="albumArtistHandleSelect"
        />
        <div class="flex flex-nowrap items-center">
          <h1>专辑</h1>
          <span class="text-black/30 text-sm font-bold"
            >#符号仅提示,防止相同专辑名引起用户选择困扰</span
          >
        </div>
        <el-tag effect="dark" round>{{ modifyMusicInfo.albumName }}</el-tag>
        <el-autocomplete
          class="w-full mt-1"
          v-model="albumSearch"
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
              @click="lyricValueFlag = true"
              class="ml-2"
              type="primary"
              round
              >修改</el-button
            >
          </div>
          <div class="flex items-center flex-nowrap">
            <el-tag :type="kLyricValue === undefined ? 'info' : ''"
              >逐字歌词</el-tag
            >
            <el-button
              @click="kLyricValueFlag = true"
              class="ml-2"
              type="primary"
              round
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
                dateFormater("mm:ss", modifyMusicInfo.timeLength)
              }}</span>
              <el-input-number
                class="ml-4"
                :step="1000"
                v-model="modifyMusicInfo.timeLength"
              />
            </div>
          </div>
        </div>
        <div>
          <h1>发布时间</h1>
          <div class="flex flex-row flex-nowrap justify-between">
            <div>该发布时间与专辑同步</div>
            <el-date-picker
              v-model="publishTime"
              type="date"
              placeholder="请选择发布时间"
              size="default"
            />
          </div>
        </div>
      </el-scrollbar>
      <template #footer>
        <el-button @click="editMusicInfoFlag = false">取消</el-button>
        <el-button @click="updateMusicButton" type="primary">更新</el-button>
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
                style="height: 3rem; width: 20rem"
              />
              <div class="flex flex-col gap-1">
                <el-skeleton-item
                  variant="text"
                  style="height: 1rem; width: 10rem"
                />
                <el-skeleton-item
                  variant="text"
                  style="height: 1rem; width: 8rem"
                />
                <el-skeleton-item
                  variant="text"
                  style="height: 1rem; width: 9rem"
                />
              </div>
              <div class="flex flex-nowrap gap-4">
                <el-skeleton-item
                  variant="button"
                  style="height: 2.25rem; width: 6rem; border-radius: 1rem"
                />
                <el-skeleton-item
                  variant="button"
                  style="height: 2.25rem; width: 6rem; border-radius: 1rem"
                />
                <el-skeleton-item
                  variant="button"
                  style="height: 2.25rem; width: 6rem; border-radius: 1rem"
                />
                <el-skeleton-item
                  variant="button"
                  style="height: 2.25rem; width: 6rem; border-radius: 1rem"
                />
              </div>
            </div>
          </div>
        </template>
        <template #default>
          <LoadImg :src="musicInfo?.pic.url" />
          <div class="data">
            <div>
              <div>
                <p class="name">
                  {{
                    musicInfo?.musicName === "" ? "加载中" : musicInfo.musicName
                  }}
                </p>
                <p class="name-alis">{{ musicInfo.musicNameAlias }}</p>
                <span class="show-font">专辑: </span>
                <el-link :underline="false" @click="toAlbum(musicInfo.albumId)">
                  <span class="cursor-pointer font-semibold">
                    {{ musicInfo.albumName }}
                  </span>
                </el-link>
                <br />
                <span class="show-font">艺术家: </span>
                <el-link
                  :underline="false"
                  v-for="(item, index) in musicInfo.musicArtist"
                  :key="index"
                  ><span
                    @click="toArtist(item.id)"
                    class="cursor-pointer font-semibold"
                    v-html="item.artistName + '\u00a0'"
                /></el-link>
                <br />
                <span class="show-font">发行时间: </span>
                <span class="font-bold">{{
                  musicInfo.publishTime === ""
                    ? "加载中"
                    : dateFormater("YYYY-MM-dd", musicInfo.publishTime)
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
                      @click="getUserPlayInfo(musicInfo.id)"
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
                  @click="addPlaySongList"
                  plain
                  round
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
                  @click="
                    getLyricList();
                    editMusicInfoFlag = true;
                  "
                  round
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
                  @click="addSoundSourceFlag = true"
                  round
                >
                  <IconifyIconOnline
                    color="#868686"
                    icon="mingcute:add-circle-fill"
                    width="1.1rem"
                    height="1.1rem"
                  />添加音源</el-button
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
            style="height: 3.6rem; width: 100%; border-radius: 1rem"
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
                <span class="music-name">{{ musicInfo.musicName }}</span>
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
                                musicInfo.musicName,
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

  @media screen and (max-width: 1024px) {
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

  @media screen and (max-width: 720px) {
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
  justify-content: space-between;
  gap: 1rem;
}

.item-list {
  margin-top: 1rem;
}

.show-item {
  width: 100%;
  height: 3.6rem;
  background-color: var(--el-bg-color);
  border-radius: 1rem;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-content: center;
  align-items: center;
  justify-content: space-between;
}

.operate-info {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 2rem;

  @media screen and (max-width: 720px) {
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
  @media screen and (max-width: 720px) {
    @apply truncate;
    width: 3rem;
  }
}

.md5 {
  margin-left: 3rem;
  color: var(--el-color-info-light-3);

  @media screen and (max-width: 720px) {
    display: none;
  }
}

.edit-music {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 1rem;
}

.edit-music-button {
  height: 2.2rem;
}

.skeleton-info {
  display: flex;
  flex-direction: row;
  gap: 3rem;

  @media screen and (max-width: 1024px) {
    flex-direction: column;
  }
}
</style>
