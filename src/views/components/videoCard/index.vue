<script lang="ts">
import UserRoundedLineDuotone from "@iconify-icons/solar/user-rounded-line-duotone";
import { defineComponent } from "vue";

import { SimpleArtist } from "@/api/mv";
import IconifyIconOffline from "@/components/ReIcon/src/iconifyIconOffline";

export default defineComponent({
  name: "VideoCard",
  props: {
    id: Number,
    name: [String, Number],
    author: [Array<SimpleArtist>, undefined],
    coverImg: String,
    scrollContainerRef: HTMLElement
  },
  setup() {
    return {
      IconifyIconOffline,
      UserRoundedLineDuotone
    };
  }
});
</script>

<template>
  <div>
    <div class="img-box">
      <router-link
        :to="{
          name: 'MvInfo',
          query: { id: id }
        }"
      >
        <el-image
          class="w-64 h-40 rounded-lg mv-pic cursor-pointer"
          :src="coverImg"
          fit="cover"
          :alt="coverImg"
          loading="lazy"
          :scroll-container="scrollContainerRef"
        >
          <template #placeholder>
            <div
              v-loading="true"
              element-loading-background="rgba(234, 236, 237, 0.8)"
              class="w-64 h-40"
            />
          </template>
          <template #error>
            <div class="mv-item-error">加载失败</div>
          </template>
        </el-image>
      </router-link>
      <div class="info" />
    </div>
    <router-link
      :to="{
        name: 'MvInfo',
        query: { id: id }
      }"
    >
      <el-link :underline="false">
        <h3 class="truncate w-28">{{ name }}</h3>
      </el-link>
    </router-link>
    <div class="flex items-center">
      <IconifyIconOffline
        class="icon-scale text-[var(--el-text-color-primary)]"
        :icon="UserRoundedLineDuotone"
        width="1rem"
        height="1rem"
      />
      <span
        v-if="!Array.isArray(author) || author.length == 0"
        class="font-semibold text-[var(--el-text-color-placeholder)]"
      >
        无歌手
      </span>
      <div v-else>
        <el-link
          v-for="(item, index) in author"
          :key="item.id"
          :underline="false"
        >
          <router-link
            :to="{
              name: 'ArtistInfo',
              query: { id: item.id }
            }"
          >
            <span class="font-semibold">
              {{
                (index === author.length - 1 && item.name) || item.name + "·"
              }}
            </span>
          </router-link>
        </el-link>
      </div>
    </div>
    <span class="text-sm text-[var(--el-text-color-placeholder)]">
      2010-10-11
    </span>
    <span> · </span>
    <span class="text-sm text-[var(--el-text-color-placeholder)]">02:00</span>
  </div>
</template>

<style scoped lang="scss">
.img-box {
  .mv-pic {
    will-change: transform;

    :deep(.el-image__inner):hover {
      transition: transform 0.75s ease;
      transform: scale(1.1);
    }

    :deep(.el-image__inner) {
      transition: transform 400ms ease;
      transform: scale(1);
    }

    &::after {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      content: "";
      background: rgb(0 0 0 / 20%);
      opacity: 0;
      transition: opacity 400ms ease;
    }

    &:hover::after {
      opacity: 1;
    }
  }
}
</style>
