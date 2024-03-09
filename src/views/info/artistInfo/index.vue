<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  ArtistInfoRes,
  ArtistMvListRes,
  getArtistInfo,
  getMvList
} from "@/api/singer";
import LoadImg from "@/components/LoadImg/LoadImg.vue";
import { dateFormater } from "@/utils/dateUtil";
import VideoCard from "@/views/components/videoCard/index.vue";
import DialogEditArtistInfo from "@/views/info/artistInfo/components/DialogEditArtistInfo/index.vue";
import DisPlayDefault from "@/views/components/DisPlayDefault/index.vue";

const router = useRouter();

const idValue = ref();
const artistInfo = ref<ArtistInfoRes>({
  birth: undefined,
  location: undefined,
  picId: 0,
  sex: undefined,
  albumList: [],
  aliasName: "",
  artistName: "",
  artistNames: [],
  createTime: "",
  id: 0,
  introduction: "",
  musicList: [],
  picUrl: "",
  updateTime: ""
});

const mvList = ref<Array<ArtistMvListRes>>();
const tableFlag = ref<boolean>(true);

const skeletonLoadingFlag = ref<boolean>(false);

const mvListRef = ref<HTMLElement>();
async function initInfo() {
  try {
    skeletonLoadingFlag.value = true;
    const res = await getArtistInfo(idValue.value);
    artistInfo.value = res.data;

    const resMvList = await getMvList(idValue.value);
    mvList.value = resMvList.data;
  } finally {
    skeletonLoadingFlag.value = false;
  }
}

const getTableFlag = (flag: boolean) => {
  return flag ? "primary" : "info";
};

onMounted(() => {
  idValue.value = useRouter().currentRoute.value.query.id;
  initInfo();
});

const editArtistInfoFlag = ref<boolean>(false);

const centerDialogVisible = ref<boolean>();

