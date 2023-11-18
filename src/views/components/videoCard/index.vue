<script lang="ts">
import IconifyIconOffline from "@/components/ReIcon/src/iconifyIconOffline";
import UserRoundedLineDuotone from "@iconify-icons/solar/user-rounded-line-duotone";
import { SimpleArtist } from "@/api/mv";
import { defineComponent } from "vue";

export default defineComponent({
  name: "VideoCard",
  setup() {
    return {
      IconifyIconOffline,
      UserRoundedLineDuotone
    };
  },
  props: {
    id: Number,
    name: [String, Number],
    author: [Array<SimpleArtist>, undefined],
    coverImg: String,
    scrollContainerRef: HTMLElement
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
              element-loading-background="rgba(234, 236, 237, 0.8)"
              class="w-64 h-40"
              v-loading="true"
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
        class="font-semibold text-[var(--el-text-color-placeholder)]"
        v-if="!Array.isArray(author) || author.length == 0"
      >
        无歌手
      </span>
      <div v-else>
        <el-link
          :underline="false"
          v-for="(item, index) in author"
          :key="item.id"
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
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.2);
      opacity: 0;
      transition: opacity 400ms ease;
      pointer-events: none;
    }

    &:hover::after {
      opacity: 1;
    }
  }
}
</style>
