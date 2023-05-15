<script lang="ts" setup>
import { onBeforeMount, ref } from "vue";
import { useRouter } from "vue-router";
import LoadImg from "@/components/LoadImg/LoadImg.vue";
import {
  Artist,
  ArtistInfoRes,
  getArtistInfo,
  saveOrUpdateArtist
} from "@/api/singer";
import { dateFormater } from "@/utils/dateUtil";
import { clone } from "@pureadmin/utils";
import { message } from "@/utils/message";
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
    modifyArtistInfo.value = clone(artistInfo.value, true);
  });
});

const modifyArtistInfo = ref<ArtistInfoRes>();
const editArtistInfoFlag = ref<boolean>(false);

const centerDialogVisible = ref<boolean>();

const editArtistInfo = async () => {
  const data: Artist = {
    aliasName: modifyArtistInfo.value.aliasName,
    artistName: modifyArtistInfo.value.artistName,
    birth: modifyArtistInfo.value.birth,
    createTime: modifyArtistInfo.value.createTime,
    id: modifyArtistInfo.value.id,
    introduction: modifyArtistInfo.value.introduction,
    location: modifyArtistInfo.value.location,
    pic: modifyArtistInfo.value.pic,
    sex: modifyArtistInfo.value.sex,
    updateTime: modifyArtistInfo.value.updateTime
  };
  const r = await saveOrUpdateArtist(data);
  if (r.code == "200") {
    message("更新成功", { type: "success" });
    editArtistInfoFlag.value = false;
    artistInfo.value = modifyArtistInfo.value;
  } else {
    message(`更新失败: ${r.message}`, { type: "error" });
    modifyArtistInfo.value = artistInfo.value;
  }
};

const toAlbum = res => {
  router.push({
    path: "/music/albumInfo",
    query: { id: res }
  });
};
</script>
<template>
  <div>
    <el-dialog v-model="editArtistInfoFlag" :show-close="false">
      <div>
        <el-scrollbar height="20rem">
          <el-form label-position="top">
            <el-form-item label="歌手名">
              <el-input v-model="modifyArtistInfo.artistName" />
            </el-form-item>
            <el-form-item label="歌手名别名(请用英文,逗号分割)">
              <el-input v-model="modifyArtistInfo.aliasName" />
            </el-form-item>
            <el-form-item label="封面">
              <el-input v-model="modifyArtistInfo.pic" />
            </el-form-item>
            <el-form-item label="出生日期">
              <el-input v-model="modifyArtistInfo.birth" />
            </el-form-item>
            <el-form-item label="居住地">
              <el-input v-model="modifyArtistInfo.location" />
            </el-form-item>
            <el-form-item label="介绍">
              <el-input
                v-model="modifyArtistInfo.introduction"
                type="textarea"
                :autosize="{ maxRows: 10, minRows: 4 }"
              />
            </el-form-item>
          </el-form>
        </el-scrollbar>
      </div>
      <template #footer>
        <el-button @click="editArtistInfoFlag = false">取消</el-button>
        <el-button @click="editArtistInfo" type="primary">更新</el-button>
      </template>
    </el-dialog>
    <div class="show-artist-data">
      <LoadImg :src="artistInfo.pic" class="flex-2" />
      <div class="info">
        <div class="flex flex-nowrap items-center justify-between">
          <p class="title">{{ artistInfo.artistName }}</p>
          <el-button @click="editArtistInfoFlag = true" type="primary" round
            >编辑信息</el-button
          >
        </div>
        <div class="flex flex-nowrap gap-2">
          <el-link
            :underline="false"
            v-for="(item, index) in artistInfo.artistNames"
            :key="index"
            ><span class="align-middle font-semibold">{{ item }}</span></el-link
          >
        </div>
        <span
          class="show-font"
          v-show="artistInfo.birth !== '' && artistInfo.birth !== null"
          >出生年月:<span>{{ artistInfo.birth }}</span>
        </span>
        <p
          class="show-font"
          v-show="artistInfo.sex !== null && artistInfo.sex !== ''"
        >
          性别: {{ artistInfo.sex }}
        </p>
        <div>
          <h2 class="mt-4" style="color: var(--el-color-info-light-3)">
            介绍:
          </h2>
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
@import "@/style/element/dialog.scss";

.show-artist-data {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;

  @media screen and (max-width: 1024px) {
    flex-direction: column;
  }
}

.info {
  flex: 3;
}

.title {
  font-size: 3rem;
}

.show-font {
  font-size: 1rem;
  color: var(--el-color-info-light-3);
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

  @media screen and (max-width: 720px) {
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
