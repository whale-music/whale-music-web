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
  setup() {
    return {
      CheckCircleLineDuotone,
      CheckCircleBold
    };
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
        v-if="isSelect"
        class="icon-scale text-[var(--el-color-primary)]"
        :icon="CheckCircleBold"
        width="1rem"
        height="1rem"
        @click="onChange"
      />
      <IconifyIconOffline
        v-else
        class="icon-scale text-[var(--el-text-color-placeholder)]"
        :icon="CheckCircleLineDuotone"
        width="1rem"
        height="1rem"
        @click="onChange"
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
  z-index: 1;
  display: -webkit-box;
  display: flexbox;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.6rem;
  height: 1.6rem;
  cursor: pointer;
  background-color: #fffffc;
  border-radius: 5px;
  transition:
    opacity 0.3s ease,
    color 0.3s ease,
    background-color 0.3s ease;
  -ms-flex-pack: center;
  -ms-flex-align: center;
}
</style>
