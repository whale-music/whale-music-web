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

const router = useRouter();

const state = reactive({
  loading: {
    skeletonLoadingFlag: false
  },
  input: {
    musicArtistSearch: ""
  },
  albumInfo: {} as AlbumInfo,
  modifyAlbumInfo: { artistIds: [] } as SaveOrUpdateAlbum
});

onMounted(() => {
  state.albumInfo.id = Number(useRouter().currentRoute.value.query.id);
  initAlbumInfo();
});

function initAlbumInfo() {
  state.loading.skeletonLoadingFlag = true;
  getAlbumDataInfo(String(state.albumInfo.id)).then(res => {
    state.albumInfo = res.data;
    state.modifyAlbumInfo = clone(state.albumInfo, true);
    state.modifyAlbumInfo.albumGenre = state.albumInfo.albumGenre;
    state.modifyAlbumInfo.artistIds = state.modifyAlbumInfo.artistList.map(
      value => value.id
    );
    // publishTime.value = clone(state.modifyAlbumInfo.publishTime, true);
    state.loading.skeletonLoadingFlag = false;
  });
}

const editAlbumInfoFlag = ref<boolean>(false);
const centerDialogVisible = ref(false);

const saveOrUpdate = async () => {
  const r = await saveOrUpdateAlbum(state.modifyAlbumInfo);
  if (r.code === "200") {
    message("更新成功", { type: "success" });
    initAlbumInfo();
    editAlbumInfoFlag.value = false;
  } else {
    message(`更新失败${r.message}`, { type: "error" });
    state.modifyAlbumInfo = {} as SaveOrUpdateAlbum;
  }
};

