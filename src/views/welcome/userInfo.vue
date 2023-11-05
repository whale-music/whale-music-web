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
  userInfo: {} as SaveOrUpdateUserRes,
  subAccount: Array<Map<string, string>>
});

onMounted(() => {
  initInfo();
});

const initInfo = async () => {
  const item = storageSession().getItem<DataInfo>(sessionKey);
  const userInfo = await getUserInfo(Number(item.id));
  if (userInfo.code === "200") {
    state.userInfo = userInfo.data;
    state.subAccount = JSON.parse(userInfo.data.subAccountPassword);
  }
};

const updateUser = async () => {
  state.userInfo.subAccountPassword = JSON.stringify(state.subAccount);
  const r = await updateUserPassword(state.userInfo);
  if (r.code === "200") {
    message("保存成功", { type: "success" });
    await initInfo();
  }
};

const addSubAccount = () => {
  if (!state.subAccount) {
    state.subAccount = [];
  }
  state.subAccount.push({});
};

const removeSubAccount = index => {
  state.subAccount.splice(index, 1);
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
      <!--<el-form-item label="头像">-->
      <!--  <div class="flex w-full gap-1">-->
      <!--    <el-input v-model="state.userInfo.avatarUrl" disabled />-->
      <!--    <el-button type="primary">预览</el-button>-->
      <!--    <el-button type="success">上传</el-button>-->
      <!--  </div>-->
      <!--</el-form-item>-->
      <!--<el-form-item label="背景">-->
      <!--  <div class="flex w-full gap-1">-->
      <!--    <el-input v-model="state.userInfo.backgroundPicUrl" disabled />-->
      <!--    <el-button type="primary">预览</el-button>-->
      <!--    <el-button type="success">上传</el-button>-->
      <!--  </div>-->
      <!--</el-form-item>-->
      <el-form-item label="密码">
        <el-input show-password v-model="state.userInfo.password" />
      </el-form-item>
      <br />
      <div class="flex gap-4">
        <h3>子账户</h3>
        <el-button type="primary" @click="addSubAccount">添加</el-button>
      </div>
      <div>
        <div
          v-for="(item, index) in state.subAccount"
          :key="item"
          class="flex gap-4"
        >
          <el-form-item required>
            <template #label>
              <el-tooltip
                content="无实际作用，仅用于账户标识。方便用户分辨子账户"
              >
                <b>子账户名备注 ⓘ</b>
              </el-tooltip>
            </template>
            <el-input v-model="item['name']" placeholder="请输入账户备注" />
          </el-form-item>
          <el-form-item label="账户" required>
            <el-input v-model="item['account']" placeholder="请输入账户" />
          </el-form-item>
          <el-form-item label="密码" required>
            <el-input
              show-password
              v-model="item['password']"
              clearable
              style="width: 200px"
              placeholder="请输入密码"
            />
          </el-form-item>
          <el-form-item label="操作">
            <el-button type="danger" @click="removeSubAccount(index)">
              删除
            </el-button>
          </el-form-item>
        </div>
      </div>
      <br />
      <el-form-item>
        <div class="flex flex-row-reverse w-full">
          <el-button type="primary" @click="updateUser">保存</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped></style>
