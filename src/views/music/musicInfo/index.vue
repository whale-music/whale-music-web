<script lang="ts" setup>
import { onBeforeMount, ref, unref } from "vue";
import { useRouter } from "vue-router";
import {
  getAllMusicList,
  getMusicUrl,
  MusicSearchRes,
  MusicUrlInfo
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

const router = useRouter();
const id = ref();

const musicInfo = ref<MusicSearchRes>({
  album: undefined,
  albumId: 0,
  albumName: "",
  aliaName: "",
  artistIds: [],
  artistName: [],
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
  singerList: [],
  sort: 0,
  timeLength: 0,
  updateTime: ""
});

const musicUrl = ref<MusicUrlInfo[]>();

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
    getMusicUrl(musicInfo.value.id.toString()).then(res => {
      console.log(res, "url");
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

const toMusicPlay = res => {
  if (res.url == null || res.url === "") {
    message(`该音源无效`, { type: "error" });
    return;
  }
  router.push({
    path: "/musicPlay",
    query: { id: res.id }
  });
};
</script>
<template>
  <div>
    <div class="info">
      <LoadImg :src="musicInfo.pic" />
      <div class="data">
        <div>
          <p class="name">{{ musicInfo.musicName }}</p>
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
            dateFormater("YYYY-MM-dd", musicInfo.publishTime)
          }}</span>
        </div>
        <div>
          <el-button-group>
            <el-button
              style="height: 2.4rem"
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
              style="height: 2.4rem"
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

  @media screen and (max-width: 720px) {
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
</style>
