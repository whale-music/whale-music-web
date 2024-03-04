<script lang="ts">
import { defineComponent } from "vue";

import { getMvInfo, MvInfo } from "@/api/mv";
import ShowLoading from "@/components/ShowLoading/ShowLoading.vue";
import { dateFormater } from "@/utils/dateUtil";
import MvEditInfo from "@/views/info/mvInfo/components/dialog/mvEditInfo.vue";
import MvFileInfo from "@/views/info/mvInfo/components/dialog/mvFileInfo.vue";
import VideoPlayer from "@/views/info/mvInfo/components/videoPlayer/index.vue";

export default defineComponent({
  name: "index",
  components: { MvFileInfo, MvEditInfo, ShowLoading, VideoPlayer },
  data() {
    return {
      dialog: {
        isShowEditInfo: false,
        isShowFileInfo: false
      },
      isLoading: true,
      data: {
        mvUrl: "",
        picUrl: ""
      } as MvInfo
    };
  },
  mounted() {
    this.init(this.$route.query.id);
  },
  methods: {
    dateFormater,
    async init(id: number) {
      this.isLoading = true;
      try {
        const r = await getMvInfo(id);
        this.data = r.data;
      } finally {
        this.isLoading = false;
      }
    },
    secondsToHMS(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;

      let result = "";
      if (hours > 0) {
        result += hours + " 小时 ";
      }
      if (minutes > 0 || hours > 0) {
        result += minutes + " 分 ";
      }
      result += remainingSeconds + " 秒";
      return result;
    }
  }
});
</script>

<template>
  <div>
    <mv-edit-info
      v-model="dialog.isShowEditInfo"
      :mv-info="data"
      @update-change="init($route.query.id)"
    />
    <mv-file-info
      v-model="dialog.isShowFileInfo"
      :mv-info="data"
      @update-change="init($route.query.id)"
    />
    <show-loading v-if="isLoading" :loading="true" />
    <div v-else class="flex justify-between gap-4">
      <video-player
        v-if="data.mvUrl"
        :mv-url="data.mvUrl"
        :preview-pic-url="data.picUrl"
      />
      <el-empty
        v-else
        description="无视频"
        style="width: calc((100vw) * (6 / 10)); height: calc((100vh) * (3 / 5))"
      />
      <div class="text">
        <div class="flex justify-between">
          <h1>简介:</h1>
          <div>
            <el-button type="primary" @click="dialog.isShowFileInfo = true">
              文件
            </el-button>
            <el-button type="primary" @click="dialog.isShowEditInfo = true">
              编辑
            </el-button>
          </div>
        </div>
        <span class="break-words whitespace-pre-wrap whitespace-break-spaces">
          {{ data.description }}
        </span>
      </div>
    </div>
    <div class="mv-info mt-2">
      <div class="flex justify-between">
        <h1 class="truncate w-100">{{ data.title }}</h1>
      </div>
      <div
        v-for="(item, index) in data.artists"
        :key="item.id"
        class="flex gap-3"
      >
        <h3>艺术家:</h3>
        <el-link :underline="false">
          <router-link
            :to="{
              name: 'ArtistInfo',
              query: { id: item.id }
            }"
          >
            <h4>
              {{
                (index === data.artists.length - 1 && item.name) ||
                item.name + "·"
              }}
            </h4>
          </router-link>
        </el-link>
      </div>
      <div class="flex items-center gap-2">
        <h3>发布时间:</h3>
        <span>{{ dateFormater("YYYY-MM-dd", data.publishTime) }}</span>
      </div>
      <div class="flex items-center gap-2">
        <h3>视频播放时间:</h3>
        <span>{{ secondsToHMS(data.duration) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.mv-info {
  width: calc((100vw) * (5.8 / 10));
}

.text {
  width: calc((100vw) * (2.4 / 10));
}
</style>
