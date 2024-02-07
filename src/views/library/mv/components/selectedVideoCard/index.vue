<script lang="ts">
import CheckCircleBold from "@iconify-icons/solar/check-circle-bold";
import CheckCircleLineDuotone from "@iconify-icons/solar/check-circle-line-duotone";
import { defineComponent } from "vue";

import { SimpleArtist } from "@/api/mv";
import VideoCard from "@/views/components/videoCard/index.vue";

export default defineComponent({
  name: "SelectVideoCard",
  components: {
    VideoCard
  },
  setup() {
    return {
      CheckCircleLineDuotone,
      CheckCircleBold
    };
  },
  props: {
    id: Number,
    name: [String, Number],
    author: [Array<SimpleArtist>, undefined],
    coverImg: String,
    scrollContainerRef: HTMLElement,
    index: Number,
    isCheck: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isSelect: this.isCheck
    };
  },
  watch: {
    isCheck(newVal) {
      this.isSelect = newVal;
    }
  },
  methods: {
    onChange() {
      this.isSelect = !this.isSelect;
      this.$emit("update-check", this.index, this.isSelect);
    }
  }
});
</script>

<template>
  <div class="select-card">
    <video-card
      :id="id"
      :cover-img="coverImg"
      :name="name"
      :author="author"
      :scroll-container-ref="scrollContainerRef"
    />
    <a>
      <IconifyIconOffline
        v-if="this.isSelect"
        @click="onChange"
        class="icon-scale text-[var(--el-color-primary)]"
        :icon="CheckCircleBold"
        width="1rem"
        height="1rem"
      />
      <IconifyIconOffline
        v-else
        @click="onChange"
        class="icon-scale text-[var(--el-text-color-placeholder)]"
        :icon="CheckCircleLineDuotone"
        width="1rem"
        height="1rem"
      />
    </a>
  </div>
</template>

<style scoped lang="scss">
.select-card {
  position: relative;
}

.icon-scale {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 1.6rem;
  height: 1.6rem;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-pack: center;
  justify-content: center;
  -ms-flex-align: center;
  align-items: center;
  border-radius: 5px;
  background-color: #fffffc;
  -webkit-transition: opacity 0.3s ease, color 0.3s ease,
    background-color 0.3s ease;
  -o-transition: opacity 0.3s ease, color 0.3s ease, background-color 0.3s ease;
  transition: opacity 0.3s ease, color 0.3s ease, background-color 0.3s ease;
  cursor: pointer;
  z-index: 1;
}
</style>
