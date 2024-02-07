<script lang="ts">
import Artplayer from "@/components/artplayer/Artplayer.vue";

import { defineComponent } from "vue";
export default defineComponent({
  name: "PreviewVideo",
  props: {
    value: Boolean,
    previewVideoUrl: String
  },
  components: {
    Artplayer
  },
  data() {
    return {
      option: {
        url: this.previewVideoUrl,
        theme: "#5352ed",
        fullscreen: true,
        fullscreenWeb: true,
        autoOrientation: true,
        screenshot: true,
        pip: true,
        playsInline: true,
        flip: true,
        playbackRate: true,
        aspectRatio: true,
        setting: true,
        lock: true,
        plugins: []
      },
      style: {
        width: "100%",
        height: "25rem"
      },
      artController: null
    };
  },
  computed: {
    isShowPreview: {
      get() {
        return this.value;
      },
      set(newValue) {
        if (!newValue) {
          // 关闭自动暂停
          this.artController.pause();
        }
        this.$emit("update:value", newValue);
      }
    }
  },
  methods: {
    getInstance(art) {
      this.artController = art;
    }
  },
  watch: {
    previewVideoUrl(newVal) {
      this.option.url = newVal;
    }
  },
  mounted() {},
  beforeUnmount() {}
});
</script>

<template>
  <el-dialog v-model="isShowPreview">
    <template #header>
      <h1>预览</h1>
    </template>
    <Artplayer @get-instance="getInstance" :option="option" :style="style" />
  </el-dialog>
</template>

<style></style>
