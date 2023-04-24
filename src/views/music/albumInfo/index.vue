<script lang="ts" setup>
import { onBeforeMount, ref } from "vue";
import { useRouter } from "vue-router";
import { AlbumDataRes, getAlbumDataInfo } from "@/api/album";
import { dateFormater } from "@/utils/dateUtil";
import { Icon } from "@iconify/vue";
import LoadImg from "@/components/LoadImg/LoadImg.vue";

const router = useRouter();

const albumId = ref();

const albumInfo = ref<AlbumDataRes>({
  artistList: [],
  albumName: "",
  albumSize: 0,
  company: "",
  createTime: "",
  description: "",
  id: 0,
  musicList: [],
  pic: "",
  publishTime: "",
  subType: "",
  updateTime: ""
});

onBeforeMount(() => {
  albumId.value = useRouter().currentRoute.value.query.id;
  console.log(albumId);
  getAlbumDataInfo(albumId.value).then(res => {
    console.log(res);
    albumInfo.value = res.data;
  });
});

const centerDialogVisible = ref(false);

const toMusicInfo = id => {
  router.push({
    path: "/music/musicInfo",
    query: { id: id }
  });
};

const toArtist = id => {
  router.push({
    path: "/music/artistInfo",
    query: { id: id }
  });
};
</script>
<template>
  <div>
    <div class="flex">
      <LoadImg :src="albumInfo.pic" />
      <div class="show-artist-data">
        <div>
          <span class="name">{{ albumInfo.albumName }}</span>
          <br />
          <div class="flex items-center">
            <span>艺术家:&#32;</span>
            <el-link
              :underline="false"
              @click="toArtist(item.id)"
              v-for="(item, index) in albumInfo.artistList"
              :key="index"
              ><span class="font-semibold" v-html="item.artistName + '\u00a0'"
            /></el-link>
          </div>
          <span>类型: </span>
          <span>{{ albumInfo.subType }}</span>
          <br />
          <div
            v-if="
              albumInfo.company !== '' &&
              albumInfo.company !== null &&
              albumInfo.company !== undefined
            "
          >
            <span>唱片公司: </span>
            <span>{{ albumInfo.company }}</span>
          </div>
          <br />
          <div>
            <p class="content">
              <span class="font-bold">{{ albumInfo.description }} </span>
            </p>
            <el-link
              class="tail"
              :underline="false"
              @click="centerDialogVisible = !centerDialogVisible"
              >[详情]
            </el-link>

            <!--显示专辑详细信息-->
            <el-dialog
              class="showDialog"
              v-model="centerDialogVisible"
              width="30%"
              :show-close="false"
            >
              <template #header>
                <h2>{{ albumInfo.albumName }}</h2>
                <span
                  class="text-sm text-neutral-400"
                  v-for="(item, index) in albumInfo.artistList"
                  :key="index"
                  >{{ item.artistName }}</span
                >
                <span class="text-sm text-neutral-400">&#32;·&#32;</span>
                <span class="text-sm text-neutral-400">
                  {{ dateFormater("YYYY", albumInfo.publishTime) }}</span
                >
              </template>
              <el-scrollbar class="show-desc">
                <span>{{ albumInfo.description }}</span>
              </el-scrollbar>
            </el-dialog>
          </div>
        </div>
      </div>
    </div>
    <div class="item">
      <div
        class="music-item"
        :style="{ 'background-color': index % 2 !== 1 ? '#ffff' : '#eeeeee' }"
        v-for="(item, index) in albumInfo.musicList"
        :key="index"
      >
        <div
          @click="toMusicInfo(item.id)"
          class="h-full flex items-center cursor-pointer"
        >
          <span class="music index">{{ index + 1 }}</span>
          <span class="music">
            {{ item.musicName }}
          </span>
        </div>
        <div class="h-full grow cursor-pointer" @click="toMusicInfo(item.id)" />
        <div>
          <span class="mr-4">{{ dateFormater("mm:ss", item.timeLength) }}</span>
          <el-link :underline="false" class="mr-8">
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
</template>
<style lang="scss" scoped>
.info {
  width: 20rem;
  height: 20rem;
  border-radius: 2rem;
  box-shadow: #c9c9c7 1px 1px 10px;
}

.show-artist-data {
  margin-left: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.name {
  font-size: 3rem;
}

.content {
  max-width: 40rem;
  max-height: 6rem;
  color: var(--el-color-info-light-3);
  position: relative;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: pre-line;
}

.show-desc {
  height: 20rem;
  overflow-y: auto;
}

:deep(.el-dialog) {
  border-radius: 1rem;
}

.tail {
  position: relative;
  left: 0;
}

.item {
  margin-top: 2rem;
}

.music-item {
  width: 100%;
  height: 3.6rem;
  background-color: #fff;
  border-radius: 1rem;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-content: center;
  align-items: center;
  justify-content: space-between;
}

.music-item:hover {
  width: 100%;
  height: 3.6rem;
  background-color: #000000;
  border-radius: 1rem;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-content: center;
  align-items: center;
  justify-content: space-between;
}

.music {
  margin-left: 1rem;
}

.index {
  color: var(--el-color-info-light-3);
}
</style>
