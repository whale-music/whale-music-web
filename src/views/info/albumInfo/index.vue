<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import { clone } from "@pureadmin/utils";
import {
  genFileId,
  UploadInstance,
  UploadProps,
  UploadRawFile
} from "element-plus";
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

import { getAlbumDataInfo, saveOrUpdateAlbum } from "@/api/album";
import { AlbumInfo, SaveOrUpdateAlbum } from "@/api/model/Album";
import { SelectArtist } from "@/api/model/Artist";
import { getSelectSingerList } from "@/api/singer";
import LoadImg from "@/components/LoadImg/LoadImg.vue";
import { dateFormater } from "@/utils/dateUtil";
import { message } from "@/utils/message";
import DialogEditAlbum from "@/views/info/albumInfo/components/DialogEditAlbum/index.vue";
import DisPlayDefault from "@/views/components/DisPlayDefault/index.vue";
import AlbumDetail from "@/views/info/albumInfo/components/AlbumDetail/index.vue";

const router = useRouter();

const state = reactive({
  loading: {
    skeletonLoadingFlag: false
  },
  albumInfo: {} as AlbumInfo
});

onMounted(() => {
  state.albumInfo.id = Number(useRouter().currentRoute.value.query.id);
  initAlbumInfo();
});

function initAlbumInfo() {
  state.loading.skeletonLoadingFlag = true;
  getAlbumDataInfo(state.albumInfo.id)
    .then(res => {
      state.albumInfo = res.data;
    })
    .finally(() => {
      state.loading.skeletonLoadingFlag = false;
    });
}

const editAlbumInfoFlag = ref<boolean>(false);
const centerDialogVisible = ref(false);

