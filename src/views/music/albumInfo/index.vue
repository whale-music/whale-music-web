<script lang="ts" setup>
import { onBeforeMount, ref, watch } from "vue";
import { useRouter } from "vue-router";
import {
  Album,
  AlbumDataRes,
  getAlbumDataInfo,
  saveOrUpdateAlbum
} from "@/api/album";
import { dateFormater } from "@/utils/dateUtil";
import { Icon } from "@iconify/vue";
import LoadImg from "@/components/LoadImg/LoadImg.vue";
import { clone } from "@pureadmin/utils";
import { message } from "@/utils/message";

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
  picId: undefined,
  picUrl: "",
  musicList: [],
  publishTime: "",
  subType: "",
  updateTime: ""
});

const skeletonLoadingFlag = ref<boolean>(false);
onBeforeMount(() => {
  albumId.value = useRouter().currentRoute.value.query.id;
  skeletonLoadingFlag.value = true;
  console.log(albumId);
  getAlbumDataInfo(albumId.value).then(res => {
    albumInfo.value = res.data;
    modifyAlbumInfo.value = clone(albumInfo.value, true);
    publishTime.value = clone(modifyAlbumInfo.value.publishTime, true);
    skeletonLoadingFlag.value = false;
  });
});

const publishTime = ref<Date>();
watch(publishTime, value => {
  modifyAlbumInfo.value.publishTime = dateFormater(
    "YYYY-MM-ddTHH:mm:ss",
    value
  );
});

const editAlbumInfoFlag = ref<boolean>(false);
const modifyAlbumInfo = ref<AlbumDataRes>();

const centerDialogVisible = ref(false);