// 删除歌手数据
const albumArtistHandleClose = index => {
  state.modifyAlbumInfo.artistIds =
    state.modifyAlbumInfo.artistIds == undefined
      ? []
      : state.modifyAlbumInfo.artistIds;
  state.modifyAlbumInfo.artistIds.splice(index, 1);
  state.modifyAlbumInfo.artistList.splice(index, 1);
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

// 歌手添加到保存数据中
const albumArtistHandleSelect = (item: SelectArtist) => {
  state.modifyAlbumInfo.artistIds =
    state.modifyAlbumInfo.artistIds == undefined
      ? []
      : state.modifyAlbumInfo.artistIds;
  const filter = state.modifyAlbumInfo.artistList.findIndex(
    value => value.id === item.id
  );
  if (filter === -1) {
    state.modifyAlbumInfo.artistList.push(item);
    state.modifyAlbumInfo.artistIds.push(item.link);
  }
  state.input.musicArtistSearch = "";
};

const { VITE_PROXY_HOST } = import.meta.env;
const proxyHost = VITE_PROXY_HOST == null ? "" : VITE_PROXY_HOST;
const uploadPicAction = ref(`${proxyHost}/admin/pic/upload`);

const picUpload = ref<UploadInstance>();
// 上传封面
const handleExceed: UploadProps["onExceed"] = files => {
  picUpload.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  picUpload.value!.handleStart(file);
};

const handleSuccess = (response: any) => {
  if (response.code == 200) {
    initAlbumInfo();
    message("封面更新成功", { type: "success" });
  } else {
    message("封面更新失败", { type: "error" });
  }
};

const toMusicInfo = id => {
  router.push({
    name: "MusicInfo",
    query: { id: id }
  });
};

const toArtist = id => {
  router.push({
    name: "ArtistInfo",
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
            <el-input v-model="state.modifyAlbumInfo.albumName" />
          </el-form-item>
          <el-form-item label="封面">
            <div class="flex items-center justify-center w-full gap-4">
              <el-input v-model="state.modifyAlbumInfo.picUrl" disabled />
              <el-upload
                ref="picUpload"
                class="flex justify-center items-center"
                :data="{ id: state.modifyAlbumInfo.id, type: 'album' }"
                :action="uploadPicAction"
                :limit="1"
                :show-file-list="false"
                :on-exceed="handleExceed"
                :on-success="handleSuccess"
                :auto-upload="true"
              >
                <template #trigger>
                  <el-button type="primary"> 上传封面 </el-button>
                </template>
              </el-upload>
            </div>
          </el-form-item>
          <div class="flex flex-nowrap items-end">
            <h1>专辑艺术家</h1>
          </div>
          <el-tag
            v-for="(item, index) in state.modifyAlbumInfo.artistList"
            :key="item"
            effect="dark"
            closable
            round
            @close="albumArtistHandleClose(index)"
            >{{ item.artistName }}</el-tag
          >
          <el-autocomplete
            v-model="state.input.musicArtistSearch"
            class="w-full mt-1"
            :fetch-suggestions="albumArtistQuerySearchAsync"
            placeholder="请输入歌手名"
            @select="albumArtistHandleSelect"
          />
          <el-form-item label="专辑流派">
            <el-input v-model="state.modifyAlbumInfo.albumGenre" />
          </el-form-item>
          <el-form-item label="专辑版本">
            <el-input v-model="state.modifyAlbumInfo.subType" />
          </el-form-item>
          <el-form-item label="唱片公司">
            <el-input v-model="state.modifyAlbumInfo.company" />
          </el-form-item>
          <el-form-item label="发布时间">
            <el-date-picker
              v-model="state.modifyAlbumInfo.publishTime"
              type="date"
              value-format="YYYY-MM-DDT00:00:00"
              size="default"
            />
          </el-form-item>
          <el-form-item label="专辑描述">
            <el-input
              v-model="state.modifyAlbumInfo.description"
              type="textarea"
              :autosize="{ maxRows: 10, minRows: 4 }"
            />
          </el-form-item>
        </el-form>
      </el-scrollbar>
      <template #footer>
        <el-button @click="editAlbumInfoFlag = false">取消</el-button>
        <el-button type="primary" @click="saveOrUpdate">更新</el-button>
      </template>
    </el-dialog>
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
          <div class="show-artist-data">
            <div>
              <span class="name">{{ state.albumInfo.albumName }}</span>
              <br />
              <div>
                流派:
                <el-link>
                  {{ state.albumInfo.albumGenre }}
                </el-link>
              </div>
              <div class="flex items-center">
                <span>艺术家:&#32;</span>
                <el-link
                  v-for="(item, index) in state.albumInfo.artistList"
                  :key="index"
                  :underline="false"
                  @click="toArtist(item.id)"
                  ><span
                    class="font-semibold"
                    v-html="item.artistName + '\u00a0'"
                /></el-link>
              </div>
              <span>类型: </span>
              <span>{{ state.albumInfo.subType }}</span>
              <br />
              <div
                v-if="
                  state.albumInfo.company !== '' &&
                  state.albumInfo.company !== null &&
                  state.albumInfo.company !== undefined
                "
              >
                <span>唱片公司: </span>
                <span>{{ state.albumInfo.company }}</span>
              </div>
              <div>
                <span
                  >发布时间:
                  {{
                    dateFormater("YYYY-MM-dd", state.albumInfo.publishTime)
                  }}</span
                >
              </div>
              <br />
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

                <!--显示专辑详细信息-->
                <el-dialog
                  v-model="centerDialogVisible"
                  class="showDialog"
                  width="45%"
                  :show-close="false"
                >
                  <template #header>
                    <h2>{{ state.albumInfo.albumName }}</h2>
                    <span
                      v-for="(item, index) in state.albumInfo.artistList"
                      :key="index"
                      class="text-sm text-neutral-400"
                      >{{ item.artistName }}</span
                    >
                    <span class="text-sm text-neutral-400">&#32;·&#32;</span>
                    <span class="text-sm text-neutral-400">
                      {{
                        dateFormater("YYYY", state.albumInfo.publishTime)
                      }}</span
                    >
                  </template>
                  <el-scrollbar class="show-desc">
                    <span class="whitespace-pre-wrap">{{
                      state.albumInfo.description
                    }}</span>
                  </el-scrollbar>
                </el-dialog>
              </div>
            </div>
            <div class="mt-2">
              <el-button type="primary" round @click="editAlbumInfoFlag = true"
                >编辑专辑</el-button
              >
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
        <div class="item">
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
              class="h-full flex items-center cursor-pointer"
              @click="toMusicInfo(item.id)"
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

.show-artist-data {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.name {
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

.music {
  margin-left: 1rem;
}

.index {
  color: var(--el-color-info-light-3);
}
</style>
