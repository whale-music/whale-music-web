<script lang="ts" setup>
import { useVModel } from "@vueuse/core";
import { onMounted, reactive, ref, watch } from "vue";

import {
  getUserPlayList,
  tracksMusicToPlayList,
  UserPlayListRes
} from "@/api/playlist";
import LoadImg from "@/components/LoadImg/LoadImg.vue";
import { getUserData } from "@/utils/auth";
import { message } from "@/utils/message";
import { isAllEmpty, isArray } from "@pureadmin/utils";
import UserSelect from "@/components/UserSelect/index.vue";

defineOptions({
  name: "AddToPlaylistModal"
});

const props = defineProps<{
  modelValue: boolean;
  musicId: number | number[] | undefined;
}>();

const userInfo = reactive(getUserData());
const playItem = ref<UserPlayListRes[]>([]);

const emit = defineEmits(["closeDialog", "update:modelValue"]);
const playItemDialogVisible = useVModel(props, "modelValue", emit);
const userId = ref<number>(userInfo.id);

watch([playItemDialogVisible, userId], async ([s1, s2]) => {
  if (s1 && !isAllEmpty(s2)) {
    const r = await getUserPlayList(userId.value);
    playItem.value = r.data;
  }
});

onMounted(async () => {
  const width =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;
  reDrawLayout(width);
});

const dialogWidth = ref("");
function reDrawLayout(width: number) {
  if (width < 720) {
    dialogWidth.value = "90%";
  } else {
    dialogWidth.value = "45%";
  }
}

const addMusicToPlayList = (pid: string) => {
  if (props.musicId) {
    const numbers: number[] = isArray(props.musicId)
      ? props.musicId
      : [props.musicId];
    tracksMusicToPlayList(pid, numbers, true).then(res => {
      if (res.code === "200") {
        message("添加成功", { type: "success" });
        closeDialog();
      } else {
        message(`添加失败: ${res.message}`, { type: "error" });
      }
    });
  }
};

const closeDialog = () => {
  playItemDialogVisible.value = false;
};
</script>

<template>
  <div>
    <el-dialog
      v-model="playItemDialogVisible"
      :width="dialogWidth ?? '45%'"
      center
      @close="closeDialog"
    >
      <div class="flex justify-between">
        <h1>收藏歌单</h1>
        <UserSelect v-model="userId" />
      </div>
      <el-scrollbar v-if="userId" height="400px">
        <div>
          <ul v-for="(item, index) in playItem" :key="index">
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
      <div v-else class="h-[400px] w-full flex-c">
        <span class="font-bold text-2xl"> 请选择需要添加歌曲用户 </span>
      </div>
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
