<script setup lang="ts">
import VideoPlayer from "@/views/info/mvInfo/components/videoPlayer/index.vue";
import LoadImg from "@/components/LoadImg/LoadImg.vue";
import videoImg from "./video.png";
defineOptions({
  name: "PreviewFile"
});
const value = defineModel<boolean>();

const src = defineModel<string>("src");
const type = defineModel<string>("type");
const title = defineModel<string>("title");
</script>

<template>
  <ElDialog v-model="value" :title="title">
    <template #default>
      <div class="flex-c">
        <audio v-if="type == 'audio'" :src="src" controls />
        <LoadImg v-else-if="type === 'image'" :src="src" />
        <VideoPlayer
          v-else-if="type === 'video'"
          :mv-url="src"
          :preview-pic-url="videoImg"
        />
        <span v-else>未知应用</span>
      </div>
    </template>
  </ElDialog>
</template>