const toMusicInfo = id => {
  router.push({
    name: "MusicInfo",
    query: { id: id }
  });
};
</script>
<template>
  <div>
    <DialogEditAlbum
      v-model="editAlbumInfoFlag"
      :album-info="state.albumInfo"
      @onSubmit="initAlbumInfo"
    />
    <!--显示专辑详细信息-->
    <AlbumDetail v-model="centerDialogVisible" :album-info="state.albumInfo" />
    <!--专辑信息-->
    <el-skeleton :loading="state.loading.skeletonLoadingFlag" animated>
      <template #template>
        <div class="layout-container">
          <el-skeleton-item
            variant="image"
            style="width: 20rem; height: 20rem; border-radius: 2rem"
          />
          <div class="flex flex-col gap-2">
            <el-skeleton-item
              variant="h1"
              style="width: 30rem; height: 3rem; border-radius: 1rem"
            />
            <div class="flex flex-col gap-1">
              <el-skeleton-item
                variant="p"
                style="width: 10rem; height: 1.3rem"
              />
              <el-skeleton-item
                variant="p"
                style="width: 7rem; height: 1.3rem"
              />
              <el-skeleton-item
                variant="p"
                style="width: 9rem; height: 1.3rem"
              />
              <el-skeleton />
              <el-skeleton-item
                variant="button"
                style="width: 6rem; height: 2.3rem; border-radius: 2rem"
              />
            </div>
          </div>
        </div>
      </template>
      <template #default>
        <div class="layout-container">
          <LoadImg :src="state.albumInfo.picUrl" />
          <div class="flex flex-col justify-between gap-2">
            <div class="space-y-2">
              <div>
                <h1 class="font-medium text-5xl mb-1">
                  {{ state.albumInfo.albumName }}
                </h1>
                <div class="space-x-2">
                  <span class="opacity-50 font-bold">流派:</span>
                  <DisPlayDefault :value="state.albumInfo.albumGenre">
                    <el-link
                      v-for="item in state.albumInfo.albumGenre"
                      :key="item"
                      :underline="false"
                    >
                      <span class="font-bold">
                        {{ item }}
                      </span>
                    </el-link>
                  </DisPlayDefault>
                </div>
                <div class="space-x-2">
                  <span class="opacity-50 font-bold">艺术家:</span>
                  <DisPlayDefault :value="state.albumInfo.artistList">
                    <el-link
                      v-for="(item, index) in state.albumInfo.artistList"
                      :key="index"
                      :underline="false"
                    >
                      <router-link
                        :to="{
                          name: 'ArtistInfo',
                          query: { id: item.id }
                        }"
                      >
                        <span class="font-bold">
                          {{ item.artistName }}
                        </span>
                      </router-link>
                    </el-link>
                  </DisPlayDefault>
                </div>
                <div class="space-x-2">
                  <span class="opacity-50 font-bold">类型: </span>
                  <DisPlayDefault :value="state.albumInfo.subType">
                    <span class="font-bold">{{ state.albumInfo.subType }}</span>
                  </DisPlayDefault>
                </div>
                <div class="space-x-2">
                  <span class="opacity-50 font-bold">唱片公司: </span>
                  <DisPlayDefault :value="state.albumInfo.company">
                    <span class="font-bold">{{ state.albumInfo.company }}</span>
                  </DisPlayDefault>
                </div>
                <div class="space-x-2">
                  <span class="opacity-50 font-bold">发布时间:</span>
                  <DisPlayDefault :value="state.albumInfo.publishTime">
                    <span class="font-bold">
                      {{
                        dateFormater("YYYY-MM-dd", state.albumInfo.publishTime)
                      }}
                    </span>
                  </DisPlayDefault>
                </div>
              </div>
              <div>
                <p class="content">
                  <span class="font-bold"
                    >{{ state.albumInfo.description }}
                  </span>
                </p>
                <el-link
                  class="tail"
                  :underline="false"
                  @click="centerDialogVisible = !centerDialogVisible"
                  >[详情]
                </el-link>
              </div>
            </div>
            <div>
              <el-button type="primary" round @click="editAlbumInfoFlag = true">
                编辑专辑
              </el-button>
            </div>
          </div>
        </div>
      </template>
    </el-skeleton>
    <!--专辑音乐列表-->
    <el-skeleton :loading="state.loading.skeletonLoadingFlag" animated>
      <template #template>
        <el-skeleton-item
          variant="h1"
          style="
            width: 100%;
            height: 3.6rem;
            margin-top: 1rem;
            border-radius: 1rem;
          "
        />
      </template>
      <template #default>
        <div class="mt-8">
          <div
            v-for="(item, index) in state.albumInfo.musicList"
            :key="index"
            :class="{
              'music-item1': index % 2 !== 1,
              'music-item2': index % 2 !== 0
            }"
            :style="{
              'border-top-left-radius': index === 0 ? '1rem' : '0',
              'border-top-right-radius': index === 0 ? '1rem' : '0',
              'border-bottom-left-radius':
                index === state.albumInfo.musicList.length - 1 ? '1rem' : '0',
              'border-bottom-right-radius':
                index === state.albumInfo.musicList.length - 1 ? '1rem' : '0'
            }"
          >
            <div
              class="h-full flex items-center space-x-4 cursor-pointer"
              @click="toMusicInfo(item.id)"
            >
              <span class="ml-4 opacity-40">{{ index + 1 }}</span>
              <span class="md:min-w-80 w-32 truncate">
                {{ item.musicName }}
              </span>
              <span class="font-bold opacity-50 md:w-1/2 w-10 truncate">
                {{ item.aliasName }}
              </span>
            </div>
            <div
              class="h-full grow cursor-pointer"
              @click="toMusicInfo(item.id)"
            />
            <div class="flex">
              <span class="mr-4">
                {{ dateFormater("mm:ss", item.timeLength) }}
              </span>
              <el-link :underline="false" class="mr-8">
                <el-dropdown>
                  <el-icon :size="20" class="cursor-pointer">
                    <Icon icon="ep:more-filled" />
                  </el-icon>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="message('该功能未开发')">
                        播放
                      </el-dropdown-item>
                      <el-dropdown-item @click="message('该功能未开发')">
                        下载
                      </el-dropdown-item>
                      <el-dropdown-item @click="message('该功能未开发')">
                        分享
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </el-link>
            </div>
          </div>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>
<style lang="scss" scoped>
.layout-container {
  display: flex;
  flex-direction: row;
  gap: 3rem;

  @media screen and (width <= 1024px) {
    flex-direction: column;
  }
}

.info {
  width: 20rem;
  height: 20rem;
  border-radius: 2rem;
  box-shadow: #c9c9c7 1px 1px 10px;
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

.tail {
  position: relative;
  left: 0;
}

.music-item1 {
  @apply dark:bg-[#232323];

  display: flex;
  flex-flow: row nowrap;
  place-content: center space-between;
  align-items: center;
  width: 100%;
  height: 3.6rem;
  background-color: #fff;
}

.music-item1:hover {
  @apply dark:bg-[#2c2c2c];

  display: flex;
  flex-flow: row nowrap;
  place-content: center space-between;
  align-items: center;
  width: 100%;
  height: 3.6rem;
  background-color: #eee;
}

.music-item2 {
  @apply dark:bg-[#1f1f1f];

  display: flex;
  flex-flow: row nowrap;
  place-content: center space-between;
  align-items: center;
  width: 100%;
  height: 3.6rem;
  background-color: #f6f6f6;
}

.music-item2:hover {
  @apply dark:bg-[#2c2c2c];

  display: flex;
  flex-flow: row nowrap;
  place-content: center space-between;
  align-items: center;
  width: 100%;
  height: 3.6rem;
  background-color: #eee;
}
</style>
