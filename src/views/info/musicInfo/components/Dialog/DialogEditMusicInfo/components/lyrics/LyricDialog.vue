<script setup lang="ts">
import { computed } from "vue";
import { LyricContent, MusicLyrics } from "@/api/music";
import { message } from "@/utils/message";
import { updateLyric } from "@/views/info/musicInfo/components/Dialog/DialogEditMusicInfo/components/lyrics/index";

const props = defineProps({
  musicId: Number
});
const emits = defineEmits(["onSubmit"]);
const value = defineModel<boolean>({ required: true });
const type = defineModel<"lyric" | "klyric" | "tlyric" | "">("type", {
  required: true
});
const lyrics = defineModel<MusicLyrics | undefined>("lyrics", {
  required: true
});
// const lyricsText = ref(lyrics?.value?[type.value]?.lyric);
const toMap = val => {
  return new Map<string, LyricContent>(Object.entries(val));
};
const lyricsText = computed({
  get: () => {
    return lyrics.value[type.value].lyric;
  },
  set: val => {
    lyrics.value[type.value].lyric = val;
  }
});

const onSubmit = () => {
  value.value = false;
  if (type.value === "") {
    message("lyrics type is empty", { type: "error" });
  } else {
    updateLyric(props.musicId, type.value, lyricsText.value);
    emits("onSubmit");
  }
};
</script>

<template>
  <!--编辑逐字歌曲框-->
  <el-dialog v-model="value">
    <template #header> <h1>逐字歌词</h1> </template>
    <el-input v-model="lyricsText" type="textarea" :rows="10" />
    <template #footer>
      <el-button @click="value = false">取消</el-button>
      <el-button type="primary" @click="onSubmit"> 更新 </el-button>
    </template>
  </el-dialog>
</template>
