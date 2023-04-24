<script lang="ts" setup>
import LoadImg from "@/components/LoadImg/LoadImg.vue";
import { tracksMusicToPlayList, UserPlayListRes } from "@/api/playlist";
import { message } from "@/utils/message";

const props = defineProps<{
  playItem: UserPlayListRes[];
  userId: number;
  musicId: number;
}>();

const addMusicToPlayList = (pid: string) => {
  tracksMusicToPlayList(pid, [props.musicId], true).then(res => {
    console.log(res.data);
    if (res.code === "200") {
      message("添加成功", { type: "success" });
    } else {
      message(`添加失败: ${res.message}`, { type: "error" });
    }
  });
};
</script>

<template>
  <div>
    <h1>收藏歌单</h1>
    <div>
      <ul v-for="(item, index) in props.playItem" :key="index">
        <li
          class="item cursor-pointer"
          @click="addMusicToPlayList(item.id.toString())"
        >
          <div class="flex">
            <LoadImg
              :src="item.pic"
              height="3rem"
              width="3rem"
              radius="8px"
              class="m-2"
            />
            <div class="m-2 flex-col justify-between">
              <p>{{ item.playListName }}</p>
              <span class="text-xs font-bold">{{ item.count }}首音乐</span>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.item:hover {
  //@apply dark: bg-[#text-neutral-500];
  background-color: var(--el-color-info-light-9);
  border-radius: 10px;
}
</style>
