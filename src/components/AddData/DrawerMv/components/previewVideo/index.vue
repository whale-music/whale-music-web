<script lang="ts">
import { defineComponent } from "vue";

import Artplayer from "@/components/artplayer/Artplayer.vue";
export default defineComponent({
  name: "PreviewVideo",
  components: {
    Artplayer
  },
  props: {
    value: Boolean,
    previewVideoUrl: String
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
  watch: {
    previewVideoUrl(newVal) {
      this.option.url = newVal;
    }
  },
  mounted() {},
  beforeUnmount() {},
  methods: {
    getInstance(art) {
      this.artController = art;
    }
  }
});
</script>

<template>
  <el-dialog v-model="isShowPreview">
    <template #header>
      <h1>预览</h1>
    </template>
    <Artplayer :option="option" :style="style" @get-instance="getInstance" />
  </el-dialog>
</template>
