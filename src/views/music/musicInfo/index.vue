<script lang="ts" setup>
import { onBeforeMount, ref } from "vue";
import { useRouter } from "vue-router";
import { getAllMusicList, getMusicUrl, MusicUrlInfo } from "@/api/music";
import { dateFormater } from "@/utils/dateUtil";
import { Icon } from "@iconify/vue";
import LoadImg from "@/components/LoadImg/LoadImg.vue";
const router = useRouter();
const id = ref();

interface MusicInfo {
  id: number;
  musicName: string;
  musicNameAlias: string;
  singerIds: number[];
  artistName: string[];
  albumId: number;
  albumName: string;
  order: boolean;
  isExist: boolean;
  musicRawUrl: string;
  timeLength: number;
  createTime: string;
  pic: string;
  publishTime: string;
}

const musicInfo = ref<MusicInfo>({
  publishTime: "",
  albumId: 0,
  albumName: "",
  createTime: "",
  id: 0,
  isExist: false,
  musicName: "Music Info",
  musicNameAlias: "",
  musicRawUrl: "",
  order: false,
  pic: "",
  singerIds: [],
  artistName: [],
  timeLength: 0
});

const musicUrl = ref<MusicUrlInfo[]>();

onBeforeMount(() => {
  id.value = useRouter().currentRoute.value.query.id;
  getAllMusicList({
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
    const musicSearchRe = res.data.records[0];
    musicInfo.value = {
      publishTime: dateFormater("YYYY-MM-dd", musicSearchRe.publishTime),
      pic: musicSearchRe.pic,
      albumId: musicSearchRe.albumId,
      albumName: musicSearchRe.albumName,
      createTime: musicSearchRe.createTime,
      id: musicSearchRe.id,
      isExist: musicSearchRe.isExist,
      musicName: musicSearchRe.musicName,
      musicNameAlias: musicSearchRe.musicNameAlias,
      musicRawUrl: musicSearchRe.musicRawUrl,
      order: musicSearchRe.order,
      singerIds: musicSearchRe.singerIds,
      artistName: musicSearchRe.artistName,
      timeLength: 0
    };
    getMusicUrl(musicInfo.value.id.toString()).then(res => {
      console.log(res, "url");
      musicUrl.value = res.data;
    });
  });
});

const toAlbum = albumId => {
  router.push({
    path: "/music/albumInfo",
    query: { id: albumId }
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
            v-for="(item, index) in musicInfo.artistName"
            :key="index"
            ><span
              class="cursor-pointer font-semibold"
              v-html="item + '\u00a0'"
          /></el-link>
          <br />
          <span class="show-font">发行时间: </span>
          <span class="font-bold">{{ musicInfo.publishTime }}</span>
        </div>
        <div class="buttons">
          <el-button round
            ><span v-html="'\u00a0' + '播放' + '\u00a0'"
          /></el-button>
        </div>
      </div>
    </div>
    <div class="text-2xl mt-4">音源</div>
    <div class="item-list">
      <div class="show-item" v-for="(item, index) in musicUrl" :key="index">
        <div class="ml-4">
          <span class="index">{{ index + 1 }}</span>
          <span class="ml-4 font-bold">{{ musicInfo.musicName }}</span>
          <span class="md5">{{ item.md5 }}</span>
        </div>
        <div class="operate-info">
          <span class="mr-4 font-medium level">{{ item.level }}</span>
          <div class="flex items-center">
            <el-button round class="mr-4">复制</el-button>
            <el-link :underline="false">
              <el-dropdown>
                <el-icon :size="20" class="cursor-pointer">
                  <Icon icon="ep:more-filled" />
                </el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>Action 1</el-dropdown-item>
                    <el-dropdown-item>Action 2</el-dropdown-item>
                    <el-dropdown-item>Action 3</el-dropdown-item>
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

<style lang="scss" scoped>
.info {
  display: flex;
}

.frontCover {
  width: 20rem;
  height: 20rem;
  border-radius: 2rem;
  // 将h-shadow,v-shadow设为0px,实现四周阴影
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
}

.level {
  color: #a2a2a2;
}

.index {
  color: var(--el-color-info-light-3);
}

.md5 {
  margin-left: 3rem;
  color: var(--el-color-info-light-3);
}
</style>
