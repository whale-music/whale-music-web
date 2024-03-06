<script setup lang="ts">
import { MusicDetailInfoArtist } from "@/api/music";
import { ref } from "vue";
import {
  AutocompleteFetchSuggestions,
  AutocompleteFetchSuggestionsCallback
} from "element-plus/es/components/autocomplete/src/autocomplete";
import type { Awaitable } from "element-plus/es/utils";
import { AutocompleteData } from "element-plus";
import { getSelectSingerList } from "@/api/singer";
import { SelectArtist } from "@/api/model/Artist";
import { isAllEmpty } from "@pureadmin/utils";

defineOptions({
  name: "AutocompleteArtist"
});

const artists = defineModel<MusicDetailInfoArtist[]>();
const musicArtistSearch = ref("");

// 获取歌手数据
const musicArtistQuerySearchAsync: AutocompleteFetchSuggestions = (
  queryString: string,
  cb: AutocompleteFetchSuggestionsCallback
): void | Awaitable<AutocompleteData> => {
  getSelectSingerList(queryString).then(selectArtists => {
    if (selectArtists.code === "200" && selectArtists.data.length !== 0) {
      cb(selectArtists.data);
    }
  });
};

// 歌手添加到保存数据中
const musicArtistHandleSelect = (item: SelectArtist) => {
  musicArtistSearch.value = "";
  if (isAllEmpty(artists.value)) {
    artists.value = [item];
  }
  if (artists.value?.findIndex(value => value.id === item.id) === -1) {
    artists.value?.push(item);
  }
};

// 删除歌手数据
const musicArtistHandleClose = (index: number) => {
  artists.value.splice(index, 1);
};
</script>

<template>
  <div class="w-full">
    <el-tag
      v-for="(item, index) in artists"
      :key="item.id"
      effect="dark"
      closable
      round
      @close="musicArtistHandleClose(index)"
      >{{ item.artistName }}
    </el-tag>
    <el-autocomplete
      v-model="musicArtistSearch"
      class="w-full mt-1"
      :fetch-suggestions="musicArtistQuerySearchAsync"
      placeholder="请输入歌手名"
      @select="musicArtistHandleSelect"
    />
  </div>
</template>
