<script lang="ts" setup>
import { defineComponent, onMounted, reactive } from "vue";
import { DataInfo, sessionKey } from "@/utils/auth";
import { storageSession } from "@pureadmin/utils";
import { SaveOrUpdateUserRes } from "@/api/model/User";
import { getUserInfo, updateUserPassword } from "@/api/user";
import { message } from "@/utils/message";

defineComponent({
  name: "userInfo"
});

const state = reactive({
  userInfo: {} as SaveOrUpdateUserRes
});

onMounted(() => {
  initInfo();
});

const initInfo = async () => {
  const item = storageSession().getItem<DataInfo>(sessionKey);
  const userInfo = await getUserInfo(Number(item.id));
  if (userInfo.code === "200") {
    state.userInfo = userInfo.data;
  }
};

const updateUser = async () => {
  const r = await updateUserPassword(
    state.userInfo.id,
    state.userInfo.username,
    state.userInfo.nickname,
    state.userInfo.password
  );
  if (r.code === "200") {
    message("保存成功", { type: "success" });
    await initInfo();
  }
};
</script>

<template>
  <div>
    <el-form label-position="top">
      <el-form-item label="用户名">
        <el-input v-model="state.userInfo.username" />
      </el-form-item>
      <el-form-item label="昵称">
        <el-input v-model="state.userInfo.nickname" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input show-password v-model="state.userInfo.password" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="updateUser"> 保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped></style>
