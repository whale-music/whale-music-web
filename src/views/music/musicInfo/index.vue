<script lang="ts" setup>
import { onBeforeMount, ref, unref, watch } from "vue";
import { useRouter } from "vue-router";
import {
  getAllMusicList,
  getMusicLyric,
  getMusicUrl,
  MusicSearchRes,
  MusicUrlInfo,
  saveOrUpdateLyric,
  updateMusic
} from "@/api/music";
import { dateFormater } from "@/utils/dateUtil";
import { Icon } from "@iconify/vue";
import LoadImg from "@/components/LoadImg/LoadImg.vue";
import { storageSession, useCopyToClipboard } from "@pureadmin/utils";
import { message } from "@/utils/message";
import axios from "axios";
import { downloadByData } from "@pureadmin/utils";
import PlayIcon from "@/assets/svg/play.svg?component";
import AddMusicToPlayList from "@/components/addMusicToPlayList/addMusicToPlayList.vue";
import { getUserPlayList, UserPlayListRes } from "@/api/playlist";
import { DataInfo, sessionKey } from "@/utils/auth";
import { usePlaySongListStoreHook } from "@/store/modules/playSongList";
import { getSelectAlbumList } from "@/api/album";
import { getSelectSingerList } from "@/api/singer";
import { clone } from "@pureadmin/utils";

const router = useRouter();
const id = ref();

const musicInfo = ref<MusicSearchRes>({
  album: null,
  albumId: 0,
  albumName: "",
  aliaName: "",
  artistIds: [],
  artistNames: [],
  createTime: "",
  id: 0,
  isExist: false,
  isPlaying: false,
  kLyric: "",
  lyric: "",
  musicName: "",
  musicNameAlias: "",
  musicRawUrl: "",
  musicUrlList: [],
  order: false,
  pic: "",
  publishTime: "",
  artistList: [],
  sort: 0,
  timeLength: 0,
  updateTime: ""
});

const musicUrl = ref<MusicUrlInfo[]>();

