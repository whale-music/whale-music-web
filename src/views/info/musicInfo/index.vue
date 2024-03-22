<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { getMusicInfo, MusicDetailInfo } from "@/api/music";
import DescriptionMusic from "@/views/info/musicInfo/components/DescriptionMusic/index.vue";
import MusicSources from "@/views/info/musicInfo/components/MusicSources/index.vue";

const musicInfo = ref<MusicDetailInfo>();
const skeletonLoadingFlag = ref();

const id = ref();
async function initInfo() {
  skeletonLoadingFlag.value = true;
  try {
    const r = await getMusicInfo(id.value);
    // 显示和更新数据分离
    musicInfo.value = r.data;
  } finally {
    skeletonLoadingFlag.value = false;
  }
}

onMounted(async () => {
  id.value = useRouter().currentRoute.value.query.id;
  await initInfo();
});
</script>
<template>
  <div>
    <div ref="MusicInfoRef" class="flex flex-wrap gap-12 xl:flex-row flex-col">
      <el-skeleton :loading="skeletonLoadingFlag" animated>
        <template #template>
          <div class="skeleton-info">
            <el-skeleton-item
              variant="image"
              style="width: 20rem; height: 20rem; border-radius: 2rem"
            />
            <div class="flex flex-col gap-3">
              <el-skeleton-item
                variant="h1"
                style="width: 20rem; height: 3rem"
              />
              <div class="flex flex-col gap-1">
                <el-skeleton-item
                  variant="text"
                  style="width: 10rem; height: 1rem"
                />
                <el-skeleton-item
                  variant="text"
                  style="width: 8rem; height: 1rem"
                />
                <el-skeleton-item
                  variant="text"
                  style="width: 9rem; height: 1rem"
                />
              </div>
              <div class="flex flex-nowrap gap-4">
                <el-skeleton-item
                  variant="button"
                  style="width: 6rem; height: 2.25rem; border-radius: 1rem"
                />
                <el-skeleton-item
                  variant="button"
                  style="width: 6rem; height: 2.25rem; border-radius: 1rem"
                />
                <el-skeleton-item
                  variant="button"
                  style="width: 6rem; height: 2.25rem; border-radius: 1rem"
                />
                <el-skeleton-item
                  variant="button"
                  style="width: 6rem; height: 2.25rem; border-radius: 1rem"
                />
              </div>
            </div>
          </div>
        </template>
        <template #default>
          <DescriptionMusic v-model="musicInfo" @onSubmit="initInfo" />
        </template>
      </el-skeleton>
    </div>
    <h1 class="text-2xl mt-4">音源</h1>
    <el-skeleton :loading="skeletonLoadingFlag" animated>
      <template #template>
        <div class="mt-4">
          <el-skeleton-item
            variant="rect"
            style="width: 100%; height: 3.6rem; border-radius: 1rem"
          />
        </div>
      </template>
      <template #default>
        <MusicSources v-model="musicInfo" @onSubmit="initInfo" />
      </template>
    </el-skeleton>
  </div>
</template>

<style lang="scss" scoped>
.info {
  display: flex;
  flex-wrap: wrap;
  gap: 3rem;

  @media screen and (width <= 1024px) {
    flex-direction: column;
  }
}

.skeleton-info {
  display: flex;
  flex-direction: row;
  gap: 3rem;

  @media screen and (width <= 1024px) {
    flex-direction: column;
  }
}
</style>
