<script setup lang="ts">
import { cloneDeep } from "@pureadmin/utils";
import { Action, ElMessage, ElMessageBox } from "element-plus";
import { markRaw, reactive, ref } from "vue";
import { LocationQuery, useRoute, useRouter } from "vue-router";

import DrawerAlbum from "@/components/AddData/DrawerAlbum/index.vue";
import DrawerArtist from "@/components/AddData/DrawerArtist/index.vue";
import DrawerMusic from "@/components/AddData/DrawerMusic/index.vue";
import LibPage from "@/components/LibPage/index.vue";
import { randomKey } from "@/utils/SearchParse";
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

const selectCount = ref([]);
const drawer = reactive({
  music: false,
  album: false,
  artist: false,
  mv: false
});

const router = useRouter();
const initHomeInfo = () => {
  const query = cloneDeep(route.query);
  query[randomKey] = Date.now().toString();
  router.push({ query: query, replace: true });
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
      v-model:activeTabName="activeName"
      v-model:selectCount="selectCount"
      :tabs="tabs"
      @drawerClick="drawerClick"
    >
      <el-tab-pane
        v-for="item in tabs"
        :label="item.label"
        :name="item.name"
        :key="item.name"
        :lazy="true"
      >
        <component :is="item.comp" v-model:selectCount="selectCount" />
      </el-tab-pane>
    </LibPage>
  </div>
</template>

<style scoped></style>
