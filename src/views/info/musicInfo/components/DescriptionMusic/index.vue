<script setup lang="ts">
import { dateFormater } from "@/utils/dateUtil";
import LoadImg from "@/components/LoadImg/LoadImg.vue";
import { MusicDetailInfo, MusicSources } from "@/api/music";
import { computed, ref } from "vue";
import { message } from "@/utils/message";
import { usePlaySongListStoreHook } from "@/store/modules/playSongList";
import AddFill from "@iconify-icons/mingcute/add-fill";
import PlayBold from "@iconify-icons/solar/play-bold";
import { useNav } from "@/layout/hooks/useNav";
import { getUserPlayList, UserPlayListRes } from "@/api/playlist";
import { isAllEmpty, useResizeObserver } from "@pureadmin/utils";
import AddMusicToPlayList from "@/components/addMusicToPlayList/addMusicToPlayList.vue";
import { getUserData } from "@/utils/auth";
import SyncMusic from "@/views/info/musicInfo/components/Dialog/DialogEditMusicInfo/components/SyncMusic/index.vue";
import DialogEditMusicInfo from "@/views/info/musicInfo/components/Dialog/DialogEditMusicInfo/index.vue";
import DialogUploadMusic from "@/views/info/musicInfo/components/Dialog/DialogUploadMusic/index.vue";
import DisPlayDefault from "@/views/components/DisPlayDefault/index.vue";

defineOptions({
  name: "DescriptionMusic"
});

const musicDetail = defineModel<MusicDetailInfo>();
const emits = defineEmits(["onSubmit"]);

const musicUrls = computed(() => musicDetail.value.sources);

const playItemDialogVisible = ref(false);
const containerRef = ref();
const addMusicId = ref<number>();
const userPlayItem = ref<UserPlayListRes[]>();
const userInfo = getUserData();
const editMusicInfoFlag = ref<boolean>(false);
const syncMusicMetaDataFlag = ref<boolean>(false);
const addSoundSourceFlag = ref<boolean>(false);
const operateButton = ref<boolean>();

useResizeObserver(containerRef, entries => {
  const [{ inlineSize }] = entries[0].borderBoxSize;
  operateButton.value = inlineSize < 720;
});

const onSubmit = () => {
  emits("onSubmit");
};

function PlayMusic() {
  const playMusic = () => {
    // todo 优化音乐自动播放
    for (const musicUrlInfo of musicUrls.value) {
      // 只取第一条数据
      if (musicUrlInfo !== null && musicUrlInfo.url !== "") {
        toMusicPlay(musicUrlInfo);
        return;
      }
    }
    message("播放失败，无音源", { type: "error" });
  };
  const { onPlayMusic } = useNav();
  const toMusicPlay = async (res: MusicSources) => {
    if (isAllEmpty(res.url)) {
      message(`该音源无效`, { type: "error" });
      return;
    }
    try {
      await usePlaySongListStoreHook().playSongList(musicDetail.value.id);
    } catch (e) {
      message(e, { type: "error" });
      return;
    }
    onPlayMusic();
  };
  return {
    playMusic
  };
}

function OperatingMusic() {
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
      musicDetail.value.id
    );
    message("成功添加音乐到歌单", { type: "success" });
  };
  return {
    addPlaySongList,
    getUserPlayInfo
  };
}

const { addPlaySongList, getUserPlayInfo } = OperatingMusic();

const { playMusic } = PlayMusic();
</script>

