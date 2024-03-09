<script setup lang="ts">
import { ref } from "vue";

defineOptions({
  name: "TagInput"
});

const tag = ref("");
const tags = defineModel<Array<string>>();
const musicTagHandleClose = (index: number) => {
  tags.value.splice(index, 1);
};

const selectTag = () => {
  tags.value?.push(...tag.value.split(",").map(value => value.trim()));
  tag.value = "";
};
type msgType = "success" | "warning" | "info" | "primary" | "danger";
const randomType = (): msgType => {
  const messages: msgType[] = [
    "success",
    "warning",
    "info",
    "primary",
    "danger"
  ];
  // 生成一个0到messages.length-1之间的随机数
  const randomIndex = Math.floor(Math.random() * messages.length);
  // 使用随机索引从数组中选取一个元素
  return messages[randomIndex];
};
</script>

<template>
  <div class="w-full">
    <div class="flex gap-2 w-full mb-1">
      <el-tag
        v-for="(item, index) in tags"
        :key="item"
        effect="light"
        :type="randomType()"
        closable
        round
        @close="musicTagHandleClose(index)"
        >{{ item }}
      </el-tag>
    </div>
    <el-input v-model="tag" @keyup.enter="selectTag" />
  </div>
</template>
