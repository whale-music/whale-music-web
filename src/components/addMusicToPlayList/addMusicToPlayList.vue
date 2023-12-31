<script lang="ts" setup>
import LoadImg from "@/components/LoadImg/LoadImg.vue";
import { tracksMusicToPlayList, UserPlayListRes } from "@/api/playlist";
import { message } from "@/utils/message";
import { ref } from "vue";

const props = defineProps<{
  playItem: UserPlayListRes[];
  userId: number;
  musicId: number | number[];
  width: string;
}>();

const emit = defineEmits(["closeDialog"]);

const playItemDialogVisible = ref<boolean>(true);
const addMusicToPlayList = (pid: string) => {
  const numbers: number[] =
    props.musicId instanceof Array ? props.musicId : [props.musicId];
  tracksMusicToPlayList(pid, numbers, true).then(res => {
    if (res.code === "200") {
      message("添加成功", { type: "success" });
      playItemDialogVisible.value = false;
      emit("closeDialog", false);
    } else {
      message(`添加失败: ${res.message}`, { type: "error" });
    }
  });
};

const closeDialog = () => {
  playItemDialogVisible.value = false;
  emit("closeDialog", false);
};
</script>

<template>
  <div>
    <el-dialog
      v-model="playItemDialogVisible"
      :width="props.width ?? '45%'"
      center
      @close="closeDialog"
    >
      <h1>收藏歌单</h1>
      <el-scrollbar height="400px">
        <div>
          <ul v-for="(item, index) in props.playItem" :key="index">
            <li
              class="item cursor-pointer"
              @click="addMusicToPlayList(item.id.toString())"
            >
              <div class="flex">
                <LoadImg
                  :src="item.picUrl"
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
      </el-scrollbar>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.item:hover {
  background-color: var(--el-color-info-light-9);
  border-radius: 10px;
}

:deep(.el-dialog) {
  border-radius: 1rem;
}
</style>
