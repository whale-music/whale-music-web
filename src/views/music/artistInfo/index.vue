<script lang="ts" setup>
import { onBeforeMount, ref } from "vue";
import { useRouter } from "vue-router";
import LoadImg from "@/components/LoadImg/LoadImg.vue";
import { ArtistInfoRes, getArtistInfo } from "@/api/singer";
import { dateFormater } from "@/utils/dateUtil";
const router = useRouter();

const idValue = ref();
const artistInfo = ref<ArtistInfoRes>({
  albumList: [],
  aliasName: "",
  artistName: "",
  artistNames: [],
  createTime: "",
  id: 0,
  introduction: "",
  musicList: [],
  pic: "",
  updateTime: ""
});

onBeforeMount(() => {
  idValue.value = useRouter().currentRoute.value.query.id;

  getArtistInfo(idValue.value).then(res => {
    console.log(res);
    artistInfo.value = res.data;
  });
});

const centerDialogVisible = ref<boolean>();

const toAlbum = res => {
  router.push({
    path: "/music/albumInfo",
    query: { id: res }
  });
};
</script>
<template>
  <div>
    <div class="show-artist-data">
      <LoadImg :src="artistInfo.pic" />
      <div class="info">
        <p class="title">{{ artistInfo.artistName }}</p>
        <el-link
          :underline="false"
          v-for="(item, index) in artistInfo.artistNames"
          :key="index"
          ><span class="align-middle font-semibold" v-html="item + '\u00a0'"
        /></el-link>
        <br />
        <span
          class="show-font"
          v-show="artistInfo.birth !== '' && artistInfo.birth !== null"
          >出生年月:
        </span>
        <span>{{ artistInfo.birth }}</span>
        <span>{{ artistInfo.sex }}</span>

        <div>
          <p class="content">
            <span class="text-desc font-bold"
              >{{ artistInfo.introduction }}
            </span>
          </p>
          <el-link
            class="tail"
            :underline="false"
            v-if="
              artistInfo.introduction != null && artistInfo.introduction !== ''
            "
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
              <h2>{{ artistInfo.artistName }}</h2>
              <span
                class="text-sm text-neutral-400"
                v-for="(item, index) in artistInfo.artistNames"
                :key="index"
                >{{ item }}&#32;</span
              >
              <span
                class="text-sm text-neutral-400"
                v-if="
                  artistInfo.birth !== '' &&
                  artistInfo.birth !== null &&
                  artistInfo.birth !== undefined
                "
                >&#32;·&#32;</span
              >
              <span
                class="text-sm text-neutral-400"
                v-if="
                  artistInfo.birth !== '' &&
                  artistInfo.birth !== null &&
                  artistInfo.birth !== undefined
                "
              >
                {{ dateFormater("YYYY-MM-dd", artistInfo.birth) }}</span
              >
            </template>
            <el-scrollbar class="show-desc">
              <span>{{ artistInfo.introduction }}</span>
            </el-scrollbar>
          </el-dialog>
        </div>
      </div>
    </div>
    <div>
      <p class="album-title">专辑</p>
      <div class="show-album">
        <div v-for="(item, index) in artistInfo.albumList" :key="index">
          <div class="album-info cursor-pointer" @click="toAlbum(item.id)">
            <el-image :src="item.pic" fit="cover" class="album-img" />
            <p class="album-name">
              {{ item.albumName }}
            </p>
            <p class="album-publish">
              {{ dateFormater("YYYY", item.publishTime) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.show-artist-data {
  display: flex;
}

.title {
  font-size: 3rem;
}

.info {
  margin-left: 2rem;
}

.show-font {
  font-size: 1rem;
  color: var(--el-color-info-light-3);
}

:deep(.el-dialog) {
  border-radius: 1rem;
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

.show-album {
  display: grid;
  /*  声明列的宽度  */
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  /*  声明行间距和列间距  */
  grid-gap: 25px;
}

.album-title {
  margin-top: 2rem;
  font-size: 2rem;
}

.album-img {
  width: 10rem;
  height: 10rem;
  border-radius: 1rem;
  box-shadow: var(--el-color-info-light-3) 1px 1px 10px;
}

.album-info {
  width: 10rem;
  height: 14rem;
  border-radius: 1rem;
  margin: 0;
}

.album-name {
  @apply truncate;
  @apply font-bold;
  color: var(--el-text-color-regular);
}

.album-publish {
  @apply font-bold;
  font-size: 0.7rem;
  color: var(--el-color-info);
}
</style>
