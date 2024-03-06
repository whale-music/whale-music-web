<script setup lang="ts">
import { MusicSources, updateSourceMusic } from "@/api/music";
import { message } from "@/utils/message";

defineOptions({
  name: "DialogEditSource"
});

const value = defineModel<boolean>();
const sources = defineModel<MusicSources>("source");
const updateSource = async () => {
  try {
    const r = await updateSourceMusic(sources.value);
    if (r.code === "200") {
      message("更新成功", { type: "success" });
    } else {
      message("更新失败", { type: "error" });
    }
  } catch (e) {
    value.value = false;
  }
  value.value = false;
};
</script>

<template>
  <!--编辑音源-->
  <el-dialog v-model="value" title="编辑音源" :show-close="false">
    <el-alert type="warning" show-icon :closable="false">
      <p>进行此操作时，你必须知道自己在干什么</p>
      <p>如果随意更改会造成歌曲无法播放音乐</p>
    </el-alert>
    <el-scrollbar height="20rem">
      <el-form label-position="top">
        <el-form-item label="关联音乐ID">
          <el-input v-model="sources.musicId" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="sources.path" />
        </el-form-item>
        <el-form-item label="MD5">
          <el-input v-model="sources.md5" />
        </el-form-item>
        <el-form-item label="文件格式">
          <el-input v-model="sources.encodeType" />
        </el-form-item>
        <el-form-item label="音乐存储大小(字节)">
          <el-input v-model="sources.size" />
        </el-form-item>
        <el-form-item label="比特率">
          <el-input v-model="sources.rate" />
        </el-form-item>
      </el-form>
    </el-scrollbar>
    <template #footer>
      <el-button @click="value = false">取消</el-button>
      <el-button type="primary" @click="updateSource">更新</el-button>
    </template>
  </el-dialog>
</template>
