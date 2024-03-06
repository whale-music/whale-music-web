<script setup lang="ts">
import { AutocompleteFetchSuggestions } from "element-plus/es/components/autocomplete/src/autocomplete";
import { getSelectAlbumList } from "@/api/album";
import { SelectAlbum } from "@/api/model/Album";
import { isAllEmpty } from "@pureadmin/utils";
import { computed, ref, unref } from "vue";
import { MusicDetailInfoAlbum } from "@/api/music";

defineOptions({
  name: "AutocompleteAlbum"
});

const album = defineModel<MusicDetailInfoAlbum>();
const albumSearchInput = ref<string>("");

// 专辑搜索
const albumQuerySearchAsync: AutocompleteFetchSuggestions = (
  queryString: string,
  cb: (arg: any) => void
) => {
  getSelectAlbumList(queryString).then(selectAlbumR => {
    if (selectAlbumR.code === "200" && selectAlbumR.data.length !== 0) {
      cb(selectAlbumR.data);
    } else {
      cb([]);
    }
  });
};

// 选择专辑
const albumHandleSelect = (item: SelectAlbum) => {
  album.value = {
    albumId: item.id,
    albumName: item.albumName,
    artist: item.artists
  };
  albumSearchInput.value = "";
};

const removeAlbum = () => {
  album.value = null;
};

const albumArtist = computed(() => {
  return album.value?.artist;
});
const albumName = computed(() => {
  return album.value?.albumName;
});
</script>
<template>
  <div class="w-full">
    <div class="flex gap-2">
      <el-tag
        v-if="!isAllEmpty(album)"
        effect="dark"
        round
        closable
        @close="removeAlbum"
      >
        <span>{{ albumName }}</span>
      </el-tag>
      <el-link
        v-for="item in albumArtist"
        :key="item.id"
        class="font-bold"
        type="primary"
        :underline="false"
        @click="unref(item.artistName)"
      >
        <span class="font-bold">#{{ item.artistName }}#</span>
      </el-link>
    </div>
    <el-autocomplete
      v-model="albumSearchInput"
      class="w-full mt-1"
      :fetch-suggestions="albumQuerySearchAsync"
      placeholder="请输入专辑名"
      @select="albumHandleSelect"
    >
      <template #default="{ item }">
        <span v-html="item.display" />
      </template>
    </el-autocomplete>
  </div>
</template>
