<script setup lang="ts">
import LoadImg from "@/components/LoadImg/LoadImg.vue";
import { TagsPageRes } from "@/api/tags";
import { isAllEmpty } from "@pureadmin/utils";
import { useRouter } from "vue-router";

defineOptions({
  name: "TagCard"
});
const value = defineModel<TagsPageRes>();

const props = defineProps<{
  highlightTag: string[];
}>();

const typeColor = new Map<
  string,
  "success" | "warning" | "info" | "primary" | "danger"
>([
  ["musicTag", "primary"],
  ["musicGenre", "success"],
  ["albumGenre", "warning"],
  ["collectTag", "danger"],
  ["mvTag", "info"]
]);

const typeName = new Map([
  ["musicTag", "音乐tag"],
  ["musicGenre", "音乐流派"],
  ["albumGenre", "专辑流派"],
  ["collectTag", "歌单Tag"],
  ["mvTag", "Mv Tag"]
]);

const typeRouter = new Map([
  ["musicTag", "MusicInfo"],
  ["musicGenre", "MusicInfo"],
  ["albumGenre", "AlbumInfo"],
  ["collectTag", `${value.value.id}`],
  ["mvTag", "MvInfo"]
]);

const tagHighlight = (val: string) => {
  return props.highlightTag.includes(val) ? "dark" : "light";
};

const router = useRouter();
const toRouter = () => {
  router.push({
    name: typeRouter.get(value.value.tagType[0]),
    query: { id: value.value.id }
  });
};
</script>

<template>
  <div class="relative">
    <div
      class="w-full min-h-28 bg-[var(--el-bg-color)] rounded-xl flex gap-4 p-2"
    >
      <div>
        <LoadImg :src="value.picUrl" height="7rem" width="7rem" />
      </div>
      <div>
        <ElLink :underline="false">
          <h2 @click="toRouter">{{ value.name }}</h2>
        </ElLink>
        <div class="space-y-2">
          <div v-if="!isAllEmpty(value.tagContent)">
            <div class="flex flex-wrap gap-2">
              <span class="opacity-50 font-bold">tag: </span>
              <ElTag
                v-for="i in value.tagContent"
                :key="i"
                round
                :effect="tagHighlight(i)"
              >
                {{ i }}
              </ElTag>
            </div>
          </div>
          <div v-if="!isAllEmpty(value.genres)">
            <div class="flex flex-wrap gap-2">
              <span class="opacity-50 font-bold">genre: </span>
              <ElTag
                v-for="i in value.genres"
                :key="i"
                round
                :effect="tagHighlight(i)"
              >
                {{ i }}
              </ElTag>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div>
      <div class="absolute right-4 top-4 space-x-2">
        <ElTag
          v-for="i in value.tagType"
          :key="i"
          effect="dark"
          round
          :type="typeColor.get(i)"
        >
          {{ typeName.get(i) }}
        </ElTag>
      </div>
    </div>
  </div>
</template>