const saveOrUpdate = async () => {
  const data: Album = {
    albumName: modifyAlbumInfo.value.albumName,
    company: modifyAlbumInfo.value.company,
    createTime: modifyAlbumInfo.value.createTime,
    description: modifyAlbumInfo.value.description,
    id: modifyAlbumInfo.value.id,
    pic: modifyAlbumInfo.value.picUrl,
    publishTime: modifyAlbumInfo.value.publishTime,
    subType: modifyAlbumInfo.value.subType,
    updateTime: modifyAlbumInfo.value.updateTime
  };
  const r = await saveOrUpdateAlbum(data);
  if (r.code === "200") {
    message("更新成功", { type: "success" });
    albumInfo.value = modifyAlbumInfo.value;
    editAlbumInfoFlag.value = false;
  } else {
    message(`更新失败${r.message}`, { type: "error" });
    modifyAlbumInfo.value = albumInfo.value;
  }
};

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
    <!--编辑专辑信息-->
    <el-dialog v-model="editAlbumInfoFlag" :show-close="false">
      <el-scrollbar height="20rem">
        <el-form label-position="top">
          <el-form-item label="专辑名">
            <el-input v-model="modifyAlbumInfo.albumName" />
          </el-form-item>
          <el-form-item label="封面">
            <el-input v-model="modifyAlbumInfo.picId" />
          </el-form-item>
          <el-form-item label="专辑版本">
            <el-input v-model="modifyAlbumInfo.subType" />
          </el-form-item>
          <el-form-item label="唱片公司">
            <el-input v-model="modifyAlbumInfo.company" />
          </el-form-item>
          <el-form-item label="发布时间">
            <el-date-picker
              v-model="publishTime"
              type="date"
              placeholder="Pick a day"
              size="default"
            />
          </el-form-item>
          <el-form-item label="专辑描述">
            <el-input
              v-model="modifyAlbumInfo.description"
              type="textarea"
              :autosize="{ maxRows: 10, minRows: 4 }"
            />
          </el-form-item>
        </el-form>
      </el-scrollbar>
      <template #footer>
        <el-button @click="editAlbumInfoFlag = false">取消</el-button>
        <el-button @click="saveOrUpdate" type="primary">更新</el-button>
      </template>
    </el-dialog>
    <el-skeleton :loading="skeletonLoadingFlag" animated>
      <template #template>
        <div class="layout-container">
          <el-skeleton-item
            variant="image"
            style="width: 20rem; height: 20rem; border-radius: 2rem"
          />
          <div class="flex flex-col gap-2">
            <el-skeleton-item
              variant="h1"
              style="height: 3rem; width: 30rem; border-radius: 1rem"
            />
            <div class="flex flex-col gap-1">
              <el-skeleton-item
                variant="p"
                style="height: 1.3rem; width: 10rem"
              />
              <el-skeleton-item
                variant="p"
                style="height: 1.3rem; width: 7rem"
              />
              <el-skeleton-item
                variant="p"
                style="height: 1.3rem; width: 9rem"
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
          <LoadImg :src="albumInfo.picUrl" />
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
                  ><span
                    class="font-semibold"
                    v-html="item.artistName + '\u00a0'"
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
              <div>
                <span
                  >发布时间:
                  {{ dateFormater("YYYY-MM-dd", albumInfo.publishTime) }}</span
                >
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
                  width="45%"
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
                    <span class="whitespace-pre-wrap">{{
                      albumInfo.description
                    }}</span>
                  </el-scrollbar>
                </el-dialog>
              </div>
            </div>
            <div class="mt-2">
              <el-button @click="editAlbumInfoFlag = true" type="primary" round
                >编辑专辑</el-button
              >
            </div>
          </div>
        </div>
      </template>
    </el-skeleton>
    <!--专辑音乐列表-->
    <el-skeleton :loading="skeletonLoadingFlag" animated>
      <template #template>
        <el-skeleton-item
          variant="h1"
          style="
            margin-top: 1rem;
            width: 100%;
            height: 3.6rem;
            border-radius: 1rem;
          "
        />
      </template>
      <template #default>
        <div class="item">
          <div
            :class="{
              'music-item1': index % 2 !== 1,
              'music-item2': index % 2 !== 0
            }"
            :style="{
              'border-top-left-radius': index === 0 ? '1rem' : '0',
              'border-top-right-radius': index === 0 ? '1rem' : '0',
              'border-bottom-left-radius':
                index === albumInfo.musicList.length - 1 ? '1rem' : '0',
              'border-bottom-right-radius':
                index === albumInfo.musicList.length - 1 ? '1rem' : '0'
            }"
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
            <div
              class="h-full grow cursor-pointer"
              @click="toMusicInfo(item.id)"
            />
            <div>
              <span class="mr-4">{{
                dateFormater("mm:ss", item.timeLength)
              }}</span>
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
      </template>
    </el-skeleton>
  </div>
</template>
<style lang="scss" scoped>
.layout-container {
  display: flex;
  flex-direction: row;
  gap: 3rem;

  @media screen and (max-width: 1024px) {
    flex-direction: column;
  }
}

.info {
  width: 20rem;
  height: 20rem;
  border-radius: 2rem;
  box-shadow: #c9c9c7 1px 1px 10px;
}

.show-artist-data {
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

.tail {
  position: relative;
  left: 0;
}

.item {
  margin-top: 2rem;
}

.music-item1 {
  @apply dark:bg-[#232323];
  width: 100%;
  height: 3.6rem;
  background-color: #ffffff;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-content: center;
  align-items: center;
  justify-content: space-between;
}

.music-item1:hover {
  @apply dark:bg-[#2c2c2c];
  width: 100%;
  height: 3.6rem;
  background-color: #eeeeee;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-content: center;
  align-items: center;
  justify-content: space-between;
}

.music-item2 {
  @apply dark:bg-[#1f1f1f];
  width: 100%;
  height: 3.6rem;
  background-color: #f6f6f6;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-content: center;
  align-items: center;
  justify-content: space-between;
}

.music-item2:hover {
  @apply dark:bg-[#2c2c2c];
  width: 100%;
  height: 3.6rem;
  background-color: #eeeeee;
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
