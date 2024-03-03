<script setup lang="ts">
import { Action, ElMessage, ElMessageBox } from "element-plus";
import { markRaw, onMounted, reactive, ref } from "vue";
import { LocationQuery, useRoute } from "vue-router";

import DrawerAlbum from "@/components/AddData/DrawerAlbum/index.vue";
import DrawerArtist from "@/components/AddData/DrawerArtist/index.vue";
import DrawerMusic from "@/components/AddData/DrawerMusic/index.vue";
import LibPage from "@/components/LibPage/index.vue";
import router from "@/router";
import { emitter } from "@/utils/mitt";
import {
  parseQueryToSearchName,
  parseSearchToQuery
} from "@/utils/SearchParse";
import AlbumLibrary from "@/views/library/library/components/AlbumLibrary/index.vue";
import ArtistLibrary from "@/views/library/library/components/ArtistLibrary/index.vue";
import MusicLibrary from "@/views/library/library/components/MusicLibrary/index.vue";

const tabs = reactive([
  {
    name: "music",
    label: "音乐",
    comp: markRaw(MusicLibrary)
  },
  {
    name: "album",
    label: "专辑",
    comp: markRaw(AlbumLibrary)
  },
  {
    name: "artist",
    label: "歌手",
    comp: markRaw(ArtistLibrary)
  }
]);

const route = useRoute();

const query: LocationQuery = route.query;
const type = (query["type"] ?? "music") as string;
const activeName = ref(type);

const searchInput = ref("");
const searchName = ref<LocationQuery>({ type: "" });

const selectCount = ref([]);
onMounted(() => {
  const { nameStr, musicStr, artistStr, albumStr } =
    parseQueryToSearchName(query);
  searchInput.value = `${nameStr} ${musicStr} ${albumStr} ${artistStr}`.trim();

  activeName.value = type;
  onSubmit(activeName.value);
});

function parasParam(type?: string) {
  const query = parseSearchToQuery(searchInput.value);
  query["type"] = type ?? "music";
  query["random"] = Date.now().toString();
  return query;
}

// 监听容器
emitter.on("library", () => {
  onSubmit();
});

const onSubmit = (type?: string) => {
  const query = parasParam(type ?? activeName.value);
  searchName.value = query;
  selectCount.value = [];
  router.push({ query: query, replace: true });
};

const handleSizeChange = (val: number) => {
  console.log(val);
};

const handleTabClick = (name: string) => {
  onSubmit(name);
};

const drawer = reactive({
  music: false,
  album: false,
  artist: false,
  mv: false
});
const initHomeInfo = () => {
  onSubmit();
};
const drawerClick = () => {
  switch (activeName.value) {
    case "music":
      drawer.music = true;
      break;
    case "album":
      drawer.album = true;
      break;
    case "artist":
      drawer.artist = true;
      break;
    case "mv":
      drawer.mv = true;
      break;
    default:
      ElMessageBox.alert("侧栏参数启动错误", "Error", {
        confirmButtonText: "OK",
        callback: (action: Action) => {
          ElMessage({
            type: "info",
            message: `action: ${action}`
          });
        }
      });
  }
};
</script>
<template>
  <div>
    <DrawerMusic v-model="drawer.music" @change="initHomeInfo" />
    <DrawerAlbum v-model="drawer.album" @change="initHomeInfo" />
    <DrawerArtist v-model="drawer.artist" @change="initHomeInfo" />

    <LibPage
      v-model="searchInput"
      v-model:activeTabName="activeName"
      v-model:selectCount="selectCount"
      :tabs="tabs"
      @sizeChange="handleSizeChange"
      @onSubmit="onSubmit"
      @tabClick="handleTabClick"
      @drawerClick="drawerClick"
    >
      <template v-slot:[item.name] v-for="item in tabs" :key="item.name">
        <component :is="item.comp" v-model:selectCount="selectCount" />
      </template>
    </LibPage>
  </div>
</template>

<style scoped></style>