<template>
  <SyncMusic v-model="syncMusicMetaDataFlag" v-model:music-info="musicDetail" />
  <!--编辑音乐信息框-->
  <DialogEditMusicInfo
    v-model="editMusicInfoFlag"
    v-model:music-info="musicDetail"
    @onSubmit="onSubmit"
  />
  <!--添加歌曲到歌单-->
  <AddMusicToPlayList v-model="playItemDialogVisible" :music-id="addMusicId" />
  <DialogUploadMusic
    v-model="addSoundSourceFlag"
    :music-info="musicDetail"
    @onSubmit="onSubmit"
  />
  <div ref="containerRef" class="flex flex-wrap gap-6">
    <LoadImg :src="musicDetail?.picUrl" />
    <div class="flex flex-col justify-between gap-4">
      <div>
        <h1 class="text-5xl w-80 md:w-full truncate">
          {{ musicDetail?.musicName }}
        </h1>
        <h3 class="text-4xl text-[var(--el-color-info-light-3)]">
          {{ musicDetail?.aliasName }}
        </h3>
        <el-descriptions :column="1">
          <el-descriptions-item label="流派" label-class-name="label-desc">
            <DisPlayDefault :value="musicDetail?.musicGenre">
              <el-link
                v-for="item in musicDetail.musicGenre"
                :key="item"
                :underline="false"
              >
                <span class="font-semibold">
                  {{ item }}
                </span>
              </el-link>
            </DisPlayDefault>
          </el-descriptions-item>
          <el-descriptions-item label="Tag">
            <DisPlayDefault :value="musicDetail?.musicTag">
              <el-link
                v-for="item in musicDetail.musicTag"
                :key="item"
                :underline="false"
              >
                <span class="font-semibold">
                  {{ item }}
                </span>
              </el-link>
            </DisPlayDefault>
          </el-descriptions-item>
          <el-descriptions-item label="专辑">
            <DisPlayDefault :value="musicDetail?.album">
              <el-link :underline="false">
                <router-link
                  :to="{
                    name: 'AlbumInfo',
                    query: { id: musicDetail.album.albumId }
                  }"
                  class="cursor-pointer font-semibold"
                >
                  {{ musicDetail?.album?.albumName }}
                </router-link>
              </el-link>
            </DisPlayDefault>
          </el-descriptions-item>
          <el-descriptions-item label="艺术家">
            <DisPlayDefault :value="musicDetail?.artists">
              <el-link
                v-for="(item, index) in musicDetail.artists"
                :key="index"
                class="cursor-pointer font-semibold"
                :underline="false"
              >
                <router-link
                  :to="{ name: 'ArtistInfo', query: { id: item.id } }"
                >
                  <span class="font-semibold">{{ item.artistName }}</span>
                </router-link>
              </el-link>
            </DisPlayDefault>
          </el-descriptions-item>
          <el-descriptions-item label="发行时间">
            <DisPlayDefault :value="musicDetail.publishTime">
              <span class="font-bold">
                {{ dateFormater("YYYY-MM-dd", musicDetail.publishTime) }}
              </span>
            </DisPlayDefault>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <div class="flex gap-4 items-center justify-start">
        <el-button-group type="primary">
          <el-button class="edit-music-button" round @click="playMusic">
            <ElIcon>
              <IconifyIconOffline :icon="PlayBold" />
            </ElIcon>
            <span>播放</span>
          </el-button>
          <el-button
            class="edit-music-button"
            size="default"
            round
            @click="getUserPlayInfo(musicDetail.id)"
          >
            <ElIcon> <IconifyIconOffline :icon="AddFill" /> </ElIcon>
          </el-button>
        </el-button-group>

        <el-dropdown v-if="operateButton">
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
              />
              添加到播放歌单
            </el-dropdown-item>
            <el-dropdown-item @click="editMusicInfoFlag = true">
              <IconifyIconOnline
                color="#868686"
                icon="mingcute:edit-3-line"
                width="1.1rem"
                height="1.1rem"
              />
              编辑音乐
            </el-dropdown-item>
            <el-dropdown-item @click="addSoundSourceFlag = true">
              <IconifyIconOnline
                color="#868686"
                icon="mingcute:add-circle-fill"
                width="1.1rem"
                height="1.1rem"
              />
              添加音源
            </el-dropdown-item>
          </template>
        </el-dropdown>
        <div v-else>
          <el-button
            class="edit-music-button"
            plain
            round
            @click="addPlaySongList"
          >
            <IconifyIconOnline
              color="#868686"
              icon="solar:turntable-music-note-bold-duotone"
              width="1.1rem"
              height="1.1rem"
            />
            添加到播放歌单
          </el-button>
          <el-button
            class="edit-music-button"
            plain
            round
            @click="editMusicInfoFlag = true"
          >
            <IconifyIconOnline
              color="#868686"
              icon="mingcute:edit-3-line"
              width="1.1rem"
              height="1.1rem"
            />
            编辑音乐
          </el-button>
          <el-button
            class="edit-music-button"
            plain
            round
            @click="addSoundSourceFlag = true"
          >
            <IconifyIconOnline
              color="#868686"
              icon="mingcute:add-circle-fill"
              width="1.1rem"
              height="1.1rem"
            />
            添加音源
          </el-button>
          <el-button
            class="edit-music-button"
            plain
            round
            @click="syncMusicMetaDataFlag = true"
          >
            <IconifyIconOnline
              color="#868686"
              icon="solar:refresh-bold-duotone"
              width="1.1rem"
              height="1.1rem"
            />
            同步音乐元数据
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.show-font {
  font-size: 1rem;
  color: var(--el-color-info-light-3);
}

:deep(
    .el-descriptions__body
      .el-descriptions__table:not(.is-bordered)
      .el-descriptions__cell
  ) {
  padding-bottom: 0;
}

:deep(.el-descriptions__label) {
  font-weight: 700;
  opacity: 0.55;
}

:deep(.el-descriptions__body) {
  background-color: transparent;
}
</style>
