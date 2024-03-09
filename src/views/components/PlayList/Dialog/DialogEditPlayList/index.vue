<script setup lang="ts">
import TagInput from "@/views/components/TagInput/index.vue";
import { PlayInfoRes, updatePlayListInfo } from "@/api/playlist";
import { message } from "@/utils/message";

defineOptions({
  name: "DialogEditPlayList"
});
const value = defineModel<boolean>();
const playListInfo = defineModel<PlayInfoRes>("playListInfo");

const playListStatusOptions = [
  {
    value: 0,
    label: "普通歌单"
  },
  {
    value: 1,
    label: "喜爱歌单"
  },
  {
    value: 2,
    label: "推荐歌单"
  }
];

const updatePlayInfo = async () => {
  try {
    const v = playListInfo.value;
    const data = {
      collectTag: v.collectTag,
      description: v.description,
      id: v.id,
      playListName: v.playListName,
      type: v.type
    };
    const res = await updatePlayListInfo(data);
    if (res.code === "200") {
      message("修改成功", { type: "success" });
      value.value = false;
    }
  } catch (e) {
    message(`请求失败: ${e}`, { type: "error" });
  }
};
</script>

<template>
  <ElDialog v-model="value" title="歌单信息" :show-close="false">
    <el-form label-position="top">
      <el-form-item label="歌单名">
        <el-input v-model="playListInfo.playListName" placeholder="歌单名" />
      </el-form-item>
      <el-form-item label="封面">
        <el-input v-model="playListInfo.picUrl" disabled />
      </el-form-item>
      <el-form-item label="歌单Tag">
        <template #label="{ label }">
          <div class="flex items-center gap-2">
            <h4>{{ label }}</h4>
            <span
              class="text-xs font-bold"
              style="color: var(--el-text-color-placeholder)"
            >
              多个可以使用英文逗号隔开
            </span>
          </div>
        </template>
        <TagInput v-model="playListInfo.collectTag" />
      </el-form-item>
      <el-form-item label="歌单状态">
        <el-select v-model="playListInfo.type" placeholder="">
          <el-option
            v-for="item in playListStatusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="歌单描述" prop="desc">
        <el-input v-model="playListInfo.description" type="textarea" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button bg plain @click="value = false">取消</el-button>
        <el-button type="primary" @click="updatePlayInfo"> 更新 </el-button>
      </span>
    </template>
  </ElDialog>
</template>
