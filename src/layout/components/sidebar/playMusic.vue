<script lang="ts" setup="">
import { defineComponent, reactive, watch } from "vue";
import { emitter } from "@/utils/mitt";
import AlbumLine from "@iconify-icons/mingcute/album-line";
import MusicPlay from "@/layout/components/musicPlay/index.vue";
import { storageLocal } from "@pureadmin/utils";

defineComponent({
  name: "playMusic"
});

const state = reactive<{
  showPlayMusic: boolean;
}>({
  showPlayMusic: storageLocal().getItem<boolean>("showPlayMusic")
});

watch(
  () => state.showPlayMusic,
  value => {
    storageLocal().setItem<boolean>("showPlayMusic", value);
  }
);

emitter.on("openPlayMusic", () => {
  state.showPlayMusic = true;
});

emitter.on("closePlayMusic", () => {
  state.showPlayMusic = false;
});
</script>

<template>
  <div>
    <div class="cursor-pointer" @click="state.showPlayMusic = true">
      <div class="animate-spin">
        <IconifyIconOffline
          style="color: var(--el-color-primary)"
          width="1.8rem"
          height="1.8rem"
          :icon="AlbumLine"
        />
      </div>
    </div>
    <el-drawer
      style="--el-drawer-padding-primary: 0"
      v-model="state.showPlayMusic"
      direction="btt"
      modal-class="drawer-music-play"
      :with-header="false"
      :append-to-body="true"
      size="100%"
    >
      <music-play />
    </el-drawer>
  </div>
</template>
<style lang="scss" scoped></style>
