<script setup lang="ts">
import { Device, removeActivityDevice } from "@/api/devices";
import { useRouter } from "vue-router";

defineOptions({
  name: "DevicesList"
});

const value = defineModel<Device[]>();
const emits = defineEmits(["onSubmit"]);

const router = useRouter();
const removeCache = async (cacheId: string) => {
  await removeActivityDevice(cacheId);
  try {
    emits("onSubmit");
  } finally {
    router.go(0);
  }
};
</script>

<template>
  <div>
    <ElTable class="rounded-xl" :data="value">
      <ElTableColumn label="用户缓存ID" prop="cacheId" width="350">
        <template #default="{ row }">
          <el-tooltip :content="row.cacheId">
            <span class="w-20 truncate">{{ row.cacheId }}</span>
          </el-tooltip>
        </template>
      </ElTableColumn>
      <ElTableColumn label="用户ID" prop="id" />
      <ElTableColumn label="账户名" prop="username" width="70" />
      <ElTableColumn label="昵称" prop="nickname" width="70" />
      <ElTableColumn label="类型" prop="accountType" width="55" />
      <ElTableColumn label="状态" prop="status" width="60" />
      <ElTableColumn label="缓存生成日期" prop="generatedDate" />
      <ElTableColumn>
        <template #default="{ row }">
          <el-popconfirm
            title="删除缓存会可能导致设置下线, 确认删除吗?(refresh除外)"
            @confirm="removeCache(row.cacheId)"
          >
            <template #reference>
              <ElButton type="danger"> 删除缓存 </ElButton>
            </template>
          </el-popconfirm>
        </template>
      </ElTableColumn>
    </ElTable>
  </div>
</template>