const publishTime = ref<Date>();
onBeforeMount(() => {
  id.value = useRouter().currentRoute.value.query.id;
  getAllMusicList({
    refresh: false,
    musicIds: [id.value],
    afterDate: "",
    albumName: "",
    beforeDate: "",
    musicName: "",
    order: false,
    orderBy: "",
    page: { pageIndex: 0, pageNum: 1 },
    artistName: ""
  }).then(res => {
    musicInfo.value = res.data.records[0];
    modifyMusicInfo.value = clone(res.data.records[0], true);
    publishTime.value = clone(modifyMusicInfo.value.publishTime);

    getMusicUrl(musicInfo.value.id.toString()).then(res => {
      musicUrl.value = res.data;
    });
  });
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
    if (musicUrlInfo !== null && musicUrlInfo.url !== "") {
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

const addPlaySongList = () => {
  console.log("添加到播放歌单");
  usePlaySongListStoreHook().addMusicToNextPlaySongList(musicInfo.value.id);
  message("成功添加音乐到歌单", { type: "success" });
};

const editMusicInfoFlag = ref<boolean>(false);
const modifyMusicInfo = ref<MusicSearchRes>();

const deleteSoundSource = () => {
  console.log("删除音乐");
};

interface LinkItem {
  value: string;
  link: number;
  display: string;
}

const artistSearch = ref<string>("");
// 获取歌手数据
const artistQuerySearchAsync = async (
  queryString: string,
  cb: (arg: any) => void
) => {
  const selectAlbumR = await getSelectSingerList(queryString);
  console.log(selectAlbumR, "select Album");
  if (selectAlbumR.code === "200" && selectAlbumR.data.length !== 0) {
    cb(selectAlbumR.data);
  }
};

// 删除歌手数据
const artistHandleClose = index => {
  modifyMusicInfo.value.artistNames.splice(index, 1);
  modifyMusicInfo.value.artistIds.splice(index, 1);
};

// 歌手添加到保存数据中
const artistHandleSelect = (item: LinkItem) => {
  modifyMusicInfo.value.artistNames.push(item.value);
  modifyMusicInfo.value.artistIds.push(item.link);
  artistSearch.value = "";
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
  if (res.url == null || res.url === "") {
    message(`该音源无效`, { type: "error" });
    return;
  }
  try {
    await usePlaySongListStoreHook().playSongList(musicInfo.value.id);
  } catch (e) {
    message(e, { type: "error" });
    return;
  }
  await router.push({
    path: "/musicPlay"
  });
};
</script>
<template>
  <div>
    <el-dialog v-model="lyricValueFlag">
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

    <el-dialog v-model="kLyricValueFlag">
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

    <el-dialog v-model="editMusicInfoFlag" width="37%" :show-close="false">
      <el-scrollbar height="20rem">
        <h1>音乐名</h1>
        <el-input v-model="modifyMusicInfo.musicName" />
        <h1>音乐别名</h1>
        <el-input v-model="modifyMusicInfo.musicNameAlias" />
        <h1>封面</h1>
        <el-input v-model="modifyMusicInfo.pic" />
        <div class="flex flex-nowrap items-end">
          <h1>艺术家</h1>
        </div>
        <el-tag
          v-for="(item, index) in modifyMusicInfo.artistNames"
          :key="item"
          @close="artistHandleClose(index)"
          effect="dark"
          closable
          round
          >{{ item }}</el-tag
        >
        <el-autocomplete
          class="w-full mt-1"
          v-model="artistSearch"
          :fetch-suggestions="artistQuerySearchAsync"
          placeholder="请输入歌手名"
          @select="artistHandleSelect"
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
        <div class="flex flex-nowrap items-center">
          <h1>音乐时长</h1>
          <span class="text-sm">(毫秒值)</span>
        </div>
        <div class="flex flex-nowrap items-center">
          <span class="text-xl font-bold">{{
            dateFormater("mm:ss", modifyMusicInfo.timeLength)
          }}</span>
          <el-input-number
            class="ml-4"
            :step="1000"
            v-model="modifyMusicInfo.timeLength"
          />
        </div>
        <h1>发布时间(与专辑同步)</h1>
        <el-date-picker
          v-model="publishTime"
          type="date"
          placeholder="Pick a day"
          size="default"
        />
      </el-scrollbar>
      <template #footer>
        <el-button @click="editMusicInfoFlag = false">取消</el-button>
        <el-button @click="updateMusicButton" type="primary">更新</el-button>
      </template>
    </el-dialog>
    <div class="info">
      <LoadImg :src="musicInfo.pic" />
      <div class="data">
        <div>
          <p class="name">
            {{ musicInfo.musicName === "" ? "加载中" : musicInfo.musicName }}
          </p>
          <p class="name-alis">{{ musicInfo.musicNameAlias }}</p>
          <span class="show-font">专辑: </span>
          <el-link :underline="false" @click="toAlbum(musicInfo.albumId)"
            ><span class="cursor-pointer font-semibold">{{
              musicInfo.albumName
            }}</span></el-link
          >
          <br />
          <span class="show-font">艺术家: </span>
          <el-link
            :underline="false"
            v-for="(item, index) in musicInfo.artistNames"
            :key="index"
            ><span
              @click="toArtist(musicInfo.artistIds[index])"
              class="cursor-pointer font-semibold"
              v-html="item + '\u00a0'"
          /></el-link>
          <br />
          <span class="show-font">发行时间: </span>
          <span class="font-bold">{{
            musicInfo.publishTime === ""
              ? "加载中"
              : dateFormater("YYYY-MM-dd", musicInfo.publishTime)
          }}</span>
          <div class="edit-music">
            <div class="flex mr-4">
              <el-button-group>
                <el-button
                  class="edit-music-button"
                  type="primary"
                  size="default"
                  round
                  @click="playMusic"
                >
                  <i><PlayIcon class="w-5 h-5" /></i>
                  <span v-html="'\u00a0' + '播放' + '\u00a0'"
                /></el-button>
                <el-button
                  type="primary"
                  class="edit-music-button"
                  round
                  size="default"
                  @click="getUserPlayInfo(musicInfo.id)"
                  ><i
                    ><IconifyIconOnline
                      color="#ffffff"
                      icon="mingcute:add-fill"
                      width="1.1rem"
                      height="1.1rem" /></i
                ></el-button>
              </el-button-group>
              <!--添加歌曲到歌单-->
              <AddMusicToPlayList
                v-if="playItemDialogVisible"
                :play-item="userPlayItem"
                :userId="Number.parseInt(userInfo.id)"
                :music-id="addMusicId"
                @closeDialog="playItemDialogVisible = false"
              />
            </div>
            <el-button
              type="primary"
              class="edit-music-button"
              @click="addPlaySongList"
              plain
              round
              ><i
                ><IconifyIconOnline
                  color="#868686"
                  icon="solar:turntable-music-note-bold-duotone"
                  width="1.1rem"
                  height="1.1rem" /></i
              >添加到播放歌单</el-button
            >
            <el-button
              type="info"
              class="edit-music-button"
              @click="
                getLyricList();
                editMusicInfoFlag = true;
              "
              round
              >编辑音乐</el-button
            >
            <el-button
              type="danger"
              class="edit-music-button"
              @click="deleteSoundSource"
              round
              >删除音源</el-button
            >
          </div>
        </div>
      </div>
    </div>
    <div class="text-2xl mt-4">音源</div>
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
          <div class="grow h-full cursor-pointer" @click="toMusicPlay(item)" />
          <div class="operate-info">
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="
                item.url == null || item.url === '' ? '不可播放' : '可播放'
              "
              placement="top-start"
            >
              <IconifyIconOnline
                class="mr-4"
                :style="{
                  color:
                    item.url == null || item.url === '' ? '#7d7d7d' : '#626aef'
                }"
                icon="solar:play-stream-bold"
                width="2rem"
                height="2rem"
              />
            </el-tooltip>
            <span class="mr-4 font-medium level">{{ item.level }}</span>
            <div class="flex items-center">
              <el-button round class="mr-4" @click="copy(item.url)"
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
                            item.url
                          )
                        "
                        >下载音源
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
  </div>
</template>

<style lang="scss" scoped>
@import "@/style/element/dialog.scss";

.info {
  display: flex;
  flex-wrap: wrap;
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
    width: 25rem;
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
  margin-left: 2rem;

  @media screen and (max-width: 1280px) {
    margin-top: 1rem;
    margin-left: 0;
  }
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
    margin-right: 0;
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
  margin-top: 0.8rem;
  display: flex;
}

.edit-music-button {
  height: 2.2rem;
}
</style>
