<script lang="ts">
import { defineComponent } from "vue";

import Artplayer from "@/components/artplayer/Artplayer.vue";
export default defineComponent({
  name: "VideoPlayer",
  components: {
    Artplayer
  },
  props: {
    mvUrl: String,
    previewPicUrl: String
  },
  data() {
    return {
      option: {
        url: this.mvUrl,
        poster: this.previewPicUrl,
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
        width: "calc((100vw) * (6 / 10))",
        height: "calc((100vh)*( 3/5 ))"
      },
      artController: null
    };
  },
  computed: {
    getInstance: {
      get() {
        return this.artController;
      },
      set(art) {
        this.artController = art;
      }
    }
  },
  watch: {
    mvUrl(newVal) {
      this.option.url = newVal;
    }
  },
  mounted() {},
  beforeUnmount() {},
  methods: {}
});
</script>

<template>
  <Artplayer :option="option" :style="style" @get-instance="getInstance" />
</template>
