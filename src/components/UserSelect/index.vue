<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getSelectUser } from "@/api/user";

defineOptions({
  name: "UserSelect"
});

const userOptions = ref([]);
const loading = ref(false);

const userValue = defineModel<number>();

onMounted(() => {
  loading.value = true;
  getSelectUser("")
    .then(v => {
      userOptions.value = v.data;
      loading.value = false;
    })
    .finally(() => {
      loading.value = false;
    });
});
</script>

<template>
  <el-select
    v-model="userValue"
    size="large"
    :loading="loading"
    style="width: 240px"
  >
    <el-option
      v-for="item in userOptions"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    >
      <span style="float: left">{{ item.label }}</span>
      <span
        style="
          float: right;
          font-size: 13px;
          color: var(--el-text-color-secondary);
        "
      >
        {{ item.value }}
      </span>
    </el-option>
  </el-select>
</template>