const toAlbum = res => {
  router.push({
    name: "AlbumInfo",
    query: { id: res }
  });
};
</script>
<template>
  <div>
    <DialogEditArtistInfo
      v-model="editArtistInfoFlag"
      :artist-info="artistInfo"
      @onSubmit="initInfo"
    />
    <el-skeleton :loading="skeletonLoadingFlag" animated>
      <template #template>
        <div class="show-artist-data">
          <el-skeleton-item
            variant="image"
            style="width: 20rem; height: 20rem; border-radius: 2rem"
          />
          <div class="flex flex-col gap-2">
            <el-skeleton-item
              variant="h1"
              style="width: 20rem; height: 3rem; border-radius: 1rem"
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
                style="width: 11rem; height: 1rem"
              />
            </div>
            <el-skeleton />
          </div>
        </div>
      </template>
      <template #default>
        <div class="show-artist-data">
          <LoadImg :src="artistInfo.picUrl" class="flex-2" />
          <div class="info">
            <div class="flex flex-nowrap items-center justify-between">
              <p class="title">{{ artistInfo.artistName }}</p>
              <el-button
                type="primary"
                round
                @click="editArtistInfoFlag = true"
              >
                编辑信息
              </el-button>
            </div>
            <div class="flex flex-nowrap gap-2">
              <h3
                v-for="(item, index) in artistInfo.artistNames"
                :key="index"
                class="align-middle font-semibold opacity-50"
              >
                {{ item }}
              </h3>
            </div>
            <div>
              <p class="font-bold">
                性别:
                <DisPlayDefault :value="artistInfo.birth">
                  {{ artistInfo.sex ?? "unknown" }}
                </DisPlayDefault>
              </p>
              <p class="font-bold">
                出生日期:
                <DisPlayDefault :value="artistInfo.birth">
                  <span>{{ artistInfo.birth }}</span>
                </DisPlayDefault>
              </p>
              <p class="font-bold">
                居住地:
                <DisPlayDefault :value="artistInfo.location">
                  {{ artistInfo.location ?? "unknown" }}
                </DisPlayDefault>
              </p>
            </div>
            <div>
              <h2 class="mt-4">介绍:</h2>
              <p class="content">
                <span class="text-desc font-bold">
                  {{ artistInfo.introduction }}
                </span>
              </p>
              <el-link
                v-if="
                  artistInfo.introduction != null &&
                  artistInfo.introduction !== ''
                "
                class="tail"
                :underline="false"
                @click="centerDialogVisible = !centerDialogVisible"
                >[详情]
              </el-link>
              <p v-else class="opacity-50">unknown</p>

              <!--显示专辑详细信息-->
              <el-dialog
                v-model="centerDialogVisible"
                class="showDialog"
                width="30%"
                :show-close="false"
              >
                <template #header>
                  <h2>{{ artistInfo.artistName }}</h2>
                  <span
                    v-for="(item, index) in artistInfo.artistNames"
                    :key="index"
                    class="text-sm text-neutral-400"
                    >{{ item }}&#32;</span
                  >
                  <span
                    v-if="
                      artistInfo.birth !== '' &&
                      artistInfo.birth !== null &&
                      artistInfo.birth !== undefined
                    "
                    class="text-sm text-neutral-400"
                    >&#32;·&#32;</span
                  >
                  <span
                    v-if="
                      artistInfo.birth !== '' &&
                      artistInfo.birth !== null &&
                      artistInfo.birth !== undefined
                    "
                    class="text-sm text-neutral-400"
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
      </template>
    </el-skeleton>
    <div class="flex gap-4 mb-2">
      <el-link
        :underline="false"
        :type="getTableFlag(tableFlag)"
        @click="tableFlag = true"
      >
        <p class="album-title">专辑</p>
      </el-link>
      <el-link
        :underline="false"
        :type="getTableFlag(!tableFlag)"
        @click="tableFlag = false"
      >
        <p class="album-title">MV</p>
      </el-link>
    </div>
    <!--专辑-->
    <el-skeleton v-if="tableFlag" :loading="skeletonLoadingFlag" animated>
      <template #default>
        <div class="show-album">
          <div v-for="(item, index) in artistInfo.albumList" :key="index">
            <div class="album-info cursor-pointer" @click="toAlbum(item.id)">
              <el-image :src="item.picUrl" fit="cover" class="album-img" />
              <p class="album-name">
                {{ item.albumName }}
              </p>
              <p class="album-publish">
                {{ dateFormater("YYYY", item.publishTime) }}
              </p>
            </div>
          </div>
        </div>
      </template>
      <template #template>
        <div class="show-album">
          <el-skeleton-item
            v-for="item in 4"
            :key="item"
            variant="image"
            style="width: 10rem; height: 10rem; border-radius: 1rem"
          />
        </div>
      </template>
    </el-skeleton>
    <!--MV-->
    <el-skeleton v-else :loading="skeletonLoadingFlag" animated>
      <template #default>
        <div ref="mvListRef" class="mv-layout">
          <div v-for="(item, index) in mvList" :key="index">
            <video-card
              :id="item.id"
              :name="item.title"
              :cover-img="item.picUrl"
              :author="item.artists"
              :scroll-container-ref="mvListRef"
            />
          </div>
        </div>
      </template>
      <template #template>
        <div class="mv-layout">
          <div v-for="item in 4" :key="item">
            <el-skeleton-item
              variant="image"
              style="width: 16rem; height: 10rem; border-radius: 1rem"
            />
            <el-skeleton-item variant="text" style="width: 90%" />
            <el-skeleton-item variant="text" style="width: 40%" />
          </div>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<style lang="scss" scoped>
.show-artist-data {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;

  @media screen and (width <= 1024px) {
    flex-direction: column;
  }
}

.info {
  flex: 3;
}

.title {
  font-size: 3rem;
}

.content {
  position: relative;
  max-width: 40rem;
  max-height: 6rem;
  overflow: hidden;
  color: var(--el-color-info-light-3);
  text-overflow: ellipsis;
  white-space: pre-line;
}

.show-album {
  display: grid;

  /*  声明列的宽度  */
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));

  /*  声明行间距和列间距  */
  grid-gap: 25px;

  @media screen and (width <= 720px) {
    grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
  }
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
  margin: 0;
  border-radius: 1rem;
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

.mv-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: flex-start;
  margin-top: 1rem;
}
</style>
